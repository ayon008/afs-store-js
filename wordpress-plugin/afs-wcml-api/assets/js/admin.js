/**
 * Admin scripts for AFS WCML API plugin.
 */
(function($) {
	'use strict';

	$(document).ready(function() {
		// =============================================
		// Legacy price validation
		// =============================================

		// Validate price inputs
		$('.afs-wcml-currency-group input[type="number"], .afs-wcml-variation-prices input[type="number"]').on('blur', function() {
			var $input = $(this);
			var value = parseFloat($input.val());

			// Ensure non-negative values
			if (!isNaN(value) && value < 0) {
				$input.val(0);
			}

			// Validate sale price is less than regular price
			if ($input.attr('name') && $input.attr('name').indexOf('sale_price') !== -1) {
				var currencyGroup = $input.closest('.afs-wcml-currency-group, .form-row');
				var regularPriceInput = currencyGroup.find('input[name*="regular_price"]');

				if (regularPriceInput.length) {
					var regularPrice = parseFloat(regularPriceInput.val());
					var salePrice = parseFloat($input.val());

					if (!isNaN(regularPrice) && !isNaN(salePrice) && salePrice >= regularPrice) {
						alert('Le prix de vente doit être inférieur au prix régulier.');
						$input.val('');
					}
				}
			}
		});

		// Format price inputs on change
		$('.afs-wcml-currency-group input[type="number"], .afs-wcml-variation-prices input[type="number"]').on('change', function() {
			var $input = $(this);
			var value = $input.val();

			if (value !== '' && !isNaN(value)) {
				// Round to 2 decimal places
				var rounded = parseFloat(value).toFixed(2);
				if (parseFloat(value) !== parseFloat(rounded)) {
					$input.val(rounded);
				}
			}
		});

		// =============================================
		// Price Sync functionality
		// =============================================

		// Only run sync functionality if we're on the sync page
		if (typeof afs_wcml_admin === 'undefined') {
			return;
		}

		var i18n = afs_wcml_admin.i18n;

		/**
		 * Show manual sync result message
		 */
		function showManualResult(type, message) {
			var $result = $('#afs-wcml-manual-result');
			$result.removeClass('success error').addClass(type).html(message).show();

			setTimeout(function() {
				$result.fadeOut();
			}, 5000);
		}

		/**
		 * Sync single product prices
		 */
		function syncSingleProduct(productId, $button) {
			var $row = $button.closest('tr');
			var wasNotSynced = $row.hasClass('not-synced-row');

			$button.addClass('afs-wcml-spinning').prop('disabled', true);
			if ($row.length) {
				$row.addClass('afs-wcml-loading');
			}

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_sync_product_prices',
					nonce: afs_wcml_admin.nonce,
					product_id: productId
				},
				success: function(response) {
					$button.removeClass('afs-wcml-spinning').prop('disabled', false);
					if ($row.length) {
						$row.removeClass('afs-wcml-loading');
					}

					if (response.success) {
						// Mark row as synced
						if ($row.length) {
							$row.removeClass('not-synced-row').addClass('synced-row');

							// Replace sync button with OK badge
							var $actionsCell = $row.find('.column-actions');
							$actionsCell.html('<span class="afs-wcml-synced-badge"><span class="dashicons dashicons-yes-alt"></span> OK</span>');

							// Update price cells to show as matched
							$row.find('.trans-price.price-mismatch').removeClass('price-mismatch').addClass('price-match');
						}

						// Update counters only if the row was not synced before
						if (wasNotSynced) {
							// Update unsync count
							var $unsyncCount = $('#afs-wcml-unsync-count');
							var currentUnsync = parseInt($unsyncCount.text(), 10) || 0;
							if (currentUnsync > 0) {
								$unsyncCount.text(currentUnsync - 1);

								// Update status class
								if (currentUnsync - 1 === 0) {
									$unsyncCount.closest('.afs-wcml-status-item')
										.removeClass('status-warning')
										.addClass('status-ok');
								}
							}

							// Update synced count
							var $syncedCount = $('#afs-wcml-synced-count');
							if ($syncedCount.length) {
								var currentSynced = parseInt($syncedCount.text(), 10) || 0;
								$syncedCount.text(currentSynced + 1);
							}
						}

						// Show result
						var syncedCount = response.data.synced ? response.data.synced.length : 0;
						showManualResult('success', i18n.sync_complete + ' ' + syncedCount + ' traduction(s) mises à jour.');
					} else {
						showManualResult('error', response.data.message || i18n.sync_error);
					}
				},
				error: function(xhr, status, error) {
					$button.removeClass('afs-wcml-spinning').prop('disabled', false);
					if ($row.length) {
						$row.removeClass('afs-wcml-loading');
					}
					showManualResult('error', i18n.sync_error + ' (' + error + ')');
				}
			});
		}

		/**
		 * Sync all products in batches
		 */
		function syncAllProducts(syncUnsyncedOnly) {
			var $progress = $('#afs-wcml-sync-progress');
			var $progressFill = $progress.find('.afs-wcml-progress-fill');
			var $progressText = $progress.find('.afs-wcml-progress-text');
			var $results = $('#afs-wcml-sync-results');
			var $resultsContent = $results.find('.afs-wcml-results-content');
			var $button = syncUnsyncedOnly ? $('#afs-wcml-sync-unsynced-only') : $('#afs-wcml-sync-all');
			var $otherButton = syncUnsyncedOnly ? $('#afs-wcml-sync-all') : $('#afs-wcml-sync-unsynced-only');

			$button.addClass('afs-wcml-spinning').prop('disabled', true);
			if ($otherButton.length) {
				$otherButton.prop('disabled', true);
			}
			$progress.show();
			$results.hide();
			$resultsContent.html('');

			var batchSize = 10;
			var offset = 0;
			var totalSynced = 0;
			var totalErrors = 0;
			var allResults = [];
			var totalToProcess = 0;

			function processBatch() {
				$.ajax({
					url: afs_wcml_admin.ajax_url,
					type: 'POST',
					data: {
						action: 'afs_wcml_sync_all_prices',
						nonce: afs_wcml_admin.nonce,
						batch_size: batchSize,
						offset: offset,
						sync_unsynced_only: syncUnsyncedOnly ? 1 : 0,
						include_variations: true
					},
					success: function(response) {
						if (response.success) {
							var data = response.data;
							
							// Set total on first batch
							if (offset === 0) {
								totalToProcess = data.total || 0;
							}
							
							totalSynced += data.synced ? data.synced.length : 0;
							totalErrors += data.errors ? data.errors.length : 0;

							// Update progress
							var processed = offset + data.processed;
							var total = totalToProcess || data.total || 1;
							var percent = Math.min(100, Math.round((processed / total) * 100));
							$progressFill.css('width', percent + '%');

							// Fix progress message to show correct counts
							var progressMsg = i18n.processing;
							// Replace first %d with processed, second %d with total
							progressMsg = progressMsg.replace('%d', processed);
							progressMsg = progressMsg.replace('%d', total);
							$progressText.text(progressMsg);

							// Store results
							if (data.synced) {
								data.synced.forEach(function(item) {
									allResults.push('<div class="success">✓ ' + (item.message || 'Produit ' + (item.product_id || item.variation_id) + ' synchronisé') + '</div>');
								});
							}
							if (data.errors) {
								data.errors.forEach(function(item) {
									allResults.push('<div class="error">✗ ' + (typeof item === 'string' ? item : (item.error || 'Erreur')) + '</div>');
								});
							}

							// Continue or finish
							if (!data.complete && data.processed > 0) {
								offset += batchSize;
								processBatch();
							} else {
								// Done
								$button.removeClass('afs-wcml-spinning').prop('disabled', false);
								if ($otherButton.length) {
									$otherButton.prop('disabled', false);
								}
								$progressFill.css('width', '100%');
								$progressText.text(i18n.sync_complete + ' ' + totalSynced + ' synchronisations, ' + totalErrors + ' erreurs.');

								// Show results
								if (allResults.length > 0) {
									$resultsContent.html(allResults.slice(0, 50).join('')); // Limit to 50 results
									if (allResults.length > 50) {
										$resultsContent.append('<div>... et ' + (allResults.length - 50) + ' autres</div>');
									}
								} else {
									$resultsContent.html('<div class="success">' + i18n.sync_complete + '</div>');
								}
								$results.show();

								// Refresh page after 3 seconds
								setTimeout(function() {
									location.reload();
								}, 3000);
							}
						} else {
							$button.removeClass('afs-wcml-spinning').prop('disabled', false);
							if ($otherButton.length) {
								$otherButton.prop('disabled', false);
							}
							$progressText.text(i18n.sync_error);
							showManualResult('error', response.data ? response.data.message : i18n.sync_error);
						}
					},
					error: function(xhr, status, error) {
						$button.removeClass('afs-wcml-spinning').prop('disabled', false);
						if ($otherButton.length) {
							$otherButton.prop('disabled', false);
						}
						$progressText.text(i18n.sync_error + ' (' + error + ')');
					}
				});
			}

			processBatch();
		}

		// =============================================
		// Event handlers
		// =============================================

		// Sync single product button (delegated for dynamic content)
		$(document).on('click', '.afs-wcml-sync-single', function(e) {
			e.preventDefault();
			var productId = $(this).data('product-id');
			if (productId) {
				syncSingleProduct(productId, $(this));
			}
		});

		// Sync all button
		$('#afs-wcml-sync-all').on('click', function(e) {
			e.preventDefault();
			if (confirm(i18n.confirm_sync_all)) {
				syncAllProducts(false);
			}
		});

		// Sync unsynced only button
		$('#afs-wcml-sync-unsynced-only').on('click', function(e) {
			e.preventDefault();
			var unsyncedCount = parseInt($('#afs-wcml-unsync-count').text(), 10) || 0;
			var confirmMsg = 'Voulez-vous synchroniser uniquement les ' + unsyncedCount + ' produit(s)/variation(s) non synchronisé(s) ?';
			if (confirm(confirmMsg)) {
				syncAllProducts(true);
			}
		});

		// Sync by ID button
		$('#afs-wcml-sync-by-id').on('click', function(e) {
			e.preventDefault();
			var productId = $('#afs-wcml-product-id').val();

			if (!productId || productId <= 0) {
				showManualResult('error', 'Veuillez entrer un ID de produit valide.');
				return;
			}

			var $button = $(this);
			$button.addClass('afs-wcml-spinning').prop('disabled', true);

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_sync_product_prices',
					nonce: afs_wcml_admin.nonce,
					product_id: productId
				},
				success: function(response) {
					$button.removeClass('afs-wcml-spinning').prop('disabled', false);

					if (response.success) {
						var syncedCount = response.data.synced ? response.data.synced.length : 0;
						var message = '<strong>' + i18n.sync_complete + '</strong><br>' + syncedCount + ' traduction(s) mises à jour.';

						if (response.data.synced && response.data.synced.length > 0) {
							message += '<ul style="margin: 10px 0 0 20px;">';
							response.data.synced.forEach(function(item) {
								message += '<li>' + (item.message || 'Synchronisé vers ' + item.lang) + '</li>';
							});
							message += '</ul>';
						}

						showManualResult('success', message);
						$('#afs-wcml-product-id').val('');
					} else {
						var errorMsg = response.data && response.data.message ? response.data.message : i18n.sync_error;
						if (response.data && response.data.errors && response.data.errors.length > 0) {
							errorMsg += '<br>' + response.data.errors.join('<br>');
						}
						showManualResult('error', errorMsg);
					}
				},
				error: function(xhr, status, error) {
					$button.removeClass('afs-wcml-spinning').prop('disabled', false);
					showManualResult('error', i18n.sync_error + ' (' + error + ')');
				}
			});
		});

		// Refresh status button
		$('#afs-wcml-refresh-status').on('click', function(e) {
			e.preventDefault();
			location.reload();
		});

		// Enter key on product ID input
		$('#afs-wcml-product-id').on('keypress', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				$('#afs-wcml-sync-by-id').click();
			}
		});

		// =============================================
		// Price Tracking Page
		// =============================================

		// Only run tracking functionality if we're on the tracking page
		if (typeof afs_wcml_tracking_data === 'undefined') {
			return;
		}

		var trackingState = {
			currentPage: afs_wcml_tracking_data.current_page || 1,
			totalPages: afs_wcml_tracking_data.pages || 1,
			total: afs_wcml_tracking_data.total || 0,
			currencies: afs_wcml_tracking_data.currencies || [],
			languages: afs_wcml_tracking_data.languages || [],
			defaultLang: afs_wcml_tracking_data.default_lang || 'en'
		};

		/**
		 * Load products via AJAX
		 */
		function loadTrackingProducts(page) {
			var $loader = $('#afs-wcml-tracking-loader');
			var $tbody = $('#afs-wcml-tracking-body');

			$loader.show();
			$tbody.css('opacity', '0.5');

			var filters = {
				page: page || 1,
				per_page: $('#afs-wcml-filter-per-page').val() || 20,
				product_type: $('#afs-wcml-filter-type').val() || '',
				sync_status: $('#afs-wcml-filter-status').val() || '',
				search: $('#afs-wcml-filter-search').val() || '',
				include_variations: true
			};

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_get_products_tracking',
					nonce: afs_wcml_admin.nonce,
					page: filters.page,
					per_page: filters.per_page,
					product_type: filters.product_type,
					sync_status: filters.sync_status,
					search: filters.search,
					include_variations: filters.include_variations
				},
				success: function(response) {
					$loader.hide();
					$tbody.css('opacity', '1');

					if (response.success) {
						trackingState.currentPage = response.data.current_page;
						trackingState.totalPages = response.data.pages;
						trackingState.total = response.data.total;

						renderTrackingTable(response.data.products);
						renderPagination();
						updateResultsCount();
					} else {
						$tbody.html('<tr class="no-items"><td colspan="100">' + (response.data.message || 'Erreur lors du chargement.') + '</td></tr>');
					}
				},
				error: function(xhr, status, error) {
					$loader.hide();
					$tbody.css('opacity', '1');
					$tbody.html('<tr class="no-items"><td colspan="100">Erreur: ' + error + '</td></tr>');
				}
			});
		}

		/**
		 * Render tracking table rows
		 */
		function renderTrackingTable(products) {
			var $tbody = $('#afs-wcml-tracking-body');

			if (!products || products.length === 0) {
				$tbody.html('<tr class="no-items"><td colspan="100">Aucun produit trouvé.</td></tr>');
				return;
			}

			var html = '';

			products.forEach(function(product) {
				html += renderTrackingRow(product);
			});

			$tbody.html(html);
		}

		/**
		 * Render a single tracking row
		 */
		function renderTrackingRow(product) {
			var rowClass = product.is_synced ? 'synced-row' : 'not-synced-row';
			var html = '<tr class="' + rowClass + '" data-product-id="' + product.product_id + '">';

			// Product column
			html += '<td class="column-product">';
			html += '<strong><a href="' + escapeHtml(product.edit_url || '#') + '" target="_blank">' + escapeHtml(product.product_name) + '</a></strong>';
			if (product.is_variation && product.parent_name) {
				html += '<br><small>' + escapeHtml(product.parent_name) + '</small>';
			}
			html += '<br><small>ID: ' + product.product_id + '</small>';
			html += '</td>';

			// Type column
			html += '<td class="column-type">';
			html += '<span class="afs-wcml-type-badge ' + product.product_type + '">' + ucfirst(product.product_type) + '</span>';
			html += '</td>';

			// Source prices
			trackingState.currencies.forEach(function(currency) {
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

			// Translation prices
			trackingState.languages.forEach(function(lang) {
				if (lang === trackingState.defaultLang) {
					return;
				}

				var transData = product.translations[lang];

				trackingState.currencies.forEach(function(currency) {
					if (!transData) {
						html += '<td class="column-currency trans-price no-translation"><span class="price-empty">-</span></td>';
						return;
					}

					var priceInfo = transData.prices[currency] || {};
					var regular = priceInfo.regular_price || '';
					var sale = priceInfo.sale_price || '';
					var matches = priceInfo.matches || false;
					var hasPrice = regular !== '';

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
						if (sale) {
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
				html += '<button type="button" class="button button-small afs-wcml-sync-single" data-product-id="' + product.product_id + '">';
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
		 * Render pagination
		 */
		function renderPagination() {
			var html = '';
			var currentPage = trackingState.currentPage;
			var totalPages = trackingState.totalPages;

			if (totalPages <= 1) {
				$('#afs-wcml-pagination-top, #afs-wcml-pagination-bottom').html('');
				return;
			}

			// Previous button
			html += '<button type="button" class="afs-wcml-page-btn" data-page="' + (currentPage - 1) + '"' + (currentPage <= 1 ? ' disabled' : '') + '>&laquo;</button>';

			// Page numbers
			var startPage = Math.max(1, currentPage - 2);
			var endPage = Math.min(totalPages, currentPage + 2);

			if (startPage > 1) {
				html += '<button type="button" class="afs-wcml-page-btn" data-page="1">1</button>';
				if (startPage > 2) {
					html += '<span class="page-info">...</span>';
				}
			}

			for (var i = startPage; i <= endPage; i++) {
				if (i === currentPage) {
					html += '<span class="current-page">' + i + '</span>';
				} else {
					html += '<button type="button" class="afs-wcml-page-btn" data-page="' + i + '">' + i + '</button>';
				}
			}

			if (endPage < totalPages) {
				if (endPage < totalPages - 1) {
					html += '<span class="page-info">...</span>';
				}
				html += '<button type="button" class="afs-wcml-page-btn" data-page="' + totalPages + '">' + totalPages + '</button>';
			}

			// Next button
			html += '<button type="button" class="afs-wcml-page-btn" data-page="' + (currentPage + 1) + '"' + (currentPage >= totalPages ? ' disabled' : '') + '>&raquo;</button>';

			$('#afs-wcml-pagination-top, #afs-wcml-pagination-bottom').html(html);
		}

		/**
		 * Update results count display
		 */
		function updateResultsCount() {
			var text = trackingState.total + ' produit(s) trouvé(s)';
			$('#afs-wcml-results-count, #afs-wcml-results-count-bottom').text(text);
		}

		/**
		 * Helper: Escape HTML
		 */
		function escapeHtml(text) {
			if (!text) return '';
			var div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		}

		/**
		 * Helper: Uppercase first letter
		 */
		function ucfirst(str) {
			if (!str) return '';
			return str.charAt(0).toUpperCase() + str.slice(1);
		}

		// =============================================
		// Tracking Page Event Handlers
		// =============================================

		// Apply filters
		$('#afs-wcml-apply-filters').on('click', function(e) {
			e.preventDefault();
			loadTrackingProducts(1);
		});

		// Reset filters
		$('#afs-wcml-reset-filters').on('click', function(e) {
			e.preventDefault();
			$('#afs-wcml-filter-search').val('');
			$('#afs-wcml-filter-type').val('');
			$('#afs-wcml-filter-status').val('');
			$('#afs-wcml-filter-per-page').val('20');
			loadTrackingProducts(1);
		});

		// Pagination clicks
		$(document).on('click', '.afs-wcml-page-btn', function(e) {
			e.preventDefault();
			var page = $(this).data('page');
			if (page && !$(this).prop('disabled')) {
				loadTrackingProducts(page);
			}
		});

		// Enter key on search field
		$('#afs-wcml-filter-search').on('keypress', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				$('#afs-wcml-apply-filters').click();
			}
		});

		// Per page change
		$('#afs-wcml-filter-per-page').on('change', function() {
			loadTrackingProducts(1);
		});

		// Initial pagination render
		renderPagination();

	});

})(jQuery);
