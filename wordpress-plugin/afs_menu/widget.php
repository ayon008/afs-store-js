<?php
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'Afs_Menu_Widget' ) ) :

    class Afs_Menu_Widget extends Widget_Base {

        public function get_name() {
            return 'afs_menu_widget';
        }

        public function get_title() {
            return __( 'AFS Menu', 'afs_menu' );
        }

        public function get_icon() {
            return 'eicon-nav-menu';
        }

        public function get_categories() {
            return [ 'general' ];
        }

        protected function _register_controls() {
            // Récupération des menus
            $menus = wp_get_nav_menus();
            $menu_options = [];
            foreach ( $menus as $menu ) {
                $menu_options[ $menu->term_id ] = $menu->name;
            }

            $this->start_controls_section(
                'content_section',
                [
                    'label' => __( 'Content', 'afs_menu' ),
                    'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
                ]
            );

            $this->add_control(
                'selected_menu',
                [
                    'label'   => __( 'Select Menu', 'afs_menu' ),
                    'type'    => \Elementor\Controls_Manager::SELECT,
                    'options' => $menu_options,
                    'default' => array_key_first( $menu_options ),
                ]
            );

            $this->add_control(
                'selected_menu_two',
                [
                    'label'   => __( 'Select Second Menu', 'afs_menu' ),
                    'type'    => \Elementor\Controls_Manager::SELECT,
                    'options' => $menu_options,
                    'default' => array_key_first( $menu_options ),
                ]
            );

            $this->add_control(
                'button_one_icon',
                [
                    'label'   => __( 'Button One Icon', 'afs_menu' ),
                    'type'    => \Elementor\Controls_Manager::MEDIA,
                    'default' => [ 'url' => \Elementor\Utils::get_placeholder_image_src() ],
                ]
            );

            $this->add_control(
                'button_two_icon',
                [
                    'label'   => __( 'Button Two Icon', 'afs_menu' ),
                    'type'    => \Elementor\Controls_Manager::MEDIA,
                    'default' => [ 'url' => \Elementor\Utils::get_placeholder_image_src() ],
                ]
            );

            $this->end_controls_section();
        }

        protected function render() {
            // 1. Tente de charger le cache
            $cached_html = afs_menu_adv_get_menu_cache();
            if ( $cached_html ) {
                echo $cached_html;
                return;
            }

            // 2. Sinon, on génère le menu
            ob_start();

            $settings = $this->get_settings_for_display();
    $selected_menu_id     = $settings['selected_menu'];
    $selected_menu_id_two = $settings['selected_menu_two'];

    // Get menu items for the selected menus
    $menu_items     = wp_get_nav_menu_items( $selected_menu_id );
    $menu_items_two = wp_get_nav_menu_items( $selected_menu_id_two );

    // Check if menu items are found for Menu One
    if ( empty( $menu_items ) || is_wp_error( $menu_items ) ) {
        echo __( 'No menu items found for Menu One.', 'afs_menu' );
        return;
    }

    // Check if menu items are found for Menu Two
    if ( empty( $menu_items_two ) || is_wp_error( $menu_items_two ) ) {
        echo __( 'No menu items found for Menu Two.', 'afs_menu' );
        return;
    }

    // Build menu trees
    $menu_tree     = $this->build_menu_tree( $menu_items );
    $menu_tree_two = $this->build_menu_tree( $menu_items_two );

    // Render the menu HTML
    echo '<div class="custom-menu-widget">';
    echo '<nav class="menu-level-one">';

    // Render the first menu
    echo '<ul class="menu-categories">';
    echo '<span class="ul_level_one_heading">Produits</span>';
    $this->render_menu_items( $menu_tree, 0, 1 );
    echo '</ul>';

    // Render the second menu
    echo '<div class="afs_footer_responsive">';
    echo '<ul class="menu-categories">';
    echo '<span class="ul_level_one_heading">Autres</span>';
    $this->render_menu_items( $menu_tree_two, 0, 1 );
    echo '</ul>';
    echo '</div>';

    echo '</nav>';
    echo '</div>';

    // Get the output and clean the buffer
    $output = ob_get_clean();


     afs_menu_adv_generate_menu_cache( $output );

    // Output the generated HTML
    echo $output;
}

private function build_menu_tree( $menu_items ) {
    $menu_tree = [];
    foreach ( $menu_items as $menu_item ) {
        $menu_tree[ $menu_item->menu_item_parent ][] = $menu_item;
    }
    return $menu_tree;
}

private function render_menu_items( $menu_tree, $parent_id, $level ) {
    if ( ! isset( $menu_tree[ $parent_id ] ) ) {
        return;
    }

    if ( $level > 1 ) {
        echo '<a href="#" class="back product-back" aria-label="Back to Product">
            <span class="back-icon"> 
                <img src="/wp-content/uploads/2023/01/link-icons-2.svg" alt="Back">
            </span> 
          Produits
          </a>';
        echo '<div class="dynamic-heading"></div>';
    }

    foreach ( $menu_tree[ $parent_id ] as $menu_item ) {
        $menu_item_id = $menu_item->ID;

        echo '<li class="menu-category" data-menu-item-id="' . esc_attr( $menu_item_id ) . '">';

        // Icône éventuelle (optionnel)
        $menu_icon = get_post_meta( $menu_item->ID, '_menu_item_menu_icon', true );

        // Check if the URL is empty and render as <span> if true, otherwise render as <a>
        if ( empty( $menu_item->url ) ) {
            // Render as a <span> if the URL is empty
            echo '<span class="menu-nav">';
            echo '<span class="headerNav__titleText">' . esc_html( $menu_item->title ) . '</span>';
            echo '</span>';
        } else {
            // Render as an <a> tag if the URL is not empty
            echo '<a class="menu-nav" href="' . esc_url( $menu_item->url ) . '">';
            echo '<span class="headerNav__titleText">' . esc_html( $menu_item->title ) . '</span>';
            echo '</a>';
        }

        echo '<span class="submenu-icon">';
        if ( $menu_icon ) {
            echo '<img src="' . esc_url( $menu_icon ) . '" loading="lazy" alt="' . esc_attr( $menu_item->title ) . ' Icon">';
        }
        echo '</span>';

        // Template shortcode éventuel
        $show_template      = get_post_meta( $menu_item_id, '_menu_item_show_template', true );
        $template_shortcode = get_post_meta( $menu_item_id, '_menu_item_template_shortcode', true );
        if ( $show_template && $template_shortcode ) {
            echo '<div class="menu-level-two">';
            echo do_shortcode( $template_shortcode );
            echo '</div>';
        }
        if ( $show_template && $template_shortcode ) {
            // S’il existe aussi _show_products, on le force à vide pour ce menu item
            $show_products = '';
        }
        // Bloc produits
        $menu_image_url = get_post_meta( $menu_item_id, '_menu_item_image_url', true );
        $show_products  = get_post_meta( $menu_item_id, '_show_products', true );
        $product_ids    = get_post_meta( $menu_item_id, '_menu_products', true );

        $custom_text_one = get_post_meta( $menu_item_id, '_menu_item_custom_text_one', true );
        $custom_text_two = get_post_meta( $menu_item_id, '_menu_item_custom_text_two', true );

        if ( $show_products && $product_ids ) {
            $product_ids = array_map( 'trim', explode( ',', $product_ids ) );
            if ( function_exists('wc_get_products') ) {
                $products = wc_get_products( [ 'include' => $product_ids ] );
            } else {
                $products = [];
            }

            if ( ! empty( $products ) ) {
                echo '<div class="menu-level-three">';
                echo '<div class="afs-product-menu-container">';
                echo '<a href="#" class="back nav-back" aria-label="Back to Previous Level"><span class="back-icon"><img src="/wp-content/uploads/2023/01/link-icons-2.svg" alt="Back"></span> <span class="back-text">Back</span></a>';
                echo '<div class="product-items-container">';

                // Display custom text fields
                if ( ! empty( $custom_text_one ) || ! empty( $custom_text_two ) ) {
                    echo '<div class="ttf_wrap">';
                    echo '<span class="mega_menu_heading_one">' . esc_html( $custom_text_one ) . '</span>';
                    echo '<div class="dynamic-heading"></div>';
                    echo '<span class="mega_menu_heading_two">' . esc_html( $custom_text_two ) . '</span>';
                    echo '</div>';
                }

                // Ensure product IDs are sorted properly
                usort($products, function($a, $b) use ($product_ids) {
                    return array_search($a->get_id(), $product_ids) - array_search($b->get_id(), $product_ids);
                });

                // Limit the number of products to a maximum of 12
                $products = array_slice($products, 0, 12);

                // Split products into chunks of 4
                $product_chunks = array_chunk($products, 4);

                // Open a single parent <div> to wrap all <ul> elements
                echo '<div class="product-container">'; // Open the parent <div>

                // Loop through each chunk (max 3 chunks)
                foreach ($product_chunks as $chunk_index => $chunk_products) {
                    echo '<ul class="submenu-products">'; // Open a new <ul> for each chunk

                    foreach ($chunk_products as $index => $product) {
                        $product_id = $product->get_id();

                        // Fetch product details
                        $acf_image = get_field('img', $product_id);
                        $acf_image_url = $acf_image ? $acf_image['url'] : '';
                        $product_image_url = $acf_image_url ? $acf_image_url : wp_get_attachment_url($product->get_image_id());

                        $product_name = $product->get_name();
                        $product_price = $product->get_price_html();
                        $product_url = get_permalink($product_id);

                        // Fetch the ACF field "menu_description" for each product
                        $menu_description = get_field('menu_description', $product_id);

                        // Output the product as an <li>
                        echo '<li class="product-item" data-product-id="' . esc_attr($product_id) . '" data-image-url="' . esc_url($product_image_url) . '">';
                        echo '<a href="' . esc_url($product_url) . '" class="product-link">';
                        echo '<span class="product-title">' . esc_html($product_name) . '</span>';
                        echo '<span class="product-price">' . wp_kses_post($product_price) . '</span>';

                        if (!empty($menu_description)) {
                            echo '<div class="menu_product_property_list">';
                            echo '<span>' . esc_html($menu_description) . '</span>';
                            echo '</div>';
                        }

                        echo '</a>';
                        echo '</li>';
                    }

                    echo '</ul>'; // Close the <ul> for the current chunk
                }

                echo '</div>'; // Close the parent <div>

                echo '</div>';

                $default_image = $menu_image_url ? $menu_image_url : '';

                echo '<div class="product-image-container">';
                echo '<div class="product-image" id="product-image-' . esc_attr( $menu_item_id ) . '">';
                echo '<img src="' . esc_url( $default_image ) . '" alt="Product Image" data-initial-src="' . esc_url( $default_image ) . '" />';
                echo '</div>';
                echo '</div>';

                echo '</div>'; // End of afs-product-menu-container

                // Boutons footer
                $settings = $this->get_settings_for_display();
                $button_one_icon_url = $settings['button_one_icon']['url'];
                $button_two_icon_url = $settings['button_two_icon']['url'];

                $button_one_label = get_post_meta( $menu_item_id, '_menu_item_button_one_label', true );
                $button_one_url   = get_post_meta( $menu_item_id, '_menu_item_button_one_url', true );
                $button_two_label = get_post_meta( $menu_item_id, '_menu_item_button_two_label', true );
                $button_two_url   = get_post_meta( $menu_item_id, '_menu_item_button_two_url', true );

                echo '<div class="menu_footer_nav">';
                if ( ! empty( $button_one_label ) && ! empty( $button_one_url ) ) {
                    echo '<a href="' . esc_url( $button_one_url ) . '" class="menu-item-button menu-item-button-one">';
                    if ( ! empty( $button_one_icon_url ) ) {
                        echo '<img src="' . esc_url( $button_one_icon_url ) . '" loading="lazy" alt="Icon Button One" class="menu-item-icon">';
                    }
                    echo esc_html( $button_one_label );
                    echo '</a>';
                }

                if ( ! empty( $button_two_label ) && ! empty( $button_two_url ) ) {
                    echo '<a href="' . esc_url( $button_two_url ) . '" class="menu-item-button menu-item-button-two">';
                    if ( ! empty( $button_two_icon_url ) ) {
                        echo '<img src="' . esc_url( $button_two_icon_url ) . '" loading="lazy" alt="Icon Button Two" class="menu-item-icon">';
                    }
                    echo esc_html( $button_two_label );
                    echo '</a>';
                }
                echo '</div>'; // .menu_footer_nav

                echo '</div>'; // .menu-level-three
            }
        }

        // Sous-menus classiques
        if ( isset( $menu_tree[ $menu_item_id ] ) ) {
            echo '<div class="menu-level-two">';
            echo '<ul class="submenu">';
            $this->render_menu_items( $menu_tree, $menu_item_id, $level + 1 );
            echo '</ul>';
            echo '</div>';
        }

        echo '</li>';
    }
}

        public function get_script_depends() {
            // Script front
            return [ 'afs_nav_script' ];
        }

        public function get_style_depends() {
            // Style front
            return [ 'afs_nav_style' ];
        }
    }

endif;