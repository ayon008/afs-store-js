import React from 'react';
const default_image = "/assets/images/GWEN-WB-D-lite-1024x573.png.webp"
import Products from '@/Shared/Products/Products';
import { getParentCategory } from '@/app/actions/WC/getParentCategory';
import { getChildCategories } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { getTranslations, getLocale } from 'next-intl/server';
import NotFound from '@/Shared/NotFound/404';
import { Link } from "@/i18n/navigation";
import { getTranslatedCategoryPath, getCategoryRoutePrefix } from '@/lib/product-routes';
import CustomerService from '@/Shared/Home/CustomerService';
import BlogSlide from '@/Shared/Products/BlogSlide';
import { getPosts } from '@/lib/wp';
import RankMathHead from '@/Shared/SEO/RankMathHead';
import { getRankMathHead, getCategoryPermalink } from '@/lib/rankmath-head';
import { mergeRankMathMetadata } from '@/lib/seo-utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://afs-foiling.com';

export async function generateCategoryMetadata(slug) {
    const locale = await getLocale();
    const isEnglish = locale === 'en';

    // Get category data
    let category;
    try {
        category = await getParentCategory(slug[slug?.length - 1].toLowerCase());
    } catch (error) {
        return {
            title: isEnglish ? 'Category Not Found' : 'Catégorie introuvable',
        };
    }

    if (!category) {
        return {
            title: isEnglish ? 'Category Not Found' : 'Catégorie introuvable',
        };
    }

    // Get translated category paths
    const enPath = await getTranslatedCategoryPath(slug, 'en');
    const frPath = await getTranslatedCategoryPath(slug, 'fr');

    const enUrl = `${BASE_URL}${enPath}`;
    const frUrl = `${BASE_URL}${frPath}`;
    const currentUrl = isEnglish ? enUrl : frUrl;

    // Generate hreflang alternates
    const languages = {
        'en': enUrl,
        'fr': frUrl,
        'en-US': enUrl,
        'en-GB': enUrl,
        'en-CA': enUrl,
        'en-AE': enUrl,
        'fr-FR': frUrl,
        'fr-BE': frUrl,
        'fr-CH': frUrl,
        'fr-CA': frUrl,
        'fr-LU': frUrl,
        'es': 'https://afs-foiling.es',
        'es-ES': 'https://afs-foiling.es',
        'x-default': enUrl,
    };

    const title = category.name || (isEnglish ? 'Category' : 'Catégorie');
    const description = category.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
        (isEnglish
            ? `Explore our ${title} collection. Premium foiling equipment Made In France.`
            : `Découvrez notre collection ${title}. Équipement de foil premium Made In France.`);

    // Base metadata (fallback if Rank Math is unavailable)
    const baseMetadata = {
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
            images: category.image?.src ? [{
                url: category.image.src,
                alt: title,
            }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} - AFS`,
            description,
            images: category.image?.src ? [category.image.src] : [],
        },
    };

    // Fetch Rank Math metadata if category ID is available
    let rankMathData = null;
    if (category.id) {
        try {
            const wpPermalink = await getCategoryPermalink(category.id, locale);
            if (wpPermalink) {
                rankMathData = await getRankMathHead(wpPermalink, locale);
            }
        } catch (error) {
            console.error('[Category SEO] Error fetching Rank Math data:', error);
        }
    }

    // Merge Rank Math metadata with base metadata
    if (rankMathData) {
        return mergeRankMathMetadata(baseMetadata, rankMathData, { languages });
    }

    return baseMetadata;
}

export default async function CategoryPage({ slug }) {
    const locale = await getLocale();
    const categoryPrefix = getCategoryRoutePrefix(locale);

    // Getting the Category details by the slug [last category of the slug]
    let category;
    try {
        category = await getParentCategory(slug[slug?.length - 1].toLowerCase());
    } catch (error) {
        console.error('Error fetching category:', error);
        return <NotFound />;
    }

    if (!category) {
        return <NotFound />;
    }

    // Category Image
    const image = category?.image?.src || default_image;
    // child categories
    const childCategories = await getChildCategories(category?.id);

    const BreadCums = async () => {
        const t = await getTranslations("breadcum");
        let path = categoryPrefix.slice(0, -1); // Remove trailing slash

        return (
            <div className='uppercase'>
                <div className='font-bold text-sm text-white'>
                    <Link className='inline' href="/">{t("home")}</Link>

                    {slug?.map((singleSlug, i) => {
                        path = path + `/${singleSlug}`
                        return (
                            <Link
                                key={i}
                                href={path}
                                className={`uppercase inline`}
                            >
                                {" / "}{singleSlug.split("-").join(" ")}
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    };



    let blogs = [];

    try {
        blogs = await getPosts({
            fetchAll: false,
            orderby: "date",
            order: "desc",
            per_page: 4,
            locale: locale,
            page: 1,
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        blogs = [];
    }


    console.log(blogs);

    // Fetch Rank Math data for JSON-LD injection
    let rankMathData = null;
    if (category?.id) {
        try {
            const wpPermalink = await getCategoryPermalink(category.id, locale);
            if (wpPermalink) {
                rankMathData = await getRankMathHead(wpPermalink, locale);
            }
        } catch (error) {
            console.error('[Category SEO] Error fetching Rank Math data for JSON-LD:', error);
        }
    }

    return (
        <div className='global-margin'>
            {rankMathData && <RankMathHead data={rankMathData} />}
            <div className='global-margin'>
                <div className='lg:h-[75vh] h-[50vh] max-h-[540px] lg:max-h-[720px] w-full relative mb-[clamp(3.75rem,0.2971rem+7.2029vw,7.5rem)] bg-no-repeat bg-cover bg-center'
                    style={{ backgroundImage: `url(${image})` }}
                >
                    <div className='global-padding pt-4 max-w-[1920px] mx-auto'>
                        <BreadCums />
                        <div>
                            <h1 className='global-h2 text-white absolute bottom-8'>
                                {category?.name}
                            </h1>
                        </div>
                    </div>
                </div>
                <div>
                    <Products childCategories={childCategories} id={category?.id} />
                </div>
            </div>
            <div className=''>
                <div className='global-margin'>
                    <CustomerService />
                </div>
                <div className='global-padding'>
                    <BlogSlide data={blogs} />
                </div>
            </div>
        </div>
    );
}
