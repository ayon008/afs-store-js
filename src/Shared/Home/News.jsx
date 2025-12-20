<<<<<<< HEAD
import React from 'react';
import { ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getPosts } from '@/actions/getBlogs';
import Link from 'next/link';


// Helper Component for a single News Card
const NewsCard = ({ article }) => {
    console.log(article);
    const categories = article.categories[0];
    console.log(categories);


    return (
        <article className='py-5 border-t-[#00000026] border-b-[#00000026] border-t-2 border-b-2 space-y-10'>
            <span className='text-blue font-bold text-sm leading-[100%] uppercase px-[5px] py-[3px] border-blue border rounded-[20px] block w-fit'>{categories.name}</span>
            <div className=''>
                <Link href={`/blogs/${article.slug}`} className='space-y-4'>
                    <h4 className='text-lg text-[#111] leading-[110%] font-semibold' dangerouslySetInnerHTML={{
                        __html: article.title
                    }} />
                    <p className="line-clamp-3 self-stretch overflow-hidden text-ellipsis text-base text-[#111111b2] font-normal leading-[120%]" dangerouslySetInnerHTML={{ __html: article.description }} />
                </Link>
            </div>
            <div className='flex items-center justify-between gap-[10px] flex-wrap'>
                <p className='text-[#11111166] text-sm leading-[100%] font-semibold uppercase' dangerouslySetInnerHTML={{ __html: article.date }} />
                <button className="uppercase flex items-center gap-1 text-sm font-semibold text-blue leading-[100%] cursor-pointer">
                    <Link href={`/blogs/${article.slug}`}>
                        <span className=''>See More</span>
                    </Link>
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
            <Link href={'/blogs'} className=''>
                <button className="uppercase flex items-center gap-1 text-sm font-semibold text-[#111111b2] leading-[100%] cursor-pointer w-fit mx-auto mt-8">
                    See More <ArrowUpRight className='w-4 h-4' strokeWidth={2} />
                </button>
            </Link>
        </div>
    );
=======
import React from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getPosts } from "@/actions/getBlogs";

/* ----------------------------- News Card ----------------------------- */
const NewsCard = ({ article }) => {
  const category = article.categories?.[0];

  return (
    <article className="flex flex-col justify-between gap-[24px] lg:gap-10 py-5 border-t-2 border-b-2 border-t-[#00000026] border-b-[#00000026]">
      {category && (
        <span className="block w-fit rounded-[20px] border border-blue px-[5px] pt-[5px] pb-[3px] text-sm font-bold uppercase leading-[100%] text-blue">
          {category.name}
        </span>
      )}

      <div>
        <Link href={`/blogs/${article.slug}`} className="space-y-4">
          <h4
            className="text-lg font-semibold leading-[110%] text-[#111]"
            dangerouslySetInnerHTML={{ __html: article.title }}
          />
          <p
            className="line-clamp-3 text-base font-normal leading-[120%] text-[#111111b2]"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[10px]">
        <p
          className="text-sm font-semibold uppercase leading-[100%] text-[#11111166]"
          dangerouslySetInnerHTML={{ __html: article.date }}
        />

        <Link
          href={`/blogs/${article.slug}`}
          className="flex items-center gap-1 text-sm font-semibold uppercase leading-[100%] text-blue"
        >
          <span>See More</span>
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
};

const News = async () => {
  let blogs = [];

  try {
    blogs = await getPosts({
      fetchAll: false,
      orderby: "date",
      order: "desc",
      per_page: 3,
      page: 1,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    blogs = [];
  }

  return (
    <div className="mx-auto max-w-[1920px] global-padding global-margin">
      <h2 className="global-h2 mb-8 text-[#111111]">News</h2>

      {blogs.length > 0 && (
        <div className="grid grid-cols-1 gap-[clamp(1.25rem,-0.8333rem+2.7778vw,2.5rem)] md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <NewsCard key={blog.id} article={blog} />
          ))}
        </div>
      )}

      <Link
        href="/blogs"
        className="mx-auto mt-8 flex w-fit items-center gap-1 text-sm font-semibold uppercase leading-[100%] text-[#111111b2]"
      >
        See More
        <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </div>
  );
>>>>>>> origin/main
};

export default News;
