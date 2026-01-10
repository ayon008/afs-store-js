import { NextResponse } from "next/server";
import { getLocaleValue, getCurrency } from "@/app/actions/Woo-Coommerce/getWooCommerce";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const localeValue = await getLocaleValue();
        const currency = await getCurrency();
        const WP_URL = `${process.env.WP_BASE_URL}`;

        const authHeader = "Basic " + Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

        // Get product details
        const productUrl = `${WP_URL}/wp-json/wc/v3/products/${id}?currency=${currency}&lang=${localeValue || ''}`;
        const productResponse = await fetch(productUrl, {
            headers: {
                Authorization: authHeader
            },
            cache: "no-store",
        });

        if (!productResponse.ok) {
            throw new Error(`Failed to fetch product: ${productResponse.status}`);
        }

        const product = await productResponse.json();

        // Get variations if it's a variable product
        let variations = [];
        if (product.type === 'variable') {
            const variationsUrl = `${WP_URL}/wp-json/wc/v3/products/${id}/variations?per_page=100&currency=${currency}&lang=${localeValue || ''}`;
            const variationsResponse = await fetch(variationsUrl, {
                headers: {
                    Authorization: authHeader
                },
                cache: "no-store",
            });

            if (variationsResponse.ok) {
                variations = await variationsResponse.json();
            }
        }

        // Create a map from attribute display name/id to slug
        // Product attributes contain: { id, name, slug, options, variation }
        const attributeSlugMap = {};
        if (product.attributes && Array.isArray(product.attributes)) {
            product.attributes.forEach(attr => {
                // Map by id
                if (attr.id) {
                    attributeSlugMap[`id_${attr.id}`] = attr.slug || `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`;
                }
                // Map by display name (case-insensitive)
                if (attr.name) {
                    attributeSlugMap[attr.name.toLowerCase()] = attr.slug || `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`;
                }
            });
        }

        // Convert currency from cookie format (euro/usd/gbp) to currency code (EUR/USD/GBP)
        const currencyCode = currency === 'euro' ? 'EUR' : currency === 'usd' ? 'USD' : currency === 'gbp' ? 'GBP' : 'EUR';

        // Format response
        const response = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            price_with_tax: parseFloat(product.price) * 1.2 || 0, // 20% VAT (can be made dynamic)
            regular_price: parseFloat(product.regular_price) || 0,
            sale_price: parseFloat(product.sale_price) || 0,
            images: product.images || [],
            image: product.images?.[0]?.src || '',
            stock_status: product.stock_status || 'instock',
            stock_quantity: product.stock_quantity || null,
            type: product.type,
            currency: currencyCode, // Include currency in response
            // Include product attributes with their slugs for reference
            attributes: (product.attributes || []).map(attr => ({
                id: attr.id,
                name: attr.name,
                slug: attr.slug || `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`,
                options: attr.options || [],
                variation: attr.variation || false,
            })),
            variations: variations.map(v => ({
                id: v.id,
                price: parseFloat(v.price) || 0,
                price_with_tax: parseFloat(v.price) * 1.2 || 0,
                // Enrich variation attributes with slug for WooCommerce Store API compatibility
                attributes: (v.attributes || []).map(attr => {
                    // Try to find the slug from our map
                    const slugById = attr.id ? attributeSlugMap[`id_${attr.id}`] : null;
                    const slugByName = attr.name ? attributeSlugMap[attr.name.toLowerCase()] : null;
                    const slug = slugById || slugByName || (attr.name ? `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}` : '');
                    return {
                        id: attr.id,
                        name: attr.name,       // Display name (e.g., "Taille", "Size")
                        slug: slug,            // Taxonomy slug (e.g., "pa_taille", "pa_size")
                        option: attr.option,   // Selected value (e.g., "3.0m2")
                    };
                }),
                stock_status: v.stock_status || 'instock',
                stock_quantity: v.stock_quantity || null,
            })),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to fetch product'
        }, { status: 500 });
    }
}

