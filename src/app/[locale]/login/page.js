import Link from 'next/link';
import React from 'react';
import FeatureBar from '@/Shared/Afs-Events/FeatureBar';
import Login from '@/Shared/Form/Auth/Login';
import { getTranslations } from 'next-intl/server';

export const metadata = {
    title: "My Account | AFS Store",
    description: "Login to your AFS Store account to access your profile, orders and exclusive features.",
    keywords: "login, account, profile, orders, exclusive features",
    openGraph: {
        title: "Login | AFS Store",
        description: "Login to your AFS Store account to access your profile, orders and exclusive features.",
        type: "website",
    },
};



const BreadCums = async ({ locale }) => {
    const t = await getTranslations("breadcum", locale);
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-black'>My Account</span>
            </div>
        </div>
    )
}

const page = async () => {
    return (
        <div>
            <div className='pt-4 global-padding bg-white/95 min-h-screen'>
                <BreadCums />
                <Login />
            </div>
        </div>
    );
};

export default page;