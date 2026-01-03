<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Ajout de la page "AFS Menu Editor" dans Réglages
add_action('admin_menu', 'afs_menu_adv_editor_submenu');
function afs_menu_adv_editor_submenu() {
    add_submenu_page(
        'options-general.php',
        'AFS Menu Editor',
        'AFS Menu Editor',
        'manage_options',
        'afs-menu-editor',
        'afs_menu_adv_editor_page'
    );
}

function afs_menu_adv_editor_page() {
    // Enregistrement si formulaire soumis
    if ( isset($_POST['afs_editor_nonce']) && wp_verify_nonce($_POST['afs_editor_nonce'], 'afs_editor_save') ) {
        $selected_menu_id = isset($_POST['selected_menu_id']) ? intval($_POST['selected_menu_id']) : 0;

        if ( ! empty($_POST['menu_item_data']) && is_array($_POST['menu_item_data']) ) {
            foreach ( $_POST['menu_item_data'] as $menu_item_id => $fields ) {
                $show_products = isset($fields['show_products']) ? '1' : '';
                update_post_meta( $menu_item_id, '_show_products', $show_products );

                $products_val = isset($fields['menu_products']) ? sanitize_text_field($fields['menu_products']) : '';
                update_post_meta( $menu_item_id, '_menu_products', $products_val );

                $txt_one = isset($fields['custom_text_one']) ? sanitize_text_field($fields['custom_text_one']) : '';
                update_post_meta( $menu_item_id, '_menu_item_custom_text_one', $txt_one );

                $txt_two = isset($fields['custom_text_two']) ? sanitize_text_field($fields['custom_text_two']) : '';
                update_post_meta( $menu_item_id, '_menu_item_custom_text_two', $txt_two );

                $img_url = isset($fields['menu_item_image_url']) ? esc_url_raw($fields['menu_item_image_url']) : '';
                update_post_meta( $menu_item_id, '_menu_item_image_url', $img_url );

                $b1_label = isset($fields['button_one_label']) ? sanitize_text_field($fields['button_one_label']) : '';
                update_post_meta( $menu_item_id, '_menu_item_button_one_label', $b1_label );

                $b1_url = isset($fields['button_one_url']) ? esc_url_raw($fields['button_one_url']) : '';
                update_post_meta( $menu_item_id, '_menu_item_button_one_url', $b1_url );

                $b2_label = isset($fields['button_two_label']) ? sanitize_text_field($fields['button_two_label']) : '';
                update_post_meta( $menu_item_id, '_menu_item_button_two_label', $b2_label );

                $b2_url = isset($fields['button_two_url']) ? esc_url_raw($fields['button_two_url']) : '';
                update_post_meta( $menu_item_id, '_menu_item_button_two_url', $b2_url );
            }
        }

        // Invalidation du cache
        if ( function_exists('afs_menu_adv_invalidate_menu_cache') ) {
            afs_menu_adv_invalidate_menu_cache();
        }

        echo '<div class="notice notice-success"><p>Modifications enregistrées. Le cache a été invalidé.</p></div>';
    }

    // Sélection du menu
    $menus = wp_get_nav_menus();
    $selected_menu_id = isset($_POST['selected_menu_id']) ? intval($_POST['selected_menu_id']) : 0;
    if ( $selected_menu_id === 0 && ! empty($menus) ) {
        $selected_menu_id = $menus[0]->term_id;
    }
    ?>
    <div class="wrap">
        <h1>AFS Menu Editor</h1>

        <form method="post">
            <?php wp_nonce_field('afs_editor_save', 'afs_editor_nonce'); ?>
            <label for="selected_menu_id"><strong>Sélectionnez un menu :</strong></label>
            <select name="selected_menu_id" id="selected_menu_id" onchange="this.form.submit()">
                <?php foreach ( $menus as $menu ) : ?>
                    <option value="<?php echo esc_attr($menu->term_id); ?>"
                        <?php selected($menu->term_id, $selected_menu_id); ?>>
                        <?php echo esc_html($menu->name); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </form>

        <?php
        // Liste des items du menu sélectionné
        if ( $selected_menu_id ) {
            $menu_items = wp_get_nav_menu_items( $selected_menu_id );
            if ( ! empty($menu_items) ) {
                ?>
                <form method="post">
                    <?php wp_nonce_field('afs_editor_save', 'afs_editor_nonce'); ?>
                    <input type="hidden" name="selected_menu_id" value="<?php echo esc_attr($selected_menu_id); ?>">

                    <table class="widefat striped" style="margin-top:20px;">
                        <thead>
                        <tr>
                            <th><?php _e('Menu Item', 'afs_menu'); ?></th>
                            <th><?php _e('Show Products?', 'afs_menu'); ?></th>
                            <th><?php _e('Product IDs', 'afs_menu'); ?></th>
                            <th><?php _e('Text One', 'afs_menu'); ?></th>
                            <th><?php _e('Text Two', 'afs_menu'); ?></th>
                            <th><?php _e('Image URL', 'afs_menu'); ?></th>
                            <th><?php _e('Button One (Label/URL)', 'afs_menu'); ?></th>
                            <th><?php _e('Button Two (Label/URL)', 'afs_menu'); ?></th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php
                        foreach ( $menu_items as $item ) {
                            $item_id  = $item->ID;
                            $show     = get_post_meta($item_id, '_show_products', true);
                            $products = get_post_meta($item_id, '_menu_products', true);
                            $txt1     = get_post_meta($item_id, '_menu_item_custom_text_one', true);
                            $txt2     = get_post_meta($item_id, '_menu_item_custom_text_two', true);
                            $img      = get_post_meta($item_id, '_menu_item_image_url', true);
                            $b1_label = get_post_meta($item_id, '_menu_item_button_one_label', true);
                            $b1_url   = get_post_meta($item_id, '_menu_item_button_one_url', true);
                            $b2_label = get_post_meta($item_id, '_menu_item_button_two_label', true);
                            $b2_url   = get_post_meta($item_id, '_menu_item_button_two_url', true);
                            ?>
                            <tr>
                                <td>
                                    <strong><?php echo esc_html($item->title); ?></strong><br>
                                    <small>(<?php echo esc_url($item->url); ?>)</small>
                                </td>
                                <td>
                                    <input type="checkbox"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][show_products]"
                                           value="1"
                                        <?php checked($show, '1'); ?>>
                                </td>
                                <td>
                                    <input type="text" class="widefat"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][menu_products]"
                                           value="<?php echo esc_attr($products); ?>">
                                </td>
                                <td>
                                    <input type="text" class="widefat"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][custom_text_one]"
                                           value="<?php echo esc_attr($txt1); ?>">
                                </td>
                                <td>
                                    <input type="text" class="widefat"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][custom_text_two]"
                                           value="<?php echo esc_attr($txt2); ?>">
                                </td>
                                <td>
                                    <input type="text" class="widefat"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][menu_item_image_url]"
                                           value="<?php echo esc_attr($img); ?>">
                                </td>
                                <td>
                                    <input type="text" class="widefat" placeholder="Label"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][button_one_label]"
                                           value="<?php echo esc_attr($b1_label); ?>">
                                    <br>
                                    <input type="text" class="widefat" placeholder="URL"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][button_one_url]"
                                           value="<?php echo esc_attr($b1_url); ?>">
                                </td>
                                <td>
                                    <input type="text" class="widefat" placeholder="Label"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][button_two_label]"
                                           value="<?php echo esc_attr($b2_label); ?>">
                                    <br>
                                    <input type="text" class="widefat" placeholder="URL"
                                           name="menu_item_data[<?php echo esc_attr($item_id); ?>][button_two_url]"
                                           value="<?php echo esc_attr($b2_url); ?>">
                                </td>
                            </tr>
                            <?php
                        } // end foreach
                        ?>
                        </tbody>
                    </table>

                    <p style="margin-top:20px;">
                        <input type="submit" class="button button-primary" value="Enregistrer les modifications">
                    </p>
                </form>
                <?php
            } else {
                echo '<p>Aucun élément dans ce menu.</p>';
            }
        }
        ?>
    </div>
    <?php
}
