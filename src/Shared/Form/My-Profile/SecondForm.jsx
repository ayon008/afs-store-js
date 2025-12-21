"use client";
import FormButton from '@/Shared/Button/FormButton';
import Input from '@/Shared/Input/Input';
import { Pen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '@/Shared/Hooks/useAuth';
import { updateProfile } from '@/app/actions/WC/Auth/getAuth';

const SecondForm = ({ setMessage }) => {
    const [show, setShow] = useState(false);
    const { user, loading } = useAuth();

    const { register, handleSubmit, watch, formState: { errors }, reset, trigger } = useForm({
        defaultValues: {
            billing_phone: '',
            email: '',
        },
        mode: "onChange",
    });

    const watchFields = watch();

    // Reset form when user loads
    useEffect(() => {
        if (user) {
            reset({
                billing_phone: user?.billing?.phone || user?.billing_phone || '',
                email: user?.email || '',
            });
            trigger(); // validate fields immediately for missing default values
        }
    }, [user, reset, trigger]);

    // Show error if value is missing (not required, just a warning)
    const showErrorIfMissing = (fieldValue) => {
        return !fieldValue ? true : null; // "Missing data" in French
    };

    const onSubmit = async (data) => {
        setMessage({});
        const sendData = {
            email: data.email,
            billing: {
                phone: data.billing_phone,
                first_name: '',
                last_name: '',
                company: '',
                address_1: '',
                address_2: '',
                city: '',
                postcode: '',
                country: '',
                state: '',
            },
        }

        const updateData = await updateProfile(sendData);
        if (updateData.success) {
            setMessage({ success: true, message: "Your contact details have been updated successfully." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setShow(false);
        } else {
            setMessage({ success: false, message: updateData.message || "Something went wrong" });
            scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={`${loading ? "opacity-50" : "opacity-100"}`}>
            <div className="flex items-center justify-between pb-1 global-b-bottom-d">
                <h3 className="text-[28px] leading-[100%] font-semibold text-[#111]">Contact info</h3>
                <button
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setShow(!show)}
                    type="button"
                >
                    <Pen className="w-3 h-3" />
                    <span className="text-sm uppercase leading-[100%]">{show ? "Cancel" : "Edit"}</span>
                </button>
            </div>

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 2xl:grid-cols-3">
                    <div>
                        <Input
                            label="Email"
                            type="email"
                            id="email"
                            register={register("email")}
                            error={showErrorIfMissing(watchFields.email)}
                            value={watchFields.email}
                            show={show}
                            registerPage={true}
                        />
                    </div>
                    <div>
                        <Input
                            label="Phone"
                            type="tel"
                            id="billing_phone"
                            register={register("billing_phone")}
                            error={showErrorIfMissing(watchFields.billing_phone)}
                            value={watchFields.billing_phone}
                            show={show}
                            registerPage={true}
                        />
                    </div>
                </div>

                {show && (
                    <div className="mt-5">
                        <FormButton type="submit" label="Save Changes" />
                    </div>
                )}
            </form>
        </div>
    );
};

export default SecondForm;
