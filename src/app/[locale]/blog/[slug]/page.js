import Image from 'next/image';
import React from 'react';
import moment from "moment";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BlogContent from '@/Shared/Blog/BlogContent';
import { getPosts } from '@/app/actions/getBlogs';



export async function generateMetadata({ params }) {
    const { slug } = await params;

    const response = await fetch(
        `${process.env.WP_BASE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
        { next: { revalidate: 60 } } // optional caching
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

export async function generateStaticParams() {
    const blogs = await getPosts({
        fetchAll: true,
        orderby: "date",
        order: "desc",
    });

    return blogs.map(blog => ({
        slug: blog.slug,
    }));
}

export const getCategories = async (id = null) => {
    try {
        const base = `${process.env.WP_BASE_URL.replace(/\/$/, "")}/wp-json/wp/v2/categories`;

        const url = id
            ? `${base}/${id}?_embed`
            : `${base}?_embed&per_page=100`; // fetch all

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

export const decodeEntities = (str = "") =>
    str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

const page = async ({ params }) => {
    const { slug } = await params;
    const response = await fetch(
        `${process.env.WP_BASE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed`
    );
    const data = await response.json();
    const blog = data[0];

    console.log(blog);

    // If the blog is undefined, bail early to avoid later operations that assume the blog exists
    if (!blog) {
        return (
            <div className="max-w-3xl mx-auto p-10 text-center bg-[#f4f4f4] min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Blog not found 😢</h1>
                <Link
                    href="/blog"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center justify-center gap-2"
                >
                    <ArrowRight size={16} className="rotate-180" /> Back to blogs
                </Link>
            </div>
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
    const categoryId = blog?.categories?.[0];
    const categoryData = await getCategories(categoryId);

    const categoryName = categoryData?.name ?? 'Unknown Category';


    if (!blog) {
        return (
            <div className="max-w-3xl mx-auto p-10 text-center bg-[#f4f4f4] min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Blog not found 😢</h1>
                <Link
                    href="/blog"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center justify-center gap-2"
                >
                    <ArrowRight size={16} className="rotate-180" /> Back to blogs
                </Link>
            </div>
        );
    }

    const BreadCums = () => {
        return (
            <div className='absolute top-6 z-20 uppercase'>
                <div className='font-semibold text-sm text-white/50'>
                    <Link className='inline' href={'/'}>Home</Link> / <Link className='inline' href={'/blog'}>Blog</Link> / <Link href={`/blog/categories/${categoryId}`} className='inline'>{categoryName}</Link> / <span className='text-white'>{blogTitle}</span>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full relative'>
            {/* HERO SECTION */}
            <header className="relative h-fit w-full overflow-hidden global-margin relative">
                <Image
                    src={featuredImage}
                    alt={alt}
                    width={1264}
                    height={780}
                    priority
                    className="object-cover w-full aspect-[1264/780] max-h-[780px] h-screen object-center"
                />
                <div className='max-w-[1920px] mx-auto global-padding'>
                    <BreadCums />
                </div>
                <div className='absolute inset-0 bg-black/40 z-10  backdrop-blur-[4px]'></div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full p-8 text-white gap-10 mb-20 flex lg:flex-row flex-col items-start justify-between global-padding max-w-[1920px] mx-auto">
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
            </header>
            <div className='global-padding'>
                <BlogContent blog={blog} />
            </div>
        </div>
    );
};

export default page;
