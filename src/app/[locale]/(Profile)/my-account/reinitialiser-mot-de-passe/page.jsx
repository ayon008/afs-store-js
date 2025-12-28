"use client";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { changePasswordAction } from "@/app/actions/Woo-Coommerce/getWooCommerce";
import Input from "@/Shared/Input/Input";
import FormButton from "@/Shared/Button/FormButton";
import { useLocale, useTranslations } from "next-intl";
import useAuth from "@/Shared/Hooks/useAuth";

const PasswordResetPage = () => {
    const [typeCurrent, setTypeCurrent] = useState("password");
    const [typeNew, setTypeNew] = useState("password");
    const [typeConfirm, setTypeConfirm] = useState("password");


    const { user } = useAuth()
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        mode: "onChange"
    });

    const t = useTranslations("login")

    const [matchError, setMatchError] = useState(false);
    const [apiError, setApiError] = useState("");

    const watchFields = watch();

    // Clear matchError when passwords match
    useEffect(() => {
        if (watchFields.new_password && watchFields.confirm_password && watchFields.new_password === watchFields.confirm_password) {
            setMatchError(false);
        }
    }, [watchFields.new_password, watchFields.confirm_password]);

    const onSubmit = async (data) => {
        setApiError(""); // Clear previous API errors

        if (data.new_password !== data.confirm_password) {
            setMatchError(true);
            return;
        }
        setMatchError(false);

        try {

            const result = await changePasswordAction({ currentPassword: data.current_password, newPassword: data.new_password });
            console.log(result);

            console.log("Password update result:", result);
        } catch (err) {
            console.error(err);
            setApiError("An error occurred. Please try again.");
        }
    };


    // Get user info for validation
    const firstNameValue = user?.first_name || "";
    const emailValue = user?.email || "";

    const locale = useLocale();

    return (
        <div className="space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]">
            <div className="space-y-[clamp(0.875rem,0.5297rem+0.7203vw,1.25rem)]">
                <h2 className="global-h2">{t("reset")}</h2>
                <p className="profile-p">
                    {t("secure")}
                </p>
            </div>

            <div className="space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]">
                <div>
                    <div className="flex items-center justify-between pb-1 global-b-bottom-d">
                        <h3 className="text-[28px] leading-[100%] font-semibold text-[#111]">{t("set")}</h3>
                    </div>

                    <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-3">

                            {/* Current Password */}
                            <div className="max-w-[320px] w-full relative">
                                <Input
                                    label={t("current")}
                                    type={typeCurrent}
                                    id="current_password"
                                    register={register("current_password", { required: "Current password is required" })}
                                    error={errors.current_password?.message && true}
                                    value={watchFields.current_password}
                                    registerPage={true}
                                />
                                {typeCurrent === "password"
                                    ? <EyeOff onClick={() => setTypeCurrent("text")} className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer" />
                                    : <Eye onClick={() => setTypeCurrent("password")} className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer" />
                                }
                            </div>

                            {/* New Password */}
                            <div className="max-w-[320px] w-full relative">
                                <Input
                                    label={t("new")}
                                    type={typeNew}
                                    id="new_password"
                                    register={register("new_password", {
                                        required: "New password is required",
                                        validate: (value) => {
                                            const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
                                            if (!regex.test(value)) return "Min 6 chars, include number & capital letter";
                                            if (firstNameValue && value.toLowerCase().includes(firstNameValue.toLowerCase())) return "Password must not contain your first name";
                                            if (emailValue && value.toLowerCase().includes(emailValue.toLowerCase())) return "Password must not contain your email";
                                            if (matchError) return "Passwords do not match";
                                            return true;
                                        }
                                    })}
                                    error={errors.new_password?.message && true}
                                    value={watchFields.new_password}
                                    registerPage={true}
                                />
                                {typeNew === "password"
                                    ? <EyeOff onClick={() => setTypeNew("text")} className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer" />
                                    : <Eye onClick={() => setTypeNew("password")} className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer" />
                                }
                            </div>

                            {/* Confirm Password */}
                            <div className="max-w-[320px] w-full relative">
                                <Input
                                    label={t("confirm")}
                                    type={typeConfirm}
                                    id="confirm_password"
                                    register={register("confirm_password", {
                                        required: "Please confirm your password",
                                    })}
                                    error={matchError ? "Passwords do not match" : (errors.new_password?.message || apiError || false)}
                                    value={watchFields.confirm_password}
                                    registerPage={true}
                                />
                                {typeConfirm === "password"
                                    ? <EyeOff onClick={() => setTypeConfirm("text")} className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer" />
                                    : <Eye onClick={() => setTypeConfirm("password")} className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer" />
                                }
                            </div>

                        </div>

                        <div className="mt-5 flex items-center flex-wrap gap-10">
                            <FormButton type="submit" label={t("save")} />
                            <Link href={`/${locale}/forgot-password`}>
                                <div className="text-base uppercase flex items-center gap-1" type="button">
                                    <span>{t("forgot")}</span>
                                    <ArrowUpRight className="inline w-5 h-5" />
                                </div>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetPage;
