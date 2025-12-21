"use client"
import React, { useState } from 'react';
const default_image = "/assets/images/Team/Group-1-3.png.webp"
import Image from 'next/image';
import PopUp from '../PopUp/PopUp';
import { X } from 'lucide-react';


const AmbassadorsCard = ({ data }) => {
    const memberData = data?.acf;
    const profile = data?.acf?.profile;
    const url = profile?.url || default_image;
    const title = profile?.title || "";
    const country = data?.acf?.country;
    const first_name = memberData?.first_name_;
    const last_name = memberData?.last_name
    const homeSpot = memberData?.home_spot;
    const [isOpen, setIsOpen] = useState(false);
    const sport = memberData?.sport;
    const instagram = memberData?.instagram;
    const starva = memberData?.starva;
    const youtube = memberData?.youtube;

    return (
        <div>
            <div className='lg:h-[300px] h-auto flex lg:flex-row flex-col-reverse lg:items-stretch items-start rounded-[4px] overflow-hidden group relative shadow-[0_0_50px_10px_#0000000D]'>
                <div className='lg:w-1/2 w-full flex flex-col justify-between p-5'>
                    <p className='text-lg font-bold uppercase leading-[24px] break-words'>{title}</p>
                    <p className='text-base leading-[24px] text-[#00000080] font-semibold'>{country}</p>
                    <div className='flex items-center gap-1 border-white border-b-[2px] lg:hidden'>
                        <span>
                            Voir plus
                        </span>
                        <svg width="18" height="18" className='font-bold text-[#00000080] mt-1' viewBox="0 0 24 24" fill="#00000080">
                            <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="#00000080" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
                <div className='lg:w-1/2 w-full'>
                    <Image src={url} alt='' height={300} width={200} className='w-full lg:h-full h-[300px] object-cover grayscale' />
                </div>
                {/* Overlay */}
                <div className="absolute inset-4 group-hover:inset-0 bg-black/60 
                opacity-0 group-hover:opacity-100 
                transition-all duration-500 lg:flex hidden items-center justify-center text-white text-lg font-bold uppercase leading-[24px]">
                    <div className='flex items-center group-hover:opacity-100 opacity-0 delay-300 transition-opacity duration-300 gap-1 border-white border-b-[2px] cursor-pointer' onClick={() => setIsOpen(true)}>
                        <span>
                            Voir plus
                        </span>
                        <svg width="18" height="18" className='text-white font-bold' viewBox="0 0 24 24" fill="none">
                            <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="white" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Pop UP */}
            <PopUp isOpen={isOpen}>
                <div className='w-[90%] mx-auto bg-white/95 max-w-[1280px] lg:h-[80%] h-fit flex lg:flex-row flex-col items-stretch justify-center rounded-3xl shadow-xl overflow-hidden'>
                    <div className='lg:w-1/2 w-full h-full lg:py-10 overflow-hidden overflow-y-scroll popup-scroll-bar py-5 lg:px-5 px-5 relative'>
                        <h2 className='global-h2 uppercase'>
                            <span>{first_name} </span>
                            <span className='text-[#248FEB]'>{last_name}</span>
                        </h2>
                        <div className='h-full lg:pb-10 pb-5'>
                            <div className='mt-6'>
                                <p className='text-[28px] text-black uppercase'>Country</p>
                                <h4 className='text-[28px] uppercase mt-1 text-[#0000004d]'>
                                    {country}
                                </h4>
                            </div>
                            <div className='mt-3'>
                                <p className='text-[28px] text-black uppercase'>home spot</p>
                                <h4 className='text-[28px] uppercase mt-1 text-[#0000004d]'>
                                    {homeSpot}
                                </h4>
                            </div>
                            <div className='mt-3'>
                                <p className='text-[28px] text-black uppercase'>sport</p>
                                <h4 className='text-[28px] uppercase mt-1 text-[#0000004d]'>
                                    {sport}
                                </h4>
                            </div>
                            <div onClick={() => setIsOpen(false)} className='flex items-center justify-center absolute top-6 right-6 w-10 h-10 rounded-full bg-white cursor-pointer lg:hidden'>
                                X
                            </div>
                        </div>
                    </div>
                    <div className='lg:w-1/2 w-full lg:block hidden group h-full relative'>
                        {/* 1st Image */}
                        <Image
                            src={url}
                            alt={name}
                            className='
                    w-full h-full object-cover object-center
                '
                            width={351}
                            height={492}
                        />
                        <div onClick={() => setIsOpen(!isOpen)} className='flex items-center justify-center absolute top-6 right-6 w-10 h-10 rounded-full bg-white cursor-pointer'>
                            <X className='w-5 h-5' />
                        </div>
                    </div>
                </div>
            </PopUp>
        </div>
    );
};

export default AmbassadorsCard;