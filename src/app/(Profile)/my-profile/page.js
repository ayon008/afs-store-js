"use client";
import FirstForm from '@/Shared/Form/My-Profile/FirstForm';
import SecondForm from '@/Shared/Form/My-Profile/SecondForm';
import { AlertCircle, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';


const Page = () => {

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
                <h2 className='global-h2'>User information</h2>
                <p className='profile-p'>Here you can enter or edit public information about yourself. The data will be used in the future for ordering. The changes you make will be displayed immediately after saving.</p>
                <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]'>
                    {/* 1st form */}
                    <FirstForm setMessage={setMessage} />
                    {/* 2nd form */}
                    <SecondForm setMessage={setMessage} />
                    {/* 3rd form */}
                    {/* <ThirdForm /> */}
                    {/* 4th Form */}
                    {/* <ForthForm /> */}
                </div>
            </div>
        </div>
    );
};

export default Page;


