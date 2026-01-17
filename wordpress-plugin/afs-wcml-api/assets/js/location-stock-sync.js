/**
 * Location Stock Sync functionality for AFS WCML API plugin
 */
(function($) {
	'use strict';

	console.log('[Location Stock Sync] Script loaded');

	$(document).ready(function() {
		console.log('[Location Stock Sync] Document ready');

		// Check if we're on the location stock sync page
		var $saveButton = $('#afs-wcml-save-location-stock-settings');
		console.log('[Location Stock Sync] Save button found:', $saveButton.length > 0);

		if ($saveButton.length === 0) {
			console.log('[Location Stock Sync] Not on location stock sync page, exiting');
			return;
		}

		console.log('[Location Stock Sync] On location stock sync page, initializing...');

		// Check if afs_wcml_admin is defined
		if (typeof afs_wcml_admin === 'undefined') {
			console.error('[Location Stock Sync] ERROR: afs_wcml_admin is undefined!');
			alert('Erreur: Configuration AJAX non disponible. Veuillez recharger la page.');
			return;
		}

		// Check if sync data is available
		if (typeof afs_wcml_location_stock_sync_data === 'undefined') {
			console.error('[Location Stock Sync] ERROR: afs_wcml_location_stock_sync_data is undefined!');
			return;
		}

		// State management
		var locationStockState = {
			currentPage: 1,
			totalPages: 1,
			total: 0,
			filters: {
				page: 1,
				per_page: 20,
				product_type: '',
				sync_status: '',
				search: '',
				include_variations: true
			}
		};

		/**
		 * Load location stock products with filters
		 */
		function loadLocationStockProducts(page) {
			if (page) {
				locationStockState.filters.page = page;
			}

			var $loader = $('#afs-wcml-location-stock-loader');
			var $tbody = $('#afs-wcml-location-stock-sync-body');
			var $table = $('#afs-wcml-location-stock-sync-table');

			$loader.show();
			$tbody.css('opacity', '0.5');
			$table.hide();

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_get_products_location_stock_comparison',
					nonce: afs_wcml_admin.nonce,
					page: locationStockState.filters.page,
					per_page: locationStockState.filters.per_page,
					product_type: locationStockState.filters.product_type,
					sync_status: locationStockState.filters.sync_status,
					search: locationStockState.filters.search,
					include_variations: locationStockState.filters.include_variations
				},
				success: function(response) {
					$loader.hide();
					$tbody.css('opacity', '1');
					$table.show();

					if (response.success) {
						locationStockState.currentPage = response.data.current_page;
						locationStockState.totalPages = response.data.pages;
						locationStockState.total = response.data.total;

						renderLocationStockTable(response.data.products, response.data.locations, response.data.languages, response.data.default_lang);
						renderLocationStockPagination();
						updateLocationStockCounts(response.data);
					} else {
						$tbody.html('<tr class="no-items"><td colspan="100">' + (response.data.message || 'Erreur lors du chargement.') + '</td></tr>');
					}
				},
				error: function(xhr, status, error) {
					$loader.hide();
					$tbody.css('opacity', '1');
					$table.show();
					$tbody.html('<tr class="no-items"><td colspan="100">Erreur: ' + error + '</td></tr>');
				}
			});
		}

		/**
		 * Render location stock table rows
		 */
		function renderLocationStockTable(products, locations, languages, defaultLang) {
			var $tbody = $('#afs-wcml-location-stock-sync-body');

			if (!products || products.length === 0) {
				$tbody.html('<tr class="no-items"><td colspan="100">Aucun produit trouvé.</td></tr>');
				return;
			}

			var html = '';
			products.forEach(function(product) {
				html += renderLocationStockRow(product, locations, languages, defaultLang);
			});

			$tbody.html(html);
		}

		/**
		 * Render a single location stock row
		 */
		function renderLocationStockRow(product, locations, languages, defaultLang) {
			var rowClass = product.is_synced ? 'synced-row' : 'not-synced-row';
			var html = '<tr class="' + rowClass + '" data-product-id="' + product.product_id + '">';
			
			// Product column
			html += '<td class="column-product">';
			// Get frontend URL for default language.
			var frontendUrl = (product.frontend_urls && product.frontend_urls[defaultLang]) 
				? product.frontend_urls[defaultLang] 
				: (product.frontend_urls && Object.keys(product.frontend_urls).length > 0 
					? product.frontend_urls[Object.keys(product.frontend_urls)[0]] 
					: '');
			
			if (frontendUrl) {
				html += '<strong><a href="' + escapeHtml(frontendUrl) + '" target="_blank">' + escapeHtml(product.product_name) + '</a></strong>';
			} else {
				html += '<strong>' + escapeHtml(product.product_name) + '</strong>';
			}
			if (product.is_variation && product.parent_name) {
				html += '<br><small class="parent-name">' + escapeHtml(product.parent_name) + '</small>';
			}
			html += '<br><small class="product-id">ID: ' + product.product_id + '</small>';
			html += '</td>';

			// Type column
			html += '<td class="column-type">';
			html += '<span class="afs-wcml-type-badge ' + escapeHtml(product.product_type) + '">';
			html += escapeHtml(product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1));
			html += '</span>';
			html += '</td>';

			// Location columns
			locations.forEach(function(locationId) {
				// Get location label
				var locationLabel = '';
				if (locationId == 2682) {
					locationLabel = 'Europe';
				} else if (locationId == 2683) {
					locationLabel = 'Amérique du Nord';
				} else {
					locationLabel = 'Location ' + locationId;
				}

				var locationData = null;
				if (product.locations) {
					product.locations.forEach(function(loc) {
						if (loc.location_id === locationId) {
							locationData = loc;
						}
					});
				}

				html += '<td class="column-location">';
				if (locationData) {
					html += '<div style="padding: 5px;">';
					
					// Source (default language)
					html += '<div style="margin-bottom: 8px; padding: 5px; background: #f8fbff; border-left: 3px solid #2271b1; border-radius: 3px;">';
					html += '<strong style="font-size: 10px; display: block; margin-bottom: 3px;">' + escapeHtml(defaultLang.toUpperCase()) + '</strong>';
					html += '<div style="font-size: 11px;">';
					html += '<span style="color: #646970;">Stock:</span> <strong>' + escapeHtml(locationData.source.stock) + '</strong><br>';
					html += '<span style="color: #646970;">Disponible:</span> <strong>' + escapeHtml(locationData.source.available) + '</strong>';
					html += '</div>';
					html += '</div>';

					// Translations
					languages.forEach(function(langCode) {
						if (langCode === defaultLang) {
							return;
						}

						var transData = locationData.translations && locationData.translations[langCode] ? locationData.translations[langCode] : null;
						var transIsSynced = transData ? transData.is_synced : false;
						var borderColor = transIsSynced ? '#00a32a' : '#d63638';
						var bgColor = transIsSynced ? '#edfaef' : '#fcf0f1';

						html += '<div style="margin-bottom: 8px; padding: 5px; border-left: 3px solid ' + borderColor + '; background: ' + bgColor + '; border-radius: 3px;">';
						html += '<strong style="font-size: 10px; display: block; margin-bottom: 3px;">';
						html += escapeHtml(langCode.toUpperCase());
						if (transIsSynced) {
							html += ' <span style="color: #00a32a; font-size: 9px;">✓</span>';
						} else {
							html += ' <span style="color: #d63638; font-size: 9px;">✗</span>';
						}
						html += '</strong>';
						
						if (transData) {
							html += '<div style="font-size: 11px;">';
							html += '<span style="color: #646970;">Stock:</span> <strong>' + escapeHtml(transData.stock) + '</strong><br>';
							html += '<span style="color: #646970;">Disponible:</span> <strong>' + escapeHtml(transData.available) + '</strong>';
							html += '</div>';
						} else {
							html += '<div style="font-size: 10px; color: #a7aaad; font-style: italic;">Pas de traduction</div>';
						}
						html += '</div>';
					});

					html += '</div>';
				} else {
					html += '<span class="price-empty">-</span>';
				}
				html += '</td>';
			});

			// Actions column
			html += '<td class="column-actions">';
			html += '<button type="button" class="button button-small button-primary afs-wcml-sync-single-location-stock" data-product-id="' + product.product_id + '">';
			html += '<span class="dashicons dashicons-update"></span> Sync';
			html += '</button>';
			if (product.is_synced) {
				html += '<span class="afs-wcml-synced-badge" style="margin-top: 5px; display: block;">';
				html += '<span class="dashicons dashicons-yes-alt"></span> OK';
				html += '</span>';
			}
			html += '</td>';

			html += '</tr>';
			return html;
		}

		/**
		 * Render pagination
		 */
		function renderLocationStockPagination() {
			var paginationHtml = '';
			var currentPage = locationStockState.currentPage;
			var totalPages = locationStockState.totalPages;

			if (totalPages <= 1) {
				paginationHtml = '';
			} else {
				paginationHtml = '<div class="afs-wcml-pagination-controls">';
				
				// Previous button
				if (currentPage > 1) {
					paginationHtml += '<button type="button" class="button afs-wcml-pagination-prev" data-page="' + (currentPage - 1) + '">';
					paginationHtml += '&laquo; ' + afs_wcml_admin.i18n.prev || 'Précédent';
					paginationHtml += '</button>';
				}

				// Page numbers
				var startPage = Math.max(1, currentPage - 2);
				var endPage = Math.min(totalPages, currentPage + 2);

				if (startPage > 1) {
					paginationHtml += '<button type="button" class="button afs-wcml-pagination-page" data-page="1">1</button>';
					if (startPage > 2) {
						paginationHtml += '<span class="afs-wcml-pagination-dots">...</span>';
					}
				}

				for (var i = startPage; i <= endPage; i++) {
					if (i === currentPage) {
						paginationHtml += '<span class="button disabled">' + i + '</span>';
					} else {
						paginationHtml += '<button type="button" class="button afs-wcml-pagination-page" data-page="' + i + '">' + i + '</button>';
					}
				}

				if (endPage < totalPages) {
					if (endPage < totalPages - 1) {
						paginationHtml += '<span class="afs-wcml-pagination-dots">...</span>';
					}
					paginationHtml += '<button type="button" class="button afs-wcml-pagination-page" data-page="' + totalPages + '">' + totalPages + '</button>';
				}

				// Next button
				if (currentPage < totalPages) {
					paginationHtml += '<button type="button" class="button afs-wcml-pagination-next" data-page="' + (currentPage + 1) + '">';
					paginationHtml += (afs_wcml_admin.i18n.next || 'Suivant') + ' &raquo;';
					paginationHtml += '</button>';
				}

				paginationHtml += '</div>';
			}

			$('#afs-wcml-location-stock-pagination-top').html(paginationHtml);
			$('#afs-wcml-location-stock-pagination-bottom').html(paginationHtml);
		}

		/**
		 * Update counts display
		 */
		function updateLocationStockCounts(data) {
			$('#afs-wcml-location-stock-total-count').text(data.total || 0);
			$('#afs-wcml-location-stock-synced-count').text(data.synced_count || 0);
			$('#afs-wcml-location-stock-unsynced-count').text(data.unsynced_count || 0);
			$('#afs-wcml-location-stock-total-display-count').text(data.total || 0);
			$('#afs-wcml-location-stock-unsync-display-count').text(data.unsynced_count || 0);
			
			var resultsText = (data.total || 0) + ' produit(s) trouvé(s)';
			$('#afs-wcml-location-stock-results-count').text(resultsText);
		}

		/**
		 * Escape HTML
		 */
		function escapeHtml(text) {
			if (!text) return '';
			var map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
			};
			return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
		}

		/**
		 * Handle save location stock settings
		 */
		$(document).on('click', '#afs-wcml-save-location-stock-settings', function(e) {
			e.preventDefault();
			var $button = $(this);

			var autoSync = $('#location_stock_auto_sync').is(':checked') ? 1 : 0;

			$button.prop('disabled', true).html('<span class="spinner is-active" style="float:none;margin:0;"></span> Sauvegarde...');

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_save_location_stock_sync_settings',
					nonce: afs_wcml_admin.nonce,
					auto_sync: autoSync
				},
				success: function(response) {
					$button.prop('disabled', false).html('Sauvegarder les paramètres');
					if (response.success) {
						alert('Paramètres sauvegardés avec succès.');
					} else {
						alert('Erreur: ' + (response.data.message || 'Erreur inconnue'));
					}
				},
				error: function() {
					$button.prop('disabled', false).html('Sauvegarder les paramètres');
					alert('Erreur lors de la sauvegarde.');
				}
			});
		});

		/**
		 * Handle sync all location stock
		 */
		$(document).on('click', '#afs-wcml-sync-all-location-stock', function(e) {
			e.preventDefault();
			
			if (!confirm('Voulez-vous synchroniser les stocks par location de tous les produits ? Cette opération peut prendre du temps.')) {
				return;
			}

			var $button = $(this);
			$button.prop('disabled', true).html('<span class="spinner is-active" style="float:none;margin:0;"></span> Synchronisation...');

			function syncBatch(offset) {
				$.ajax({
					url: afs_wcml_admin.ajax_url,
					type: 'POST',
					data: {
						action: 'afs_wcml_sync_all_location_stock',
						nonce: afs_wcml_admin.nonce,
						batch_size: 50,
						offset: offset
					},
					success: function(response) {
						if (response.success) {
							if (response.data.has_more) {
								$button.html('Traitement de ' + (offset + response.data.processed) + ' produits...');
								syncBatch(offset + response.data.processed);
							} else {
								$button.prop('disabled', false).html('<span class="dashicons dashicons-update"></span> Synchroniser tous les produits');
								alert('Synchronisation terminée !');
								loadLocationStockProducts(1);
							}
						} else {
							$button.prop('disabled', false).html('<span class="dashicons dashicons-update"></span> Synchroniser tous les produits');
							alert('Erreur: ' + (response.data.message || 'Erreur inconnue'));
						}
					},
					error: function() {
						$button.prop('disabled', false).html('<span class="dashicons dashicons-update"></span> Synchroniser tous les produits');
						alert('Erreur lors de la synchronisation.');
					}
				});
			}

			syncBatch(0);
		});

		/**
		 * Handle sync single product location stock
		 */
		$(document).on('click', '.afs-wcml-sync-single-location-stock', function(e) {
			e.preventDefault();
			var $button = $(this);
			var productId = $button.data('product-id');

			var originalHtml = $button.html();
			$button.prop('disabled', true).html('<span class="spinner is-active" style="float:none;margin:0;"></span>');

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_sync_product_location_stock',
					nonce: afs_wcml_admin.nonce,
					product_id: productId
				},
				success: function(response) {
					$button.prop('disabled', false).html(originalHtml);
					if (response.success) {
						alert('Synchronisation réussie !');
						loadLocationStockProducts(locationStockState.currentPage);
					} else {
						alert('Erreur: ' + (response.data.message || 'Erreur inconnue'));
					}
				},
				error: function() {
					$button.prop('disabled', false).html(originalHtml);
					alert('Erreur lors de la synchronisation.');
				}
			});
		});

		/**
		 * Handle filters
		 */
		$(document).on('click', '#afs-wcml-location-stock-apply-filters', function() {
			locationStockState.filters.search = $('#afs-wcml-location-stock-filter-search').val();
			locationStockState.filters.product_type = $('#afs-wcml-location-stock-filter-type').val();
			locationStockState.filters.sync_status = $('#afs-wcml-location-stock-filter-status').val();
			locationStockState.filters.per_page = parseInt($('#afs-wcml-location-stock-filter-per-page').val()) || 20;
			locationStockState.filters.page = 1;
			loadLocationStockProducts(1);
		});

		$(document).on('click', '#afs-wcml-location-stock-reset-filters', function() {
			$('#afs-wcml-location-stock-filter-search').val('');
			$('#afs-wcml-location-stock-filter-type').val('');
			$('#afs-wcml-location-stock-filter-status').val('');
			$('#afs-wcml-location-stock-filter-per-page').val('20');
			locationStockState.filters = {
				page: 1,
				per_page: 20,
				product_type: '',
				sync_status: '',
				search: '',
				include_variations: true
			};
			loadLocationStockProducts(1);
		});

		/**
		 * Handle pagination
		 */
		$(document).on('click', '.afs-wcml-pagination-page, .afs-wcml-pagination-prev, .afs-wcml-pagination-next', function() {
			var page = $(this).data('page');
			if (page) {
				loadLocationStockProducts(page);
			}
		});

		// Initialize on page load if data is available
		if (afs_wcml_location_stock_sync_data && afs_wcml_location_stock_sync_data.total > 0) {
			locationStockState.total = afs_wcml_location_stock_sync_data.total;
			locationStockState.totalPages = afs_wcml_location_stock_sync_data.pages;
			locationStockState.currentPage = afs_wcml_location_stock_sync_data.current_page;
			locationStockState.filters.per_page = afs_wcml_location_stock_sync_data.per_page;
		}
	});

})(jQuery);
