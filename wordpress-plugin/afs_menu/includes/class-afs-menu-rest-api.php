<?php
/**
 * AFS Menu REST API
 *
 * Endpoint REST pour générer un menu JSON optimisé pour l'application React
 * Supporte WPML (langues) et WCML (devises)
 *
 * @package AFS_Menu
 * @since 1.7.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AFS_Menu_REST_API {

    /**
     * Namespace for the REST API
     */
    const NAMESPACE = 'afs-menu/v1';

    /**
     * Cache duration in seconds (1 hour)
     */
    const CACHE_DURATION = 3600;

    /**
     * Maximum products per menu item
     */
    const MAX_PRODUCTS = 12;

    /**
     * React app base URL (will be set from options or constant)
     */
    private $react_base_url = '';

    /**
     * WordPress base URL for URL replacement
     */
    private $wp_base_url = '';

    /**
     * Constructor
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );

        // Invalidate cache when menu is updated
        add_action( 'wp_update_nav_menu', array( $this, 'invalidate_all_cache' ) );
        add_action( 'wpml_language_has_switched', array( $this, 'invalidate_all_cache' ) );

        // Set URLs
        $this->react_base_url = defined( 'AFS_REACT_BASE_URL' ) ? AFS_REACT_BASE_URL : '';
        $this->wp_base_url = get_site_url();
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route( self::NAMESPACE, '/menus/(?P<menu_id>\d+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_menu' ),
            'permission_callback' => '__return_true',
            'args'                => array(
                'menu_id' => array(
                    'required'          => true,
                    'validate_callback' => function( $param ) {
                        return is_numeric( $param );
                    },
                ),
                'lang' => array(
                    'required'          => false,
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'currency' => array(
                    'required'          => false,
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ) );

        // Route to get available menus
        register_rest_route( self::NAMESPACE, '/menus', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_available_menus' ),
            'permission_callback' => '__return_true',
        ) );

        // Route to clear cache
        register_rest_route( self::NAMESPACE, '/cache/clear', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'clear_cache_endpoint' ),
            'permission_callback' => function() {
                return current_user_can( 'manage_options' );
            },
        ) );
    }

    /**
     * Get menu data
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_menu( $request ) {
        $menu_id  = (int) $request->get_param( 'menu_id' );
        $lang     = $request->get_param( 'lang' );
        $currency = $request->get_param( 'currency' );

        // Set WPML language if provided
        if ( ! empty( $lang ) && function_exists( 'do_action' ) ) {
            do_action( 'wpml_switch_language', $lang );
        }

        // Set WCML currency if provided
        if ( ! empty( $currency ) ) {
            $this->set_wcml_currency( $currency );
        }

        // Get current language for cache key
        $current_lang = $this->get_current_language();
        $current_currency = $this->get_current_currency();

        // Check cache
        $cache_key = $this->get_cache_key( $menu_id, $current_lang, $current_currency );
        $cached_data = get_transient( $cache_key );

        if ( false !== $cached_data ) {
            return rest_ensure_response( $cached_data );
        }

        // Build menu data
        $menu_data = $this->build_menu_data( $menu_id, $current_lang, $current_currency );

        if ( is_wp_error( $menu_data ) ) {
            return $menu_data;
        }

        // Cache the result
        set_transient( $cache_key, $menu_data, self::CACHE_DURATION );

        return rest_ensure_response( $menu_data );
    }

    /**
     * Get available menus
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_available_menus( $request ) {
        $menus = wp_get_nav_menus();
        $result = array();

        foreach ( $menus as $menu ) {
            $result[] = array(
                'id'   => $menu->term_id,
                'name' => $menu->name,
                'slug' => $menu->slug,
            );
        }

        return rest_ensure_response( $result );
    }

    /**
     * Clear cache endpoint
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function clear_cache_endpoint( $request ) {
        $this->invalidate_all_cache();
        return rest_ensure_response( array( 'success' => true, 'message' => 'Cache cleared successfully' ) );
    }

    /**
     * Build menu data structure
     *
     * @param int    $menu_id
     * @param string $lang
     * @param string $currency
     * @return array|WP_Error
     */
    private function build_menu_data( $menu_id, $lang, $currency ) {
        // Translate menu ID if WPML is active
        $translated_menu_id = $this->translate_menu_id( $menu_id, $lang );

        // Get menu items
        $menu_items = wp_get_nav_menu_items( $translated_menu_id );

        if ( empty( $menu_items ) || is_wp_error( $menu_items ) ) {
            return new WP_Error(
                'menu_not_found',
                'Menu not found or empty',
                array( 'status' => 404 )
            );
        }

        // Build tree structure
        $menu_tree = $this->build_menu_tree( $menu_items );

        // Convert to expected JSON structure
        return $this->format_menu_for_react( $menu_tree, 0, $lang, $currency );
    }

    /**
     * Build hierarchical menu tree
     *
     * @param array $menu_items
     * @return array
     */
    private function build_menu_tree( $menu_items ) {
        $tree = array();
        $children = array();

        foreach ( $menu_items as $item ) {
            $children[ $item->menu_item_parent ][] = $item;
        }

        return $children;
    }

    /**
     * Format menu for React application
     *
     * @param array  $menu_tree
     * @param int    $parent_id
     * @param string $lang
     * @param string $currency
     * @return array
     */
    private function format_menu_for_react( $menu_tree, $parent_id, $lang, $currency ) {
        $result = array();

        if ( ! isset( $menu_tree[ $parent_id ] ) ) {
            return $result;
        }

        foreach ( $menu_tree[ $parent_id ] as $item ) {
            $item_id = $item->ID;

            // Get children (sublinks)
            $sublinks = array();
            if ( isset( $menu_tree[ $item_id ] ) ) {
                foreach ( $menu_tree[ $item_id ] as $child ) {
                    $sublinks[] = $this->format_sublink( $child, $lang, $currency );
                }
            }

            $result[] = array(
                'name'     => $item->title,
                'href'     => $this->convert_url_to_react( $item->url, $lang ),
                'sublinks' => $sublinks,
            );
        }

        return $result;
    }

    /**
     * Format a sublink menu item
     *
     * @param object $item
     * @param string $lang
     * @param string $currency
     * @return array
     */
    private function format_sublink( $item, $lang, $currency ) {
        $item_id = $item->ID;

        // Get custom meta data
        $show_products    = get_post_meta( $item_id, '_show_products', true );
        $product_ids_raw  = get_post_meta( $item_id, '_menu_products', true );
        $button_one_label = get_post_meta( $item_id, '_menu_item_button_one_label', true );
        $button_one_url   = get_post_meta( $item_id, '_menu_item_button_one_url', true );
        $button_two_label = get_post_meta( $item_id, '_menu_item_button_two_label', true );
        $button_two_url   = get_post_meta( $item_id, '_menu_item_button_two_url', true );
        $custom_text_one  = get_post_meta( $item_id, '_menu_item_custom_text_one', true );
        $custom_text_two  = get_post_meta( $item_id, '_menu_item_custom_text_two', true );
        $image_url        = get_post_meta( $item_id, '_menu_item_image_url', true );

        // Build button objects
        $button_one = null;
        if ( ! empty( $button_one_label ) && ! empty( $button_one_url ) ) {
            $button_one = array(
                'label' => $button_one_label,
                'url'   => $this->convert_url_to_react( $button_one_url, $lang ),
            );
        }

        $button_two = null;
        if ( ! empty( $button_two_label ) && ! empty( $button_two_url ) ) {
            $button_two = array(
                'label' => $button_two_label,
                'url'   => $this->convert_url_to_react( $button_two_url, $lang ),
            );
        }

        // Get products if enabled
        $products = array();
        if ( $show_products && ! empty( $product_ids_raw ) ) {
            $products = $this->get_products_data( $product_ids_raw, $lang, $currency );
        }

        return array(
            'name'            => $item->title,
            'id'              => $item_id,
            'url'             => $this->convert_url_to_react( $item->url, $lang ),
            'button_one'      => $button_one,
            'button_two'      => $button_two,
            'custom_text_one' => $custom_text_one ?: null,
            'custom_text_two' => $custom_text_two ?: null,
            'image'           => $image_url ?: null,
            'products'        => $products,
        );
    }

    /**
     * Get products data for menu
     *
     * @param string $product_ids_raw Comma-separated product IDs
     * @param string $lang
     * @param string $currency
     * @return array
     */
    private function get_products_data( $product_ids_raw, $lang, $currency ) {
        if ( ! function_exists( 'wc_get_product' ) ) {
            return array();
        }

        // Translate product IDs for WPML
        $translated_ids = $this->translate_product_ids( $product_ids_raw );

        if ( empty( $translated_ids ) ) {
            return array();
        }

        $product_ids = array_map( 'trim', explode( ',', $translated_ids ) );
        $product_ids = array_filter( $product_ids, 'is_numeric' );

        // Limit to max products
        $product_ids = array_slice( $product_ids, 0, self::MAX_PRODUCTS );

        $products = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );

            if ( ! $product || ! $product->is_visible() ) {
                continue;
            }

            // Get product image
            $image_url = $this->get_product_image( $product );

            // Get price HTML (WCML will automatically convert if active)
            $price_html = $product->get_price_html();

            $products[] = array(
                'name'  => $product->get_name(),
                'price' => $price_html,
                'url'   => $this->convert_url_to_react( get_permalink( $product_id ), $lang ),
                'image' => $image_url,
            );
        }

        return $products;
    }

    /**
     * Get product image URL
     *
     * @param WC_Product $product
     * @return string
     */
    private function get_product_image( $product ) {
        $product_id = $product->get_id();

        // Try ACF field first (as in the widget)
        if ( function_exists( 'get_field' ) ) {
            $acf_image = get_field( 'img', $product_id );
            if ( $acf_image && isset( $acf_image['url'] ) ) {
                return $acf_image['url'];
            }
        }

        // Fallback to WooCommerce product image
        $image_id = $product->get_image_id();
        if ( $image_id ) {
            $image_url = wp_get_attachment_url( $image_id );
            if ( $image_url ) {
                return $image_url;
            }
        }

        // Return placeholder if no image
        return wc_placeholder_img_src();
    }

    /**
     * Convert WordPress URL to React route
     *
     * @param string $url
     * @param string $lang
     * @return string
     */
    private function convert_url_to_react( $url, $lang ) {
        if ( empty( $url ) || $url === '#' ) {
            return $url;
        }

        // Parse the URL
        $parsed = wp_parse_url( $url );

        if ( ! $parsed ) {
            return $url;
        }

        // Get the path
        $path = isset( $parsed['path'] ) ? $parsed['path'] : '/';

        // Remove WordPress language prefix if present (e.g., /fr/, /en/)
        $path = preg_replace( '#^/(fr|en)/#', '/', $path );

        // Remove trailing slash except for root
        $path = rtrim( $path, '/' );
        if ( empty( $path ) ) {
            $path = '/';
        }

        // Handle product URLs - convert /produit/slug or /product/slug to /product/slug
        $path = preg_replace( '#^/produit/#', '/product/', $path );

        // Handle category URLs - preserve the original prefix and translate slugs
        $category_prefix = '/product-category/';
        $is_category_url = false;
        
        // Check if it's a category URL (either /product-category/ or /categorie-produit/)
        if ( preg_match( '#^/(?:product-category|categorie-produit)/(.+)$#', $path, $matches ) ) {
            $is_category_url = true;
            $category_path = $matches[1];
            $translated_path = $this->translate_category_path( $category_path, $lang );
            
            if ( $translated_path ) {
                // Use the correct prefix based on language
                if ( $lang === 'fr' ) {
                    $category_prefix = '/categorie-produit/';
                } else {
                    $category_prefix = '/product-category/';
                }
                $path = $category_prefix . $translated_path;
            }
        }

        // Add language prefix for non-English
        if ( $lang === 'fr' && $path !== '/' ) {
            $path = '/fr' . $path;
        }

        return $path;
    }

    /**
     * Translate category path (slug) to target language
     *
     * @param string $category_path Category path (e.g., "foiling/wing-foil" or "wing-foil")
     * @param string $target_lang Target language code (en, fr)
     * @return string|null Translated category path or null if translation fails
     */
    private function translate_category_path( $category_path, $target_lang ) {
        if ( empty( $category_path ) || ! function_exists( 'get_term_by' ) ) {
            return $category_path;
        }

        // Handle hierarchical paths (e.g., "foiling/wing-foil")
        $path_parts = explode( '/', $category_path );
        $last_slug = end( $path_parts );

        // Find the category by slug
        $term = get_term_by( 'slug', $last_slug, 'product_cat' );
        
        if ( ! $term || is_wp_error( $term ) ) {
            // Fallback: try WP_Term_Query which respects WPML filters
            $term_query = new WP_Term_Query( array(
                'taxonomy'   => 'product_cat',
                'slug'       => $last_slug,
                'hide_empty' => false,
                'number'     => 1,
            ) );
            
            if ( ! empty( $term_query->terms ) ) {
                $term = $term_query->terms[0];
            }
        }

        if ( ! $term || is_wp_error( $term ) ) {
            return $category_path; // Return original if not found
        }

        // Get translated term ID using WPML
        $translated_term_id = $term->term_id;
        if ( function_exists( 'apply_filters' ) ) {
            $translated_term_id = apply_filters( 'wpml_object_id', $term->term_id, 'product_cat', false, $target_lang );
        }

        // If no translation found, return original
        if ( ! $translated_term_id || $translated_term_id === $term->term_id ) {
            // Check if already in target language
            $source_lang = null;
            if ( function_exists( 'apply_filters' ) ) {
                $source_lang = apply_filters( 'wpml_element_language_code', null, array(
                    'element_id'   => $term->term_id,
                    'element_type' => 'tax_product_cat'
                ) );
            }
            
            if ( $source_lang === $target_lang ) {
                // Already in target language, build hierarchical path if needed
                return $this->build_category_path( $term->term_id, $target_lang );
            }
            
            return $category_path; // No translation available
        }

        // Get translated term and build path
        $translated_term = get_term( $translated_term_id, 'product_cat' );
        if ( ! $translated_term || is_wp_error( $translated_term ) ) {
            return $category_path;
        }

        // Build hierarchical path if original was hierarchical
        if ( count( $path_parts ) > 1 ) {
            return $this->build_category_path( $translated_term_id, $target_lang );
        }

        return $translated_term->slug;
    }

    /**
     * Build hierarchical category path from term ID
     *
     * @param int    $term_id Category term ID
     * @param string $lang Language code
     * @return string Category path (e.g., "foiling/wing-foil")
     */
    private function build_category_path( $term_id, $lang ) {
        $term = get_term( $term_id, 'product_cat' );
        if ( ! $term || is_wp_error( $term ) ) {
            return '';
        }

        $path_terms = array( $term );
        $current_term = $term;

        // Walk up the hierarchy
        while ( $current_term->parent ) {
            $parent_term = get_term( $current_term->parent, 'product_cat' );
            if ( $parent_term && ! is_wp_error( $parent_term ) ) {
                // Get translated parent if WPML is active
                if ( function_exists( 'apply_filters' ) ) {
                    $translated_parent_id = apply_filters( 'wpml_object_id', $parent_term->term_id, 'product_cat', false, $lang );
                    if ( $translated_parent_id ) {
                        $parent_term = get_term( $translated_parent_id, 'product_cat' );
                    }
                }
                
                if ( $parent_term && ! is_wp_error( $parent_term ) ) {
                    array_unshift( $path_terms, $parent_term );
                    $current_term = $parent_term;
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        // Build path from terms
        $path_parts = array_map( function( $t ) {
            return $t->slug;
        }, $path_terms );

        return implode( '/', $path_parts );
    }

    /**
     * Translate menu ID for WPML
     *
     * @param int    $menu_id
     * @param string $lang
     * @return int
     */
    private function translate_menu_id( $menu_id, $lang ) {
        if ( function_exists( 'wpml_object_id_filter' ) ) {
            $translated_id = apply_filters( 'wpml_object_id', $menu_id, 'nav_menu', true, $lang );
            if ( $translated_id ) {
                return $translated_id;
            }
        }
        return $menu_id;
    }

    /**
     * Translate product IDs for WPML
     *
     * @param string $product_ids Comma-separated IDs
     * @return string
     */
    private function translate_product_ids( $product_ids ) {
        // Use existing function if available
        if ( function_exists( 'afs_menu_adv_wpml_translate_product_ids' ) ) {
            return afs_menu_adv_wpml_translate_product_ids( $product_ids );
        }

        if ( ! function_exists( 'wpml_object_id_filter' ) || empty( $product_ids ) ) {
            return $product_ids;
        }

        $ids_array = array_map( 'trim', explode( ',', $product_ids ) );
        $translated_ids = array();

        foreach ( $ids_array as $id ) {
            if ( is_numeric( $id ) ) {
                $translated_id = apply_filters( 'wpml_object_id', $id, 'product', true );
                $translated_ids[] = $translated_id;
            }
        }

        return implode( ',', $translated_ids );
    }

    /**
     * Set WCML currency
     *
     * @param string $currency
     */
    private function set_wcml_currency( $currency ) {
        global $woocommerce_wpml;

        if ( isset( $woocommerce_wpml ) &&
             isset( $woocommerce_wpml->multi_currency ) &&
             method_exists( $woocommerce_wpml->multi_currency, 'set_client_currency' ) ) {
            $woocommerce_wpml->multi_currency->set_client_currency( strtoupper( $currency ) );
        }
    }

    /**
     * Get current WPML language
     *
     * @return string
     */
    private function get_current_language() {
        if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
            return ICL_LANGUAGE_CODE;
        }
        return 'en';
    }

    /**
     * Get current WCML currency
     *
     * @return string
     */
    private function get_current_currency() {
        global $woocommerce_wpml;

        if ( isset( $woocommerce_wpml ) &&
             isset( $woocommerce_wpml->multi_currency ) &&
             method_exists( $woocommerce_wpml->multi_currency, 'get_client_currency' ) ) {
            return $woocommerce_wpml->multi_currency->get_client_currency();
        }

        // Fallback to WooCommerce default currency
        if ( function_exists( 'get_woocommerce_currency' ) ) {
            return get_woocommerce_currency();
        }

        return 'EUR';
    }

    /**
     * Get cache key
     *
     * @param int    $menu_id
     * @param string $lang
     * @param string $currency
     * @return string
     */
    private function get_cache_key( $menu_id, $lang, $currency ) {
        return sprintf( 'afs_menu_json_%d_%s_%s', $menu_id, $lang, $currency );
    }

    /**
     * Invalidate all menu cache
     */
    public function invalidate_all_cache() {
        global $wpdb;

        // Delete all transients with our prefix
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
                '_transient_afs_menu_json_%',
                '_transient_timeout_afs_menu_json_%'
            )
        );
    }
}

// Initialize the REST API
function afs_menu_rest_api_init() {
    new AFS_Menu_REST_API();
}
add_action( 'plugins_loaded', 'afs_menu_rest_api_init' );
