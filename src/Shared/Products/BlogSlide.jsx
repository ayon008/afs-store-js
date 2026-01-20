"use client"
import { useTranslations } from 'next-intl'
import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';


const NewsCard = ({ article }) => {
    const category = article.categories?.[0];
    const b = useTranslations("blog");

    return (
        <article className="flex flex-col justify-between py-5 border-t-2 border-b-2 border-t-[#00000026] border-b-[#00000026] h-[250px]">
            {category && (
                <span className="block w-fit rounded-[20px] border border-blue px-[5px] pt-[5px] pb-[3px] text-sm font-bold uppercase leading-[100%] text-blue">
                    {category.name}
                </span>
            )}

            <div>
                <Link href={`/blog/${article.slug}`} className="space-y-4">
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
                    <span>{b("see")}</span>
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                </Link>
            </div>
        </article>
    );
};

const BlogSlide = ({ data }) => {
    const t = useTranslations("product");
    const swiperRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    return (
        <div>
            <h2 className="global-h2 mb-8">{t("Apprenez-en plus avec nos articles")}</h2>
            <div className="w-full">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    breakpoints={{
                        0: {
                            slidesPerView: 1,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onSlideChange={(swiper) => {
                        setIsBeginning(swiper.isBeginning);
                        setIsEnd(swiper.isEnd);
                    }}
                    className=""
                >
                    {data && data?.length > 0 && data?.map((blog, i) => (
                        <SwiperSlide key={i} className="h-auto">
                            <NewsCard article={blog} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div className="flex items-center justify-center gap-4 mt-10">
                <button
                    onClick={() => swiperRef.current?.slidePrev()}
                    id="customPrev"
                    className={`p-2 rounded-full bg-[#E6E6E6] cursor-pointer transition-opacity duration-300 ${isBeginning ? "opacity-50" : "opacity-100"
                        }`}
                >
                    <ArrowLeft className="w-7 h-7 text-[#00000080]" strokeWidth={3} />
                </button>
                <button
                    onClick={() => swiperRef.current?.slideNext()}
                    id="customNext"
                    className={`p-2 rounded-full bg-[#E6E6E6] cursor-pointer transition-opacity duration-300 ${isEnd ? "opacity-50" : "opacity-100"
                        }`}
                >
                    <ArrowRight className="w-7 h-7 text-[#00000080]" strokeWidth={3} />
                </button>
            </div>
        </div>
    )
}
export default BlogSlide