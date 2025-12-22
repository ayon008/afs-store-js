"use client"
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import PopUp from "../PopUp/PopUp";

const Reviews = ({ acf }) => {
    const thumbnail_one = acf?.thumbnail_one;
    const review_title = acf?.review_title;
    const video_url = acf?.video_url;
    const review_heading_tow = acf?.review_heading_tow;
    const thumbnail_tow = acf?.thumbnail_tow;
    const video_url_if_has_tow = acf?.video_url_if_has_tow;
    const [show, setShow] = useState(false);
    const [activeIndex, setActiveIndex] = useState(1);
    const [link, setLink] = useState(null);


    console.log(link);


    function extractYouTubeID(url) {
        const regExp =
            /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[7].length === 11 ? match[7] : null;
    }


    const swiperRef = useRef(null);

    const handleSlideChange = (swiper) => {
        setShow(false);
        setActiveIndex(swiper.realIndex);
    };

    if (!thumbnail_one) {
        return
    }


    return (
        <div>
            <p className='text-[28px] leading-[34px] font-semibold text-black mb-4'>Reviews</p>
            <div className="max-w-[1080px] rounded-sm overflow-hidden">
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={{
                        nextEl: "#customNext",
                        prevEl: "#customPrev",
                    }}
                    spaceBetween={20}
                    slidesPerView={1}
                    initialSlide={1}
                    loop={true}
                    onSlideChange={handleSlideChange}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        setActiveIndex(swiper.realIndex);
                    }}
                >
                    {
                        thumbnail_tow && <SwiperSlide>
                            <div className="relative">
                                <Image src={thumbnail_tow} width={1080} height={545} alt={review_title} className="" />
                                <div className="lg:absolute relative lg:bottom-0 lg:left-0 bg-black p-5 lg:w-[400px] w-full rounded-[4px]">
                                    <h3 className="text-[28px] leading-[100%] font-bold text-white">{review_heading_tow}</h3>
                                    <p onClick={() => {
                                        setShow(true)
                                        setLink(video_url_if_has_tow)
                                    }} className="text-base leading-[100%] text-[#077DD0] hover:text-white transition-colors duration-200 ease-in font-semibold mt-4 cursor-pointer">Regarder la review <ArrowUpRight className="inline" size={"1.2rem"} /></p>
                                </div>
                                <span onClick={() => {
                                    setShow(true)
                                    setLink(video_url_if_has_tow)
                                }} className='cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="1.5" y="1.5" width="53" height="53" rx="26.5" stroke="white" strokeWidth="3" strokeDasharray="10 10"></rect>
                                        <path d="M37 26.2679C38.3333 27.0377 38.3333 28.9623 37 29.7321L25 36.6603C23.6667 37.4301 22 36.4678 22 34.9282L22 21.0718C22 19.5322 23.6667 18.5699 25 19.3397L37 26.2679Z" fill="white"></path>
                                    </svg>
                                </span>
                            </div>
                        </SwiperSlide>
                    }
                    <SwiperSlide>
                        <div className="relative">
                            <Image src={thumbnail_one} width={1080} height={545} className="object-cover" alt={review_title} />
                            <div className="lg:absolute relative lg:bottom-0 lg:left-0 bg-black p-5 lg:w-[400px] w-full rounded-[4px]">
                                <h3 className="text-[28px] leading-[100%] font-bold text-white">{review_title}</h3>
                                <p onClick={() => {
                                    setShow(true)
                                    setLink(video_url)
                                }} className="text-base leading-[100%] text-[#077DD0] hover:text-white transition-colors duration-200 ease-in font-semibold mt-4 cursor-pointer">Regarder la review <ArrowUpRight className="inline" size={"1.2rem"} /></p>
                            </div>
                            <span onClick={() => {
                                setShow(true)
                                setLink(video_url)
                            }} className='cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1.5" y="1.5" width="53" height="53" rx="26.5" stroke="white" strokeWidth="3" strokeDasharray="10 10"></rect>
                                    <path d="M37 26.2679C38.3333 27.0377 38.3333 28.9623 37 29.7321L25 36.6603C23.6667 37.4301 22 36.4678 22 34.9282L22 21.0718C22 19.5322 23.6667 18.5699 25 19.3397L37 26.2679Z" fill="white"></path>
                                </svg>
                            </span>
                        </div>
                    </SwiperSlide>
                </Swiper>
                <div className="relative w-full">
                    {/* Navigation Button */}
                    <button
                        id="customPrev"
                        className="absolute top-1/2 left-0 -translate-y-1/2 z-50 bg-gray-100 text-gray-400 font-semibold p-2 rounded-full shadow cursor-pointer"
                    >
                        <ArrowLeft className='w-4 h-4' />
                    </button>
                    <button
                        id="customNext"
                        className="absolute top-1/2 right-0 -translate-y-1/2 z-50 bg-gray-100 text-gray-400 font-semibold p-2 rounded-full shadow cursor-pointer"
                    >
                        <ArrowRight className='w-4 h-4' />
                    </button>
                    <div className="w-[92%] mx-auto h-full flex items-center gap-2 mt-4">
                        <div
                            className="rounded-[4px] overflow-hidden relative cursor-pointer transition-opacity duration-200"
                            style={{ opacity: activeIndex === 1 ? 1 : 0.5 }}
                            onClick={() => swiperRef.current?.slideToLoop(1)}
                        >
                            <Image className="w-[120px] h-[80px]" src={thumbnail_one} alt={review_title} width={120} height={80} />
                            <svg className="video_indicator absolute top-0 left-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" rx="4" fill="#1F1F1F"></rect>
                                <path d="M14.25 10.5001L17.6647 8.79309C17.7791 8.73597 17.9061 8.709 18.0337 8.71475C18.1614 8.7205 18.2855 8.75877 18.3942 8.82594C18.5029 8.89311 18.5927 8.98695 18.6549 9.09854C18.7172 9.21014 18.7499 9.3358 18.75 9.46359V14.5366C18.7499 14.6644 18.7172 14.79 18.6549 14.9016C18.5927 15.0132 18.5029 15.1071 18.3942 15.1742C18.2855 15.2414 18.1614 15.2797 18.0337 15.2854C17.9061 15.2912 17.7791 15.2642 17.6647 15.2071L14.25 13.5001V10.5001Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                <path d="M12.75 7.5H6.75C5.92157 7.5 5.25 8.17157 5.25 9V15C5.25 15.8284 5.92157 16.5 6.75 16.5H12.75C13.5784 16.5 14.25 15.8284 14.25 15V9C14.25 8.17157 13.5784 7.5 12.75 7.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </div>
                        {
                            thumbnail_tow && <div
                                className="rounded-[4px] overflow-hidden relative cursor-pointer transition-opacity duration-200"
                                style={{ opacity: activeIndex === 0 ? 1 : 0.5 }}
                                onClick={() => swiperRef.current?.slideToLoop(0)}
                            >
                                <Image className="w-[120px] h-[80px]" src={thumbnail_tow} alt={review_heading_tow} width={120} height={80} />
                                <svg className="video_indicator absolute top-0 left-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="4" fill="#1F1F1F"></rect>
                                    <path d="M14.25 10.5001L17.6647 8.79309C17.7791 8.73597 17.9061 8.709 18.0337 8.71475C18.1614 8.7205 18.2855 8.75877 18.3942 8.82594C18.5029 8.89311 18.5927 8.98695 18.6549 9.09854C18.7172 9.21014 18.7499 9.3358 18.75 9.46359V14.5366C18.7499 14.6644 18.7172 14.79 18.6549 14.9016C18.5927 15.0132 18.5029 15.1071 18.3942 15.1742C18.2855 15.2414 18.1614 15.2797 18.0337 15.2854C17.9061 15.2912 17.7791 15.2642 17.6647 15.2071L14.25 13.5001V10.5001Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M12.75 7.5H6.75C5.92157 7.5 5.25 8.17157 5.25 9V15C5.25 15.8284 5.92157 16.5 6.75 16.5H12.75C13.5784 16.5 14.25 15.8284 14.25 15V9C14.25 8.17157 13.5784 7.5 12.75 7.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                        }
                    </div>
                </div>
            </div>


            {/* Pop Up for review */}
            <PopUp isOpen={show}>
                <div className="w-full bg-black/70 h-full relative flex items-center justify-center">
                    <div className="bg-white rounded-full cursor-pointer p-2 absolute top-4 right-4" onClick={() => setShow(!show)}>
                        <X className="w-4 h-4 text-black" />
                    </div>
                    <div className="max-w-[1024px] w-full h-[80%] mx-auto">
                        {show &&
                            <iframe
                                width="100%"
                                height="80%"
                                src={`https://www.youtube.com/embed/${extractYouTubeID(link)}?autoplay=1&mute=0`}
                                title="YouTube video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-[4px] mx-auto"
                            ></iframe>
                        }
                        <div className="backdrop-blur-[4px] mx-auto w-[40%] rounded-[4px] mt-4 bg-white/60 flex items-center justify-center gap-2 py-[10px] relative">
                            <div onClick={() => setLink(video_url)}
                                className={`relative w-fit overflow-hidden rounded-[4px] ${link == video_url ? "opacity-100" : "opacity-50"}`}>
                                <Image src={thumbnail_one} width={120} height={80} alt={review_title} className="w-[120px] h-[80px]" />
                                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                                    <svg width="20" height="20" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="1.5" y="1.5" width="53" height="53" rx="26.5" stroke="white" stroke-width="3" stroke-dasharray="10 10"></rect>
                                        <path d="M37 26.2679C38.3333 27.0377 38.3333 28.9623 37 29.7321L25 36.6603C23.6667 37.4301 22 36.4678 22 34.9282L22 21.0718C22 19.5322 23.6667 18.5699 25 19.3397L37 26.2679Z" fill="white"></path>
                                    </svg>
                                </span>
                            </div>
                            {
                                thumbnail_tow && (
                                    <div onClick={() => setLink(video_url_if_has_tow)} className={`relative w-fit overflow-hidden rounded-[4px] ${link == video_url_if_has_tow ? "opacity-100" : "opacity-50"}`}>
                                        <Image src={thumbnail_tow} width={120} height={80} alt={review_heading_tow} className="w-[120px] h-[80px]" />
                                        <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                                            <svg width="20" height="20" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="1.5" y="1.5" width="53" height="53" rx="26.5" stroke="white" stroke-width="3" stroke-dasharray="10 10"></rect>
                                                <path d="M37 26.2679C38.3333 27.0377 38.3333 28.9623 37 29.7321L25 36.6603C23.6667 37.4301 22 36.4678 22 34.9282L22 21.0718C22 19.5322 23.6667 18.5699 25 19.3397L37 26.2679Z" fill="white"></path>
                                            </svg>
                                        </span>
                                    </div>
                                )
                            }
                            <button
                                onClick={() => setLink(video_url)}
                                id="customPrev"
                                className="absolute top-1/2 left-4 -translate-y-1/2 z-50 bg-gray-100 text-gray-400 font-semibold p-2 rounded-full shadow cursor-pointer"
                            >
                                <ArrowLeft className='w-4 h-4' />
                            </button>
                            <button
                                onClick={() => setLink(video_url_if_has_tow)}
                                id="customNext"
                                className="absolute top-1/2 right-4 -translate-y-1/2 z-50 bg-gray-100 text-gray-400 font-semibold p-2 rounded-full shadow cursor-pointer"
                            >
                                <ArrowRight className='w-4 h-4' />
                            </button>
                        </div>
                    </div>
                </div>
            </PopUp>
        </div>
    );
};

export default Reviews;