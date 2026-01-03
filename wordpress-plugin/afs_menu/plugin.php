<?php
/**
 * Plugin Name: AFS Menu (Optimized with Select2 + Single-line Repeater)
 * Description: AFS menu avec Select2 pour la recherche de produits, chaque produit ajouté apparaît sur sa propre ligne (réordable + suppression facile). Gère également un cache avancé + lazy loading, et propose un widget Elementor (chargé uniquement si Elementor est actif).
 * Version: 1.6.5
 * Author: Antonin
 */

// Sécurité : sortie si accès direct
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'AFS_MENU_ADV_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AFS_MENU_ADV_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Nom du dossier/fichier pour le cache
define( 'AFS_MENU_CACHE_DIR', 'cache' );

// React app base URL for URL conversion
if ( ! defined( 'AFS_REACT_BASE_URL' ) ) {
    define( 'AFS_REACT_BASE_URL', '' ); // Will use relative paths
}

// Include REST API class
require_once AFS_MENU_ADV_PLUGIN_DIR . 'includes/class-afs-menu-rest-api.php';

/**
 * 1) CHARGER ET ENREGISTRER LE WIDGET ELEMENTOR UNIQUEMENT SI ELEMENTOR EST ACTIF
 *
 * - Cela évite l'erreur fatale si Elementor n'est pas installé ou activé
 * - On attend le hook 'elementor/widgets/widgets_registered' pour être sûr que la classe Widget_Base est disponible
 */
function afs_menu_adv_load_elementor_widget() {
    // Vérifie si Elementor est actif
    if ( ! did_action( 'elementor/loaded' ) ) {
        return;
    }

    // Inclure la classe du widget (widget.php) seulement maintenant
    require_once AFS_MENU_ADV_PLUGIN_DIR . 'widget.php';

    // Si la classe existe, on enregistre le widget
    if ( class_exists( '\Elementor\Widget_Base' ) && class_exists( '\Afs_Menu_Widget' ) ) {
        \Elementor\Plugin::instance()->widgets_manager->register_widget_type( new \Afs_Menu_Widget() );
    }
}
add_action( 'elementor/widgets/widgets_registered', 'afs_menu_adv_load_elementor_widget' );


/**
 * 2) ENQUEUE SCRIPTS & STYLES (Front)
 */
function afs_menu_adv_enqueue_scripts() {
    // JS
    wp_register_script(
        'afs_nav_script',
        AFS_MENU_ADV_PLUGIN_URL . 'assets/afs_nav.js',
        array( 'jquery' ),
        '1.6.6',
        true
    );
    wp_enqueue_script( 'afs_nav_script' );

    // CSS
    wp_register_style(
        'afs_nav_style',
        AFS_MENU_ADV_PLUGIN_URL . 'assets/afs_nav.css',
        array(),
        '1.7.3'
    );
    wp_enqueue_style( 'afs_nav_style' );
}
add_action( 'wp_enqueue_scripts', 'afs_menu_adv_enqueue_scripts' );


/**
 * 3) FORCER LAZY LOADING
 */
add_filter( 'wp_get_attachment_image_attributes', 'afs_menu_adv_force_lazy_load', 10, 3 );
function afs_menu_adv_force_lazy_load( $attr, $attachment, $size ) {
    if ( ! isset( $attr['loading'] ) ) {
        $attr['loading'] = 'lazy';
    }
    return $attr;
}


/**
 * 4) FONCTIONS DE CACHE
 */
function afs_menu_adv_ensure_cache_folder_exists() {
    if ( ! function_exists( 'WP_Filesystem' ) ) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
    }
    WP_Filesystem();
    global $wp_filesystem;

    $upload_dir    = wp_upload_dir();
    $cache_dirpath = trailingslashit( $upload_dir['basedir'] ) . AFS_MENU_CACHE_DIR;

    if ( ! $wp_filesystem->is_dir( $cache_dirpath ) ) {
        $wp_filesystem->mkdir( $cache_dirpath, 0755 );
    }
}

/**
 * Get cache filename with language suffix for WPML compatibility
 */
function afs_menu_adv_get_cache_filename() {
    $language_suffix = '';
    
    // Add language suffix if WPML is active
    if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
        $language_suffix = '-' . ICL_LANGUAGE_CODE;
    }
    
    return 'menu-cache' . $language_suffix . '.html';
}

function afs_menu_adv_generate_menu_cache( $menu_html ) {
    if ( empty( $menu_html ) ) {
        return false;
    }
    afs_menu_adv_ensure_cache_folder_exists();

    $upload_dir     = wp_upload_dir();
    $cache_filename = afs_menu_adv_get_cache_filename();
    $cache_filepath = trailingslashit( $upload_dir['basedir'] ) . AFS_MENU_CACHE_DIR . '/' . $cache_filename;

    if ( ! function_exists( 'WP_Filesystem' ) ) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
    }
    WP_Filesystem();
    global $wp_filesystem;

    $result = $wp_filesystem->put_contents( $cache_filepath, $menu_html, FS_CHMOD_FILE );
    return (bool) $result;
}

function afs_menu_adv_get_menu_cache() {
    $upload_dir     = wp_upload_dir();
    $cache_filename = afs_menu_adv_get_cache_filename();
    $cache_filepath = trailingslashit( $upload_dir['basedir'] ) . AFS_MENU_CACHE_DIR . '/' . $cache_filename;

    if ( file_exists( $cache_filepath ) ) {
        return file_get_contents( $cache_filepath );
    }
    return false;
}

function afs_menu_adv_invalidate_menu_cache() {
    $upload_dir = wp_upload_dir();
    $cache_dir = trailingslashit( $upload_dir['basedir'] ) . AFS_MENU_CACHE_DIR;
    
    // Delete all cache files for all languages
    if ( file_exists( $cache_dir ) ) {
        $files = glob( $cache_dir . '/menu-cache*.html' );
        if ( is_array( $files ) ) {
            foreach ( $files as $file ) {
                if ( file_exists( $file ) ) {
                    unlink( $file );
                }
            }
        }
    }
}


/**
 * 5) INVALIDATION AUTOMATIQUE DU CACHE LORSQUE LES MENUS SONT MODIFIÉS
 */
add_action( 'wp_update_nav_menu', 'afs_menu_adv_invalidate_menu_cache' );


/**
 * WPML COMPATIBILITY: Invalidate cache when language is switched
 */
add_action( 'wpml_language_has_switched', 'afs_menu_adv_invalidate_menu_cache' );


/**
 * 6) PAGE D'ADMIN POUR GERER LE CACHE
 */
function afs_menu_adv_add_admin_page() {
    add_submenu_page(
        'options-general.php',
        'AFS Menu Cache',
        'AFS Menu Cache',
        'manage_options',
        'afs-menu-cache-settings',
        'afs_menu_adv_cache_admin_page'
    );
}
add_action( 'admin_menu', 'afs_menu_adv_add_admin_page' );

function afs_menu_adv_cache_admin_page() {
    if ( isset( $_POST['afs_regenerate_cache'] ) && check_admin_referer('afs_regenerate_cache_action','afs_regenerate_cache_nonce') ) {
        afs_menu_adv_invalidate_menu_cache();
        echo '<div class="notice notice-success"><p>Le cache sera régénéré automatiquement au prochain affichage du site.</p></div>';
    }

    if ( isset( $_POST['afs_clear_cache'] ) && check_admin_referer('afs_clear_cache_action','afs_clear_cache_nonce') ) {
        afs_menu_adv_invalidate_menu_cache();
        echo '<div class="notice notice-warning"><p>Le cache a été supprimé.</p></div>';
    }

    // WPML compatibility notice
    if ( defined( 'ICL_SITEPRESS_VERSION' ) ) {
        echo '<div class="notice notice-info"><p><strong>WPML Compatibility:</strong> AFS Menu is compatible with WPML. Menu items and products will be automatically translated.</p></div>';
    }

    ?>
    <div class="wrap">
        <h1>Gestion du cache AFS Menu</h1>
        <form method="post">
            <?php wp_nonce_field('afs_regenerate_cache_action','afs_regenerate_cache_nonce'); ?>
            <input type="submit" name="afs_regenerate_cache" class="button button-primary" value="Régénérer le cache (auto)">
        </form>
        <br>
        <form method="post">
            <?php wp_nonce_field('afs_clear_cache_action','afs_clear_cache_nonce'); ?>
            <input type="submit" name="afs_clear_cache" class="button button-secondary" value="Vider le cache">
        </form>

        <hr>
        <h2>Documentation : Comment modifier le menu ou ajouter des produits</h2>
        <div class="afs-menu-documentation" style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <h3 style="margin-top: 0;">Étape 1 : Accéder à l'éditeur de menu</h3>
            <p>
                <strong>1.1.</strong> Rendez-vous dans <em>Apparence > Menus</em> dans votre tableau de bord WordPress.<br>
                <strong>1.2.</strong> Sélectionnez le menu que vous souhaitez modifier dans la liste déroulante.<br>
                <strong>1.3.</strong> Cliquez sur un élément de menu pour le dérouler et afficher les champs personnalisés.
            </p>

            <h3>Étape 2 : Configuration des options avancées</h3>
            <p>Chaque élément de menu dispose des options suivantes :</p>

            <div style="padding-left: 20px; margin-bottom: 15px;">
                <p><strong>Options d'affichage des produits :</strong></p>
                <ul style="list-style:disc; margin-left:20px;">
                    <li><strong>"Show Products?"</strong> : Cochez cette case pour activer l'affichage du bloc produits dans ce menu.</li>
                    <li><strong>"Products"</strong> : Utilisez la recherche intelligente (Select2) pour trouver un produit. À chaque sélection, le produit s'ajoute en dessous (une ligne). Répétez pour ajouter plusieurs produits. Vous pouvez ensuite réordonner ou supprimer chaque ligne.</li>
                </ul>

                <p><strong>Personnalisation visuelle :</strong></p>
                <ul style="list-style:disc; margin-left:20px;">
                    <li><strong>"Menu Image URL"</strong> : Entrez l'URL complète d'une image pour l'afficher dans le menu.</li>
                    <li><strong>"Custom Text One" et "Custom Text Two"</strong> : Deux champs de texte personnalisés (ex : titre + sous-titre).</li>
                </ul>

                <p><strong>Boutons d'action :</strong></p>
                <ul style="list-style:disc; margin-left:20px;">
                    <li><strong>"Button One Label / URL"</strong> : Libellé et lien du premier bouton.</li>
                    <li><strong>"Button Two Label / URL"</strong> : Libellé et lien du second bouton.</li>
                </ul>
            </div>

            <h3>Étape 3 : Enregistrement et mise en cache</h3>
            <p>
                <strong>3.1.</strong> Cliquez sur <strong>"Enregistrer le menu"</strong> pour sauvegarder toutes vos modifications.<br>
                <strong>3.2.</strong> Le plugin invalidera automatiquement le cache existant.<br>
                <strong>3.3.</strong> Un nouveau cache sera généré lors du prochain affichage du menu sur le site.
            </p>

            <h3>Conseils et astuces</h3>
            <ul style="list-style:disc; margin-left:20px;">
                <li>La recherche de produits fonctionne avec des mots-clés partiels, pas besoin du nom exact.</li>
                <li>Pour <strong>supprimer un produit</strong>, cliquez sur "Supprimer" sur la ligne concernée.</li>
                <li>Pour <strong>réordonner</strong>, faites un glisser-déposer de ces lignes (drag & drop).</li>
                <li>Si les modifications n'apparaissent pas immédiatement, utilisez le bouton <strong>"Régénérer le cache"</strong> ci-dessus.</li>
                <li>Idéalement, limitez-vous à <strong>4-6 produits</strong> par élément de menu.</li>
            </ul>
        </div>
    </div>
    <?php
}

global $afs_menu_processed_items;
$afs_menu_processed_items = array();

/**
 * 7) AJOUT D'UN SEUL ENSEMBLE DE CHAMPS PERSONNALISÉS PAR ITEM
 */
function afs_menu_adv_menu_item_custom_fields( $item_id, $item, $depth, $args ) {
    global $afs_menu_processed_items;

    // Si déjà traité, on sort
    if ( in_array( $item_id, $afs_menu_processed_items ) ) {
        return;
    }
    $afs_menu_processed_items[] = $item_id;

    // Show products
    $show_products = get_post_meta( $item_id, '_show_products', true );
    ?>
    <div style="margin: 5px 0;">
        <input type="checkbox" id="edit-menu-item-show-products-<?php echo esc_attr($item_id); ?>"
               name="menu-item-show-products[<?php echo esc_attr($item_id); ?>]"
               value="1" <?php checked($show_products, '1'); ?> />
        <label for="edit-menu-item-show-products-<?php echo esc_attr($item_id); ?>">
            <?php _e( 'Show Products?', 'afs_menu' ); ?>
        </label>
    </div>
    <?php
    /* --- Affichage d'un shortcode ------------------------------------ */
    // Checkbox "Show Shortcode?"
    $show_template = get_post_meta( $item_id, '_menu_item_show_template', true );
    ?>
    <div style="margin:5px 0;">
        <input type="checkbox"
               id="edit-menu-item-show-template-<?php echo esc_attr( $item_id ); ?>"
               name="menu-item-show-template[<?php echo esc_attr( $item_id ); ?>]"
               value="1" <?php checked( $show_template, '1' ); ?> />
        <label for="edit-menu-item-show-template-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Show Shortcode?', 'afs_menu' ); ?>
        </label>
    </div>
    <?php

    // Champ Shortcode (affiché quel que soit l'état de la case, plus simple)
    $template_shortcode = get_post_meta( $item_id, '_menu_item_template_shortcode', true );
    ?>
    <p class="description description-wide">
        <label for="edit-menu-item-template-shortcode-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Shortcode à afficher', 'afs_menu' ); ?><br/>
            <input type="text" id="edit-menu-item-template-shortcode-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-template-shortcode"
                   placeholder="[mon_shortcode id=&quot;123&quot;]"
                   name="menu-item-template-shortcode[<?php echo esc_attr( $item_id ); ?>]"
                   value="<?php echo esc_attr( $template_shortcode ); ?>" />
        </label>
    </p>
    <?php

    // Récupère la liste de produits (IDs séparés par des virgules)
    $menu_products_raw = get_post_meta( $item_id, '_menu_products', true );
    $products_array    = ! empty($menu_products_raw) ? array_filter(array_map('trim', explode(',', $menu_products_raw))) : [];
    ?>
    <p class="description description-wide">
        <label><?php _e( 'Products (Rechercher et ajouter)', 'afs_menu' ); ?></label><br>
        <!-- Select2 pour rechercher un seul produit à la fois -->
        <select class="afs-menu-search-select2"
                data-item-id="<?php echo esc_attr($item_id); ?>"
                style="width: 100%; max-width: 300px;">
            <option value=""><?php _e('Rechercher un produit...', 'afs_menu'); ?></option>
        </select>
    </p>

    <!-- Repeater (liste) des produits déjà ajoutés -->
    <div class="afs-products-repeater"
         data-item-id="<?php echo esc_attr($item_id); ?>"
         style="border:1px solid #ccc; padding:8px; margin-top:5px;">
        <?php
        if ( ! empty($products_array) ) {
            foreach ( $products_array as $prod_id ) {
                $prod_title = get_the_title( $prod_id );
                if ( ! $prod_title ) {
                    $prod_title = 'Product #'. $prod_id;
                }
                ?>
                <div class="afs-product-line"
                     style="margin-bottom:5px; display:flex; gap:5px; align-items:center; cursor:move;"
                     data-id="<?php echo esc_attr($prod_id); ?>">
                    <span><?php echo esc_html($prod_title); ?></span>
                    <button type="button" class="afs-remove-line-button ">&times;</button>

                </div>
                <?php
            }
        }
        ?>
    </div>

    <!-- Input caché final -->
    <input type="hidden"
           id="edit-menu-item-products-<?php echo esc_attr($item_id); ?>"
           name="menu-item-products[<?php echo esc_attr($item_id); ?>]"
           value="<?php echo esc_attr($menu_products_raw); ?>"
    />
    <?php

    // Les autres champs
    // menu_item_image_url
    $menu_item_image_url = get_post_meta( $item_id, '_menu_item_image_url', true );
    ?>
    <p class="description description-wide">
        <label for="edit-menu-item-image-url-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Menu Image URL', 'afs_menu' ); ?><br />
            <input type="text" id="edit-menu-item-image-url-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-image-url"
                   name="menu-item-image-url[<?php echo esc_attr($item_id); ?>]"
                   value="<?php echo esc_attr($menu_item_image_url); ?>" />
        </label>
    </p>
    <?php

    // custom_text_one
    $custom_text_one = get_post_meta( $item_id, '_menu_item_custom_text_one', true );
    ?>
    <p class="description description-wide">
        <label for="edit-menu-item-custom-text-one-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Custom Text One', 'afs_menu' ); ?><br />
            <input type="text" id="edit-menu-item-custom-text-one-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-custom-text-one"
                   name="menu-item-custom-text-one[<?php echo esc_attr($item_id); ?>]"
                   value="<?php echo esc_attr($custom_text_one); ?>" />
        </label>
    </p>
    <?php

    // custom_text_two
    $custom_text_two = get_post_meta( $item_id, '_menu_item_custom_text_two', true );
    ?>
    <p class="description description-wide">
        <label for="edit-menu-item-custom-text-two-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Custom Text Two', 'afs_menu' ); ?><br />
            <input type="text" id="edit-menu-item-custom-text-two-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-custom-text-two"
                   name="menu-item-custom-text-two[<?php echo esc_attr($item_id); ?>]"
                   value="<?php echo esc_attr($custom_text_two); ?>" />
        </label>
    </p>
    <?php

    // button_one_label, button_one_url
    $button_one_label = get_post_meta( $item_id, '_menu_item_button_one_label', true );
    $button_one_url   = get_post_meta( $item_id, '_menu_item_button_one_url', true );
    ?>
    <p class="description description-wide">
        <label for="edit-menu-item-button-one-label-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Button One Label', 'afs_menu' ); ?><br />
            <input type="text" id="edit-menu-item-button-one-label-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-button-one-label"
                   name="menu-item-button-one-label[<?php echo esc_attr($item_id); ?>]"
                   value="<?php echo esc_attr($button_one_label); ?>" />
        </label>
    </p>
    <p class="description description-wide">
        <label for="edit-menu-item-button-one-url-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Button One URL', 'afs_menu' ); ?><br />
            <input type="text" id="edit-menu-item-button-one-url-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-button-one-url"
                   name="menu-item-button-one-url[<?php echo esc_attr($item_id); ?>]"
                   value="<?php echo esc_attr($button_one_url); ?>" />
        </label>
    </p>
    <?php

    // button_two_label, button_two_url
    $button_two_label = get_post_meta( $item_id, '_menu_item_button_two_label', true );
    $button_two_url   = get_post_meta( $item_id, '_menu_item_button_two_url', true );
    ?>
    <p class="description description-wide">
        <label for="edit-menu-item-button-two-label-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Button Two Label', 'afs_menu' ); ?><br />
            <input type="text" id="edit-menu-item-button-two-label-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-button-two-label"
                   name="menu-item-button-two-label[<?php echo esc_attr($item_id); ?>]"
                   value="<?php echo esc_attr($button_two_label); ?>" />
        </label>
    </p>
    <p class="description description-wide">
        <label for="edit-menu-item-button-two-url-<?php echo esc_attr( $item_id ); ?>">
            <?php _e( 'Button Two URL', 'afs_menu' ); ?><br />
            <input type="text" id="edit-menu-item-button-two-url-<?php echo esc_attr( $item_id ); ?>"
                   class="widefat code edit-menu-item-button-two-url"
                   name="menu-item-button-two-url[<?php echo esc_attr($item_id); ?>]"
                   value="<?php echo esc_attr($button_two_url); ?>" />
        </label>
    </p>
    <?php
}
add_action( 'wp_nav_menu_item_custom_fields', 'afs_menu_adv_menu_item_custom_fields', 5, 4 );


/**
 * 8) SAUVEGARDE DES VALEURS CUSTOM
 */
function afs_menu_adv_menu_item_save( $menu_id, $menu_item_db_id ) {

    // 1) show_products
    if ( isset($_POST['menu-item-show-products'][$menu_item_db_id]) ) {
        update_post_meta( $menu_item_db_id, '_show_products', '1' );
    } else {
        update_post_meta( $menu_item_db_id, '_show_products', '' );
    }

    // 2) menu_products
    if ( isset($_POST['menu-item-products'][$menu_item_db_id]) ) {
        $products_val = sanitize_text_field( $_POST['menu-item-products'][$menu_item_db_id] );
        update_post_meta( $menu_item_db_id, '_menu_products', $products_val );
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_products' );
    }

    // 3) menu_item_image_url
    if ( isset($_POST['menu-item-image-url'][$menu_item_db_id]) ) {
        $val = trim( $_POST['menu-item-image-url'][$menu_item_db_id] );
        if ( '' === $val ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_image_url' );
        } else {
            update_post_meta( $menu_item_db_id, '_menu_item_image_url', esc_url_raw( $val ) );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_image_url' );
    }

    // 4) custom_text_one
    if ( isset($_POST['menu-item-custom-text-one'][$menu_item_db_id]) ) {
        $val = sanitize_text_field( $_POST['menu-item-custom-text-one'][$menu_item_db_id] );
        if ( '' === $val ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_custom_text_one' );
        } else {
            update_post_meta( $menu_item_db_id, '_menu_item_custom_text_one', $val );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_custom_text_one' );
    }

    // 5) custom_text_two
    if ( isset($_POST['menu-item-custom-text-two'][$menu_item_db_id]) ) {
        $val = sanitize_text_field( $_POST['menu-item-custom-text-two'][$menu_item_db_id] );
        if ( '' === $val ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_custom_text_two' );
        } else {
            update_post_meta( $menu_item_db_id, '_menu_item_custom_text_two', $val );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_custom_text_two' );
    }

    // 6) button_one_label
    if ( isset($_POST['menu-item-button-one-label'][$menu_item_db_id]) ) {
        $raw_val = trim( $_POST['menu-item-button-one-label'][$menu_item_db_id] );
        if ( '' === $raw_val ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_button_one_label' );
        } else {
            $val = sanitize_text_field( $raw_val );
            update_post_meta( $menu_item_db_id, '_menu_item_button_one_label', $val );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_button_one_label' );
    }

    // 7) button_one_url
    if ( isset($_POST['menu-item-button-one-url'][$menu_item_db_id]) ) {
        $raw_val = trim( $_POST['menu-item-button-one-url'][$menu_item_db_id] );
        if ( '' === $raw_val ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_button_one_url' );
        } else {
            $val = esc_url_raw( $raw_val );
            update_post_meta( $menu_item_db_id, '_menu_item_button_one_url', $val );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_button_one_url' );
    }

    // 8) button_two_label
    if ( isset($_POST['menu-item-button-two-label'][$menu_item_db_id]) ) {
        $raw_val = trim( $_POST['menu-item-button-two-label'][$menu_item_db_id] );
        if ( '' === $raw_val ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_button_two_label' );
        } else {
            $val = sanitize_text_field( $raw_val );
            update_post_meta( $menu_item_db_id, '_menu_item_button_two_label', $val );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_button_two_label' );
    }

    // 9) button_two_url
    if ( isset($_POST['menu-item-button-two-url'][$menu_item_db_id]) ) {
        $raw_val = trim( $_POST['menu-item-button-two-url'][$menu_item_db_id] );
        if ( '' === $raw_val ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_button_two_url' );
        } else {
            $val = esc_url_raw( $raw_val );
            update_post_meta( $menu_item_db_id, '_menu_item_button_two_url', $val );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_button_two_url' );
    }
    /* 10) show_template */
    if ( isset( $_POST['menu-item-show-template'][ $menu_item_db_id ] ) ) {
        update_post_meta( $menu_item_db_id, '_menu_item_show_template', '1' );
    } else {
        update_post_meta( $menu_item_db_id, '_menu_item_show_template', '' );
    }

    /* 11) template_shortcode */
    if ( isset( $_POST['menu-item-template-shortcode'][ $menu_item_db_id ] ) ) {
        $sc_raw = trim( $_POST['menu-item-template-shortcode'][ $menu_item_db_id ] );
        if ( '' === $sc_raw ) {
            delete_post_meta( $menu_item_db_id, '_menu_item_template_shortcode' );
        } else {
            update_post_meta( $menu_item_db_id, '_menu_item_template_shortcode', sanitize_text_field( $sc_raw ) );
        }
    } else {
        delete_post_meta( $menu_item_db_id, '_menu_item_template_shortcode' );
    }

}
add_action( 'wp_update_nav_menu_item', 'afs_menu_adv_menu_item_save', 10, 2 );


/**
 * 9) SCRIPTS ADMIN (Select2 + AJAX)
 */
function afs_menu_adv_admin_scripts( $hook ) {
    if ( 'nav-menus.php' !== $hook ) {
        return;
    }

    // Charger Select2 (CDN)
    wp_enqueue_style( 'select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0' );
    wp_enqueue_script( 'select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0', true );

    // jQuery UI Sortable
    wp_enqueue_script( 'jquery-ui-sortable' );

    // Notre script d'admin
    wp_enqueue_script(
        'afs-menu-adv-admin',
        AFS_MENU_ADV_PLUGIN_URL . 'assets/afs_menu_admin.js',
        array( 'jquery', 'select2', 'jquery-ui-sortable' ),
        '1.6.5',
        true
    );

    // -- ICI : on ajoute notre CSS d'admin --
    wp_enqueue_style(
        'afs-menu-adv-admin-css',
        AFS_MENU_ADV_PLUGIN_URL . 'assets/afs_menu_admin.css',
        array(),
        '1.6.5'
    );

    wp_localize_script( 'afs-menu-adv-admin', 'AFS_MENU_ADV', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce( 'afs_menu_adv_nonce' ),
    ) );
}
add_action( 'admin_enqueue_scripts', 'afs_menu_adv_admin_scripts' );



/**
 * 10) AJAX : RECHERCHE DE PRODUITS
 */
function afs_menu_adv_search_products() {
    check_ajax_referer( 'afs_menu_adv_nonce', 'nonce' );

    $term = isset($_GET['q']) ? sanitize_text_field($_GET['q']) : '';
    $results = array();

    if ( ! empty( $term ) && class_exists( 'WooCommerce' ) ) {
        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => 20,
            's'              => $term,
        );
        $query = new WP_Query( $args );
        if ( $query->have_posts() ) {
            foreach ( $query->posts as $product_post ) {
                $results[] = array(
                    'id'   => $product_post->ID,
                    'text' => $product_post->post_title,
                );
            }
        }
    }

    wp_send_json( array( 'results' => $results ) );
}
add_action( 'wp_ajax_afs_menu_search_products', 'afs_menu_adv_search_products' );


/**
 * WPML COMPATIBILITY: Translate product IDs for WPML
 */
function afs_menu_adv_wpml_translate_product_ids($product_ids) {
    if (!function_exists('wpml_object_id_filter') || empty($product_ids)) {
        return $product_ids;
    }
    
    $translated_ids = array();
    $product_ids_array = array_map('trim', explode(',', $product_ids));
    
    foreach ($product_ids_array as $product_id) {
        if (is_numeric($product_id)) {
            $translated_id = apply_filters('wpml_object_id', $product_id, 'product', true);
            $translated_ids[] = $translated_id;
        }
    }
    
    return implode(',', $translated_ids);
}

/**
 * WPML COMPATIBILITY: Translate menu items when retrieving them
 */
add_filter('wp_get_nav_menu_items', 'afs_menu_adv_wpml_translate_menu_items', 20, 3);
function afs_menu_adv_wpml_translate_menu_items($items, $menu, $args) {
    if (!is_admin() && function_exists('wpml_object_id_filter') && !empty($items)) {
        $translated_items = array();
        
        foreach ($items as $item) {
            $translated_id = apply_filters('wpml_object_id', $item->ID, 'nav_menu_item', true);
            
            if ($translated_id != $item->ID) {
                $translated_item = get_post($translated_id);
                
                if ($translated_item) {
                    // Copy all properties from original to translated item
                    foreach (get_object_vars($item) as $key => $value) {
                        if (!isset($translated_item->$key)) {
                            $translated_item->$key = $value;
                        }
                    }
                    $translated_items[] = $translated_item;
                    continue;
                }
            }
            $translated_items[] = $item;
        }
        
        return $translated_items;
    }
    
    return $items;
}