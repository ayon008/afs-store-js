'use client';

import React from 'react';
import CartWrapper from './CartWrapper';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const BreadCrumbs = () => {
    const t = useTranslations("breadcum");
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-black'> Cart</span>
            </div>
        </div>
    );
}

export default function CartPageWrapper() {
    return (
        <div>
            <BreadCrumbs />
            {/* CartWrapper handles loading cart from client-side API */}
            <CartWrapper />
        </div>
    );
}
