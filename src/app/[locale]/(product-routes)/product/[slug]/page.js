import { getPrice, getProductBySlug } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import NotFound from '@/Shared/NotFound/404';
import SingleProduct from '@/Shared/Products/SingleProduct';
import React from 'react';
import { getLocale } from 'next-intl/server';
import { getTranslatedProductSlug } from '@/lib/product-routes';
import { getProductRoutePrefix } from '@/lib/product-routes';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const locale = await getLocale();
    const data = await getProductBySlug(slug);
    
    if (!data) {
        return {
            title: 'Product Not Found',
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://afs-foiling.com';
    
    // Get translated slugs for hreflang
    const alternateLinks = [];
    
    // Current language link
    const currentPrefix = getProductRoutePrefix(locale);
    const currentUrl = `${baseUrl}${currentPrefix}${slug}`;
    
    // Get other language slug
    const otherLocale = locale === 'fr' ? 'en' : 'fr';
    const translation = await getTranslatedProductSlug(data.id || slug, otherLocale, locale);
    
    if (translation.exists && translation.slug) {
        const otherPrefix = getProductRoutePrefix(otherLocale);
        const otherUrl = `${baseUrl}${otherPrefix}${translation.slug}`;
        alternateLinks.push({
            hreflang: otherLocale,
            url: otherUrl,
        });
    }
    
    // Add current language
    alternateLinks.push({
        hreflang: locale,
        url: currentUrl,
    });
    
    // Add x-default (usually the default language)
    alternateLinks.push({
        hreflang: 'x-default',
        url: `${baseUrl}/product/${slug}`, // Default to English
    });

    return {
        title: data.name || 'Product',
        description: data.short_description || data.description || '',
        alternates: {
            languages: Object.fromEntries(
                alternateLinks.map(link => [link.hreflang, link.url])
            ),
        },
        openGraph: {
            title: data.name || 'Product',
            description: data.short_description || data.description || '',
            images: data.images?.[0]?.src ? [data.images[0].src] : [],
        },
    };
}

const page = async ({ params }) => {
    const { slug } = await params;
    const locale = await getLocale();
    
    // This route should only be accessible for English locale
    // French users are redirected in middleware
    if (locale === 'fr') {
        return <NotFound />;
    }
    
    const data = await getProductBySlug(slug);
    const variations = await getPrice(data?.id);

    if (!data) {
        return (
            <NotFound />
        )
    }

    return (
        <div>
            <SingleProduct data={data} variations={variations} />
        </div>
    );
};

export default page;

