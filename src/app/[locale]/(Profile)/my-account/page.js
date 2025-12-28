"use client";
import FirstForm from '@/Shared/Form/My-Profile/FirstForm';
import ForthForm from '@/Shared/Form/My-Profile/ForthForm';
import SecondForm from '@/Shared/Form/My-Profile/SecondForm';
import ThirdForm from '@/Shared/Form/My-Profile/ThirdForm';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';


const Page = () => {


    const t = useTranslations("profile");
    const [message, setMessage] = useState({});

    return (
        <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]'>
            {/* Show Success Message */}
            {
                message?.success && message?.message && <div className='flex items-center gap-x-3 border-[#2A7029] border-2 py-4 px-8 mt-6 rounded-sm bg-[#FAFBF5]'>
                    <CheckCircle className='inline text-white fill-[#2A7029]' />
                    <p className='text-base leading-[100%] font-semibold text-[#2A7029]'>
                        {message.message}
                    </p>
                </div>
            }

            {/* Show Error Message */}
            {
                !message?.success && message?.message &&
                <div className='flex items-center gap-x-3 border-[#8b0000] border-2 py-4 px-8 mt-6 rounded-sm bg-[#F9F2F5]'>
                    <AlertCircle className='inline text-white fill-[#8b0000]' />
                    <p className='text-base leading-[100%] font-semibold text-[#8b0000]'>
                        {message.message}
                    </p>
                </div>
            }

            <div className='space-y-[clamp(0.875rem,0.5297rem+0.7203vw,1.25rem)]'>
                <h2 className='global-h2 capitalize'>{t("user")}</h2>
                <p className='profile-p capitalize'>
                    {t("here")}
                </p>
                <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]'>
                    {/* 1st form */}
                    <FirstForm setMessage={setMessage} />
                    {/* 2nd form */}
                    <SecondForm setMessage={setMessage} />
                    {/* 3rd form */}
                    <ThirdForm setMessage={setMessage} />
                    {/* 4th Form */}
                    <ForthForm setMessage={setMessage} />
                </div>
            </div>
        </div>
    );
};

export default Page;


