import Image from 'next/image';
import React from 'react';
import moment from "moment";
import BlogContent from "@/Shared/Blog/BlogContent"
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/wp';
import { getTranslations } from 'next-intl/server';
import NotFound from '@/Shared/NotFound/404';


export async function generateMetadata({ params }) {
    const { slug, locale } = await params;
    const response = await fetch(
        `${process.env.WP_BASE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed&lang=${locale}`
    );
    const data = await response.json();
    const blog = data[0];

    if (!blog) {
        return {
            title: "Blog Not Found",
            description: "The requested blog post could not be found.",
        };
    }


    const title = decodeEntities(blog?.title?.rendered || "Blog");

    // Description from excerpt (strip HTML)
    const description = decodeEntities(
        blog?.excerpt?.rendered
            ?.replace(/<[^>]+>/g, "") // remove HTML
            ?.replace(/\s+/g, " ")    // clean extra spaces
            ?.trim() ||
        "Read this blog post"
    );

    // Featured image
    const featuredImage =
        blog?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

    return {
        title,
        description,
        openGraph: {
            type: "article",
            title,
            description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
            images: featuredImage ? [{ url: featuredImage }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: featuredImage ? [featuredImage] : [],
        },
    };
}

export const revalidate = 60;

// export async function generateStaticParams() {
//     const locales = ["en", "fr"];
//     const params = [];

//     // Fetch posts for each locale separately to avoid getLocale() issues
//     for (const locale of locales) {
//         try {
//             const blogs = await getPosts({
//                 fetchAll: true,
//                 orderby: "date",
//                 order: "desc",
//                 locale: locale, // Pass locale explicitly to avoid getLocale() call
//             });

//             for (const blog of blogs) {
//                 params.push({
//                     locale,
//                     slug: blog.slug,
//                 });
//             }
//         } catch (error) {
//             console.error(`Error fetching posts for locale ${locale}:`, error);
//             // Continue with other locales even if one fails
//         }
//     }

//     return params;
// }

export const getCategories = async (id = null, locale) => {
    try {
        const base = `${process.env.WP_BASE_URL.replace(/\/$/, "")}/wp-json/wp/v2/categories`;

        const url = id ?
            `${base}/${id}?_embed&lang=${locale}` :
            `${base}?_embed&per_page=100&lang=${locale}`; // fetch all

        const res = await fetch(url, { cache: 'no-cache' });

        if (!res.ok) {
            throw new Error(`Failed to fetch categories${id ? ` with ID ${id}` : ""}`);
        }
        return await res.json();
    } catch (err) {
        console.error("Error in getCategories():", err);
        return id ? null : [];
    }
};
export const getCategoriesBySlug = async (slug = null, locale) => {
    try {
        const base = `${process.env.WP_BASE_URL.replace(/\/$/, "")}/wp-json/wp/v2/categories`;

        const url = slug
            ? `${base}?slug=${slug}&_embed&lang=${locale}`
            : `${base}?_embed&per_page=100&lang=${locale}`; // fetch all categories

        const res = await fetch(url, { cache: 'no-cache' });

        if (!res.ok) {
            throw new Error(`Failed to fetch categories${slug ? ` with slug ${slug}` : ""}`);
        }
        return await res.json();
    } catch (err) {
        console.error("Error in getCategoriesBySlug():", err);
        return slug ? null : [];
    }
};

export const decodeEntities = (str = "") =>
    str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");





const page = async ({ params }) => {
    const { slug, locale } = await params;
    const t = await getTranslations("blog", locale);
    const response = await fetch(
        `${process.env.WP_BASE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed&lang=${locale}`
    );
    const data = await response.json();

    const blog = data[0];

    // If the blog is undefined, bail early to avoid later operations that assume the blog exists
    if (!blog) {
        return (
            <NotFound />
        );
    }
    // Date
    const date = moment(blog?.date || new Date()).format("MMMM DD, YYYY");

    // featured image 
    const featuredImage = blog?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    const alt = blog?._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ?? '';

    // Title
    const blogTitle = decodeEntities(blog?.title?.rendered);

    // Author Name
    const authorName = decodeEntities(blog?._embedded?.author?.[0]?.name ?? ''); // "Antonin"
    console.log(blog?.categories);

    const categoryId = blog?.categories?.[0];
    const categoryData = await getCategories(categoryId, locale);
    const categoryName = categoryData?.name ?? 'Unknown Category';

    const a = await getTranslations("breadcum", locale);

    const BreadCums = () => {
        return (
            <div className='uppercase'>
                <div className='font-semibold text-sm text-white/50'>
                    <Link className='inline' href={'/'}>{a("home")}</Link> / <Link className='inline' href={'/blog'}>Blog</Link> / <Link href={`/blog/categories/${categoryData?.slug}`} className='inline'>{categoryName}</Link> / <span className='text-white'>{blogTitle}</span>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full relative'>
            {/* HERO SECTION */}
            <div
                style={
                    featuredImage
                        ? { backgroundImage: `url(${featuredImage})` }
                        : undefined
                }
                className="relative w-full bg-center bg-cover bg-no-repeat lg:mb-[120px] md:mb-20 mb-[60px]"
            >
                {/* Blur + color overlay */}
                <div className="absolute inset-0 bg-[#111]/40 backdrop-blur-sm" />
                <div className='max-h-[780px] h-[calc(100vh-139px)] w-full max-w-[1920px] mx-auto relative z-20 pt-4 global-padding pb-10 flex flex-col justify-between'>
                    <BreadCums />
                    <div className='flex lg:flex-row flex-col gap-5 items-start justify-between text-white'>
                        <h1 className="global-h1">
                            {blogTitle}
                        </h1>
                        <div className='mt-4 space-y-2'>
                            {/* Date */}
                            <h3 className='font-bold uppercase lg:text-base text-sm leading-[120%]'>{date}</h3>
                            {/* Author */}
                            <h2 className='font-alliance font-semibold lg:text-base text-sm leading-[120%] tracking-[-0.01em] uppercase'>{authorName}</h2>
                        </div>
                    </div>
                </div>
            </div>
            <div className='global-padding'>
                <BlogContent blog={blog} />
            </div>
        </div>
    );
};

export default page;
