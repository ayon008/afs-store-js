<?php
/**
 * Location Stock Synchronization class for WCML multi-language support.
 *
 * Handles synchronization of WCMLIM location stock quantities between product translations.
 * Optimized for performance with caching and batch processing.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_Location_Stock_Sync class.
 */
class AFS_WCML_Location_Stock_Sync {

	/**
	 * Option name for auto-sync.
	 *
	 * @var string
	 */
	const OPTION_AUTO_SYNC = 'afs_wcml_location_stock_auto_sync_enabled';

	/**
	 * Cache key for locations.
	 *
	 * @var string
	 */
	const CACHE_LOCATIONS = 'afs_wcml_location_stock_locations';

	/**
	 * Flag to prevent infinite loops during sync.
	 *
	 * @var bool
	 */
	private static $syncing = false;

	/**
	 * Cache for product translations to avoid repeated WPML queries.
	 *
	 * @var array
	 */
	private static $translations_cache = array();

	/**
	 * Cache for locations.
	 *
	 * @var array
	 */
	private static $locations_cache = null;

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
		// Hook into WooCommerce product save to sync location stock (high priority).
		add_action( 'woocommerce_process_product_meta', array( $this, 'on_product_save' ), 100, 1 );
		add_action( 'woocommerce_save_product_variation', array( $this, 'on_variation_save' ), 100, 2 );

		// Hook for bulk variation updates.
		add_action( 'woocommerce_ajax_save_product_variations', array( $this, 'on_ajax_save_variations' ), 100, 1 );

		// Hook into post meta updates for location stock changes (lower priority).
		add_action( 'updated_post_meta', array( $this, 'on_location_stock_meta_update' ), 20, 4 );
		add_action( 'added_post_meta', array( $this, 'on_location_stock_meta_update' ), 20, 4 );

		// AJAX handlers.
		add_action( 'wp_ajax_afs_wcml_sync_product_location_stock', array( $this, 'ajax_sync_product_location_stock' ) );
		add_action( 'wp_ajax_afs_wcml_sync_all_location_stock', array( $this, 'ajax_sync_all_location_stock' ) );
		add_action( 'wp_ajax_afs_wcml_get_products_location_stock_comparison', array( $this, 'ajax_get_products_location_stock_comparison' ) );
		add_action( 'wp_ajax_afs_wcml_get_location_stock_sync_status', array( $this, 'ajax_get_location_stock_sync_status' ) );
		add_action( 'wp_ajax_afs_wcml_save_location_stock_sync_settings', array( $this, 'ajax_save_location_stock_sync_settings' ) );
	}

	/**
	 * Check if auto-sync is enabled.
	 *
	 * @return bool
	 */
	public function is_auto_sync_enabled() {
		return (bool) get_option( self::OPTION_AUTO_SYNC, true );
	}

	/**
	 * Enable or disable auto-sync.
	 *
	 * @param bool $enabled Whether to enable auto-sync.
	 */
	public function set_auto_sync( $enabled ) {
		update_option( self::OPTION_AUTO_SYNC, (bool) $enabled );
	}

	/**
	 * Get all WCMLIM locations.
	 * Uses cache to avoid repeated queries.
	 * Only returns Europe (2682) and North America (2683) locations.
	 *
	 * @return array Array of location IDs.
	 */
	public function get_all_locations() {
		// Define allowed locations: Europe (2682) and North America (2683).
		// ALWAYS filter to only these two locations, regardless of cache.
		$allowed_locations = array( 2682, 2683 );

		// Check static cache first, but filter it.
		if ( self::$locations_cache !== null ) {
			$cached = array_intersect( self::$locations_cache, $allowed_locations );
			if ( ! empty( $cached ) ) {
				sort( $cached );
				return $cached;
			}
		}

		// Check transient cache (1 hour), but filter it.
		$cached = get_transient( self::CACHE_LOCATIONS );
		if ( $cached !== false && is_array( $cached ) ) {
			$cached = array_intersect( $cached, $allowed_locations );
			if ( ! empty( $cached ) ) {
				sort( $cached );
				self::$locations_cache = $cached;
				return $cached;
			}
		}

		// If cache is empty or invalid, build from scratch but only use allowed locations.
		$locations = array();

		// Strategy 1: Try WCMLIM taxonomy if it exists.
		if ( taxonomy_exists( 'wcmlim_location' ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => 'wcmlim_location',
					'hide_empty' => false,
				)
			);

			if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
				foreach ( $terms as $term ) {
					$term_id = (int) $term->term_id;
					// Only include if it's in the allowed locations.
					if ( in_array( $term_id, $allowed_locations, true ) ) {
						$locations[] = $term_id;
					}
				}
			}
		}

		// Strategy 2: If no locations found via taxonomy, use allowed locations directly.
		if ( empty( $locations ) ) {
			// Verify these locations exist in the database by checking meta keys.
			global $wpdb;

			foreach ( $allowed_locations as $location_id ) {
				$meta_key = 'wcmlim_stock_at_' . $location_id;
				$exists = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT COUNT(*) FROM {$wpdb->postmeta} 
						WHERE meta_key = %s 
						AND meta_value != '' AND meta_value != '0'",
						$meta_key
					)
				);

				// If location has stock data, include it. Otherwise include it anyway (might be used later).
				$locations[] = $location_id;
			}
		}

		// FORCE filter to only allowed locations (double check).
		$locations = array_intersect( $locations, $allowed_locations );
		$locations = array_unique( $locations );
		sort( $locations );

		// If still empty after filtering, use allowed locations as fallback.
		if ( empty( $locations ) ) {
			$locations = $allowed_locations;
		}

		// Cache for 1 hour (only allowed locations).
		set_transient( self::CACHE_LOCATIONS, $locations, HOUR_IN_SECONDS );
		self::$locations_cache = $locations;

		return $locations;
	}

	/**
	 * Clear locations cache.
	 */
	public function clear_locations_cache() {
		delete_transient( self::CACHE_LOCATIONS );
		self::$locations_cache = null;
	}

	/**
	 * Get product frontend URL for a specific language.
	 *
	 * @param int    $product_id Product ID.
	 * @param string $lang       Language code (optional, defaults to product's language).
	 * @return string Frontend URL.
	 */
	private function get_product_frontend_url( $product_id, $lang = null ) {
		if ( ! defined( 'HEADLESS_URL' ) ) {
			return '';
		}

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return '';
		}

		// If lang is provided, get the translation.
		if ( $lang && function_exists( 'apply_filters' ) ) {
			$translated_id = apply_filters( 'wpml_object_id', $product_id, 'product', false, $lang );
			if ( $translated_id && $translated_id !== $product_id ) {
				$product = wc_get_product( $translated_id );
				if ( ! $product ) {
					$product = wc_get_product( $product_id );
				}
			}
		}

		$slug = $product->get_slug();
		if ( ! $slug ) {
			return '';
		}

		// Determine the language to use for URL construction.
		$url_lang = $lang;
		if ( ! $url_lang && function_exists( 'apply_filters' ) ) {
			$url_lang = apply_filters( 'wpml_element_language_code', null, array(
				'element_id'   => $product->get_id(),
				'element_type' => 'post_product',
			) );
		}
		if ( ! $url_lang ) {
			$url_lang = apply_filters( 'wpml_default_language', 'en' );
		}

		// Build URL according to language.
		$headless_url = rtrim( HEADLESS_URL, '/' );
		if ( $url_lang === 'fr' ) {
			return $headless_url . '/fr/produit/' . $slug;
		} else {
			// English: no /en prefix (as-needed mode in next-intl).
			return $headless_url . '/product/' . $slug;
		}
	}

	/**
	 * Get all product translations with caching.
	 *
	 * @param int  $product_id Product ID.
	 * @param bool $is_variation Whether the product is a variation.
	 * @return array Array of translation data: ['lang_code' => product_id].
	 */
	public function get_product_translations( $product_id, $is_variation = false ) {
		// Check cache first.
		$cache_key = $product_id . '_' . ( $is_variation ? 'var' : 'prod' );
		if ( isset( self::$translations_cache[ $cache_key ] ) ) {
			return self::$translations_cache[ $cache_key ];
		}

		if ( ! function_exists( 'apply_filters' ) ) {
			return array();
		}

		$translations = array();
		$languages = apply_filters( 'wpml_active_languages', array() );

		if ( empty( $languages ) ) {
			self::$translations_cache[ $cache_key ] = array();
			return array();
		}

		// Determine element type.
		$post_type = get_post_type( $product_id );
		if ( $post_type === 'product_variation' || $is_variation ) {
			$element_type = 'post_product_variation';
		} else {
			$element_type = 'post_product';
		}

		// Get default language.
		$default_lang = apply_filters( 'wpml_default_language', 'en' );

		foreach ( $languages as $lang_code => $lang_data ) {
			$translation_id = apply_filters( 'wpml_object_id', $product_id, $post_type, false, $lang_code );

			if ( $translation_id && $translation_id !== $product_id ) {
				$translations[ $lang_code ] = $translation_id;
			} elseif ( $lang_code === $default_lang ) {
				// Include source product in translations array.
				$translations[ $lang_code ] = $product_id;
			}
		}

		// Cache translations.
		self::$translations_cache[ $cache_key ] = $translations;

		return $translations;
	}

	/**
	 * Clear translations cache for a product.
	 *
	 * @param int $product_id Product ID.
	 */
	public function clear_translations_cache( $product_id = null ) {
		if ( $product_id ) {
			$keys = array( $product_id . '_prod', $product_id . '_var' );
			foreach ( $keys as $key ) {
				unset( self::$translations_cache[ $key ] );
			}
		} else {
			self::$translations_cache = array();
		}
	}

	/**
	 * Get location stock value for a product.
	 *
	 * @param int $product_id Product ID.
	 * @param int $location_id Location ID.
	 * @return int Stock quantity.
	 */
	private function get_location_stock( $product_id, $location_id ) {
		$stock_key = 'wcmlim_stock_at_' . $location_id;
		$stock = get_post_meta( $product_id, $stock_key, true );
		return $stock !== '' ? (int) $stock : 0;
	}

	/**
	 * Get location available stock value for a product.
	 *
	 * @param int $product_id Product ID.
	 * @param int $location_id Location ID.
	 * @return int Available stock quantity.
	 */
	private function get_location_available_stock( $product_id, $location_id ) {
		$stock_key = 'wcmlim_stock_available_at_' . $location_id;
		$stock = get_post_meta( $product_id, $stock_key, true );
		return $stock !== '' ? (int) $stock : 0;
	}

	/**
	 * Update location stock for a product.
	 *
	 * @param int $product_id Product ID.
	 * @param int $location_id Location ID.
	 * @param int $stock Stock quantity.
	 * @param int $available_stock Available stock quantity.
	 * @return bool Success.
	 */
	private function update_location_stock( $product_id, $location_id, $stock, $available_stock = null ) {
		$stock_key = 'wcmlim_stock_at_' . $location_id;
		$available_key = 'wcmlim_stock_available_at_' . $location_id;

		$result1 = update_post_meta( $product_id, $stock_key, $stock );

		// If available_stock is not provided, use same value as stock.
		if ( $available_stock === null ) {
			$available_stock = $stock;
		}

		$result2 = update_post_meta( $product_id, $available_key, $available_stock );

		return $result1 !== false && $result2 !== false;
	}

	/**
	 * Sync product location stock to all translations.
	 *
	 * @param int $source_product_id Source product ID.
	 * @return array Result with 'success', 'synced', 'errors'.
	 */
	public function sync_product_location_stock( $source_product_id ) {
		$result = array(
			'success' => true,
			'synced'  => array(),
			'errors'  => array(),
		);

		if ( self::$syncing ) {
			return $result;
		}

		// Verify product exists.
		$product = wc_get_product( $source_product_id );
		if ( ! $product ) {
			$result['success'] = false;
			$result['errors'][] = sprintf( __( 'Produit %d introuvable.', 'afs-wcml-api' ), $source_product_id );
			return $result;
		}

		// Check if auto-sync is enabled.
		if ( ! $this->is_auto_sync_enabled() ) {
			$result['errors'][] = __( 'Synchronisation automatique désactivée.', 'afs-wcml-api' );
			$result['success'] = false;
			return $result;
		}

		// Get all locations (only Europe 2682 and North America 2683).
		// Force filter to ensure only allowed locations.
		$all_locations = $this->get_all_locations();
		$allowed_locations = array( 2682, 2683 );
		$locations = array_intersect( $all_locations, $allowed_locations );
		
		// If empty, use allowed locations as fallback.
		if ( empty( $locations ) ) {
			$locations = $allowed_locations;
		}
		
		// Sort locations.
		sort( $locations );
		
		if ( empty( $locations ) ) {
			$result['errors'][] = __( 'Aucune location WCMLIM trouvée.', 'afs-wcml-api' );
			$result['success'] = false;
			return $result;
		}

		// Get translations.
		$is_variation = $product->is_type( 'variation' );
		$translations = $this->get_product_translations( $source_product_id, $is_variation );

		if ( count( $translations ) <= 1 ) {
			// No translations to sync.
			return $result;
		}

		self::$syncing = true;

		// Get default language to identify source product.
		$default_lang = apply_filters( 'wpml_default_language', 'en' );
		$source_lang = null;

		// Find source product language.
		foreach ( $translations as $lang => $trans_id ) {
			if ( (int) $trans_id === (int) $source_product_id ) {
				$source_lang = $lang;
				break;
			}
		}

		// If source is not default language, try to get default language product.
		$source_for_sync = $source_product_id;
		if ( $source_lang !== $default_lang && isset( $translations[ $default_lang ] ) ) {
			$source_for_sync = $translations[ $default_lang ];
		}

		// Sync each location (only Europe 2682 and North America 2683).
		$allowed_locations = array( 2682, 2683 );
		foreach ( $locations as $location_id ) {
			// Skip if location is not in allowed list.
			if ( ! in_array( (int) $location_id, $allowed_locations, true ) ) {
				continue;
			}
			
			$stock = $this->get_location_stock( $source_for_sync, $location_id );
			$available_stock = $this->get_location_available_stock( $source_for_sync, $location_id );

			// Sync to all translations (except source).
			foreach ( $translations as $lang => $target_id ) {
				if ( (int) $target_id === (int) $source_for_sync ) {
					continue; // Skip source.
				}

				// Verify target exists.
				if ( get_post_status( $target_id ) === false ) {
					continue;
				}

				// Update location stock.
				$update_result = $this->update_location_stock( $target_id, $location_id, $stock, $available_stock );

				if ( $update_result ) {
					$result['synced'][] = array(
						'product_id'  => $target_id,
						'lang'        => $lang,
						'location_id'  => $location_id,
						'stock'        => $stock,
						'message'      => sprintf( __( 'Stock location %d synchronisé vers %s (ID: %d)', 'afs-wcml-api' ), $location_id, strtoupper( $lang ), $target_id ),
					);
				} else {
					$result['errors'][] = sprintf( __( 'Erreur lors de la synchronisation du stock location %d vers %s (ID: %d)', 'afs-wcml-api' ), $location_id, strtoupper( $lang ), $target_id );
				}
			}
		}

		self::$syncing = false;
		$this->clear_translations_cache( $source_product_id );

		return $result;
	}

	/**
	 * Sync variation location stock.
	 *
	 * @param int $source_variation_id Source variation ID.
	 * @return array Result with 'success', 'synced', 'errors'.
	 */
	public function sync_variation_location_stock( $source_variation_id ) {
		return $this->sync_product_location_stock( $source_variation_id );
	}

	/**
	 * Hook: Product save.
	 *
	 * @param int $product_id Product ID.
	 */
	public function on_product_save( $product_id ) {
		if ( ! $this->is_auto_sync_enabled() ) {
			return;
		}

		$product = wc_get_product( $product_id );
		if ( ! $product || $product->is_type( 'variable' ) ) {
			return; // Skip variable products (variations handled separately).
		}

		$this->sync_product_location_stock( $product_id );
	}

	/**
	 * Hook: Variation save.
	 *
	 * @param int $variation_id Variation ID.
	 * @param int $i            Loop index (not used).
	 */
	public function on_variation_save( $variation_id, $i = 0 ) {
		if ( ! $this->is_auto_sync_enabled() ) {
			return;
		}

		$this->sync_variation_location_stock( $variation_id );
	}

	/**
	 * Hook: AJAX save variations.
	 *
	 * @param int $product_id Parent product ID.
	 */
	public function on_ajax_save_variations( $product_id ) {
		if ( ! $this->is_auto_sync_enabled() ) {
			return;
		}

		$product = wc_get_product( $product_id );
		if ( ! $product || ! $product->is_type( 'variable' ) ) {
			return;
		}

		// Get all variations.
		$variations = $product->get_children();

		foreach ( $variations as $variation_id ) {
			$this->sync_variation_location_stock( $variation_id );
		}
	}

	/**
	 * Hook: Post meta update for location stock.
	 *
	 * @param int    $meta_id    Meta ID.
	 * @param int    $post_id    Post ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 */
	public function on_location_stock_meta_update( $meta_id, $post_id, $meta_key, $meta_value ) {
		if ( ! $this->is_auto_sync_enabled() ) {
			return;
		}

		// Check if this is a location stock meta key.
		if ( strpos( $meta_key, 'wcmlim_stock_at_' ) !== 0 && strpos( $meta_key, 'wcmlim_stock_available_at_' ) !== 0 ) {
			return;
		}

		// Verify it's a product or variation.
		$post_type = get_post_type( $post_id );
		if ( $post_type !== 'product' && $post_type !== 'product_variation' ) {
			return;
		}

		// Sync the product/variation.
		$product = wc_get_product( $post_id );
		if ( $product ) {
			if ( $product->is_type( 'variation' ) ) {
				$this->sync_variation_location_stock( $post_id );
			} else {
				$this->sync_product_location_stock( $post_id );
			}
		}
	}

	/**
	 * Get products location stock comparison data.
	 *
	 * @param array $args Query arguments.
	 * @return array Products data with location stock comparison.
	 */
	public function get_products_location_stock_comparison( $args = array() ) {
		$defaults = array(
			'per_page'           => 20,
			'page'               => 1,
			'search'             => '',
			'product_type'       => '',
			'sync_status'        => '',
			'include_variations' => true,
		);

		$args = wp_parse_args( $args, $defaults );

		global $wpdb;

		// Get all locations (only Europe 2682 and North America 2683).
		// Force filter to ensure only allowed locations.
		$all_locations = $this->get_all_locations();
		$allowed_locations = array( 2682, 2683 );
		$locations = array_intersect( $all_locations, $allowed_locations );
		
		// If empty, use allowed locations as fallback.
		if ( empty( $locations ) ) {
			$locations = $allowed_locations;
		}
		
		// Sort locations.
		sort( $locations );
		
		if ( empty( $locations ) ) {
			return array(
				'products' => array(),
				'total'    => 0,
				'pages'    => 1,
				'current_page' => 1,
				'synced_count' => 0,
				'unsynced_count' => 0,
				'locations' => array(),
			);
		}

		// Get default language.
		$default_lang = apply_filters( 'wpml_default_language', 'en' );
		$languages = apply_filters( 'wpml_active_languages', array() );

		// Build query to get source products.
		$icl_table = $wpdb->prefix . 'icl_translations';
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '{$icl_table}'" ) === $icl_table;

		$offset = ( $args['page'] - 1 ) * $args['per_page'];

		if ( $table_exists ) {
			// Get source products only (WPML active).
			$where_clauses = array(
				"p.post_type IN ('product', 'product_variation')",
				"p.post_status IN ('publish', 'private')",
			);

			if ( ! $args['include_variations'] ) {
				$where_clauses[] = "p.post_type = 'product'";
			}

			// Source language filter.
			$where_clauses[] = "(t.element_id IS NULL OR t.source_language_code IS NULL)";

			if ( ! empty( $args['search'] ) ) {
				$search_term = '%' . $wpdb->esc_like( $args['search'] ) . '%';
				$where_clauses[] = $wpdb->prepare( "(p.post_title LIKE %s OR p.ID = %d)", $search_term, absint( $args['search'] ) );
			}

			$where_sql = implode( ' AND ', $where_clauses );

			$base_sql = "
				SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				LEFT JOIN {$icl_table} t ON p.ID = t.element_id
					AND t.element_type IN ('post_product', 'post_product_variation')
				WHERE {$where_sql}
				ORDER BY p.ID DESC
			";

			// Get total count.
			$count_sql = "SELECT COUNT(*) FROM ({$base_sql}) as total_query";
			$total = (int) $wpdb->get_var( $count_sql );

			// Get batch.
			$paginated_sql = $base_sql . " LIMIT %d OFFSET %d";
			$product_ids = $wpdb->get_col( $wpdb->prepare( $paginated_sql, $args['per_page'], $offset ) );
		} else {
			// WPML not active - standard query.
			$where_clauses = array(
				"p.post_type IN ('product', 'product_variation')",
				"p.post_status IN ('publish', 'private')",
			);

			if ( ! $args['include_variations'] ) {
				$where_clauses[] = "p.post_type = 'product'";
			}

			if ( ! empty( $args['search'] ) ) {
				$search_term = '%' . $wpdb->esc_like( $args['search'] ) . '%';
				$where_clauses[] = $wpdb->prepare( "(p.post_title LIKE %s OR p.ID = %d)", $search_term, absint( $args['search'] ) );
			}

			$where_sql = implode( ' AND ', $where_clauses );

			$base_sql = "
				SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				WHERE {$where_sql}
				ORDER BY p.ID DESC
			";

			$count_sql = "SELECT COUNT(*) FROM ({$base_sql}) as total_query";
			$total = (int) $wpdb->get_var( $count_sql );

			$paginated_sql = $base_sql . " LIMIT %d OFFSET %d";
			$product_ids = $wpdb->get_col( $wpdb->prepare( $paginated_sql, $args['per_page'], $offset ) );
		}

		$products = array();
		$synced_count = 0;
		$unsynced_count = 0;

		foreach ( $product_ids as $product_id ) {
			$product = wc_get_product( $product_id );
			if ( ! $product ) {
				continue;
			}

			$is_variation = $product->is_type( 'variation' );
			$translations = $this->get_product_translations( $product_id, $is_variation );

			// Get source product (default language or first available).
			$source_id = isset( $translations[ $default_lang ] ) ? $translations[ $default_lang ] : $product_id;

			// Build frontend URLs for all languages.
			$frontend_urls = array();
			$frontend_urls[ $default_lang ] = $this->get_product_frontend_url( $source_id, $default_lang );
			foreach ( $translations as $lang_code => $trans_id ) {
				if ( $lang_code !== $default_lang ) {
					$frontend_urls[ $lang_code ] = $this->get_product_frontend_url( $trans_id, $lang_code );
				}
			}

			$product_data = array(
				'product_id'   => $product_id,
				'product_name' => $product->get_name(),
				'product_type' => $product->get_type(),
				'is_variation' => $is_variation,
				'edit_url'     => get_edit_post_link( $product_id, 'raw' ),
				'frontend_urls' => $frontend_urls,
				'locations'    => array(),
				'is_synced'    => true,
			);

			// Get parent name for variations.
			if ( $is_variation ) {
				$parent_id = $product->get_parent_id();
				if ( $parent_id ) {
					$parent = wc_get_product( $parent_id );
					if ( $parent ) {
						$product_data['parent_name'] = $parent->get_name();
					}
				}
			}

			// Check sync status for each location (only Europe 2682 and North America 2683).
			$allowed_locations = array( 2682, 2683 );
			foreach ( $locations as $location_id ) {
				// Skip if location is not in allowed list.
				if ( ! in_array( (int) $location_id, $allowed_locations, true ) ) {
					continue;
				}
				
				$source_stock = $this->get_location_stock( $source_id, $location_id );
				$source_available = $this->get_location_available_stock( $source_id, $location_id );

				$location_data = array(
					'location_id' => $location_id,
					'source'     => array(
						'stock'        => $source_stock,
						'available'    => $source_available,
					),
					'translations' => array(),
					'is_synced'    => true,
				);

				// Check translations.
				foreach ( $translations as $lang => $trans_id ) {
					if ( (int) $trans_id === (int) $source_id ) {
						continue; // Skip source.
					}

					$trans_stock = $this->get_location_stock( $trans_id, $location_id );
					$trans_available = $this->get_location_available_stock( $trans_id, $location_id );

					$is_synced = ( $trans_stock === $source_stock && $trans_available === $source_available );

					$location_data['translations'][ $lang ] = array(
						'product_id' => $trans_id,
						'stock'      => $trans_stock,
						'available'  => $trans_available,
						'is_synced'  => $is_synced,
					);

					if ( ! $is_synced ) {
						$location_data['is_synced'] = false;
						$product_data['is_synced'] = false;
					}
				}

				$product_data['locations'][] = $location_data;
			}

			// Filter by sync status if requested.
			if ( $args['sync_status'] === 'synced' && ! $product_data['is_synced'] ) {
				continue;
			}
			if ( $args['sync_status'] === 'not_synced' && $product_data['is_synced'] ) {
				continue;
			}

			// Filter by product type if requested.
			if ( ! empty( $args['product_type'] ) ) {
				if ( $args['product_type'] === 'simple' && $product_data['product_type'] !== 'simple' ) {
					continue;
				}
				if ( $args['product_type'] === 'variable' && $product_data['product_type'] !== 'variable' ) {
					continue;
				}
				if ( $args['product_type'] === 'variation' && ! $product_data['is_variation'] ) {
					continue;
				}
			}

			if ( $product_data['is_synced'] ) {
				$synced_count++;
			} else {
				$unsynced_count++;
			}

			$products[] = $product_data;
		}

		$pages = ceil( $total / $args['per_page'] );

		return array(
			'products'      => $products,
			'total'        => $total,
			'pages'        => $pages,
			'current_page' => $args['page'],
			'synced_count' => $synced_count,
			'unsynced_count' => $unsynced_count,
			'locations'    => $locations,
			'languages'    => array_keys( $languages ),
			'default_lang' => $default_lang,
		);
	}

	/**
	 * AJAX: Sync product location stock.
	 */
	public function ajax_sync_product_location_stock() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'afs_wcml_sync_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Nonce invalide. Veuillez recharger la page.', 'afs-wcml-api' ) ) );
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
			return;
		}

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => __( 'ID de produit invalide.', 'afs-wcml-api' ) ) );
			return;
		}

		$result = $this->sync_product_location_stock( $product_id );

		if ( $result['success'] ) {
			wp_send_json_success( $result );
		} else {
			wp_send_json_error( $result );
		}
	}

	/**
	 * AJAX: Sync all products location stock.
	 */
	public function ajax_sync_all_location_stock() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'afs_wcml_sync_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Nonce invalide. Veuillez recharger la page.', 'afs-wcml-api' ) ) );
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
			return;
		}

		$batch_size = isset( $_POST['batch_size'] ) ? absint( $_POST['batch_size'] ) : 50;
		$offset = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0;

		global $wpdb;

		// Get source products.
		$icl_table = $wpdb->prefix . 'icl_translations';
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '{$icl_table}'" ) === $icl_table;

		if ( $table_exists ) {
			$sql = "
				SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				LEFT JOIN {$icl_table} t ON p.ID = t.element_id
					AND t.element_type IN ('post_product', 'post_product_variation')
				WHERE p.post_type IN ('product', 'product_variation')
				AND p.post_status IN ('publish', 'private')
				AND (t.element_id IS NULL OR t.source_language_code IS NULL)
				ORDER BY p.ID DESC
				LIMIT %d OFFSET %d
			";
			$product_ids = $wpdb->get_col( $wpdb->prepare( $sql, $batch_size, $offset ) );
		} else {
			$sql = "
				SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				WHERE p.post_type IN ('product', 'product_variation')
				AND p.post_status IN ('publish', 'private')
				ORDER BY p.ID DESC
				LIMIT %d OFFSET %d
			";
			$product_ids = $wpdb->get_col( $wpdb->prepare( $sql, $batch_size, $offset ) );
		}

		$results = array(
			'synced'     => array(),
			'errors'     => array(),
			'processed'  => count( $product_ids ),
			'has_more'   => count( $product_ids ) === $batch_size,
		);

		foreach ( $product_ids as $product_id ) {
			$result = $this->sync_product_location_stock( $product_id );
			$results['synced'] = array_merge( $results['synced'], $result['synced'] );
			$results['errors'] = array_merge( $results['errors'], $result['errors'] );
		}

		wp_send_json_success( $results );
	}

	/**
	 * AJAX: Get products location stock comparison.
	 */
	public function ajax_get_products_location_stock_comparison() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'afs_wcml_sync_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Nonce invalide. Veuillez recharger la page.', 'afs-wcml-api' ) ) );
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
			return;
		}

		$args = array(
			'per_page'           => isset( $_POST['per_page'] ) ? absint( $_POST['per_page'] ) : 20,
			'page'               => isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1,
			'search'             => isset( $_POST['search'] ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : '',
			'product_type'       => isset( $_POST['product_type'] ) ? sanitize_text_field( wp_unslash( $_POST['product_type'] ) ) : '',
			'sync_status'        => isset( $_POST['sync_status'] ) ? sanitize_text_field( wp_unslash( $_POST['sync_status'] ) ) : '',
			'include_variations' => isset( $_POST['include_variations'] ) ? (bool) $_POST['include_variations'] : true,
		);

		$data = $this->get_products_location_stock_comparison( $args );

		wp_send_json_success( $data );
	}

	/**
	 * AJAX: Get location stock sync status.
	 */
	public function ajax_get_location_stock_sync_status() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'afs_wcml_sync_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Nonce invalide. Veuillez recharger la page.', 'afs-wcml-api' ) ) );
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
			return;
		}

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => __( 'ID de produit invalide.', 'afs-wcml-api' ) ) );
			return;
		}

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			wp_send_json_error( array( 'message' => __( 'Produit introuvable.', 'afs-wcml-api' ) ) );
			return;
		}

		$is_variation = $product->is_type( 'variation' );
		$translations = $this->get_product_translations( $product_id, $is_variation );
		
		// Get all locations (only Europe 2682 and North America 2683).
		// Force filter to ensure only allowed locations.
		$all_locations = $this->get_all_locations();
		$allowed_locations = array( 2682, 2683 );
		$locations = array_intersect( $all_locations, $allowed_locations );
		
		// If empty, use allowed locations as fallback.
		if ( empty( $locations ) ) {
			$locations = $allowed_locations;
		}
		
		// Sort locations.
		sort( $locations );
		
		$default_lang = apply_filters( 'wpml_default_language', 'en' );
		$source_id = isset( $translations[ $default_lang ] ) ? $translations[ $default_lang ] : $product_id;

		$status = array(
			'product_id'   => $product_id,
			'is_synced'    => true,
			'locations'    => array(),
		);

		// Only process allowed locations (Europe 2682 and North America 2683).
		$allowed_locations = array( 2682, 2683 );
		foreach ( $locations as $location_id ) {
			// Skip if location is not in allowed list.
			if ( ! in_array( (int) $location_id, $allowed_locations, true ) ) {
				continue;
			}
			
			$source_stock = $this->get_location_stock( $source_id, $location_id );
			$source_available = $this->get_location_available_stock( $source_id, $location_id );

			$location_status = array(
				'location_id' => $location_id,
				'is_synced'   => true,
				'translations' => array(),
			);

			foreach ( $translations as $lang => $trans_id ) {
				if ( (int) $trans_id === (int) $source_id ) {
					continue;
				}

				$trans_stock = $this->get_location_stock( $trans_id, $location_id );
				$trans_available = $this->get_location_available_stock( $trans_id, $location_id );

				$is_synced = ( $trans_stock === $source_stock && $trans_available === $source_available );

				$location_status['translations'][ $lang ] = array(
					'product_id' => $trans_id,
					'stock'      => $trans_stock,
					'available'  => $trans_available,
					'is_synced'  => $is_synced,
				);

				if ( ! $is_synced ) {
					$location_status['is_synced'] = false;
					$status['is_synced'] = false;
				}
			}

			$status['locations'][] = $location_status;
		}

		wp_send_json_success( $status );
	}

	/**
	 * AJAX: Save location stock sync settings.
	 */
	public function ajax_save_location_stock_sync_settings() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'afs_wcml_sync_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Nonce invalide. Veuillez recharger la page.', 'afs-wcml-api' ) ) );
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
			return;
		}

		$auto_sync = isset( $_POST['auto_sync'] ) && (bool) $_POST['auto_sync'];

		$this->set_auto_sync( $auto_sync );

		wp_send_json_success( array(
			'message' => __( 'Paramètres sauvegardés avec succès.', 'afs-wcml-api' ),
		) );
	}
}
