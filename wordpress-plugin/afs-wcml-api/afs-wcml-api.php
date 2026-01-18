<?php
/**
 * Plugin Name: AFS WCML Manual Pricing
 * Plugin URI: https://afs-foiling.com
 * Description: Plugin personnalisé pour gérer les prix manuels par devise avec WooCommerce Multilingual (WCML). Permet de définir des prix fixes par devise (USD, EUR, GBP) qui sont persistés et utilisés dans le panier, checkout, commandes et remboursements.
 * Version: 2.0.27
 * Author: AFS
 * Author URI: https://afs-foiling.com
 * Text Domain: afs-wcml-api
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'AFS_WCML_API_VERSION', '2.0.27' );
define( 'AFS_WCML_API_PLUGIN_FILE', __FILE__ );
define( 'AFS_WCML_API_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AFS_WCML_API_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'AFS_WCML_API_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Define headless frontend URL (can be overridden in wp-config.php).
if ( ! defined( 'HEADLESS_URL' ) ) {
	define( 'HEADLESS_URL', 'https://staging.afs-foiling.com' );
}

/**
 * Main plugin class.
 */
final class AFS_WCML_API {

	/**
	 * Plugin instance.
	 *
	 * @var AFS_WCML_API
	 */
	private static $instance = null;

	/**
	 * Core class instance.
	 *
	 * @var AFS_WCML_Core
	 */
	public $core;

	/**
	 * Get plugin instance.
	 *
	 * @return AFS_WCML_API
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->init();
	}

	/**
	 * Initialize plugin.
	 */
	private function init() {
		// Load plugin files first (needed for API routes).
		$this->load_files();

		// Check dependencies.
		if ( ! $this->check_dependencies() ) {
			// Even if dependencies are missing, register API routes
			// so we can return proper error messages.
			$this->init_api_routes_only();
			return;
		}

		// Initialize core (includes API routes).
		$this->core = new AFS_WCML_Core();
	}

	/**
	 * Initialize API routes only (when dependencies are missing).
	 */
	private function init_api_routes_only() {
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-prices.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-api.php';

		$prices = new AFS_WCML_Prices();
		$api = new AFS_WCML_REST_API( $prices );
	}

	/**
	 * Check if required plugins are active.
	 *
	 * @return bool
	 */
	private function check_dependencies() {
		// Check if WooCommerce is active.
		if ( ! class_exists( 'WooCommerce' ) ) {
			add_action( 'admin_notices', array( $this, 'woocommerce_missing_notice' ) );
			return false;
		}

		// Check if WCML is active.
		if ( ! defined( 'WCML_VERSION' ) ) {
			add_action( 'admin_notices', array( $this, 'wcml_missing_notice' ) );
			return false;
		}

		return true;
	}

	/**
	 * Load plugin files.
	 */
	private function load_files() {
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-prices.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-core.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-price-sync.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-acf-sync.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-location-stock-sync.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-admin.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-api.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-csv-import.php';
		require_once AFS_WCML_API_PLUGIN_DIR . 'includes/class-afs-wcml-shipping-converter.php';
	}

	/**
	 * WooCommerce missing notice.
	 */
	public function woocommerce_missing_notice() {
		?>
		<div class="error">
			<p>
				<strong><?php esc_html_e( 'AFS WCML Manual Pricing', 'afs-wcml-api' ); ?></strong> 
				<?php esc_html_e( 'nécessite WooCommerce pour fonctionner. Veuillez installer et activer WooCommerce.', 'afs-wcml-api' ); ?>
			</p>
		</div>
		<?php
	}

	/**
	 * WCML missing notice.
	 */
	public function wcml_missing_notice() {
		?>
		<div class="error">
			<p>
				<strong><?php esc_html_e( 'AFS WCML Manual Pricing', 'afs-wcml-api' ); ?></strong> 
				<?php esc_html_e( 'nécessite WooCommerce Multilingual (WCML) pour fonctionner. Veuillez installer et activer WCML.', 'afs-wcml-api' ); ?>
			</p>
		</div>
		<?php
	}
}

/**
 * Initialize plugin.
 */
function afs_wcml_api() {
	return AFS_WCML_API::instance();
}

// Start the plugin early to ensure routes are registered.
// Priority 5 to run before most other plugins.
add_action( 'plugins_loaded', 'afs_wcml_api', 5 );

// Also initialize immediately if plugins_loaded has already fired.
if ( did_action( 'plugins_loaded' ) ) {
	afs_wcml_api();
}
