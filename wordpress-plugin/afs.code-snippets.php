<?php

/**
 *  AFS CPT's expose (for react)
 */
//expose the afs team category slug
add_action('rest_api_init', function () {
    register_rest_field( 'afs-team',
        'member_role_data',
        array(
            'get_callback' => function( $post_arr ) {
                $terms = wp_get_post_terms( $post_arr['id'], 'member-role' );
                if ( empty( $terms ) || is_wp_error( $terms ) ) {
                    return [];
                }

                return array_map(function($term) {
                    return [
                        'id' => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                    ];
                }, $terms);
            },
            'schema' => null,
        )
    );
});


function ambassador_add_taxonomies_to_rest() {
    register_taxonomy_for_object_type('discipline', 'ambassador');
    register_taxonomy_for_object_type('nationalite', 'ambassador');
}
add_action('init', 'ambassador_add_taxonomies_to_rest');


function ambassador_extend_rest_response( $response, $post, $request ) {

    // Get all taxonomies attached to ambassador
    $taxonomies = ['discipline', 'nationalite'];

    foreach ( $taxonomies as $tax ) {
        $terms = get_the_terms( $post->ID, $tax );

        if ( empty( $terms ) || is_wp_error( $terms ) ) {
            $response->data[$tax] = [];
            continue;
        }

        // Map full term data
        $response->data[$tax] = array_map( function ( $term ) {
            return [
                'id'   => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            ];
        }, $terms );
    }

    return $response;
}
add_filter( 'rest_prepare_ambassador', 'ambassador_extend_rest_response', 10, 3 );


add_action('rest_api_init', function () {
    register_rest_field(
        'dealer', // your custom post type
        'afs_dealers_type_names',
        [
            'get_callback' => function($object) {
                $terms = wp_get_post_terms($object['id'], 'afs-dealers-type');
                if (!empty($terms) && !is_wp_error($terms)) {
                    return wp_list_pluck($terms, 'name'); // return names
                }
                return [];
            },
            'update_callback' => null,
            'schema' => null,
        ]
    );
});


add_action('rest_api_init', function () {
    register_rest_field(
        'event', // your CPT
        'destination_names', // new field name you want in REST
        [
            'get_callback' => function($object) {
                // get terms from taxonomy "destination"
                $terms = wp_get_post_terms($object['id'], 'destination');

                if (!empty($terms) && !is_wp_error($terms)) {
                    return wp_list_pluck($terms, 'name'); // return only names
                }

                return [];
            },
            'update_callback' => null,
            'schema' => null,
        ]
    );
});

/**
 * for lost pass and woocomerce end points
 */
// Redirect lost password
add_filter('lostpassword_redirect', function ($redirect_to) {
    return home_url('/7pyqmxyzbbqyg7');
});

add_filter( 'woocommerce_store_api_disable_nonce_check', '__return_true' );

/**
 * menu expose with products
 */
add_action('rest_api_init', function () {

    register_rest_route('custom/v1', '/menus/(?P<id>\d+)', [
        'methods'  => 'GET',
        'callback' => function ($data) {

            $menu_id  = (int) $data['id'];
            $lang     = defined('ICL_LANGUAGE_CODE') ? ICL_LANGUAGE_CODE : 'default';
            $currency = function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'USD';

            $cache_key = "menu_fast_{$menu_id}_{$lang}_{$currency}";

            // 🚀 FAST CACHE (object cache compatible)
            $cached = wp_cache_get($cache_key, 'menus');
            if ($cached !== false) {
                return $cached;
            }

            $menu_items = wp_get_nav_menu_items($menu_id);
            if (!$menu_items) return [];

            // ===============================
            // Collect product IDs
            // ===============================
            $product_ids = [];
            foreach ($menu_items as $item) {
                $raw = get_post_meta($item->ID, '_menu_products', true);
                if ($raw) {
                    foreach (explode(',', $raw) as $id) {
                        $product_ids[(int) trim($id)] = true;
                    }
                }
            }
            $product_ids = array_keys($product_ids);

            // ===============================
            // Load product data (RAW + FAST)
            // ===============================
            global $wpdb;
            $products_map = [];

            if ($product_ids) {

                $ids_sql = implode(',', array_map('intval', $product_ids));

                $rows = $wpdb->get_results("
                    SELECT ID, post_title
                    FROM {$wpdb->posts}
                    WHERE ID IN ($ids_sql)
                ");

                foreach ($rows as $row) {
                    $products_map[$row->ID] = [
                        'id'    => (int) $row->ID,
                        'name'  => $row->post_title,
                        'url'   => get_permalink($row->ID),
                        'image' => wp_get_attachment_url(get_post_thumbnail_id($row->ID)),
                        'price' => '', // filled below
                    ];
                }

                // Prices (single meta query)
                $prices = $wpdb->get_results("
                    SELECT post_id, meta_value
                    FROM {$wpdb->postmeta}
                    WHERE post_id IN ($ids_sql)
                    AND meta_key = '_price'
                ");

                foreach ($prices as $p) {
                    if (isset($products_map[$p->post_id])) {
                        $products_map[$p->post_id]['price'] = wc_price($p->meta_value);
                    }
                }
            }

            // ===============================
            // Build menu map
            // ===============================
            $items = [];
            foreach ($menu_items as $item) {

                $ids = get_post_meta($item->ID, '_menu_products', true);
                $ids = $ids ? array_map('intval', explode(',', $ids)) : [];

                $products = [];
                foreach ($ids as $pid) {
                    if (isset($products_map[$pid])) {
                        $products[] = $products_map[$pid];
                    }
                }

                $items[$item->ID] = [
                    'id'    => $item->ID,
                    'title' => $item->title,
                    'url'   => $item->url,
                    'menu_products' => $products,
                    'children' => [],
                    'parent'   => (int) $item->menu_item_parent,
                ];
            }

            // ===============================
            // Tree build (O(n))
            // ===============================
            $tree = [];
            foreach ($items as $id => &$item) {
                if ($item['parent'] && isset($items[$item['parent']])) {
                    $items[$item['parent']]['children'][] = &$item;
                } else {
                    $tree[] = &$item;
                }
                unset($item['parent']);
            }

            // 🚀 Store in object cache (Redis/Memcached ready)
            wp_cache_set($cache_key, $tree, 'menus', HOUR_IN_SECONDS);

            return $tree;
        }
    ]);
});



// function afs_debug_menu_ids() {
//     if (!current_user_can('manage_options')) {
//         return;
//     }

//     $menus = wp_get_nav_menus();

//     echo '<pre style="background:#111;color:#0f0;padding:12px;">';
//     echo "MENU IDS\n\n";

//     foreach ($menus as $menu) {
//         echo "ID: {$menu->term_id} | Name: {$menu->name}\n";
//     }

//     echo '</pre>';
// }

// add_action('admin_notices', 'afs_debug_menu_ids');

/**
 * Get variations with tax
 */
add_action('rest_api_init', function () {

    register_rest_field(
        'product_variation',
        'price_incl_tax',
        array(
            'get_callback' => function ($variation) {

                if (!class_exists('WooCommerce')) return null;
                if (function_exists('wc_load_cart')) wc_load_cart();

                if (!WC()->customer) {
                    WC()->customer = new WC_Customer(0);
                }

                $variation_obj = wc_get_product($variation['id']);
                if (!$variation_obj) return null;

                $price = (float) $variation_obj->get_price();

                /* ---------------- TAX / GEO LOGIC (SAME AS AFS API) ---------------- */

                $shipping_country  = '';
                $shipping_state    = '';
                $shipping_postcode = '';

                $req_country  = isset($_GET['shipping_country']) ? sanitize_text_field($_GET['shipping_country']) : null;
                $req_state    = isset($_GET['shipping_state']) ? sanitize_text_field($_GET['shipping_state']) : '';
                $req_postcode = isset($_GET['shipping_postcode']) ? sanitize_text_field($_GET['shipping_postcode']) : '';

                if ($req_country !== null) {

                    // shipping_country=null → GEO based
                    if ($req_country === '' || $req_country === 'null') {

                        if (class_exists('WC_Geolocation')) {
                            $geo = WC_Geolocation::geolocate_ip();
                            if (!empty($geo['country'])) {
                                $shipping_country = $geo['country'];
                                $shipping_state   = $geo['state'] ?? '';
                            }
                        }

                    } else {
                        // shipping_country=FR
                        $shipping_country  = strtoupper($req_country);
                        $shipping_state    = $req_state ?: '';
                        $shipping_postcode = $req_postcode ?: '';
                    }

                } else {
                    // No param → GEO fallback
                    if (class_exists('WC_Geolocation')) {
                        $geo = WC_Geolocation::geolocate_ip();
                        if (!empty($geo['country'])) {
                            $shipping_country = $geo['country'];
                            $shipping_state   = $geo['state'] ?? '';
                        }
                    }
                }

                // Final fallback → store base
                if (!$shipping_country) {
                    $shipping_country = WC()->countries->get_base_country();
                    $shipping_state   = WC()->countries->get_base_state();
                }

                /* -------- APPLY CUSTOMER CONTEXT (CRITICAL PART) -------- */

                WC()->customer->set_is_vat_exempt(false);
                WC()->customer->set_shipping_country($shipping_country);
                WC()->customer->set_shipping_state($shipping_state);
                WC()->customer->set_shipping_postcode($shipping_postcode);

                /* ---------------- CALCULATE TAX ---------------- */

                $price_incl_tax = wc_get_price_including_tax($variation_obj, array(
                    'price' => $price,
                    'qty'   => 1,
                ));

                return round($price_incl_tax, 4);
            },
            'schema' => null,
        )
    );
});

/**
 * ACF field for product variation STOCK
 */
// 1️⃣ Allow "Product Variation" in ACF location rules
add_filter('acf/location/rule_values/post_type', function ($choices) {
    $choices['product_variation'] = 'Product Variation';
    return $choices;
});


// 2️⃣ Render ACF fields inside each variation (ADMIN)
add_action('woocommerce_product_after_variable_attributes', function ($loop, $variation_data, $variation) {

    $field_groups = acf_get_field_groups(['post_type' => 'product_variation']);

    if (!$field_groups) {
        return;
    }

    foreach ($field_groups as $group) {
        $fields = acf_get_fields($group);

        if ($fields) {
            echo '<div class="acf-variation-fields" style="margin-top:10px;">';

            foreach ($fields as $field) {
                // IMPORTANT: namespace fields per variation
                $field['name']  = "acf_variation[{$variation->ID}][{$field['key']}]";
                $field['value'] = get_field($field['key'], $variation->ID);

                acf_render_field_wrap($field);
            }

            echo '</div>';
        }
    }

}, 10, 3);


// 3️⃣ Save ACF fields per variation (THIS FIXES YOUR ISSUE)
add_action('woocommerce_save_product_variation', function ($variation_id, $i) {

    if (empty($_POST['acf_variation'][$variation_id])) {
        return;
    }

    foreach ($_POST['acf_variation'][$variation_id] as $field_key => $value) {
        update_field($field_key, $value, $variation_id);
    }

}, 10, 2);


// 4️⃣ Expose ACF variation fields in REST API (Frontend / React safe)
add_filter(
    'woocommerce_rest_prepare_product_variation_object',
    function ($response, $variation, $request) {

        $acf_data = [];
        $field_groups = acf_get_field_groups(['post_type' => 'product_variation']);

        foreach ($field_groups as $group) {
            $fields = acf_get_fields($group);

            if ($fields) {
                foreach ($fields as $field) {
                    $acf_data[$field['name']] = get_field($field['key'], $variation->get_id());
                }
            }
        }

        $response->data['acf'] = $acf_data;

        return $response;
    },
    10,
    3
);

// 5️⃣ Expose ACF product fields in REST API (Frontend / React safe)
add_filter(
    'woocommerce_rest_prepare_product_object',
    function ($response, $product, $request) {
        // Only add ACF if not already set (ACF REST API might have already set it)
        if (!isset($response->data['acf']) || empty($response->data['acf'])) {
            $acf_data = [];
            $field_groups = acf_get_field_groups(['post_type' => 'product']);

            foreach ($field_groups as $group) {
                $fields = acf_get_fields($group);

                if ($fields) {
                    foreach ($fields as $field) {
                        $acf_data[$field['name']] = get_field($field['key'], $product->get_id());
                    }
                }
            }

            $response->data['acf'] = $acf_data;
        }

        return $response;
    },
    10,
    3
);

/**
 * Breadcrumb for single product
 */
function afs_get_deepest_category($product_id) {

    $terms = wp_get_post_terms($product_id, 'product_cat');

    if (empty($terms) || is_wp_error($terms)) {
        return null;
    }

    $deepest   = null;
    $max_depth = -1;

    foreach ($terms as $term) {
        $depth  = 0;
        $parent = $term->parent;

        while ($parent) {
            $parent_term = get_term($parent, 'product_cat');
            if (!$parent_term || is_wp_error($parent_term)) {
                break;
            }
            $depth++;
            $parent = $parent_term->parent;
        }

        if ($depth > $max_depth) {
            $max_depth = $depth;
            $deepest   = $term;
        }
    }

    return $deepest;
}

/**
 * Build product breadcrumb (Woo-style)
 */
function afs_get_product_breadcrumb($product_id) {

    $primary = (int) get_post_meta($product_id, '_primary_category', true);

    if (!$primary) {
        $deepest = afs_get_deepest_category($product_id);
        $primary = $deepest ? (int) $deepest->term_id : 0;
    }

    if (!$primary) {
        return [];
    }

    $breadcrumb = [];

    while ($primary) {
        $term = get_term($primary, 'product_cat');
        if (!$term || is_wp_error($term)) {
            break;
        }

        $term_link = get_term_link($term);

        if (!is_wp_error($term_link)) {

            $term_link = wp_make_link_relative($term_link);

            $permalinks = get_option('woocommerce_permalinks');
            $cat_base   = !empty($permalinks['category_base'])
                ? '/' . trim($permalinks['category_base'], '/')
                : '/product-category';

            // Remove language prefix
            $term_link = preg_replace('#^/[a-z]{2}#', '', $term_link);

            // Remove category base
            $term_link = preg_replace('#^' . preg_quote($cat_base, '#') . '#', '', $term_link);
        }

        array_unshift($breadcrumb, [
            'id'   => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'url'  => $term_link ?: ''
        ]);

        $primary = (int) $term->parent;
    }

    return $breadcrumb;
}



/**
 * Inject breadcrumb into Woo product REST API
 */
add_action('rest_api_init', function () {

    register_rest_field('product', 'breadcrumb', [
        'get_callback' => function ($product) {

            if (empty($product['id'])) {
                return [];
            }

            return afs_get_product_breadcrumb((int) $product['id']);
        },
        'schema' => [
            'description' => 'Woo-style product breadcrumb',
            'type'        => 'array',
            'context'     => ['view', 'edit'],
        ],
    ]);

});

/**
 * custom api with TTC
 */
/**
 * custom api with TTC
 */
add_action('rest_api_init', function () {
    if (!class_exists('WooCommerce')) return;

    register_rest_route('afs/v1', '/products', [
        'methods'             => 'GET',
        'callback'            => 'afs_get_products',
        'permission_callback' => '__return_true',
        'args' => [
            'category'          => [],
            'min_price'         => [],
            'max_price'         => [],
            'page'              => [],
            'per_page'          => [],
            'shipping_country'  => [],
            'shipping_state'    => [],
            'shipping_postcode' => [],
            'currency'          => [],
            'search'            => [],
            'slug'              => [],
        ],
    ]);
});


function afs_get_products(WP_REST_Request $request) {
    global $wpdb;

    /* ------------------- 1. PREPARE ------------------- */
    $lang     = apply_filters('wpml_current_language', null);
    $search   = trim((string) $request->get_param('search'));
    $slug     = trim((string) $request->get_param('slug'));
    $page     = max(1, (int) $request->get_param('page'));
    $per_page = min(100, max(1, (int) $request->get_param('per_page')));
    $offset   = ($page - 1) * $per_page;

    $min_price = $request->get_param('min_price');
    $max_price = $request->get_param('max_price');

    $category_param = (string) $request->get_param('category');
    $categories = $category_param ? array_map('intval', explode(',', $category_param)) : [];






    /* ------------------- 2. CUSTOMER / TAX / GEO ------------------- */
    if (function_exists('wc_load_cart')) wc_load_cart();

    if (!WC()->customer) {
        WC()->customer = new WC_Customer(0);
    }

    $user_id = get_current_user_id();

    if ($user_id) {
        $shipping_country  = get_user_meta($user_id, 'shipping_country', true);
        $shipping_state    = get_user_meta($user_id, 'shipping_state', true);
        $shipping_postcode = get_user_meta($user_id, 'shipping_postcode', true);
    } else {
        $shipping_country = $shipping_state = $shipping_postcode = '';
    }

    $req_country  = $request->get_param('shipping_country');
    $req_state    = $request->get_param('shipping_state');
    $req_postcode = $request->get_param('shipping_postcode');

    if ($req_country !== null) {
        if ($req_country === '' || $req_country === 'null') {
            $geo = WC_Geolocation::geolocate_ip();
            if (!empty($geo['country'])) {
                $shipping_country  = $geo['country'];
                $shipping_state    = $geo['state'] ?? '';
                $shipping_postcode = '';
            }
        } else {
            $shipping_country  = strtoupper($req_country);
            $shipping_state    = $req_state ?: '';
            $shipping_postcode = $req_postcode ?: '';
        }
    } elseif (!$shipping_country) {
        $geo = WC_Geolocation::geolocate_ip();
        if (!empty($geo['country'])) {
            $shipping_country  = $geo['country'];
            $shipping_state    = $geo['state'] ?? '';
            $shipping_postcode = '';
        }
    }

    WC()->customer->set_is_vat_exempt(false);
    WC()->customer->set_shipping_country($shipping_country);
    WC()->customer->set_shipping_state($shipping_state);
    WC()->customer->set_shipping_postcode($shipping_postcode);










    /* ------------------- 3. WPML CATEGORY ------------------- */
    if ($categories && function_exists('icl_object_id')) {
        $categories = array_filter(array_map(function ($cat_id) use ($lang) {
            return apply_filters('wpml_object_id', $cat_id, 'product_cat', true, $lang);
        }, $categories));
    }

    /* ------------------- 4. WCML CURRENCY ------------------- */
    $currency = strtoupper((string) $request->get_param('currency'));

    if ($currency && defined('WCML_VERSION')) {
        add_filter('wcml_client_currency', function() use ($currency) { return $currency; }, 999);
        add_filter('woocommerce_currency', function() use ($currency) { return $currency; }, 999);

        global $woocommerce_wpml;
        if (isset($woocommerce_wpml->multi_currency)) {
            $woocommerce_wpml->multi_currency->set_client_currency($currency);
        }

        if (function_exists('wc_clear_notices')) wc_clear_notices();
    }

    /* ------------------- 5. CACHE ------------------- */
    $cache_key = md5(serialize([
        'lang'     => $lang,
        'params'   => $request->get_params(),
        'shipping' => [$shipping_country, $shipping_state, $shipping_postcode],
        'currency' => $currency,
    ]));

    if (($cached = wp_cache_get($cache_key, 'afs_products')) !== false) {
        return rest_ensure_response($cached);
    }

    /* ------------------- 6. QUERY BUILD ------------------- */
    $where = ["p.post_type = 'product'", "p.post_status = 'publish'"];
    $join  = [];
    $args  = [];

    if (defined('ICL_SITEPRESS_VERSION')) {
        $join[] = "INNER JOIN {$wpdb->prefix}icl_translations icl
                   ON p.ID = icl.element_id
                   AND icl.element_type = 'post_product'
                   AND icl.language_code = %s";
        $args[] = $lang;
    }

    if ($slug !== '') { // filter by slug
        $where[] = "p.post_name = %s";
        $args[]  = sanitize_title($slug);
    }

    if ($min_price !== null || $max_price !== null) {
        $join[] = "INNER JOIN {$wpdb->prefix}wc_product_meta_lookup wc ON p.ID = wc.product_id";
    }

    if ($min_price !== null) { $where[] = "wc.max_price >= %f"; $args[] = (float) $min_price; }
    if ($max_price !== null) { $where[] = "wc.min_price <= %f"; $args[] = (float) $max_price; }

    if ($categories && $slug === '') {
        $placeholders = implode(',', array_fill(0, count($categories), '%d'));
        $join[] = "INNER JOIN {$wpdb->term_relationships} tr ON p.ID = tr.object_id";
        $join[] = "INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id";
        $where[] = "tt.taxonomy = 'product_cat' AND tt.term_id IN ($placeholders)";
        $args   = array_merge($args, $categories);
    }

    /* ------------------- SEARCH ------------------- */
    if ($search !== '' && $slug === '') {
        $clean = strtolower(preg_replace('/[^a-z0-9\s\-]/i', ' ', $search));
        $terms = array_filter(array_unique(explode(' ', $clean)));

        $join[] = "LEFT JOIN {$wpdb->postmeta} sku
                   ON p.ID = sku.post_id AND sku.meta_key = '_sku'";

        $or = [];
        foreach ($terms as $term) {
            $like = '%' . $wpdb->esc_like($term) . '%';
            $or[] = "p.post_title LIKE %s";   $args[] = $like;
            $or[] = "p.post_name LIKE %s";    $args[] = $like;
            $or[] = "sku.meta_value LIKE %s"; $args[] = $like;
        }

        $where[] = '(' . implode(' OR ', $or) . ')';
    }

    $join_sql  = implode(' ', $join);
    $where_sql = 'WHERE ' . implode(' AND ', $where);

    /* ------------------- 7. FETCH IDS ------------------- */
    $ids = $wpdb->get_col($wpdb->prepare(
        "SELECT DISTINCT p.ID
         FROM {$wpdb->posts} p
         {$join_sql}
         {$where_sql}
         ORDER BY p.post_date DESC
         LIMIT %d OFFSET %d",
        array_merge($args, [$per_page, $offset])
    ));

    if (!$ids) {
        return rest_ensure_response(['data' => [], 'pagination' => compact('page', 'per_page') + ['total' => 0, 'totalPages' => 0]]);
    }

    $total = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(DISTINCT p.ID)
         FROM {$wpdb->posts} p
         {$join_sql}
         {$where_sql}",
        $args
    ));

    /* ------------------- 8. RESPONSE ------------------- */
    $products = [];

    foreach ($ids as $id) {
        $product = wc_get_product($id);
        if (!$product) continue;

        if ($product->is_type('variable')) {
            // For variable products: get min price with and without tax from variations
            // get_variation_price('min', true) returns minimum price WITH tax (TTC)
            // get_variation_price('min', false) returns minimum price WITHOUT tax (HT)
            $price_incl_tax = $product->get_variation_price('min', true); // TTC
            $price_excl_tax = $product->get_variation_price('min', false); // HT
            $display_price = $price_incl_tax; // Use TTC for display (will be adjusted by frontend based on location)
            $price_html    = sprintf(__('From %s', 'woocommerce'), wc_price($display_price));
        } else {
            // For simple products: use standard WooCommerce functions
            $price_excl_tax = wc_get_price_excluding_tax($product);
            $price_incl_tax = wc_get_price_including_tax($product);
            $display_price = wc_get_price_to_display($product, ['price' => $product->get_price(), 'qty' => 1]);
            $price_html    = wc_price($display_price);
        }

        // --- ACF image and bestseller
        $img = $bestseller = null;
        if (function_exists('get_field')) {
            $img_id = get_field('img', $id, false);
            $img = $img_id ? wp_get_attachment_image_url($img_id, 'full') : null;
            $bestseller = get_field('bestseller', $id, false);
        }

        $products[] = [
            'id'             => $id,
            'name'           => $product->get_name(),
            'slug'           => $product->get_slug(),
            'permalink'      => get_permalink($id),
            'featured_img'   => wp_get_attachment_url($product->get_image_id()),
            'price_excl_tax' => $price_excl_tax,
            'price_incl_tax' => $price_incl_tax,
            'price'          => $display_price,
            'price_html'     => $price_html,
            'type'           => $product->get_type(), // 'simple' or 'variable'
            'img'        => $img,
            'bestseller'     => $bestseller,
        ];
    }

    $response = [
        'data' => $products,
        'pagination' => [
            'page' => $page,
            'per_page' => $per_page,
            'total' => $total,
            'totalPages' => (int) ceil($total / $per_page),
        ]
    ];

    wp_cache_set($cache_key, $response, 'afs_products', 300);
    return rest_ensure_response($response);
}

/**
 * test wcml
 */
add_action( 'rest_api_init', function () {
    register_rest_route( 'custom/v1', '/products', [
        'methods'             => 'GET',
        'callback'            => 'afs_custom_products_api',
        'permission_callback' => '__return_true',
        'args'                => [
            'currency' => [
                'required' => false,
                'default'  => 'EUR',
            ],
        ],
    ] );
} );

function afs_custom_products_api( WP_REST_Request $request ) {
    $currency = strtoupper( $request->get_param( 'currency' ) ?: 'EUR' );
    $allowed  = [ 'EUR', 'USD', 'GBP' ];

    if ( ! in_array( $currency, $allowed, true ) ) {
        $currency = 'EUR';
    }

    global $woocommerce_wpml;
    if ( $woocommerce_wpml && isset( $woocommerce_wpml->multi_currency ) ) {
        $woocommerce_wpml->multi_currency->set_client_currency( $currency );
    }

    // force WCML cookie
    if ( ! headers_sent() ) {
        setcookie( 'wcml_client_currency', $currency, time() + 86400, '/' );
    }
    $_COOKIE['wcml_client_currency'] = $currency;

    $products = wc_get_products([
        'status' => 'publish',
        'limit'  => -1,
    ]);

    $response = [];

    foreach ( $products as $product ) {

        $price = null;

        if ( $product->is_type( 'simple' ) ) {
            // 🔑 force reload price after WCML currency is set
            $price = (float) wc_get_price_to_display( $product );
        }

        if ( $product->is_type( 'variable' ) ) {
            // 🔑 get min price in current currency
            $price = (float) $product->get_variation_price( 'min', true );
        }

        if ( $price === null || $price <= 0 ) {
            continue;
        }

        $response[] = [
            'id'       => $product->get_id(),
            'slug'     => $product->get_slug(),
            'name'     => $product->get_name(),
            'price'    => (int) round( $price * 100 ),
            'currency' => $currency,
        ];
    }

    return rest_ensure_response( $response );
}

/**
 * Headless Multi-location API Bridge
 */
/**
 * FINAL SYNC: France (2682) as Default | USA (2683) | No Combined Stock | Order Sync
 */

// --- 1. DISPLAY LOGIC (GET) ---
add_filter('woocommerce_rest_prepare_product_object', 'afs_niloy_master_logic', 9999, 3);
add_filter('woocommerce_rest_prepare_product_variation_object', 'afs_niloy_master_logic', 9999, 3);

function afs_niloy_master_logic($response, $post, $request) {
    $france_id = 2682; // France ID

    // Lấy location từ tham số, nếu không có thì mặc định là France
    $location_id = $request->get_param('location') ?: $france_id;

    $data = $response->get_data();
    $product_id = $data['id'];

    // Luôn lấy kho từ đúng ID chi nhánh trong Meta
    $stock_key = 'wcmlim_stock_at_' . $location_id;
    $location_stock = get_post_meta($product_id, $stock_key, true);

    // ÉP BUỘC GHI ĐÈ: Không cho phép cộng dồn
    $final_qty = ($location_stock !== '') ? (int)$location_stock : 0;

    $data['manage_stock']   = true;
    $data['stock_quantity'] = $final_qty;
    $data['stock_status']   = ($final_qty > 0) ? 'instock' : 'outofstock';

    $response->set_data($data);
    return $response;
}

// --- 2. UPDATE LOGIC (PUT) ---
add_action('woocommerce_rest_insert_product_object', 'afs_niloy_master_update', 10, 3);
add_action('woocommerce_rest_insert_product_variation_object', 'afs_niloy_master_update', 10, 3);

function afs_niloy_master_update($product, $request, $creating) {
    $location_id = $request->get_param('location');
    $params = $request->get_params();

    if (!empty($location_id) && isset($params['stock_quantity'])) {
        $id = $product->get_id();
        $new_stock = (int)$params['stock_quantity'];
        update_post_meta($id, 'wcmlim_stock_at_' . $location_id, $new_stock);
        update_post_meta($id, 'wcmlim_stock_available_at_' . $location_id, $new_stock);
        $product->set_manage_stock(true);
        $product->save();
    }
}

// --- 3. ORDER LOGIC (Deduct stock on order) ---
add_action('woocommerce_checkout_order_processed', 'afs_niloy_master_order_sync', 10, 3);
function afs_niloy_master_order_sync($order_id, $posted_data, $order) {
    $location_id = $order->get_meta('location_id') ?: 2682;
    foreach ($order->get_items() as $item) {
        $id = $item->get_variation_id() ?: $item->get_product_id();
        $qty = $item->get_quantity();
        $current_stock = (int)get_post_meta($id, 'wcmlim_stock_at_' . $location_id, true);
        $new_val = $current_stock - $qty;
        update_post_meta($id, 'wcmlim_stock_at_' . $location_id, $new_val);
        update_post_meta($id, 'wcmlim_stock_available_at_' . $location_id, $new_val);
    }
}

/**
 * Hide unwanted col for woo product panel admin
 */
add_action('admin_head', function () {
    echo '
    <style>
        td.price_at_locations.column-price_at_locations, td.stock_at_locations.column-stock_at_locations, th#stock_at_locations, th#price_at_locations, th#rank_math_seo_details, td.rank_math_seo_details.column-rank_math_seo_details, td.taxonomy-product_brand.column-taxonomy-product_brand, th#taxonomy-product_brand {
            display: none;
        }
    </style>
    ';
});

/**
 * Store API Tax Calculation Enhancement
 */
/**
 * Store API Tax Calculation Enhancement
 *
 * This hook ensures taxes are calculated correctly in the WooCommerce Store API
 * based on the customer's shipping address.
 *
 * IMPORTANT: This requires tax rates to be configured in WooCommerce:
 * WooCommerce > Settings > Tax > Standard Rates
 *
 * For US taxes, you need to either:
 * 1. Manually add tax rates for each state
 * 2. Use a plugin like WooCommerce Tax, TaxJar, or Avalara
 */
add_action('woocommerce_store_api_checkout_update_customer_from_request', function($customer, $request) {
    // Ensure customer address is set for tax calculation
    $billing = $request->get_param('billing_address');
    $shipping = $request->get_param('shipping_address');

    if ($shipping && !empty($shipping['country'])) {
        $customer->set_shipping_country($shipping['country']);
        $customer->set_shipping_state($shipping['state'] ?? '');
        $customer->set_shipping_postcode($shipping['postcode'] ?? '');
        $customer->set_shipping_city($shipping['city'] ?? '');
    } elseif ($billing && !empty($billing['country'])) {
        $customer->set_shipping_country($billing['country']);
        $customer->set_shipping_state($billing['state'] ?? '');
        $customer->set_shipping_postcode($billing['postcode'] ?? '');
        $customer->set_shipping_city($billing['city'] ?? '');
    }

    // Also update billing for tax calculation
    if ($billing && !empty($billing['country'])) {
        $customer->set_billing_country($billing['country']);
        $customer->set_billing_state($billing['state'] ?? '');
        $customer->set_billing_postcode($billing['postcode'] ?? '');
        $customer->set_billing_city($billing['city'] ?? '');
    }

    // Recalculate totals
    if (WC()->cart) {
        WC()->cart->calculate_totals();
    }

    // Log for debugging
    error_log('[AFS Store API] Customer address updated - Country: ' . $customer->get_shipping_country() . ', State: ' . $customer->get_shipping_state());

}, 10, 2);

/**
 * Force tax recalculation on cart update-customer endpoint
 */
add_action('woocommerce_store_api_cart_update_customer_from_request', function($customer, $request) {
    // Get addresses from request
    $billing = $request->get_param('billing_address');
    $shipping = $request->get_param('shipping_address');

    // Update customer shipping address (used for tax calculation)
    if ($shipping && !empty($shipping['country'])) {
        $customer->set_shipping_country($shipping['country']);
        $customer->set_shipping_state($shipping['state'] ?? '');
        $customer->set_shipping_postcode($shipping['postcode'] ?? '');
        $customer->set_shipping_city($shipping['city'] ?? '');

        error_log('[AFS Store API Cart] Shipping address set - Country: ' . $shipping['country'] . ', State: ' . ($shipping['state'] ?? 'N/A'));
    }

    // Update customer billing address
    if ($billing && !empty($billing['country'])) {
        $customer->set_billing_country($billing['country']);
        $customer->set_billing_state($billing['state'] ?? '');
        $customer->set_billing_postcode($billing['postcode'] ?? '');
        $customer->set_billing_city($billing['city'] ?? '');

        // If no shipping address, use billing for tax calculation
        if (!$shipping || empty($shipping['country'])) {
            $customer->set_shipping_country($billing['country']);
            $customer->set_shipping_state($billing['state'] ?? '');
            $customer->set_shipping_postcode($billing['postcode'] ?? '');
            $customer->set_shipping_city($billing['city'] ?? '');
        }

        error_log('[AFS Store API Cart] Billing address set - Country: ' . $billing['country'] . ', State: ' . ($billing['state'] ?? 'N/A'));
    }

    // Force tax recalculation
    $customer->set_is_vat_exempt(false);

    // Recalculate cart totals with new address
    if (WC()->cart) {
        WC()->cart->calculate_totals();
        error_log('[AFS Store API Cart] Cart totals recalculated - Total Tax: ' . WC()->cart->get_total_tax());
    }

}, 10, 2);

/**
 * Debug: Log tax rates being applied
 */
add_action('woocommerce_before_calculate_totals', function($cart) {
    if (!WC()->customer) return;

    $country = WC()->customer->get_shipping_country();
    $state = WC()->customer->get_shipping_state();

    // Get applicable tax rates
    $tax_rates = WC_Tax::get_rates_for_tax_class('');

    error_log('[AFS Tax Debug] Customer Country: ' . $country . ', State: ' . $state);
    error_log('[AFS Tax Debug] Available tax rates count: ' . count($tax_rates));

    foreach ($tax_rates as $rate) {
        if ($rate->tax_rate_country === $country || $rate->tax_rate_country === '') {
            error_log('[AFS Tax Debug] Matching rate: ' . $rate->tax_rate_name . ' - ' . $rate->tax_rate . '% for ' . $rate->tax_rate_country . '/' . $rate->tax_rate_state);
        }
    }
}, 5);

/**
 * Get products (simple) with tax - price_incl_tax field
 */
/**
 * Get products (simple) with tax - price_incl_tax field
 */
add_action('rest_api_init', function () {

    register_rest_field(
        'product',
        'price_incl_tax',
        array(
            'get_callback' => function ($product_arr) {

                if (!class_exists('WooCommerce')) return null;
                if (function_exists('wc_load_cart')) wc_load_cart();

                if (!WC()->customer) {
                    WC()->customer = new WC_Customer(0);
                }

                $product_obj = wc_get_product($product_arr['id']);
                if (!$product_obj) return null;

                // IMPORTANT: Get price EXCLUDING tax first to avoid double taxation
                // WooCommerce may store prices WITH tax included (common in France)
                // So we need to get the base price without tax, then recalculate with correct country's tax
                $price = (float) wc_get_price_excluding_tax($product_obj);

                /* ---------------- TAX / GEO LOGIC ---------------- */

                $shipping_country  = '';
                $shipping_state    = '';
                $shipping_postcode = '';

                $req_country  = isset($_GET['shipping_country']) ? sanitize_text_field($_GET['shipping_country']) : null;
                $req_state    = isset($_GET['shipping_state']) ? sanitize_text_field($_GET['shipping_state']) : '';
                $req_postcode = isset($_GET['shipping_postcode']) ? sanitize_text_field($_GET['shipping_postcode']) : '';

                if ($req_country !== null) {
                    if ($req_country === '' || $req_country === 'null') {
                        if (class_exists('WC_Geolocation')) {
                            $geo = WC_Geolocation::geolocate_ip();
                            if (!empty($geo['country'])) {
                                $shipping_country = $geo['country'];
                                $shipping_state   = $geo['state'] ?? '';
                            }
                        }
                    } else {
                        $shipping_country  = strtoupper($req_country);
                        $shipping_state    = $req_state ?: '';
                        $shipping_postcode = $req_postcode ?: '';
                    }
                } else {
                    if (class_exists('WC_Geolocation')) {
                        $geo = WC_Geolocation::geolocate_ip();
                        if (!empty($geo['country'])) {
                            $shipping_country = $geo['country'];
                            $shipping_state   = $geo['state'] ?? '';
                        }
                    }
                }

                if (!$shipping_country) {
                    $shipping_country = WC()->countries->get_base_country();
                    $shipping_state   = WC()->countries->get_base_state();
                }

                WC()->customer->set_is_vat_exempt(false);
                WC()->customer->set_shipping_country($shipping_country);
                WC()->customer->set_shipping_state($shipping_state);
                WC()->customer->set_shipping_postcode($shipping_postcode);

                /* ---------------- CALCULATE TAX ---------------- */

                $price_incl_tax = wc_get_price_including_tax($product_obj, array(
                    'price' => $price,
                    'qty'   => 1,
                ));

                return round($price_incl_tax, 4);
            },
            'schema' => null,
        )
    );
});

/**
 * Replace site URLs with HEADLESS_URL in emails
 * Uses HEADLESS_URL constant from wp-config.php
 */
add_filter('site_url', 'afs_replace_url_in_emails', 999, 4);
add_filter('home_url', 'afs_replace_url_in_emails', 999, 4);

function afs_replace_url_in_emails($url, $path, $scheme, $blog_id) {
    // Safety check: return early if URL is empty or not a string
    if (empty($url) || !is_string($url)) {
        return $url;
    }
    
    // Only replace URLs when sending emails
    if (!afs_is_email_context()) {
        return $url;
    }
    
    // Check if HEADLESS_URL is defined
    if (!defined('HEADLESS_URL') || empty(HEADLESS_URL)) {
        return $url;
    }
    
    // Safety check: ensure blog_id is valid
    if ($blog_id === null) {
        $blog_id = get_current_blog_id();
    }
    
    try {
        $current_site_url = untrailingslashit(get_site_url($blog_id));
        $headless_url = untrailingslashit(HEADLESS_URL);
        
        // Only replace if URLs are different and valid
        if ($current_site_url && $headless_url && $current_site_url !== $headless_url) {
            return str_replace($current_site_url, $headless_url, $url);
        }
    } catch (Exception $e) {
        // Log error but don't break the site
        error_log('AFS URL replacement error: ' . $e->getMessage());
    }
    
    return $url;
}

/**
 * Detect if we're in an email sending context
 */
function afs_is_email_context() {
    // Safety check: ensure WordPress is fully loaded
    if (!function_exists('did_action') || !function_exists('doing_action') || !function_exists('doing_filter')) {
        return false;
    }
    
    // Check WooCommerce email actions
    if (did_action('woocommerce_email_header') || 
        did_action('woocommerce_email_footer') ||
        doing_action('woocommerce_email_header') ||
        doing_action('woocommerce_email_footer')) {
        return true;
    }
    
    // Check WordPress email actions
    if (did_action('phpmailer_init') || 
        doing_action('phpmailer_init')) {
        return true;
    }
    
    // Check if we're filtering email content
    $filters = [
        'woocommerce_email_heading',
        'woocommerce_email_message',
        'woocommerce_email_footer_text',
        'wp_mail',
        'wp_mail_content_type',
    ];
    
    foreach ($filters as $filter) {
        if (doing_filter($filter) || did_action($filter)) {
            return true;
        }
    }
    
    return false;
}
