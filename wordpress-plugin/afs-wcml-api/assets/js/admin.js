/**
 * Admin scripts for AFS WCML Manual Pricing plugin.
 */
(function($) {
	'use strict';

	$(document).ready(function() {
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
	});

})(jQuery);


