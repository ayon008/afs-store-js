/**
 * ACF Sync functionality for AFS WCML API plugin
 */
(function($) {
	'use strict';

	console.log('[ACF Sync] Script loaded');

	$(document).ready(function() {
		console.log('[ACF Sync] Document ready');

		// Check if we're on the ACF sync page
		var $saveButton = $('#afs-wcml-save-acf-settings');
		console.log('[ACF Sync] Save button found:', $saveButton.length > 0);

		if ($saveButton.length === 0) {
			console.log('[ACF Sync] Not on ACF sync page, exiting');
			return;
		}

		console.log('[ACF Sync] On ACF sync page, initializing...');

		// Check if afs_wcml_admin is defined
		if (typeof afs_wcml_admin === 'undefined') {
			console.error('[ACF Sync] ERROR: afs_wcml_admin is undefined!');
			alert('Erreur: Configuration AJAX non disponible. Veuillez recharger la page.');
			return;
		}

		console.log('[ACF Sync] afs_wcml_admin is defined:', {
			ajax_url: afs_wcml_admin.ajax_url,
			has_nonce: !!afs_wcml_admin.nonce
		});

		/**
		 * Handle save ACF settings
		 */
		function handleSaveACFSettings(e, $button) {
			console.log('[ACF Sync] handleSaveACFSettings called', {
				event: e ? 'yes' : 'no',
				button: $button.length > 0 ? 'found' : 'not found'
			});

			if (e) {
				e.preventDefault();
				e.stopPropagation();
				console.log('[ACF Sync] Event prevented');
			}

			// Check if afs_wcml_admin is defined
			if (typeof afs_wcml_admin === 'undefined') {
				console.error('[ACF Sync] ERROR: afs_wcml_admin is undefined in handler!');
				alert('Erreur: Configuration AJAX non disponible. Veuillez recharger la page.');
				return false;
			}

			console.log('[ACF Sync] Collecting form data...');

			// Collect selected fields
			var fields = [];
			var $checkedFields = $('input[name="acf_fields[]"]:checked');
			console.log('[ACF Sync] Found checked fields:', $checkedFields.length);

			$checkedFields.each(function(index) {
				var fieldValue = $(this).val();
				console.log('[ACF Sync] Field ' + index + ':', fieldValue);
				if (fieldValue) {
					fields.push(fieldValue);
				}
			});

			var autoSync = $('#acf_auto_sync').is(':checked') ? 1 : 0;
			console.log('[ACF Sync] Form data collected:', {
				fields_count: fields.length,
				fields: fields,
				auto_sync: autoSync
			});

			// Show loading state
			console.log('[ACF Sync] Updating button state...');
			$button.addClass('afs-wcml-spinning').prop('disabled', true);
			var originalText = $button.html();
			$button.html('<span class="spinner is-active" style="float:none;margin:0;"></span> Sauvegarde...');
			console.log('[ACF Sync] Button state updated');

			// Prepare AJAX data
			var ajaxData = {
				action: 'afs_wcml_save_acf_sync_settings',
				nonce: afs_wcml_admin.nonce,
				fields: fields,
				auto_sync: autoSync
			};

			console.log('[ACF Sync] Sending AJAX request:', {
				url: afs_wcml_admin.ajax_url,
				data: ajaxData
			});

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: ajaxData,
				dataType: 'json',
				timeout: 30000,
				beforeSend: function() {
					console.log('[ACF Sync] AJAX beforeSend');
				},
				success: function(response) {
					console.log('[ACF Sync] AJAX success response:', response);
					$button.removeClass('afs-wcml-spinning').prop('disabled', false).html(originalText);

					if (response && response.success) {
						console.log('[ACF Sync] Save successful!');
						alert('Paramètres sauvegardés avec succès.');
						setTimeout(function() {
							console.log('[ACF Sync] Reloading page...');
							location.reload();
						}, 500);
					} else {
						console.error('[ACF Sync] Save failed:', response);
						var errorMsg = 'Erreur inconnue';
						if (response && response.data && response.data.message) {
							errorMsg = response.data.message;
						}
						alert('Erreur lors de la sauvegarde: ' + errorMsg);
					}
				},
				error: function(xhr, status, error) {
					console.error('[ACF Sync] AJAX error:', {
						xhr: xhr,
						status: status,
						error: error,
						statusCode: xhr.status,
						statusText: xhr.statusText,
						responseText: xhr.responseText
					});

					$button.removeClass('afs-wcml-spinning').prop('disabled', false).html(originalText);

					var errorMsg = 'Erreur AJAX: ' + error;
					if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
						errorMsg = xhr.responseJSON.data.message;
					} else if (xhr.responseText) {
						try {
							var jsonResponse = JSON.parse(xhr.responseText);
							if (jsonResponse.data && jsonResponse.data.message) {
								errorMsg = jsonResponse.data.message;
							}
						} catch (e) {
							console.error('[ACF Sync] Error parsing response:', e);
							errorMsg = 'Erreur: ' + xhr.status + ' ' + xhr.statusText;
						}
					}
					alert(errorMsg);
				},
				complete: function() {
					console.log('[ACF Sync] AJAX complete');
				}
			});

			return false;
		}

		/**
		 * Attach save button handlers
		 */
		console.log('[ACF Sync] Attaching event handlers...');

		// Method 1: Direct binding
		$saveButton.off('click.acf-sync').on('click.acf-sync', function(e) {
			console.log('[ACF Sync] Direct handler triggered');
			handleSaveACFSettings(e, $(this));
			return false;
		});

		// Method 2: Delegation
		$(document).off('click', '#afs-wcml-save-acf-settings').on('click', '#afs-wcml-save-acf-settings', function(e) {
			console.log('[ACF Sync] Delegated handler triggered');
			handleSaveACFSettings(e, $(this));
			return false;
		});

		// Method 3: Native click event
		if ($saveButton.length > 0) {
			$saveButton[0].addEventListener('click', function(e) {
				console.log('[ACF Sync] Native event listener triggered');
				e.preventDefault();
				handleSaveACFSettings(e, $saveButton);
				return false;
			}, false);
		}

		console.log('[ACF Sync] Event handlers attached');

		// Test click handler
		$saveButton.on('click.test', function() {
			console.log('[ACF Sync] TEST: Button click detected!');
		});

		// Log button info
		console.log('[ACF Sync] Button info:', {
			exists: $saveButton.length > 0,
			id: $saveButton.attr('id'),
			type: $saveButton.attr('type'),
			classes: $saveButton.attr('class'),
			html: $saveButton.html()
		});

		/**
		 * Sync single product ACF fields
		 */
		function syncSingleProductACF(productId, $button) {
			console.log('[ACF Sync] syncSingleProductACF called:', productId);
			// Check if admin object exists
			if (typeof afs_wcml_admin === 'undefined') {
				alert('Erreur: Configuration AJAX non disponible.');
				return;
			}
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
					action: 'afs_wcml_sync_product_acf',
					nonce: afs_wcml_admin.nonce,
					product_id: productId,
					sync_mode: 'copy'
				},
				success: function(response) {
					$button.removeClass('afs-wcml-spinning').prop('disabled', false);
					if ($row.length) {
						$row.removeClass('afs-wcml-loading');
					}

					if (response.success) {
						if ($row.length) {
							$row.removeClass('not-synced-row').addClass('synced-row');
							var $actionsCell = $row.find('.column-actions');
							$actionsCell.html('<span class="afs-wcml-synced-badge"><span class="dashicons dashicons-yes-alt"></span> OK</span>');
							$row.find('.field-mismatch').removeClass('field-mismatch').addClass('field-match');
						}

						if (wasNotSynced) {
							var $unsyncCount = $('#afs-wcml-acf-unsync-count');
							var currentUnsync = parseInt($unsyncCount.text(), 10) || 0;
							if (currentUnsync > 0) {
								$unsyncCount.text(currentUnsync - 1);
								if (currentUnsync - 1 === 0) {
									$unsyncCount.closest('.afs-wcml-status-item')
										.removeClass('status-warning')
										.addClass('status-ok');
								}
							}

							var $syncedCount = $('#afs-wcml-acf-synced-count');
							if ($syncedCount.length) {
								var currentSynced = parseInt($syncedCount.text(), 10) || 0;
								$syncedCount.text(currentSynced + 1);
							}
						}
					} else {
						alert(response.data.message || 'Erreur lors de la synchronisation.');
					}
				},
				error: function(xhr, status, error) {
					$button.removeClass('afs-wcml-spinning').prop('disabled', false);
					if ($row.length) {
						$row.removeClass('afs-wcml-loading');
					}
					alert('Erreur: ' + error);
				}
			});
		}

		// Event handlers for ACF sync
		$(document).on('click', '.afs-wcml-sync-single-acf', function(e) {
			e.preventDefault();
			var productId = $(this).data('product-id');
			if (productId) {
				syncSingleProductACF(productId, $(this));
			}
		});

		$('#afs-wcml-sync-all-acf').on('click', function(e) {
			e.preventDefault();
			if (confirm('Voulez-vous synchroniser les champs ACF de tous les produits ? Cette opération peut prendre du temps.')) {
				// syncAllProductsACF(false);
			}
		});

		$('#afs-wcml-sync-unsynced-acf-only').on('click', function(e) {
			e.preventDefault();
			var unsyncedCount = parseInt($('#afs-wcml-acf-unsync-count').text(), 10) || 0;
			var confirmMsg = 'Voulez-vous synchroniser uniquement les ' + unsyncedCount + ' produit(s)/variation(s) non synchronisé(s) ?';
			if (confirm(confirmMsg)) {
				// syncAllProductsACF(true);
			}
		});

		$('#afs-wcml-refresh-acf-status').on('click', function(e) {
			e.preventDefault();
			loadACFProducts(1);
		});

		// ACF Products pagination and filters state
		var acfState = {
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
		 * Load ACF products with filters
		 */
		function loadACFProducts(page) {
			if (page) {
				acfState.filters.page = page;
			}

			var $loader = $('#afs-wcml-acf-loader');
			var $tbody = $('#afs-wcml-acf-sync-body');
			var $table = $('#afs-wcml-acf-sync-table');

			$loader.show();
			$tbody.css('opacity', '0.5');
			$table.hide();

			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_get_products_acf_comparison',
					nonce: afs_wcml_admin.nonce,
					page: acfState.filters.page,
					per_page: acfState.filters.per_page,
					product_type: acfState.filters.product_type,
					sync_status: acfState.filters.sync_status,
					search: acfState.filters.search,
					include_variations: acfState.filters.include_variations
				},
				success: function(response) {
					$loader.hide();
					$tbody.css('opacity', '1');
					$table.show();

					if (response.success) {
						acfState.currentPage = response.data.current_page;
						acfState.totalPages = response.data.pages;
						acfState.total = response.data.total;
						acfState.languages = response.data.languages || {};
						acfState.defaultLang = response.data.default_lang || 'en';

						renderACFTable(response.data.products, response.data.languages, response.data.default_lang);
						renderACFPagination();
						updateACFCounts();
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
		 * Render ACF table rows
		 */
		function renderACFTable(products, languages, defaultLang) {
			var $tbody = $('#afs-wcml-acf-sync-body');

			if (!products || products.length === 0) {
				$tbody.html('<tr class="no-items"><td colspan="100">Aucun produit trouvé.</td></tr>');
				return;
			}

			var html = '';
			products.forEach(function(product) {
				html += renderACFRow(product, languages, defaultLang);
			});

			$tbody.html(html);
		}

		/**
		 * Render a single ACF row
		 */
		function renderACFRow(product, languages, defaultLang) {
			var rowClass = product.is_synced ? 'synced-row' : 'not-synced-row';
			var html = '<tr class="' + rowClass + '" data-product-id="' + product.product_id + '">';
			
			// Product column
			html += '<td class="column-product">';
			html += '<strong><a href="' + product.edit_url + '" target="_blank">' + escapeHtml(product.product_name) + '</a></strong>';
			if (product.is_variation && product.parent_name) {
				html += '<br><small class="parent-name" style="color: #646970;">' + escapeHtml(product.parent_name) + '</small>';
				
				// Add variation attributes
				if (product.variation_attributes && Object.keys(product.variation_attributes).length > 0) {
					var attrParts = [];
					for (var attrName in product.variation_attributes) {
						if (product.variation_attributes.hasOwnProperty(attrName)) {
							var attrValue = product.variation_attributes[attrName];
							if (attrValue) {
								var displayName = attrName.replace(/^pa_/, '');
								// Capitalize first letter of each word
								displayName = displayName.replace(/\b\w/g, function(l) { return l.toUpperCase(); });
								attrParts.push('<span style="font-weight: 600;">' + escapeHtml(displayName) + '</span>: ' + escapeHtml(attrValue));
							}
						}
					}
					if (attrParts.length > 0) {
						html += '<br><small class="variation-attributes" style="color: #2271b1; font-weight: 500; margin-top: 3px; display: inline-block;">' + attrParts.join(' • ') + '</small>';
					}
				}
			}
			html += '<br><small class="product-id" style="color: #8c8f94;">ID: ' + product.product_id + '</small>';
			html += '</td>';

			// Type column
			html += '<td class="column-type">';
			html += '<span class="afs-wcml-type-badge ' + product.product_type + '">' + capitalizeFirst(product.product_type) + '</span>';
			html += '</td>';

			// Source ACF column
			html += '<td class="column-source-acf">';
			if (product.source_acf && Object.keys(product.source_acf).length > 0) {
				html += '<div style="max-width: 350px;">';
				for (var fieldKey in product.source_acf) {
					if (product.source_acf.hasOwnProperty(fieldKey)) {
						var fieldValue = product.source_acf[fieldKey];
						var fieldLabel = product.field_labels && product.field_labels[fieldKey] ? product.field_labels[fieldKey] : fieldKey;
						var displayValue = formatFieldValue(fieldValue);
						
						html += '<div class="afs-wcml-acf-field-edit" style="margin-bottom: 10px; padding: 8px; background: #f8fbff; border-left: 3px solid #2271b1; border-radius: 3px;">';
						html += '<strong style="font-size: 11px; display: block; margin-bottom: 5px;">' + escapeHtml(fieldLabel) + '</strong>';
						html += '<textarea class="afs-wcml-acf-field-input" data-field-key="' + escapeHtml(fieldKey) + '" data-product-id="' + product.product_id + '" data-lang="' + (product.languages && product.languages[0] ? product.languages[0] : 'en') + '" style="width: 100%; min-height: 60px; font-size: 11px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;">' + escapeHtml(displayValue) + '</textarea>';
						html += '<button type="button" class="button button-small afs-wcml-save-field" data-field-key="' + escapeHtml(fieldKey) + '" data-product-id="' + product.product_id + '" data-lang="' + (product.languages && product.languages[0] ? product.languages[0] : 'en') + '" style="margin-top: 5px; font-size: 10px; padding: 2px 8px;"><span class="dashicons dashicons-yes" style="font-size: 12px; width: 12px; height: 12px;"></span> Sauvegarder</button>';
						html += '</div>';
					}
				}
				html += '</div>';
			} else {
				html += '<span class="price-empty">-</span>';
			}
			html += '</td>';

			// Translation columns
			if (languages && product.translations) {
				for (var langCode in languages) {
					if (languages.hasOwnProperty(langCode) && langCode !== defaultLang) {
						var transData = product.translations[langCode];
						var transAcf = transData ? (transData.fields || {}) : {};
						var transFieldsStatus = transData ? (transData.fields_status || {}) : {};
						var transProductId = transData && transData.product_id ? transData.product_id : 0;
						
						html += '<td class="column-trans-acf">';
						html += '<div style="max-width: 350px;">';
						
						for (var fieldKey in product.source_acf) {
							if (product.source_acf.hasOwnProperty(fieldKey)) {
								var transValue = transAcf[fieldKey] !== undefined ? transAcf[fieldKey] : null;
								var matches = transFieldsStatus[fieldKey] === true;
								var fieldLabel = product.field_labels && product.field_labels[fieldKey] ? product.field_labels[fieldKey] : fieldKey;
								var borderColor = matches ? '#00a32a' : '#d63638';
								var bgColor = matches ? '#edfaef' : '#fcf0f1';
								
								var sourceValue = product.source_acf[fieldKey];
								var defaultValue = transValue !== null ? formatFieldValue(transValue) : formatFieldValue(sourceValue);
								
								html += '<div class="afs-wcml-acf-field-edit" style="margin-bottom: 10px; padding: 8px; border-left: 3px solid ' + borderColor + '; background: ' + bgColor + '; border-radius: 3px;">';
								html += '<strong style="font-size: 11px; display: block; margin-bottom: 5px;">';
								html += escapeHtml(fieldLabel);
								html += matches ? ' <span style="color: #00a32a; font-size: 10px;">✓</span>' : ' <span style="color: #d63638; font-size: 10px;">✗</span>';
								if (!transProductId) {
									html += ' <span style="color: #a7aaad; font-size: 9px; font-style: italic; margin-left: 5px;">(Pas de traduction)</span>';
								}
								html += '</strong>';
								
								html += '<textarea class="afs-wcml-acf-field-input" data-field-key="' + escapeHtml(fieldKey) + '" data-product-id="' + (transProductId || product.product_id) + '" data-source-product-id="' + product.product_id + '" data-lang="' + langCode + '" data-has-translation="' + (transProductId ? '1' : '0') + '" style="width: 100%; min-height: 60px; font-size: 11px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;">' + escapeHtml(defaultValue) + '</textarea>';
								
								html += '<button type="button" class="button button-small afs-wcml-save-field" data-field-key="' + escapeHtml(fieldKey) + '" data-product-id="' + (transProductId || product.product_id) + '" data-source-product-id="' + product.product_id + '" data-lang="' + langCode + '" data-has-translation="' + (transProductId ? '1' : '0') + '" style="margin-top: 5px; font-size: 10px; padding: 2px 8px;">';
								html += '<span class="dashicons dashicons-yes" style="font-size: 12px; width: 12px; height: 12px;"></span> Sauvegarder';
								if (!transProductId) {
									html += ' <span style="font-size: 9px; margin-left: 3px;">(Créer traduction)</span>';
								}
								html += '</button>';
								html += '</div>';
							}
						}
						
						html += '</div>';
						html += '</td>';
					}
				}
			}

			// Actions column
			html += '<td class="column-actions">';
			html += '<button type="button" class="button button-small button-primary afs-wcml-sync-single-acf" data-product-id="' + product.product_id + '">';
			html += '<span class="dashicons dashicons-update"></span> Sync Tout';
			html += '</button>';
			if (product.is_synced) {
				html += '<br><small style="color: #00a32a; margin-top: 5px; display: block;"><span class="dashicons dashicons-yes-alt" style="font-size: 12px;"></span> Synchronisé</small>';
			}
			html += '</td>';

			html += '</tr>';
			return html;
		}

		/**
		 * Helper functions
		 */
		function escapeHtml(text) {
			var map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
			};
			return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
		}

		function capitalizeFirst(str) {
			return str.charAt(0).toUpperCase() + str.slice(1);
		}

		function formatFieldValue(value) {
			if (value === null || value === undefined) {
				return '';
			}
			if (Array.isArray(value)) {
				return JSON.stringify(value, null, 2);
			}
			if (typeof value === 'object') {
				return JSON.stringify(value, null, 2);
			}
			return String(value);
		}

		/**
		 * Render ACF pagination
		 */
		function renderACFPagination() {
			var $paginationTop = $('#afs-wcml-acf-pagination-top');
			var $paginationBottom = $('#afs-wcml-acf-pagination-bottom');

			if (acfState.totalPages <= 1) {
				$paginationTop.empty();
				$paginationBottom.empty();
				return;
			}

			var html = '<div class="afs-wcml-pagination-controls">';
			
			// Previous button
			if (acfState.currentPage > 1) {
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + (acfState.currentPage - 1) + '">« ' + 'Précédent' + '</button>';
			} else {
				html += '<button type="button" class="button afs-wcml-pagination-btn" disabled>« ' + 'Précédent' + '</button>';
			}

			// Page numbers
			var startPage = Math.max(1, acfState.currentPage - 2);
			var endPage = Math.min(acfState.totalPages, acfState.currentPage + 2);

			if (startPage > 1) {
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="1">1</button>';
				if (startPage > 2) {
					html += '<span class="afs-wcml-pagination-dots">...</span>';
				}
			}

			for (var i = startPage; i <= endPage; i++) {
				if (i === acfState.currentPage) {
					html += '<button type="button" class="button button-primary afs-wcml-pagination-btn" disabled>' + i + '</button>';
				} else {
					html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + i + '">' + i + '</button>';
				}
			}

			if (endPage < acfState.totalPages) {
				if (endPage < acfState.totalPages - 1) {
					html += '<span class="afs-wcml-pagination-dots">...</span>';
				}
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + acfState.totalPages + '">' + acfState.totalPages + '</button>';
			}

			// Next button
			if (acfState.currentPage < acfState.totalPages) {
				html += '<button type="button" class="button afs-wcml-pagination-btn" data-page="' + (acfState.currentPage + 1) + '">' + 'Suivant' + ' »</button>';
			} else {
				html += '<button type="button" class="button afs-wcml-pagination-btn" disabled>' + 'Suivant' + ' »</button>';
			}

			html += '</div>';
			html += '<div class="afs-wcml-pagination-info">Page ' + acfState.currentPage + ' sur ' + acfState.totalPages + ' (' + acfState.total + ' produits)</div>';

			$paginationTop.html(html);
			$paginationBottom.html(html);
		}

		/**
		 * Update ACF counts
		 */
		function updateACFCounts() {
			$('#afs-wcml-acf-total-display').text(acfState.total);
		}

		// Filter handlers
		$('#afs-wcml-acf-apply-filters').on('click', function(e) {
			e.preventDefault();
			acfState.filters.search = $('#afs-wcml-acf-filter-search').val();
			acfState.filters.product_type = $('#afs-wcml-acf-filter-type').val();
			acfState.filters.sync_status = $('#afs-wcml-acf-filter-status').val();
			acfState.filters.per_page = parseInt($('#afs-wcml-acf-filter-per-page').val(), 10);
			acfState.filters.page = 1;
			loadACFProducts(1);
		});

		$('#afs-wcml-acf-reset-filters').on('click', function(e) {
			e.preventDefault();
			$('#afs-wcml-acf-filter-search').val('');
			$('#afs-wcml-acf-filter-type').val('');
			$('#afs-wcml-acf-filter-status').val('');
			$('#afs-wcml-acf-filter-per-page').val('20');
			acfState.filters = {
				page: 1,
				per_page: 20,
				product_type: '',
				sync_status: '',
				search: '',
				include_variations: true
			};
			loadACFProducts(1);
		});

		// Pagination handlers
		$(document).on('click', '.afs-wcml-pagination-btn[data-page]', function(e) {
			e.preventDefault();
			var page = parseInt($(this).data('page'), 10);
			if (page && page !== acfState.currentPage) {
				loadACFProducts(page);
			}
		});

		// Per page change
		$('#afs-wcml-acf-filter-per-page').on('change', function() {
			acfState.filters.per_page = parseInt($(this).val(), 10);
			acfState.filters.page = 1;
			loadACFProducts(1);
		});

		// Enter key in search
		$('#afs-wcml-acf-filter-search').on('keypress', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				$('#afs-wcml-acf-apply-filters').click();
			}
		});

		/**
		 * Save individual ACF field
		 */
		$(document).on('click', '.afs-wcml-save-field', function(e) {
			e.preventDefault();
			e.stopPropagation();
			
			console.log('[ACF Sync] Save field button clicked');
			
			var $button = $(this);
			var $textarea = $button.closest('.afs-wcml-acf-field-edit').find('.afs-wcml-acf-field-input');
			
			var fieldKey = $button.data('field-key');
			var productId = $button.data('product-id');
			var sourceProductId = $button.data('source-product-id') || productId;
			var lang = $button.data('lang');
			var hasTranslation = $button.data('has-translation') === 1 || $button.data('has-translation') === '1';
			
			console.log('[ACF Sync] Field save params:', {
				fieldKey: fieldKey,
				productId: productId,
				sourceProductId: sourceProductId,
				lang: lang,
				hasTranslation: hasTranslation
			});
			
			// Get field value
			var fieldValue = $textarea.val();
			
			console.log('[ACF Sync] Field value:', fieldValue);
			
			if (typeof afs_wcml_admin === 'undefined') {
				alert('Erreur: Configuration AJAX non disponible.');
				return false;
			}
			
			// Show loading state
			$button.prop('disabled', true);
			var originalHtml = $button.html();
			$button.html('<span class="spinner is-active" style="float:none;margin:0;width:12px;height:12px;"></span> ' + (hasTranslation ? 'Sauvegarde...' : 'Création traduction...'));
			
			$.ajax({
				url: afs_wcml_admin.ajax_url,
				type: 'POST',
				data: {
					action: 'afs_wcml_save_acf_field',
					nonce: afs_wcml_admin.nonce,
					field_key: fieldKey,
					product_id: productId,
					source_product_id: sourceProductId,
					field_value: fieldValue,
					lang: lang,
					has_translation: hasTranslation ? 1 : 0
				},
				dataType: 'json',
				timeout: 30000,
				success: function(response) {
					console.log('[ACF Sync] Save field success:', response);
					
					if (response && response.success) {
						// Update button data if translation was created
						if (response.data && response.data.translation_created && response.data.product_id) {
							$button.data('product-id', response.data.product_id);
							$button.data('has-translation', '1');
							$textarea.data('product-id', response.data.product_id);
							$textarea.data('has-translation', '1');
							
							// Remove "Pas de traduction" text
							var $noTranslationText = $button.closest('.afs-wcml-acf-field-edit').find('strong span[style*="a7aaad"]');
							$noTranslationText.remove();
							
							// Update button text
							originalHtml = originalHtml.replace(/\s*\([^)]*\)/g, ''); // Remove (Créer traduction) text
						}
						
						$button.prop('disabled', false).html(originalHtml);
						
						// Show success feedback
						$button.html('<span class="dashicons dashicons-yes" style="color: #00a32a; font-size: 12px; width: 12px; height: 12px;"></span> ' + (response.data && response.data.translation_created ? 'Traduction créée!' : 'Sauvegardé'));
						setTimeout(function() {
							$button.html(originalHtml);
						}, 3000);
						
						// Update field cell styling
						var $fieldCell = $button.closest('.afs-wcml-acf-field-edit');
						$fieldCell.removeClass('field-mismatch').addClass('field-match');
						$fieldCell.css({
							'border-left-color': '#00a32a',
							'background': '#edfaef'
						});
						
						// Update status indicator
						var $statusIndicator = $fieldCell.find('strong span');
						if ($statusIndicator.length && $statusIndicator.css('color') !== 'rgb(0, 163, 42)') {
							$statusIndicator.html('✓').css('color', '#00a32a');
						}
						
						// If translation was created, reload page after a delay to show updated data
						if (response.data && response.data.translation_created) {
							setTimeout(function() {
								location.reload();
							}, 2000);
						}
					} else {
						$button.prop('disabled', false).html(originalHtml);
						var errorMsg = response && response.data && response.data.message ? response.data.message : 'Erreur inconnue';
						alert('Erreur: ' + errorMsg);
					}
				},
				error: function(xhr, status, error) {
					console.error('[ACF Sync] Save field error:', {
						status: xhr.status,
						statusText: xhr.statusText,
						responseText: xhr.responseText,
						error: error,
						readyState: xhr.readyState
					});
					$button.prop('disabled', false).html(originalHtml);
					
					var errorMsg = 'Erreur AJAX: ' + error;
					if (xhr.status === 500) {
						errorMsg = 'Erreur serveur (500). Vérifiez les logs PHP.';
						if (xhr.responseText) {
							console.error('[ACF Sync] Server response:', xhr.responseText);
							// Try to extract error message from response
							try {
								var jsonResponse = JSON.parse(xhr.responseText);
								if (jsonResponse.data && jsonResponse.data.message) {
									errorMsg = jsonResponse.data.message;
								}
							} catch (e) {
								// Check if it's a PHP error
								if (xhr.responseText.indexOf('Fatal error') !== -1 || xhr.responseText.indexOf('Parse error') !== -1) {
									errorMsg = 'Erreur PHP détectée. Vérifiez les logs du serveur.';
								}
							}
						}
					} else if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) {
						errorMsg = xhr.responseJSON.data.message;
					} else if (xhr.responseText) {
						try {
							var jsonResponse = JSON.parse(xhr.responseText);
							if (jsonResponse.data && jsonResponse.data.message) {
								errorMsg = jsonResponse.data.message;
							}
						} catch (e) {
							// Keep default error message
						}
					}
					alert('Erreur: ' + errorMsg);
				}
			});
			
			return false;
		});

		console.log('[ACF Sync] Initialization complete');

		// Initialize filters and pagination if on ACF sync page
		if ($saveButton.length > 0 || $('#afs-wcml-acf-sync-table').length > 0) {
			// Load initial data if table exists
			if ($('#afs-wcml-acf-sync-body tr').length > 0) {
				// Table already has data, just initialize pagination
				// Get initial counts from page
				var initialTotal = parseInt($('#afs-wcml-acf-total-display').text(), 10) || 0;
				if (initialTotal > 0) {
					acfState.total = initialTotal;
					acfState.totalPages = Math.ceil(initialTotal / acfState.filters.per_page);
					renderACFPagination();
				}
			} else {
				// Load data via AJAX
				loadACFProducts(1);
			}
		}
	});

})(jQuery);
