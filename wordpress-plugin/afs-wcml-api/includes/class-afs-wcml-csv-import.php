<?php
/**
 * CSV Import class.
 *
 * @package AFS_WCML_API
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AFS_WCML_CSV_Import class.
 */
class AFS_WCML_CSV_Import {

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
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'handle_csv_upload' ) );
	}

	/**
	 * Add admin menu.
	 */
	public function add_admin_menu() {
		add_submenu_page(
			'woocommerce',
			__( 'Import Prix WCML', 'afs-wcml-api' ),
			__( 'Import Prix WCML', 'afs-wcml-api' ),
			'manage_woocommerce',
			'afs-wcml-import',
			array( $this, 'render_import_page' )
		);
	}

	/**
	 * Render import page.
	 */
	public function render_import_page() {
		// Check user permissions.
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Vous n\'avez pas les permissions nécessaires.', 'afs-wcml-api' ) );
		}

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Import Prix par Devise', 'afs-wcml-api' ); ?></h1>

			<div class="card" style="max-width: 800px;">
				<h2><?php esc_html_e( 'Importer un fichier CSV', 'afs-wcml-api' ); ?></h2>

				<form method="post" enctype="multipart/form-data" action="">
					<?php wp_nonce_field( 'afs_wcml_csv_import', 'afs_wcml_csv_import_nonce' ); ?>

					<table class="form-table">
						<tr>
							<th scope="row">
								<label for="csv_file"><?php esc_html_e( 'Fichier CSV', 'afs-wcml-api' ); ?></label>
							</th>
							<td>
								<input type="file" name="csv_file" id="csv_file" accept=".csv" required />
								<p class="description">
									<?php esc_html_e( 'Sélectionnez un fichier CSV avec les prix par devise.', 'afs-wcml-api' ); ?>
								</p>
							</td>
						</tr>
					</table>

					<?php submit_button( __( 'Importer', 'afs-wcml-api' ), 'primary', 'submit' ); ?>
				</form>

				<hr>

				<h3><?php esc_html_e( 'Format CSV', 'afs-wcml-api' ); ?></h3>
				<p><?php esc_html_e( 'Le fichier CSV doit suivre ce format:', 'afs-wcml-api' ); ?></p>
				<pre style="background: #f5f5f5; padding: 15px; border: 1px solid #ddd; overflow-x: auto;">
product_id,currency,regular_price,sale_price
123,USD,100,
123,EUR,89,
123,GBP,75,
456,USD,50,45
456,EUR,44,
789,USD,200,180
				</pre>

				<p><strong><?php esc_html_e( 'Colonnes:', 'afs-wcml-api' ); ?></strong></p>
				<ul>
					<li><strong>product_id</strong>: <?php esc_html_e( 'ID du produit ou de la variation', 'afs-wcml-api' ); ?></li>
					<li><strong>currency</strong>: <?php esc_html_e( 'Code devise (USD, EUR, GBP, etc.)', 'afs-wcml-api' ); ?></li>
					<li><strong>regular_price</strong>: <?php esc_html_e( 'Prix régulier (requis)', 'afs-wcml-api' ); ?></li>
					<li><strong>sale_price</strong>: <?php esc_html_e( 'Prix de vente (optionnel, laissez vide si aucun)', 'afs-wcml-api' ); ?></li>
				</ul>

				<p><strong><?php esc_html_e( 'Notes:', 'afs-wcml-api' ); ?></strong></p>
				<ul>
					<li><?php esc_html_e( 'La première ligne doit contenir les en-têtes de colonnes.', 'afs-wcml-api' ); ?></li>
					<li><?php esc_html_e( 'Vous pouvez définir plusieurs devises pour le même produit sur des lignes séparées.', 'afs-wcml-api' ); ?></li>
					<li><?php esc_html_e( 'Les produits variables doivent utiliser l\'ID de la variation, pas l\'ID du produit parent.', 'afs-wcml-api' ); ?></li>
					<li><?php esc_html_e( 'Les prix doivent être des nombres positifs.', 'afs-wcml-api' ); ?></li>
				</ul>
			</div>
		</div>
		<?php
	}

	/**
	 * Handle CSV file upload and import.
	 */
	public function handle_csv_upload() {
		// Check if form was submitted.
		if ( ! isset( $_POST['submit'] ) || ! isset( $_FILES['csv_file'] ) ) {
			return;
		}

		// Verify nonce.
		if ( ! isset( $_POST['afs_wcml_csv_import_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['afs_wcml_csv_import_nonce'] ) ), 'afs_wcml_csv_import' ) ) {
			wp_die( esc_html__( 'Erreur de sécurité. Veuillez réessayer.', 'afs-wcml-api' ) );
		}

		// Check user permissions.
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Vous n\'avez pas les permissions nécessaires.', 'afs-wcml-api' ) );
		}

		// Check file upload.
		if ( ! isset( $_FILES['csv_file'] ) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK ) {
			add_action( 'admin_notices', array( $this, 'import_error_notice' ) );
			return;
		}

		$file = $_FILES['csv_file'];

		// Check file type.
		$file_ext = strtolower( pathinfo( $file['name'], PATHINFO_EXTENSION ) );
		if ( $file_ext !== 'csv' ) {
			add_action( 'admin_notices', function() {
				?>
				<div class="notice notice-error">
					<p><?php esc_html_e( 'Le fichier doit être un fichier CSV.', 'afs-wcml-api' ); ?></p>
				</div>
				<?php
			} );
			return;
		}

		// Process CSV file.
		$result = $this->process_csv_file( $file['tmp_name'] );

		if ( is_wp_error( $result ) ) {
			add_action( 'admin_notices', function() use ( $result ) {
				?>
				<div class="notice notice-error">
					<p><strong><?php esc_html_e( 'Erreur d\'import:', 'afs-wcml-api' ); ?></strong> <?php echo esc_html( $result->get_error_message() ); ?></p>
				</div>
				<?php
			} );
			return;
		}

		// Show success notice.
		add_action( 'admin_notices', function() use ( $result ) {
			?>
			<div class="notice notice-success">
				<p>
					<strong><?php esc_html_e( 'Import réussi!', 'afs-wcml-api' ); ?></strong>
					<?php
					printf(
						esc_html__( '%d produits mis à jour, %d erreurs.', 'afs-wcml-api' ),
						$result['success_count'],
						$result['error_count']
					);
					?>
				</p>
				<?php if ( ! empty( $result['errors'] ) ) : ?>
					<ul>
						<?php foreach ( $result['errors'] as $error ) : ?>
							<li><?php echo esc_html( $error ); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
			</div>
			<?php
		} );
	}

	/**
	 * Process CSV file.
	 *
	 * @param string $file_path File path.
	 * @return array|WP_Error
	 */
	private function process_csv_file( $file_path ) {
		if ( ! file_exists( $file_path ) || ! is_readable( $file_path ) ) {
			return new WP_Error( 'file_error', __( 'Impossible de lire le fichier CSV.', 'afs-wcml-api' ) );
		}

		$handle = fopen( $file_path, 'r' );
		if ( $handle === false ) {
			return new WP_Error( 'file_error', __( 'Impossible d\'ouvrir le fichier CSV.', 'afs-wcml-api' ) );
		}

		// Read header row.
		$headers = fgetcsv( $handle );
		if ( $headers === false ) {
			fclose( $handle );
			return new WP_Error( 'csv_error', __( 'Le fichier CSV est vide ou invalide.', 'afs-wcml-api' ) );
		}

		// Normalize headers.
		$headers = array_map( 'trim', $headers );
		$headers = array_map( 'strtolower', $headers );

		// Find column indices.
		$product_id_index = array_search( 'product_id', $headers, true );
		$currency_index   = array_search( 'currency', $headers, true );
		$regular_price_index = array_search( 'regular_price', $headers, true );
		$sale_price_index    = array_search( 'sale_price', $headers, true );

		if ( $product_id_index === false || $currency_index === false || $regular_price_index === false ) {
			fclose( $handle );
			return new WP_Error(
				'csv_error',
				__( 'Le fichier CSV doit contenir les colonnes: product_id, currency, regular_price, sale_price', 'afs-wcml-api' )
			);
		}

		// Group prices by product_id.
		$products_prices = array();
		$line_number = 1;

		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			$line_number++;

			// Skip empty rows.
			if ( empty( array_filter( $row ) ) ) {
				continue;
			}

			// Get values.
			$product_id = isset( $row[ $product_id_index ] ) ? trim( $row[ $product_id_index ] ) : '';
			$currency   = isset( $row[ $currency_index ] ) ? strtoupper( trim( $row[ $currency_index ] ) ) : '';
			$regular_price = isset( $row[ $regular_price_index ] ) ? trim( $row[ $regular_price_index ] ) : '';
			$sale_price    = isset( $row[ $sale_price_index ] ) ? trim( $row[ $sale_price_index ] ) : '';

			// Validate required fields.
			if ( empty( $product_id ) || empty( $currency ) || empty( $regular_price ) ) {
				continue; // Skip invalid rows.
			}

			// Validate product exists.
			$product = wc_get_product( $product_id );
			if ( ! $product ) {
				continue; // Skip non-existent products.
			}

			// Initialize product prices array if needed.
			if ( ! isset( $products_prices[ $product_id ] ) ) {
				$products_prices[ $product_id ] = array();
			}

			// Add price for currency.
			$products_prices[ $product_id ][ $currency ] = array(
				'regular_price' => $regular_price,
				'sale_price'    => $sale_price,
			);
		}

		fclose( $handle );

		// Process each product.
		$results = array(
			'success_count' => 0,
			'error_count'   => 0,
			'errors'        => array(),
		);

		foreach ( $products_prices as $product_id => $prices ) {
			// Validate prices.
			$validation = $this->prices->validate_prices( $prices );
			if ( is_wp_error( $validation ) ) {
				$results['error_count']++;
				$results['errors'][] = sprintf(
					__( 'Produit %d: %s', 'afs-wcml-api' ),
					$product_id,
					$validation->get_error_message()
				);
				continue;
			}

			// Format prices.
			$formatted_prices = $this->prices->format_prices_array( $prices );

			// Save prices.
			$result = $this->prices->save_product_prices( $product_id, $formatted_prices );
			if ( $result ) {
				$this->prices->disable_auto_conversion( $product_id );
				$results['success_count']++;
			} else {
				$results['error_count']++;
				$results['errors'][] = sprintf(
					__( 'Produit %d: Erreur lors de la sauvegarde', 'afs-wcml-api' ),
					$product_id
				);
			}
		}

		return $results;
	}

	/**
	 * Import error notice.
	 */
	public function import_error_notice() {
		?>
		<div class="notice notice-error">
			<p><?php esc_html_e( 'Erreur lors de l\'upload du fichier. Veuillez réessayer.', 'afs-wcml-api' ); ?></p>
		</div>
		<?php
	}
}


