import React from 'react';
import { getCategories } from '../../[slug]/page';
import { getCategories as getCategoriesFromWP } from '@/lib/wp';
import Image from 'next/image';
import Link from 'next/link';
import BlogCard from '@/Shared/Card/BlogCard';
import { getLocaleValue } from '@/app/actions/Woo-Coommerce/getWooCommerce';



const categoryPost = async (id) => {
    try {
        const localeValue = await getLocaleValue();
        if (!id) throw new Error("Category ID is required");

        const base = process.env.WP_BASE_URL?.replace(/\/$/, "");
        if (!base) throw new Error("WP_BASE_URL is missing in environment variables");

        const url = `${base}/${localeValue}/wp-json/wp/v2/posts?categories=${id}&_embed&per_page=100`;

        const res = await fetch(url, {
            next: { revalidate: 60 }, // ISR caching
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch posts for category ${id}`);
        }
        const posts = await res.json();
        const data = posts.map(post => {
            const postDate = new Date(post.date);
            const formattedDate = postDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).toUpperCase();
            // Transform the WordPress post data
            let imageUrl = '/images/blogs/paraglider.png'; // fallback image
            if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
                imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? imageUrl;
            } else if (post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url) {
                imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url ?? imageUrl;
            }
            const cleanExcerpt = post.excerpt.rendered
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
                .replace(/&amp;/g, '&') // Replace &amp; with &
                .replace(/&lt;/g, '<') // Replace &lt; with <
                .replace(/&gt;/g, '>') // Replace &gt; with >
                .replace(/&quot;/g, '"') // Replace &quot; with "
                .trim();
            return {
                id: post.id,
                title: post.title.rendered,
                description: cleanExcerpt,
                date: formattedDate,
                slug: post.slug,
                imageUrl: imageUrl,
                // Additional WordPress-specific fields
                excerpt: post.excerpt.rendered,
                content: post.content.rendered,
                fullDescription: post.content.rendered, // Map content to fullDescription for compatibility
                modified: post.modified,
                link: post.link,
                author: post._embedded?.author?.[0] || null,
                featuredMedia: post._embedded?.['wp:featuredmedia']?.[0] || null,
                categories: post._embedded?.['wp:term']?.[0] || [],
                tags: post._embedded?.['wp:term']?.[1] || [],
                status: post.status,
                commentStatus: post.comment_status,
                pingStatus: post.ping_status,
                sticky: post.sticky,
                template: post.template,
                format: post.format,
                meta: post.meta,
                _original: post
            }
        })
        return data
    } catch (error) {
        console.error("categoryPost() error:", error);
        return []; // Prevents breaking the UI
    }
};




export async function generateStaticParams() {
    try {
        const categories = await getCategoriesFromWP();
        return categories.map(category => ({
            id: category.id.toString()
        }));
    } catch (error) {
        console.error('Error generating static params for categories:', error);
        return [];
    }
}


const page = async ({ params }) => {
    const { slug: id } = await params;
    const blogs = await categoryPost(id);
    const categoryData = await getCategories(id);
    const categoryName = categoryData?.name ?? 'Unknown Category';

    const BreadCums = () => {
        return (
            <div className='absolute top-6 z-20 uppercase'>
                <div className='font-semibold text-sm text-white/50'>
                    <Link className='inline' href={'/'}>Home</Link> / <Link className='inline' href={'/blog'}>Blog</Link> / <span className='inline text-white'>{categoryName}</span>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen">
            <div className="w-full global-margin relative h-[384px] global-padding relative">
                <Image
                    src="/images/blogs/paraglider.png"
                    alt="Paraglider"
                    fill
                    className="object-cover brightness-100"
                    quality={100}
                    priority
                />
                <div className='max-w-[1920px] mx-auto'>
                    <BreadCums />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                    <h1 className="global-h1">{categoryName}</h1>
                    <p className="mt-2 text-[18px] text-white font-semibold max-w-md px-6">
                        Découvrez des conseils sur le foiling, des informations sur l’industrie et des revues de matériel pour les riders de tous niveaux.
                    </p>
                </div>
            </div>

            <main className="w-full global-padding global-margin max-w-[1920px] mx-auto">
                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-600 mb-4">No blog posts found</h2>
                        <p className="text-gray-500">
                            Check back soon for new content!
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default page;
