
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


export const metadata = {
  title: "The foiling spirit since 2009 - AFS",
  description:
    "Discover AFS products for all foiling disciplines: wing foil, surf foil, sup foil, windfoil. Made In France. Full Carbon",
  icons: {
    icon: "../../public/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "The foiling spirit since 2009 - AFS",
    description:
      "Discover AFS products for all foiling disciplines: wing foil, surf foil, sup foil, windfoil. Made In France. Full Carbon",
    url: "https://afs-foiling.com/",
    siteName: "AFS",
    images: [
      {
        url: "https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png",
        width: 1920,
        height: 1484,
        alt: "Fly 4'8–6'0",
        type: "image/png",
      },
    ],
    publishedTime: "2024-01-14T18:49:39+01:00",
    modifiedTime: "2025-09-12T20:59:14+02:00",
  },
  twitter: {
    card: "summary_large_image",
    title: "The foiling spirit since 2009 - AFS",
    description:
      "Discover AFS products for all foiling disciplines: wing foil, surf foil, sup foil, windfoil. Made In France. Full Carbon",
    images: [
      "https://afs-foiling.com/wp-content/uploads/2024/02/Fly2023-7-1-1.png",
    ],
    creator: "@upwork13",
  },
  other: {
    "og:updated_time": "2025-09-12T20:59:14+02:00",
    "twitter:label1": "Written by",
    "twitter:data1": "upwork13",
  },
};


export default async function RootLayout({ children, params }) {
  const NAV_LINKS = await getMenuItems();
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${alliance.className} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <div>
                  <Navbar NAV_LINKS={NAV_LINKS} />
                  {children}
                  <Footer />
                </div>
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
