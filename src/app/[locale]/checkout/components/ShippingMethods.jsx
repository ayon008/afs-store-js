"use client";
import React from "react";
import { Truck, MapPin, Clock, CheckCircle2 } from "lucide-react";

const ShippingMethods = ({
    allShippingRates,
    selectedRateId,
    handleSelectRate,
    shippingLoading,
    updatingShipping,
    watchFields,
    cart,
    t
}) => {
    // Check if we have at least the country (minimum requirement)
    const hasCountry = !!watchFields.billing_country;

    // Get selected shipping cost for display
    const getSelectedShippingCost = () => {
        if (!selectedRateId || !allShippingRates || allShippingRates.length === 0) return null;
        const [packageId, rateId] = selectedRateId.split(':');
        const selectedRate = allShippingRates.find(rate =>
            rate.rate_id === rateId && String(rate.package_id || 0) === String(packageId)
        );
        if (!selectedRate) return null;
        const totalPrice = (selectedRate.price / 100 + (selectedRate.taxes || 0) / 100);
        return {
            name: selectedRate.name,
            price: totalPrice,
            isFree: totalPrice === 0
        };
    };

    const selectedShipping = getSelectedShippingCost();

    return (
        <div className='bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden'>
            {/* Header */}
            <div className='bg-[#000000] p-6'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                        <Truck className='w-6 h-6 text-white' />
                    </div>
                    <div>
                        <h3 className='text-2xl font-bold text-white'>{t("shippingMethods")}</h3>
                        {selectedShipping && (
                            <p className='text-sm text-gray-300 mt-1'>
                                {selectedShipping.name} - {selectedShipping.isFree
                                    ? <span className='text-green-400 font-medium'>{t("free")}</span>
                                    : <span className='text-white font-medium'>{selectedShipping.price.toFixed(2)}{cart?.totals?.currency_symbol || '€'}</span>
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className='p-6'>
                {/* Loading State */}
                {(updatingShipping || shippingLoading) && (
                    <div className='flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg'>
                        <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
                        <p className='text-sm text-blue-700 font-medium'>{t("processing")}</p>
                    </div>
                )}

                {/* No Country Selected */}
                {!shippingLoading && !updatingShipping && !hasCountry && (
                    <div className='flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg'>
                        <MapPin className='w-5 h-5 text-amber-600 flex-shrink-0' />
                        <p className='text-sm text-amber-700'>
                            {t("selectCountry")} {t("calculateShippingMethods")}
                        </p>
                    </div>
                )}

                {/* Shipping Rates */}
                {!shippingLoading && !updatingShipping && hasCountry && (
                    <>
                        {allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0 ? (
                            <ul className='space-y-3'>
                                {allShippingRates.map((rate, i) => {
                                    const totalPrice = (rate.price / 100 + (rate.taxes || 0) / 100);
                                    const safeId = `shipping_method_${String(rate.package_id).replace(/[:]/g, '_')}_${String(rate.rate_id).replace(/[:]/g, '_')}_${i}`;
                                    const rateValue = `${rate.package_id || 0}:${rate.rate_id}`;
                                    const isSelected = selectedRateId === rateValue;

                                    return (
                                        <li key={`shipping-rate-${rate.rate_id}-${i}`}>
                                            <label
                                                htmlFor={safeId}
                                                className={`
                                                    block cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
                                                    ${isSelected
                                                        ? 'border-[#1D98FF] bg-blue-50 shadow-md shadow-blue-100'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                    }
                                                `}
                                            >
                                                <div className='flex items-center gap-4'>
                                                    {/* Radio Button */}
                                                    <div className={`
                                                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                                        ${isSelected ? 'border-[#1D98FF] bg-[#1D98FF]' : 'border-gray-300'}
                                                    `}>
                                                        {isSelected && (
                                                            <div className='w-2 h-2 rounded-full bg-white' />
                                                        )}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="shipping_method_selection"
                                                        id={safeId}
                                                        value={rateValue}
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectRate(e.target.value)}
                                                        className="sr-only"
                                                    />

                                                    {/* Icon */}
                                                    <div className={`
                                                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                                        ${isSelected ? 'bg-[#1D98FF]' : 'bg-gray-100'}
                                                    `}>
                                                        <Truck className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='flex items-center gap-2'>
                                                            <span className={`font-semibold ${isSelected ? 'text-[#1D98FF]' : 'text-gray-900'}`}>
                                                                {rate.name}
                                                            </span>
                                                            {isSelected && (
                                                                <CheckCircle2 className='w-4 h-4 text-[#1D98FF]' />
                                                            )}
                                                        </div>
                                                        {rate.delivery_time && (
                                                            <div className='flex items-center gap-1 mt-1 text-sm text-gray-500'>
                                                                <Clock className='w-3.5 h-3.5' />
                                                                <span>{rate.delivery_time}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Price */}
                                                    <div className='text-right flex-shrink-0'>
                                                        {totalPrice === 0 ? (
                                                            <span className='text-lg font-bold text-green-600'>{t("free")}</span>
                                                        ) : (
                                                            <span className={`text-lg font-bold ${isSelected ? 'text-[#1D98FF]' : 'text-gray-900'}`}>
                                                                {totalPrice.toFixed(2)}{cart?.totals?.currency_symbol || rate.currency_symbol || '€'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className='flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                                <Truck className='w-5 h-5 text-gray-400 flex-shrink-0' />
                                <p className='text-sm text-gray-500'>
                                    {t("noShippingMethods")}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShippingMethods;
