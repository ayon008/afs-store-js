"use client";

import { Pen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "@/Shared/Hooks/useAuth";
import Input from "@/Shared/Input/Input";
import FormButton from "@/Shared/Button/FormButton";
import { updateProfile } from "@/actions/WC/Auth/getAuth";

const FirstForm = ({ setMessage }) => {
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
            <div className="flex items-center justify-between pb-1 global-b-bottom">
                <h3 className="text-[28px] leading-[100%] font-semibold text-[#111]">Full name</h3>
                <button
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setFirst(!first)}
                    type="button"
                >
                    <Pen className="w-3 h-3" />
                    <span className="text-sm uppercase leading-[100%]">{first ? "Annuler" : "Modifier"}</span>
                </button>
            </div>

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 2xl:grid-cols-3">
                    <div>
                        <Input
                            label="First Name"
                            type="text"
                            id="first_name"
                            register={register("first_name", { required: "First Name is required" })}
                            error={errors.first_name?.message}
                            value={watchFields.first_name}
                            registerPage={true}
                            show={first}
                        />
                    </div>
                    <div>
                        <Input
                            label="Last Name"
                            type="text"
                            id="last_name"
                            register={register("last_name", { required: "Last Name is required" })}
                            error={errors.last_name?.message}
                            registerPage={true}
                            value={watchFields.last_name}
                            show={first}
                        />
                    </div>
                    <div>
                        <Input
                            label="Display Name"
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
                        <FormButton type="submit" label="SAVE CHANGES" />
                    </div>
                )}
            </form>
        </div>
    );
};

export default FirstForm;
