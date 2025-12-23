"use client"
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
// Import required Swiper modules
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Reviews from '../Reviews/Reviews';
import default_image from "../../../public/assets/images/Team/Group-1-3.png.webp"
// import ProductDetails from './ProductDetails';
import { getProductBySlug } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import ShimmerLoader from '../Loader/ShimmerLoader';
import FaqSection from './FaqSection';
import PopUp from '../PopUp/PopUp';
import ProductDetails from './ProductDetails';

// For youtube link in review and pop up section
function extractYouTubeID(url) {
    const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
}


const SingleProduct = () => {

    const swiperRef = useRef(null); // Swiper instance
    const [activeIndex, setActiveIndex] = useState(0); // track active slide

    const [default_slide, setSlide] = useState(1);

    const params = useParams();
    const { slug } = params;

    const [loader, setLoader] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoader(true);
            const data = await getProductBySlug(slug);
            setData(data);
            setLoader(false);
        }
        load();
    }, [slug])

    console.log(data, 'data');

    const [images, setImages] = useState([]);
    const [sliceLength, setLength] = useState(0);
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        if (!data) return; // wait for data to load

        const gallery_video_url_1 = data?.acf?.gallery_video_url_1;
        const gallery_thumbnail_1 = data?.acf?.gallery_thumbnail_1;
        const gallery_video_url_2 = data?.acf?.gallery_video_url_2;
        const gallery_thumbnail_2 = data?.acf?.gallery_thumbnail_2;

        // clone array (very important!)
        let newImages = [...(data?.images || [])];

        if (gallery_video_url_1) {
            newImages.splice(1, 0, { id: 208234, src: gallery_thumbnail_1?.url, video: true, alt: "", link: gallery_video_url_1 });
        }

        if (gallery_thumbnail_2) {
            newImages.splice(2, 0, { id: 208235, src: gallery_thumbnail_2?.url, video: true, alt: "", link: gallery_video_url_2 });
        }

        if (newImages?.length > 4) {
            setLength(4);
        } else if (newImages?.length < 4) {
            setLength(newImages?.length);
        }

        setImages(newImages);

    }, [data]); // re-run whenever data loads


    const acf = data?.acf;



    if (loader) {
        return (
            <div className='global-padding pt-4 max-w-[1920px] mx-auto'>
                <ShimmerLoader />
            </div>
        )
    }


    return (
        <div className='global-padding lg:pt-4 pt-0 max-w-[1920px] mx-auto w-full'>
            {/* <BreadCums /> */}
            <div className='flex items-start lg:flex-row flex-col justify-between gap-10'>
                <div className='lg:w-[60%] w-full'>
                    <div className='lg:grid grid-cols-2 gap-2.5 relative hidden'>
                        {
                            images?.slice(0, sliceLength)?.map((singleImage, i) => {
                                return (
                                    <div onClick={() => {
                                        setOpen(true)
                                        setSlide(i)
                                    }} className='rounded-sm overflow-hidden bg-black relative cursor-pointer' key={i}>
                                        <Image src={singleImage?.src || default_image} width={649} height={649} className='w-full h-full object-cover aspect-[1]' alt={singleImage?.alt} />
                                        {
                                            singleImage?.video &&
                                            <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                                                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1.5" y="1.5" width="53" height="53" rx="26.5" stroke="white" strokeWidth="3" strokeDasharray="10 10"></rect>
                                                    <path d="M37 26.2679C38.3333 27.0377 38.3333 28.9623 37 29.7321L25 36.6603C23.6667 37.4301 22 36.4678 22 34.9282L22 21.0718C22 19.5322 23.6667 18.5699 25 19.3397L37 26.2679Z" fill="white"></path>
                                                </svg>
                                            </span>
                                        }
                                    </div>
                                )
                            })
                        }
                        {
                            sliceLength === 4 && <button className='px-4 py-2 rounded-[20px] bg-white border-[#ccc] border w-fit text-base leading-6 font-semibold absolute left-1/2 -translate-x-1/2 -bottom-5 cursor-pointer' onClick={() => setLength(images?.length)}>View all</button>
                        }
                        {
                            sliceLength > 4 && <button className='px-4 py-2 rounded-[20px] bg-white border-[#ccc] border w-fit text-base leading-6 font-semibold absolute left-1/2 -translate-x-1/2 -bottom-5 cursor-pointer' onClick={() => {
                                setLength(4)
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}>Voir moins</button>
                        }
                    </div>
                    <div className='lg:hidden block -mx-5 bg-[#111]'>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            slidesPerView={1}
                            pagination={{ clickable: true }}
                            loop={true}
                            className='mobile-banner'
                        >
                            {
                                images?.map((singleImage, i) => {
                                    return (
                                        <SwiperSlide onClick={() => {
                                            setOpen(true)
                                            setSlide(i)
                                        }} key={i}>
                                            <div className=''>
                                                <Image src={singleImage?.src || default_image} width={649} height={649} className='w-full h-full object-cover aspect-[1]' alt={singleImage?.alt} />
                                                {
                                                    singleImage?.video &&
                                                    <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                                                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="1.5" y="1.5" width="53" height="53" rx="26.5" stroke="white" strokeWidth="3" strokeDasharray="10 10"></rect>
                                                            <path d="M37 26.2679C38.3333 27.0377 38.3333 28.9623 37 29.7321L25 36.6603C23.6667 37.4301 22 36.4678 22 34.9282L22 21.0718C22 19.5322 23.6667 18.5699 25 19.3397L37 26.2679Z" fill="white"></path>
                                                        </svg>
                                                    </span>
                                                }
                                            </div>
                                        </SwiperSlide>
                                    )
                                })
                            }
                        </Swiper>
                    </div>
                </div>


                {/* Details */}
                <div className='lg:w-[40%] w-full'>
                    <ProductDetails data={data} />
                </div>
            </div>

            {/* Characteristics */}
            <FaqSection acf={acf} />


            {/* Reviews */}
            <Reviews acf={acf} />



            {/* Pop Up for image gallery*/}
            <PopUp isOpen={isOpen}>
                <div className='w-full h-full overflow-hidden bg-white relative flex items-center justify-center'>
                    <div className='absolute top-2 right-2 z-10 rounded-full border border-black text-black p-1 cursor-pointer'>
                        <X className='w-5 h-5' onClick={() => setOpen(!isOpen)} />
                    </div>
                    <div className='w-full h-full'>
                        <div className='w-full h-full mx-auto flex flex-col items-center justify-center relative'>
                            <Swiper
                                modules={[Navigation, Pagination]}
                                navigation={{
                                    nextEl: "#customNext",
                                    prevEl: "#customPrev",
                                }}
                                spaceBetween={10}
                                slidesPerView={1}
                                initialSlide={default_slide}
                                onSwiper={(swiper) => (swiperRef.current = swiper)}
                                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                                className="mySwiper z-20 lg:w-[80%] w-[90%] h-[80%] relative"
                            >
                                {
                                    images?.map((img, i) => {
                                        return (
                                            <SwiperSlide key={i} className='w-full h-full'>
                                                <div className='w-full h-full relative flex items-center justify-center aspect-video'>
                                                    {
                                                        img?.video ?
                                                            <>
                                                                <iframe
                                                                    width="100%"
                                                                    height="100%"
                                                                    src={activeIndex === i ? `https://www.youtube.com/embed/${extractYouTubeID(img.link)}?autoplay=1&mute=0` : ""}
                                                                    title="YouTube video"
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                    className="rounded-[4px] mx-auto block"
                                                                ></iframe>
                                                            </> :
                                                            <Image src={img?.src} className='w-full h-full rounded-[4px] object-contain aspect-[1]' width={649} height={649} alt={img?.alt} />
                                                    }
                                                </div>
                                            </SwiperSlide>
                                        )
                                    })
                                }

                                {/* Pagination */}
                                <div className='absolute left-0 right-0 bottom-0 px-3 py-[10px] w-full z-50 backdrop-blur-[4px] border border-gray-200 rounded-[4px] items-center justify-center bg-white/20 gap-2 md:flex hidden'>
                                    {
                                        images?.map((singleImage, index) => {
                                            const isActive = activeIndex === index || default_slide === index;
                                            return (
                                                <div
                                                    onClick={() => swiperRef.current?.slideTo(index)}
                                                    key={singleImage?.id}
                                                    className={`overflow-hidden rounded-[4px] relative cursor-pointer transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}
                                                >
                                                    <Image src={singleImage?.src} width={54} height={54} alt='' className='w-[54px] h-[54px] aspect-[1]' />
                                                    {
                                                        singleImage?.video &&
                                                        <span onClick={() => setOpen(true)} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                                                            <svg width="20" height="20" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <rect x="1.5" y="1.5" width="53" height="53" rx="26.5" stroke="white" strokeWidth="3" strokeDasharray="10 10"></rect>
                                                                <path d="M37 26.2679C38.3333 27.0377 38.3333 28.9623 37 29.7321L25 36.6603C23.6667 37.4301 22 36.4678 22 34.9282L22 21.0718C22 19.5322 23.6667 18.5699 25 19.3397L37 26.2679Z" fill="white"></path>
                                                            </svg>
                                                        </span>
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </Swiper>
                            {/* Navigation Button */}
                            <button
                                id="customPrev"
                                className="absolute md:top-1/2 md:left-4 md:bottom-auto md:right-auto bottom-5 right-20  md:-translate-y-1/2 z-50 border border-black p-2 rounded-full shadow cursor-pointer"
                            >
                                <ArrowLeft className='w-4 h-4' />
                            </button>
                            <button
                                id="customNext"
                                className="absolute md:top-1/2 md:bottom-auto md:right-4 md:-translate-y-1/2  bottom-5 right-5 z-50 border border-black p-2 rounded-full shadow cursor-pointer"
                            >
                                <ArrowRight className='w-4 h-4' />
                            </button>
                            {/* */}
                        </div>
                    </div>
                </div>
            </PopUp>
        </div>
    );
};


export default SingleProduct;