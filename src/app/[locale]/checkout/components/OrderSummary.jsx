"use client";
import React, { useRef } from "react";
import { Truck, CreditCard, Receipt, ShieldCheck } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const OrderSummary = ({
    cart,
    items,
    allShippingRates,
    selectedRateId,
    watchFields,
    register,
    errors,
    isSubmitting,
    onSubmit,
    t,
    currencySymbol,
    sousTotal,
    cartTotal,
    totalTax,
    updatingTaxes = false,
    isEuropeLocation = true // Default to Europe (TTC display)
}) => {
    const summaryRef = useRef(null);

    // For North America: Calculate subtotal without tax (HT)
    const subtotalHT = isEuropeLocation ? sousTotal : (sousTotal - (parseFloat(totalTax) || 0));

    // Get shipping info
    const getShippingInfo = () => {
        if (!selectedRateId || !allShippingRates || allShippingRates.length === 0) {
            return null;
        }
        const colonIndex = selectedRateId.indexOf(':');
        if (colonIndex === -1) return null;
        const packageId = selectedRateId.substring(0, colonIndex);
        const rateId = selectedRateId.substring(colonIndex + 1);
        const selectedRate = allShippingRates.find(rate =>
            rate.rate_id === rateId && String(rate.package_id || 0) === String(packageId)
        );
        if (!selectedRate) return null;
        const shippingPrice = (selectedRate.price / 100 + (selectedRate.taxes || 0) / 100);
        return { ...selectedRate, totalPrice: shippingPrice };
    };

    const shippingInfo = getShippingInfo();

    // Get tax label for North America
    const getTaxLabel = () => {
        const country = watchFields?.shipping_country || watchFields?.billing_country || '';
        const state = watchFields?.shipping_state || watchFields?.billing_state || '';
        let taxLabel = t("tax") || "Tax";
        if ((country === 'US' || country === 'CA') && state) {
            taxLabel = `${state} ${t("tax") || "Tax"}`;
        }
        return taxLabel;
    };

    // GSAP ScrollTrigger for sticky summary
    useGSAP(() => {
        if (!summaryRef.current) return;

        const ctx = gsap.context(() => {
            const element = summaryRef.current;
            const navbarHeight = 170;

            ScrollTrigger.create({
                trigger: element,
                start: `top top+=${navbarHeight}`,
                endTrigger: "body",
                end: "bottom bottom",
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
            });
        }, { scope: summaryRef });

        return () => ctx?.revert();
    }, [items?.length]);

    return (
        <div className='hidden lg:block flex-1 h-full'>
            <div ref={summaryRef} className='bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col h-[calc(100vh-200px)] overflow-hidden'>
                
                {/* Header - Black background */}
                <div className='bg-black px-6 py-5 rounded-t-2xl'>
                    <h2 className='text-xl font-semibold text-white flex items-center gap-3'>
                        <div className='p-2 bg-white/10 rounded-lg'>
                            <Receipt className='w-5 h-5' />
                        </div>
                        {t("yourOrder")}
                    </h2>
                </div>

                {/* Products List - Scrollable, takes remaining space */}
                <div className='flex-1 overflow-y-auto min-h-0'>
                    <div className='p-6 space-y-3'>
                        {items?.map((singleItem, i) => {
                            const lineSubtotal = parseFloat(singleItem?.totals?.line_subtotal || 0) / 100;
                            const lineTax = parseFloat(singleItem?.totals?.line_subtotal_tax || 0) / 100;
                            const totalPrice = lineSubtotal + lineTax;
                            return (
                                <div 
                                    key={singleItem.id || singleItem.key || i} 
                                    className='flex items-start justify-between py-3 border-b border-dashed border-gray-200 last:border-b-0'
                                >
                                    <div className='flex items-start gap-3 flex-1 min-w-0'>
                                        <div className='flex-shrink-0 w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600'>
                                            {singleItem?.quantity}
                                        </div>
                                        <span className='text-sm text-gray-800 font-medium leading-tight'>
                                            {singleItem?.name}
                                        </span>
                                    </div>
                                    <span className='text-sm text-gray-900 font-semibold ml-3 whitespace-nowrap'>
                                        {totalPrice.toFixed(2)}{singleItem?.totals?.currency_symbol || currencySymbol}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Summary Section - Fixed Bottom */}
                <div className='flex-shrink-0 bg-gray-50'>
                    {/* Price Breakdown */}
                    <div className='px-6 py-4 space-y-3 border-t border-dashed border-gray-300'>
                        {/* Subtotal */}
                        <div className='flex items-center justify-between text-sm'>
                            <span className='text-gray-500'>
                                {t("subtotal")}
                                {!isEuropeLocation && (
                                    <span className='text-xs text-gray-400 ml-1'>({t("excludingTax") || "excl. tax"})</span>
                                )}
                            </span>
                            <span className='text-gray-700 font-medium'>
                                {isEuropeLocation
                                    ? (sousTotal ? sousTotal.toFixed(2) : '0.00')
                                    : (subtotalHT ? subtotalHT.toFixed(2) : '0.00')
                                }{currencySymbol}
                            </span>
                        </div>

                        {/* Shipping */}
                        {shippingInfo && (
                            <div className='flex items-center justify-between text-sm'>
                                <span className='text-gray-500 flex items-center gap-1.5'>
                                    <Truck className='w-3.5 h-3.5' />
                                    {shippingInfo.name}
                                </span>
                                <span className='font-medium'>
                                    {shippingInfo.totalPrice === 0 ? (
                                        <span className='text-emerald-600'>{t("free")}</span>
                                    ) : (
                                        <span className='text-gray-700'>{shippingInfo.totalPrice.toFixed(2)}{currencySymbol}</span>
                                    )}
                                </span>
                            </div>
                        )}

                        {/* Tax - North America only */}
                        {!isEuropeLocation && (parseFloat(totalTax) > 0 || updatingTaxes) && (
                            <div className='flex items-center justify-between text-sm'>
                                <span className='text-gray-500'>{getTaxLabel()}</span>
                                <span className='text-gray-700 font-medium'>
                                    {updatingTaxes ? (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                                        </span>
                                    ) : (
                                        `${totalTax ? parseFloat(totalTax).toFixed(2) : '0.00'}${currencySymbol}`
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className='px-6 py-4 border-t border-dashed border-gray-300'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <span className='text-gray-600 text-sm font-medium'>{t("total")}</span>
                                {/* Europe: VAT info */}
                                {isEuropeLocation && (parseFloat(totalTax || 0) > 0 || updatingTaxes) && (
                                    <p className='text-gray-400 text-xs mt-0.5'>
                                        {t("includingVAT")}{' '}
                                        {updatingTaxes ? (
                                            <span className="animate-pulse">...</span>
                                        ) : (
                                            <span className='text-gray-500'>{totalTax ? parseFloat(totalTax).toFixed(2) : '0.00'}{currencySymbol}</span>
                                        )}{' '}
                                        {t("VAT")}
                                    </p>
                                )}
                                {/* North America: includes tax */}
                                {!isEuropeLocation && parseFloat(totalTax || 0) > 0 && (
                                    <p className='text-gray-400 text-xs mt-0.5'>
                                        {t("includesTax") || "includes tax"}
                                    </p>
                                )}
                            </div>
                            <div className='text-right'>
                                <strong className='text-2xl text-gray-900 font-bold'>
                                    {cartTotal ? cartTotal.toFixed(2) : '0.00'}{currencySymbol}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Submit */}
                    <div className='px-6 pb-6 pt-2 space-y-4 border-t border-dashed border-gray-300 bg-white'>
                        {/* Terms Checkbox */}
                        <label className='flex items-start gap-3 cursor-pointer group'>
                            <div className='relative flex-shrink-0 mt-0.5'>
                                <input
                                    {...register("terms", { required: t("termsRequired") })}
                                    type="checkbox"
                                    id="terms"
                                    className='peer sr-only'
                                />
                                <div className='w-5 h-5 rounded-md border-2 border-gray-300 bg-white peer-checked:bg-[#1D98FF] peer-checked:border-[#1D98FF] transition-all duration-200 flex items-center justify-center'>
                                    <svg className='w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                                    </svg>
                                </div>
                            </div>
                            <span className='text-xs text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors'>
                                {t("terms")}
                            </span>
                        </label>
                        {errors.terms && (
                            <p className="text-red-500 text-xs -mt-2 animate-slideDown">{errors.terms.message}</p>
                        )}

                        {/* Place Order Button */}
                        {!watchFields.payment_method?.toLowerCase().includes('monetico') &&
                            watchFields.payment_method !== 'paypal' &&
                            watchFields.payment_method !== 'ppcp-gateway' &&
                            watchFields.payment_method !== 'authnet' && (
                            <button
                                type="submit"
                                onClick={onSubmit}
                                disabled={isSubmitting || !watchFields.terms}
                                className='
                                    w-full py-4 bg-[#1D98FF] text-white font-semibold rounded-xl
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    hover:bg-[#1585e0] active:scale-[0.98]
                                    shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40
                                    transition-all duration-200
                                    flex items-center justify-center gap-2
                                '
                            >
                                <CreditCard className="w-5 h-5" />
                                {isSubmitting ? t("processing") : watchFields.payment_method === 'bacs' ? t("placeOrder") : t("continue")}
                            </button>
                        )}

                        {/* Security Badge */}
                        <div className='flex items-center justify-center gap-2 text-xs text-gray-400 pt-2'>
                            <ShieldCheck className='w-4 h-4' />
                            <span>{t("securePayment")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
