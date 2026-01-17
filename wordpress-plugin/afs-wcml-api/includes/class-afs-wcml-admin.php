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
	 * Price sync instance.
	 *
	 * @var AFS_WCML_Price_Sync
	 */
	private $price_sync;

	/**
	 * ACF sync instance.
	 *
	 * @var AFS_WCML_ACF_Sync
	 */
	private $acf_sync;

	/**
	 * Location Stock Sync instance.
	 *
	 * @var AFS_WCML_Location_Stock_Sync
	 */
	private $location_stock_sync;

	/**
	 * Constructor.
	 *
	 * @param AFS_WCML_Prices                $prices             Prices instance.
	 * @param AFS_WCML_Price_Sync           $price_sync         Price sync instance.
	 * @param AFS_WCML_ACF_Sync             $acf_sync           ACF sync instance.
	 * @param AFS_WCML_Location_Stock_Sync $location_stock_sync Location stock sync instance.
	 */
	public function __construct( $prices, $price_sync = null, $acf_sync = null, $location_stock_sync = null ) {
		$this->prices = $prices;
		$this->price_sync = $price_sync;
		$this->acf_sync = $acf_sync;
		$this->location_stock_sync = $location_stock_sync;
		$this->init_hooks();
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
		add_action( 'admin_init', array( $this, 'handle_settings_save' ) );
	}

	/**
	 * Add admin menu.
	 */
	public function add_admin_menu() {
		add_submenu_page(
			'woocommerce',
			__( 'Synchronisation Prix WCML', 'afs-wcml-api' ),
			__( 'Sync Prix Multi-Langue', 'afs-wcml-api' ),
			'manage_woocommerce',
			'afs-wcml-price-sync',
			array( $this, 'render_sync_page' )
		);

		add_submenu_page(
			'woocommerce',
			__( 'Synchronisation Champs ACF', 'afs-wcml-api' ),
			__( 'Sync Champs ACF', 'afs-wcml-api' ),
			'manage_woocommerce',
			'afs-wcml-acf-sync',
			array( $this, 'render_acf_sync_page' )
		);

		add_submenu_page(
			'woocommerce',
			__( 'Synchronisation Stock par Location', 'afs-wcml-api' ),
			__( 'Sync Stock Location', 'afs-wcml-api' ),
			'manage_woocommerce',
			'afs-wcml-location-stock-sync',
			array( $this, 'render_location_stock_sync_page' )
		);
	}

	/**
	 * Enqueue admin scripts.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_scripts( $hook ) {
		// Load scripts for all AFS WCML pages.
		if ( strpos( $hook, 'afs-wcml' ) === false ) {
			return;
		}

		wp_enqueue_style(
			'afs-wcml-admin',
			AFS_WCML_API_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			AFS_WCML_API_VERSION
		);

		wp_enqueue_script(
			'afs-wcml-admin',
			AFS_WCML_API_PLUGIN_URL . 'assets/js/admin.js',
			array( 'jquery' ),
			AFS_WCML_API_VERSION,
			true
		);

		// Enqueue price sync script only on price sync page
		if ( strpos( $hook, 'afs-wcml-price-sync' ) !== false ) {
			wp_enqueue_script(
				'afs-wcml-price-sync',
				AFS_WCML_API_PLUGIN_URL . 'assets/js/price-sync.js',
				array( 'jquery', 'afs-wcml-admin' ),
				AFS_WCML_API_VERSION,
				true
			);
		}

		// Enqueue ACF sync script only on ACF sync page
		if ( strpos( $hook, 'afs-wcml-acf-sync' ) !== false ) {
			wp_enqueue_script(
				'afs-wcml-acf-sync',
				AFS_WCML_API_PLUGIN_URL . 'assets/js/acf-sync.js',
				array( 'jquery', 'afs-wcml-admin' ),
				AFS_WCML_API_VERSION,
				true
			);
		}

		// Enqueue location stock sync script only on location stock sync page
		if ( strpos( $hook, 'afs-wcml-location-stock-sync' ) !== false ) {
			wp_enqueue_script(
				'afs-wcml-location-stock-sync',
				AFS_WCML_API_PLUGIN_URL . 'assets/js/location-stock-sync.js',
				array( 'jquery', 'afs-wcml-admin' ),
				AFS_WCML_API_VERSION,
				true
			);
		}

		wp_localize_script( 'afs-wcml-admin', 'afs_wcml_admin', array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'afs_wcml_sync_nonce' ),
			'i18n'     => array(
				'syncing'           => __( 'Synchronisation en cours...', 'afs-wcml-api' ),
				'sync_complete'     => __( 'Synchronisation terminée !', 'afs-wcml-api' ),
				'sync_error'        => __( 'Erreur lors de la synchronisation.', 'afs-wcml-api' ),
				'confirm_sync_all'  => __( 'Voulez-vous synchroniser les prix de tous les produits ? Cette opération peut prendre du temps.', 'afs-wcml-api' ),
				'processing'        => __( 'Traitement de %d/%d produits...', 'afs-wcml-api' ),
			),
		) );
	}

	/**
	 * Handle settings save.
	 */
	public function handle_settings_save() {
		if ( ! isset( $_POST['afs_wcml_sync_settings_nonce'] ) ) {
			return;
		}

		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['afs_wcml_sync_settings_nonce'] ) ), 'afs_wcml_sync_settings' ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		$auto_sync = isset( $_POST['afs_wcml_auto_sync'] ) ? true : false;

		if ( $this->price_sync ) {
			$this->price_sync->set_auto_sync( $auto_sync );
		}

		add_action( 'admin_notices', function() {
			?>
			<div class="notice notice-success is-dismissible">
				<p><?php esc_html_e( 'Paramètres sauvegardés.', 'afs-wcml-api' ); ?></p>
			</div>
			<?php
		} );
	}

	/**
	 * Render sync page.
	 */
	public function render_sync_page() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Vous n\'avez pas les permissions nécessaires.', 'afs-wcml-api' ) );
		}

		// Get active languages.
		$languages = apply_filters( 'wpml_active_languages', array() );
		$default_lang = apply_filters( 'wpml_default_language', 'en' );
		$default_currency = $this->prices->get_default_currency();
		// Get all currencies including default (EUR).
		$active_currencies = $this->prices->get_all_currencies();
		$currency_codes = array_keys( $active_currencies );
		$auto_sync_enabled = $this->price_sync ? $this->price_sync->is_auto_sync_enabled() : false;

		// Get ALL products with detailed price info.
		$all_data = array();
		$total_all = 0;
		// Defer sync status counts to AJAX for faster page load
		$total_synced = null; // Will be loaded via AJAX
		$total_unsync = null; // Will be loaded via AJAX
		$total_products = 0;
		$total_variations = 0;

		// Get initial data for counts only.
		$initial_data = array();
		if ( $this->price_sync ) {
			// Get initial data for display (20 products) - only this query on page load.
			$initial_data = $this->price_sync->get_products_price_comparison( array(
				'per_page'           => 20,
				'page'               => 1,
				'sync_status'        => '', // All products.
				'include_variations' => true,
			) );
			$total_all = isset( $initial_data['total'] ) ? $initial_data['total'] : 0;

			// NOTE: Sync status counts are now loaded via AJAX to avoid slow page load
			// See price-sync.js loadSyncStatusCounts() function
		} else {
			$total_all = 0;
		}

		?>
		<div class="wrap afs-wcml-sync-wrap">
			<h1><?php esc_html_e( 'Synchronisation des Prix Multi-Langue', 'afs-wcml-api' ); ?></h1>

			<div class="afs-wcml-info-box">
				<h3><?php esc_html_e( 'Comment ça marche ?', 'afs-wcml-api' ); ?></h3>
				<p><?php esc_html_e( 'Cette fonctionnalité synchronise automatiquement les prix entre les différentes traductions de vos produits. Quand vous modifiez le prix d\'un produit dans une langue, le même prix sera appliqué à toutes ses traductions.', 'afs-wcml-api' ); ?></p>
				<ul>
					<li><span class="afs-wcml-legend-match"></span> <?php esc_html_e( 'Prix synchronisé (identique à la source)', 'afs-wcml-api' ); ?></li>
					<li><span class="afs-wcml-legend-mismatch"></span> <?php esc_html_e( 'Prix non synchronisé (différent de la source)', 'afs-wcml-api' ); ?></li>
					<li><span class="afs-wcml-legend-empty"></span> <?php esc_html_e( 'Prix non défini', 'afs-wcml-api' ); ?></li>
				</ul>
			</div>

			<div class="afs-wcml-cards">
				<!-- Settings Card -->
				<div class="afs-wcml-card">
					<h2><?php esc_html_e( 'Paramètres', 'afs-wcml-api' ); ?></h2>
					<form method="post" action="">
						<?php wp_nonce_field( 'afs_wcml_sync_settings', 'afs_wcml_sync_settings_nonce' ); ?>

						<table class="form-table">
							<tr>
								<th scope="row">
									<label for="afs_wcml_auto_sync"><?php esc_html_e( 'Synchronisation automatique', 'afs-wcml-api' ); ?></label>
								</th>
								<td>
									<label class="afs-wcml-toggle">
										<input type="checkbox" name="afs_wcml_auto_sync" id="afs_wcml_auto_sync" value="1" <?php checked( $auto_sync_enabled ); ?> />
										<span class="afs-wcml-toggle-slider"></span>
									</label>
									<p class="description">
										<?php esc_html_e( 'Activer pour synchroniser automatiquement les prix quand vous sauvegardez un produit.', 'afs-wcml-api' ); ?>
									</p>
								</td>
							</tr>
						</table>

						<?php submit_button( __( 'Sauvegarder les paramètres', 'afs-wcml-api' ) ); ?>
					</form>
				</div>

				<!-- Status Card -->
				<div class="afs-wcml-card afs-wcml-card-wide">
					<h2><?php esc_html_e( 'État de la synchronisation', 'afs-wcml-api' ); ?></h2>

					<div class="afs-wcml-status-grid">
						<div class="afs-wcml-status-item">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Langues actives', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value"><?php echo count( $languages ); ?></span>
							<span class="afs-wcml-status-detail">
								<?php
								if ( ! empty( $languages ) ) {
									echo esc_html( implode( ', ', array_map( function( $lang ) {
										return strtoupper( $lang['language_code'] );
									}, $languages ) ) );
								} else {
									esc_html_e( 'WPML non actif', 'afs-wcml-api' );
								}
								?>
							</span>
						</div>
						<div class="afs-wcml-status-item">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Devises actives', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value"><?php echo count( $active_currencies ); ?></span>
							<span class="afs-wcml-status-detail">
								<?php echo esc_html( implode( ', ', $currency_codes ) ); ?>
							</span>
						</div>
						<div class="afs-wcml-status-item status-info">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Total produits/variations', 'afs-wcml-api' ); ?></span>
						<span class="afs-wcml-status-value" id="afs-wcml-total-count"><?php echo esc_html( $total_all ); ?></span>
					</div>
					<div class="afs-wcml-status-item status-ok">
						<span class="afs-wcml-status-label"><?php esc_html_e( 'Synchronisés', 'afs-wcml-api' ); ?></span>
						<span class="afs-wcml-status-value" id="afs-wcml-synced-count"><span class="spinner is-active" style="float: none; margin: 0;"></span></span>
					</div>
					<div class="afs-wcml-status-item" id="afs-wcml-unsync-status-item">
						<span class="afs-wcml-status-label"><?php esc_html_e( 'Non synchronisés', 'afs-wcml-api' ); ?></span>
						<span class="afs-wcml-status-value" id="afs-wcml-unsync-count"><span class="spinner is-active" style="float: none; margin: 0;"></span></span>
					</div>
				</div>
			</div>

			<!-- Actions Card -->
			<div class="afs-wcml-card">
				<h2><?php esc_html_e( 'Actions', 'afs-wcml-api' ); ?></h2>

				<div class="afs-wcml-actions">
					<button type="button" class="button button-primary button-large" id="afs-wcml-sync-all">
						<span class="dashicons dashicons-update"></span>
						<?php esc_html_e( 'Synchroniser tous les produits', 'afs-wcml-api' ); ?>
					</button>

					<button type="button" class="button button-primary button-large" id="afs-wcml-sync-unsynced-only" style="display: none;">
						<span class="dashicons dashicons-update"></span>
						<?php esc_html_e( 'Synchroniser uniquement les non synchronisés', 'afs-wcml-api' ); ?>
						<span class="afs-wcml-count-badge" id="afs-wcml-sync-unsynced-badge" style="margin-left: 8px;">0</span>
					</button>

					<button type="button" class="button button-secondary" id="afs-wcml-refresh-status">
						<span class="dashicons dashicons-visibility"></span>
						<?php esc_html_e( 'Actualiser', 'afs-wcml-api' ); ?>
						</button>
					</div>

					<div id="afs-wcml-sync-progress" style="display: none;">
						<div class="afs-wcml-progress-bar">
							<div class="afs-wcml-progress-fill" style="width: 0%;"></div>
						</div>
						<p class="afs-wcml-progress-text"></p>
					</div>

					<div id="afs-wcml-sync-results" style="display: none;">
						<h3><?php esc_html_e( 'Résultats', 'afs-wcml-api' ); ?></h3>
						<div class="afs-wcml-results-content"></div>
					</div>
				</div>
			</div>

			<!-- Filters -->
			<div class="afs-wcml-card afs-wcml-filters-card">
				<h2><?php esc_html_e( 'Filtres', 'afs-wcml-api' ); ?></h2>
				<div class="afs-wcml-filters">
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-price-sync-filter-search"><?php esc_html_e( 'Rechercher', 'afs-wcml-api' ); ?></label>
						<input type="text" id="afs-wcml-price-sync-filter-search" placeholder="<?php esc_attr_e( 'Nom du produit...', 'afs-wcml-api' ); ?>" />
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-price-sync-filter-type"><?php esc_html_e( 'Type de produit', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-price-sync-filter-type">
							<option value=""><?php esc_html_e( 'Tous', 'afs-wcml-api' ); ?></option>
							<option value="simple"><?php esc_html_e( 'Simple', 'afs-wcml-api' ); ?></option>
							<option value="variable"><?php esc_html_e( 'Variable', 'afs-wcml-api' ); ?></option>
							<option value="variation"><?php esc_html_e( 'Variation', 'afs-wcml-api' ); ?></option>
						</select>
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-price-sync-filter-status"><?php esc_html_e( 'Statut sync', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-price-sync-filter-status">
							<option value=""><?php esc_html_e( 'Tous', 'afs-wcml-api' ); ?></option>
							<option value="synced"><?php esc_html_e( 'Synchronisés', 'afs-wcml-api' ); ?></option>
							<option value="not_synced"><?php esc_html_e( 'Non synchronisés', 'afs-wcml-api' ); ?></option>
						</select>
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-price-sync-filter-per-page"><?php esc_html_e( 'Par page', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-price-sync-filter-per-page">
							<option value="10">10</option>
							<option value="20" selected>20</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
					</div>
					<div class="afs-wcml-filter-group afs-wcml-filter-actions">
						<button type="button" class="button button-primary" id="afs-wcml-price-sync-apply-filters">
							<span class="dashicons dashicons-search"></span>
							<?php esc_html_e( 'Rechercher', 'afs-wcml-api' ); ?>
						</button>
						<button type="button" class="button button-secondary" id="afs-wcml-price-sync-reset-filters">
							<?php esc_html_e( 'Réinitialiser', 'afs-wcml-api' ); ?>
						</button>
					</div>
				</div>
			</div>

			<!-- Results Summary -->
			<div class="afs-wcml-results-summary">
				<span id="afs-wcml-price-sync-results-count">
					<?php
					printf(
						/* translators: %d: number of products */
						esc_html__( '%d produit(s) trouvé(s)', 'afs-wcml-api' ),
						isset( $initial_data['total'] ) ? $initial_data['total'] : 0
					);
					?>
				</span>
				<div class="afs-wcml-pagination" id="afs-wcml-price-sync-pagination-top"></div>
			</div>

			<!-- ALL Products Table -->
			<div class="afs-wcml-card afs-wcml-card-full afs-wcml-tracking-table-wrap">
				<h2>
					<?php esc_html_e( 'Tous les produits', 'afs-wcml-api' ); ?>
					<span class="afs-wcml-count-badge" id="afs-wcml-price-sync-total-display"><?php echo esc_html( $total_all ); ?></span>
					<?php if ( $total_unsync > 0 ) : ?>
						<span class="afs-wcml-count-badge warning" id="afs-wcml-price-sync-unsync-display"><?php echo esc_html( $total_unsync ); ?> <?php esc_html_e( 'à synchroniser', 'afs-wcml-api' ); ?></span>
					<?php endif; ?>
				</h2>

				<div id="afs-wcml-price-sync-loader" style="text-align: center; padding: 20px; display: none;">
					<span class="spinner is-active" style="float: none;"></span>
					<p><?php esc_html_e( 'Chargement...', 'afs-wcml-api' ); ?></p>
				</div>
				<div class="afs-wcml-table-scroll">
					<table class="wp-list-table widefat striped" id="afs-wcml-sync-table">
						<thead>
							<tr>
								<th class="column-product" rowspan="2"><?php esc_html_e( 'Produit', 'afs-wcml-api' ); ?></th>
								<th class="column-type" rowspan="2"><?php esc_html_e( 'Type', 'afs-wcml-api' ); ?></th>
								<th class="column-source-prices" colspan="<?php echo count( $currency_codes ); ?>">
									<?php esc_html_e( 'Prix Source', 'afs-wcml-api' ); ?>
									<span class="afs-wcml-lang-badge source"><?php echo esc_html( strtoupper( $default_lang ) ); ?></span>
								</th>
								<?php foreach ( $languages as $lang_code => $lang_data ) : ?>
									<?php if ( $lang_code !== $default_lang ) : ?>
									<th class="column-trans-prices" colspan="<?php echo count( $currency_codes ); ?>">
										<?php esc_html_e( 'Traduction', 'afs-wcml-api' ); ?>
										<span class="afs-wcml-lang-badge"><?php echo esc_html( strtoupper( $lang_code ) ); ?></span>
									</th>
									<?php endif; ?>
								<?php endforeach; ?>
								<th class="column-actions" rowspan="2"><?php esc_html_e( 'Actions', 'afs-wcml-api' ); ?></th>
							</tr>
							<tr>
								<?php // Source currency headers ?>
								<?php foreach ( $currency_codes as $currency ) : ?>
									<th class="column-currency source-currency"><?php echo esc_html( $currency ); ?></th>
								<?php endforeach; ?>

								<?php // Translation currency headers ?>
								<?php foreach ( $languages as $lang_code => $lang_data ) : ?>
									<?php if ( $lang_code !== $default_lang ) : ?>
										<?php foreach ( $currency_codes as $currency ) : ?>
											<th class="column-currency"><?php echo esc_html( $currency ); ?></th>
										<?php endforeach; ?>
									<?php endif; ?>
								<?php endforeach; ?>
							</tr>
						</thead>
						<tbody id="afs-wcml-price-sync-body">
							<?php if ( ! empty( $initial_data['products'] ) ) : ?>
								<?php foreach ( $initial_data['products'] as $product ) : ?>
									<?php $this->render_sync_row( $product, $currency_codes, $languages, $default_lang ); ?>
								<?php endforeach; ?>
							<?php else : ?>
								<tr class="no-items"><td colspan="100"><?php esc_html_e( 'Aucun produit trouvé.', 'afs-wcml-api' ); ?></td></tr>
							<?php endif; ?>
						</tbody>
					</table>
				</div>

				<!-- Pagination Bottom -->
				<div class="afs-wcml-pagination" id="afs-wcml-price-sync-pagination-bottom"></div>
			</div>

			<!-- Hidden data for JS -->
			<script type="text/javascript">
				var afs_wcml_price_sync_data = <?php echo wp_json_encode( array(
					'currencies'   => $currency_codes,
					'languages'    => array_keys( $languages ),
					'default_lang' => $default_lang,
					'total'        => isset( $initial_data['total'] ) ? $initial_data['total'] : 0,
					'pages'        => isset( $initial_data['pages'] ) ? $initial_data['pages'] : 1,
					'current_page' => 1,
				) ); ?>;
			</script>

			<!-- Manual Sync by Product ID -->
			<div class="afs-wcml-card afs-wcml-card-full">
				<h2><?php esc_html_e( 'Synchronisation manuelle par ID', 'afs-wcml-api' ); ?></h2>
				<p class="description"><?php esc_html_e( 'Entrez l\'ID d\'un produit pour synchroniser ses prix vers toutes ses traductions.', 'afs-wcml-api' ); ?></p>

				<div class="afs-wcml-manual-sync">
					<input type="number" id="afs-wcml-product-id" placeholder="<?php esc_attr_e( 'ID du produit', 'afs-wcml-api' ); ?>" min="1" class="regular-text" />
					<button type="button" class="button button-primary" id="afs-wcml-sync-by-id">
						<?php esc_html_e( 'Synchroniser', 'afs-wcml-api' ); ?>
					</button>
				</div>

				<div id="afs-wcml-manual-result" style="display: none; margin-top: 15px;"></div>
			</div>
		</div>
		<?php
	}

	/**
	 * Render a single sync table row with detailed prices.
	 *
	 * @param array  $product       Product data.
	 * @param array  $currencies    Currency codes.
	 * @param array  $languages     Active languages.
	 * @param string $default_lang  Default language.
	 */
	private function render_sync_row( $product, $currencies, $languages, $default_lang ) {
		$is_synced = isset( $product['is_synced'] ) ? $product['is_synced'] : false;
		$row_class = $is_synced ? 'synced-row' : 'not-synced-row';
		$product_id = $product['product_id'];
		$is_variation = $product['is_variation'] ?? false;
		
		// Get default currency
		$default_currency = $this->prices->get_default_currency();
		?>
		<tr class="<?php echo esc_attr( $row_class ); ?>" data-product-id="<?php echo esc_attr( $product_id ); ?>">
			<td class="column-product">
				<strong>
					<a href="<?php echo esc_url( $product['edit_url'] ); ?>" target="_blank">
						<?php echo esc_html( $product['product_name'] ); ?>
					</a>
				</strong>
				<?php if ( ! empty( $product['frontend_urls'] ) ) : ?>
					<br>
					<?php foreach ( $product['frontend_urls'] as $url_lang => $frontend_url ) : ?>
						<?php if ( ! empty( $frontend_url ) ) : ?>
							<a href="<?php echo esc_url( $frontend_url ); ?>" target="_blank" style="font-size: 11px; color: #2271b1; text-decoration: none; margin-right: 8px;">
								<?php echo esc_html( strtoupper( $url_lang ) ); ?>
							</a>
						<?php endif; ?>
					<?php endforeach; ?>
				<?php endif; ?>
				<?php if ( $is_variation && ! empty( $product['parent_name'] ) ) : ?>
					<br><small class="parent-name"><?php echo esc_html( $product['parent_name'] ); ?></small>
				<?php endif; ?>
				<br><small class="product-id">ID: <?php echo esc_html( $product_id ); ?></small>
			</td>
			<td class="column-type">
				<span class="afs-wcml-type-badge <?php echo esc_attr( $product['product_type'] ); ?>">
					<?php echo esc_html( ucfirst( $product['product_type'] ) ); ?>
				</span>
			</td>

			<?php
			// Source prices for each currency.
			foreach ( $currencies as $currency ) :
				$price_data = isset( $product['source_prices'][ $currency ] ) ? $product['source_prices'][ $currency ] : array();
				$regular = isset( $price_data['regular_price'] ) ? $price_data['regular_price'] : '';
				$sale = isset( $price_data['sale_price'] ) ? $price_data['sale_price'] : '';
				$has_price = ! empty( $regular );
			?>
				<td class="column-currency source-price <?php echo $has_price ? '' : 'empty-price'; ?>">
					<?php if ( $has_price ) : ?>
						<span class="price-regular"><?php echo esc_html( $regular ); ?></span>
						<?php if ( ! empty( $sale ) ) : ?>
							<br><span class="price-sale"><?php echo esc_html( $sale ); ?></span>
						<?php endif; ?>
					<?php else : ?>
						<span class="price-empty">-</span>
					<?php endif; ?>
				</td>
			<?php endforeach; ?>

			<?php
			// Translation prices for each language (except default).
			// Fetch translations directly using WPML
			$element_type = $is_variation ? 'post_product_variation' : 'post_product';
			$trid = apply_filters( 'wpml_element_trid', null, $product_id, $element_type );
			$all_translations = $trid ? apply_filters( 'wpml_get_element_translations', array(), $trid, $element_type ) : array();
			
			foreach ( $languages as $lang_code => $lang_data ) :
				if ( $lang_code === $default_lang ) {
					continue;
				}

				// Get translated product ID directly from WPML
				$trans_id = null;
				if ( isset( $all_translations[ $lang_code ] ) && isset( $all_translations[ $lang_code ]->element_id ) ) {
					$trans_id = (int) $all_translations[ $lang_code ]->element_id;
				}

				foreach ( $currencies as $currency ) :
					if ( ! $trans_id ) :
					?>
						<td class="column-currency trans-price no-translation">
							<span class="price-empty" title="<?php esc_attr_e( 'Pas de traduction', 'afs-wcml-api' ); ?>">-</span>
						</td>
					<?php
					else :
						// Fetch prices directly from translation product
						if ( $currency === $default_currency ) {
							// Default currency - use WooCommerce methods
							$trans_product = wc_get_product( $trans_id );
							if ( $trans_product ) {
								$regular = $trans_product->get_regular_price();
								$sale = $trans_product->get_sale_price();
							} else {
								$regular = get_post_meta( $trans_id, '_regular_price', true );
								$sale = get_post_meta( $trans_id, '_sale_price', true );
							}
						} else {
							// Multi-currency - direct meta
							$regular = get_post_meta( $trans_id, '_regular_price_' . $currency, true );
							$sale = get_post_meta( $trans_id, '_sale_price_' . $currency, true );
						}
						
						// Normalize
						$regular = ( $regular !== null && $regular !== '' && $regular !== false ) ? (string) $regular : '';
						$sale = ( $sale !== null && $sale !== '' && $sale !== false ) ? (string) $sale : '';
						$regular = trim( $regular );
						$sale = trim( $sale );
						
						// Fallback to source price if translation has no price set
						if ( $regular === '' && isset( $product['source_prices'][ $currency ]['regular_price'] ) ) {
							$regular = (string) $product['source_prices'][ $currency ]['regular_price'];
						}
						if ( $sale === '' && isset( $product['source_prices'][ $currency ]['sale_price'] ) ) {
							$sale = (string) $product['source_prices'][ $currency ]['sale_price'];
						}
						
						// Check if price is valid
						$has_price = false;
						if ( $regular !== '' ) {
							$regular_normalized = str_replace( ',', '.', $regular );
							$has_price = is_numeric( $regular_normalized ) && (float) $regular_normalized >= 0;
						}

						// Check if prices match source
						$source_regular = isset( $product['source_prices'][ $currency ]['regular_price'] ) ? (string) $product['source_prices'][ $currency ]['regular_price'] : '';
						$matches = ( $regular === $source_regular );

						$cell_class = 'column-currency trans-price';
						if ( ! $has_price ) {
							$cell_class .= ' empty-price';
						} elseif ( $matches ) {
							$cell_class .= ' price-match';
						} else {
							$cell_class .= ' price-mismatch';
						}
					?>
						<td class="<?php echo esc_attr( $cell_class ); ?>">
							<?php if ( $has_price ) : ?>
								<span class="price-regular"><?php echo esc_html( $regular ); ?></span>
								<?php if ( ! empty( trim( $sale ) ) && is_numeric( str_replace( ',', '.', $sale ) ) ) : ?>
									<br><span class="price-sale"><?php echo esc_html( $sale ); ?></span>
								<?php endif; ?>
							<?php else : ?>
								<span class="price-empty">-</span>
							<?php endif; ?>
						</td>
					<?php
					endif;
				endforeach;
			endforeach;
			?>

			<td class="column-actions">
				<?php if ( ! $is_synced ) : ?>
					<button type="button" class="button button-small button-primary afs-wcml-sync-single" data-product-id="<?php echo esc_attr( $product_id ); ?>">
						<span class="dashicons dashicons-update"></span>
						<?php esc_html_e( 'Sync', 'afs-wcml-api' ); ?>
					</button>
				<?php else : ?>
					<span class="afs-wcml-synced-badge">
						<span class="dashicons dashicons-yes-alt"></span>
						<?php esc_html_e( 'OK', 'afs-wcml-api' ); ?>
					</span>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}

	/**
	 * Render ACF sync page.
	 */
	public function render_acf_sync_page() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Vous n\'avez pas les permissions nécessaires.', 'afs-wcml-api' ) );
		}

		if ( ! $this->acf_sync ) {
			wp_die( esc_html__( 'Classe ACF Sync non disponible.', 'afs-wcml-api' ) );
		}

		// Check if ACF is active.
		if ( ! function_exists( 'acf_get_field_groups' ) ) {
			?>
			<div class="wrap">
				<h1><?php esc_html_e( 'Synchronisation des Champs ACF', 'afs-wcml-api' ); ?></h1>
				<div class="notice notice-error">
					<p><?php esc_html_e( 'Advanced Custom Fields (ACF) n\'est pas installé ou activé. Veuillez installer ACF pour utiliser cette fonctionnalité.', 'afs-wcml-api' ); ?></p>
				</div>
			</div>
			<?php
			return;
		}

		// Get active languages.
		$languages = apply_filters( 'wpml_active_languages', array() );
		$default_lang = apply_filters( 'wpml_default_language', 'en' );

		// Get ACF fields.
		$all_acf_fields = $this->acf_sync->get_all_acf_fields();
		$product_fields = $all_acf_fields['product'];
		$variation_fields = $all_acf_fields['variation'];

		// Get sync settings.
		$settings = $this->acf_sync->get_sync_settings();
		$selected_fields = isset( $settings['fields'] ) ? $settings['fields'] : array();
		$auto_sync_enabled = $this->acf_sync->is_auto_sync_enabled();

		// Get initial data.
		$all_data = array();
		$total_all = 0;
		$total_synced = 0;
		$total_unsync = 0;

		if ( $this->acf_sync ) {
			$all_data = $this->acf_sync->get_products_acf_comparison( array(
				'per_page'           => 20, // Reduced from 50 to avoid timeouts.
				'page'               => 1,
				'sync_status'        => '',
				'include_variations' => true,
			) );
			$total_all = isset( $all_data['total'] ) ? $all_data['total'] : 0;

			// Count synced vs unsynced.
			if ( ! empty( $all_data['products'] ) ) {
				foreach ( $all_data['products'] as $product ) {
					if ( $product['is_synced'] ) {
						$total_synced++;
					} else {
						$total_unsync++;
					}
				}
			}

			// Get accurate counts.
			$synced_data = $this->acf_sync->get_products_acf_comparison( array(
				'per_page'           => 1,
				'page'               => 1,
				'sync_status'        => 'synced',
				'include_variations' => true,
			) );
			$total_synced = isset( $synced_data['total'] ) ? $synced_data['total'] : 0;

			$unsync_data = $this->acf_sync->get_products_acf_comparison( array(
				'per_page'           => 1,
				'page'               => 1,
				'sync_status'        => 'not_synced',
				'include_variations' => true,
			) );
			$total_unsync = isset( $unsync_data['total'] ) ? $unsync_data['total'] : 0;
		}

		?>
		<div class="wrap afs-wcml-sync-wrap">
			<h1><?php esc_html_e( 'Synchronisation des Champs ACF Multi-Langue', 'afs-wcml-api' ); ?></h1>

			<div class="afs-wcml-info-box">
				<h3><?php esc_html_e( 'Comment ça marche ?', 'afs-wcml-api' ); ?></h3>
				<p><?php esc_html_e( 'Cette fonctionnalité synchronise les champs ACF (Advanced Custom Fields) entre les différentes traductions de vos produits. Vous pouvez choisir quels champs synchroniser et le mode de synchronisation (copie ou traduction).', 'afs-wcml-api' ); ?></p>
				<ul>
					<li><span class="afs-wcml-legend-match"></span> <?php esc_html_e( 'Champ synchronisé (identique à la source)', 'afs-wcml-api' ); ?></li>
					<li><span class="afs-wcml-legend-mismatch"></span> <?php esc_html_e( 'Champ non synchronisé (différent de la source)', 'afs-wcml-api' ); ?></li>
					<li><span class="afs-wcml-legend-empty"></span> <?php esc_html_e( 'Champ vide', 'afs-wcml-api' ); ?></li>
				</ul>
			</div>

			<div class="afs-wcml-cards">
				<!-- Settings Card -->
				<div class="afs-wcml-card afs-wcml-card-wide">
					<h2><?php esc_html_e( 'Paramètres de synchronisation', 'afs-wcml-api' ); ?></h2>
					
					<div style="margin-bottom: 20px;">
						<h3><?php esc_html_e( 'Champs ACF à synchroniser', 'afs-wcml-api' ); ?></h3>
						<p class="description"><?php esc_html_e( 'Sélectionnez les champs ACF que vous souhaitez synchroniser entre les traductions.', 'afs-wcml-api' ); ?></p>
						
						<?php if ( ! empty( $product_fields ) ) : ?>
						<div style="margin-bottom: 15px;">
							<strong><?php esc_html_e( 'Champs Produit:', 'afs-wcml-api' ); ?></strong>
							<div style="margin-top: 10px; max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #f9f9f9;">
								<?php foreach ( $product_fields as $field_key => $field_data ) : ?>
								<label style="display: block; margin-bottom: 8px;">
									<input type="checkbox" name="acf_fields[]" value="<?php echo esc_attr( $field_key ); ?>" 
										<?php checked( in_array( $field_key, $selected_fields, true ) ); ?> />
									<?php echo esc_html( $field_data['label'] . ' (' . $field_data['name'] . ')' ); ?>
								</label>
								<?php endforeach; ?>
							</div>
						</div>
						<?php endif; ?>

						<?php if ( ! empty( $variation_fields ) ) : ?>
						<div style="margin-bottom: 15px;">
							<strong><?php esc_html_e( 'Champs Variation:', 'afs-wcml-api' ); ?></strong>
							<div style="margin-top: 10px; max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #f9f9f9;">
								<?php foreach ( $variation_fields as $field_key => $field_data ) : ?>
								<label style="display: block; margin-bottom: 8px;">
									<input type="checkbox" name="acf_fields[]" value="<?php echo esc_attr( $field_key ); ?>" 
										<?php checked( in_array( $field_key, $selected_fields, true ) ); ?> />
									<?php echo esc_html( $field_data['label'] . ' (' . $field_data['name'] . ')' ); ?>
								</label>
								<?php endforeach; ?>
							</div>
						</div>
						<?php endif; ?>

						<?php if ( empty( $product_fields ) && empty( $variation_fields ) ) : ?>
						<p class="description" style="color: #d63638;">
							<?php esc_html_e( 'Aucun champ ACF trouvé pour les produits ou variations.', 'afs-wcml-api' ); ?>
						</p>
						<?php endif; ?>
					</div>

					<div style="margin-bottom: 20px;">
						<label class="afs-wcml-toggle">
							<input type="checkbox" name="acf_auto_sync" id="acf_auto_sync" value="1" <?php checked( $auto_sync_enabled ); ?> />
							<span class="afs-wcml-toggle-slider"></span>
						</label>
						<label for="acf_auto_sync" style="margin-left: 10px;">
							<?php esc_html_e( 'Synchronisation automatique', 'afs-wcml-api' ); ?>
						</label>
						<p class="description">
							<?php esc_html_e( 'Activer pour synchroniser automatiquement les champs ACF quand vous sauvegardez un produit.', 'afs-wcml-api' ); ?>
						</p>
					</div>

					<button type="button" class="button button-primary" id="afs-wcml-save-acf-settings">
						<?php esc_html_e( 'Sauvegarder les paramètres', 'afs-wcml-api' ); ?>
					</button>
				</div>

				<!-- Status Card -->
				<div class="afs-wcml-card afs-wcml-card-wide">
					<h2><?php esc_html_e( 'État de la synchronisation', 'afs-wcml-api' ); ?></h2>

					<div class="afs-wcml-status-grid">
						<div class="afs-wcml-status-item">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Langues actives', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value"><?php echo count( $languages ); ?></span>
							<span class="afs-wcml-status-detail">
								<?php
								if ( ! empty( $languages ) ) {
									echo esc_html( implode( ', ', array_map( function( $lang ) {
										return strtoupper( $lang['language_code'] );
									}, $languages ) ) );
								} else {
									esc_html_e( 'WPML non actif', 'afs-wcml-api' );
								}
								?>
							</span>
						</div>
						<div class="afs-wcml-status-item status-info">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Total produits/variations', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value" id="afs-wcml-acf-total-count"><?php echo esc_html( $total_all ); ?></span>
						</div>
						<div class="afs-wcml-status-item status-ok">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Synchronisés', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value" id="afs-wcml-acf-synced-count"><?php echo esc_html( $total_synced ); ?></span>
						</div>
						<div class="afs-wcml-status-item <?php echo $total_unsync > 0 ? 'status-warning' : 'status-ok'; ?>">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Non synchronisés', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value" id="afs-wcml-acf-unsync-count"><?php echo esc_html( $total_unsync ); ?></span>
						</div>
					</div>
				</div>

				<!-- Actions Card -->
				<div class="afs-wcml-card">
					<h2><?php esc_html_e( 'Actions', 'afs-wcml-api' ); ?></h2>

					<div class="afs-wcml-actions">
						<button type="button" class="button button-primary button-large" id="afs-wcml-sync-all-acf">
							<span class="dashicons dashicons-update"></span>
							<?php esc_html_e( 'Synchroniser tous les produits', 'afs-wcml-api' ); ?>
						</button>

						<?php if ( $total_unsync > 0 ) : ?>
						<button type="button" class="button button-primary button-large" id="afs-wcml-sync-unsynced-acf-only">
							<span class="dashicons dashicons-update"></span>
							<?php esc_html_e( 'Synchroniser uniquement les non synchronisés', 'afs-wcml-api' ); ?>
							<span class="afs-wcml-count-badge" style="margin-left: 8px;"><?php echo esc_html( $total_unsync ); ?></span>
						</button>
						<?php endif; ?>

						<button type="button" class="button button-secondary" id="afs-wcml-refresh-acf-status">
							<span class="dashicons dashicons-visibility"></span>
							<?php esc_html_e( 'Actualiser', 'afs-wcml-api' ); ?>
						</button>
					</div>

					<div id="afs-wcml-acf-sync-progress" style="display: none;">
						<div class="afs-wcml-progress-bar">
							<div class="afs-wcml-progress-fill" style="width: 0%;"></div>
						</div>
						<p class="afs-wcml-progress-text"></p>
					</div>

					<div id="afs-wcml-acf-sync-results" style="display: none;">
						<h3><?php esc_html_e( 'Résultats', 'afs-wcml-api' ); ?></h3>
						<div class="afs-wcml-results-content"></div>
					</div>
				</div>
			</div>

			<!-- Filters -->
			<?php if ( ! empty( $selected_fields ) ) : ?>
			<div class="afs-wcml-card afs-wcml-filters-card">
				<h2><?php esc_html_e( 'Filtres', 'afs-wcml-api' ); ?></h2>
				<div class="afs-wcml-filters">
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-acf-filter-search"><?php esc_html_e( 'Rechercher', 'afs-wcml-api' ); ?></label>
						<input type="text" id="afs-wcml-acf-filter-search" placeholder="<?php esc_attr_e( 'Nom du produit...', 'afs-wcml-api' ); ?>" />
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-acf-filter-type"><?php esc_html_e( 'Type de produit', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-acf-filter-type">
							<option value=""><?php esc_html_e( 'Tous', 'afs-wcml-api' ); ?></option>
							<option value="simple"><?php esc_html_e( 'Simple', 'afs-wcml-api' ); ?></option>
							<option value="variable"><?php esc_html_e( 'Variable', 'afs-wcml-api' ); ?></option>
							<option value="variation"><?php esc_html_e( 'Variation', 'afs-wcml-api' ); ?></option>
						</select>
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-acf-filter-status"><?php esc_html_e( 'Statut sync', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-acf-filter-status">
							<option value=""><?php esc_html_e( 'Tous', 'afs-wcml-api' ); ?></option>
							<option value="synced"><?php esc_html_e( 'Synchronisés', 'afs-wcml-api' ); ?></option>
							<option value="not_synced"><?php esc_html_e( 'Non synchronisés', 'afs-wcml-api' ); ?></option>
						</select>
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-acf-filter-per-page"><?php esc_html_e( 'Par page', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-acf-filter-per-page">
							<option value="10">10</option>
							<option value="20" selected>20</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
					</div>
					<div class="afs-wcml-filter-group afs-wcml-filter-actions">
						<button type="button" class="button button-primary" id="afs-wcml-acf-apply-filters">
							<span class="dashicons dashicons-search"></span>
							<?php esc_html_e( 'Rechercher', 'afs-wcml-api' ); ?>
						</button>
						<button type="button" class="button button-secondary" id="afs-wcml-acf-reset-filters">
							<?php esc_html_e( 'Réinitialiser', 'afs-wcml-api' ); ?>
						</button>
					</div>
				</div>
			</div>

			<!-- Pagination Top -->
			<div class="afs-wcml-pagination" id="afs-wcml-acf-pagination-top"></div>
			<?php endif; ?>

			<!-- ALL Products Table -->
			<div class="afs-wcml-card afs-wcml-card-full afs-wcml-tracking-table-wrap">
				<h2>
					<?php esc_html_e( 'Tous les produits', 'afs-wcml-api' ); ?>
					<span class="afs-wcml-count-badge" id="afs-wcml-acf-total-display"><?php echo esc_html( $total_all ); ?></span>
					<span class="afs-wcml-count-badge warning" id="afs-wcml-acf-unsync-display" style="<?php echo $total_unsync > 0 ? '' : 'display:none;'; ?>">
						<span id="afs-wcml-acf-unsync-count-display"><?php echo esc_html( $total_unsync ); ?></span> <?php esc_html_e( 'à synchroniser', 'afs-wcml-api' ); ?>
					</span>
				</h2>

				<?php if ( empty( $selected_fields ) ) : ?>
				<div class="notice notice-warning" style="margin: 20px 0; padding: 15px;">
					<p>
						<strong><?php esc_html_e( '⚠️ Aucun champ ACF sélectionné', 'afs-wcml-api' ); ?></strong><br>
						<?php esc_html_e( 'Veuillez sélectionner au moins un champ ACF dans les paramètres ci-dessus pour afficher et synchroniser les produits.', 'afs-wcml-api' ); ?>
					</p>
				</div>
				<?php elseif ( ! empty( $selected_fields ) ) : ?>
				<div id="afs-wcml-acf-loader" style="text-align: center; padding: 20px; display: none;">
					<span class="spinner is-active" style="float: none;"></span>
					<p><?php esc_html_e( 'Chargement...', 'afs-wcml-api' ); ?></p>
				</div>
				<div class="afs-wcml-table-scroll">
					<table class="wp-list-table widefat striped" id="afs-wcml-acf-sync-table">
						<thead>
							<tr>
								<th class="column-product"><?php esc_html_e( 'Produit', 'afs-wcml-api' ); ?></th>
								<th class="column-type"><?php esc_html_e( 'Type', 'afs-wcml-api' ); ?></th>
								<th class="column-source-acf">
									<?php esc_html_e( 'Champs Source', 'afs-wcml-api' ); ?>
									<span class="afs-wcml-lang-badge source"><?php echo esc_html( strtoupper( $default_lang ) ); ?></span>
								</th>
								<?php foreach ( $languages as $lang_code => $lang_data ) : ?>
									<?php if ( $lang_code !== $default_lang ) : ?>
									<th class="column-trans-acf">
										<?php esc_html_e( 'Traduction', 'afs-wcml-api' ); ?>
										<span class="afs-wcml-lang-badge"><?php echo esc_html( strtoupper( $lang_code ) ); ?></span>
									</th>
									<?php endif; ?>
								<?php endforeach; ?>
								<th class="column-actions"><?php esc_html_e( 'Actions', 'afs-wcml-api' ); ?></th>
							</tr>
						</thead>
						<tbody id="afs-wcml-acf-sync-body">
							<?php if ( ! empty( $all_data['products'] ) ) : ?>
								<?php foreach ( $all_data['products'] as $product ) : ?>
								<?php $this->render_acf_sync_row( $product, $languages, $default_lang ); ?>
								<?php endforeach; ?>
							<?php else : ?>
								<tr class="no-items"><td colspan="100"><?php esc_html_e( 'Aucun produit trouvé.', 'afs-wcml-api' ); ?></td></tr>
							<?php endif; ?>
						</tbody>
					</table>
				</div>

				<!-- Pagination Bottom -->
				<div class="afs-wcml-pagination" id="afs-wcml-acf-pagination-bottom"></div>

				<?php else : ?>
				<div class="afs-wcml-no-products">
					<span class="dashicons dashicons-info"></span>
					<p><?php esc_html_e( 'Aucun produit trouvé.', 'afs-wcml-api' ); ?></p>
				</div>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render a single ACF sync table row.
	 *
	 * @param array  $product      Product data.
	 * @param array  $languages    Active languages.
	 * @param string $default_lang Default language.
	 */
	private function render_acf_sync_row( $product, $languages, $default_lang ) {
		$is_synced = isset( $product['is_synced'] ) ? $product['is_synced'] : false;
		$row_class = $is_synced ? 'synced-row' : 'not-synced-row';
		$source_acf = isset( $product['source_acf'] ) ? $product['source_acf'] : array();
		$field_labels = isset( $product['field_labels'] ) ? $product['field_labels'] : array();
		?>
		<tr class="<?php echo esc_attr( $row_class ); ?>" data-product-id="<?php echo esc_attr( $product['product_id'] ); ?>">
			<td class="column-product">
				<strong>
					<a href="<?php echo esc_url( $product['edit_url'] ); ?>" target="_blank">
						<?php echo esc_html( $product['product_name'] ); ?>
					</a>
				</strong>
				<?php if ( $product['is_variation'] && ! empty( $product['parent_name'] ) ) : ?>
					<br><small class="parent-name" style="color: #646970;">
						<?php echo esc_html( $product['parent_name'] ); ?>
					</small>
					<?php if ( ! empty( $product['variation_attributes'] ) && is_array( $product['variation_attributes'] ) ) : ?>
						<br><small class="variation-attributes" style="color: #2271b1; font-weight: 500; margin-top: 3px; display: inline-block;">
							<?php
							$attr_parts = array();
							foreach ( $product['variation_attributes'] as $attr_name => $attr_value ) {
								$display_name = str_replace( 'pa_', '', $attr_name );
								$display_name = wc_attribute_label( $display_name );
								if ( $attr_value ) {
									$attr_parts[] = '<span style="font-weight: 600;">' . esc_html( $display_name ) . '</span>: ' . esc_html( $attr_value );
								}
							}
							if ( ! empty( $attr_parts ) ) {
								echo implode( ' • ', $attr_parts );
							}
							?>
						</small>
					<?php endif; ?>
				<?php endif; ?>
				<br><small class="product-id" style="color: #8c8f94;">ID: <?php echo esc_html( $product['product_id'] ); ?></small>
			</td>
			<td class="column-type">
				<span class="afs-wcml-type-badge <?php echo esc_attr( $product['product_type'] ); ?>">
					<?php echo esc_html( ucfirst( $product['product_type'] ) ); ?>
				</span>
			</td>

			<td class="column-source-acf">
				<?php if ( ! empty( $source_acf ) ) : ?>
					<div style="max-width: 350px;">
						<?php foreach ( $source_acf as $field_key => $field_value ) : ?>
							<?php
							$field_label = isset( $field_labels[ $field_key ] ) ? $field_labels[ $field_key ] : $field_key;
							$is_array = is_array( $field_value );
							$is_image = is_numeric( $field_value ) && wp_attachment_is_image( $field_value );
							$display_value = $is_array ? __( 'Tableau/Objet', 'afs-wcml-api' ) : ( $is_image ? __( 'Image ID: ', 'afs-wcml-api' ) . $field_value : (string) $field_value );
							?>
							<div class="afs-wcml-acf-field-edit" style="margin-bottom: 10px; padding: 8px; background: #f8fbff; border-left: 3px solid #2271b1; border-radius: 3px;">
								<strong style="font-size: 11px; display: block; margin-bottom: 5px;">
									<?php echo esc_html( $field_label ); ?>
								</strong>
								<?php if ( $is_array || $is_image ) : ?>
									<div style="font-size: 11px; color: #646970; margin-bottom: 5px;">
										<?php echo esc_html( $display_value ); ?>
									</div>
									<textarea 
										class="afs-wcml-acf-field-input" 
										data-field-key="<?php echo esc_attr( $field_key ); ?>"
										data-product-id="<?php echo esc_attr( $product['product_id'] ); ?>"
										data-lang="<?php echo esc_attr( $default_lang ); ?>"
										style="width: 100%; min-height: 60px; font-size: 11px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"
									><?php echo esc_textarea( $is_array ? wp_json_encode( $field_value, JSON_PRETTY_PRINT ) : $display_value ); ?></textarea>
								<?php else : ?>
									<textarea 
										class="afs-wcml-acf-field-input" 
										data-field-key="<?php echo esc_attr( $field_key ); ?>"
										data-product-id="<?php echo esc_attr( $product['product_id'] ); ?>"
										data-lang="<?php echo esc_attr( $default_lang ); ?>"
										style="width: 100%; min-height: 60px; font-size: 11px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"
									><?php echo esc_textarea( $display_value ); ?></textarea>
								<?php endif; ?>
								<button 
									type="button" 
									class="button button-small afs-wcml-save-field" 
									data-field-key="<?php echo esc_attr( $field_key ); ?>"
									data-product-id="<?php echo esc_attr( $product['product_id'] ); ?>"
									data-lang="<?php echo esc_attr( $default_lang ); ?>"
									style="margin-top: 5px; font-size: 10px; padding: 2px 8px;"
								>
									<span class="dashicons dashicons-yes" style="font-size: 12px; width: 12px; height: 12px;"></span>
									<?php esc_html_e( 'Sauvegarder', 'afs-wcml-api' ); ?>
								</button>
							</div>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<span class="price-empty">-</span>
				<?php endif; ?>
			</td>

			<?php
			// Translation ACF fields.
			foreach ( $languages as $lang_code => $lang_data ) :
				if ( $lang_code === $default_lang ) {
					continue;
				}

				$trans_data = isset( $product['translations'][ $lang_code ] ) ? $product['translations'][ $lang_code ] : null;
			?>
				<td class="column-trans-acf">
					<?php
					$trans_acf = $trans_data ? ( isset( $trans_data['fields'] ) ? $trans_data['fields'] : array() ) : array();
					$trans_fields_status = $trans_data ? ( isset( $trans_data['fields_status'] ) ? $trans_data['fields_status'] : array() ) : array();
					$trans_product_id = $trans_data && isset( $trans_data['product_id'] ) ? $trans_data['product_id'] : 0;
					?>
					<div style="max-width: 350px;">
						<?php foreach ( $source_acf as $field_key => $source_value ) : ?>
							<?php
							$trans_value = isset( $trans_acf[ $field_key ] ) ? $trans_acf[ $field_key ] : null;
							$matches = isset( $trans_fields_status[ $field_key ] ) ? $trans_fields_status[ $field_key ] : false;
							$field_label = isset( $field_labels[ $field_key ] ) ? $field_labels[ $field_key ] : $field_key;
							
							$is_array = is_array( $trans_value );
							$is_image = is_numeric( $trans_value ) && wp_attachment_is_image( $trans_value );
							$display_value = $trans_value === null ? '' : ( $is_array ? wp_json_encode( $trans_value, JSON_PRETTY_PRINT ) : ( $is_image ? (string) $trans_value : (string) $trans_value ) );
							?>
							<?php
							// Use source value as default if translation doesn't exist
							$default_value = $trans_value !== null ? $display_value : ( is_array( $source_value ) ? wp_json_encode( $source_value, JSON_PRETTY_PRINT ) : (string) $source_value );
							$source_product_id = $product['product_id'];
							?>
							<div class="afs-wcml-acf-field-edit" style="margin-bottom: 10px; padding: 8px; border-left: 3px solid <?php echo $matches ? '#00a32a' : '#d63638'; ?>; background: <?php echo $matches ? '#edfaef' : '#fcf0f1'; ?>; border-radius: 3px;">
								<strong style="font-size: 11px; display: block; margin-bottom: 5px;">
									<?php echo esc_html( $field_label ); ?>
									<?php if ( $matches ) : ?>
										<span style="color: #00a32a; font-size: 10px;">✓</span>
									<?php else : ?>
										<span style="color: #d63638; font-size: 10px;">✗</span>
									<?php endif; ?>
									<?php if ( ! $trans_product_id ) : ?>
										<span style="color: #a7aaad; font-size: 9px; font-style: italic; margin-left: 5px;">
											(<?php esc_html_e( 'Pas de traduction', 'afs-wcml-api' ); ?>)
										</span>
									<?php endif; ?>
								</strong>
								<textarea 
									class="afs-wcml-acf-field-input" 
									data-field-key="<?php echo esc_attr( $field_key ); ?>"
									data-product-id="<?php echo esc_attr( $trans_product_id ? $trans_product_id : $source_product_id ); ?>"
									data-source-product-id="<?php echo esc_attr( $source_product_id ); ?>"
									data-lang="<?php echo esc_attr( $lang_code ); ?>"
									data-has-translation="<?php echo $trans_product_id ? '1' : '0'; ?>"
									style="width: 100%; min-height: 60px; font-size: 11px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;"
									placeholder="<?php esc_attr_e( 'Valeur source utilisée par défaut', 'afs-wcml-api' ); ?>"
								><?php echo esc_textarea( $default_value ); ?></textarea>
								<button 
									type="button" 
									class="button button-small afs-wcml-save-field" 
									data-field-key="<?php echo esc_attr( $field_key ); ?>"
									data-product-id="<?php echo esc_attr( $trans_product_id ? $trans_product_id : $source_product_id ); ?>"
									data-source-product-id="<?php echo esc_attr( $source_product_id ); ?>"
									data-lang="<?php echo esc_attr( $lang_code ); ?>"
									data-has-translation="<?php echo $trans_product_id ? '1' : '0'; ?>"
									style="margin-top: 5px; font-size: 10px; padding: 2px 8px;"
								>
									<span class="dashicons dashicons-yes" style="font-size: 12px; width: 12px; height: 12px;"></span>
									<?php esc_html_e( 'Sauvegarder', 'afs-wcml-api' ); ?>
									<?php if ( ! $trans_product_id ) : ?>
										<span style="font-size: 9px; margin-left: 3px;">(<?php esc_html_e( 'Créer traduction', 'afs-wcml-api' ); ?>)</span>
									<?php endif; ?>
								</button>
							</div>
						<?php endforeach; ?>
					</div>
				</td>
			<?php endforeach; ?>

			<td class="column-actions">
				<button type="button" class="button button-small button-primary afs-wcml-sync-single-acf" data-product-id="<?php echo esc_attr( $product['product_id'] ); ?>">
					<span class="dashicons dashicons-update"></span>
					<?php esc_html_e( 'Sync Tout', 'afs-wcml-api' ); ?>
				</button>
				<?php if ( $is_synced ) : ?>
					<br><small style="color: #00a32a; margin-top: 5px; display: block;">
						<span class="dashicons dashicons-yes-alt" style="font-size: 12px;"></span>
						<?php esc_html_e( 'Synchronisé', 'afs-wcml-api' ); ?>
					</small>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}

	/**
	 * Render location stock sync page.
	 */
	public function render_location_stock_sync_page() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Vous n\'avez pas les permissions nécessaires.', 'afs-wcml-api' ) );
		}

		if ( ! $this->location_stock_sync ) {
			wp_die( esc_html__( 'Classe Location Stock Sync non disponible.', 'afs-wcml-api' ) );
		}

		// Get active languages.
		$languages = apply_filters( 'wpml_active_languages', array() );
		$default_lang = apply_filters( 'wpml_default_language', 'en' );

		// Clear cache first to ensure we get only allowed locations.
		$this->location_stock_sync->clear_locations_cache();
		
		// Get all locations (only Europe 2682 and North America 2683).
		$locations = $this->location_stock_sync->get_all_locations();

		// Get sync settings.
		$auto_sync_enabled = $this->location_stock_sync->is_auto_sync_enabled();

		// Get initial data.
		$initial_data = array();
		$total_all = 0;
		$total_synced = 0;
		$total_unsync = 0;

		if ( ! empty( $locations ) ) {
			$initial_data = $this->location_stock_sync->get_products_location_stock_comparison( array(
				'per_page'           => 20,
				'page'               => 1,
				'sync_status'        => '',
				'include_variations' => true,
			) );
			$total_all = isset( $initial_data['total'] ) ? $initial_data['total'] : 0;
			$total_synced = isset( $initial_data['synced_count'] ) ? $initial_data['synced_count'] : 0;
			$total_unsync = isset( $initial_data['unsynced_count'] ) ? $initial_data['unsynced_count'] : 0;
		}

		?>
		<div class="wrap afs-wcml-sync-wrap afs-wcml-location-stock-sync-wrap">
			<h1><?php esc_html_e( 'Synchronisation des Stocks par Location WCMLIM', 'afs-wcml-api' ); ?></h1>

			<div class="afs-wcml-info-box">
				<h3><?php esc_html_e( 'Comment ça marche ?', 'afs-wcml-api' ); ?></h3>
				<p><?php esc_html_e( 'Cette fonctionnalité synchronise les quantités par location WCMLIM entre les différentes traductions de vos produits. Les quantités sont copiées identiquement de la langue source vers toutes les traductions.', 'afs-wcml-api' ); ?></p>
				<ul>
					<li><span class="afs-wcml-legend-match"></span> <?php esc_html_e( 'Stock synchronisé (identique à la source)', 'afs-wcml-api' ); ?></li>
					<li><span class="afs-wcml-legend-mismatch"></span> <?php esc_html_e( 'Stock non synchronisé (différent de la source)', 'afs-wcml-api' ); ?></li>
					<li><span class="afs-wcml-legend-empty"></span> <?php esc_html_e( 'Stock vide', 'afs-wcml-api' ); ?></li>
				</ul>
			</div>

			<div class="afs-wcml-cards">
				<!-- Settings Card -->
				<div class="afs-wcml-card afs-wcml-card-wide">
					<h2><?php esc_html_e( 'Paramètres de synchronisation', 'afs-wcml-api' ); ?></h2>
					
					<div style="margin-bottom: 20px;">
						<label class="afs-wcml-toggle">
							<input type="checkbox" name="location_stock_auto_sync" id="location_stock_auto_sync" value="1" <?php checked( $auto_sync_enabled ); ?> />
							<span class="afs-wcml-toggle-slider"></span>
						</label>
						<label for="location_stock_auto_sync" style="margin-left: 10px;">
							<?php esc_html_e( 'Synchronisation automatique', 'afs-wcml-api' ); ?>
						</label>
						<p class="description">
							<?php esc_html_e( 'Activer pour synchroniser automatiquement les stocks par location quand vous sauvegardez un produit.', 'afs-wcml-api' ); ?>
						</p>
					</div>

					<button type="button" class="button button-primary" id="afs-wcml-save-location-stock-settings">
						<?php esc_html_e( 'Sauvegarder les paramètres', 'afs-wcml-api' ); ?>
					</button>
				</div>

				<!-- Status Card -->
				<div class="afs-wcml-card afs-wcml-card-wide">
					<h2><?php esc_html_e( 'État de la synchronisation', 'afs-wcml-api' ); ?></h2>

					<div class="afs-wcml-status-grid">
						<div class="afs-wcml-status-item">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Locations détectées', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value"><?php echo count( $locations ); ?></span>
							<span class="afs-wcml-status-detail">
								<?php
								if ( ! empty( $locations ) ) {
									echo esc_html( implode( ', ', $locations ) );
								} else {
									esc_html_e( 'Aucune location trouvée', 'afs-wcml-api' );
								}
								?>
							</span>
						</div>
						<div class="afs-wcml-status-item status-info">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Total produits/variations', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value" id="afs-wcml-location-stock-total-count"><?php echo esc_html( $total_all ); ?></span>
						</div>
						<div class="afs-wcml-status-item status-ok">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Synchronisés', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value" id="afs-wcml-location-stock-synced-count"><?php echo esc_html( $total_synced ); ?></span>
						</div>
						<div class="afs-wcml-status-item status-warning">
							<span class="afs-wcml-status-label"><?php esc_html_e( 'Non synchronisés', 'afs-wcml-api' ); ?></span>
							<span class="afs-wcml-status-value" id="afs-wcml-location-stock-unsynced-count"><?php echo esc_html( $total_unsync ); ?></span>
						</div>
					</div>
				</div>

				<!-- Actions Card -->
				<div class="afs-wcml-card">
					<h2><?php esc_html_e( 'Actions', 'afs-wcml-api' ); ?></h2>
					<button type="button" class="button button-primary button-large" id="afs-wcml-sync-all-location-stock">
						<span class="dashicons dashicons-update"></span>
						<?php esc_html_e( 'Synchroniser tous les produits', 'afs-wcml-api' ); ?>
					</button>
					<p class="description" style="margin-top: 10px;">
						<?php esc_html_e( 'Synchronise les stocks par location de tous les produits et variations. Cette opération peut prendre du temps.', 'afs-wcml-api' ); ?>
					</p>
				</div>
			</div>

			<?php if ( empty( $locations ) ) : ?>
			<div class="notice notice-warning" style="margin: 20px 0; padding: 15px;">
				<p>
					<strong><?php esc_html_e( '⚠️ Aucune location WCMLIM trouvée', 'afs-wcml-api' ); ?></strong><br>
					<?php esc_html_e( 'Le plugin WCMLIM (WooCommerce Multi-Locations Inventory Management) ne semble pas être installé ou aucune location n\'a été configurée.', 'afs-wcml-api' ); ?>
				</p>
			</div>
			<?php else : ?>

			<!-- Filters -->
			<div class="afs-wcml-card afs-wcml-filters-card">
				<h2><?php esc_html_e( 'Filtres', 'afs-wcml-api' ); ?></h2>
				<div class="afs-wcml-filters">
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-location-stock-filter-search"><?php esc_html_e( 'Rechercher', 'afs-wcml-api' ); ?></label>
						<input type="text" id="afs-wcml-location-stock-filter-search" placeholder="<?php esc_attr_e( 'Nom du produit...', 'afs-wcml-api' ); ?>" />
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-location-stock-filter-type"><?php esc_html_e( 'Type de produit', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-location-stock-filter-type">
							<option value=""><?php esc_html_e( 'Tous', 'afs-wcml-api' ); ?></option>
							<option value="simple"><?php esc_html_e( 'Produits simples', 'afs-wcml-api' ); ?></option>
							<option value="variable"><?php esc_html_e( 'Produits variables', 'afs-wcml-api' ); ?></option>
							<option value="variation"><?php esc_html_e( 'Variations', 'afs-wcml-api' ); ?></option>
						</select>
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-location-stock-filter-status"><?php esc_html_e( 'Statut sync', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-location-stock-filter-status">
							<option value=""><?php esc_html_e( 'Tous', 'afs-wcml-api' ); ?></option>
							<option value="synced"><?php esc_html_e( 'Synchronisés', 'afs-wcml-api' ); ?></option>
							<option value="not_synced"><?php esc_html_e( 'Non synchronisés', 'afs-wcml-api' ); ?></option>
						</select>
					</div>
					<div class="afs-wcml-filter-group">
						<label for="afs-wcml-location-stock-filter-per-page"><?php esc_html_e( 'Par page', 'afs-wcml-api' ); ?></label>
						<select id="afs-wcml-location-stock-filter-per-page">
							<option value="10">10</option>
							<option value="20" selected>20</option>
							<option value="50">50</option>
							<option value="100">100</option>
						</select>
					</div>
					<div class="afs-wcml-filter-group afs-wcml-filter-actions">
						<button type="button" class="button button-primary" id="afs-wcml-location-stock-apply-filters">
							<span class="dashicons dashicons-search"></span>
							<?php esc_html_e( 'Filtrer', 'afs-wcml-api' ); ?>
						</button>
						<button type="button" class="button button-secondary" id="afs-wcml-location-stock-reset-filters">
							<?php esc_html_e( 'Réinitialiser', 'afs-wcml-api' ); ?>
						</button>
					</div>
				</div>
			</div>

			<!-- Results Summary -->
			<div class="afs-wcml-results-summary">
				<span id="afs-wcml-location-stock-results-count">
					<?php
					printf(
						/* translators: %d: number of products */
						esc_html__( '%d produit(s) trouvé(s)', 'afs-wcml-api' ),
						isset( $initial_data['total'] ) ? $initial_data['total'] : 0
					);
					?>
				</span>
				<div class="afs-wcml-pagination" id="afs-wcml-location-stock-pagination-top"></div>
			</div>

			<!-- Products Table -->
			<div class="afs-wcml-card afs-wcml-card-full afs-wcml-tracking-table-wrap">
				<h2>
					<?php esc_html_e( 'Tous les produits', 'afs-wcml-api' ); ?>
					<span class="afs-wcml-count-badge" id="afs-wcml-location-stock-total-display-count"><?php echo esc_html( $total_all ); ?></span>
					<?php if ( $total_unsync > 0 ) : ?>
						<span class="afs-wcml-count-badge warning" id="afs-wcml-location-stock-unsync-display-count"><?php echo esc_html( $total_unsync ); ?> <?php esc_html_e( 'à synchroniser', 'afs-wcml-api' ); ?></span>
					<?php endif; ?>
				</h2>

				<div id="afs-wcml-location-stock-loader" style="display: none;">
					<span class="spinner is-active"></span>
					<?php esc_html_e( 'Chargement...', 'afs-wcml-api' ); ?>
				</div>
				<div class="afs-wcml-table-scroll">
					<table class="wp-list-table widefat striped" id="afs-wcml-location-stock-sync-table">
						<thead>
							<tr>
								<th class="column-product"><?php esc_html_e( 'Produit', 'afs-wcml-api' ); ?></th>
								<th class="column-type"><?php esc_html_e( 'Type', 'afs-wcml-api' ); ?></th>
							<?php foreach ( $locations as $location_id ) : ?>
								<?php
								// Get location label.
								$location_label = '';
								if ( $location_id == 2682 ) {
									$location_label = __( 'Europe', 'afs-wcml-api' );
								} elseif ( $location_id == 2683 ) {
									$location_label = __( 'Amérique du Nord', 'afs-wcml-api' );
								} else {
									$location_label = sprintf( __( 'Location %d', 'afs-wcml-api' ), $location_id );
								}
								?>
								<th class="column-location">
									<?php echo esc_html( $location_label ); ?>
									<br>
									<small style="font-weight: normal; font-size: 11px; color: #646970;">
										<?php esc_html_e( 'ID:', 'afs-wcml-api' ); ?> <?php echo esc_html( $location_id ); ?>
									</small>
									<br>
									<small style="font-weight: normal;">
										<span class="afs-wcml-lang-badge source"><?php echo esc_html( strtoupper( $default_lang ) ); ?></span>
										<?php foreach ( $languages as $lang_code => $lang_data ) : ?>
											<?php if ( $lang_code !== $default_lang ) : ?>
												<span class="afs-wcml-lang-badge"><?php echo esc_html( strtoupper( $lang_code ) ); ?></span>
											<?php endif; ?>
										<?php endforeach; ?>
									</small>
								</th>
							<?php endforeach; ?>
								<th class="column-actions"><?php esc_html_e( 'Actions', 'afs-wcml-api' ); ?></th>
							</tr>
						</thead>
						<tbody id="afs-wcml-location-stock-sync-body">
							<?php if ( ! empty( $initial_data['products'] ) ) : ?>
								<?php foreach ( $initial_data['products'] as $product ) : ?>
									<?php $this->render_location_stock_sync_row( $product, $languages, $default_lang, $locations ); ?>
								<?php endforeach; ?>
							<?php else : ?>
								<tr class="no-items"><td colspan="100"><?php esc_html_e( 'Aucun produit trouvé.', 'afs-wcml-api' ); ?></td></tr>
							<?php endif; ?>
						</tbody>
					</table>
				</div>

				<!-- Pagination Bottom -->
				<div class="afs-wcml-pagination" id="afs-wcml-location-stock-pagination-bottom"></div>
			</div>
			<?php endif; ?>
		</div>

		<script type="text/javascript">
			var afs_wcml_location_stock_sync_data = <?php echo wp_json_encode( array(
				'locations'    => $locations,
				'languages'    => array_keys( $languages ),
				'default_lang' => $default_lang,
				'total'        => isset( $initial_data['total'] ) ? $initial_data['total'] : 0,
				'pages'        => isset( $initial_data['pages'] ) ? $initial_data['pages'] : 1,
				'current_page' => 1,
				'per_page'     => 20,
			) ); ?>;
		</script>
		<?php
	}

	/**
	 * Render a single location stock sync row.
	 *
	 * @param array $product      Product data.
	 * @param array $languages    Active languages.
	 * @param string $default_lang Default language code.
	 * @param array $locations    Location IDs.
	 */
	private function render_location_stock_sync_row( $product, $languages, $default_lang, $locations ) {
		$is_synced = isset( $product['is_synced'] ) ? $product['is_synced'] : false;
		$row_class = $is_synced ? 'synced-row' : 'not-synced-row';
		
		// Get frontend URL for default language.
		$frontend_url = isset( $product['frontend_urls'][ $default_lang ] ) ? $product['frontend_urls'][ $default_lang ] : ( isset( $product['frontend_urls'] ) && ! empty( $product['frontend_urls'] ) ? reset( $product['frontend_urls'] ) : '' );
		?>
		<tr class="<?php echo esc_attr( $row_class ); ?>" data-product-id="<?php echo esc_attr( $product['product_id'] ); ?>">
			<td class="column-product">
				<strong>
					<?php if ( $frontend_url ) : ?>
						<a href="<?php echo esc_url( $frontend_url ); ?>" target="_blank">
							<?php echo esc_html( $product['product_name'] ); ?>
						</a>
					<?php else : ?>
						<?php echo esc_html( $product['product_name'] ); ?>
					<?php endif; ?>
				</strong>
				<?php if ( $product['is_variation'] && ! empty( $product['parent_name'] ) ) : ?>
					<br><small class="parent-name"><?php echo esc_html( $product['parent_name'] ); ?></small>
				<?php endif; ?>
				<br><small class="product-id">ID: <?php echo esc_html( $product['product_id'] ); ?></small>
			</td>
			<td class="column-type">
				<span class="afs-wcml-type-badge <?php echo esc_attr( $product['product_type'] ); ?>">
					<?php echo esc_html( ucfirst( $product['product_type'] ) ); ?>
				</span>
			</td>

			<?php foreach ( $locations as $location_id ) : ?>
				<?php
				$location_data = null;
				foreach ( $product['locations'] as $loc ) {
					if ( $loc['location_id'] === $location_id ) {
						$location_data = $loc;
						break;
					}
				}
				?>
				<td class="column-location">
					<?php if ( $location_data ) : ?>
						<div style="padding: 5px;">
							<!-- Source (default language) -->
							<div style="margin-bottom: 8px; padding: 5px; background: #f8fbff; border-left: 3px solid #2271b1; border-radius: 3px;">
								<strong style="font-size: 10px; display: block; margin-bottom: 3px;">
									<?php echo esc_html( strtoupper( $default_lang ) ); ?>
								</strong>
								<div style="font-size: 11px;">
									<span style="color: #646970;">Stock:</span> <strong><?php echo esc_html( $location_data['source']['stock'] ); ?></strong><br>
									<span style="color: #646970;">Disponible:</span> <strong><?php echo esc_html( $location_data['source']['available'] ); ?></strong>
								</div>
							</div>

							<!-- Translations -->
							<?php foreach ( $languages as $lang_code => $lang_data ) : ?>
								<?php if ( $lang_code === $default_lang ) : ?>
									<?php continue; ?>
								<?php endif; ?>

								<?php
								$trans_data = isset( $location_data['translations'][ $lang_code ] ) ? $location_data['translations'][ $lang_code ] : null;
								$trans_is_synced = $trans_data ? $trans_data['is_synced'] : false;
								$border_color = $trans_is_synced ? '#00a32a' : '#d63638';
								$bg_color = $trans_is_synced ? '#edfaef' : '#fcf0f1';
								?>
								<div style="margin-bottom: 8px; padding: 5px; border-left: 3px solid <?php echo esc_attr( $border_color ); ?>; background: <?php echo esc_attr( $bg_color ); ?>; border-radius: 3px;">
									<strong style="font-size: 10px; display: block; margin-bottom: 3px;">
										<?php echo esc_html( strtoupper( $lang_code ) ); ?>
										<?php if ( $trans_is_synced ) : ?>
											<span style="color: #00a32a; font-size: 9px;">✓</span>
										<?php else : ?>
											<span style="color: #d63638; font-size: 9px;">✗</span>
										<?php endif; ?>
									</strong>
									<?php if ( $trans_data ) : ?>
										<div style="font-size: 11px;">
											<span style="color: #646970;">Stock:</span> <strong><?php echo esc_html( $trans_data['stock'] ); ?></strong><br>
											<span style="color: #646970;">Disponible:</span> <strong><?php echo esc_html( $trans_data['available'] ); ?></strong>
										</div>
									<?php else : ?>
										<div style="font-size: 10px; color: #a7aaad; font-style: italic;">
											<?php esc_html_e( 'Pas de traduction', 'afs-wcml-api' ); ?>
										</div>
									<?php endif; ?>
								</div>
							<?php endforeach; ?>
						</div>
					<?php else : ?>
						<span class="price-empty">-</span>
					<?php endif; ?>
				</td>
			<?php endforeach; ?>

			<td class="column-actions">
				<button type="button" class="button button-small button-primary afs-wcml-sync-single-location-stock" data-product-id="<?php echo esc_attr( $product['product_id'] ); ?>">
					<span class="dashicons dashicons-update"></span>
					<?php esc_html_e( 'Sync', 'afs-wcml-api' ); ?>
				</button>
				<?php if ( $is_synced ) : ?>
					<span class="afs-wcml-synced-badge" style="margin-top: 5px; display: block;">
						<span class="dashicons dashicons-yes-alt"></span>
						<?php esc_html_e( 'OK', 'afs-wcml-api' ); ?>
					</span>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}
}
