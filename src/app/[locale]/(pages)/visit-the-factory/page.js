"use client"
import PopUp from '@/Shared/PopUp/PopUp'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { useTranslations } from 'next-intl'


const BreadCums = () => {
    const t = useTranslations('breadcum');
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t('home')}</Link> / <span className='text-black'>{t("Visit The Factory")}</span>
            </div>
        </div>
    )
}

const Page = () => {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('visit');
    return (
        <div className="visit-the-factory h-screen relative" style={{ backgroundImage: "url('https://staging.afs-foiling.com/wp-content/uploads/2025/03/image-1-5.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[15px] z-[1]"></div>
            <div className="max-w-[1920px] mx-auto global-padding pt-4 pb-20 flex flex-col h-full justify-between gap-5 relative z-10">
                <BreadCums />
                <div className="flex lg:flex-row items-end flex-col justify-between gap-5 h-full">
                    <div>
                        <h1 className="text-[40px] max-w-[475px] font-bold leading-[110%] mb-5 text-white">{t("precission")}</h1>
                        <p className="text-[#FFFFFFCC] text-lg" >{t("the-production")}</p>
                    </div>

                    <div className="relative overflow-hidden rounded-sm lg:flex-[50%_0_0] flex-1">
                        <Image
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/03/image-1-5.png"
                            className="rounded-sm bg-white"
                            alt="Tour"
                            width={1000}
                            height={1000}
                        />

                        {/* Desktop Play Button */}
                        <div className="absolute inset-0 justify-center items-center bg-black/20 hidden lg:flex">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-white rounded-full text-white cursor-pointer transition-all duration-200"
                            >
                                <Play className="h-5 w-5 text-white fill-white" />
                                <span className="text-white text-base font-semibold tracking-wider">
                                    {t("play")}
                                </span>
                            </button>
                        </div>

                        {/* Mobile Play Button */}
                        <div className="absolute inset-0 flex justify-center items-center bg-black/20 lg:hidden">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white rounded-full text-white cursor-pointer transition-all duration-200"
                            >
                                <Play className="h-4 w-4 text-white fill-white" />
                                <span className="text-white text-sm font-semibold tracking-wider">
                                    {t("play")}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>





            <PopUp isOpen={isOpen}>
                <div className="w-full h-full bg-black/50 flex items-center justify-center relative">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 cursor-pointer"
                    >
                        <X className="w-4 h-4 text-black" />
                    </button>
                    <div className="mx-auto flex items-center justify-center max-w-[90vw] w-[90%] sm:w-[80%] aspect-video">
                        <iframe
                            src="https://www.youtube.com/embed/Du02h7xfe8s?si=QxG1YTe8dBxcvrgN"
                            title="YouTube video player"
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "0",
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>
            </PopUp>
        </div>
    )
}

export default Page