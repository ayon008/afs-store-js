<?php
/**
 * Cart REST API class for managing cart operations with multi-currency support.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_Cart_API class.
 */
class AFS_WCML_Cart_API {

	/**
	 * Namespace for REST API.
	 *
	 * @var string
	 */
	private $namespace = 'afs-wcml/v1';

	/**
	 * Whether routes have been registered.
	 *
	 * @var bool
	 */
	private $routes_registered = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
		
		if ( did_action( 'rest_api_init' ) ) {
			$this->register_routes();
		}
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		if ( $this->routes_registered ) {
			return;
		}

		// Get cart
		register_rest_route(
			$this->namespace,
			'/cart',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_cart' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'currency' => array(
						'required'          => false,
						'default'           => 'EUR',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'cart_key' => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Add item to cart
		register_rest_route(
			$this->namespace,
			'/cart/add-item',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'add_item' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'product_id' => array(
						'required'          => true,
						'validate_callback' => function( $value ) {
							return is_numeric( $value ) && $value > 0;
						},
					),
					'quantity' => array(
						'required'          => false,
						'default'           => 1,
						'validate_callback' => function( $value ) {
							return is_numeric( $value ) && $value > 0;
						},
					),
					'variation_id' => array(
						'required'          => false,
						'default'           => 0,
					),
					'variation' => array(
						'required'          => false,
						'default'           => array(),
					),
					'currency' => array(
						'required'          => false,
						'default'           => 'EUR',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'cart_key' => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Update cart item
		register_rest_route(
			$this->namespace,
			'/cart/update-item',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'key' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'quantity' => array(
						'required'          => true,
						'validate_callback' => function( $value ) {
							return is_numeric( $value ) && $value >= 0;
						},
					),
					'currency' => array(
						'required'          => false,
						'default'           => 'EUR',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'cart_key' => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Remove cart item
		register_rest_route(
			$this->namespace,
			'/cart/remove-item',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'remove_item' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'key' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'currency' => array(
						'required'          => false,
						'default'           => 'EUR',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'cart_key' => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Clear cart
		register_rest_route(
			$this->namespace,
			'/cart/clear',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'clear_cart' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'cart_key' => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		$this->routes_registered = true;
	}

	/**
	 * Check permission for API requests using Bearer token.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function check_permission( $request ) {
		$auth_header = $request->get_header( 'Authorization' );
		
		if ( ! $auth_header && isset( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
			$auth_header = $_SERVER['HTTP_AUTHORIZATION'];
		} elseif ( ! $auth_header && isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
			$auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
		}

		if ( ! $auth_header || strpos( $auth_header, 'Bearer ' ) !== 0 ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Token Bearer requis dans l\'en-tête Authorization.', 'afs-wcml-api' ),
				array( 'status' => 401 )
			);
		}

		$token = substr( $auth_header, 7 );
		if ( empty( $token ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Token Bearer invalide.', 'afs-wcml-api' ),
				array( 'status' => 401 )
			);
		}

		if ( ! defined( 'AFS_WCML_API_TOKEN' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Token API non configuré. Définissez AFS_WCML_API_TOKEN dans wp-config.php.', 'afs-wcml-api' ),
				array( 'status' => 500 )
			);
		}

		if ( ! hash_equals( AFS_WCML_API_TOKEN, $token ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Token Bearer invalide.', 'afs-wcml-api' ),
				array( 'status' => 401 )
			);
		}

		return true;
	}

	/**
	 * Initialize cart session for API requests.
	 *
	 * @param string $cart_key Optional cart key for guest sessions.
	 */
	private function init_cart_session( $cart_key = '' ) {
		// Ensure WooCommerce is loaded
		if ( ! function_exists( 'WC' ) ) {
			return;
		}

		// Initialize session if not already done
		if ( ! WC()->session ) {
			WC()->session = new WC_Session_Handler();
			WC()->session->init();
		}

		// Set customer session cookie if cart_key provided
		if ( ! empty( $cart_key ) ) {
			WC()->session->set_customer_session_cookie( true );
			// Try to restore session from cart_key
			$session_data = WC()->session->get_session( $cart_key );
			if ( $session_data ) {
				foreach ( $session_data as $key => $value ) {
					WC()->session->set( $key, maybe_unserialize( $value ) );
				}
			}
		}

		// Initialize cart if needed
		if ( ! WC()->cart ) {
			WC()->cart = new WC_Cart();
		}

		// Ensure cart is loaded from session
		if ( did_action( 'wp_loaded' ) === 0 ) {
			WC()->cart->get_cart_from_session();
		}
	}

	/**
	 * Set currency for WCML multi-currency.
	 *
	 * @param string $currency Currency code (EUR, USD, GBP).
	 */
	private function set_currency( $currency ) {
		global $woocommerce_wpml;

		$currency = strtoupper( $currency );
		$allowed_currencies = array( 'EUR', 'USD', 'GBP' );

		if ( ! in_array( $currency, $allowed_currencies, true ) ) {
			$currency = 'EUR';
		}

		// Set WCML client currency
		if ( $woocommerce_wpml && isset( $woocommerce_wpml->multi_currency ) ) {
			$woocommerce_wpml->multi_currency->set_client_currency( $currency );
		}

		// Also set cookie for consistency
		if ( ! headers_sent() ) {
			setcookie( 'wcml_client_currency', $currency, time() + ( 86400 * 30 ), '/' );
		}
		$_COOKIE['wcml_client_currency'] = $currency;
	}

	/**
	 * Get currency symbol.
	 *
	 * @param string $currency Currency code.
	 * @return string
	 */
	private function get_currency_symbol( $currency ) {
		$symbols = array(
			'EUR' => '€',
			'USD' => '$',
			'GBP' => '£',
		);
		return isset( $symbols[ $currency ] ) ? $symbols[ $currency ] : '€';
	}

	/**
	 * Get product price in specified currency.
	 *
	 * @param WC_Product $product  Product object.
	 * @param string     $currency Currency code.
	 * @return float
	 */
	private function get_product_price_in_currency( $product, $currency ) {
		$product_id = $product->get_id();
		
		// Try to get manual WCML price first
		$manual_price = get_post_meta( $product_id, '_price_' . $currency, true );
		if ( $manual_price !== '' && $manual_price !== false ) {
			return floatval( $manual_price );
		}

		// Fallback to regular price with potential conversion
		global $woocommerce_wpml;
		if ( $woocommerce_wpml && isset( $woocommerce_wpml->multi_currency ) ) {
			$this->set_currency( $currency );
			return floatval( $product->get_price() );
		}

		return floatval( $product->get_price() );
	}

	/**
	 * Format cart data for response.
	 *
	 * @param string $currency Currency code.
	 * @return array
	 */
	private function format_cart_response( $currency ) {
		$cart = WC()->cart;
		$items = array();

		foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
			$product = $cart_item['data'];
			$product_id = $cart_item['product_id'];
			$variation_id = isset( $cart_item['variation_id'] ) ? $cart_item['variation_id'] : 0;

			// Get price in requested currency
			$price = $this->get_product_price_in_currency( $product, $currency );
			$line_total = $price * $cart_item['quantity'];

			// Get product image
			$image_id = $product->get_image_id();
			$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src();

			// Build variation data
			$variation_data = array();
			if ( ! empty( $cart_item['variation'] ) ) {
				foreach ( $cart_item['variation'] as $attr_key => $attr_value ) {
					$variation_data[] = array(
						'attribute' => str_replace( 'attribute_', '', $attr_key ),
						'value'     => $attr_value,
					);
				}
			}

			$items[] = array(
				'key'              => $cart_item_key,
				'id'               => $product_id,
				'variation_id'     => $variation_id,
				'name'             => $product->get_name(),
				'quantity'         => $cart_item['quantity'],
				'prices'           => array(
					'price'           => round( $price * 100 ), // In cents
					'regular_price'   => round( floatval( $product->get_regular_price() ) * 100 ),
					'sale_price'      => $product->get_sale_price() ? round( floatval( $product->get_sale_price() ) * 100 ) : '',
					'currency_code'   => $currency,
					'currency_symbol' => $this->get_currency_symbol( $currency ),
				),
				'totals'           => array(
					'line_subtotal'     => round( $line_total * 100 ),
					'line_subtotal_tax' => round( $line_total * 0.2 * 100 ), // Approximate 20% VAT
					'line_total'        => round( $line_total * 100 ),
					'currency_symbol'   => $this->get_currency_symbol( $currency ),
				),
				'image'            => $image_url,
				'variation'        => $variation_data,
				'stock_status'     => $product->get_stock_status(),
				'quantity_limits'  => array(
					'minimum' => 1,
					'maximum' => $product->get_stock_quantity() ? $product->get_stock_quantity() : 99,
				),
			);
		}

		// Calculate totals
		$subtotal = 0;
		$total_tax = 0;
		foreach ( $items as $item ) {
			$subtotal += $item['totals']['line_subtotal'];
			$total_tax += $item['totals']['line_subtotal_tax'];
		}

		return array(
			'items'        => $items,
			'items_count'  => $cart->get_cart_contents_count(),
			'totals'       => array(
				'total_items'    => $subtotal,
				'total_tax'      => $total_tax,
				'total_price'    => $subtotal + $total_tax,
				'currency_code'  => $currency,
				'currency_symbol'=> $this->get_currency_symbol( $currency ),
			),
			'coupons'      => array(),
			'cart_key'     => WC()->session ? WC()->session->get_customer_id() : '',
		);
	}

	/**
	 * Get cart endpoint.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_cart( $request ) {
		$currency = $request->get_param( 'currency' ) ?: 'EUR';
		$cart_key = $request->get_param( 'cart_key' ) ?: '';

		$this->init_cart_session( $cart_key );
		$this->set_currency( $currency );

		$cart_data = $this->format_cart_response( $currency );

		return new WP_REST_Response( $cart_data, 200 );
	}

	/**
	 * Add item to cart.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function add_item( $request ) {
		$product_id   = (int) $request->get_param( 'product_id' );
		$quantity     = (int) $request->get_param( 'quantity' ) ?: 1;
		$variation_id = (int) $request->get_param( 'variation_id' ) ?: 0;
		$variation    = $request->get_param( 'variation' ) ?: array();
		$currency     = $request->get_param( 'currency' ) ?: 'EUR';
		$cart_key     = $request->get_param( 'cart_key' ) ?: '';

		$this->init_cart_session( $cart_key );
		$this->set_currency( $currency );

		// Validate product exists
		$product = wc_get_product( $variation_id ? $variation_id : $product_id );
		if ( ! $product ) {
			return new WP_Error(
				'product_not_found',
				__( 'Produit introuvable.', 'afs-wcml-api' ),
				array( 'status' => 404 )
			);
		}

		// Format variation array if needed
		$formatted_variation = array();
		if ( ! empty( $variation ) ) {
			if ( is_array( $variation ) ) {
				foreach ( $variation as $key => $value ) {
					if ( is_array( $value ) && isset( $value['attribute'] ) ) {
						$attr_key = 'attribute_' . sanitize_title( $value['attribute'] );
						$formatted_variation[ $attr_key ] = $value['value'];
					} else {
						$attr_key = strpos( $key, 'attribute_' ) === 0 ? $key : 'attribute_' . $key;
						$formatted_variation[ $attr_key ] = $value;
					}
				}
			}
		}

		// Add to cart
		try {
			$cart_item_key = WC()->cart->add_to_cart(
				$product_id,
				$quantity,
				$variation_id,
				$formatted_variation
			);

			if ( ! $cart_item_key ) {
				return new WP_Error(
					'add_to_cart_failed',
					__( 'Impossible d\'ajouter le produit au panier.', 'afs-wcml-api' ),
					array( 'status' => 400 )
				);
			}

			$cart_data = $this->format_cart_response( $currency );

			return new WP_REST_Response(
				array(
					'success'  => true,
					'message'  => __( 'Produit ajouté au panier.', 'afs-wcml-api' ),
					'cart_key' => $cart_item_key,
					'data'     => $cart_data,
				),
				200
			);
		} catch ( Exception $e ) {
			return new WP_Error(
				'add_to_cart_error',
				$e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Update cart item quantity.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$item_key = $request->get_param( 'key' );
		$quantity = (int) $request->get_param( 'quantity' );
		$currency = $request->get_param( 'currency' ) ?: 'EUR';
		$cart_key = $request->get_param( 'cart_key' ) ?: '';

		$this->init_cart_session( $cart_key );
		$this->set_currency( $currency );

		// Validate item exists in cart
		$cart_item = WC()->cart->get_cart_item( $item_key );
		if ( ! $cart_item ) {
			return new WP_Error(
				'item_not_found',
				__( 'Article introuvable dans le panier.', 'afs-wcml-api' ),
				array( 'status' => 404 )
			);
		}

		// If quantity is 0, remove the item
		if ( $quantity <= 0 ) {
			WC()->cart->remove_cart_item( $item_key );
		} else {
			// Update quantity
			WC()->cart->set_quantity( $item_key, $quantity, true );
		}

		// Recalculate totals
		WC()->cart->calculate_totals();

		$cart_data = $this->format_cart_response( $currency );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Panier mis à jour.', 'afs-wcml-api' ),
				'data'    => $cart_data,
			),
			200
		);
	}

	/**
	 * Remove item from cart.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function remove_item( $request ) {
		$item_key = $request->get_param( 'key' );
		$currency = $request->get_param( 'currency' ) ?: 'EUR';
		$cart_key = $request->get_param( 'cart_key' ) ?: '';

		$this->init_cart_session( $cart_key );
		$this->set_currency( $currency );

		// Validate item exists in cart
		$cart_item = WC()->cart->get_cart_item( $item_key );
		if ( ! $cart_item ) {
			return new WP_Error(
				'item_not_found',
				__( 'Article introuvable dans le panier.', 'afs-wcml-api' ),
				array( 'status' => 404 )
			);
		}

		// Remove item
		$removed = WC()->cart->remove_cart_item( $item_key );

		if ( ! $removed ) {
			return new WP_Error(
				'remove_failed',
				__( 'Impossible de supprimer l\'article.', 'afs-wcml-api' ),
				array( 'status' => 500 )
			);
		}

		// Recalculate totals
		WC()->cart->calculate_totals();

		$cart_data = $this->format_cart_response( $currency );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Article supprimé du panier.', 'afs-wcml-api' ),
				'data'    => $cart_data,
			),
			200
		);
	}

	/**
	 * Clear cart.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function clear_cart( $request ) {
		$cart_key = $request->get_param( 'cart_key' ) ?: '';

		$this->init_cart_session( $cart_key );

		WC()->cart->empty_cart();

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Panier vidé.', 'afs-wcml-api' ),
				'data'    => array(
					'items'       => array(),
					'items_count' => 0,
					'totals'      => array(
						'total_items'    => 0,
						'total_tax'      => 0,
						'total_price'    => 0,
						'currency_code'  => 'EUR',
						'currency_symbol'=> '€',
					),
				),
			),
			200
		);
	}
}


