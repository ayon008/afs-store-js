import { getPrice, getProductBySlug } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import NotFound from '@/Shared/NotFound/404';
import SingleProduct from '@/Shared/Products/SingleProduct';
import React from 'react';
import { getLocale } from 'next-intl/server';
import { getTranslatedProductSlug } from '@/lib/product-routes';
import { getProductRoutePrefix } from '@/lib/product-routes';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { slug, route } = await params;
    const locale = await getLocale();
    const data = await getProductBySlug(slug);
    
    if (!data) {
        return {
            title: locale === 'fr' ? 'Produit introuvable' : 'Product Not Found',
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
        title: data.name || (locale === 'fr' ? 'Produit' : 'Product'),
        description: data.short_description || data.description || '',
        alternates: {
            languages: Object.fromEntries(
                alternateLinks.map(link => [link.hreflang, link.url])
            ),
        },
        openGraph: {
            title: data.name || (locale === 'fr' ? 'Produit' : 'Product'),
            description: data.short_description || data.description || '',
            images: data.images?.[0]?.src ? [data.images[0].src] : [],
        },
    };
}

const page = async ({ params }) => {
    const { slug, route } = await params;
    const locale = await getLocale();
    
    // Validate route matches locale and redirect if needed
    const expectedRoute = locale === 'fr' ? 'produit' : 'product';
    
    if (route !== expectedRoute) {
        // Build correct URL based on locale
        if (locale === 'fr') {
            redirect(`/fr/produit/${slug}`);
        } else {
            redirect(`/product/${slug}`);
        }
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

