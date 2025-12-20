import Link from 'next/link';
import React from 'react';

import Ambassedor from '@/Shared/Ambessadurs/Ambessadurs';
import getAmbessedor from '@/actions/WC/getAmbessadurs';
import getCountries from '@/actions/WC/getCountries';

const BreadCums = () => {
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>Accueil</Link> / <span className='text-black'>Nos ambassadeurs
                </span>
            </div>
        </div>
    )
}


const page = async () => {
    const categories = await getAmbessedor();
    const countries = await getCountries();

    return (
        <div className='global-padding pt-4'>
            <div className=''>
                <BreadCums />
            </div>
            <div className='lg:my-[80px] my-[40px]'>
                <h1 className='global-h1 text-center'>AFS Ambassadors <span className='global-blue'>team</span></h1>
            </div>
            <Ambassedor categories={categories} countries={countries} />
        </div>
    );
};

export default page;