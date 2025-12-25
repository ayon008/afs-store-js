"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import Input from '@/Shared/Input/Input';
import Password from '@/Shared/Input/Password';
import FormButton from '@/Shared/Button/FormButton';
import { loginUser } from '@/app/actions/WC/Auth/getAuth';
import useAuth from '@/Shared/Hooks/useAuth';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

const Login = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    const { refreshUser } = useAuth();

    const [loading, setLoading] = useState(false);


    const [errorMessage, setErrorMessage] = useState(null);

    const t = useTranslations("login");


    const onSubmit = async (data) => {

        const { email, password, remember } = data;
        setErrorMessage("");
        setLoading(true);
        try {
            const response = await loginUser({ username: email, password: password, remember: !!remember });
            if (response.token) {
                setErrorMessage("");
                reset();
                try {
                    await refreshUser();
                } catch (e) {
                    console.warn('refreshUser failed', e);
                }
                setLoading(false);
                router.push('/my-account');
            }
        } catch (error) {
            console.log(error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div>
            {
                errorMessage && (
                    <div className='flex items-center gap-x-3 border-[#8b0000] border-2 py-4 px-8 mt-6 rounded-sm bg-[#F9F2F5]'>
                        <AlertCircle className='inline text-white fill-[#8b0000]' />
                        <p className='text-base leading-[100%] font-semibold text-[#8b0000]' dangerouslySetInnerHTML={{ __html: errorMessage }} />
                    </div>
                )
            }

            <div className={`flex items-center justify-center lg:mt-[80px] mt-[40px] global-margin ${loading ? "opacity-50" : "opacity-100"}`}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubmit(onSubmit)();
                        }
                    }}
                    className='max-w-[420px] w-full py-[50px] px-[35px] bg-[#F0F0F0] rounded-[4px]'
                >
                    <h1 className='lg:text-5xl lg:leading-[53px] font-bold mb-8 text-2xl leading-[26px] text-center'>{t("signin")}</h1>

                    <div className='mb-7'>
                        <Input
                            label={t("email")}
                            id='email'
                            type='text'
                            placeholder=''
                            register={register("email", { required: "Email is required" })}
                            error={errors.email?.message}
                        />
                    </div>
                    <div className='mb-4'>
                        <Password
                            label={t("password")}
                            id='password'
                            placeholder=''
                            register={register("password", { required: "Password is required" })}
                            error={errors.password?.message}
                        />
                    </div>

                    <Link href={'/forgot-password'}><p className='text-center text-sm leading-[100%] underline'>{t("forgot")}</p></Link>

                    <div className='flex items-center justify-center mt-6 gap-1'>
                        <input type='checkbox' {...register("remember")} />
                        <p className='text-[15px] leading-[19px]'>{t("me")}</p>
                    </div>

                    <div className='flex items-center justify-center mt-3'>
                        <FormButton type="submit" label={t("signin")} />
                    </div>

                    <div className='mt-6'>
                        <p className='text-[15px] leading-[19px] text-center mb-4'>{t("new")}</p>
                        <div className='flex items-center justify-center'>
                            <Link href='/signup'>
                                <FormButton label={t("signup")} />
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
