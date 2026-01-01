import { CartProvider } from '@/Shared/Hooks/useCart';
import Navbar from '@/Shared/Navbar/Navbar';
import AuthProvider from '@/Shared/Provider/AuthProvider';
import QueryProvider from '@/Shared/Provider/QueryProvider';
import Footer from '@/Shared/footer/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import React from 'react';
import { getMenuItems } from './actions/WC/getMenuData';
import "../app/[locale]/globals.css";

const NotFound = async ({ params }) => {
    const locale = await getLocale();
    const messages = await getMessages();
    const NAV_LINKS = await getMenuItems();
    const t = await getTranslations("404");
    return (
        <main>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <QueryProvider>
                    <AuthProvider>
                        <CartProvider>
                            <div>
                                <Navbar NAV_LINKS={NAV_LINKS} />
                                <div className='global-padding my-5'>
                                    <h1 className='global-h2 font-normal!'>{t("notfound")}</h1>
                                    <p className="mt-3 text-base">{t("appears")}</p>
                                </div>
                                <Footer />
                            </div>
                        </CartProvider>
                    </AuthProvider>
                </QueryProvider>
            </NextIntlClientProvider>
        </main>
    );
};

export default NotFound;
