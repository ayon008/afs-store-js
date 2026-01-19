import React from 'react';
import { X } from "lucide-react";
import Image from 'next/image';
import PopUp from '../../PopUp/PopUp';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const GradeModal = ({ isOpen, setOpen, selectedGrade, setSelectedGrade, sliderImages, t }) => {
    return (
        <PopUp isOpen={isOpen} fn={setOpen}>
            <div onClick={(e) => e.stopPropagation()} className='max-w-[1120px] w-[95%] max-h-[80vh] overflow-x-hidden overflow-y-scroll scroll-bar relative mx-auto rounded-[4px] bg-white -z-20'>
                <button onClick={() => setOpen(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer'>
                    <X className="w-4 h-4 lg:text-black text-white z-10" />
                </button>
                {/* Content */}
                <div className='flex items-stretch gap-1 lg:flex-row flex-col'>
                    {/* Slider */}
                    <div className='flex-1 lg:w-1/2 w-full bg-[#111]'>
                        <Swiper
                            modules={[Navigation]}
                            navigation
                            slidesPerView={1}
                            spaceBetween={0}
                            className="swiper-grade w-full h-full"
                        >
                            {
                                sliderImages?.map((item, index) => {
                                    return (
                                        <SwiperSlide key={index} className='w-full h-full'>
                                            <div className="w-full h-full">
                                                <Image src={item} className='w-full h-full object-contain' alt={`Grade ${selectedGrade}`} width={100} height={100} />
                                            </div>
                                        </SwiperSlide>
                                    )
                                })
                            }
                        </Swiper>
                    </div>
                    {/* Content */}
                    <div className='flex-1 space-y-[30px] lg:px-5 lg:py-10 p-5 bg-white'>
                        <div className='space-y-[10px]'>
                            <h2 className='global-h2'>{t("Our grades")}</h2>
                            <p className='lg:text-lg text-base leading-[110%] font-semibold text-[#111111bf]'>
                                {t("Grade-p")}
                            </p>
                        </div>

                        <div className='flex flex-col gap-[10px]'>

                            {/* Grade A */}
                            <label className="cursor-pointer block">
                                <input
                                    type="radio"
                                    name="grade"
                                    value="A"
                                    checked={selectedGrade === "A"}
                                    onChange={() => setSelectedGrade("A")}
                                    className="peer hidden"
                                />

                                <div className="px-5 py-4 rounded-[20px] border border-[#111] flex items-start gap-2
              peer-checked:bg-[#1D98FF] peer-checked:text-white transition">
                                    <svg className='flex-[20px_0_0]' xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none"><path d="M10 12.5L8 10.3L8.6 9.29999M6 5.5H18L21 10.5L12.5 20C12.4348 20.0665 12.357 20.1194 12.2712 20.1554C12.1853 20.1915 12.0931 20.2101 12 20.2101C11.9069 20.2101 11.8147 20.1915 11.7288 20.1554C11.643 20.1194 11.5652 20.0665 11.5 20L3 10.5L6 5.5Z" stroke={selectedGrade === "A" ? "#fff" : "#1D98FF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold leading-[100%]">Grade A</h3>
                                        <p className="text-base leading-[110%] opacity-80">
                                            {t("grade_a_p")}
                                        </p>
                                    </div>
                                </div>
                            </label>

                            {/* Grade B */}
                            <label className="cursor-pointer block">
                                <input
                                    type="radio"
                                    name="grade"
                                    value="B"
                                    checked={selectedGrade === "B"}
                                    onChange={() => setSelectedGrade("B")}
                                    className="peer sr-only"
                                />

                                <div className="px-5 py-4 rounded-[20px] border border-[#111] flex items-start gap-3
              peer-checked:bg-[#111] peer-checked:text-white transition">
                                    <input
                                        type="radio"
                                        tabIndex={-1}
                                        checked={selectedGrade === "B"}
                                        readOnly
                                        className="mt-1 accent-[#1D98FF] pointer-events-none"
                                    />

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold leading-[100%]">Grade B</h3>
                                        <p className="text-base leading-[110%] opacity-80">
                                            {t("grade_b_p")}
                                        </p>
                                    </div>
                                </div>
                            </label>

                            {/* Grade C */}
                            <label className="cursor-pointer block">
                                <input
                                    type="radio"
                                    name="grade"
                                    value="C"
                                    checked={selectedGrade === "C"}
                                    onChange={() => setSelectedGrade("C")}
                                    className="peer sr-only"
                                />

                                <div className="px-5 py-4 rounded-[20px] border border-[#111] flex items-start gap-3
              peer-checked:bg-[#111] peer-checked:text-white transition">
                                    <input
                                        type="radio"
                                        tabIndex={-1}
                                        checked={selectedGrade === "C"}
                                        readOnly
                                        className="mt-1 accent-[#1D98FF] pointer-events-none"
                                    />

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold leading-[100%]">Grade C</h3>
                                        <p className="text-base leading-[110%] opacity-80">
                                            {t("grade_c_p")}
                                        </p>
                                    </div>
                                </div>
                            </label>

                        </div>
                    </div>

                </div>
            </div>
        </PopUp>
    );
};

export default GradeModal;
