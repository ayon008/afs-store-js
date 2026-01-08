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
    const isEnglish = locale === 'en';

    // Build URLs for each language version
    const currentPrefix = getProductRoutePrefix(locale);
    const currentPath = isEnglish ? `${currentPrefix}${slug}` : `/fr${currentPrefix}${slug}`;
    const currentUrl = `${baseUrl}${currentPath}`;

    // Get translation for the other language
    const otherLocale = isEnglish ? 'fr' : 'en';
    const translation = await getTranslatedProductSlug(data.id || slug, otherLocale, locale);

    // Build alternate language URL
    let otherUrl = currentUrl; // fallback to current if no translation
    if (translation.exists && translation.slug) {
        const otherPrefix = getProductRoutePrefix(otherLocale);
        const otherPath = otherLocale === 'fr'
            ? `/fr${otherPrefix}${translation.slug}`
            : `${otherPrefix}${translation.slug}`;
        otherUrl = `${baseUrl}${otherPath}`;
    }

    const enUrl = isEnglish ? currentUrl : otherUrl;
    const frUrl = isEnglish ? otherUrl : currentUrl;

    // Generate complete hreflang alternates with regional targeting
    const languages = {
        // Primary language tags
        'en': enUrl,
        'fr': frUrl,

        // Regional targeting for English markets
        'en-US': enUrl,
        'en-GB': enUrl,
        'en-CA': enUrl,
        'en-AE': enUrl,
        'en-AU': enUrl,

        // Regional targeting for French markets
        'fr-FR': frUrl,
        'fr-BE': frUrl,
        'fr-CH': frUrl,
        'fr-CA': frUrl,
        'fr-LU': frUrl,

        // External Spanish site (redirect to homepage as products may differ)
        'es': 'https://afs-foiling.es',
        'es-ES': 'https://afs-foiling.es',

        // Default fallback
        'x-default': enUrl,
    };

    const title = data.name || (isEnglish ? 'Product' : 'Produit');
    const description = data.short_description?.replace(/<[^>]*>/g, '') ||
                       data.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
                       '';

    return {
        title: `${title} - AFS`,
        description,
        alternates: {
            canonical: currentUrl,
            languages,
        },
        openGraph: {
            type: 'website',
            title: `${title} - AFS`,
            description,
            url: currentUrl,
            siteName: 'AFS',
            locale: isEnglish ? 'en_US' : 'fr_FR',
            alternateLocale: isEnglish ? 'fr_FR' : 'en_US',
            images: data.images?.[0]?.src ? [{
                url: data.images[0].src,
                alt: title,
            }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} - AFS`,
            description,
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

