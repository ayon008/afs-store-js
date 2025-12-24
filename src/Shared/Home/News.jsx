import React from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getPosts } from "@/app/actions/getBlogs";
import { getTranslations } from "next-intl/server";

/* ----------------------------- News Card ----------------------------- */
const NewsCard = async ({ article, locale }) => {
  const category = article.categories?.[0];
  const t = await getTranslations("home", locale);

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
          href={`/blog/${article.slug}`}
          className="flex items-center gap-1 text-sm font-semibold uppercase leading-[100%] text-blue"
        >
          <span>{t("see-more")}</span>
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
};

const News = async ({ locale }) => {
  const t = await getTranslations("home", locale);
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
      <h2 className="global-h2 mb-8 text-[#111111] capitalize">{t("news")}</h2>

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
        {t("see-more")}
        <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </div>
  );
};

export default News;
