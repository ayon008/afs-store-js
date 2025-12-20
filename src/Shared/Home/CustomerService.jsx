<<<<<<< HEAD
"use client"
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';


const CustomerServiceData = [
    {
        title: "Best match stab",
        description: "Find the stab that suits you best based on your front wing and your riding style.",
        url: "https://afs-foiling.com/fr/wp-content/uploads/2024/04/Alan-fedit-74-1-scaled.jpeg"
    },
    {
        title: "Foil configurator",
        description: "Find the complete foil that suits you from the AFS range based on your level and size.",
        url: "https://afs-foiling.com/fr/wp-content/uploads/2025/06/comparateur.png"
    },
    {
        title: "Compare 3 stabilizers",
        description: "Want to compare stabilizers with your front wing?",
        url: "https://afs-foiling.com/fr/wp-content/uploads/2023/04/Capture-decran-2025-06-05-a-16.07.13.png"
    },
    {
        title: "Equipment trade-in",
        description: "We will take back your old AFS equipment when you purchase a new product from us.",
        url: "https://afs-foiling.com/fr/wp-content/uploads/2024/11/Gwen-WB-d-lite-.jpg"
    },
    {
        title: "Need advice?",
        description: "Find out the different ways you can contact us: WhatsApp, chat, call an AFS expert, etc.",
        url: "https://afs-foiling.com/fr/wp-content/uploads/2024/10/00107169-bombannes-adultes-wingfoil.webp"
    }
];


const AmbassadorsCard = ({ data }) => {
    const { title, description, url } = data;
    return (
        <div className='lg:h-[320px] shadow-md bg-[#F7F7F7] max-w-[430px] w-full h-auto flex lg:flex-row flex-col-reverse lg:items-stretch items-start rounded-[4px] overflow-hidden group relative shadow-[0_0_50px_10px_#0000000D]'>
            <div className='lg:w-1/2 w-full flex flex-col p-5 gap-4'>
                <p className='text-lg font-bold uppercase leading-[24px] break-words'>{title}</p>
                <p className='text-base leading-[24px] text-[#00000080] font-semibold'>{description}</p>
            </div>
            <div className='lg:w-1/2 w-full'>
                <Image src={url} alt='' height={300} width={200} className='w-full lg:h-full h-[300px] object-cover' />
            </div>
            {/* Overlay */}
            <div className="absolute inset-4 group-hover:inset-0 bg-black/60 
        opacity-0 group-hover:opacity-100 
        transition-all duration-500 lg:flex hidden items-center justify-center text-white text-lg font-bold uppercase leading-[24px]">
                <div className='flex items-center group-hover:opacity-100 opacity-0 delay-300 transition-opacity duration-300 gap-1 border-white border-b-[2px] cursor-pointer'>
                    <span>
                        Voir plus
                    </span>
                    <svg width="18" height="18" className='text-white font-bold' viewBox="0 0 24 24" fill="none">
                        <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default function CustomerService() {
    const swiperRef = useRef(null);

    return (
        <section className="global-padding global-margin bg-white">
            <h2 className='global-h2 mb-8'>AFS Customer Service</h2>
            <div>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={40}
                    slidesPerView={"auto"}
                    ref={swiperRef}
                    navigation={{
                        nextEl: "#customNext",
                        prevEl: "#customPrev",
                    }}
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    className='w-full'
                >
                    {/* <SwiperSlide>Slide 1</SwiperSlide>
                    <SwiperSlide>Slide 2</SwiperSlide>
                    <SwiperSlide>Slide 3</SwiperSlide> */}
                    {CustomerServiceData.map((item) => (
                        <SwiperSlide className='!w-fit' key={item.title}>
                            <AmbassadorsCard data={item} />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className='flex items-center justify-center gap-4 mt-10'>
                    <button id="customPrev" className='p-2 rounded-full bg-[#E6E6E6]'>
                        <ArrowLeft className='w-7 h-7 text-[] cursor-pointer' strokeWidth={2} />
                    </button>
                    <button id="customNext" className='p-2 rounded-full bg-[#E6E6E6]'>
                        <ArrowRight className='w-7 h-7 text-[]  cursor-pointer' strokeWidth={2} />
                    </button>
                </div>
            </div>
        </section>
    )
}
=======
"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const CustomerServiceData = [
  {
    title: "Best match stab",
    description:
      "Find the stab that suits you best based on your front wing and your riding style.",
    url: "https://afs-foiling.com/fr/wp-content/uploads/2024/04/Alan-fedit-74-1-scaled.jpeg",
  },
  {
    title: "Foil configurator",
    description:
      "Find the complete foil that suits you from the AFS range based on your level and size.",
    url: "https://afs-foiling.com/fr/wp-content/uploads/2025/06/comparateur.png",
  },
  {
    title: "Compare 3 stabilizers",
    description: "Want to compare stabilizers with your front wing?",
    url: "https://afs-foiling.com/fr/wp-content/uploads/2023/04/Capture-decran-2025-06-05-a-16.07.13.png",
  },
  {
    title: "Equipment trade-in",
    description:
      "We will take back your old AFS equipment when you purchase a new product from us.",
    url: "https://afs-foiling.com/fr/wp-content/uploads/2024/11/Gwen-WB-d-lite-.jpg",
  },
  {
    title: "Need advice?",
    description:
      "Find out the different ways you can contact us: WhatsApp, chat, call an AFS expert, etc.",
    url: "https://afs-foiling.com/fr/wp-content/uploads/2024/10/00107169-bombannes-adultes-wingfoil.webp",
  },
];

const AmbassadorsCard = ({ data }) => {
  const { title, description, url } = data;

  return (
    <div className="bg-[#F7F7F7] md:max-w-[340px] lg:max-w-[430px] lg:h-[320px] h-auto flex lg:flex-row flex-col-reverse lg:items-stretch items-start rounded-[4px] overflow-hidden group relative">
      {/* Text */}
      <div className="lg:w-1/2 w-full flex flex-col p-5 gap-4">
        <p className="text-lg font-bold uppercase leading-[24px] break-words">
          {title}
        </p>
        <p className="text-base leading-[24px] text-[#00000080] font-semibold">
          {description}
        </p>

        <Link
          href="/text"
          className="flex items-center gap-1 text-[#00000080] font-bold uppercase block lg:hidden"
        >
          <span>See more</span>
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
        <div className="flex items-center gap-1 border-b-2 border-white cursor-pointer opacity-0 group-hover:opacity-100 delay-300 transition-opacity duration-300">
          <span>See more</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 5L5 19M19 5H6.4M19 5V17.6"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function CustomerService() {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="max-w-[1920px] mx-auto global-padding global-margin">
      <h2 className="global-h2 mb-8">AFS Customer Service</h2>

      <Swiper
        modules={[Navigation]}
        slidesPerView="auto"
        spaceBetween={40}
        breakpoints={{
          320: { spaceBetween: 20 },
          768: { spaceBetween: 24 },
          1024: { spaceBetween: 40 },
        }}
        navigation={{
          nextEl: "#customNext",
          prevEl: "#customPrev",
        }}
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        className="w-full"
      >
        {CustomerServiceData.map((item) => (
          <SwiperSlide key={item.title} className="!w-fit flex">
            <AmbassadorsCard data={item} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          id="customPrev"
          className={`p-2 rounded-full bg-[#E6E6E6] cursor-pointer transition-opacity duration-300 ${
            isBeginning ? "opacity-50" : "opacity-100"
          }`}
        >
          <ArrowLeft className="w-7 h-7 text-[#00000080]" strokeWidth={3} />
        </button>
        <button
          id="customNext"
          className={`p-2 rounded-full bg-[#E6E6E6] cursor-pointer transition-opacity duration-300 ${
            isEnd ? "opacity-50" : "opacity-100"
          }`}
        >
          <ArrowRight className="w-7 h-7 text-[#00000080]" strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}
>>>>>>> origin/main
