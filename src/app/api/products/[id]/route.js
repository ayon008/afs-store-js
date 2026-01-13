import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLocaleValue, getCurrency, getLocation } from "@/app/actions/Woo-Coommerce/getWooCommerce";
import { WAREHOUSES, calculatePriceWithVat } from "@/lib/countries-config";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const localeValue = await getLocaleValue();
        const currency = await getCurrency();
        const location = await getLocation() || WAREHOUSES.EUROPE; // Default to Europe
        const WP_URL = `${process.env.WP_BASE_URL}`;

        // Determine if we should show prices with tax included (Europe) or excluded (North America)
        const isEuropeLocation = location === WAREHOUSES.EUROPE;

        // Get selected country from cookies for tax calculation
        // Priority: 1. Cookie selected_country, 2. Default based on location (FR for Europe, US for North America)
        const cookieStore = await cookies();
        const selectedCountryCookie = cookieStore.get('selected_country')?.value;
        const selectedCountry = selectedCountryCookie || (isEuropeLocation ? 'FR' : 'US');

        const authHeader = "Basic " + Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

        // Get product details with location parameter
        const productUrl = `${WP_URL}/wp-json/wc/v3/products/${id}?currency=${currency}&lang=${localeValue || ''}&location=${location}`;
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
        // Include shipping_country for tax calculation via PHP price_incl_tax field
        let variations = [];
        if (product.type === 'variable') {
            const variationsUrl = `${WP_URL}/wp-json/wc/v3/products/${id}/variations?per_page=100&currency=${currency}&lang=${localeValue || ''}&location=${location}&shipping_country=${selectedCountry}`;
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

        // Calculate product price based on location
        // Europe (2682): Show price with tax (TTC)
        // North America (2683): Show price without tax (HT)
        // IMPORTANT: No hardcoded tax percentage - rely on WooCommerce or VAT helper
        const basePrice = parseFloat(product.price) || 0;
        const priceExclTax = basePrice;

        // price_incl_tax peut être absent ou mal calculé côté WooCommerce pour certains pays.
        // Pour l'Europe, on s'assure d'avoir un TTC correct via calculatePriceWithVat.
        let rawPriceInclTax = parseFloat(product.price_incl_tax);
        let priceInclTax;

        if (isEuropeLocation) {
            if (!isNaN(rawPriceInclTax) && rawPriceInclTax > 0) {
                // WooCommerce fournit déjà un TTC exploitable
                priceInclTax = rawPriceInclTax;
            } else {
                // Recalcule TTC à partir du HT et du pays sélectionné (ex: FR → 20%)
                priceInclTax = calculatePriceWithVat(priceExclTax, selectedCountry);
            }
        } else {
            // Hors Europe, garder la valeur WooCommerce si présente, sinon fallback sur HT
            priceInclTax = !isNaN(rawPriceInclTax) && rawPriceInclTax > 0
                ? rawPriceInclTax
                : priceExclTax;
        }

        console.log(`[API Products] Product ${id}:`, {
            basePrice,
            priceInclTax,
            priceExclTax,
            location,
            isEuropeLocation,
            selectedCountry,
            hasPriceInclTax: !!product.price_incl_tax
        });

        // For display: Europe shows TTC, North America shows HT
        const displayPrice = isEuropeLocation ? priceInclTax : priceExclTax;

        // Format response
        const response = {
            id: product.id,
            name: product.name,
            // Main price field: TTC for Europe, HT for North America
            price: displayPrice,
            price_excl_tax: priceExclTax,
            price_incl_tax: priceInclTax,
            price_with_tax: priceInclTax, // Always TTC (tax included) - used by frontend for Europe location
            regular_price: parseFloat(product.regular_price) || 0,
            sale_price: parseFloat(product.sale_price) || 0,
            images: product.images || [],
            image: product.images?.[0]?.src || '',
            stock_status: product.stock_status || 'instock',
            stock_quantity: product.stock_quantity || null,
            type: product.type,
            currency: currencyCode, // Include currency in response
            location: location, // Include location for frontend reference
            is_tax_included: isEuropeLocation, // Indicate if tax is included in price
            // Include ACF fields from WooCommerce API
            acf: product.acf || {},
            // Include product attributes with their slugs for reference
            attributes: (product.attributes || []).map(attr => ({
                id: attr.id,
                name: attr.name,
                slug: attr.slug || `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`,
                options: attr.options || [],
                variation: attr.variation || false,
            })),
            variations: variations.map(v => {
                // Use price_incl_tax from WooCommerce API when available.
                // If missing for Europe, recalc TTC with VAT helper.
                const vBasePrice = parseFloat(v.price) || 0;
                const vPriceExclTax = vBasePrice;

                let vRawPriceInclTax = parseFloat(v.price_incl_tax);
                let vPriceInclTax;

                if (isEuropeLocation) {
                    if (!isNaN(vRawPriceInclTax) && vRawPriceInclTax > 0) {
                        vPriceInclTax = vRawPriceInclTax;
                    } else {
                        vPriceInclTax = calculatePriceWithVat(vPriceExclTax, selectedCountry);
                    }
                } else {
                    vPriceInclTax = !isNaN(vRawPriceInclTax) && vRawPriceInclTax > 0
                        ? vRawPriceInclTax
                        : vPriceExclTax;
                }
                const vDisplayPrice = isEuropeLocation ? vPriceInclTax : vPriceExclTax;

                // Log for debugging
                if (v.price_incl_tax) {
                    console.log(`[API Products] Variation ${v.id}: price=${vBasePrice}, price_incl_tax=${v.price_incl_tax}`);
                }

                return {
                    id: v.id,
                    // Main price field: TTC for Europe, HT for North America
                    price: vDisplayPrice,
                    price_excl_tax: vPriceExclTax,
                    price_incl_tax: vPriceInclTax,
                    price_with_tax: vPriceInclTax, // Always TTC (tax included) - used by frontend for Europe location
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
                };
            }),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to fetch product'
        }, { status: 500 });
    }
}

