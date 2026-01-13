<?php
/**
 * Price management class for WCML integration.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_Prices class.
 */
class AFS_WCML_Prices {

	/**
	 * Get active currencies from WCML.
	 *
	 * @param bool $include_default Whether to include the default currency.
	 * @return array
	 */
	public function get_active_currencies( $include_default = false ) {
		global $woocommerce_wpml;

		$active_currencies = array();

		// Always add default currency first if requested.
		if ( $include_default ) {
			$default_currency = $this->get_default_currency();
			$active_currencies[ $default_currency ] = array(
				'is_default' => true,
			);
		}

		if ( ! $woocommerce_wpml || ! isset( $woocommerce_wpml->multi_currency ) ) {
			return $active_currencies;
		}

		$currencies = $woocommerce_wpml->multi_currency->get_currencies();

		if ( ! empty( $currencies ) ) {
			foreach ( $currencies as $code => $currency ) {
				$active_currencies[ $code ] = $currency;
			}
		}

		return $active_currencies;
	}

	/**
	 * Get all currencies including default.
	 *
	 * @return array
	 */
	public function get_all_currencies() {
		return $this->get_active_currencies( true );
	}

	/**
	 * Get default currency.
	 *
	 * @return string
	 */
	public function get_default_currency() {
		global $woocommerce_wpml;

		if ( ! $woocommerce_wpml || ! isset( $woocommerce_wpml->multi_currency ) ) {
			return get_woocommerce_currency();
		}

		return $woocommerce_wpml->multi_currency->get_default_currency();
	}

	/**
	 * Save product prices using WCML API.
	 *
	 * @param int   $product_id Product ID.
	 * @param array $prices     Prices array in format: ['USD' => ['regular_price' => 100, 'sale_price' => ''], ...].
	 * @return bool
	 */
	public function save_product_prices( $product_id, $prices ) {
		if ( ! $product_id || empty( $prices ) ) {
			return false;
		}

		// Validate product exists.
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return false;
		}

		global $woocommerce_wpml;

		if ( ! $woocommerce_wpml || ! isset( $woocommerce_wpml->multi_currency ) ) {
			return false;
		}

		// Format prices array to ensure correct structure.
		$formatted_prices = $this->format_prices_array( $prices );

		// Save prices for each currency using WCML's method.
		foreach ( $formatted_prices as $currency_code => $price_data ) {
			$regular_price = isset( $price_data['regular_price'] ) ? $price_data['regular_price'] : '';
			$sale_price    = isset( $price_data['sale_price'] ) ? $price_data['sale_price'] : '';

			// Save regular price.
			if ( $regular_price !== '' ) {
				update_post_meta( $product_id, '_price_' . $currency_code, $regular_price );
				update_post_meta( $product_id, '_regular_price_' . $currency_code, $regular_price );
			} else {
				// Remove price if empty.
				delete_post_meta( $product_id, '_price_' . $currency_code );
				delete_post_meta( $product_id, '_regular_price_' . $currency_code );
			}

			// Save sale price.
			if ( $sale_price !== '' ) {
				update_post_meta( $product_id, '_sale_price_' . $currency_code, $sale_price );
			} else {
				delete_post_meta( $product_id, '_sale_price_' . $currency_code );
			}
		}

		// Use WCML's internal API to properly register the prices.
		// This action will persist prices and disable automatic conversion for this product.
		do_action( 'wcml_set_product_prices', $product_id, $formatted_prices );

		// Explicitly disable auto conversion.
		$this->disable_auto_conversion( $product_id );

		// Clear product cache.
		wc_delete_product_transients( $product_id );

		return true;
	}

	/**
	 * Get product prices from WCML.
	 * Includes both manual WCML prices and default WooCommerce prices.
	 *
	 * @param int $product_id Product ID.
	 * @return array
	 */
	public function get_product_prices( $product_id ) {
		if ( ! $product_id ) {
			return array();
		}

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return array();
		}

		global $woocommerce_wpml;

		$prices = array();
		$default_currency = $this->get_default_currency();
		
		// Get default WooCommerce prices (always include default currency).
		$default_regular_price = $product->get_regular_price();
		$default_sale_price = $product->get_sale_price();
		
		$prices[ $default_currency ] = array(
			'regular_price' => $default_regular_price ? (float) $default_regular_price : '',
			'sale_price'    => $default_sale_price ? (float) $default_sale_price : '',
			'is_default'    => true,
		);

		// Get WCML manual prices for other currencies.
		if ( $woocommerce_wpml && isset( $woocommerce_wpml->multi_currency ) ) {
			$currencies = $this->get_active_currencies();

			foreach ( $currencies as $currency_code => $currency_data ) {
				// Skip default currency (already added above).
				if ( $currency_code === $default_currency ) {
					continue;
				}

				// Try to get manual prices from WCML meta.
				$regular_price = get_post_meta( $product_id, '_price_' . $currency_code, true );
				$sale_price    = get_post_meta( $product_id, '_sale_price_' . $currency_code, true );
				$regular_price_meta = get_post_meta( $product_id, '_regular_price_' . $currency_code, true );

				// Use regular_price meta if _price_ is not set.
				if ( ! $regular_price && $regular_price_meta ) {
					$regular_price = $regular_price_meta;
				}

				$prices[ $currency_code ] = array(
					'regular_price' => $regular_price ? (float) $regular_price : '',
					'sale_price'    => $sale_price ? (float) $sale_price : '',
					'is_default'    => false,
					'is_manual'     => (bool) ( $regular_price || $sale_price ),
				);
			}
		}

		return $prices;
	}

	/**
	 * Format prices array to WCML structure.
	 *
	 * @param array $prices_data Raw prices data.
	 * @return array
	 */
	public function format_prices_array( $prices_data ) {
		$formatted = array();

		foreach ( $prices_data as $currency => $price_data ) {
			if ( ! is_array( $price_data ) ) {
				continue;
			}

			$regular_price = isset( $price_data['regular_price'] ) ? $this->sanitize_price( $price_data['regular_price'] ) : '';
			$sale_price    = isset( $price_data['sale_price'] ) ? $this->sanitize_price( $price_data['sale_price'] ) : '';

			// Only add currency if regular_price is set.
			if ( $regular_price !== '' ) {
				$formatted[ strtoupper( $currency ) ] = array(
					'regular_price' => $regular_price,
					'sale_price'    => $sale_price,
				);
			}
		}

		return $formatted;
	}

	/**
	 * Sanitize price value.
	 *
	 * @param mixed $price Price value.
	 * @return string|float
	 */
	public function sanitize_price( $price ) {
		if ( $price === '' || $price === null ) {
			return '';
		}

		// Convert to float and ensure positive value.
		$price = floatval( $price );
		if ( $price < 0 ) {
			$price = 0;
		}

		return $price;
	}

	/**
	 * Validate price data.
	 *
	 * @param array $prices Prices array.
	 * @return bool|WP_Error
	 */
	public function validate_prices( $prices ) {
		if ( ! is_array( $prices ) || empty( $prices ) ) {
			return new WP_Error( 'invalid_prices', __( 'Les prix doivent être un tableau non vide.', 'afs-wcml-api' ) );
		}

		$active_currencies = array_keys( $this->get_active_currencies() );

		foreach ( $prices as $currency => $price_data ) {
			// Validate currency code.
			if ( ! in_array( strtoupper( $currency ), $active_currencies, true ) ) {
				return new WP_Error(
					'invalid_currency',
					sprintf( __( 'La devise %s n\'est pas active dans WCML.', 'afs-wcml-api' ), esc_html( $currency ) )
				);
			}

			// Validate price data structure.
			if ( ! is_array( $price_data ) ) {
				return new WP_Error(
					'invalid_price_structure',
					sprintf( __( 'Structure de prix invalide pour la devise %s.', 'afs-wcml-api' ), esc_html( $currency ) )
				);
			}

			// Validate regular_price.
			if ( isset( $price_data['regular_price'] ) && $price_data['regular_price'] !== '' ) {
				$regular_price = $this->sanitize_price( $price_data['regular_price'] );
				if ( $regular_price === '' || $regular_price < 0 ) {
					return new WP_Error(
						'invalid_regular_price',
						sprintf( __( 'Prix régulier invalide pour la devise %s.', 'afs-wcml-api' ), esc_html( $currency ) )
					);
				}
			}

			// Validate sale_price if provided.
			if ( isset( $price_data['sale_price'] ) && $price_data['sale_price'] !== '' ) {
				$sale_price = $this->sanitize_price( $price_data['sale_price'] );
				if ( $sale_price < 0 ) {
					return new WP_Error(
						'invalid_sale_price',
						sprintf( __( 'Prix de vente invalide pour la devise %s.', 'afs-wcml-api' ), esc_html( $currency ) )
					);
				}

				// Sale price should be less than regular price.
				if ( isset( $price_data['regular_price'] ) && $price_data['regular_price'] !== '' ) {
					$regular_price = $this->sanitize_price( $price_data['regular_price'] );
					if ( $sale_price >= $regular_price ) {
						return new WP_Error(
							'invalid_sale_price_range',
							sprintf( __( 'Le prix de vente doit être inférieur au prix régulier pour la devise %s.', 'afs-wcml-api' ), esc_html( $currency ) )
						);
					}
				}
			}
		}

		return true;
	}

	/**
	 * Check if product has manual prices.
	 *
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	public function has_manual_prices( $product_id ) {
		$prices = $this->get_product_prices( $product_id );
		return ! empty( $prices );
	}

	/**
	 * Disable automatic conversion for a product.
	 *
	 * This is handled automatically by WCML when using wcml_set_product_prices,
	 * but we can also explicitly set the flag.
	 *
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public function disable_auto_conversion( $product_id ) {
		// WCML automatically disables conversion when manual prices are set via wcml_set_product_prices.
		// This method is kept for explicit control if needed.
		update_post_meta( $product_id, '_wcml_custom_prices_status', 1 );
	}
}

