<?php
/**
 * Plugin Name: AFS Store API Location Stock Override
 * Plugin URI: https://afs-foiling.com
 * Description: Intercepte la validation du stock WooCommerce Store API et remplace la vérification du stock global par le stock basé sur la localisation du plugin Multi-Locations-Inventory-Management.
 * Version: 1.0.4
 * Author: AFS
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

class AFS_Store_API_Location_Stock_Override {

    private static $instance = null;
    private $cached_location_id = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Hooks avec priorité TRÈS élevée pour s'exécuter avant tout
        add_filter('woocommerce_product_get_stock_status', array($this, 'override_stock_status'), 1, 2);
        add_filter('woocommerce_product_get_stock_quantity', array($this, 'override_stock_quantity'), 1, 2);
        add_filter('woocommerce_product_get_manage_stock', array($this, 'override_manage_stock'), 1, 2);
        add_filter('woocommerce_add_to_cart_validation', array($this, 'override_stock_validation'), 1, 4);
        add_filter('woocommerce_get_product', array($this, 'modify_product_on_load'), 1, 2);
    }

    /**
     * Vérifie si on est dans Store API cart/add-item
     */
    private function is_store_api_cart_add_item() {
        if (!defined('REST_REQUEST') || !REST_REQUEST) {
            return false;
        }

        $request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
        return strpos($request_uri, '/wc/store/v1/cart/add-item') !== false;
    }

    /**
     * Récupère la localisation depuis multiple sources
     */
    private function get_location_id() {
        if ($this->cached_location_id !== null) {
            return $this->cached_location_id;
        }

        $location_id = null;

        try {
            // 1. Depuis le body JSON POST
            if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
                $raw_post = file_get_contents('php://input');
                if (!empty($raw_post)) {
                    $post_data = json_decode($raw_post, true);
                    if (is_array($post_data)) {
                        if (isset($post_data['location'])) {
                            $location_id = intval($post_data['location']);
                        }
                        if (!$location_id && isset($post_data['items']) && is_array($post_data['items'])) {
                            foreach ($post_data['items'] as $item) {
                                if (isset($item['location'])) {
                                    $location_id = intval($item['location']);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // 2. Depuis $_REQUEST
            if (!$location_id && isset($_REQUEST['location'])) {
                $location_id = intval($_REQUEST['location']);
            }

            // 3. Depuis les cookies
            if (!$location_id && isset($_COOKIE['wcmlim_selected_location_termid'])) {
                $location_id = intval($_COOKIE['wcmlim_selected_location_termid']);
            }
            if (!$location_id && isset($_COOKIE['location'])) {
                $location_id = intval($_COOKIE['location']);
            }
        } catch (Exception $e) {
            // En cas d'erreur, utiliser la valeur par défaut
            error_log('AFS Location Stock Override: Error getting location - ' . $e->getMessage());
        }

        // 4. Valeur par défaut
        $this->cached_location_id = $location_id ? intval($location_id) : 2682;
        return $this->cached_location_id;
    }

    /**
     * Récupère le stock de la localisation
     */
    private function get_location_stock($product_id, $location_id) {
        try {
            $stock_key = 'wcmlim_stock_at_' . intval($location_id);
            $stock = get_post_meta($product_id, $stock_key, true);

            if ($stock === '' || $stock === false || $stock === null) {
                return null;
            }

            return intval($stock);
        } catch (Exception $e) {
            error_log('AFS Location Stock Override: Error getting location stock - ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Vérifie si les backorders sont autorisés
     */
    private function is_backorder_allowed($product_id, $location_id) {
        try {
            $backorder_key = 'wcmlim_allow_backorder_at_' . intval($location_id);
            $allow_backorder = get_post_meta($product_id, $backorder_key, true);
            return ($allow_backorder === 'yes' || $allow_backorder === 'Yes');
        } catch (Exception $e) {
            error_log('AFS Location Stock Override: Error checking backorder - ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Hook: woocommerce_product_get_stock_status
     */
    public function override_stock_status($status, $product) {
        if (!$this->is_store_api_cart_add_item()) {
            return $status;
        }

        if (!$product || !is_object($product)) {
            return $status;
        }

        try {
            $location_id = $this->get_location_id();
            $product_id = $product->get_id();

            if (!$product_id) {
                return $status;
            }

            $location_stock = $this->get_location_stock($product_id, $location_id);

            if ($location_stock === null) {
                return $status;
            }

            $allow_backorder = $this->is_backorder_allowed($product_id, $location_id);

            if ($location_stock > 0 || $allow_backorder) {
                // Modifier l'objet produit en mémoire
                if (method_exists($product, 'set_stock_status')) {
                    $product->set_stock_status('instock');
                }
                return 'instock';
            }
        } catch (Exception $e) {
            error_log('AFS Location Stock Override: Error in override_stock_status - ' . $e->getMessage());
        }

        return $status;
    }

    /**
     * Hook: woocommerce_product_get_stock_quantity
     */
    public function override_stock_quantity($quantity, $product) {
        if (!$this->is_store_api_cart_add_item()) {
            return $quantity;
        }

        if (!$product || !is_object($product)) {
            return $quantity;
        }

        try {
            $location_id = $this->get_location_id();
            $product_id = $product->get_id();

            if (!$product_id) {
                return $quantity;
            }

            $location_stock = $this->get_location_stock($product_id, $location_id);

            if ($location_stock === null) {
                return $quantity;
            }

            $allow_backorder = $this->is_backorder_allowed($product_id, $location_id);

            if ($allow_backorder) {
                if (method_exists($product, 'set_stock_quantity')) {
                    $product->set_stock_quantity(999999);
                }
                return 999999;
            }

            $final_qty = max(0, $location_stock);
            if (method_exists($product, 'set_stock_quantity')) {
                $product->set_stock_quantity($final_qty);
            }
            return $final_qty;
        } catch (Exception $e) {
            error_log('AFS Location Stock Override: Error in override_stock_quantity - ' . $e->getMessage());
        }

        return $quantity;
    }

    /**
     * Hook: woocommerce_product_get_manage_stock
     */
    public function override_manage_stock($manage_stock, $product) {
        if (!$this->is_store_api_cart_add_item()) {
            return $manage_stock;
        }

        if (!$product || !is_object($product)) {
            return $manage_stock;
        }

        try {
            $location_id = $this->get_location_id();
            $product_id = $product->get_id();

            if (!$product_id) {
                return $manage_stock;
            }

            $location_stock = $this->get_location_stock($product_id, $location_id);

            if ($location_stock !== null) {
                if (method_exists($product, 'set_manage_stock')) {
                    $product->set_manage_stock(true);
                }
                return true;
            }
        } catch (Exception $e) {
            error_log('AFS Location Stock Override: Error in override_manage_stock - ' . $e->getMessage());
        }

        return $manage_stock;
    }

    /**
     * Hook: woocommerce_add_to_cart_validation
     */
    public function override_stock_validation($passed, $product_id, $quantity, $variation_id = null) {
        if (!$this->is_store_api_cart_add_item()) {
            return $passed;
        }

        try {
            $actual_product_id = $variation_id ? $variation_id : $product_id;

            if (!$actual_product_id) {
                return $passed;
            }

            $location_id = $this->get_location_id();
            $location_stock = $this->get_location_stock($actual_product_id, $location_id);

            if ($location_stock === null) {
                return $passed;
            }

            $allow_backorder = $this->is_backorder_allowed($actual_product_id, $location_id);

            if ($allow_backorder) {
                return true;
            }

            if ($location_stock >= $quantity) {
                return true;
            }

            return false;
        } catch (Exception $e) {
            error_log('AFS Location Stock Override: Error in override_stock_validation - ' . $e->getMessage());
            return $passed;
        }
    }

    /**
     * Hook: woocommerce_get_product
     */
    public function modify_product_on_load($product, $product_id) {
        if (!$this->is_store_api_cart_add_item()) {
            return $product;
        }

        if (!$product || !is_object($product) || !$product_id) {
            return $product;
        }

        try {
            $location_id = $this->get_location_id();
            $location_stock = $this->get_location_stock($product_id, $location_id);

            if ($location_stock === null) {
                return $product;
            }

            $allow_backorder = $this->is_backorder_allowed($product_id, $location_id);

            if ($location_stock > 0 || $allow_backorder) {
                // Modifier les propriétés du produit en mémoire
                if (method_exists($product, 'set_stock_status')) {
                    $product->set_stock_status('instock');
                }
                if (method_exists($product, 'set_stock_quantity')) {
                    $product->set_stock_quantity($location_stock > 0 ? $location_stock : 999999);
                }
                if (method_exists($product, 'set_manage_stock')) {
                    $product->set_manage_stock(true);
                }
            }
        } catch (Exception $e) {
            error_log('AFS Location Stock Override: Error in modify_product_on_load - ' . $e->getMessage());
        }

        return $product;
    }
}

// Initialiser le plugin seulement si WooCommerce est actif
if (class_exists('WooCommerce')) {
    AFS_Store_API_Location_Stock_Override::get_instance();
}