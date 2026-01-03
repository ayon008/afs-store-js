<?php
/**
 * Admin interface class.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_Admin class.
 */
class AFS_WCML_Admin {

	/**
	 * Prices instance.
	 *
	 * @var AFS_WCML_Prices
	 */
	private $prices;

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
		// Admin interface removed - prices are managed via API only.
		// WCML's native interface in General tab handles the prices correctly.
	}

}

