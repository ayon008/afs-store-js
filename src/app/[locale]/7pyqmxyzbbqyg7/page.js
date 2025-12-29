'use client';

import FormButton from '@/Shared/Button/FormButton';
import useAuth from '@/Shared/Hooks/useAuth';
import Input from '@/Shared/Input/Input';
import { lostPassword } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';

const Page = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            email: '',
        },
    });


    const { user } = useAuth();
    console.log("user", user);

    const emailValue = watch('email');

    const onSubmit = async (data) => {
        const response = await lostPassword(data?.email);
        console.log("Lost password response:", response);
    };

    const a = useTranslations("login");
    const b = useTranslations("profile");

    const BreadCums = () => {
        const t = useTranslations("breadcum");
        return (
            <div className='uppercase mb-10'>
                <div className='font-bold text-sm text-[#999999]'>
                    <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-black'>{a("forgot")}</span>
                </div>
            </div>
        )
    }

    return (
        <div className='pt-4 global-padding global-margin'>
            <BreadCums />
            {
                user && (
                    <div className='pb-10 global-b-bottom-d mb-6'>
                        <h1 className='global-h1'>{b("hello")}, {user?.last_name}</h1>
                    </div>
                )
            }
            <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)] bg-[#F0F0F0] p-[clamp(1.25rem,0.099rem+2.401vw,2.5rem)]'>

                <div className='space-y-[clamp(0.875rem,0.5297rem+0.7203vw,1.25rem)]'>
                    <h2 className='global-h2'>{a("forgot")}</h2>
                    <p className='small-p'>
                        {a("enter")}
                    </p>
                </div>

                <div>
                    <div className='flex items-center justify-between pb-1 global-b-bottom'>
                        <h3 className='text-[28px] leading-[100%] font-semibold text-[#111]'>
                            {a("set")}
                        </h3>
                    </div>

                    <form className='mt-6' onSubmit={handleSubmit(onSubmit)}>
                        <div className='max-w-[320px] w-full'>
                            <Input
                                label={a("email")}
                                type="text"
                                id="email"
                                register={register('email', {
                                    required: 'Username or Email is required',
                                })}
                                error={errors.email?.message}
                                value={emailValue}
                                registerPage
                            />
                        </div>

                        <div className='mt-5 flex items-center flex-wrap gap-10'>
                            <FormButton label={a("save")} type="submit" />
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Page;
