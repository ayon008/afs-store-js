import { NextResponse } from "next/server";
import { getLocaleValue } from "@/app/actions/Woo-Coommerce/getWooCommerce";

const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;
const authHeader = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

export async function GET(request) {
    try {
        const localeValue = await getLocaleValue();
        const baseUrl = process.env.WP_BASE_URL?.replace(/\/$/, '') || '';
        const localePath = localeValue ? `/${localeValue}` : '';
        const apiUrl = `${baseUrl}${localePath}/wp-json/wc/v3/payment_gateways`;
        
        // Use query parameters for authentication
        const url = new URL(apiUrl);
        url.searchParams.set('consumer_key', consumerKey);
        url.searchParams.set('consumer_secret', consumerSecret);
        
        console.log('Fetching payment methods from:', url.toString().replace(consumerSecret, '***'));
        
        const response = await fetch(url.toString(), {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authHeader}` 
            },
            cache: "no-store",
        });

        console.log('Payment methods response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`Failed to fetch payment methods: ${response.status} - ${errorText.substring(0, 500)}`);
            return NextResponse.json({
                success: false,
                error: `Failed to fetch payment methods: ${response.status}`,
                status: response.status,
                statusText: response.statusText,
                errorText: errorText.substring(0, 500),
                url: url.toString().replace(consumerSecret, '***')
            }, { status: response.status });
        }
        
        const data = await response.json();
        console.log('Payment methods raw data type:', typeof data, Array.isArray(data), data?.length || 'N/A');
        
        let methods = [];
        
        if (Array.isArray(data)) {
            methods = data.filter((method) => method?.enabled);
            console.log(`Found ${methods.length} enabled payment methods out of ${data.length} total`);
        } else if (data && typeof data === 'object') {
            // If it's an object, try to extract payment methods
            const methodsArray = Object.values(data);
            if (Array.isArray(methodsArray) && methodsArray.length > 0) {
                methods = methodsArray.filter((method) => method?.enabled);
                console.log(`Found ${methods.length} enabled payment methods from object`);
            }
        }
        
        // Log all methods for debugging
        methods.forEach(method => {
            console.log(`  - ${method.id}: ${method.title} (enabled: ${method.enabled})`);
        });
        
        return NextResponse.json({
            success: true,
            methods: methods,
            total: methods.length,
            rawDataType: typeof data,
            isArray: Array.isArray(data),
            rawDataLength: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
            url: url.toString().replace(consumerSecret, '***')
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Error fetching payment methods',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}


