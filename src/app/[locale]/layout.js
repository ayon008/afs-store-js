
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import AuthProvider from "@/Shared/Provider/AuthProvider";
import Navbar from "@/Shared/Navbar/Navbar";
import "./globals.css";
import { alliance } from "@/fonts/Alliance";
import { getMenuItems } from "../actions/WC/getMenuData";
import { getMessages } from "next-intl/server";
import { CartProvider } from "@/Shared/Hooks/useCart";
import Footer from "@/Shared/footer/Footer";
import QueryProvider from "@/Shared/Provider/QueryProvider";
import CrispProvider from "@/Shared/Provider/CrispProvider";
import { getCurrency, refreshCookies } from "../actions/Woo-Coommerce/getWooCommerce";
import ScrollToTop from "@/Shared/ScrollToTop/ScrollToTop";
import RouteLoadingBar from "@/Shared/Loader/RouteLoadingBar";
import { ALL_COUNTRIES } from "@/lib/countries-config";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://afs-foiling.com';

/**
 * Generate hreflang alternates for SEO
 *
 * Strategy:
 * - Primary language tags (en, fr) for the two site languages
 * - Regional tags for key markets (fr-FR, en-US, en-GB)
 * - x-default for fallback (English version)
 * - External site for Spain (es → afs-foiling.es)
 */
function generateHreflangAlternates(pathname = '') {
  // Ensure pathname starts with / if not empty
  const normalizedPath = pathname && !pathname.startsWith('/') ? `/${pathname}` : pathname;

  const enUrl = `${BASE_URL}${normalizedPath}`;
  const frUrl = `${BASE_URL}/fr${normalizedPath}`;

  return {
    // Primary language tags
    'en': enUrl,
    'fr': frUrl,

    // Key regional targeting for primary markets
    'en-US': enUrl,      // United States
    'en-GB': enUrl,      // United Kingdom
    'en-CA': enUrl,      // Canada (English)
    'en-AE': enUrl,      // UAE
    'fr-FR': frUrl,      // France
    'fr-BE': frUrl,      // Belgium (French)
    'fr-CH': frUrl,      // Switzerland (French)
    'fr-CA': frUrl,      // Canada (French)
    'fr-LU': frUrl,      // Luxembourg (French)

    // Spanish site (external)
    'es': 'https://afs-foiling.es',
    'es-ES': 'https://afs-foiling.es',

    // Default fallback
    'x-default': enUrl,
  };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  // Canonical URL based on current locale
  const canonicalUrl = locale === 'en' ? BASE_URL : `${BASE_URL}/${locale}`;

  // Localized metadata
  const isEnglish = locale === 'en';
  const title = isEnglish
    ? "The foiling spirit since 2009 - AFS"
    : "L'esprit du foil depuis 2009 - AFS";
  const description = isEnglish
    ? "Discover AFS products for all foiling disciplines: wing foil, surf foil, sup foil, windfoil. Made In France. Full Carbon"
    : "Découvrez les produits AFS pour toutes les disciplines du foil : wing foil, surf foil, sup foil, windfoil. Made In France. Full Carbon";

  const baseMetadata = {
    title,
    description,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "AFS",
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR',
      images: [
        {
          url: "https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png",
          width: 1920,
          height: 1484,
          alt: isEnglish ? "Fly 4'8–6'0" : "Fly 4'8–6'0",
          type: "image/png",
        },
      ],
      publishedTime: "2024-01-14T18:49:39+01:00",
      modifiedTime: "2025-09-12T20:59:14+02:00",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        "https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png",
      ],
    },
    other: {
      "og:updated_time": "2025-09-12T20:59:14+02:00",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: generateHreflangAlternates(''),
    },
  };

  return baseMetadata;
}

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children, params }) {
  const NAV_LINKS = await getMenuItems() || [];
  const { locale } = await params;

  // Refresh cookies on page load/refresh
  await getCurrency();

  const messages = await getMessages();


  return (
    <html lang={locale}>
      <body className={`${alliance.className} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <CrispProvider>
                <CartProvider>
                  <ScrollToTop />
                  <RouteLoadingBar />
                  <div>
                    <Navbar NAV_LINKS={NAV_LINKS} />
                    {children}
                    <Footer />
                  </div>
                </CartProvider>
              </CrispProvider>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
