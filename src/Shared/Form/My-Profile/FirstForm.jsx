"use client";

import { Pen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "@/Shared/Hooks/useAuth";
import Input from "@/Shared/Input/Input";
import FormButton from "@/Shared/Button/FormButton";
import { updateProfile } from "@/app/actions/WC/Auth/getAuth";
import { useTranslations } from "next-intl";

const FirstForm = ({ setMessage }) => {
    const t = useTranslations("login");
    const a = useTranslations("profile");
    const [first, setFirst] = useState(false);
    const { user, loading } = useAuth();

    const { register, reset, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            nickname: user?.nickname || "",
        },
        mode: "onChange",
    });

    const watchFields = watch();

    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                nickname: user.nickname || "",
            });
        }
    }, [user, reset])

    const onSubmit = async (data) => {
        try {
            setFirst({});
            const updatedData = await updateProfile(data);
            if (updatedData.success) {
                setMessage({ success: true, message: "Your contact details have been updated successfully." });
                setFirst(!first);
            } else {
                setMessage({ success: false, message: updatedData.message || "Something went wrong" });
            }
        } catch (error) {
            setMessage({ success: false, message: error.message || "Something went wrong" });
            console.log(error);
        }
    };


    return (
        <div className={`${loading ? "opacity-50" : "opacity-100"}`}>
            <div className="flex items-center justify-between pb-1 global-b-bottom-d">
                <h3 className="text-[28px] leading-[100%] font-semibold text-[#111]">{a("full")}</h3>
                <button
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setFirst(!first)}
                    type="button"
                >
                    <Pen className="w-3 h-3" />
                    <span className="text-sm uppercase leading-[100%]">{first ? a("cancel") : a("Edit")}</span>
                </button>
            </div>

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(onSubmit)();
                    }
                }}
            >
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 2xl:grid-cols-3">
                    <div>
                        <Input
                            label={t("first")}
                            type="text"
                            id="first_name"
                            register={register("first_name", { required: t("required-first") })}
                            error={errors.first_name?.message}
                            value={watchFields.first_name}
                            registerPage={true}
                            show={first}
                        />
                    </div>
                    <div>
                        <Input
                            label={t("last")}
                            type="text"
                            id="last_name"
                            register={register("last_name", { required: t("required-last") })}
                            error={errors.last_name?.message}
                            registerPage={true}
                            value={watchFields.last_name}
                            show={first}
                        />
                    </div>
                    <div>
                        <Input
                            label={a("display")}
                            type="text"
                            id="display_name"
                            register={register("nickname", { required: "Display Name is required" })}
                            error={errors.display_name?.message}
                            value={watchFields.display_name}
                            registerPage={true}
                            show={first}
                        />
                    </div>
                </div>

                {first && (
                    <div className="mt-5">
                        <FormButton type="submit" label={a("save")} />
                    </div>
                )}
            </form>
        </div>
    );
};

export default FirstForm;
