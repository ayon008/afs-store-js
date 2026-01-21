import React from 'react';
import { getLocale } from 'next-intl/server';
import CartPageWrapper from './CartPageWrapper';
import { generateHreflangAlternates } from '@/lib/seo-utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://afs-foiling.com';

export async function generateMetadata() {
  const locale = await getLocale();
  const isEnglish = locale === 'en';
  const cartPath = '/cart';
  const currentUrl = isEnglish ? `${BASE_URL}${cartPath}` : `${BASE_URL}/fr${cartPath}`;

  return {
    title: isEnglish ? 'Shopping Cart - AFS' : 'Panier - AFS',
    description: isEnglish
      ? 'Review your selected AFS foiling products in your shopping cart.'
      : 'Consultez les produits AFS que vous avez sélectionnés dans votre panier.',
    robots: {
      index: false, // Cart pages should not be indexed
      follow: false,
    },
    alternates: {
      canonical: currentUrl,
      languages: generateHreflangAlternates(cartPath),
    },
    openGraph: {
      type: 'website',
      title: isEnglish ? 'Shopping Cart - AFS' : 'Panier - AFS',
      description: isEnglish
        ? 'Review your selected AFS foiling products in your shopping cart.'
        : 'Consultez les produits AFS que vous avez sélectionnés dans votre panier.',
      url: currentUrl,
      siteName: 'AFS',
      locale: isEnglish ? 'en_US' : 'fr_FR',
      alternateLocale: isEnglish ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary',
      title: isEnglish ? 'Shopping Cart - AFS' : 'Panier - AFS',
    },
  };
}

export default function CartPage() {
  return <CartPageWrapper />;
}