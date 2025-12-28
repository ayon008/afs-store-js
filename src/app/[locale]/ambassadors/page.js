import Link from 'next/link';
import React from 'react';

import Ambassedor from '@/Shared/Ambessadurs/Ambessadurs';
import getAmbessedor from '@/app/actions/WC/getAmbessadurs';
import getCountries from '@/app/actions/WC/getCountries';
import { getTranslations } from 'next-intl/server';

const BreadCums = async ({ locale }) => {
    const t = await getTranslations("breadcum", locale);
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-black'>Ambassadors
                </span>
            </div>
        </div>
    )
}


const page = async ({ locale }) => {
    const categories = await getAmbessedor();
    const countries = await getCountries();
    const t = await getTranslations("ambassadors", locale);

    return (
        <div className='global-padding pt-4'>
            <div className=''>
                <BreadCums />
            </div>
            <div className='lg:my-[80px] my-[40px]'>
                <h1 className='global-h1 text-center'>{t("afs")}<span className='global-blue'>{t("team")}</span></h1>
            </div>
            <Ambassedor categories={categories} countries={countries} />
        </div>
    );
};

export default page;