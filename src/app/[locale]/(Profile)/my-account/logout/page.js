"use client"
import { ArrowUpRight } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FormButton from '@/Shared/Button/FormButton';
import { logout } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { useTranslations } from 'next-intl';



const Page = () => {
    const router = useRouter();
    const handleLogOut = async () => {
        const response = await logout();
        if (response.success) {
            router.push('/');
        }
    }

    const t = useTranslations("profile");

    return (
        <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]'>
            <div className='space-y-[clamp(0.875rem,0.5297rem+0.7203vw,1.25rem)]'>
                <h2 className='global-h2'>{t("logout")}</h2>
                <p className='md:text-lg text-base leading-[130%] font-medium'>{t("p")}</p>
                <div className='flex items-center gap-10 flex-wrap'>
                    <div onClick={() => handleLogOut()}>
                        <FormButton type='button' label={t("account")} />
                    </div>
                    <Link href={'/product-category/foiling'}>
                        <p className='text-base flex items-center gap-1 uppercase font-semibold text-[#111]/75 leading-[100%]'>{t("store")}
                            <ArrowUpRight className='inline w-5 h-5 mt-[2px]' />
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Page;