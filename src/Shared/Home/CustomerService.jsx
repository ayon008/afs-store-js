
"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";



const AmbassadorsCard = ({ data }) => {
  const { title, description, url, href } = data;
  const t = useTranslations("home")
  return (
    <div className="bg-[#F7F7F7] md:max-w-[340px] h-auto lg:max-w-[430px] lg:h-[320px] max-w-full w-full flex lg:flex-row flex-col-reverse  lg:items-stretch items-start rounded-[4px] overflow-hidden group relative">
      {/* Text */}
      <div className="lg:w-1/2 w-full flex flex-col p-5 gap-4">
        <p className="text-lg font-bold uppercase leading-[24px] break-words">
          {title}
        </p>
        <p className="text-base leading-[24px] text-[#00000080] font-semibold">
          {description}
        </p>

        <Link
          href={href}
          className="flex items-center gap-1 text-[#00000080] font-bold uppercase lg:hidden"
        >
          <span>{t("see-more")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 5L5 19M19 5H6.4M19 5V17.6"
              stroke="#00000080"
              strokeWidth="3"
            />
          </svg>
        </Link>
      </div>

      {/* Image */}
      <div className="lg:w-1/2 w-full h-[300px] lg:h-full">
        <Image
          src={url}
          alt={title}
          width={200}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-4 group-hover:inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 lg:flex hidden items-center justify-center text-white text-lg font-bold uppercase leading-[24px]">
        <Link href={href} className="flex items-center gap-1 border-b-2 border-white cursor-pointer opacity-0 group-hover:opacity-100 delay-300 transition-opacity duration-300">
          <span>{t("see-more")}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 5L5 19M19 5H6.4M19 5V17.6"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default function CustomerService() {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const t = useTranslations("home");

  const CustomerServiceData = [
    {
      title: "Best match stab",
      description: t("best"),
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/04/Alan-fedit-74-1-scaled.jpeg`,
      href: "/best-match-stab",
    },
    {
      title: t("foil"),
      description: t("foil-des"),
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/06/comparateur.png`,
      href: "/foil-configurator",
    },
    {
      title: t("compare"),
      description: t("compare-des"),
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2023/04/Capture-decran-2025-06-05-a-16.07.13.png`,
      href: "/comparison-3-stab",
    },
    {
      title: t("equip"),
      description: t("equip-des"),
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/11/Gwen-WB-d-lite-.jpg`,
      href: "/reprise-materiel",
    },
    {
      title: t("need"),
      description:
        t("need-des"),
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/00107169-bombannes-adultes-wingfoil.webp`,
      href: "/need-advice",
    },
  ];


  return (
    <section className="max-w-[1920px] mx-auto global-padding global-margin">
      <h2 className="global-h2 mb-8">{t("service")}</h2>
      <div className="w-full">
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: {
              slidesPerView: 'auto',
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 'auto',
              spaceBetween: 40,
            },
          }}
          navigation={{
            nextEl: "#customNext",
            prevEl: "#customPrev",
          }}
          watchSlidesProgress={true}
          watchOverflow={true}
          observer={true}
          observeParents={true}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onResize={(swiper) => {
            swiper.update();
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          className=""
        >
          {CustomerServiceData.map((item) => (
            <SwiperSlide key={item.title} className="md:!w-auto md:!max-w-[640px]">
              <AmbassadorsCard data={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          id="customPrev"
          className={`p-2 rounded-full bg-[#E6E6E6] cursor-pointer transition-opacity duration-300 ${isBeginning ? "opacity-50" : "opacity-100"
            }`}
        >
          <ArrowLeft className="w-7 h-7 text-[#00000080]" strokeWidth={3} />
        </button>
        <button
          id="customNext"
          className={`p-2 rounded-full bg-[#E6E6E6] cursor-pointer transition-opacity duration-300 ${isEnd ? "opacity-50" : "opacity-100"
            }`}
        >
          <ArrowRight className="w-7 h-7 text-[#00000080]" strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}
