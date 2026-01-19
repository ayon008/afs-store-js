import React from 'react';
import { ArrowUpRight } from "lucide-react";
import Image from 'next/image';

const ExpertAdvice = ({ t, onOpenContact }) => {
    return (
        <div className='flex items-stretch bg-[#F0F0F0] mt-10'>
            <div className='p-4 2xl:w-[60%] w-full flex flex-col justify-between h-full'>
                <div className="space-y-2">
                    <p className='text-xs font-semibold text-[#666666]'>{t("expert")}</p>
                    <h3 className='font-bold text-base leading-6'>{t("need")}</h3>
                    <p className='text-[15px] leading-4 text-[#666666]/75'>{t("we")}</p>
                </div>
                <p
                    onClick={onOpenContact}
                    className='text-sm flex items-center cursor-pointer leading-4 font-semibold mt-8 uppercase text-[#3F98FF]'
                >
                    {t("phone")} <ArrowUpRight className='inline w-4 h-4' />
                </p>
            </div>
            <div className='2xl:w-[40%] w-0 bg-[url("https://afs-foiling.com/fr/wp-content/uploads/2025/06/bg_img-1.png")] bg-contain bg-center bg-no-repeat'>
                <Image
                    src={'https://afs-foiling.com/fr/wp-content/uploads/2025/06/image-33-1.png.webp'}
                    className='aspect-[1] w-full h-full object-cover'
                    alt=''
                    width={200}
                    height={200}
                />
            </div>
        </div>
    );
};

export default ExpertAdvice;
