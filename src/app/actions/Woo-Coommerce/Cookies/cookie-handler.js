'use server';
import { cookies } from 'next/headers';

// Get WooCommerce cookies from Next.js cookie store
export async function getWooCommerceCookies() {
    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        // Filter WooCommerce/WP specific cookies
        const wooCookies = allCookies
            .filter(cookie =>
                cookie.name.includes('woocommerce') ||
                cookie.name.includes('wordpress') ||
                cookie.name.includes('wp_') ||
                cookie.name.includes('wc_') ||
                cookie.name === 'PHPSESSID'
            )
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
        return wooCookies;
    } catch (error) {
        console.error('Error getting cookies:', error);
        return '';
    }
}

// Set cookies from WooCommerce response
export async function setCookiesFromResponse(response) {
    try {
        const setCookieHeader = response.headers.get('set-cookie');
        if (!setCookieHeader) return;

        const cookieStore = await cookies();

        // Handle multiple cookies (they might be comma separated)
        const cookieArray = setCookieHeader.split(/\s*,\s*(?=\w+=)/);

        for (const cookieStr of cookieArray) {
            const [nameValue, ...options] = cookieStr.split('; ');
            const [name, ...valueParts] = nameValue.split('=');
            const value = valueParts.join('='); // In case value contains '='

            if (!name || !value) continue;

            // Parse cookie options
            const cookieOpts = {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            };

            options.forEach(option => {
                const [optName, optValue] = option.split('=');
                const optNameLower = optName.toLowerCase();

                switch (optNameLower) {
                    case 'httponly':
                        cookieOpts.httpOnly = true;
                        break;
                    case 'secure':
                        cookieOpts.secure = true;
                        break;
                    case 'samesite':
                        cookieOpts.sameSite = optValue?.toLowerCase() || 'lax';
                        break;
                    case 'path':
                        cookieOpts.path = optValue || '/';
                        break;
                    case 'max-age':
                        cookieOpts.maxAge = parseInt(optValue) || undefined;
                        break;
                    case 'expires':
                        cookieOpts.expires = new Date(optValue);
                        break;
                    case 'domain':
                        cookieOpts.domain = optValue;
                        break;
                }
            });

            // Set the cookie
            cookieStore.set({
                name: name.trim(),
                value: value.trim(),
                ...cookieOpts,
            });
        }
    } catch (error) {
        console.error('Error setting cookies:', error);
    }
}