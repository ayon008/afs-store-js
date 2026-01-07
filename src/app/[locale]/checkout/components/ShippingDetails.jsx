"use client";
import React from "react";
import { MapPin } from "lucide-react";
import Input from "@/Shared/Input/Input";
import CountrySelect from "@/Shared/Input/DropDown";
import Select from "@/Shared/Input/Select";

const ShippingDetails = ({
    register,
    watchFields,
    errors,
    getFieldError,
    setValue,
    shippingAddress,
    handleShow,
    shippingCountryDetails,
    countryDetails,
    countriesList,
    t
}) => {
    return (
        <div className='bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden'>
            {/* Header */}
            <div className='bg-[#000000] p-6'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                        <MapPin className='w-6 h-6 text-white' />
                    </div>
                    <label htmlFor='shipping_address' className='flex items-center gap-3 cursor-pointer'>
                        <input
                            onChange={handleShow}
                            type="checkbox"
                            id='shipping_address'
                            checked={shippingAddress}
                            className='w-5 h-5 rounded border-gray-300 text-[#1D98FF] focus:ring-[#1D98FF]'
                        />
                        <h3 className='text-2xl font-bold text-white'>{t("shippingDetails")}</h3>
                    </label>
                </div>
            </div>

            {/* Content */}
            {shippingAddress && (
                <div className='p-6 lg:p-8'>
                    <div className='grid grid-cols-1 gap-5'>
                        <div className='grid grid-cols-2 gap-5'>
                            <Input
                                checkout={true}
                                label={t("firstName")}
                                type='text'
                                id='shipping_first_name'
                                register={register("shipping_first_name", { required: t("required") })}
                                error={getFieldError("shipping_first_name")}
                                value={watchFields.shipping_first_name}
                            />
                            <Input
                                checkout={true}
                                label={t("lastName")}
                                type='text'
                                id='shipping_last_name'
                                register={register("shipping_last_name", { required: t("required") })}
                                error={getFieldError("shipping_last_name")}
                                value={watchFields.shipping_last_name}
                            />
                        </div>
                        <Input
                            checkout={true}
                            label={t("company")}
                            type='text'
                            id='shipping_company'
                            register={register("shipping_company", { required: false })}
                            error={getFieldError("shipping_company")}
                            value={watchFields.shipping_company}
                        />
                        <CountrySelect
                            label={t("country")}
                            id="shipping_country"
                            defaultValue={watchFields.shipping_country || watchFields.billing_country || ''}
                            register={register("shipping_country", { 
                                required: t("required"),
                                onChange: (e) => {
                                    // If shipping country is empty, use billing country
                                    if (!e.target.value && watchFields.billing_country) {
                                        setValue('shipping_country', watchFields.billing_country);
                                    }
                                }
                            })}
                            checkout={true}
                            countries={countriesList}
                        />
                        {getFieldError("shipping_country") && (
                            <p className="text-red-500 text-xs mt-1">{getFieldError("shipping_country")}</p>
                        )}
                        <Input
                            checkout={true}
                            label={t("address")}
                            type='text'
                            id='shipping_address_1'
                            register={register("shipping_address_1", { required: t("required") })}
                            error={getFieldError("shipping_address_1")}
                            value={watchFields.shipping_address_1}
                        />
                        <Input
                            checkout={true}
                            label={t("city")}
                            type='text'
                            id='shipping_city'
                            register={register("shipping_city", { required: t("required") })}
                            error={getFieldError("shipping_city")}
                            value={watchFields.shipping_city}
                        />
                        {
                            (shippingCountryDetails?.states || countryDetails?.states) && (shippingCountryDetails?.states || countryDetails?.states).length > 0 && (
                                <Select
                                    label={t("state")}
                                    id="shipping_state"
                                    register={register("shipping_state", { required: t("required") })}
                                    error={getFieldError("shipping_state")}
                                    value={watchFields.shipping_state}
                                    checkout={true}
                                    options={[...((shippingCountryDetails?.states || countryDetails?.states).map((state) => ({ value: state.code, label: state.name })))]}
                                />
                            )
                        }
                        <Input
                            checkout={true}
                            label={t("postcode")}
                            type='text'
                            id='shipping_postcode'
                            register={register("shipping_postcode", { required: t("required") })}
                            error={getFieldError("shipping_postcode")}
                            value={watchFields.shipping_postcode}
                        />
                    </div>
                </div>
            )}

            {/* Order Notes */}
            <div className='p-6 lg:p-8 border-t border-gray-100'>
                <div className='relative'>
                    <label
                        htmlFor='comments'
                        className='bg-white absolute left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px] uppercase'
                    >
                        {t("orderNotes")}
                    </label>
                    <textarea
                        {...register("order_comments")}
                        id='comments'
                        className='border border-[#BFBFBF] rounded-[4px] w-full py-3 px-3 focus:outline-none text-lg leading-[23px] text-black font-semibold min-h-[120px] resize-y'
                        placeholder={t("orderNotesPlaceholder")}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShippingDetails;

