'use server';
import { getAuthenticatedUser } from "../WC/Auth/getAuth";
import { getWooCommerceCookies } from "./Cookies/cookie-handler";
import { getCart } from "./Shop/Cart/cart";
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET
const authHeader = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");





export const calculatePriceWithTax = async (basePrice, tax_class = "standard", country = null) => {
    try {
        // Get user country from shipping/billing address, default to France
        const cookieHeader = await getWooCommerceCookies();
        let userCountry = country;
        const cart = await getCart(cookieHeader);
        const defaultCountry = cart?.data?.shipping_address?.country || cart?.data?.billing_address?.country || "FR";

        if (!userCountry) {
            const user = await getAuthenticatedUser();
            if (user) {
                userCountry = user.shipping?.country || user.billing?.country || defaultCountry;
            } else {
                userCountry = defaultCountry;
            }
        }

        // Fetch all tax rates (paginated)
        const per_page = 100;
        let page = 1;
        let allTaxRates = [];

        while (true) {
            const response = await fetch(
                `${process.env.WP_BASE_URL}/wp-json/wc/v3/taxes?per_page=${per_page}&page=${page}`,
                {
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                        'Content-Type': 'application/json',
                    },
                    cache: "no-cache"
                }
            );

            if (!response.ok) throw new Error('Failed to fetch tax rates');

            const taxes = await response.json();
            if (!Array.isArray(taxes) || taxes.length === 0) break;

            allTaxRates.push(...taxes);
            if (taxes.length < per_page) break;
            page++;
        }

        // Normalize tax_class (same logic as getUserTaxRate)
        const normalizedTaxClass = (!tax_class || tax_class === "" || tax_class === "standard")
            ? "standard"
            : tax_class.toLowerCase();

        // Find matching tax rate by country AND tax_class
        const matchingTax = allTaxRates.find(rate => {
            const rateCountry = rate?.country?.toLowerCase() || "";
            const rateClass = rate?.class?.toLowerCase() || "standard";

            // Match country (case-insensitive)
            const countryMatch = rateCountry === userCountry.toLowerCase();

            // Match tax class (WooCommerce stores standard class as empty string)
            const classMatch = (normalizedTaxClass === "standard" && (rateClass === "" || rateClass === "standard"))
                || rateClass === normalizedTaxClass;

            return countryMatch && classMatch;
        });

        // Calculate and apply tax
        const taxRate = parseFloat(matchingTax?.rate) || 0;
        const priceWithTax = basePrice + (basePrice * taxRate) / 100;

        return parseFloat(priceWithTax?.toFixed(2));
    } catch (error) {
        console.error('Error calculating tax:', error);
        return basePrice; // fallback to base price on error
    }
};

// Get all the products by category Id
export const getProductsByCategoryId = async (ids, max, min) => {
    try {
        // Convert "12,40" or [12,40] or 12 → always array
        let categories = Array.isArray(ids)
            ? ids.map(Number)
            : String(ids).split(",").map(Number);

        if (categories.length === 0) return [];

        const firstCategory = categories.join(",");
        let allProducts = [];
        const per_page = 100;

        // 1️⃣ Fetch products only from first category
        for (let i = 1; ; i++) {
            let url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products?category=${firstCategory}&status=publish&stock_status=instock&_fields=id,name,images,slug,categories,price,regular_price,sale_price,price_html,type&per_page=${per_page}&page=${i}`;


            if (min != null) url += `&min_price=${Number(min)}`;
            if (max != null) url += `&max_price=${Number(max)}`;

            
            const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

            const response = await fetch(url, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
                cache: "force-cache",
                next: { revalidate: 3600 }
            });            

            if (!response.ok) break;

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) break;

            const dataWithTax = await Promise.all(
                data.map(async (product) => {
                    const basePrice = parseFloat(product.price) || 0;
                    const priceWithTax = await calculatePriceWithTax(basePrice, product.tax_class);
                    return { ...product, price_with_tax: priceWithTax };
                })
            );
            allProducts.push(...dataWithTax);

            if (data.length < per_page) break;
        }

        return allProducts;

    } catch (error) {
        console.log(error);
        return [];
    }
};





export const getChildCategories = async (parentId) => {
    const url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products/categories?parent=${parentId}&per_page=100&_fields=id,name,slug`;
    // const url = `https://afs-foiling.com/fr/wp-json/wc/v3/products/categories?parent=${parentId}&per_page=100&_fields=id,name,slug`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
        },
        next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`WooCommerce API error: ${response.statusText}`);
    const data = await response.json();

    const categoriesWithChildren = await Promise.all(
        data.map(async (singleData) => ({
            ...singleData,
            children: await getChildCategories(singleData.id), // recursive
        }))
    );

    return categoriesWithChildren;
}