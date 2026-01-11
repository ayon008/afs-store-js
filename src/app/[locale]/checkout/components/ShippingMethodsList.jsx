"use client";
import React from "react";
import { useLocale } from "next-intl";

const ShippingMethodsList = ({
    allShippingRates,
    selectedRateId,
    handleSelectRate,
    shippingLoading,
    updatingShipping,
    watchFields,
    cart,
    t
}) => {
    const locale = useLocale();
    
    // Check if we have at least the country (minimum requirement)
    const hasCountry = !!watchFields.billing_country;
    
    // Check if address is more complete (for better shipping calculation)
    const hasCompleteAddress = watchFields.billing_country && 
                              watchFields.billing_postcode && 
                              watchFields.billing_city && 
                              watchFields.billing_address_1;
    
    // If updating shipping, show loading state
    if (updatingShipping || shippingLoading) {
        return (
            <p className='text-sm text-gray-500 italic p-4 border border-gray-200 rounded-lg bg-gray-50'>
                {t("processing")}
            </p>
        );
    }
    
    // If no country selected, show message
    if (!hasCountry) {
        return (
            <p className='text-sm text-gray-400 italic p-4 border border-gray-200 rounded-lg bg-gray-50'>
                {t("shippingMethods")}
            </p>
        );
    }
    
    // If address is not complete, show a message but still try to show rates if available
    if (!hasCompleteAddress) {
        // Still try to show rates if they exist (WooCommerce might have calculated with just country)
        if (allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0) {
            // Don't show warning message if rates are available - just show the rates
            return (
                <div>
                    <ul className={`space-y-2 ${shippingLoading || updatingShipping ? 'opacity-50' : 'opacity-100'}`}>
                        {allShippingRates.map((rate, i) => {
                            const totalPrice = (rate.price / 100 + rate.taxes / 100);
                            const safeId = `shipping_rate_${String(rate.package_id).replace(/[:]/g, '_')}_${String(rate.rate_id).replace(/[:]/g, '_')}_${i}`;
                            const rateValue = `${rate.package_id || 0}:${rate.rate_id}`;
                            return (
                                <li key={`shipping-rate-${rate.rate_id}-${i}`} className='border border-gray-200 rounded-lg p-4 flex items-center gap-3 flex-wrap justify-between hover:border-[#1D98FF] transition-colors bg-white'>
                                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                                        <input
                                            checked={selectedRateId === rateValue}
                                            value={rateValue}
                                            onChange={(e) => handleSelectRate(e.target.value)}
                                            type="radio"
                                            name="shipping_method"
                                            id={safeId}
                                            disabled={shippingLoading || updatingShipping}
                                            className="cursor-pointer"
                                        />
                                        <label htmlFor={safeId} className="break-normal max-w-full cursor-pointer font-medium text-gray-900">{rate.name}</label>
                                    </div>
                                    <div className='text-base text-[#111] font-semibold leading-[100%]'>
                                        {
                                            totalPrice === 0 ? <span className='text-green-600'>{t("free")}</span> : `${totalPrice.toFixed(2)}${cart?.totals?.currency_symbol || rate.currency_symbol || '€'}`
                                        }
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            );
        }
        // No rates and incomplete address
        const missingFields = [];
        if (!watchFields.billing_address_1) missingFields.push(t("address"));
        if (!watchFields.billing_city) missingFields.push(t("city"));
        if (!watchFields.billing_postcode) missingFields.push(t("postcode"));
        
                return (
                    <p className='text-sm text-gray-500 italic p-4 border border-gray-200 rounded-lg bg-gray-50'>
                        {missingFields.length > 0 
                            ? `${t("pleaseSpecify")} ${missingFields.join(", ")} ${t("calculateShippingMethods")}`
                            : t("noShippingMethods")
                        }
                    </p>
                );
    }
    
    // If address is complete and shipping methods are available
    if (allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0) {
        return (
            <div>
                <ul className={`space-y-2 ${shippingLoading || updatingShipping ? 'opacity-50' : 'opacity-100'}`}>
                    {allShippingRates.map((rate, i) => {
                        const totalPrice = (rate.price / 100 + rate.taxes / 100);
                        const safeId = `shipping_rate_${String(rate.package_id).replace(/[:]/g, '_')}_${String(rate.rate_id).replace(/[:]/g, '_')}_${i}`;
                        const rateValue = `${rate.package_id || 0}:${rate.rate_id}`;
                        return (
                            <li key={`shipping-rate-${rate.rate_id}-${i}`} className='border border-gray-200 rounded-lg p-4 flex items-center gap-3 flex-wrap justify-between hover:border-[#1D98FF] transition-colors bg-white'>
                                <div className='flex items-center gap-3 flex-1 min-w-0'>
                                    <input
                                        checked={selectedRateId === rateValue}
                                        value={rateValue}
                                        onChange={(e) => handleSelectRate(e.target.value)}
                                        type="radio"
                                        name="shipping_method"
                                        id={safeId}
                                        disabled={shippingLoading || updatingShipping}
                                        className="cursor-pointer"
                                    />
                                    <label htmlFor={safeId} className="break-normal max-w-full cursor-pointer font-medium text-gray-900">{rate.name}</label>
                                </div>
                                <div className='text-base text-[#111] font-semibold leading-[100%]'>
                                    {
                                        totalPrice === 0 ? <span className='text-green-600'>{t("free")}</span> : `${totalPrice.toFixed(2)}${cart?.totals?.currency_symbol || rate.currency_symbol || '€'}`
                                    }
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        );
    }
    
    // Address is complete but no shipping methods found
    return (
        <p className='text-sm text-gray-500 italic p-4 border border-gray-200 rounded-lg bg-gray-50'>
            {t("noShippingMethods")}
        </p>
    );
};

export default ShippingMethodsList;

