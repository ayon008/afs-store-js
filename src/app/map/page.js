import Link from 'next/link';
import React from 'react';
import Dealers from './Dealer';


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

const BreadCums = () => {
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>Accueil</Link> / <span className='text-black'>MAP</span>
            </div>
        </div>
    )
}


const page = async () => {

    return (
        <div className='bg-white global-padding relative pt-4'>
            <div>
                <BreadCums />
                <div className='lg:my-[80px] my-[40px]'>
                    <h1 className='global-h1 text-center relative'>Nos partenaires</h1>
                    <p className='text-center mt-4 lg:w-[35%] w-full text-lg leading-[22px] font-semibold text-[#111111bf] mx-auto'>Faites l’expérience de la qualité de nos produits en les découvrant chez les revendeurs locaux de confiance de votre région.</p>
                </div>
            </div>
            <Dealers />
        </div>
    );
};

export default page;