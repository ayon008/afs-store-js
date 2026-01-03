jQuery(document).ready(function($){
    $('body').on('change', 'input[id^="edit-menu-item-show-template-"]', function(){
        const $cb       = $(this);
        const itemID    = $cb.attr('id').replace('edit-menu-item-show-template-','');
        const isChecked = $cb.is(':checked');

        // Si Shortcode activé → on grise la partie Produits
        const $productsBlock = $('.afs-products-repeater[data-item-id="'+itemID+'"]').closest('p,div');
        const $productsCB    = $('#edit-menu-item-show-products-'+itemID);

        if (isChecked) {
            $productsBlock.css('opacity', .5);
            $productsCB.prop('checked', false);
        } else {
            $productsBlock.css('opacity', 1);
        }
    });
    // Pour chaque select2 de recherche
    $('select.afs-menu-search-select2').each(function(){
        var $select    = $(this);
        var itemId     = $select.data('item-id');

        // Le conteneur où s’ajoutent les produits
        var $repeater  = $('.afs-products-repeater[data-item-id="'+ itemId +'"]');

        // L'input caché final
        var $hidden    = $('#edit-menu-item-products-' + itemId);

        // Active jQuery UI Sortable sur le repeater pour réordonner
        $repeater.sortable({
            opacity: 0.7,
            stop: function() {
                // Mettre à jour l'ordre dans l'input caché
                updateHiddenInput();
            }
        });

        // Fonction qui collecte l'ordre des .afs-product-line et maj l’input caché
        function updateHiddenInput(){
            var ids = [];
            $repeater.find('.afs-product-line').each(function(){
                var productId = $(this).attr('data-id');
                ids.push(productId);
            });
            $hidden.val(ids.join(','));
        }

        // Bouton "Supprimer"
        $repeater.on('click', '.afs-remove-line-button', function(e){
            e.preventDefault();
            $(this).closest('.afs-product-line').remove();
            updateHiddenInput();
        });

        // Init Select2
        $select.select2({
            placeholder: 'Rechercher un produit...',
            allowClear: true,
            ajax: {
                url: AFS_MENU_ADV.ajax_url,
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        action: 'afs_menu_search_products',
                        nonce: AFS_MENU_ADV.nonce,
                        q: params.term || ''
                    };
                },
                processResults: function (data) {
                    return { results: data.results };
                },
                cache: true
            }
        });

        // Lors de la sélection d’un produit dans Select2
        $select.on('select2:select', function(e){
            var item = e.params.data;
            if (!item || !item.id) return;

            // Vérifier si déjà présent
            var alreadyExists = $repeater.find('.afs-product-line[data-id="'+ item.id +'"]');
            if (alreadyExists.length > 0) {
                alert('Ce produit est déjà dans la liste.');
                $select.val(null).trigger('change');
                return;
            }

            // Créer la nouvelle ligne
            var lineHtml = `
                <div class="afs-product-line" data-id="${item.id}">
                    <span>${item.text}</span>
                    <button type="button" class="afs-remove-line-button">&times;</button>
                </div>
            `;

            $repeater.append(lineHtml);

            // Mettre à jour l’input caché
            updateHiddenInput();

            // Réinitialiser la sélection du Select2
            $select.val(null).trigger('change');
        });
    });
});
