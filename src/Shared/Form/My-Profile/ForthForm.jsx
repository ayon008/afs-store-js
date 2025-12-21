"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pen } from "lucide-react";
import { updateShippingInfo } from "@/app/actions/WC/Auth/getAuth";
import useAuth from "@/Shared/Hooks/useAuth";
import { countriesList } from "@/lib/countriesList";
import CountrySelect from "@/Shared/Input/DropDown";
import Input from "@/Shared/Input/Input";
import FormButton from "@/Shared/Button/FormButton";

const ForthForm = ({ setMessage }) => {

    const [show, setShow] = useState(false);
    const { user, loading, refreshUser } = useAuth();

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            entreprise: "",
            country: "",
            postal: "",
            ville: "",
            adresse: ""
        },
        mode: "onChange"
    });

    // Reset form when user data is available
    useEffect(() => {
        if (user) {
            reset({
                entreprise: user.shipping?.company || "",
                country: user.shipping?.country || "",
                postal: user.shipping?.postcode || "",
                ville: user.shipping?.city || "",
                adresse: user.shipping?.address_1 || ""
            });
        }
    }, [user, reset]);

    const watchFields = watch();

    const onSubmit = async (data) => {
        setMessage({});
        try {
            const result = await updateShippingInfo(data);
            if (result.success) {
                await refreshUser();
                setMessage({ success: true, message: 'Your shipping address has been updated successfully.' });
                setShow(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setMessage({ success: false, message: result.message });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ success: false, message: err.message });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Show warning if field is empty (not required)
    const showErrorIfMissing = (fieldValue) => {
        return !fieldValue ? true : null;
    };


    return (
        <div className={`${loading ? "opacity-50" : "opacity-100"}`}>
            <div className="flex items-center justify-between pb-1 global-b-bottom-d">
                <h3 className="text-[28px] leading-[100%] font-semibold text-[#111]">Shipping Address</h3>
                <button onClick={() => setShow(!show)} className="flex items-center gap-1 cursor-pointer" type="button">
                    <Pen className="w-3 h-3" />
                    <span className="text-sm uppercase leading-[100%]">{show ? "Cancel" : "Edit"}</span>
                </button>
            </div>

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 2xl:grid-cols-3">
                    <div>
                        <Input
                            label="Enterprise"
                            type="text"
                            id="entreprise"
                            register={register("entreprise", { required: true })}
                            value={watchFields.entreprise}
                            registerPage={true}
                            error={showErrorIfMissing(watchFields.entreprise)}
                            show={show}
                        />
                    </div>
                    <div>
                        <CountrySelect
                            label="Country"
                            id="country"
                            register={register("country", { required: true })}
                            defaultValue={watchFields.country}
                            registerPage={true}
                            countries={countriesList}
                            show={show}
                        />
                    </div>
                    <div>
                        <Input
                            label="Postal Code"
                            type="text"
                            id="postal"
                            register={register("postal", { required: true })}
                            value={watchFields.postal}
                            registerPage={true}
                            error={showErrorIfMissing(watchFields.postal)}
                            show={show}
                        />
                    </div>
                    <div>
                        <Input
                            label="City"
                            type="text"
                            id="ville"
                            register={register("ville", { required: true })}
                            value={watchFields.ville}
                            registerPage={true}
                            error={showErrorIfMissing(watchFields.ville)}
                            show={show}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Input
                            label="Address"
                            type="text"
                            id="adresse"
                            register={register("adresse", { required: true })}
                            value={watchFields.adresse}
                            registerPage={true}
                            error={showErrorIfMissing(watchFields.adresse)}
                            show={show}
                        />
                    </div>
                </div>
                {
                    show && (
                        <div className="mt-5">
                            <FormButton type="submit" label="Save Changes" />
                        </div>
                    )
                }
            </form>
        </div>
    );
};

export default ForthForm;
