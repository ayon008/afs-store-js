<?php
/**
 * Core plugin class.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_Core class.
 */
class AFS_WCML_Core {

	/**
	 * Prices instance.
	 *
	 * @var AFS_WCML_Prices
	 */
	public $prices;

	/**
	 * Price Sync instance.
	 *
	 * @var AFS_WCML_Price_Sync
	 */
	public $price_sync;

	/**
	 * ACF Sync instance.
	 *
	 * @var AFS_WCML_ACF_Sync
	 */
	public $acf_sync;

	/**
	 * Location Stock Sync instance.
	 *
	 * @var AFS_WCML_Location_Stock_Sync
	 */
	public $location_stock_sync;

	/**
	 * Admin instance.
	 *
	 * @var AFS_WCML_Admin
	 */
	public $admin;

	/**
	 * API instance.
	 *
	 * @var AFS_WCML_REST_API
	 */
	public $api;

	/**
	 * CSV Import instance.
	 *
	 * @var AFS_WCML_CSV_Import
	 */
	public $csv_import;

	/**
	 * Cart API instance.
	 *
	 * @var AFS_WCML_Cart_API
	 */
	public $cart_api;

	/**
	 * Shipping Converter instance.
	 *
	 * @var AFS_WCML_Shipping_Converter
	 */
	public $shipping_converter;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->prices            = new AFS_WCML_Prices();
		$this->price_sync        = new AFS_WCML_Price_Sync( $this->prices );
		$this->acf_sync          = new AFS_WCML_ACF_Sync();
		$this->location_stock_sync = new AFS_WCML_Location_Stock_Sync();
		$this->admin             = new AFS_WCML_Admin( $this->prices, $this->price_sync, $this->acf_sync, $this->location_stock_sync );
		$this->api        = new AFS_WCML_REST_API( $this->prices );
		$this->csv_import = new AFS_WCML_CSV_Import( $this->prices );

		// Only load cart API if class exists.
		if ( class_exists( 'AFS_WCML_Cart_API' ) ) {
			$this->cart_api = new AFS_WCML_Cart_API();
		}

		// Initialize shipping converter for multi-currency support.
		$this->shipping_converter = new AFS_WCML_Shipping_Converter();

		$this->init_hooks();
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		// Ensure automatic conversion is disabled for products with manual prices.
		add_action( 'woocommerce_process_product_meta', array( $this, 'handle_product_save' ), 20, 1 );
		add_action( 'woocommerce_save_product_variation', array( $this, 'handle_variation_save' ), 20, 2 );
		add_action( 'save_post', array( $this, 'handle_post_save' ), 20, 2 );
	}

	/**
	 * Handle product save.
	 *
	 * @param int $post_id Post ID.
	 */
	public function handle_product_save( $post_id ) {
		// Check if this is a product.
		$product = wc_get_product( $post_id );
		if ( ! $product ) {
			return;
		}

		// Skip variable products (variations are handled separately).
		if ( $product->is_type( 'variable' ) ) {
			return;
		}

		// If product has manual prices, disable auto conversion.
		if ( $this->prices->has_manual_prices( $post_id ) ) {
			$this->prices->disable_auto_conversion( $post_id );
		}
	}

	/**
	 * Handle variation save.
	 *
	 * @param int $variation_id Variation ID.
	 * @param int $i            Loop index (not used).
	 */
	public function handle_variation_save( $variation_id, $i = 0 ) {
		// If variation has manual prices, disable auto conversion.
		if ( $this->prices->has_manual_prices( $variation_id ) ) {
			$this->prices->disable_auto_conversion( $variation_id );
		}
	}

	/**
	 * Handle post save (fallback).
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 */
	public function handle_post_save( $post_id, $post ) {
		// Only process product post types.
		if ( $post->post_type !== 'product' ) {
			return;
		}

		// Skip autosaves and revisions.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}

		$product = wc_get_product( $post_id );
		if ( ! $product ) {
			return;
		}

		// Skip variable products (variations are handled separately).
		if ( $product->is_type( 'variable' ) ) {
			return;
		}

		// If product has manual prices, disable auto conversion.
		if ( $this->prices->has_manual_prices( $post_id ) ) {
			$this->prices->disable_auto_conversion( $post_id );
		}
	}
}

