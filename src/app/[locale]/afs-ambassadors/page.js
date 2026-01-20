import React from 'react';

import Ambassedor from '@/Shared/Ambessadurs/Ambessadurs';
import { Link } from '@/i18n/navigation';
import getAmbessedor from '@/app/actions/WC/getAmbessadurs';
import getCountries from '@/app/actions/WC/getCountries';
import { getTranslations, getLocale } from 'next-intl/server';
import { allAmbassadors } from '@/app/actions/WC/getAllAmbessador';
import RankMathHead from '@/Shared/SEO/RankMathHead';
import { getRankMathHead } from '@/lib/rankmath-head';
import { mergeRankMathMetadata } from '@/lib/seo-utils';
import { generateHreflangAlternates } from '@/lib/seo-utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://afs-foiling.com';

export async function generateMetadata() {
  const locale = await getLocale();
  const isEnglish = locale === 'en';
  const ambassadorsPath = '/afs-ambassadors';
  const currentUrl = isEnglish ? `${BASE_URL}${ambassadorsPath}` : `${BASE_URL}/fr${ambassadorsPath}`;

  // Base metadata
  const baseMetadata = {
    title: isEnglish ? 'AFS Ambassadors' : 'Ambassadeurs AFS',
    description: isEnglish
      ? 'Meet the AFS Ambassadors - Elite foiling athletes and enthusiasts representing AFS worldwide.'
      : 'Rencontrez les Ambassadeurs AFS - Athlètes et passionnés de foil d\'élite représentant AFS dans le monde entier.',
    alternates: {
      canonical: currentUrl,
      languages: generateHreflangAlternates(ambassadorsPath),
    },
    openGraph: {
      type: 'website',
      title: isEnglish ? 'AFS Ambassadors' : 'Ambassadeurs AFS',
      description: isEnglish
        ? 'Meet the AFS Ambassadors - Elite foiling athletes and enthusiasts representing AFS worldwide.'
        : 'Rencontrez les Ambassadeurs AFS - Athlètes et passionnés de foil d\'élite représentant AFS dans le monde entier.',
      url: currentUrl,
      siteName: 'AFS',
      locale: isEnglish ? 'en_US' : 'fr_FR',
      alternateLocale: isEnglish ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: isEnglish ? 'AFS Ambassadors' : 'Ambassadeurs AFS',
      description: isEnglish
        ? 'Meet the AFS Ambassadors - Elite foiling athletes and enthusiasts representing AFS worldwide.'
        : 'Rencontrez les Ambassadeurs AFS - Athlètes et passionnés de foil d\'élite représentant AFS dans le monde entier.',
    },
  };

  // Fetch Rank Math metadata
  let rankMathData = null;
  try {
    const wpPath = locale === 'fr' ? '/fr/afs-ambassadors/' : '/afs-ambassadors/';
    rankMathData = await getRankMathHead(wpPath, locale);
  } catch (error) {
    console.error('[Ambassadors SEO] Error fetching Rank Math data:', error);
  }

  if (rankMathData) {
    return mergeRankMathMetadata(baseMetadata, rankMathData, {
      languages: generateHreflangAlternates(ambassadorsPath),
    });
  }

  return baseMetadata;
}

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
    const data = await allAmbassadors();
    const countries = await getCountries();
    const t = await getTranslations("ambassadors", locale);
    
    // Fetch Rank Math data for JSON-LD injection
    let rankMathData = null;
    try {
        const wpPath = locale === 'fr' ? '/fr/afs-ambassadors/' : '/afs-ambassadors/';
        rankMathData = await getRankMathHead(wpPath, locale);
    } catch (error) {
        console.error('[Ambassadors SEO] Error fetching Rank Math data for JSON-LD:', error);
    }

    return (
        <div className='global-padding pt-4'>
            {rankMathData && <RankMathHead data={rankMathData} />}
            <div className=''>
                <BreadCums />
            </div>
            <div className='lg:my-[80px] my-[40px]'>
                <h1 className='global-h1 text-center'>{t("afs")}<span className='global-blue'>{t("team")}</span></h1>
            </div>
            <Ambassedor categories={categories} countries={countries} data={data} />
        </div>
    );
};

export default page;