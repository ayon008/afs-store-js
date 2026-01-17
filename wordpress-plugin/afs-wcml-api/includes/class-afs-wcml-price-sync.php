<?php
/**
 * Price Synchronization class for WCML multi-language support.
 *
 * Handles automatic price synchronization between product translations.
 * Optimized for performance with caching and batch processing.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_Price_Sync class.
 */
class AFS_WCML_Price_Sync {

	/**
	 * Prices instance.
	 *
	 * @var AFS_WCML_Prices
	 */
	private $prices;

	/**
	 * Option name for sync settings.
	 *
	 * @var string
	 */
	const OPTION_AUTO_SYNC = 'afs_wcml_auto_sync_enabled';

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
	 * Queue of products to sync (for batching meta updates).
	 *
	 * @var array
	 */
	private static $sync_queue = array();

	/**
	 * Whether shutdown sync has been scheduled.
	 *
	 * @var bool
	 */
	private static $shutdown_scheduled = false;

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
		// Hook into WooCommerce product save to sync prices (high priority to run after other hooks).
		add_action( 'woocommerce_process_product_meta', array( $this, 'on_product_save' ), 100, 1 );
		add_action( 'woocommerce_save_product_variation', array( $this, 'on_variation_save' ), 100, 2 );

		// Hook for bulk variation updates.
		add_action( 'woocommerce_ajax_save_product_variations', array( $this, 'on_ajax_save_variations' ), 100, 1 );

		// Hook into post meta updates for price changes (lower priority).
		add_action( 'updated_post_meta', array( $this, 'on_price_meta_update' ), 20, 4 );
		add_action( 'added_post_meta', array( $this, 'on_price_meta_update' ), 20, 4 );

		// Hook into WCML price updates.
		add_action( 'wcml_set_product_prices', array( $this, 'on_wcml_prices_update' ), 100, 2 );
		add_action( 'wcml_after_save_custom_prices', array( $this, 'on_wcml_custom_prices_save' ), 100, 2 );

		// AJAX handlers.
		add_action( 'wp_ajax_afs_wcml_sync_product_prices', array( $this, 'ajax_sync_product_prices' ) );
		add_action( 'wp_ajax_afs_wcml_sync_all_prices', array( $this, 'ajax_sync_all_prices' ) );
		add_action( 'wp_ajax_afs_wcml_get_sync_status', array( $this, 'ajax_get_sync_status' ) );
		add_action( 'wp_ajax_afs_wcml_get_products_price_sync', array( $this, 'ajax_get_products_price_sync' ) );
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

		// Determine element type based on whether it's a variation or product.
		$post_type = get_post_type( $product_id );
		if ( $post_type === 'product_variation' || $is_variation ) {
			$element_type = 'post_product_variation';
		} else {
			$element_type = 'post_product';
		}

		// Get trid (translation ID) for this product.
		$trid = apply_filters( 'wpml_element_trid', null, $product_id, $element_type );

		if ( ! $trid ) {
			self::$translations_cache[ $cache_key ] = array();
			return array();
		}

		// Get all translations for this trid.
		$all_translations = apply_filters( 'wpml_get_element_translations', array(), $trid, $element_type );

		foreach ( $all_translations as $lang => $translation ) {
			if ( isset( $translation->element_id ) ) {
				$translations[ $lang ] = (int) $translation->element_id;
			}
		}

		// Store in cache.
		self::$translations_cache[ $cache_key ] = $translations;

		return $translations;
	}

	/**
	 * Clear translations cache.
	 *
	 * @param int|null $product_id Optional product ID to clear specific cache.
	 */
	public function clear_translations_cache( $product_id = null ) {
		if ( $product_id ) {
			unset( self::$translations_cache[ $product_id . '_var' ] );
			unset( self::$translations_cache[ $product_id . '_prod' ] );
		} else {
			self::$translations_cache = array();
		}
	}

	/**
	 * Get the original (master) product ID from any translation.
	 *
	 * @param int  $product_id Any translation's product ID.
	 * @param bool $is_variation Whether the product is a variation.
	 * @return int|null Original product ID or null.
	 */
	public function get_original_product_id( $product_id, $is_variation = false ) {
		$translations = $this->get_product_translations( $product_id, $is_variation );

		// Determine element type.
		$post_type = get_post_type( $product_id );
		if ( $post_type === 'product_variation' || $is_variation ) {
			$element_type = 'post_product_variation';
		} else {
			$element_type = 'post_product';
		}

		$trid = apply_filters( 'wpml_element_trid', null, $product_id, $element_type );

		if ( ! $trid ) {
			return null;
		}

		$all_translations = apply_filters( 'wpml_get_element_translations', array(), $trid, $element_type );

		foreach ( $all_translations as $translation ) {
			if ( isset( $translation->source_language_code ) && $translation->source_language_code === null ) {
				return (int) $translation->element_id;
			}
		}

		return $product_id;
	}

	/**
	 * Sync prices from one product to all its translations.
	 * Optimized with batch meta updates.
	 *
	 * @param int  $source_product_id Source product ID.
	 * @param bool $sync_default_only Only sync default currency prices.
	 * @return array Result with 'success', 'synced', 'errors'.
	 */
	public function sync_product_prices( $source_product_id, $sync_default_only = false ) {
		$result = array(
			'success' => true,
			'synced'  => array(),
			'errors'  => array(),
		);

		// Prevent infinite loops.
		if ( self::$syncing ) {
			return $result;
		}

		$product = wc_get_product( $source_product_id );
		if ( ! $product ) {
			$result['success'] = false;
			$result['errors'][] = sprintf( __( 'Produit %d introuvable.', 'afs-wcml-api' ), $source_product_id );
			return $result;
		}

		// Get translations.
		$translations = $this->get_product_translations( $source_product_id );

		if ( count( $translations ) <= 1 ) {
			return $result;
		}

		// Get source prices once.
		$source_prices = $this->prices->get_product_prices( $source_product_id );
		$default_regular_price = $product->get_regular_price();
		$default_sale_price = $product->get_sale_price();

		self::$syncing = true;

		// Disable autocommit for better performance during batch updates.
		$this->suspend_cache_invalidation();

		foreach ( $translations as $lang => $target_product_id ) {
			// Skip source product.
			if ( (int) $target_product_id === (int) $source_product_id ) {
				continue;
			}

			// Verify target exists (lightweight check).
			if ( get_post_status( $target_product_id ) !== 'publish' ) {
				continue;
			}

			// Batch update meta.
			$this->sync_price_meta( $target_product_id, $default_regular_price, $default_sale_price, $source_prices, $sync_default_only, $source_product_id );

			$result['synced'][] = array(
				'product_id' => $target_product_id,
				'lang'       => $lang,
				'message'    => sprintf( __( 'Prix synchronisés vers %s (ID: %d)', 'afs-wcml-api' ), strtoupper( $lang ), $target_product_id ),
			);
		}

		// Resume cache invalidation and clear caches once.
		$this->resume_cache_invalidation();
		$this->clear_synced_products_cache( array_column( $result['synced'], 'product_id' ) );

		self::$syncing = false;

		return $result;
	}

	/**
	 * Sync variation prices.
	 * Optimized with batch meta updates.
	 *
	 * @param int $source_variation_id Source variation ID.
	 * @return array Result with 'success', 'synced', 'errors'.
	 */
	public function sync_variation_prices( $source_variation_id ) {
		$result = array(
			'success' => true,
			'synced'  => array(),
			'errors'  => array(),
		);

		if ( self::$syncing ) {
			return $result;
		}

		// Lightweight check first.
		$post_type = get_post_type( $source_variation_id );
		if ( $post_type !== 'product_variation' ) {
			$result['success'] = false;
			$result['errors'][] = sprintf( __( 'Variation %d introuvable.', 'afs-wcml-api' ), $source_variation_id );
			return $result;
		}

		$variation = wc_get_product( $source_variation_id );
		if ( ! $variation || ! $variation->is_type( 'variation' ) ) {
			$result['success'] = false;
			$result['errors'][] = sprintf( __( 'Variation %d introuvable.', 'afs-wcml-api' ), $source_variation_id );
			return $result;
		}

		// Get translations (pass true for variation).
		$translations = $this->get_product_translations( $source_variation_id, true );

		if ( count( $translations ) <= 1 ) {
			return $result;
		}

		// Get source prices once.
		$source_prices = $this->prices->get_product_prices( $source_variation_id );
		$default_regular_price = $variation->get_regular_price();
		$default_sale_price = $variation->get_sale_price();
		$parent_id = $variation->get_parent_id();

		self::$syncing = true;
		$this->suspend_cache_invalidation();

		$synced_ids = array();

		foreach ( $translations as $lang => $target_variation_id ) {
			if ( (int) $target_variation_id === (int) $source_variation_id ) {
				continue;
			}

			// Verify target exists.
			if ( get_post_status( $target_variation_id ) === false ) {
				continue;
			}

			// Sync meta.
			$this->sync_price_meta( $target_variation_id, $default_regular_price, $default_sale_price, $source_prices, false, $source_variation_id );

			$synced_ids[] = $target_variation_id;

			$result['synced'][] = array(
				'variation_id' => $target_variation_id,
				'lang'         => $lang,
				'message'      => sprintf( __( 'Variation synchronisée vers %s (ID: %d)', 'afs-wcml-api' ), strtoupper( $lang ), $target_variation_id ),
			);
		}

		$this->resume_cache_invalidation();

		// Clear caches for synced variations and parent.
		$this->clear_synced_products_cache( $synced_ids );
		if ( $parent_id ) {
			wc_delete_product_transients( $parent_id );
		}

		self::$syncing = false;

		return $result;
	}

	/**
	 * Sync price meta data to target product.
	 * Centralized method for both products and variations.
	 *
	 * @param int    $target_id           Target product/variation ID.
	 * @param string $regular_price       Regular price.
	 * @param string $sale_price          Sale price.
	 * @param array  $currency_prices     Multi-currency prices.
	 * @param bool   $sync_default_only   Only sync default currency.
	 * @param int    $source_id           Source product ID for copying custom prices status.
	 */
	private function sync_price_meta( $target_id, $regular_price, $sale_price, $currency_prices, $sync_default_only, $source_id ) {
		// Sync default WooCommerce prices.
		if ( $regular_price !== '' && $regular_price !== null ) {
			update_post_meta( $target_id, '_regular_price', $regular_price );
			update_post_meta( $target_id, '_price', $sale_price ? $sale_price : $regular_price );
		}

		if ( $sale_price !== '' && $sale_price !== null ) {
			update_post_meta( $target_id, '_sale_price', $sale_price );
		} else {
			delete_post_meta( $target_id, '_sale_price' );
		}

		// Sync WCML multi-currency prices.
		if ( ! $sync_default_only && ! empty( $currency_prices ) ) {
			foreach ( $currency_prices as $currency => $price_data ) {
				// Skip default currency (already synced above).
				if ( isset( $price_data['is_default'] ) && $price_data['is_default'] ) {
					continue;
				}

				$curr_regular = isset( $price_data['regular_price'] ) ? $price_data['regular_price'] : '';
				$curr_sale = isset( $price_data['sale_price'] ) ? $price_data['sale_price'] : '';

				if ( $curr_regular !== '' && $curr_regular !== null ) {
					update_post_meta( $target_id, '_regular_price_' . $currency, $curr_regular );
					update_post_meta( $target_id, '_price_' . $currency, $curr_sale ? $curr_sale : $curr_regular );
				}

				if ( $curr_sale !== '' && $curr_sale !== null ) {
					update_post_meta( $target_id, '_sale_price_' . $currency, $curr_sale );
				} else {
					delete_post_meta( $target_id, '_sale_price_' . $currency );
				}
			}

			// Copy custom prices status.
			$custom_prices_status = get_post_meta( $source_id, '_wcml_custom_prices_status', true );
			if ( $custom_prices_status ) {
				update_post_meta( $target_id, '_wcml_custom_prices_status', $custom_prices_status );
			}
		}
	}

	/**
	 * Suspend cache invalidation during batch operations.
	 */
	private function suspend_cache_invalidation() {
		wp_suspend_cache_invalidation( true );
	}

	/**
	 * Resume cache invalidation after batch operations.
	 */
	private function resume_cache_invalidation() {
		wp_suspend_cache_invalidation( false );
	}

	/**
	 * Clear cache for synced products.
	 *
	 * @param array $product_ids Array of product IDs.
	 */
	private function clear_synced_products_cache( $product_ids ) {
		if ( empty( $product_ids ) ) {
			return;
		}

		foreach ( $product_ids as $product_id ) {
			wc_delete_product_transients( $product_id );
		}

		// Clear object cache.
		wp_cache_flush();
	}

	/**
	 * Sync all variations for a variable product.
	 * Optimized with batch processing.
	 *
	 * @param int $product_id Variable product ID.
	 * @return array Results for each variation.
	 */
	public function sync_variable_product_variations( $product_id ) {
		$product = wc_get_product( $product_id );

		if ( ! $product || ! $product->is_type( 'variable' ) ) {
			return array(
				'success' => false,
				'synced'  => array(),
				'errors'  => array( __( 'Le produit n\'est pas un produit variable.', 'afs-wcml-api' ) ),
			);
		}

		$results = array(
			'success' => true,
			'synced'  => array(),
			'errors'  => array(),
		);

		// Get variation IDs directly (more efficient than get_children for large products).
		$variation_ids = $product->get_children();

		if ( empty( $variation_ids ) ) {
			return $results;
		}

		// Process variations.
		foreach ( $variation_ids as $variation_id ) {
			$result = $this->sync_variation_prices( $variation_id );
			$results['synced'] = array_merge( $results['synced'], $result['synced'] );
			$results['errors'] = array_merge( $results['errors'], $result['errors'] );
		}

		if ( ! empty( $results['errors'] ) ) {
			$results['success'] = false;
		}

		return $results;
	}

	/**
	 * Get sync status for a product.
	 * Optimized to reduce database queries.
	 *
	 * @param int $product_id Product ID.
	 * @return array Sync status with translations and price differences.
	 */
	public function get_sync_status( $product_id ) {
		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			return array(
				'error'     => __( 'Produit introuvable.', 'afs-wcml-api' ),
				'is_synced' => true,
			);
		}

		$translations = $this->get_product_translations( $product_id );

		// If no translations, consider it synced.
		if ( count( $translations ) <= 1 ) {
			return array(
				'product_id'   => $product_id,
				'product_name' => $product->get_name(),
				'product_type' => $product->get_type(),
				'is_synced'    => true,
				'translations' => array(),
			);
		}

		$source_prices = $this->prices->get_product_prices( $product_id );
		$source_regular = $product->get_regular_price();
		$source_sale = $product->get_sale_price();

		$status = array(
			'product_id'    => $product_id,
			'product_name'  => $product->get_name(),
			'product_type'  => $product->get_type(),
			'source_prices' => array(
				'regular_price' => $source_regular,
				'sale_price'    => $source_sale,
				'currencies'    => $source_prices,
			),
			'translations'  => array(),
			'is_synced'     => true,
		);

		foreach ( $translations as $lang => $trans_product_id ) {
			if ( (int) $trans_product_id === (int) $product_id ) {
				$status['translations'][ $lang ] = array(
					'product_id' => $trans_product_id,
					'is_source'  => true,
				);
				continue;
			}

			// Get translation prices directly from meta (faster than loading full product).
			$trans_regular = get_post_meta( $trans_product_id, '_regular_price', true );
			$trans_sale = get_post_meta( $trans_product_id, '_sale_price', true );

			// Quick comparison.
			$prices_match = ( $source_regular == $trans_regular && $source_sale == $trans_sale );

			// Check multi-currency prices only if default matches.
			$currencies_match = true;
			if ( $prices_match && ! empty( $source_prices ) ) {
				foreach ( $source_prices as $currency => $price_data ) {
					if ( isset( $price_data['is_default'] ) && $price_data['is_default'] ) {
						continue;
					}

					$source_reg = isset( $price_data['regular_price'] ) ? $price_data['regular_price'] : '';
					$trans_reg = get_post_meta( $trans_product_id, '_regular_price_' . $currency, true );

					if ( $source_reg != $trans_reg ) {
						$currencies_match = false;
						break;
					}
				}
			}

			$is_synced = $prices_match && $currencies_match;

			if ( ! $is_synced ) {
				$status['is_synced'] = false;
			}

			$status['translations'][ $lang ] = array(
				'product_id' => $trans_product_id,
				'is_synced'  => $is_synced,
				'prices'     => array(
					'regular_price' => $trans_regular,
					'sale_price'    => $trans_sale,
				),
			);
		}

		return $status;
	}

	/**
	 * Get products that need synchronization.
	 * Uses direct SQL to bypass WPML language filters.
	 *
	 * @param int $limit Max number of products to return.
	 * @param int $offset Offset for pagination.
	 * @return array Array of products needing sync.
	 */
	public function get_products_needing_sync( $limit = 50, $offset = 0 ) {
		// Use get_products_price_comparison with sync_status filter for accurate results.
		$data = $this->get_products_price_comparison( array(
			'per_page'           => $limit,
			'page'               => ( $offset / $limit ) + 1,
			'sync_status'        => 'not_synced',
			'include_variations' => false, // Only products, not variations.
		) );

		return isset( $data['products'] ) ? $data['products'] : array();
	}

	/**
	 * Schedule sync for shutdown to batch multiple updates.
	 *
	 * @param int    $object_id Product or variation ID.
	 * @param string $type      Type: 'product' or 'variation'.
	 */
	private function schedule_sync( $object_id, $type ) {
		self::$sync_queue[ $object_id ] = $type;

		if ( ! self::$shutdown_scheduled ) {
			self::$shutdown_scheduled = true;
			add_action( 'shutdown', array( $this, 'process_sync_queue' ), 5 );
		}
	}

	/**
	 * Process queued syncs at shutdown.
	 */
	public function process_sync_queue() {
		if ( empty( self::$sync_queue ) || self::$syncing ) {
			return;
		}

		foreach ( self::$sync_queue as $object_id => $type ) {
			if ( $type === 'variation' ) {
				$this->sync_variation_prices( $object_id );
			} else {
				$product = wc_get_product( $object_id );
				if ( $product && $product->is_type( 'variable' ) ) {
					$this->sync_variable_product_variations( $object_id );
				} else {
					$this->sync_product_prices( $object_id );
				}
			}
		}

		self::$sync_queue = array();
		self::$shutdown_scheduled = false;
	}

	/**
	 * Hook: On product save.
	 *
	 * @param int $product_id Product ID.
	 */
	public function on_product_save( $product_id ) {
		if ( ! $this->is_auto_sync_enabled() || self::$syncing ) {
			return;
		}

		$this->schedule_sync( $product_id, 'product' );
	}

	/**
	 * Hook: On variation save.
	 *
	 * @param int $variation_id Variation ID.
	 * @param int $loop Loop index.
	 */
	public function on_variation_save( $variation_id, $loop = 0 ) {
		if ( ! $this->is_auto_sync_enabled() || self::$syncing ) {
			return;
		}

		$this->schedule_sync( $variation_id, 'variation' );
	}

	/**
	 * Hook: On price meta update.
	 *
	 * @param int    $meta_id    Meta ID.
	 * @param int    $object_id  Object ID.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 */
	public function on_price_meta_update( $meta_id, $object_id, $meta_key, $meta_value ) {
		if ( ! $this->is_auto_sync_enabled() || self::$syncing ) {
			return;
		}

		// Check if this is a price meta.
		static $price_meta_keys = array( '_price', '_regular_price', '_sale_price' );
		$is_price_meta = in_array( $meta_key, $price_meta_keys, true );

		// Also check for currency-specific price meta.
		if ( ! $is_price_meta && preg_match( '/^_(price|regular_price|sale_price)_[A-Z]{3}$/', $meta_key ) ) {
			$is_price_meta = true;
		}

		if ( ! $is_price_meta ) {
			return;
		}

		// Check if this is a product or variation.
		$post_type = get_post_type( $object_id );
		if ( $post_type === 'product_variation' ) {
			$this->schedule_sync( $object_id, 'variation' );
		} elseif ( $post_type === 'product' ) {
			$this->schedule_sync( $object_id, 'product' );
		}
	}

	/**
	 * Hook: On AJAX save variations (bulk edit).
	 *
	 * @param int $product_id Product ID.
	 */
	public function on_ajax_save_variations( $product_id ) {
		if ( ! $this->is_auto_sync_enabled() || self::$syncing ) {
			return;
		}

		$this->schedule_sync( $product_id, 'product' );
	}

	/**
	 * Hook: On WCML prices update.
	 *
	 * @param int   $product_id Product ID.
	 * @param array $prices     Prices array.
	 */
	public function on_wcml_prices_update( $product_id, $prices ) {
		if ( ! $this->is_auto_sync_enabled() || self::$syncing ) {
			return;
		}

		$post_type = get_post_type( $product_id );
		$type = ( $post_type === 'product_variation' ) ? 'variation' : 'product';
		$this->schedule_sync( $product_id, $type );
	}

	/**
	 * Hook: On WCML custom prices save.
	 *
	 * @param int   $product_id Product ID.
	 * @param array $prices     Prices array.
	 */
	public function on_wcml_custom_prices_save( $product_id, $prices ) {
		$this->on_wcml_prices_update( $product_id, $prices );
	}

	/**
	 * AJAX: Sync single product prices.
	 */
	public function ajax_sync_product_prices() {
		check_ajax_referer( 'afs_wcml_sync_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
		}

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => __( 'ID produit invalide.', 'afs-wcml-api' ) ) );
		}

		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			wp_send_json_error( array( 'message' => __( 'Produit introuvable.', 'afs-wcml-api' ) ) );
		}

		// Clear cache before sync.
		$this->clear_translations_cache( $product_id );

		if ( $product->is_type( 'variable' ) ) {
			$result = $this->sync_product_prices( $product_id );
			$variation_result = $this->sync_variable_product_variations( $product_id );
			$result['synced'] = array_merge( $result['synced'], $variation_result['synced'] );
			$result['errors'] = array_merge( $result['errors'], $variation_result['errors'] );
		} else {
			$result = $this->sync_product_prices( $product_id );
		}

		if ( $result['success'] || ! empty( $result['synced'] ) ) {
			wp_send_json_success( $result );
		} else {
			wp_send_json_error( $result );
		}
	}

	/**
	 * AJAX: Sync all products.
	 */
	public function ajax_sync_all_prices() {
		check_ajax_referer( 'afs_wcml_sync_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
		}

		global $wpdb;

		$batch_size = isset( $_POST['batch_size'] ) ? absint( $_POST['batch_size'] ) : 10;
		$offset = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0;
		$sync_unsynced_only = isset( $_POST['sync_unsynced_only'] ) ? (bool) $_POST['sync_unsynced_only'] : false;
		$include_variations = isset( $_POST['include_variations'] ) ? (bool) $_POST['include_variations'] : true;

		// Clear cache at start of batch.
		if ( $offset === 0 ) {
			$this->clear_translations_cache();
		}

		// If syncing only unsynced products, get them using get_products_price_comparison.
		if ( $sync_unsynced_only ) {
			$unsynced_data = $this->get_products_price_comparison( array(
				'per_page'           => $batch_size,
				'page'               => ( $offset / $batch_size ) + 1,
				'sync_status'        => 'not_synced',
				'include_variations' => $include_variations,
			) );

			$product_ids = array();
			$total_products = isset( $unsynced_data['total'] ) ? $unsynced_data['total'] : 0;

			if ( ! empty( $unsynced_data['products'] ) ) {
				foreach ( $unsynced_data['products'] as $product_data ) {
					$product_ids[] = $product_data['product_id'];
				}
			}
		} else {
			// Use direct SQL to get source products only (bypassing WPML language filter).
			// This ensures we sync all source products regardless of admin language.
			$icl_table = $wpdb->prefix . 'icl_translations';
			$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '{$icl_table}'" ) === $icl_table;

			if ( $table_exists ) {
				// WPML is active - get source products only (source_language_code IS NULL).
				$base_sql = "
					SELECT DISTINCT p.ID
					FROM {$wpdb->posts} p
					LEFT JOIN {$icl_table} t ON p.ID = t.element_id
						AND t.element_type = 'post_product'
					WHERE p.post_type = 'product'
					AND p.post_status IN ('publish', 'private')
					AND (
						t.element_id IS NULL
						OR t.source_language_code IS NULL
					)
					ORDER BY p.ID DESC
				";

				// Get total count.
				$count_sql = "SELECT COUNT(*) FROM ({$base_sql}) as total_query";
				$total_products = (int) $wpdb->get_var( $count_sql );

				// Get batch of products.
				$paginated_sql = $base_sql . " LIMIT %d OFFSET %d";
				$product_ids = $wpdb->get_col( $wpdb->prepare( $paginated_sql, $batch_size, $offset ) );
			} else {
				// WPML not active - use standard query.
				$base_sql = "
					SELECT DISTINCT p.ID
					FROM {$wpdb->posts} p
					WHERE p.post_type = 'product'
					AND p.post_status IN ('publish', 'private')
					ORDER BY p.ID DESC
				";

				$count_sql = "SELECT COUNT(*) FROM ({$base_sql}) as total_query";
				$total_products = (int) $wpdb->get_var( $count_sql );

				$paginated_sql = $base_sql . " LIMIT %d OFFSET %d";
				$product_ids = $wpdb->get_col( $wpdb->prepare( $paginated_sql, $batch_size, $offset ) );
			}
		}

		$results = array(
			'synced'     => array(),
			'errors'     => array(),
			'processed'  => 0,
			'total'      => $total_products,
			'offset'     => $offset,
			'batch_size' => $batch_size,
			'complete'   => empty( $product_ids ),
		);

		foreach ( $product_ids as $product_id ) {
			$product = wc_get_product( $product_id );

			if ( ! $product ) {
				$results['processed']++;
				continue;
			}

			// Check if it's a variation.
			if ( $product->is_type( 'variation' ) ) {
				$result = $this->sync_variation_prices( $product_id );
				$results['synced'] = array_merge( $results['synced'], $result['synced'] );
				$results['errors'] = array_merge( $results['errors'], $result['errors'] );
			} elseif ( $product->is_type( 'variable' ) ) {
				$result = $this->sync_product_prices( $product_id );
				$var_result = $this->sync_variable_product_variations( $product_id );
				$results['synced'] = array_merge( $results['synced'], $result['synced'], $var_result['synced'] );
				$results['errors'] = array_merge( $results['errors'], $result['errors'], $var_result['errors'] );
			} else {
				$result = $this->sync_product_prices( $product_id );
				$results['synced'] = array_merge( $results['synced'], $result['synced'] );
				$results['errors'] = array_merge( $results['errors'], $result['errors'] );
			}

			$results['processed']++;
		}

		wp_send_json_success( $results );
	}

	/**
	 * AJAX: Get sync status for products.
	 */
	public function ajax_get_sync_status() {
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

		// Get overview using get_products_price_comparison for accurate count.
		$this->clear_translations_cache();

		// Get count of unsynchronized products (using direct SQL to bypass WPML filters).
		$unsync_data = $this->get_products_price_comparison( array(
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
	 * Get detailed price comparison for all products.
	 * Returns complete price data for source and all translations.
	 *
	 * @param array $args Query arguments.
	 * @return array Products with detailed price comparison.
	 */
	public function get_products_price_comparison( $args = array() ) {
		global $wpdb;

		$defaults = array(
			'per_page'       => 20,
			'page'           => 1,
			'product_type'   => '', // 'simple', 'variable', 'variation', or empty for all.
			'sync_status'    => '', // 'synced', 'not_synced', or empty for all.
			'search'         => '',
			'include_variations' => true,
		);

		$args = wp_parse_args( $args, $defaults );

		// Get all currencies including default (EUR).
		$currencies = $this->prices->get_all_currencies();
		$languages = apply_filters( 'wpml_active_languages', array() );
		$default_lang = apply_filters( 'wpml_default_language', 'en' );

		// Get all source products using direct SQL to bypass WPML language filter.
		// This ensures we get products in the default language (source products).
		$post_types = array( "'product'" );
		if ( $args['include_variations'] ) {
			$post_types[] = "'product_variation'";
		}

		// Filter by product type.
		if ( ! empty( $args['product_type'] ) ) {
			if ( $args['product_type'] === 'variation' ) {
				$post_types = array( "'product_variation'" );
			} else {
				$post_types = array( "'product'" );
			}
		}

		$post_types_sql = implode( ',', $post_types );

		// Build the base query to get source products only (default language).
		$icl_table = $wpdb->prefix . 'icl_translations';
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '{$icl_table}'" ) === $icl_table;

		if ( $table_exists ) {
			// WPML is active - get source language products only.
			// source_language_code IS NULL means this is the original/source product.
			// This ensures we get each product only once (the original version).
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
			// WPML not active - get all products.
			$base_sql = "
				SELECT DISTINCT p.ID
				FROM {$wpdb->posts} p
				WHERE p.post_type IN ({$post_types_sql})
				AND p.post_status IN ('publish', 'private')
			";
			$sql_args = array();
		}

		// Add product type filter for simple/variable products.
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

		// Order by ID descending (newest first).
		$base_sql .= " ORDER BY p.ID DESC";

		// Get total count first.
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
		// Get more products to account for filtering.
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

		foreach ( $product_ids as $product_id ) {
			$product_data = $this->get_product_price_details( (int) $product_id, $currencies, $languages, $default_lang );

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
			'products'    => $products,
			'total'       => $total_products,
			'pages'       => ceil( $total_products / $args['per_page'] ),
			'current_page' => $args['page'],
			'per_page'    => $args['per_page'],
			'currencies'  => array_keys( $currencies ),
			'languages'   => array_keys( $languages ),
		);
	}

	/**
	 * Get frontend URL for a product.
	 *
	 * @param int    $product_id Product ID.
	 * @param string $lang       Language code.
	 * @return string Frontend URL.
	 */
	private function get_product_frontend_url( $product_id, $lang ) {
		if ( ! $product_id ) {
			return '';
		}

		// Switch to the correct language context for WPML
		global $sitepress;
		$original_lang = null;
		if ( $sitepress ) {
			$original_lang = $sitepress->get_current_language();
			$sitepress->switch_lang( $lang );
		}

		// Get permalink for the product in the correct language
		$permalink = get_permalink( $product_id );
		
		// Restore original language
		if ( $sitepress && $original_lang ) {
			$sitepress->switch_lang( $original_lang );
		}

		if ( ! $permalink ) {
			return '';
		}

		// Replace site_url with HEADLESS_URL if defined
		if ( defined( 'HEADLESS_URL' ) && ! empty( HEADLESS_URL ) ) {
			$site_url = untrailingslashit( get_site_url() );
			$headless_url = untrailingslashit( HEADLESS_URL );
			$permalink = str_replace( $site_url, $headless_url, $permalink );
		} else {
			// Fallback to staging URL
			$site_url = untrailingslashit( get_site_url() );
			$headless_url = 'https://staging.afs-foiling.com';
			$permalink = str_replace( $site_url, $headless_url, $permalink );
		}

		return $permalink;
	}

	/**
	 * Get detailed price information for a single product.
	 *
	 * @param int   $product_id  Product ID.
	 * @param array $currencies  Active currencies.
	 * @param array $languages   Active languages.
	 * @param string $default_lang Default language.
	 * @return array|null Product price details or null if not found.
	 */
	public function get_product_price_details( $product_id, $currencies = null, $languages = null, $default_lang = null ) {
		$post_type = get_post_type( $product_id );
		$is_variation = ( $post_type === 'product_variation' );

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return null;
		}

		// Get currencies and languages if not provided.
		if ( $currencies === null ) {
			$currencies = $this->prices->get_all_currencies();
		}
		if ( $languages === null ) {
			$languages = apply_filters( 'wpml_active_languages', array() );
		}
		if ( $default_lang === null ) {
			$default_lang = apply_filters( 'wpml_default_language', 'en' );
		}

		// Get translations.
		$translations = $this->get_product_translations( $product_id, $is_variation );

		// Build price data for source product.
		$source_prices = array();
		$default_currency = $this->prices->get_default_currency();

		// Default currency prices - normalize to ensure they are strings
		$source_regular = $product->get_regular_price();
		$source_sale = $product->get_sale_price();
		$source_price = $product->get_price();
		
		$source_prices[ $default_currency ] = array(
			'regular_price' => ( $source_regular !== '' && $source_regular !== null ) ? (string) $source_regular : '',
			'sale_price'    => ( $source_sale !== '' && $source_sale !== null ) ? (string) $source_sale : '',
			'price'         => ( $source_price !== '' && $source_price !== null ) ? (string) $source_price : '',
		);

		// Multi-currency prices - normalize to ensure they are strings
		foreach ( $currencies as $currency => $currency_data ) {
			if ( $currency === $default_currency ) {
				continue;
			}

			$curr_regular = get_post_meta( $product_id, '_regular_price_' . $currency, true );
			$curr_sale = get_post_meta( $product_id, '_sale_price_' . $currency, true );
			$curr_price = get_post_meta( $product_id, '_price_' . $currency, true );

			$source_prices[ $currency ] = array(
				'regular_price' => ( $curr_regular !== '' && $curr_regular !== null ) ? (string) $curr_regular : '',
				'sale_price'    => ( $curr_sale !== '' && $curr_sale !== null ) ? (string) $curr_sale : '',
				'price'         => ( $curr_price !== '' && $curr_price !== null ) ? (string) $curr_price : '',
			);
		}

		// Build translation price data.
		$translation_prices = array();
		$is_synced = true;

		foreach ( $translations as $lang => $trans_id ) {
			if ( (int) $trans_id === (int) $product_id ) {
				continue; // Skip source.
			}

			$trans_prices = array();

			// Default currency: use wc_get_product so WCML filters return the effective price
			// (e.g. when the translation inherits from source or uses custom prices).
			$trans_product = wc_get_product( $trans_id );
			if ( $trans_product ) {
				$trans_regular = $trans_product->get_regular_price();
				$trans_sale    = $trans_product->get_sale_price();
				$trans_price   = $trans_product->get_price();
			} else {
				$trans_regular = get_post_meta( $trans_id, '_regular_price', true );
				$trans_sale    = get_post_meta( $trans_id, '_sale_price', true );
				$trans_price   = get_post_meta( $trans_id, '_price', true );
			}

			// Normalize
			$source_regular = (string) ( $source_prices[ $default_currency ]['regular_price'] ?? '' );
			$source_sale    = (string) ( $source_prices[ $default_currency ]['sale_price'] ?? '' );
			$source_price   = (string) ( $source_prices[ $default_currency ]['price'] ?? '' );
			$trans_regular  = ( $trans_regular !== '' && $trans_regular !== null ) ? (string) $trans_regular : '';
			$trans_sale     = ( $trans_sale !== '' && $trans_sale !== null ) ? (string) $trans_sale : '';
			$trans_price    = ( $trans_price !== '' && $trans_price !== null ) ? (string) $trans_price : '';

			// Show translation price if set, otherwise source (always display a value)
			$display_regular = $trans_regular !== '' ? $trans_regular : $source_regular;
			$display_sale    = $trans_sale !== '' ? $trans_sale : $source_sale;
			$display_price   = $trans_price !== '' ? $trans_price : $source_price;

			$matches = ( $source_regular === $trans_regular || ( $trans_regular === '' && $source_regular === '' ) );

			$trans_prices[ $default_currency ] = array(
				'regular_price' => $display_regular,
				'sale_price'    => $display_sale,
				'price'         => $display_price,
				'matches'       => $matches,
			);

			if ( ! $matches ) {
				$is_synced = false;
			}

			// Multi-currency: direct meta, fallback to source
			foreach ( $currencies as $currency => $currency_data ) {
				if ( $currency === $default_currency ) {
					continue;
				}

				$curr_regular = get_post_meta( $trans_id, '_regular_price_' . $currency, true );
				$curr_sale    = get_post_meta( $trans_id, '_sale_price_' . $currency, true );
				$curr_price   = get_post_meta( $trans_id, '_price_' . $currency, true );

				$source_curr_regular = (string) ( $source_prices[ $currency ]['regular_price'] ?? '' );
				$source_curr_sale    = (string) ( $source_prices[ $currency ]['sale_price'] ?? '' );
				$source_curr_price   = (string) ( $source_prices[ $currency ]['price'] ?? '' );
				$curr_regular        = ( $curr_regular !== '' && $curr_regular !== null ) ? (string) $curr_regular : '';
				$curr_sale           = ( $curr_sale !== '' && $curr_sale !== null ) ? (string) $curr_sale : '';
				$curr_price          = ( $curr_price !== '' && $curr_price !== null ) ? (string) $curr_price : '';

				$matches = ( $source_curr_regular === $curr_regular || ( $curr_regular === '' && $source_curr_regular === '' ) );

				$display_curr_regular = $curr_regular !== '' ? $curr_regular : $source_curr_regular;
				$display_curr_sale    = $curr_sale !== '' ? $curr_sale : $source_curr_sale;
				$display_curr_price   = $curr_price !== '' ? $curr_price : $source_curr_price;

				$trans_prices[ $currency ] = array(
					'regular_price' => $display_curr_regular,
					'sale_price'    => $display_curr_sale,
					'price'         => $display_curr_price,
					'matches'       => $matches,
				);

				if ( ! $matches ) {
					$is_synced = false;
				}
			}

			$translation_prices[ $lang ] = array(
				'product_id' => $trans_id,
				'prices'     => $trans_prices,
			);
		}

		// Get product name and parent info for variations.
		$product_name = $product->get_name();
		$parent_id = null;
		$parent_name = '';

		if ( $is_variation ) {
			$parent_id = $product->get_parent_id();
			$parent = wc_get_product( $parent_id );
			if ( $parent ) {
				$parent_name = $parent->get_name();
			}
		}

		// Determine source language.
		$source_lang = $default_lang;
		foreach ( $translations as $lang => $trans_id ) {
			if ( (int) $trans_id === (int) $product_id ) {
				$source_lang = $lang;
				break;
			}
		}

		// Get frontend URLs for source and translations
		$frontend_urls = array();
		$frontend_urls[ $source_lang ] = $this->get_product_frontend_url( $product_id, $source_lang );

		foreach ( $translations as $lang => $trans_id ) {
			if ( (int) $trans_id === (int) $product_id ) {
				continue; // Skip source
			}
			$frontend_urls[ $lang ] = $this->get_product_frontend_url( $trans_id, $lang );
		}

		return array(
			'product_id'         => $product_id,
			'product_name'       => $product_name,
			'product_type'       => $is_variation ? 'variation' : $product->get_type(),
			'is_variation'       => $is_variation,
			'parent_id'          => $parent_id,
			'parent_name'        => $parent_name,
			'source_lang'        => $source_lang,
			'source_prices'      => $source_prices,
			'translations'       => $translation_prices,
			'is_synced'          => $is_synced,
			'edit_url'           => get_edit_post_link( $product_id, 'raw' ),
			'frontend_urls'      => $frontend_urls,
		);
	}

	/**
	 * AJAX: Get products for price sync page.
	 */
	public function ajax_get_products_price_sync() {
		check_ajax_referer( 'afs_wcml_sync_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission refusée.', 'afs-wcml-api' ) ) );
		}

		$args = array(
			'per_page'           => isset( $_POST['per_page'] ) ? absint( $_POST['per_page'] ) : 20,
			'page'               => isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1,
			'product_type'       => isset( $_POST['product_type'] ) ? sanitize_text_field( $_POST['product_type'] ) : '',
			'sync_status'        => isset( $_POST['sync_status'] ) ? sanitize_text_field( $_POST['sync_status'] ) : '',
			'search'             => isset( $_POST['search'] ) ? sanitize_text_field( $_POST['search'] ) : '',
			'include_variations' => isset( $_POST['include_variations'] ) ? (bool) $_POST['include_variations'] : true,
		);

		$data = $this->get_products_price_comparison( $args );
		
		// Get languages for rendering - only pass language codes as array, not the full WPML object
		$default_lang = apply_filters( 'wpml_default_language', 'en' );
		$data['default_lang'] = $default_lang;
		// Note: $data['languages'] is already correctly set as array_keys() by get_products_price_comparison()
		
		wp_send_json_success( $data );
	}
}
