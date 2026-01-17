/**
 * Price Sync functionality for AFS WCML API plugin
 */
(function ($) {
	'use strict';

	$(document).ready(function () {
		// Check if we're on the price sync page
		if (typeof afs_wcml_price_sync_data === 'undefined') {
			return;
		}

		// Price sync state
		var priceSyncState = {
			currentPage: afs_wcml_price_sync_data.current_page || 1,
			totalPages: afs_wcml_price_sync_data.pages || 1,
			total: afs_wcml_price_sync_data.total || 0,
			currencies: afs_wcml_price_sync_data.currencies || [],
			languages: afs_wcml_price_sync_data.languages || [],
			defaultLang: afs_wcml_price_sync_data.default_lang || 'en',
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
		 * Load price sync products with filters
		 */
		function loadPriceSyncProducts(page) {
			if (page) {
				priceSyncState.filters.page = page;
			}

			var $loader = $('#afs-wcml-price-sync-loader');
			var $tbody = $('#afs-wcml-price-sync-body');
			var $table = $('#afs-wcml-sync-table');

			$loader.show();
			$tbody.css('opacity', '0.5');
			$table.hide();

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_get_products_price_sync',
					nonce: afs_wcml_admin.nonce,
					page: priceSyncState.filters.page,
					per_page: priceSyncState.filters.per_page,
					product_type: priceSyncState.filters.product_type,
					sync_status: priceSyncState.filters.sync_status,
					search: priceSyncState.filters.search,
					include_variations: priceSyncState.filters.include_variations
				},
				success: function (response) {
					$loader.hide();
					$tbody.css('opacity', '1');
					$table.show();

					if (response.success) {
						priceSyncState.currentPage = response.data.current_page;
						priceSyncState.totalPages = response.data.pages;
						priceSyncState.total = response.data.total;
						priceSyncState.currencies = response.data.currencies || [];
						priceSyncState.languages = response.data.languages || [];
						priceSyncState.defaultLang = response.data.default_lang || 'en';

						renderPriceSyncTable(response.data.products);
						renderPriceSyncPagination();
						updatePriceSyncCounts();
					} else {
						$tbody.html('<tr class="no-items"><td colspan="100">' + (response.data.message || 'Erreur lors du chargement.') + '</td></tr>');
					}
				},
				error: function (xhr, status, error) {
					$loader.hide();
					$tbody.css('opacity', '1');
					$table.show();
					$tbody.html('<tr class="no-items"><td colspan="100">Erreur: ' + error + '</td></tr>');
				}
			});
		}

		/**
		 * Render price sync table rows
		 */
		function renderPriceSyncTable(products) {
			var $tbody = $('#afs-wcml-price-sync-body');

			if (!products || products.length === 0) {
				$tbody.html('<tr class="no-items"><td colspan="100">Aucun produit trouvé.</td></tr>');
				return;
			}

			var html = '';

			products.forEach(function (product) {
				html += renderPriceSyncRow(product);
			});

			$tbody.html(html);
		}

		/**
		 * Render a single price sync row
		 */
		function renderPriceSyncRow(product) {
			var rowClass = product.is_synced ? 'synced-row' : 'not-synced-row';
			var html = '<tr class="' + rowClass + '" data-product-id="' + product.product_id + '">';

			// Product column
			html += '<td class="column-product">';
			html += '<strong><a href="' + escapeHtml(product.edit_url || '#') + '" target="_blank">' + escapeHtml(product.product_name) + '</a></strong>';
			if (product.frontend_urls && Object.keys(product.frontend_urls).length > 0) {
				html += '<br>';
				for (var urlLang in product.frontend_urls) {
					if (product.frontend_urls.hasOwnProperty(urlLang) && product.frontend_urls[urlLang]) {
						html += '<a href="' + escapeHtml(product.frontend_urls[urlLang]) + '" target="_blank" style="font-size: 11px; color: #2271b1; text-decoration: none; margin-right: 8px;">' + urlLang.toUpperCase() + '</a>';
					}
				}
			}
			if (product.is_variation && product.parent_name) {
				html += '<br><small class="parent-name">' + escapeHtml(product.parent_name) + '</small>';
			}
			html += '<br><small class="product-id">ID: ' + product.product_id + '</small>';
			html += '</td>';

			// Type column
			html += '<td class="column-type">';
			html += '<span class="afs-wcml-type-badge ' + product.product_type + '">' + capitalizeFirst(product.product_type) + '</span>';
			html += '</td>';

			// Source prices
			priceSyncState.currencies.forEach(function (currency) {
				var priceData = product.source_prices[currency] || {};
				var regular = priceData.regular_price || '';
				var sale = priceData.sale_price || '';
				var hasPrice = regular !== '';

				html += '<td class="column-currency source-price' + (hasPrice ? '' : ' empty-price') + '">';
				if (hasPrice) {
					html += '<span class="price-regular">' + escapeHtml(regular) + '</span>';
					if (sale) {
						html += '<br><span class="price-sale">' + escapeHtml(sale) + '</span>';
					}
				} else {
					html += '<span class="price-empty">-</span>';
				}
				html += '</td>';
			});

			// Translation prices - iterate over each non-default language
			priceSyncState.languages.forEach(function (lang) {
				// Skip the default language (source)
				if (lang === priceSyncState.defaultLang) {
					return;
				}

				// Get translation data for this language
				var transData = null;
				if (product.translations && product.translations[lang]) {
					transData = product.translations[lang];
				}

				// Render price cells for each currency
				priceSyncState.currencies.forEach(function (currency) {
					// No translation exists for this language
					if (!transData || !transData.prices) {
						html += '<td class="column-currency trans-price no-translation"><span class="price-empty" title="Pas de traduction">-</span></td>';
						return;
					}

					var priceInfo = transData.prices[currency] || {};
					var regular = priceInfo.regular_price;
					var sale = priceInfo.sale_price;
					var matches = priceInfo.matches || false;

					// Normalize price - ensure string and trim
					regular = (regular !== null && regular !== undefined && regular !== '' && regular !== false) ? String(regular).trim() : '';
					sale = (sale !== null && sale !== undefined && sale !== '' && sale !== false) ? String(sale).trim() : '';

					// Determine if we have a valid price to display
					var hasPrice = false;
					if (regular !== '') {
						var regularNum = parseFloat(regular.replace(',', '.'));
						hasPrice = !isNaN(regularNum) && isFinite(regularNum) && regularNum >= 0;
					}

					// Build cell class
					var cellClass = 'column-currency trans-price';
					if (!hasPrice) {
						cellClass += ' empty-price';
					} else if (matches) {
						cellClass += ' price-match';
					} else {
						cellClass += ' price-mismatch';
					}

					html += '<td class="' + cellClass + '">';
					if (hasPrice) {
						html += '<span class="price-regular">' + escapeHtml(regular) + '</span>';
						if (sale && !isNaN(parseFloat(sale.replace(',', '.')))) {
							html += '<br><span class="price-sale">' + escapeHtml(sale) + '</span>';
						}
					} else {
						html += '<span class="price-empty">-</span>';
					}
					html += '</td>';
				});
			});

			// Actions column
			html += '<td class="column-actions">';
			if (!product.is_synced) {
				html += '<button type="button" class="button button-small button-primary afs-wcml-sync-single" data-product-id="' + product.product_id + '">';
				html += '<span class="dashicons dashicons-update"></span> Sync';
				html += '</button>';
			} else {
				html += '<span class="afs-wcml-synced-badge"><span class="dashicons dashicons-yes-alt"></span> OK</span>';
			}
			html += '</td>';

			html += '</tr>';

			return html;
		}

		/**
		 * Render price sync pagination
		 */
		function renderPriceSyncPagination() {
			var $paginationTop = $('#afs-wcml-price-sync-pagination-top');
			var $paginationBottom = $('#afs-wcml-price-sync-pagination-bottom');

			if (priceSyncState.totalPages <= 1) {
				$paginationTop.empty();
				$paginationBottom.empty();
				return;
			}

			var html = '<div class="afs-wcml-pagination-controls">';

			// Previous button
			if (priceSyncState.currentPage > 1) {
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + (priceSyncState.currentPage - 1) + '">« Précédent</button>';
			} else {
				html += '<button type="button" class="button afs-wcml-pagination-btn" disabled>« Précédent</button>';
			}

			// Page numbers
			var startPage = Math.max(1, priceSyncState.currentPage - 2);
			var endPage = Math.min(priceSyncState.totalPages, priceSyncState.currentPage + 2);

			if (startPage > 1) {
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="1">1</button>';
				if (startPage > 2) {
					html += '<span class="afs-wcml-pagination-dots">...</span>';
				}
			}

			for (var i = startPage; i <= endPage; i++) {
				if (i === priceSyncState.currentPage) {
					html += '<button type="button" class="button button-primary afs-wcml-pagination-btn" disabled>' + i + '</button>';
				} else {
					html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + i + '">' + i + '</button>';
				}
			}

			if (endPage < priceSyncState.totalPages) {
				if (endPage < priceSyncState.totalPages - 1) {
					html += '<span class="afs-wcml-pagination-dots">...</span>';
				}
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + priceSyncState.totalPages + '">' + priceSyncState.totalPages + '</button>';
			}

			// Next button
			if (priceSyncState.currentPage < priceSyncState.totalPages) {
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + (priceSyncState.currentPage + 1) + '">Suivant »</button>';
			} else {
				html += '<button type="button" class="button afs-wcml-pagination-btn" disabled>Suivant »</button>';
			}

			html += '</div>';
			html += '<div class="afs-wcml-pagination-info">Page ' + priceSyncState.currentPage + ' sur ' + priceSyncState.totalPages + ' (' + priceSyncState.total + ' produits)</div>';

			$paginationTop.html(html);
			$paginationBottom.html(html);
		}

		/**
		 * Update price sync counts
		 */
		function updatePriceSyncCounts() {
			$('#afs-wcml-price-sync-total-display').text(priceSyncState.total);
			var text = priceSyncState.total + ' produit(s) trouvé(s)';
			$('#afs-wcml-price-sync-results-count').text(text);
		}

		/**
		 * Helper functions
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
			return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
		}

		function capitalizeFirst(str) {
			if (!str) return '';
			return str.charAt(0).toUpperCase() + str.slice(1);
		}

		// Filter handlers
		$('#afs-wcml-price-sync-apply-filters').on('click', function (e) {
			e.preventDefault();
			priceSyncState.filters.search = $('#afs-wcml-price-sync-filter-search').val();
			priceSyncState.filters.product_type = $('#afs-wcml-price-sync-filter-type').val();
			priceSyncState.filters.sync_status = $('#afs-wcml-price-sync-filter-status').val();
			priceSyncState.filters.per_page = parseInt($('#afs-wcml-price-sync-filter-per-page').val(), 10);
			priceSyncState.filters.page = 1;
			loadPriceSyncProducts(1);
		});

		$('#afs-wcml-price-sync-reset-filters').on('click', function (e) {
			e.preventDefault();
			$('#afs-wcml-price-sync-filter-search').val('');
			$('#afs-wcml-price-sync-filter-type').val('');
			$('#afs-wcml-price-sync-filter-status').val('');
			$('#afs-wcml-price-sync-filter-per-page').val('20');
			priceSyncState.filters = {
				page: 1,
				per_page: 20,
				product_type: '',
				sync_status: '',
				search: '',
				include_variations: true
			};
			loadPriceSyncProducts(1);
		});

		// Pagination handlers
		$(document).on('click', '.afs-wcml-pagination-btn[data-page]', function (e) {
			e.preventDefault();
			var page = parseInt($(this).data('page'), 10);
			if (page && page !== priceSyncState.currentPage) {
				loadPriceSyncProducts(page);
			}
		});

		// Per page change
		$('#afs-wcml-price-sync-filter-per-page').on('change', function () {
			priceSyncState.filters.per_page = parseInt($(this).val(), 10);
			priceSyncState.filters.page = 1;
			loadPriceSyncProducts(1);
		});

		// Enter key in search
		$('#afs-wcml-price-sync-filter-search').on('keypress', function (e) {
			if (e.which === 13) {
				e.preventDefault();
				$('#afs-wcml-price-sync-apply-filters').click();
			}
		});

		/**
		 * Load sync status counts asynchronously
		 */
		function loadSyncStatusCounts() {
			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_get_sync_status',
					nonce: afs_wcml_admin.nonce
				},
				success: function (response) {
					if (response.success) {
						var syncedCount = 0;
						var unsyncCount = response.data.needs_sync_count || 0;
						var totalCount = parseInt($('#afs-wcml-total-count').text(), 10) || 0;

						// Calculate synced count
						syncedCount = totalCount - unsyncCount;
						if (syncedCount < 0) syncedCount = 0;

						// Update UI
						$('#afs-wcml-synced-count').text(syncedCount);
						$('#afs-wcml-unsync-count').text(unsyncCount);

						// Update status item classes
						if (unsyncCount > 0) {
							$('#afs-wcml-unsync-status-item').addClass('status-warning').removeClass('status-ok');
							$('#afs-wcml-sync-unsynced-only').show();
							$('#afs-wcml-sync-unsynced-badge').text(unsyncCount);
						} else {
							$('#afs-wcml-unsync-status-item').addClass('status-ok').removeClass('status-warning');
							$('#afs-wcml-sync-unsynced-only').hide();
						}
					} else {
						$('#afs-wcml-synced-count').text('-');
						$('#afs-wcml-unsync-count').text('-');
					}
				},
				error: function () {
					$('#afs-wcml-synced-count').text('-');
					$('#afs-wcml-unsync-count').text('-');
				}
			});
		}

		// Initialize pagination if table already has data
		if ($('#afs-wcml-price-sync-body tr').length > 0) {
			var initialTotal = parseInt($('#afs-wcml-price-sync-total-display').text(), 10) || 0;
			if (initialTotal > 0) {
				priceSyncState.total = initialTotal;
				priceSyncState.totalPages = Math.ceil(initialTotal / priceSyncState.filters.per_page);
				renderPriceSyncPagination();
			}
		}

		// Load sync status counts asynchronously after page load
		loadSyncStatusCounts();
	});

})(jQuery);
