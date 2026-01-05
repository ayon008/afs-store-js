import React from 'react';
import Login from '@/Shared/Form/Auth/Login';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

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



const BreadCums = async () => {
    const t = await getTranslations("breadcum");
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