import { getLocale } from 'next-intl/server';
import { generateHreflangAlternates } from '@/lib/seo-utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://afs-foiling.com';

export async function generateMetadata() {
  const locale = await getLocale();
  const isEnglish = locale === 'en';
  const checkoutPath = '/checkout';
  const currentUrl = isEnglish ? `${BASE_URL}${checkoutPath}` : `${BASE_URL}/fr${checkoutPath}`;

  return {
    title: isEnglish ? 'Checkout - AFS' : 'Commande - AFS',
    description: isEnglish
      ? 'Complete your AFS foiling product purchase. Secure checkout with multiple payment options.'
      : 'Finalisez votre achat de produits AFS. Paiement sécurisé avec plusieurs options de paiement.',
    robots: {
      index: false, // Checkout pages should not be indexed
      follow: false,
    },
    alternates: {
      canonical: currentUrl,
      languages: generateHreflangAlternates(checkoutPath),
    },
    openGraph: {
      type: 'website',
      title: isEnglish ? 'Checkout - AFS' : 'Commande - AFS',
      description: isEnglish
        ? 'Complete your AFS foiling product purchase. Secure checkout with multiple payment options.'
        : 'Finalisez votre achat de produits AFS. Paiement sécurisé avec plusieurs options de paiement.',
      url: currentUrl,
      siteName: 'AFS',
      locale: isEnglish ? 'en_US' : 'fr_FR',
      alternateLocale: isEnglish ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary',
      title: isEnglish ? 'Checkout - AFS' : 'Commande - AFS',
    },
  };
}

export default function CheckoutLayout({ children }) {
  return children;
}
