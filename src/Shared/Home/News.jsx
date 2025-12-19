import React from 'react';
import { ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getPosts } from '@/actions/getBlogs';
import Link from 'next/link';


// Helper Component for a single News Card
const NewsCard = ({ article }) => {
    return (
        <article className='py-5 border-t-[#00000026] border-b-[#00000026] border-t-2 border-b-2 space-y-10'>
            <span className='text-blue font-bold text-sm leading-[100%] uppercase px-[5px] py-[3px] border-blue border rounded-[20px] block w-fit'>Blog</span>
            <div className=''>
                <Link href={'/'} className='space-y-4'>
                    <h4 className='text-lg text-[#111] leading-[110%] font-semibold'>Ayon</h4>
                    <p className="line-clamp-3 self-stretch overflow-hidden text-ellipsis text-base text-[#111111b2] font-normal leading-[120%]">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita vel ipsam iste itaque. Asperiores totam facere debitis animi in ipsa magnam impedit id fuga laudantium quae qui at assumenda veniam corporis esse, aut harum eos et perspiciatis? Provident maxime aspernatur laboriosam aliquam voluptatem ullam, voluptatibus quae eaque, obcaecati vel autem
                    </p>
                </Link>
            </div>
            <div className='flex items-center justify-between gap-[10px] flex-wrap'>
                <p className='text-[#11111166] text-sm leading-[100%] font-semibold uppercase'>Date</p>
                <button className="uppercase flex items-center gap-1 text-sm font-semibold text-blue leading-[100%] cursor-pointer">
                    <span className=''>See More</span>
                    <ArrowUpRight className='w-4 h-4' strokeWidth={2} />
                </button>
            </div>
        </article>
    );
};

// Main Component: AFSNewsSection
const News = async () => {
    let blogs = [];
    let error = null;

    try {
        // Fetch all posts from WordPress
        blogs = await getPosts({
            fetchAll: false, // This will fetch all posts using pagination
            orderby: 'date',
            order: 'desc',
            per_page: 3,
            page: 1,
        });
    } catch (err) {
        console.error('Error fetching blog posts:', err);
        error = err.message;
        // Fallback to empty array if WordPress is not available
        blogs = [];
    }

    console.log(blogs);


    return (
        <div className='global-padding global-margin'>
            <h2 className='global-h2 mb-8'>News</h2>
            {
                blogs.length > 0 && (
                    <div className='flex items-stretch justify-baseline gap-[clamp(1.25rem,-0.8333rem+2.7778vw,2.5rem)]'>
                        {blogs.map((blog) => (
                            <NewsCard key={blog.id} article={blog} />
                        ))}
                    </div>
                )
            }
        </div>
    );
};

export default News;
