"use client";
import React from "react";
import { User } from "lucide-react";
import Input from "@/Shared/Input/Input";
import CountrySelect from "@/Shared/Input/DropDown";
import Select from "@/Shared/Input/Select";

const BillingDetails = ({
    register,
    watchFields,
    errors,
    getFieldError,
    countryDetails,
    states,
    countriesList,
    t
}) => {
    return (
        <div className='bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden'>
            {/* Header */}
            <div className='bg-[#000000] p-6'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                        <User className='w-6 h-6 text-white' />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>{t("billingDetails")}</h3>
                </div>
            </div>

            {/* Content */}
            <div className='p-6 lg:p-8'>
                <div className='grid grid-cols-1 gap-5'>
                    <div className='grid grid-cols-2 gap-5'>
                        <Input
                            label={t("firstName")}
                            type="text"
                            id="billing_first_name"
                            register={register("billing_first_name", { required: t("required") })}
                            error={getFieldError("billing_first_name")}
                            value={watchFields.billing_first_name}
                            checkout={true}
                        />
                        <Input
                            label={t("lastName")}
                            type="text"
                            id="billing_last_name"
                            register={register("billing_last_name", { required: t("required") })}
                            error={getFieldError("billing_last_name")}
                            value={watchFields.billing_last_name}
                            checkout={true}
                        />
                    </div>
                    <Input
                        label={t("company")}
                        type="text"
                        id="billing_company"
                        register={register("billing_company", { required: false })}
                        error={getFieldError("billing_company")}
                        value={watchFields.billing_company}
                        checkout={true}
                    />
                    <CountrySelect
                        label={t("country")}
                        id="country"
                        defaultValue={watchFields.billing_country}
                        register={register("billing_country", { required: t("required") })}
                        checkout={true}
                        countries={countriesList}
                    />
                    {getFieldError("billing_country") && (
                        <p className="text-red-500 text-xs mt-1">{getFieldError("billing_country")}</p>
                    )}
                    <Input
                        label={t("address")}
                        type="text"
                        id="billing_address_1"
                        register={register("billing_address_1", { required: t("required") })}
                        error={getFieldError("billing_address_1")}
                        value={watchFields.billing_address_1}
                        checkout={true}
                    />
                    <Input
                        label={t("city")}
                        type="text"
                        id="billing_city"
                        register={register("billing_city", { required: t("required") })}
                        error={getFieldError("billing_city")}
                        value={watchFields.billing_city}
                        checkout={true}
                    />
                    {states.length > 0 && (
                        <Select
                            label={t("state")}
                            id="billing_state"
                            register={register("billing_state", { required: t("required") })}
                            error={getFieldError("billing_state")}
                            value={watchFields.billing_state}
                            checkout={true}
                            options={[...(states.map((state) => ({ value: state.code, label: state.name })))]}
                        />
                    )}
                    <Input
                        label={t("postcode")}
                        type="text"
                        id="billing_postcode"
                        register={register("billing_postcode", { required: t("required") })}
                        error={getFieldError("billing_postcode")}
                        value={watchFields.billing_postcode}
                        checkout={true}
                    />
                    <Input
                        label={t("email")}
                        type="email"
                        id="billing_email"
                        register={register("billing_email", {
                            required: t("required"),
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: t("invalidEmail")
                            }
                        })}
                        error={getFieldError("billing_email")}
                        value={watchFields.billing_email}
                        checkout={true}
                    />
                    <Input
                        label={t("phone")}
                        type="tel"
                        id="billing_phone"
                        register={register("billing_phone", { required: false })}
                        error={getFieldError("billing_phone")}
                        value={watchFields.billing_phone}
                        checkout={true}
                    />
                    <Select
                        checkout={true}
                        label={t("survey")}
                        id='survey'
                        register={register("survey", { required: t("required") })}
                        error={getFieldError("survey")}
                        value={watchFields.survey}
                        options={[
                            { value: 'Recherche Google/Bing', label: t("surveyOptions.google") },
                            { value: 'facebook', label: t("surveyOptions.facebook") },
                            { value: 'instagram', label: t("surveyOptions.instagram") },
                            { value: 'youtube', label: t("surveyOptions.youtube") },
                            { value: 'Publicité Google (Google Ads)', label: t("surveyOptions.googleAds") },
                            { value: "Recommandation d'un ami ou d'un membre de la famille", label: t("surveyOptions.recommendation") },
                            { value: "Article de blog ou revue en ligne", label: t("surveyOptions.blog") },
                            { value: "Lien direct (j'ai tapé l'adresse du site)", label: t("surveyOptions.direct") },
                            { value: "Publicité Display/Bannière", label: t("surveyOptions.display") },
                            { value: "Autre (veuillez préciser)", label: t("surveyOptions.other") },
                        ]}
                        placeholder={t("surveyPlaceholder")}
                    />
                    {watchFields.survey === "Autre (veuillez préciser)" && (
                        <Input
                            label={t("pleaseSpecify")}
                            type="text"
                            id="survey_other"
                            register={register("survey_other", {
                                required: watchFields.survey === "Autre (veuillez préciser)" ? t("pleaseSpecify") : false
                            })}
                            error={getFieldError("survey_other")}
                            value={watchFields.survey_other}
                            checkout={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingDetails;

