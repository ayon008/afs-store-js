import Link from 'next/link';
import React from 'react';
import FeatureBar from '@/Shared/Afs-Events/FeatureBar';
import Login from '@/Shared/Form/Auth/Login';

export const metadata = {
    title: "Mon compte | AFS Store",
    description: "Connectez-vous à votre compte AFS Store pour accéder à votre profil, vos commandes et vos fonctionnalités exclusives.",
    keywords: "connexion, se connecter, compte, authentification",
    openGraph: {
        title: "Connexion | AFS Store",
        description: "Connectez-vous à votre compte AFS Store pour accéder à votre profil, vos commandes et vos fonctionnalités exclusives.",
        type: "website",
    },
};



const BreadCums = () => {
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>Accueil</Link> / <span className='text-black'>Mon compte</span>
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
            <FeatureBar />
        </div>
    );
};

export default page;