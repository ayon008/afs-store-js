<?php
/**
 * Shipping rates converter for WCML multi-currency support.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_Shipping_Converter class.
 */
class AFS_WCML_Shipping_Converter {

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
		// Hook into WooCommerce REST API cart response to convert shipping rates.
		add_filter( 'woocommerce_rest_prepare_cart_object', array( $this, 'convert_shipping_rates' ), 20, 3 );
		add_filter( 'woocommerce_rest_cart_response', array( $this, 'convert_shipping_rates_in_response' ), 20, 1 );
	}

	/**
	 * Convert shipping rates in cart object response.
	 *
	 * @param WP_REST_Response $response Response object.
	 * @param WC_Cart          $cart     Cart object.
	 * @param WP_REST_Request  $request  Request object.
	 * @return WP_REST_Response
	 */
	public function convert_shipping_rates( $response, $cart, $request ) {
		if ( ! $response || ! is_a( $response, 'WP_REST_Response' ) ) {
			return $response;
		}

		$data = $response->get_data();

		// Convert shipping rates if present.
		if ( isset( $data['shipping_rates'] ) && is_array( $data['shipping_rates'] ) ) {
			$data['shipping_rates'] = $this->convert_shipping_rates_array( $data['shipping_rates'] );
			$response->set_data( $data );
		}

		return $response;
	}

	/**
	 * Convert shipping rates in cart response (alternative hook).
	 *
	 * @param array $response Cart response data.
	 * @return array
	 */
	public function convert_shipping_rates_in_response( $response ) {
		if ( ! is_array( $response ) ) {
			return $response;
		}

		// Convert shipping rates if present.
		if ( isset( $response['shipping_rates'] ) && is_array( $response['shipping_rates'] ) ) {
			$response['shipping_rates'] = $this->convert_shipping_rates_array( $response['shipping_rates'] );
		}

		return $response;
	}

	/**
	 * Convert shipping rates array.
	 *
	 * @param array $shipping_rates Array of shipping rate objects.
	 * @return array
	 */
	private function convert_shipping_rates_array( $shipping_rates ) {
		if ( ! is_array( $shipping_rates ) || empty( $shipping_rates ) ) {
			return $shipping_rates;
		}

		// Get client currency from WCML.
		$client_currency = $this->get_client_currency();
		if ( ! $client_currency ) {
			return $shipping_rates;
		}

		// Get default currency.
		$default_currency = $this->get_default_currency();
		if ( ! $default_currency ) {
			return $shipping_rates;
		}

		// If client currency is the same as default, no conversion needed.
		if ( $client_currency === $default_currency ) {
			return $shipping_rates;
		}

		// Get exchange rate.
		$exchange_rate = $this->get_exchange_rate( $client_currency );
		if ( ! $exchange_rate || $exchange_rate <= 0 ) {
			// Log warning but return original rates.
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( sprintf( '[AFS WCML] Exchange rate not found for currency %s, using original shipping rates.', $client_currency ) );
			}
			return $shipping_rates;
		}

		// Check if this is a nested structure (shipping packages).
		// WooCommerce can return shipping_rates as an array of packages, each containing shipping_rates.
		$first_item = reset( $shipping_rates );
		if ( is_array( $first_item ) && isset( $first_item['shipping_rates'] ) && is_array( $first_item['shipping_rates'] ) ) {
			// This is a nested structure (packages).
			$converted_rates = array();
			foreach ( $shipping_rates as $package ) {
				$converted_package = $package;
				if ( isset( $package['shipping_rates'] ) && is_array( $package['shipping_rates'] ) ) {
					$converted_package['shipping_rates'] = array();
					foreach ( $package['shipping_rates'] as $rate ) {
						$converted_package['shipping_rates'][] = $this->convert_single_shipping_rate( $rate, $exchange_rate, $client_currency );
					}
				}
				$converted_rates[] = $converted_package;
			}
			return $converted_rates;
		}

		// Standard flat structure - convert each shipping rate directly.
		$converted_rates = array();
		foreach ( $shipping_rates as $rate ) {
			$converted_rates[] = $this->convert_single_shipping_rate( $rate, $exchange_rate, $client_currency );
		}

		return $converted_rates;
	}

	/**
	 * Convert a single shipping rate.
	 *
	 * @param array|object $rate          Shipping rate data.
	 * @param float        $exchange_rate Exchange rate.
	 * @param string       $currency     Target currency code.
	 * @return array|object
	 */
	private function convert_single_shipping_rate( $rate, $exchange_rate, $currency ) {
		// Handle both array and object formats.
		$is_object = is_object( $rate );
		$rate_data = $is_object ? (array) $rate : $rate;

		// Convert price (stored in centimes).
		if ( isset( $rate_data['price'] ) && is_numeric( $rate_data['price'] ) ) {
			$price_in_default = floatval( $rate_data['price'] ) / 100; // Convert from centimes to currency.
			$price_in_target  = $price_in_default * $exchange_rate;
			$price_in_target  = round( $price_in_target, 2 ); // Round to 2 decimal places.
			$rate_data['price'] = intval( $price_in_target * 100 ); // Convert back to centimes.
		}

		// Convert taxes if present.
		if ( isset( $rate_data['taxes'] ) && is_array( $rate_data['taxes'] ) ) {
			foreach ( $rate_data['taxes'] as $key => $tax_value ) {
				if ( is_numeric( $tax_value ) ) {
					$tax_in_default = floatval( $tax_value ) / 100;
					$tax_in_target  = $tax_in_default * $exchange_rate;
					$tax_in_target  = round( $tax_in_target, 2 );
					$rate_data['taxes'][ $key ] = intval( $tax_in_target * 100 );
				}
			}
		}

		// Update all currency-related fields.
		$currency_info = $this->get_currency_info( $currency );
		$rate_data['currency_code'] = $currency;
		$rate_data['currency_symbol'] = $currency_info['symbol'];
		$rate_data['currency_minor_unit'] = $currency_info['minor_unit'];
		$rate_data['currency_decimal_separator'] = $currency_info['decimal_separator'];
		$rate_data['currency_thousand_separator'] = $currency_info['thousand_separator'];
		$rate_data['currency_prefix'] = $currency_info['prefix'];
		$rate_data['currency_suffix'] = $currency_info['suffix'];

		// Update currency in rate data if field exists (legacy support).
		if ( isset( $rate_data['currency'] ) ) {
			$rate_data['currency'] = $currency;
		}

		// Return in original format.
		return $is_object ? (object) $rate_data : $rate_data;
	}

	/**
	 * Get currency formatting information.
	 *
	 * @param string $currency_code Currency code (EUR, USD, GBP).
	 * @return array Currency formatting info.
	 */
	private function get_currency_info( $currency_code ) {
		$currency_code = strtoupper( $currency_code );
		
		$currencies = array(
			'EUR' => array(
				'symbol' => '€',
				'minor_unit' => 2,
				'decimal_separator' => ',',
				'thousand_separator' => '',
				'prefix' => '',
				'suffix' => '€',
			),
			'USD' => array(
				'symbol' => '$',
				'minor_unit' => 2,
				'decimal_separator' => '.',
				'thousand_separator' => ',',
				'prefix' => '$',
				'suffix' => '',
			),
			'GBP' => array(
				'symbol' => '£',
				'minor_unit' => 2,
				'decimal_separator' => '.',
				'thousand_separator' => ',',
				'prefix' => '£',
				'suffix' => '',
			),
		);

		// Return currency info or default to EUR.
		return isset( $currencies[ $currency_code ] ) ? $currencies[ $currency_code ] : $currencies['EUR'];
	}

	/**
	 * Get client currency from WCML.
	 *
	 * @return string|null Currency code or null if not available.
	 */
	private function get_client_currency() {
		global $woocommerce_wpml;

		// Check if WCML is available.
		if ( ! $woocommerce_wpml || ! isset( $woocommerce_wpml->multi_currency ) ) {
			return null;
		}

		// Try to get currency from WCML.
		$client_currency = $woocommerce_wpml->multi_currency->get_client_currency();
		if ( $client_currency ) {
			return strtoupper( $client_currency );
		}

		// Fallback: try to get from cookie.
		if ( isset( $_COOKIE['wcml_client_currency'] ) ) {
			$cookie_currency = sanitize_text_field( $_COOKIE['wcml_client_currency'] );
			if ( $cookie_currency ) {
				return strtoupper( $cookie_currency );
			}
		}

		return null;
	}

	/**
	 * Get default currency.
	 *
	 * @return string|null Currency code or null if not available.
	 */
	private function get_default_currency() {
		global $woocommerce_wpml;

		if ( ! $woocommerce_wpml || ! isset( $woocommerce_wpml->multi_currency ) ) {
			return get_woocommerce_currency();
		}

		$default_currency = $woocommerce_wpml->multi_currency->get_default_currency();
		return $default_currency ? strtoupper( $default_currency ) : get_woocommerce_currency();
	}

	/**
	 * Get exchange rate for a currency.
	 *
	 * @param string $currency_code Currency code.
	 * @return float|null Exchange rate or null if not available.
	 */
	private function get_exchange_rate( $currency_code ) {
		global $woocommerce_wpml;

		if ( ! $woocommerce_wpml || ! isset( $woocommerce_wpml->multi_currency ) ) {
			return null;
		}

		// Get currency rate from WCML.
		$rate = $woocommerce_wpml->multi_currency->get_currency_rate( $currency_code );
		
		if ( $rate && is_numeric( $rate ) && $rate > 0 ) {
			return floatval( $rate );
		}

		// Fallback: try to get from currencies array.
		$currencies = $woocommerce_wpml->multi_currency->get_currencies();
		if ( isset( $currencies[ $currency_code ] ) && isset( $currencies[ $currency_code ]['rate'] ) ) {
			$rate = $currencies[ $currency_code ]['rate'];
			if ( is_numeric( $rate ) && $rate > 0 ) {
				return floatval( $rate );
			}
		}

		return null;
	}
}
