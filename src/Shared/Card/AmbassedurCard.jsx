"use client"
import React, { useState } from 'react';
const default_image = "/assets/images/Team/Group-1-3.png.webp"
import Image from 'next/image';
import PopUp from '../PopUp/PopUp';
import { Facebook, Instagram, X, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';


const AmbassadorsCard = ({ data }) => {
    const memberData = data?.acf;
    const profile = data?.acf?.profile;
    const url = profile?.url || default_image;
    const title = profile?.title || "";
    const country = data?.acf?.country;
    const first_name = memberData?.first_name_;
    const birthDate = memberData?.dob;
    const last_name = memberData?.last_name
    const homeSpot = memberData?.home_spot;
    const [isOpen, setIsOpen] = useState(false);
    const sport = memberData?.sport;
    const instagram = memberData?.instagram;
    const starva = memberData?.starva;
    const facebook = memberData?.facebook;
    const youtube = memberData?.youtube;
    const t = useTranslations("home");
    const a = useTranslations("ambassadors");
    return (
        <div>
            <div className='lg:h-[300px] h-auto flex lg:flex-row flex-col-reverse lg:items-stretch items-start rounded-[4px] overflow-hidden group relative shadow-[0_0_50px_10px_#0000000D]'>
                <div className='lg:w-1/2 w-full flex flex-col justify-between p-5'>
                    <p className='text-lg font-bold uppercase leading-[24px] break-words'>{title}</p>
                    <p className='text-base leading-[24px] text-[#00000080] font-semibold'>{country}</p>
                    <div onClick={() => setIsOpen(true)} className='flex items-center gap-1 border-white border-b-[2px] lg:hidden'>
                        <span>
                            {t("see-more")}
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
                            {t("see-more")}
                        </span>
                        <svg width="18" height="18" className='text-white font-bold' viewBox="0 0 24 24" fill="none">
                            <path d="M19 5L5 19M19 5H6.4M19 5V17.6" stroke="white" strokeWidth="2" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Pop UP */}
            <PopUp isOpen={isOpen} fn={setIsOpen}>
                <div onClick={(e) => e.stopPropagation()} className='w-[90%] mx-auto bg-white max-w-[1280px] h-[80vh] max-h-[720px] flex lg:flex-row flex-col items-stretch justify-center rounded-3xl shadow-xl overflow-hidden relative'>
                    <div onClick={() => setIsOpen(false)} className='flex items-center justify-center absolute lg:top-6 top-2 right-6 w-10 h-10 rounded-full bg-white cursor-pointer lg:hidden'>
                        X
                    </div>
                    <div className='lg:w-1/2 w-full max-h-full relative scroll-bar overflow-y-scroll lg:p-[clamp(2.5rem,0rem+3.125vw,3.125rem)] p-5'>
                        <h2 className='lg:text-[clamp(3.75rem,-1.25rem+6.25vw,5rem)]! text-[40px]! global-h2 leading-[110%]! uppercase flex gap-1 flex-wrap'>
                            <span className='break-all'>{first_name}</span>
                            <span className='text-[#248FEB] break-all'>{last_name}</span>
                        </h2>
                        <div className='space-y-5 mt-6'>
                            <div className='space-y-2'>
                                <p className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[100%] text-black uppercase'>{a("country")}</p>
                                <h4 className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[100%] uppercase mt-1 text-[#0000004d]'>
                                    {country}
                                </h4>
                            </div>
                            <div className='space-y-2'>
                                <p className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[100%] text-black uppercase'>Date of Birth</p>
                                <h4 className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[100%] uppercase mt-1 text-[#0000004d]'>
                                    {birthDate}
                                </h4>
                            </div>
                            <div className='space-y-2'>
                                <p className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[100%] text-black uppercase'>{a("home-spot")}</p>
                                <h4 className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[110%] uppercase mt-1 text-[#0000004d]'>
                                    {homeSpot}
                                </h4>
                            </div>
                            <div className='space-y-2'>
                                <p className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[100%] text-black uppercase'>sport</p>
                                <h4 className='lg:text-[clamp(1.75rem,0rem+2.1875vw,2.1875rem)] text-[20px] leading-[100%] uppercase mt-1 text-[#0000004d]'>
                                    {sport}
                                </h4>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {
                                    instagram && <a href={instagram} target='_blank'>
                                        <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/02/Vector.svg`} width={100} height={100} className='lg:w-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] lg:h-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] w-[32px] h-[32px]' alt='instagram' />
                                    </a>
                                }
                                {
                                    facebook && <a href={facebook} target='_blank'>
                                        <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/01/svgviewer-output-37.svg`} width={100} height={100} className='lg:w-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] lg:h-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] w-[32px] h-[32px]' alt='facebook' />
                                    </a>
                                }
                                {
                                    youtube && <a href={youtube} target='_blank'>
                                        <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/02/youtube-round-svgrepo-com-1.svg`} width={100} height={100} className='lg:w-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] lg:h-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] w-[32px] h-[32px]' alt='youtube' />
                                    </a>
                                }
                                {
                                    starva && <a href={starva} target='_blank'>
                                        <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/02/strava-svgrepo-com-1.svg`} width={100} height={100} className='lg:w-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] lg:h-[clamp(2rem,-1.75rem+4.6875vw,2.9375rem)] w-[32px] h-[32px]' alt='starva' />
                                    </a>
                                }
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