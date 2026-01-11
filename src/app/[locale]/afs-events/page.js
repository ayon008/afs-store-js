import Events from '@/Shared/Afs-Events/Events';
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

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


const BreadCums = async () => {
    const t = await getTranslations("breadcum");
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-white'>MAP</span>
            </div>
        </div>
    )
}


const page = async () => {
    const t = await getTranslations("afs-event");
    return (
        <div className='bg-[#111111] text-white'>
            <div className='global-padding relative pt-4 text-white'>
                <BreadCums />
                <div className='lg:my-[80px] my-[40px]'>
                    <h1 className='global-h1 text-center relative'>AFS Events</h1>
                    <p className='text-center mt-4 lg:max-w-[360px] w-full text-lg leading-[22px] font-semibold mx-auto'>{t("headline")}</p>
                </div>
            </div>
            <div className='lg:pl-[clamp(1.25rem,-5.4167rem+10.4167vw,5rem)]'>
                <Events />
            </div>
        </div>
    );
};

export default page;