<?php
/**
 * ACF Fields Synchronization class for WCML multi-language support.
 *
 * Handles synchronization of ACF fields between product translations.
 * Supports both copy mode and translation mode.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_ACF_Sync class.
 */
class AFS_WCML_ACF_Sync {

	/**
	 * Option name for sync settings.
	 *
	 * @var string
	 */
	const OPTION_SYNC_FIELDS = 'afs_wcml_acf_sync_fields';

	/**
	 * Option name for auto-sync.
	 *
	 * @var string
	 */
	const OPTION_AUTO_SYNC = 'afs_wcml_acf_auto_sync_enabled';

	/**
	 * Flag to prevent infinite loops during sync.
	 *
	 * @var bool
	 */
	private static $syncing = false;

	/**
	 * Cache for product translations.
	 *
	 * @var array
	 */
	private static $translations_cache = array();

	/**
	 * Cache for ACF field values.
	 *
	 * @var array
	 */
	private static $acf_values_cache = array();

	/**
	 * Cache for field definitions.
	 *
	 * @var array
	 */
	private static $field_definitions_cache = array();

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
		// AJAX handlers.
		add_action( 'wp_ajax_afs_wcml_sync_product_acf', array( $this, 'ajax_sync_product_acf' ) );
		add_action( 'wp_ajax_afs_wcml_sync_all_acf', array( $this, 'ajax_sync_all_acf' ) );
		add_action( 'wp_ajax_afs_wcml_get_products_acf_comparison', array( $this, 'ajax_get_products_acf_comparison' ) );
		add_action( 'wp_ajax_afs_wcml_get_acf_sync_status', array( $this, 'ajax_get_acf_sync_status' ) );
		add_action( 'wp_ajax_afs_wcml_save_acf_sync_settings', array( $this, 'ajax_save_acf_sync_settings' ) );
		add_action( 'wp_ajax_afs_wcml_save_acf_field', array( $this, 'ajax_save_acf_field' ) );
	}

	/**
	 * Get ACF fields for a post type.
	 *
	 * @param string $post_type Post type.
	 * @return array Array of field data.
	 */
	public function get_acf_fields_for_post_type( $post_type ) {
		if ( ! function_exists( 'acf_get_field_groups' ) ) {
			return array();
		}

		$field_groups = acf_get_field_groups( array( 'post_type' => $post_type ) );
		$fields = array();

		foreach ( $field_groups as $group ) {
			$group_fields = acf_get_fields( $group );
			if ( $group_fields ) {
				foreach ( $group_fields as $field ) {
					$fields[ $field['key'] ] = array(
						'key'  => $field['key'],
						'name' => $field['name'],
						'label' => $field['label'],
						'type' => $field['type'],
					);
				}
			}
		}

		return $fields;
	}

	/**
	 * Get all ACF fields for products and variations.
	 *
	 * @return array Array with 'product' and 'variation' keys.
	 */
	public function get_all_acf_fields() {
		return array(
			'product' => $this->get_acf_fields_for_post_type( 'product' ),
			'variation' => $this->get_acf_fields_for_post_type( 'product_variation' ),
		);
	}

	/**
	 * Get product translations.
	 *
	 * @param int  $product_id Product ID.
	 * @param bool $is_variation Whether it's a variation.
	 * @return array Array of translations ['lang' => product_id].
	 */
	public function get_product_translations( $product_id, $is_variation = false ) {
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

		$post_type = get_post_type( $product_id );
		if ( $post_type === 'product_variation' || $is_variation ) {
			$element_type = 'post_product_variation';
		} else {
			$element_type = 'post_product';
		}

		$trid = apply_filters( 'wpml_element_trid', null, $product_id, $element_type );

		if ( ! $trid ) {
			self::$translations_cache[ $cache_key ] = array();
			return array();
		}

		$all_translations = apply_filters( 'wpml_get_element_translations', array(), $trid, $element_type );

		foreach ( $all_translations as $lang => $translation ) {
			if ( isset( $translation->element_id ) ) {
				$translations[ $lang ] = (int) $translation->element_id;
			}
		}

		self::$translations_cache[ $cache_key ] = $translations;

		return $translations;
	}

	/**
	 * Clear translations cache.
	 *
	 * @param int|null $product_id Optional product ID.
	 */
	public function clear_translations_cache( $product_id = null ) {
		if ( $product_id ) {
			unset( self::$translations_cache[ $product_id . '_var' ] );
			unset( self::$translations_cache[ $product_id . '_prod' ] );
			// Clear ACF values cache for this product and its translations.
			$translations = $this->get_product_translations( $product_id, false );
			$translations = array_merge( $translations, $this->get_product_translations( $product_id, true ) );
			foreach ( $translations as $trans_id ) {
				foreach ( array_keys( self::$acf_values_cache ) as $cache_key ) {
					if ( strpos( $cache_key, (string) $trans_id . '_' ) === 0 ) {
						unset( self::$acf_values_cache[ $cache_key ] );
					}
				}
			}
		} else {
			self::$translations_cache = array();
			self::$acf_values_cache = array();
		}
	}

	/**
	 * Get ACF field value (optimized with cache).
	 *
	 * @param string $field_key Field key.
	 * @param int    $post_id   Post ID.
	 * @return mixed Field value.
	 */
	private function get_acf_field_value( $field_key, $post_id ) {
		// Check cache first.
		$cache_key = $post_id . '_' . $field_key;
		if ( isset( self::$acf_values_cache[ $cache_key ] ) ) {
			return self::$acf_values_cache[ $cache_key ];
		}

		$value = null;

		// Use direct post meta query (much faster than get_field).
		// ACF stores values with field key as meta key.
		if ( function_exists( 'get_post_meta' ) ) {
			$value = get_post_meta( $post_id, $field_key, true );
		}

		// If empty, try with field name.
		if ( empty( $value ) && function_exists( 'acf_get_field' ) ) {
			// Cache field definition.
			if ( ! isset( self::$field_definitions_cache[ $field_key ] ) ) {
				self::$field_definitions_cache[ $field_key ] = acf_get_field( $field_key );
			}
			$field_obj = self::$field_definitions_cache[ $field_key ];

			if ( $field_obj && isset( $field_obj['name'] ) ) {
				$value = get_post_meta( $post_id, $field_obj['name'], true );
			}
		}

		// Fallback to get_field only if still empty (slower).
		if ( empty( $value ) && function_exists( 'get_field' ) ) {
			$value = get_field( $field_key, $post_id, false );
		}

		// Cache the value.
		self::$acf_values_cache[ $cache_key ] = $value;

		return $value;
	}

	/**
	 * Get multiple ACF field values at once (batch optimization).
	 *
	 * @param array $field_keys Array of field keys.
	 * @param int   $post_id    Post ID.
	 * @return array Array of field values keyed by field_key.
	 */
	private function get_acf_field_values_batch( $field_keys, $post_id ) {
		$values = array();
		$missing_keys = array();

		// Check cache first.
		foreach ( $field_keys as $field_key ) {
			$cache_key = $post_id . '_' . $field_key;
			if ( isset( self::$acf_values_cache[ $cache_key ] ) ) {
				$values[ $field_key ] = self::$acf_values_cache[ $cache_key ];
			} else {
				$missing_keys[] = $field_key;
			}
		}

		if ( empty( $missing_keys ) ) {
			return $values;
		}

		// Get all meta at once for this post (single query).
		global $wpdb;
		$meta_keys_to_query = array();
		$field_name_map = array();

		foreach ( $missing_keys as $field_key ) {
			$meta_keys_to_query[] = $field_key;
			
			// Also get field name if available.
			if ( function_exists( 'acf_get_field' ) ) {
				if ( ! isset( self::$field_definitions_cache[ $field_key ] ) ) {
					self::$field_definitions_cache[ $field_key ] = acf_get_field( $field_key );
				}
				$field_obj = self::$field_definitions_cache[ $field_key ];
				if ( $field_obj && isset( $field_obj['name'] ) && $field_obj['name'] !== $field_key ) {
					$field_name_map[ $field_obj['name'] ] = $field_key;
					$meta_keys_to_query[] = $field_obj['name'];
				}
			}
		}

		if ( ! empty( $meta_keys_to_query ) ) {
			// Build safe SQL query with proper escaping.
			$placeholders = implode( ',', array_fill( 0, count( $meta_keys_to_query ), '%s' ) );
			$query = "SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key IN ($placeholders)";
			$query_params = array_merge( array( $post_id ), $meta_keys_to_query );
			$meta_rows = $wpdb->get_results( $wpdb->prepare( $query, $query_params ) );

			foreach ( $meta_rows as $row ) {
				$field_key = $row->meta_key;
				// If this is a field name, map it back to field key.
				if ( isset( $field_name_map[ $field_key ] ) ) {
					$field_key = $field_name_map[ $field_key ];
				}

				if ( in_array( $field_key, $missing_keys, true ) ) {
					$value = maybe_unserialize( $row->meta_value );
					$values[ $field_key ] = $value;
					// Cache it.
					$cache_key = $post_id . '_' . $field_key;
					self::$acf_values_cache[ $cache_key ] = $value;
				}
			}
		}

		// Fill missing values with null.
		foreach ( $missing_keys as $field_key ) {
			if ( ! isset( $values[ $field_key ] ) ) {
				$values[ $field_key ] = null;
				$cache_key = $post_id . '_' . $field_key;
				self::$acf_values_cache[ $cache_key ] = null;
			}
		}

		return $values;
	}

	/**
	 * Update ACF field value.
	 *
	 * @param string $field_key Field key.
	 * @param mixed  $value     Field value.
	 * @param int    $post_id   Post ID.
	 * @return bool Success.
	 */
	private function update_acf_field_value( $field_key, $value, $post_id ) {
		if ( ! function_exists( 'update_field' ) ) {
			// Fallback to direct post meta update.
			return update_post_meta( $post_id, $field_key, $value );
		}

		$result = update_field( $field_key, $value, $post_id );
		
		// If update_field returns false but value is empty, it might be intentional.
		// Try direct post meta update as fallback.
		if ( $result === false && empty( $value ) ) {
			// For empty values, delete the meta.
			return delete_post_meta( $post_id, $field_key );
		}
		
		// If update_field failed, try direct post meta update.
		if ( $result === false ) {
			$result = update_post_meta( $post_id, $field_key, $value );
		}
		
		return $result;
	}

	/**
	 * Compare ACF field values.
	 *
	 * @param mixed $value1 First value.
	 * @param mixed $value2 Second value.
	 * @return bool True if values match.
	 */
	private function compare_field_values( $value1, $value2 ) {
		// Handle null/empty cases.
		if ( empty( $value1 ) && empty( $value2 ) ) {
			return true;
		}

		if ( empty( $value1 ) || empty( $value2 ) ) {
			return false;
		}

		// Serialize for comparison (handles arrays, objects, etc.).
		return serialize( $value1 ) === serialize( $value2 );
	}

	/**
	 * Get sync settings.
	 *
	 * @return array Settings array.
	 */
	public function get_sync_settings() {
		$defaults = array(
			'fields' => array(),
			'auto_sync' => false,
		);

		$settings = get_option( self::OPTION_SYNC_FIELDS, array() );
		return wp_parse_args( $settings, $defaults );
	}

	/**
	 * Save sync settings.
	 *
	 * @param array $settings Settings array.
	 */
	public function save_sync_settings( $settings ) {
		update_option( self::OPTION_SYNC_FIELDS, $settings );
	}

	/**
	 * Check if auto-sync is enabled.
	 *
	 * @return bool
	 */
	public function is_auto_sync_enabled() {
		return (bool) get_option( self::OPTION_AUTO_SYNC, false );
	}

	/**
	 * Set auto-sync.
	 *
	 * @param bool $enabled Whether to enable.
	 */
	public function set_auto_sync( $enabled ) {
		update_option( self::OPTION_AUTO_SYNC, (bool) $enabled );
	}

	/**
	 * Get sync status for a product.
	 *
	 * @param int $product_id Product ID.
	 * @return array Status data.
	 */
	public function get_sync_status( $product_id ) {
		$post_type = get_post_type( $product_id );
		$is_variation = ( $post_type === 'product_variation' );

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return array(
				'is_synced' => false,
				'fields_status' => array(),
			);
		}

		$settings = $this->get_sync_settings();
		$fields_to_check = isset( $settings['fields'] ) ? $settings['fields'] : array();

		// Only check configured fields. If none configured, return not synced.
		if ( empty( $fields_to_check ) ) {
			return array(
				'is_synced' => false,
				'fields_status' => array(),
			);
		}

		$translations = $this->get_product_translations( $product_id, $is_variation );
		$is_synced = true;
		$fields_status = array();

		foreach ( $fields_to_check as $field_key ) {
			$source_value = $this->get_acf_field_value( $field_key, $product_id );
			$field_synced = true;

			foreach ( $translations as $lang => $trans_id ) {
				if ( (int) $trans_id === (int) $product_id ) {
					continue;
				}

				$trans_value = $this->get_acf_field_value( $field_key, $trans_id );
				if ( ! $this->compare_field_values( $source_value, $trans_value ) ) {
					$field_synced = false;
					$is_synced = false;
					break;
				}
			}

			$fields_status[ $field_key ] = $field_synced;
		}

		return array(
			'is_synced' => $is_synced,
			'fields_status' => $fields_status,
		);
	}

	/**
	 * Sync ACF fields for a product.
	 *
	 * @param int    $product_id   Product ID.
	 * @param array  $fields_to_sync Optional. Specific fields to sync. If empty, uses settings.
	 * @param string $sync_mode    'copy' or 'translate'. Default 'copy'.
	 * @return array Result array.
	 */
	public function sync_product_acf_fields( $product_id, $fields_to_sync = array(), $sync_mode = 'copy' ) {
		$result = array(
			'success' => true,
			'synced'  => array(),
			'errors'  => array(),
		);

		if ( self::$syncing ) {
			return $result;
		}

		$post_type = get_post_type( $product_id );
		$is_variation = ( $post_type === 'product_variation' );

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			$result['success'] = false;
			$result['errors'][] = sprintf( __( 'Produit %d introuvable.', 'afs-wcml-api' ), $product_id );
			return $result;
		}

		$translations = $this->get_product_translations( $product_id, $is_variation );

		if ( count( $translations ) <= 1 ) {
			return $result;
		}

		// Get fields to sync from settings or parameter.
		if ( empty( $fields_to_sync ) ) {
			$settings = $this->get_sync_settings();
			$fields_to_sync = isset( $settings['fields'] ) ? $settings['fields'] : array();
		}

		// Only sync if fields are configured.
		if ( empty( $fields_to_sync ) ) {
			$result['errors'][] = __( 'Aucun champ ACF configuré pour la synchronisation. Veuillez sélectionner des champs dans les paramètres.', 'afs-wcml-api' );
			$result['success'] = false;
			return $result;
		}

		self::$syncing = true;

		foreach ( $translations as $lang => $target_id ) {
			if ( (int) $target_id === (int) $product_id ) {
				continue;
			}

			if ( get_post_status( $target_id ) === false ) {
				continue;
			}

			foreach ( $fields_to_sync as $field_key ) {
				$source_value = $this->get_acf_field_value( $field_key, $product_id );

				if ( $sync_mode === 'translate' && function_exists( 'icl_translate' ) ) {
					// Try to translate if WPML translation function exists.
					// For now, we'll copy the value. Translation can be enhanced later.
					$target_value = $source_value;
				} else {
					$target_value = $source_value;
				}

				// Handle special field types.
				if ( is_array( $source_value ) ) {
					// For repeater fields and groups, we need to handle them specially.
					$target_value = $this->sync_complex_field( $field_key, $source_value, $target_id );
				} else {
					$this->update_acf_field_value( $field_key, $target_value, $target_id );
				}

				$result['synced'][] = array(
					'product_id' => $target_id,
					'lang'       => $lang,
					'field'      => $field_key,
					'message'    => sprintf( __( 'Champ %s synchronisé vers %s (ID: %d)', 'afs-wcml-api' ), $field_key, strtoupper( $lang ), $target_id ),
				);
			}
		}

		self::$syncing = false;
		$this->clear_translations_cache( $product_id );

		return $result;
	}

	/**
	 * Sync complex ACF field (repeater, group, etc.).
	 *
	 * @param string $field_key Field key.
	 * @param mixed  $value     Field value.
	 * @param int    $target_id Target post ID.
	 * @return mixed Synced value.
	 */
	private function sync_complex_field( $field_key, $value, $target_id ) {
		// For now, just copy the value directly.
		// ACF handles complex fields internally.
		$this->update_acf_field_value( $field_key, $value, $target_id );
		return $value;
	}

	/**
	 * Get products ACF comparison.
	 *
	 * @param array $args Query arguments.
	 * @return array Products with ACF comparison.
	 */
	public function get_products_acf_comparison( $args = array() ) {
		global $wpdb;

		$defaults = array(
			'per_page'           => 20, // Reduced default to avoid timeouts.
			'page'               => 1,
			'product_type'        => '',
			'sync_status'         => '',
			'search'              => '',
			'include_variations'  => true,
		);

		$args = wp_parse_args( $args, $defaults );

		$languages = apply_filters( 'wpml_active_languages', array() );
		$default_lang = apply_filters( 'wpml_default_language', 'en' );

		// Get post types.
		$post_types = array( "'product'" );
		if ( $args['include_variations'] ) {
			$post_types[] = "'product_variation'";
		}

		if ( ! empty( $args['product_type'] ) ) {
			if ( $args['product_type'] === 'variation' ) {
				$post_types = array( "'product_variation'" );
			} else {
				$post_types = array( "'product'" );
			}
		}

		$post_types_sql = implode( ',', $post_types );

		// Build query to get source products.
		$icl_table = $wpdb->prefix . 'icl_translations';
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '{$icl_table}'" ) === $icl_table;

		if ( $table_exists ) {
			$base_sql = "
				SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				LEFT JOIN {$icl_table} t ON p.ID = t.element_id
					AND t.element_type IN ('post_product', 'post_product_variation')
				WHERE p.post_type IN ({$post_types_sql})
				AND p.post_status IN ('publish', 'private')
				AND (
					t.element_id IS NULL
					OR t.source_language_code IS NULL
				)
			";
			$sql_args = array();
		} else {
			$base_sql = "
				SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				WHERE p.post_type IN ({$post_types_sql})
				AND p.post_status IN ('publish', 'private')
			";
			$sql_args = array();
		}

		// Add product type filter.
		if ( ! empty( $args['product_type'] ) && $args['product_type'] !== 'variation' ) {
			$base_sql .= " AND EXISTS (
				SELECT 1 FROM {$wpdb->term_relationships} tr
				INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
				INNER JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
				WHERE tr.object_id = p.ID
				AND tt.taxonomy = 'product_type'
				AND t.slug = %s
			)";
			$sql_args[] = $args['product_type'];
		}

		// Add search filter.
		if ( ! empty( $args['search'] ) ) {
			$search_term = '%' . $wpdb->esc_like( $args['search'] ) . '%';
			$base_sql .= " AND p.post_title LIKE %s";
			$sql_args[] = $search_term;
		}

		$base_sql .= " ORDER BY p.ID DESC";

		// Get total count.
		$count_sql = "SELECT COUNT(*) FROM ({$base_sql}) as total_query";
		if ( ! empty( $sql_args ) ) {
			$total_products = (int) $wpdb->get_var( $wpdb->prepare( $count_sql, $sql_args ) );
		} else {
			$total_products = (int) $wpdb->get_var( $count_sql );
		}

		// If filtering by sync status, we need to get more products and filter after.
		// This is because sync status is determined after loading product details.
		$fetch_multiplier = ! empty( $args['sync_status'] ) ? 5 : 1;
		$fetch_per_page = $args['per_page'] * $fetch_multiplier;
		$offset = ( $args['page'] - 1 ) * $args['per_page'];

		// For sync status filtering, we need a different approach.
		if ( ! empty( $args['sync_status'] ) ) {
			// Get all products without pagination first, then filter.
			$paginated_sql = $base_sql;
		} else {
			$paginated_sql = $base_sql . " LIMIT %d OFFSET %d";
			$sql_args[] = $fetch_per_page;
			$sql_args[] = $offset;
		}

		if ( ! empty( $sql_args ) ) {
			$product_ids = $wpdb->get_col( $wpdb->prepare( $paginated_sql, $sql_args ) );
		} else {
			$product_ids = $wpdb->get_col( $paginated_sql );
		}

		$products = array();
		$filtered_count = 0;
		$settings = $this->get_sync_settings();
		$fields_to_check = isset( $settings['fields'] ) ? $settings['fields'] : array();

		// Only process products if fields are configured.
		// This ensures we only work with explicitly selected fields.
		if ( empty( $fields_to_check ) ) {
			return array(
				'products'     => array(),
				'total'        => 0,
				'pages'        => 0,
				'current_page' => $args['page'],
				'per_page'     => $args['per_page'],
				'languages'    => array_keys( $languages ),
			);
		}

		foreach ( $product_ids as $product_id ) {
			$product_data = $this->get_product_acf_details( (int) $product_id, $fields_to_check, $languages, $default_lang );

			if ( ! $product_data ) {
				continue;
			}

			// Filter by sync status.
			if ( ! empty( $args['sync_status'] ) ) {
				if ( $args['sync_status'] === 'synced' && ! $product_data['is_synced'] ) {
					continue;
				}
				if ( $args['sync_status'] === 'not_synced' && $product_data['is_synced'] ) {
					continue;
				}
			}

			$filtered_count++;

			// Apply pagination for sync status filtered results.
			if ( ! empty( $args['sync_status'] ) ) {
				if ( $filtered_count <= $offset ) {
					continue;
				}
				if ( count( $products ) >= $args['per_page'] ) {
					continue; // Continue counting but don't add more products.
				}
			}

			$products[] = $product_data;
		}

		// Adjust total count for sync status filter.
		if ( ! empty( $args['sync_status'] ) ) {
			$total_products = $filtered_count;
		}

		return array(
			'products'     => $products,
			'total'        => $total_products,
			'pages'        => ceil( $total_products / $args['per_page'] ),
			'current_page' => $args['page'],
			'per_page'     => $args['per_page'],
			'languages'    => array_keys( $languages ),
		);
	}

	/**
	 * Get product ACF details.
	 *
	 * @param int    $product_id   Product ID.
	 * @param array  $fields_to_check Fields to check.
	 * @param array  $languages    Languages.
	 * @param string $default_lang Default language.
	 * @return array|null Product data.
	 */
	public function get_product_acf_details( $product_id, $fields_to_check = array(), $languages = null, $default_lang = null ) {
		$post_type = get_post_type( $product_id );
		$is_variation = ( $post_type === 'product_variation' );

		if ( $languages === null ) {
			$languages = apply_filters( 'wpml_active_languages', array() );
		}
		if ( $default_lang === null ) {
			$default_lang = apply_filters( 'wpml_default_language', 'en' );
		}

		// Only use configured fields if settings exist.
		// If no fields configured, return empty (don't show all fields).
		if ( empty( $fields_to_check ) ) {
			// Return null to skip this product if no fields are configured.
			// This ensures we only work with explicitly selected fields.
			return null;
		}

		$translations = $this->get_product_translations( $product_id, $is_variation );

		// Find the source product ID (in default language).
		$source_product_id = $product_id;
		$current_lang = null;

		// Check if current product is in default language.
		if ( function_exists( 'apply_filters' ) ) {
			$current_lang = apply_filters( 'wpml_element_language_code', null, array(
				'element_id' => $product_id,
				'element_type' => $is_variation ? 'post_product_variation' : 'post_product',
			) );

			// If current product is not in default language, find the source.
			if ( $current_lang !== $default_lang ) {
				// Find source product in translations.
				foreach ( $translations as $lang => $trans_id ) {
					$trans_lang = apply_filters( 'wpml_element_language_code', null, array(
						'element_id' => $trans_id,
						'element_type' => $is_variation ? 'post_product_variation' : 'post_product',
					) );
					if ( $trans_lang === $default_lang ) {
						$source_product_id = $trans_id;
						break;
					}
				}
			}
		}

		// Get source product.
		$product = wc_get_product( $source_product_id );
		if ( ! $product ) {
			return null;
		}

		// Get source ACF values (from default language product) - batch optimized.
		$source_acf = array();
		$field_labels = array();

		// Get all field values at once (single query optimization).
		$source_acf = $this->get_acf_field_values_batch( $fields_to_check, $source_product_id );

		// Get field labels (cached).
		foreach ( $fields_to_check as $field_key ) {
			if ( ! isset( $field_labels[ $field_key ] ) ) {
				if ( function_exists( 'acf_get_field' ) ) {
					if ( ! isset( self::$field_definitions_cache[ $field_key ] ) ) {
						self::$field_definitions_cache[ $field_key ] = acf_get_field( $field_key );
					}
					$field_obj = self::$field_definitions_cache[ $field_key ];
					if ( $field_obj && isset( $field_obj['label'] ) ) {
						$field_labels[ $field_key ] = $field_obj['label'];
					} else {
						$field_labels[ $field_key ] = $field_key;
					}
				} else {
					$field_labels[ $field_key ] = $field_key;
				}
			}
		}

		// Get translation ACF values - batch optimized (no language switching needed).
		$translation_acf = array();
		$is_synced = true;
		$fields_status = array();

		foreach ( $translations as $lang => $trans_id ) {
			if ( (int) $trans_id === (int) $source_product_id ) {
				continue;
			}

			// Verify translation post exists (lightweight check).
			if ( ! get_post_status( $trans_id ) ) {
				continue;
			}

			// Get all field values at once for this translation (single query).
			$trans_acf = $this->get_acf_field_values_batch( $fields_to_check, $trans_id );
			$trans_fields_status = array();

			foreach ( $fields_to_check as $field_key ) {
				$trans_value = isset( $trans_acf[ $field_key ] ) ? $trans_acf[ $field_key ] : null;
				$matches = $this->compare_field_values( $source_acf[ $field_key ], $trans_value );
				$trans_fields_status[ $field_key ] = $matches;

				if ( ! $matches ) {
					$is_synced = false;
				}
			}

			$translation_acf[ $lang ] = array(
				'product_id' => $trans_id,
				'fields'     => $trans_acf,
				'fields_status' => $trans_fields_status,
			);
		}

		// Build product name (use source product).
		$product_name = $product->get_name();
		$parent_name = null;
		$variation_attributes = array();

		if ( $is_variation ) {
			$parent_id = $product->get_parent_id();
			if ( $parent_id ) {
				$parent = wc_get_product( $parent_id );
				if ( $parent ) {
					$parent_name = $parent->get_name();
				}
			}

			// Get variation attributes.
			$variation_attributes = $product->get_variation_attributes();
			
			// Build enriched variation name with attributes.
			if ( ! empty( $variation_attributes ) ) {
				$attribute_parts = array();
				foreach ( $variation_attributes as $attribute_name => $attribute_value ) {
					// Remove 'pa_' prefix if present for display.
					$display_name = str_replace( 'pa_', '', $attribute_name );
					$display_name = wc_attribute_label( $display_name, $product );
					
					if ( $attribute_value ) {
						$attribute_parts[] = $display_name . ': ' . $attribute_value;
					}
				}
				
				if ( ! empty( $attribute_parts ) ) {
					$product_name .= ' - ' . implode( ', ', $attribute_parts );
				}
			}
		}

		$product_type = $product->get_type();

		return array(
			'product_id'      => $source_product_id, // Use source product ID.
			'product_name'   => $product_name,
			'parent_name'    => $parent_name,
			'product_type'   => $product_type,
			'is_variation'   => $is_variation,
			'variation_attributes' => $variation_attributes,
			'edit_url'       => get_edit_post_link( $source_product_id, 'raw' ),
			'source_acf'     => $source_acf,
			'translations'   => $translation_acf,
			'is_synced'      => $is_synced,
			'fields_status'  => $fields_status,
			'field_labels'   => $field_labels,
		);
	}

	/**
	 * AJAX: Sync single product ACF fields.
	 */
	public function ajax_sync_product_acf() {
		check_ajax_referer( 'afs_wcml_sync_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
		}

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$fields = isset( $_POST['fields'] ) ? array_map( 'sanitize_text_field', (array) $_POST['fields'] ) : array();
		$sync_mode = isset( $_POST['sync_mode'] ) ? sanitize_text_field( $_POST['sync_mode'] ) : 'copy';

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => __( 'ID de produit invalide.', 'afs-wcml-api' ) ) );
		}

		$this->clear_translations_cache( $product_id );
		$result = $this->sync_product_acf_fields( $product_id, $fields, $sync_mode );

		if ( $result['success'] || ! empty( $result['synced'] ) ) {
			wp_send_json_success( $result );
		} else {
			wp_send_json_error( $result );
		}
	}

	/**
	 * AJAX: Sync all products ACF fields.
	 */
	public function ajax_sync_all_acf() {
		check_ajax_referer( 'afs_wcml_sync_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
		}

		$batch_size = isset( $_POST['batch_size'] ) ? absint( $_POST['batch_size'] ) : 5; // Reduced default batch size.
		$offset = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0;
		$sync_unsynced_only = isset( $_POST['sync_unsynced_only'] ) ? (bool) $_POST['sync_unsynced_only'] : false;
		$include_variations = isset( $_POST['include_variations'] ) ? (bool) $_POST['include_variations'] : true;
		$sync_mode = isset( $_POST['sync_mode'] ) ? sanitize_text_field( $_POST['sync_mode'] ) : 'copy';

		if ( $offset === 0 ) {
			$this->clear_translations_cache();
		}

		$args = array(
			'per_page'           => $batch_size,
			'page'               => ( $offset / $batch_size ) + 1,
			'include_variations' => $include_variations,
		);

		if ( $sync_unsynced_only ) {
			$args['sync_status'] = 'not_synced';
		}

		$data = $this->get_products_acf_comparison( $args );
		$product_ids = array();
		$total_products = isset( $data['total'] ) ? $data['total'] : 0;

		if ( ! empty( $data['products'] ) ) {
			foreach ( $data['products'] as $product ) {
				$product_ids[] = $product['product_id'];
			}
		}

		$result = array(
			'success'   => true,
			'synced'    => array(),
			'errors'    => array(),
			'processed' => 0,
			'total'     => $total_products,
			'complete'   => false,
		);

		$settings = $this->get_sync_settings();
		$fields_to_sync = isset( $settings['fields'] ) ? $settings['fields'] : array();

		foreach ( $product_ids as $product_id ) {
			$sync_result = $this->sync_product_acf_fields( $product_id, $fields_to_sync, $sync_mode );
			$result['synced'] = array_merge( $result['synced'], $sync_result['synced'] );
			$result['errors'] = array_merge( $result['errors'], $sync_result['errors'] );
			$result['processed']++;
		}

		$result['complete'] = ( $offset + $result['processed'] ) >= $total_products;

		wp_send_json_success( $result );
	}

	/**
	 * AJAX: Get products ACF comparison.
	 */
	public function ajax_get_products_acf_comparison() {
		check_ajax_referer( 'afs_wcml_sync_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
		}

		$args = array(
			'per_page'           => isset( $_POST['per_page'] ) ? absint( $_POST['per_page'] ) : 20,
			'page'               => isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1,
			'product_type'        => isset( $_POST['product_type'] ) ? sanitize_text_field( $_POST['product_type'] ) : '',
			'sync_status'         => isset( $_POST['sync_status'] ) ? sanitize_text_field( $_POST['sync_status'] ) : '',
			'search'              => isset( $_POST['search'] ) ? sanitize_text_field( $_POST['search'] ) : '',
			'include_variations'  => isset( $_POST['include_variations'] ) ? (bool) $_POST['include_variations'] : true,
		);

		$this->clear_translations_cache();
		$data = $this->get_products_acf_comparison( $args );

		// Get languages for rendering
		$languages = apply_filters( 'wpml_active_languages', array() );
		$default_lang = apply_filters( 'wpml_default_language', 'en' );
		$data['languages'] = $languages;
		$data['default_lang'] = $default_lang;

		wp_send_json_success( $data );
	}

	/**
	 * AJAX: Get ACF sync status.
	 */
	public function ajax_get_acf_sync_status() {
		check_ajax_referer( 'afs_wcml_sync_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
		}

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;

		if ( $product_id ) {
			$this->clear_translations_cache( $product_id );
			$status = $this->get_sync_status( $product_id );
			wp_send_json_success( $status );
		}

		// Get overview.
		$this->clear_translations_cache();
		$unsync_data = $this->get_products_acf_comparison( array(
			'per_page'           => 50,
			'page'               => 1,
			'sync_status'        => 'not_synced',
			'include_variations' => true,
		) );

		wp_send_json_success( array(
			'needs_sync_count' => isset( $unsync_data['total'] ) ? $unsync_data['total'] : 0,
			'products'         => isset( $unsync_data['products'] ) ? $unsync_data['products'] : array(),
		) );
	}

	/**
	 * AJAX: Save ACF sync settings.
	 */
	public function ajax_save_acf_sync_settings() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'afs_wcml_sync_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Nonce invalide. Veuillez recharger la page.', 'afs-wcml-api' ) ) );
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
			return;
		}

		// Get fields from POST.
		$fields = array();
		if ( isset( $_POST['fields'] ) && is_array( $_POST['fields'] ) ) {
			$fields = array_map( 'sanitize_text_field', wp_unslash( $_POST['fields'] ) );
			// Remove empty values.
			$fields = array_filter( $fields );
		}

		$auto_sync = isset( $_POST['auto_sync'] ) && (bool) $_POST['auto_sync'];

		$settings = array(
			'fields'    => $fields,
			'auto_sync' => $auto_sync,
		);

		// Save settings.
		$this->save_sync_settings( $settings );
		$this->set_auto_sync( $auto_sync );

		wp_send_json_success( array(
			'message' => __( 'Paramètres sauvegardés avec succès.', 'afs-wcml-api' ),
			'fields_count' => count( $fields ),
		) );
	}

	/**
	 * AJAX: Save a single ACF field value.
	 */
	public function ajax_save_acf_field() {
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
		$source_product_id = isset( $_POST['source_product_id'] ) ? absint( $_POST['source_product_id'] ) : $product_id;
		$field_key = isset( $_POST['field_key'] ) ? sanitize_text_field( wp_unslash( $_POST['field_key'] ) ) : '';
		$field_value = isset( $_POST['field_value'] ) ? wp_unslash( $_POST['field_value'] ) : '';
		$lang = isset( $_POST['lang'] ) ? sanitize_text_field( wp_unslash( $_POST['lang'] ) ) : '';
		$has_translation = isset( $_POST['has_translation'] ) ? (bool) $_POST['has_translation'] : false;

		if ( ! $source_product_id || ! $field_key || ! $lang ) {
			wp_send_json_error( array( 'message' => __( 'Paramètres manquants.', 'afs-wcml-api' ) ) );
			return;
		}

		// Verify source product exists.
		$source_product = wc_get_product( $source_product_id );
		if ( ! $source_product ) {
			wp_send_json_error( array( 'message' => __( 'Produit source introuvable.', 'afs-wcml-api' ) ) );
			return;
		}

		// Get default language.
		$default_lang = apply_filters( 'wpml_default_language', 'en' );

		// Get or create translation.
		$target_product_id = $product_id;
		
		// If it's the default language, use source product directly (no translation needed).
		if ( $lang === $default_lang ) {
			$target_product_id = $source_product_id;
		} elseif ( ! $has_translation || ! $target_product_id || $target_product_id === $source_product_id ) {
			// For non-default languages, check if translation exists.
			if ( ! function_exists( 'apply_filters' ) ) {
				wp_send_json_error( array( 'message' => __( 'WPML n\'est pas disponible.', 'afs-wcml-api' ) ) );
				return;
			}
			
			$post_type = get_post_type( $source_product_id );
			$existing_translation_id = apply_filters( 'wpml_object_id', $source_product_id, $post_type, false, $lang );
			
			if ( $existing_translation_id && $existing_translation_id !== $source_product_id ) {
				// Translation exists, use it.
				$target_product_id = $existing_translation_id;
			} else {
				// Create translation if it doesn't exist (only for non-default languages).
				$target_product_id = $this->create_product_translation( $source_product_id, $lang );
				
				if ( ! $target_product_id ) {
					wp_send_json_error( array( 'message' => __( 'Impossible de créer la traduction du produit.', 'afs-wcml-api' ) ) );
					return;
				}
			}
		}

		// Verify target product exists.
		$target_product = wc_get_product( $target_product_id );
		if ( ! $target_product ) {
			wp_send_json_error( array( 'message' => __( 'Produit cible introuvable.', 'afs-wcml-api' ) ) );
			return;
		}

		// Process field value (try to decode JSON if it's a string that looks like JSON).
		$processed_value = $field_value;
		if ( is_string( $field_value ) && ! empty( $field_value ) ) {
			// Try to decode JSON.
			$decoded = json_decode( $field_value, true );
			if ( json_last_error() === JSON_ERROR_NONE ) {
				$processed_value = $decoded;
			}
		}

		// Update the field.
		try {
			$result = $this->update_acf_field_value( $field_key, $processed_value, $target_product_id );

			if ( $result ) {
				// Clear cache for this field.
				$cache_key = $target_product_id . '_' . $field_key;
				unset( self::$acf_values_cache[ $cache_key ] );
				
				// Clear translations cache for source product.
				$this->clear_translations_cache( $source_product_id );

				wp_send_json_success( array(
					'message' => __( 'Champ sauvegardé avec succès.', 'afs-wcml-api' ),
					'field_key' => $field_key,
					'product_id' => $target_product_id,
					'translation_created' => ( $lang !== $default_lang && ! $has_translation ),
				) );
			} else {
				wp_send_json_error( array( 'message' => __( 'Erreur lors de la sauvegarde du champ. La fonction update_field a retourné false.', 'afs-wcml-api' ) ) );
			}
		} catch ( Exception $e ) {
			wp_send_json_error( array( 
				'message' => __( 'Erreur lors de la sauvegarde du champ.', 'afs-wcml-api' ),
				'error' => $e->getMessage(),
			) );
		}
	}

	/**
	 * Create product translation in WPML.
	 *
	 * @param int    $source_product_id Source product ID.
	 * @param string $target_lang       Target language code.
	 * @return int|false Translation product ID or false on failure.
	 */
	private function create_product_translation( $source_product_id, $target_lang ) {
		if ( ! function_exists( 'apply_filters' ) ) {
			return false;
		}

		// Get source product.
		$source_product = wc_get_product( $source_product_id );
		if ( ! $source_product ) {
			return false;
		}

		$post_type = get_post_type( $source_product_id );
		$source_lang = apply_filters( 'wpml_element_language_code', null, array(
			'element_id' => $source_product_id,
			'element_type' => $post_type,
		) );

		if ( ! $source_lang ) {
			$source_lang = apply_filters( 'wpml_default_language', 'en' );
		}

		// Check if translation already exists.
		$existing_translation_id = apply_filters( 'wpml_object_id', $source_product_id, $post_type, false, $target_lang );
		if ( $existing_translation_id && $existing_translation_id !== $source_product_id ) {
			return $existing_translation_id;
		}

		// Get source post data.
		$source_post = get_post( $source_product_id );
		if ( ! $source_post ) {
			return false;
		}

		// Create translation post.
		$translation_post_data = array(
			'post_title'   => $source_post->post_title,
			'post_content' => $source_post->post_content,
			'post_excerpt' => $source_post->post_excerpt,
			'post_status'  => $source_post->post_status,
			'post_type'    => $post_type,
			'post_parent'  => $source_post->post_parent,
		);

		// For variations, we need to handle parent product translation.
		if ( $post_type === 'product_variation' && $source_post->post_parent ) {
			$parent_translation_id = apply_filters( 'wpml_object_id', $source_post->post_parent, 'product', false, $target_lang );
			if ( $parent_translation_id ) {
				$translation_post_data['post_parent'] = $parent_translation_id;
			}
		}

		$translation_id = wp_insert_post( $translation_post_data );

		if ( is_wp_error( $translation_id ) || ! $translation_id ) {
			return false;
		}

		// Get or create translation group (trid).
		$trid = apply_filters( 'wpml_element_trid', null, array(
			'element_id' => $source_product_id,
			'element_type' => $post_type,
		) );

		// If no trid exists, create one by setting language for source first.
		if ( ! $trid ) {
			do_action( 'wpml_set_element_language_details', array(
				'element_id'   => $source_product_id,
				'element_type' => $post_type,
				'language_code' => $source_lang,
			) );
			$trid = apply_filters( 'wpml_element_trid', null, array(
				'element_id' => $source_product_id,
				'element_type' => $post_type,
			) );
		}

		// Set language for the translation.
		if ( $trid ) {
			do_action( 'wpml_set_element_language_details', array(
				'element_id'   => $translation_id,
				'element_type' => $post_type,
				'trid'         => $trid,
				'language_code' => $target_lang,
				'source_language_code' => $source_lang,
			) );
		}

		// Copy product meta.
		$this->copy_product_meta( $source_product_id, $translation_id );

		// Clear caches.
		wc_delete_product_transients( $translation_id );

		return $translation_id;
	}

	/**
	 * Copy product meta to translation.
	 *
	 * @param int $source_id Source product ID.
	 * @param int $target_id Target product ID.
	 */
	private function copy_product_meta( $source_id, $target_id ) {
		$meta_keys_to_copy = array(
			'_sku',
			'_regular_price',
			'_sale_price',
			'_price',
			'_stock',
			'_stock_status',
			'_manage_stock',
			'_backorders',
			'_weight',
			'_length',
			'_width',
			'_height',
		);

		foreach ( $meta_keys_to_copy as $meta_key ) {
			$meta_value = get_post_meta( $source_id, $meta_key, true );
			if ( $meta_value !== '' ) {
				update_post_meta( $target_id, $meta_key, $meta_value );
			}
		}

		// Copy variation attributes if it's a variation.
		if ( get_post_type( $source_id ) === 'product_variation' ) {
			$attributes = get_post_meta( $source_id, '_product_attributes', true );
			if ( $attributes ) {
				update_post_meta( $target_id, '_product_attributes', $attributes );
			}
		}
	}
}
