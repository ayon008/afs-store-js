import FeatureBar from '@/Shared/Afs-Events/FeatureBar';
import Register from '@/Shared/Form/Auth/Register';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import React from 'react';



export const metadata = {
    title: "Créer un compte | AFS Store",
    description:
        "Créez votre compte AFS Store pour profiter d'une expérience personnalisée, suivre vos commandes et accéder à des fonctionnalités exclusives.",
    keywords: "inscription, créer un compte, register, nouveau compte, AFS Store",
    openGraph: {
        title: "Inscription | AFS Store",
        description:
            "Créez votre compte AFS Store pour profiter d'une expérience personnalisée, suivre vos commandes et accéder à des fonctionnalités exclusives.",
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


const page = () => {
    return (
        <div>
            <div className='pt-4 bg-white/95 min-h-screen global-padding'>
                <BreadCums />
                <Register />
            </div>
        </div>
    );
};

export default page;