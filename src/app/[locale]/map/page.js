import Link from 'next/link';
import React from 'react';
import Dealers from './Dealer';
import { getTranslations } from 'next-intl/server';
import { getDealers, getDealerType } from '@/app/actions/WC/getDealers';


export const metadata = {
    title: 'Find us - AFS Foiling',
    description: "Locate our stores, events and resellers across the world with AFS Foiling's interactive map",
    openGraph: {
        title: 'Find us - AFS Foiling',
        description: "Locate our stores, events and resellers across the world with AFS Foiling's interactive map",
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/map`,
        siteName: 'AFS Foiling',
    },
};

const BreadCums = async () => {
    const t = await getTranslations("breadcum");
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-black'>MAP</span>
            </div>
        </div>
    )
}


const page = async () => {
    const data = await getDealers();
    const t = await getTranslations("map");
    const categories = await getDealerType();
    return (
        <div className='bg-white relative pt-4'>
            <div className='global-padding'>
                <BreadCums />
                <div className='lg:my-[80px] my-[40px]'>
                    <h1 className='global-h1 text-center relative'>{t("Our partners")}</h1>
                    <p className='text-center mt-4 lg:w-[35%] w-full text-lg leading-[22px] font-semibold text-[#111111bf] mx-auto'>{t("p")}</p>
                </div>
            </div>
            <div className="px-5">
                <Dealers data={data} categories={categories} />
            </div>
        </div>
    );
};

export default page;