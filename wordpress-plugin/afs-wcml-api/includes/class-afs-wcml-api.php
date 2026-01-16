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

		// Clear cache when product is updated
		add_action( 'save_post_product', array( $this, 'clear_slug_translation_cache' ), 10, 1 );
		add_action( 'wpml_pro_translation_completed', array( $this, 'clear_slug_translation_cache_on_translation' ), 10, 3 );

		// Authentication is handled via Bearer token in check_permission() method.
	}

	/**
	 * Clear slug translation cache when product is updated.
	 *
	 * @param int $post_id Post ID.
	 */
	public function clear_slug_translation_cache( $post_id ) {
		if ( get_post_type( $post_id ) !== 'product' ) {
			return;
		}

		// Clear cache for all languages
		$languages = array( 'en', 'fr' );
		$product = wc_get_product( $post_id );
		
		if ( $product ) {
			$slug = $product->get_slug();
			foreach ( $languages as $lang ) {
				delete_transient( 'afs_slug_trans_' . md5( $post_id . '_' . $lang ) );
				if ( $slug ) {
					delete_transient( 'afs_slug_trans_' . md5( $slug . '_' . $lang ) );
				}
			}
		}
	}

	/**
	 * Clear cache when translation is completed.
	 *
	 * @param int    $new_post_id New post ID.
	 * @param array  $fields      Translation fields.
	 * @param object $job         Translation job.
	 */
	public function clear_slug_translation_cache_on_translation( $new_post_id, $fields, $job ) {
		if ( isset( $job->original_post_type ) && $job->original_post_type === 'product' ) {
			$this->clear_slug_translation_cache( $new_post_id );
			// Also clear cache for original product
			if ( isset( $job->original_doc_id ) ) {
				$this->clear_slug_translation_cache( $job->original_doc_id );
			}
		}
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

		// Translate product slug to another language.
		register_rest_route(
			$this->namespace,
			'/products/translate-slug',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'translate_product_slug' ),
				'permission_callback' => '__return_true', // Public endpoint for frontend use
				'args'                => array(
					'slug' => array(
						'required'          => false,
						'type'              => 'string',
						'validate_callback' => 'sanitize_text_field',
					),
					'product_id' => array(
						'required'          => false,
						'type'              => 'integer',
						'validate_callback' => 'absint',
					),
					'target_lang' => array(
						'required'          => true,
						'type'              => 'string',
						'validate_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Get exchange rates for currencies.
		register_rest_route(
			$this->namespace,
			'/exchange-rates',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_exchange_rates' ),
				'permission_callback' => '__return_true', // Public endpoint
			)
		);

		// Translate category slug to another language.
		register_rest_route(
			$this->namespace,
			'/categories/translate-slug',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'translate_category_slug' ),
				'permission_callback' => '__return_true', // Public endpoint for frontend use
				'args'                => array(
					'slug' => array(
						'required'          => false,
						'type'              => 'string',
						'validate_callback' => 'sanitize_text_field',
					),
					'term_id' => array(
						'required'          => false,
						'type'              => 'integer',
						'validate_callback' => 'absint',
					),
					'target_lang' => array(
						'required'          => true,
						'type'              => 'string',
						'validate_callback' => function( $param ) {
							return in_array( $param, array( 'en', 'fr' ), true );
						},
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

	/**
	 * Translate product slug to another language.
	 * Optimized with caching and improved SQL queries.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function translate_product_slug( $request ) {
		$slug = $request->get_param( 'slug' );
		$product_id = $request->get_param( 'product_id' );
		$target_lang = $request->get_param( 'target_lang' );

		// Validate target language.
		if ( ! in_array( $target_lang, array( 'en', 'fr' ), true ) ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'product_id'  => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Langue cible invalide. Utilisez "en" ou "fr".', 'afs-wcml-api' ),
			);
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		// Build cache key
		$cache_key = 'afs_slug_trans_' . md5( ( $product_id ? $product_id : $slug ) . '_' . $target_lang );
		$cached = get_transient( $cache_key );
		
		if ( false !== $cached ) {
			// Return cached result with proper headers for browser caching
			$response = new WP_REST_Response( $cached, 200 );
			$response->header( 'Cache-Control', 'public, max-age=3600' );
			return $response;
		}

		// Get product ID from slug if not provided.
		if ( ! $product_id && $slug ) {
			// Use WP_Query first to respect WPML filters (better for multilingual sites)
			$args = array(
				'post_type'        => 'product',
				'posts_per_page'   => 1,
				'post_status'      => 'publish',
				'name'             => $slug,
				'suppress_filters' => false, // Important: respect WPML filters
				'fields'           => 'ids', // Only get IDs for performance
			);
			$query = new WP_Query( $args );
			if ( $query->have_posts() ) {
				$product_id = $query->posts[0];
			}
			wp_reset_postdata();
			
			// Fallback: direct SQL query if WP_Query didn't find it
			if ( ! $product_id ) {
				global $wpdb;
				$product_id = $wpdb->get_var( $wpdb->prepare(
					"SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'product' AND post_status = 'publish' LIMIT 1",
					$slug
				) );
			}
		}

		if ( ! $product_id ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'product_id'  => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Produit introuvable avec le slug ou l\'ID fourni.', 'afs-wcml-api' ),
			);
			// Cache negative result for shorter time (5 minutes)
			set_transient( $cache_key, $error_response, 300 );
			// Return JSON response instead of WP_Error 404
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		// Get the actual language of the found product
		$source_lang = null;
		if ( function_exists( 'apply_filters' ) ) {
			$source_lang = apply_filters( 'wpml_element_language_code', null, array(
				'element_id'   => $product_id,
				'element_type' => 'post_product'
			) );
		}

		// Get translated product ID using WPML (use false to detect missing translations)
		$translated_product_id = $product_id;
		if ( function_exists( 'apply_filters' ) ) {
			$translated_product_id = apply_filters( 'wpml_object_id', $product_id, 'product', false, $target_lang );
		}

		// If product is already in target language AND translation ID is the same, return it directly
		if ( $source_lang === $target_lang && $translated_product_id === $product_id ) {
			$product = wc_get_product( $product_id );
			if ( $product && $product->get_status() === 'publish' ) {
				$response_data = array(
					'slug'        => $product->get_slug(),
					'exists'      => true,
					'product_id'  => $product_id,
					'target_lang' => $target_lang,
				);
				// Cache for 1 hour
				set_transient( $cache_key, $response_data, 3600 );
				$response = new WP_REST_Response( $response_data, 200 );
				$response->header( 'Cache-Control', 'public, max-age=3600' );
				return $response;
			}
		}

		// If no translation found (same ID or null/false), return error.
		if ( ! $translated_product_id || $translated_product_id === $product_id ) {

			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'product_id'  => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Aucune traduction trouvée pour ce produit dans la langue cible.', 'afs-wcml-api' ),
			);
			// Cache negative result for 5 minutes
			set_transient( $cache_key, $error_response, 300 );
			return new WP_REST_Response( $error_response, 200 );
		}

		// Get translated product.
		$translated_product = wc_get_product( $translated_product_id );
		if ( ! $translated_product ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'product_id'  => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Produit traduit introuvable.', 'afs-wcml-api' ),
			);
			// Cache negative result for 5 minutes
			set_transient( $cache_key, $error_response, 300 );
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		// Validate that the translated product is published and of type 'product'
		$translated_post = get_post( $translated_product_id );
		if ( ! $translated_post || $translated_post->post_status !== 'publish' || $translated_post->post_type !== 'product' ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'product_id'  => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Produit traduit non publié ou invalide.', 'afs-wcml-api' ),
			);
			// Cache negative result for 5 minutes
			set_transient( $cache_key, $error_response, 300 );
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		$response_data = array(
			'slug'        => $translated_product->get_slug(),
			'exists'      => true,
			'product_id'  => $translated_product_id,
			'target_lang' => $target_lang,
		);
		
		// Cache successful result for 1 hour
		set_transient( $cache_key, $response_data, 3600 );
		
		$response = new WP_REST_Response( $response_data, 200 );
		$response->header( 'Cache-Control', 'public, max-age=3600' );
		return $response;
	}

	/**
	 * Translate category slug to another language.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function translate_category_slug( $request ) {
		$slug = $request->get_param( 'slug' );
		$term_id = $request->get_param( 'term_id' );
		$target_lang = $request->get_param( 'target_lang' );

		// Validate target language.
		if ( ! in_array( $target_lang, array( 'en', 'fr' ), true ) ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'term_id'      => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Langue cible invalide. Utilisez "en" ou "fr".', 'afs-wcml-api' ),
			);
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		// Build cache key
		$cache_key = 'afs_cat_slug_trans_' . md5( ( $term_id ? $term_id : $slug ) . '_' . $target_lang );
		$cached = get_transient( $cache_key );
		
		if ( false !== $cached ) {
			// Return cached result with proper headers for browser caching
			$response = new WP_REST_Response( $cached, 200 );
			$response->header( 'Cache-Control', 'public, max-age=3600' );
			return $response;
		}

		// Get term ID from slug if not provided.
		if ( ! $term_id && $slug ) {
			// Handle hierarchical paths (e.g., "foiling/wing-foil")
			$slug_parts = explode( '/', $slug );
			$last_slug = end( $slug_parts ); // Get the last segment (child category)
			
			// Try to find category by slug using get_term_by (respects WPML)
			$term = get_term_by( 'slug', $last_slug, 'product_cat' );
			
			if ( ! $term || is_wp_error( $term ) ) {
				// Fallback: use WP_Term_Query which respects WPML filters
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
			
			if ( $term && ! is_wp_error( $term ) ) {
				$term_id = $term->term_id;
			}
		}

		if ( ! $term_id ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'term_id'     => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Catégorie introuvable avec le slug ou l\'ID fourni.', 'afs-wcml-api' ),
			);
			// Cache negative result for shorter time (5 minutes)
			set_transient( $cache_key, $error_response, 300 );
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		// Get the actual language of the found category
		$source_lang = null;
		if ( function_exists( 'apply_filters' ) ) {
			$source_lang = apply_filters( 'wpml_element_language_code', null, array(
				'element_id'   => $term_id,
				'element_type' => 'tax_product_cat'
			) );
		}

		// If category is already in target language, return it directly (with hierarchical path if needed)
		if ( $source_lang === $target_lang ) {
			$term = get_term( $term_id, 'product_cat' );
			if ( $term && ! is_wp_error( $term ) ) {
				$response_slug = $term->slug;
				
				// If original slug was hierarchical, build the hierarchical path
				if ( $slug && strpos( $slug, '/' ) !== false ) {
					$current_term = $term;
					$path_terms = array( $current_term );
					
					// Walk up the hierarchy
					while ( $current_term->parent ) {
						$parent_term = get_term( $current_term->parent, 'product_cat' );
						if ( $parent_term && ! is_wp_error( $parent_term ) ) {
							array_unshift( $path_terms, $parent_term );
							$current_term = $parent_term;
						} else {
							break;
						}
					}
					
					// Build path from terms
					$translated_parts = array_map( function( $t ) {
						return $t->slug;
					}, $path_terms );
					
					$response_slug = implode( '/', $translated_parts );
				}
				
				$response_data = array(
					'slug'        => $response_slug,
					'exists'      => true,
					'term_id'     => $term_id,
					'target_lang' => $target_lang,
				);
				// Cache for 1 hour
				set_transient( $cache_key, $response_data, 3600 );
				$response = new WP_REST_Response( $response_data, 200 );
				$response->header( 'Cache-Control', 'public, max-age=3600' );
				return $response;
			}
		}

		// Get translated category ID using WPML (use false to detect missing translations)
		$translated_term_id = $term_id;
		if ( function_exists( 'apply_filters' ) ) {
			$translated_term_id = apply_filters( 'wpml_object_id', $term_id, 'product_cat', false, $target_lang );
		}

		// If no translation found, return error.
		if ( ! $translated_term_id || $translated_term_id === $term_id ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'term_id'     => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Aucune traduction trouvée pour cette catégorie dans la langue cible.', 'afs-wcml-api' ),
			);
			// Cache negative result for 5 minutes
			set_transient( $cache_key, $error_response, 300 );
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		// Get translated category.
		$translated_term = get_term( $translated_term_id, 'product_cat' );
		if ( ! $translated_term || is_wp_error( $translated_term ) ) {
			$error_response = array(
				'slug'        => null,
				'exists'      => false,
				'term_id'     => null,
				'target_lang' => $target_lang,
				'message'     => __( 'Catégorie traduite introuvable.', 'afs-wcml-api' ),
			);
			// Cache negative result for 5 minutes
			set_transient( $cache_key, $error_response, 300 );
			$response = new WP_REST_Response( $error_response, 200 );
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		// Build hierarchical path if needed
		$translated_slug = $translated_term->slug;
		
		// If original slug was hierarchical, build the translated hierarchical path
		if ( $slug && strpos( $slug, '/' ) !== false ) {
			$slug_parts = explode( '/', $slug );
			$translated_parts = array();
			
			// Get parent terms and build path
			$current_term = $translated_term;
			$path_terms = array( $current_term );
			
			// Walk up the hierarchy
			while ( $current_term->parent ) {
				$parent_term = get_term( $current_term->parent, 'product_cat' );
				if ( $parent_term && ! is_wp_error( $parent_term ) ) {
					// Get translated parent
					if ( function_exists( 'apply_filters' ) ) {
						$translated_parent_id = apply_filters( 'wpml_object_id', $parent_term->term_id, 'product_cat', false, $target_lang );
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
			$translated_parts = array_map( function( $term ) {
				return $term->slug;
			}, $path_terms );
			
			$translated_slug = implode( '/', $translated_parts );
		}

		$response_data = array(
			'slug'        => $translated_slug,
			'exists'      => true,
			'term_id'     => $translated_term_id,
			'target_lang' => $target_lang,
		);
		
		// Cache successful result for 1 hour
		set_transient( $cache_key, $response_data, 3600 );
		
		$response = new WP_REST_Response( $response_data, 200 );
		$response->header( 'Cache-Control', 'public, max-age=3600' );
		return $response;
	}

	/**
	 * Get exchange rates for all currencies.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_exchange_rates( $request ) {
		try {
			global $woocommerce_wpml;

			if ( ! $woocommerce_wpml || ! isset( $woocommerce_wpml->multi_currency ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'message' => __( 'WCML is not available.', 'afs-wcml-api' ),
						'rates'   => array(),
					),
					200
				);
			}

			$multi_currency = $woocommerce_wpml->multi_currency;
			
			if ( ! method_exists( $multi_currency, 'get_default_currency' ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'message' => __( 'WCML multi_currency methods not available.', 'afs-wcml-api' ),
						'rates'   => array(),
					),
					200
				);
			}

			$default_currency = $multi_currency->get_default_currency();
			if ( ! $default_currency ) {
				$default_currency = 'EUR'; // Fallback
			}

			$currencies = $multi_currency->get_currencies();
			if ( ! is_array( $currencies ) ) {
				$currencies = array();
			}

			$rates = array();

			// Add default currency with rate 1.0
			$rates[ $default_currency ] = 1.0;

			// Get rates for all currencies
			foreach ( $currencies as $code => $currency_data ) {
				if ( $code === $default_currency ) {
					continue; // Skip default currency, already added
				}

				$rate = null;
				if ( method_exists( $multi_currency, 'get_currency_rate' ) ) {
					$rate = $multi_currency->get_currency_rate( $code );
				}

				if ( $rate && is_numeric( $rate ) && $rate > 0 ) {
					$rates[ $code ] = floatval( $rate );
				} elseif ( isset( $currency_data['rate'] ) && is_numeric( $currency_data['rate'] ) && $currency_data['rate'] > 0 ) {
					$rates[ $code ] = floatval( $currency_data['rate'] );
				}
			}

			return new WP_REST_Response(
				array(
					'success'         => true,
					'default_currency' => $default_currency,
					'rates'           => $rates,
				),
				200
			);
		} catch ( Exception $e ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Error retrieving exchange rates: ', 'afs-wcml-api' ) . $e->getMessage(),
					'rates'   => array(),
				),
				200
			);
		}
	}
}

