"use client";
import FormButton from '@/Shared/Button/FormButton';
import Input from '@/Shared/Input/Input';
import { Pen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '@/Shared/Hooks/useAuth';
import { countriesList } from '@/lib/countriesList';
import { updateBillingInfo } from '@/app/actions/WC/Auth/getAuth';
import CountrySelect from '@/Shared/Input/DropDown';

const ThirdForm = ({ setMessage }) => {
    const [show, setShow] = useState(false);
    const { user, loading, refreshUser } = useAuth();

    const { register, handleSubmit, watch, reset, trigger, formState: { errors } } = useForm({
        defaultValues: {
            billing_first_name: '',
            billing_last_name: '',
            billing_company: '',
            billing_address_1: '',
            billing_postcode: '',
            billing_city: '',
            billing_phone: '',
            billing_email: '',
            country: "FR",
        },
        mode: "onChange",
    });

    const watchFields = watch();

    // Reset form when user data loads
    useEffect(() => {
        if (user) {
            reset({
                billing_first_name: user?.billing?.first_name || user?.first_name || '',
                billing_last_name: user?.billing?.last_name || user?.last_name || '',
                billing_company: user?.billing?.company || '',
                billing_address_1: user?.billing?.address_1 || '',
                billing_postcode: user?.billing?.postcode || '',
                billing_city: user?.billing?.city || '',
                billing_phone: user?.billing?.phone || '',
                country: user?.billing?.country || "FR",
                billing_email: user?.billing?.email || user?.email || '',
            });
            trigger(); // check for missing default values
        }
    }, [user, reset, trigger]);

    // Show warning if field is empty (not required)
    const showErrorIfMissing = (fieldValue) => {
        return !fieldValue ? true : null;
    };

    const onSubmit = async (data) => {
        setMessage({});
        try {
            const result = await updateBillingInfo(data);
            if (result.success) {
                setMessage({ success: true, message: 'Your billing address has been updated successfully.' });
                // Refresh user context to show updated billing info
                await refreshUser();
                setShow(false); // Close edit mode on success
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

    return (
        <div className={`${loading ? "opacity-50" : "opacity-100"}`}>
            <div className="flex items-center justify-between pb-1 global-b-bottom-d">
                <h3 className="text-[28px] leading-[100%] font-semibold text-[#111]">Billing Address</h3>
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
                    <Input
                        label="First Name"
                        type="text"
                        id="billing_first_name"
                        register={register("billing_first_name", { required: true })}
                        error={showErrorIfMissing(watchFields.billing_first_name)}
                        value={watchFields.billing_first_name}
                        registerPage={true}
                        show={show}
                    />
                    <Input
                        label="Last Name"
                        type="text"
                        id="billing_last_name"
                        register={register("billing_last_name", { required: true })}
                        error={showErrorIfMissing(watchFields.billing_last_name)}
                        value={watchFields.billing_last_name}
                        registerPage={true}
                        show={show}
                    />
                    <Input
                        label="Company (Optional)"
                        type="text"
                        id="billing_company"
                        register={register("billing_company", { required: false })}
                        error={showErrorIfMissing(watchFields.billing_company)}
                        value={watchFields.billing_company}
                        registerPage={true}
                        show={show}
                    />
                    <CountrySelect
                        label="Country"
                        id="country"
                        defaultValue={watchFields.country}
                        register={register("country", { required: true })}
                        registerPage={true}
                        countries={countriesList}
                        show={show}
                    />
                    <div className='md:col-span-2 col-span-1'>
                        <Input
                            label="Street number and name"
                            type="text"
                            id="billing_address_1"
                            register={register("billing_address_1", { required: true })}
                            error={showErrorIfMissing(watchFields.billing_address_1)}
                            value={watchFields.billing_address_1}
                            registerPage={true}
                            show={show}
                        />
                    </div>
                    <Input
                        label="Code Postal"
                        type="text"
                        id="billing_postcode"
                        register={register("billing_postcode", { required: true })}
                        error={showErrorIfMissing(watchFields.billing_postcode)}
                        value={watchFields.billing_postcode}
                        registerPage={true}
                        show={show}
                    />
                    <Input
                        label="City"
                        type="text"
                        id="billing_city"
                        register={register("billing_city", { required: true })}
                        error={showErrorIfMissing(watchFields.billing_city)}
                        value={watchFields.billing_city}
                        registerPage={true}
                        show={show}
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        id="billing_phone"
                        register={register("billing_phone", { required: true })}
                        error={showErrorIfMissing(watchFields.billing_phone)}
                        value={watchFields.billing_phone}
                        registerPage={true}
                        show={show}
                    />
                    <Input
                        label="E-mail"
                        type="email"
                        id="billing_email"
                        register={register("billing_email", { required: true })}
                        error={showErrorIfMissing(watchFields.billing_email)}
                        value={watchFields.billing_email}
                        registerPage={true}
                        show={show}
                    />
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

export default ThirdForm;
