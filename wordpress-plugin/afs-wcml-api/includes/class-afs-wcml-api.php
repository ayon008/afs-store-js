<?php
/**
 * REST API class.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_REST_API class.
 */
class AFS_WCML_REST_API {

	/**
	 * Prices instance.
	 *
	 * @var AFS_WCML_Prices
	 */
	private $prices;

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
	 *
	 * @param AFS_WCML_Prices $prices Prices instance.
	 */
	public function __construct( $prices ) {
		$this->prices = $prices;
		$this->init_hooks();
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		// Register routes on rest_api_init hook (required for REST API).
		add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
		
		// Also try to register immediately if REST API is already initialized.
		if ( did_action( 'rest_api_init' ) ) {
			$this->register_routes();
		}

		// Authentication is handled via Bearer token in check_permission() method.
	}


	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		// Prevent duplicate registration.
		if ( $this->routes_registered ) {
			return;
		}

		// Test endpoint to verify routes are registered.
		register_rest_route(
			$this->namespace,
			'/test',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'test_endpoint' ),
				'permission_callback' => '__return_true',
			)
		);

		// Get product prices.
		register_rest_route(
			$this->namespace,
			'/products/(?P<id>\d+)/prices',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_product_prices' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_product_id' ),
					),
				),
			)
		);

		// Set product prices.
		register_rest_route(
			$this->namespace,
			'/products/(?P<id>\d+)/prices',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'set_product_prices' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_product_id' ),
					),
					'prices' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_prices_data' ),
					),
				),
			)
		);

		// Bulk update product prices.
		register_rest_route(
			$this->namespace,
			'/products/bulk-prices',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'bulk_update_prices' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'products' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_bulk_data' ),
					),
				),
			)
		);

		// Get variation prices.
		register_rest_route(
			$this->namespace,
			'/variations/(?P<id>\d+)/prices',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_variation_prices' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_variation_id' ),
					),
				),
			)
		);

		// Set variation prices.
		register_rest_route(
			$this->namespace,
			'/variations/(?P<id>\d+)/prices',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'set_variation_prices' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_variation_id' ),
					),
					'prices' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_prices_data' ),
					),
				),
			)
		);

		// Get all variation prices for a variable product.
		register_rest_route(
			$this->namespace,
			'/products/(?P<id>\d+)/variations/prices',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_variable_product_prices' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_product_id_for_variable' ),
					),
				),
			)
		);

		// Mark routes as registered.
		$this->routes_registered = true;
	}



	/**
	 * Check permission for API requests.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function check_permission( $request ) {
		// Check for Bearer token.
		$auth_header = $request->get_header( 'Authorization' );
		
		// Also check $_SERVER directly as fallback.
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

		// Extract token.
		$token = substr( $auth_header, 7 );
		if ( empty( $token ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Token Bearer invalide.', 'afs-wcml-api' ),
				array( 'status' => 401 )
			);
		}

		// Get hardcoded token from wp-config.php.
		// Define this constant in wp-config.php: define( 'AFS_WCML_API_TOKEN', 'your-secret-token-here' );
		if ( ! defined( 'AFS_WCML_API_TOKEN' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Token API non configuré. Définissez AFS_WCML_API_TOKEN dans wp-config.php.', 'afs-wcml-api' ),
				array( 'status' => 500 )
			);
		}

		// Verify token matches.
		if ( ! hash_equals( AFS_WCML_API_TOKEN, $token ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Token Bearer invalide.', 'afs-wcml-api' ),
				array( 'status' => 401 )
			);
		}

		// Token is valid, allow the request.
		return true;
	}

	/**
	 * Validate product ID.
	 *
	 * @param int             $value   Product ID.
	 * @param WP_REST_Request $request Request object.
	 * @param string          $param   Parameter name.
	 * @return bool|WP_Error
	 */
	public function validate_product_id( $value, $request, $param ) {
		$product = wc_get_product( $value );
		if ( ! $product ) {
			return new WP_Error(
				'rest_invalid_param',
				sprintf( __( 'Produit avec l\'ID %d introuvable.', 'afs-wcml-api' ), $value ),
				array( 'status' => 400 )
			);
		}

		// For GET requests, allow variable products (they just won't have direct prices).
		// For POST requests, don't allow variable products (use variations instead).
		if ( $request->get_method() === 'POST' && $product->is_type( 'variable' ) ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Les produits variables ne peuvent pas avoir de prix directs. Utilisez les variations.', 'afs-wcml-api' ),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	/**
	 * Validate variation ID.
	 *
	 * @param int             $value   Variation ID.
	 * @param WP_REST_Request $request Request object.
	 * @param string          $param   Parameter name.
	 * @return bool|WP_Error
	 */
	public function validate_variation_id( $value, $request, $param ) {
		$variation = wc_get_product( $value );
		if ( ! $variation || ! $variation->is_type( 'variation' ) ) {
			return new WP_Error(
				'rest_invalid_param',
				sprintf( __( 'Variation avec l\'ID %d introuvable.', 'afs-wcml-api' ), $value ),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	/**
	 * Validate product ID for variable products (for getting all variation prices).
	 *
	 * @param int             $value   Product ID.
	 * @param WP_REST_Request $request Request object.
	 * @param string          $param   Parameter name.
	 * @return bool|WP_Error
	 */
	public function validate_product_id_for_variable( $value, $request, $param ) {
		$product = wc_get_product( $value );
		if ( ! $product || ! $product->is_type( 'variable' ) ) {
			return new WP_Error(
				'rest_invalid_param',
				sprintf( __( 'Produit variable avec l\'ID %d introuvable.', 'afs-wcml-api' ), $value ),
				array( 'status' => 400 )
			);
		}
		return true;
	}

	/**
	 * Validate prices data.
	 *
	 * @param array           $value   Prices data.
	 * @param WP_REST_Request $request Request object.
	 * @param string          $param   Parameter name.
	 * @return bool|WP_Error
	 */
	public function validate_prices_data( $value, $request, $param ) {
		if ( ! is_array( $value ) || empty( $value ) ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Les prix doivent être un tableau non vide.', 'afs-wcml-api' ),
				array( 'status' => 400 )
			);
		}

		$validation = $this->prices->validate_prices( $value );
		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		return true;
	}

	/**
	 * Validate bulk data.
	 *
	 * @param array           $value   Bulk data.
	 * @param WP_REST_Request $request Request object.
	 * @param string          $param   Parameter name.
	 * @return bool|WP_Error
	 */
	public function validate_bulk_data( $value, $request, $param ) {
		if ( ! is_array( $value ) || empty( $value ) ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Les données doivent être un tableau non vide.', 'afs-wcml-api' ),
				array( 'status' => 400 )
			);
		}

		foreach ( $value as $item ) {
			if ( ! isset( $item['product_id'] ) || ! isset( $item['prices'] ) ) {
				return new WP_Error(
					'rest_invalid_param',
					__( 'Chaque élément doit contenir product_id et prices.', 'afs-wcml-api' ),
					array( 'status' => 400 )
				);
			}
		}

		return true;
	}

	/**
	 * Test endpoint.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function test_endpoint( $request ) {
		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => 'AFS WCML API is working',
				'version' => AFS_WCML_API_VERSION,
			),
			200
		);
	}

	/**
	 * Get product prices.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_product_prices( $request ) {
		$product_id = (int) $request['id'];
		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			return new WP_Error(
				'rest_invalid_param',
				sprintf( __( 'Produit avec l\'ID %d introuvable.', 'afs-wcml-api' ), $product_id ),
				array( 'status' => 404 )
			);
		}

		// For variable products, return empty prices (they use variations).
		if ( $product->is_type( 'variable' ) ) {
			return new WP_REST_Response(
				array(
					'product_id' => $product_id,
					'type'       => 'variable',
					'prices'     => array(),
					'message'    => __( 'Les produits variables utilisent les prix des variations. Utilisez /variations/{id}/prices pour obtenir les prix.', 'afs-wcml-api' ),
				),
				200
			);
		}

		$prices = $this->prices->get_product_prices( $product_id );
		$default_currency = $this->prices->get_default_currency();
		$active_currencies = $this->prices->get_active_currencies();

		return new WP_REST_Response(
			array(
				'product_id'       => $product_id,
				'type'             => $product->get_type(),
				'default_currency' => $default_currency,
				'active_currencies' => array_keys( $active_currencies ),
				'prices'           => $prices,
			),
			200
		);
	}

	/**
	 * Set product prices.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function set_product_prices( $request ) {
		$product_id = (int) $request['id'];
		$prices = $request['prices'];

		// Format prices array.
		$formatted_prices = $this->prices->format_prices_array( $prices );

		// Save prices.
		$result = $this->prices->save_product_prices( $product_id, $formatted_prices );

		if ( ! $result ) {
			return new WP_Error(
				'rest_save_error',
				__( 'Erreur lors de la sauvegarde des prix.', 'afs-wcml-api' ),
				array( 'status' => 500 )
			);
		}

		// Disable auto conversion.
		$this->prices->disable_auto_conversion( $product_id );

		return new WP_REST_Response(
			array(
				'product_id' => $product_id,
				'prices'     => $this->prices->get_product_prices( $product_id ),
				'message'    => __( 'Prix sauvegardés avec succès.', 'afs-wcml-api' ),
			),
			200
		);
	}

	/**
	 * Bulk update product prices.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function bulk_update_prices( $request ) {
		$products = $request['products'];
		$results = array(
			'success' => array(),
			'errors'  => array(),
		);

		foreach ( $products as $item ) {
			$product_id = (int) $item['product_id'];
			$prices = $item['prices'];

			// Validate product exists.
			$product = wc_get_product( $product_id );
			if ( ! $product ) {
				$results['errors'][] = array(
					'product_id' => $product_id,
					'error'     => __( 'Produit introuvable.', 'afs-wcml-api' ),
				);
				continue;
			}

			// Skip variable products.
			if ( $product->is_type( 'variable' ) ) {
				$results['errors'][] = array(
					'product_id' => $product_id,
					'error'     => __( 'Les produits variables ne peuvent pas avoir de prix directs.', 'afs-wcml-api' ),
				);
				continue;
			}

			// Format prices array.
			$formatted_prices = $this->prices->format_prices_array( $prices );

			// Validate prices.
			$validation = $this->prices->validate_prices( $formatted_prices );
			if ( is_wp_error( $validation ) ) {
				$results['errors'][] = array(
					'product_id' => $product_id,
					'error'     => $validation->get_error_message(),
				);
				continue;
			}

			// Save prices.
			$result = $this->prices->save_product_prices( $product_id, $formatted_prices );
			if ( $result ) {
				$this->prices->disable_auto_conversion( $product_id );
				$results['success'][] = array(
					'product_id' => $product_id,
					'prices'     => $this->prices->get_product_prices( $product_id ),
				);
			} else {
				$results['errors'][] = array(
					'product_id' => $product_id,
					'error'     => __( 'Erreur lors de la sauvegarde.', 'afs-wcml-api' ),
				);
			}
		}

		return new WP_REST_Response(
			array(
				'success_count' => count( $results['success'] ),
				'error_count'   => count( $results['errors'] ),
				'success'       => $results['success'],
				'errors'        => $results['errors'],
			),
			200
		);
	}

	/**
	 * Get variation prices.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_variation_prices( $request ) {
		$variation_id = (int) $request['id'];
		$prices = $this->prices->get_product_prices( $variation_id );
		$default_currency = $this->prices->get_default_currency();
		$active_currencies = $this->prices->get_active_currencies();

		return new WP_REST_Response(
			array(
				'variation_id'      => $variation_id,
				'default_currency'  => $default_currency,
				'active_currencies' => array_keys( $active_currencies ),
				'prices'            => $prices,
			),
			200
		);
	}

	/**
	 * Set variation prices.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function set_variation_prices( $request ) {
		$variation_id = (int) $request['id'];
		$prices = $request['prices'];

		// Format prices array.
		$formatted_prices = $this->prices->format_prices_array( $prices );

		// Save prices.
		$result = $this->prices->save_product_prices( $variation_id, $formatted_prices );

		if ( ! $result ) {
			return new WP_Error(
				'rest_save_error',
				__( 'Erreur lors de la sauvegarde des prix.', 'afs-wcml-api' ),
				array( 'status' => 500 )
			);
		}

		// Disable auto conversion.
		$this->prices->disable_auto_conversion( $variation_id );

		return new WP_REST_Response(
			array(
				'variation_id' => $variation_id,
				'prices'       => $this->prices->get_product_prices( $variation_id ),
				'message'      => __( 'Prix sauvegardés avec succès.', 'afs-wcml-api' ),
			),
			200
		);
	}

	/**
	 * Get all variation prices for a variable product.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_variable_product_prices( $request ) {
		$product_id = (int) $request['id'];
		$product = wc_get_product( $product_id );

		if ( ! $product || ! $product->is_type( 'variable' ) ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Le produit doit être un produit variable.', 'afs-wcml-api' ),
				array( 'status' => 400 )
			);
		}

		// Get all variations.
		$variation_ids = $product->get_children();
		$variations_prices = array();

		foreach ( $variation_ids as $variation_id ) {
			$variation = wc_get_product( $variation_id );
			if ( ! $variation ) {
				continue;
			}

			$prices = $this->prices->get_product_prices( $variation_id );

			$variations_prices[] = array(
				'variation_id'   => $variation_id,
				'variation_name' => $variation->get_name(),
				'attributes'     => $variation->get_variation_attributes(),
				'prices'          => $prices,
				// Default WooCommerce prices (if no WCML prices set).
				'default_price'  => $variation->get_price(),
				'regular_price'  => $variation->get_regular_price(),
				'sale_price'     => $variation->get_sale_price(),
			);
		}

		return new WP_REST_Response(
			array(
				'product_id' => $product_id,
				'type'       => 'variable',
				'variations' => $variations_prices,
			),
			200
		);
	}
}

