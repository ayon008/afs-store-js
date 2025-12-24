import Events from '@/Shared/Afs-Events/Events';
import Link from 'next/link';
import React from 'react';
import { getTranslations } from 'next-intl/server';

// import FeatureBar from '../../constants/FeatureBar';

export const metadata = {
    title: 'AFS EVENTS - FRANCE US UK EU - AFS',
    description: "AFS Events all over the globe",
    openGraph: {
        title: 'AFS EVENTS - FRANCE US UK EU - AFS',
        description: "AFS Events all over the globe",
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/map`,
        siteName: 'AFS Foiling',
    },
};


const BreadCums = async ({ locale }) => {
    const t = await getTranslations("breadcum", locale);
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-white'>MAP</span>
            </div>
        </div>
    )
}


const page = async ({ locale }) => {
    const t = await getTranslations("afs-event", locale);
    return (
        <div>
            <div className='bg-[#111111] global-padding relative pt-4 min-h-screen text-white'>
                <BreadCums />
                <div className='lg:mt-[80px] mt-[40px] global-margin'>
                    <h1 className='global-h1 text-center relative'>AFS Events</h1>
                    <p className='text-center mt-4 lg:w-[40%] w-full text-lg leading-[22px] font-semibold mx-auto'>{t("headline")}</p>
                </div>
                <Events />
            </div>
        </div>
    );
};

export default page;