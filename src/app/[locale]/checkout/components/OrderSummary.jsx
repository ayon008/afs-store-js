"use client";
import React, { useRef } from "react";
import { Package, Truck, CreditCard } from "lucide-react";
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
    totalTax
}) => {
    const summaryRef = useRef(null);

    // GSAP ScrollTrigger for sticky summary
    useGSAP(() => {
        if (!summaryRef.current) return;

        const ctx = gsap.context(() => {
            const element = summaryRef.current;
            const navbarHeight = 170; // Hauteur de la navbar

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
        <div className='hidden lg:block flex-1'>
            <div ref={summaryRef} className='bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col max-h-[calc(100vh-200px)]'>
                {/* Header */}
                <div className='bg-[#000000] p-6 lg:p-8 rounded-t-lg'>
                    <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
                        <Package className='w-6 h-6' />
                        {t("yourOrder")}
                    </h2>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-6 lg:p-8 space-y-6'>
                    {/* Products List */}
                    <div>
                        <h3 className='text-base font-semibold text-gray-900 mb-4'>{t("product")}</h3>
                        <div className='space-y-0'>
                            {items?.map((singleItem, i) => {
                                const lineSubtotal = parseFloat(singleItem?.totals?.line_subtotal || 0) / 100;
                                const lineTax = parseFloat(singleItem?.totals?.line_subtotal_tax || 0) / 100;
                                const totalPrice = lineSubtotal + lineTax;
                                return (
                                    <div key={singleItem.id || singleItem.key || i} className={`border-b border-gray-200 py-4 ${i === 0 ? 'border-t' : ''}`}>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-base text-gray-900 font-medium'>{singleItem?.name} x {singleItem?.quantity}</span>
                                            <span className='text-base text-[#111] font-semibold'>{totalPrice.toFixed(2)} {singleItem?.totals?.currency_symbol || currencySymbol}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Subtotal */}
                    <div className='pt-4 border-t border-gray-200'>
                        <div className='flex items-center justify-between'>
                            <span className='text-base text-gray-600'>{t("subtotal")}</span>
                            <span className='text-base text-[#111] font-semibold'>{sousTotal ? sousTotal.toFixed(2) : '0.00'}{currencySymbol}</span>
                        </div>
                    </div>

                    {/* Shipping Cost Display */}
                    {selectedRateId && allShippingRates && allShippingRates.length > 0 && (() => {
                        const [packageId, rateId] = selectedRateId.split(':');
                        const selectedRate = allShippingRates.find(rate =>
                            rate.rate_id === rateId && String(rate.package_id || 0) === String(packageId)
                        );
                        if (!selectedRate) return null;
                        const shippingPrice = (selectedRate.price / 100 + (selectedRate.taxes || 0) / 100);
                        return (
                            <div className='pt-4 border-t border-gray-200'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Truck className='w-4 h-4 text-gray-500' />
                                        <span className='text-base text-gray-600'>{selectedRate.name}</span>
                                    </div>
                                    <span className='text-base text-[#111] font-semibold'>
                                        {shippingPrice === 0 ? (
                                            <span className='text-green-600'>{t("free")}</span>
                                        ) : (
                                            `${shippingPrice.toFixed(2)}${currencySymbol}`
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Totals - Sticky Bottom */}
                <div className='bg-white border-t border-gray-200 p-6 lg:p-8 flex-shrink-0'>
                    <div className='flex items-center justify-between bg-[#000000] -mx-6 lg:-mx-8 px-6 lg:px-8 py-5 rounded-lg mb-6'>
                        <span className='text-lg font-bold text-white'>{t("total")}</span>
                        <div className='text-right'>
                            <strong className='text-2xl lg:text-3xl text-white font-bold block'>
                                {cartTotal ? cartTotal.toFixed(2) : '0.00'}{currencySymbol}
                            </strong>
                            {parseFloat(totalTax || 0) > 0 && (
                                <small className='text-gray-300 text-sm'>
                                    ({t("includingVAT")} <strong>{totalTax ? parseFloat(totalTax).toFixed(2) : '0.00'}{currencySymbol}</strong> {t("VAT")})
                                </small>
                            )}
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className='mb-6'>
                        <label className='flex items-center gap-3 cursor-pointer'>
                            <input
                                {...register("terms", { required: t("termsRequired") })}
                                type="checkbox"
                                id="terms"
                                className='w-5 h-5 rounded border-gray-300 text-[#1D98FF] focus:ring-[#1D98FF]'
                            />
                            <span className='text-sm text-gray-700'>{t("terms")}</span>
                        </label>
                        {errors.terms && (
                            <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.terms.message}</p>
                        )}
                    </div>

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
                                w-full p-4 bg-[#1D98FF] text-white font-semibold rounded-lg
                                disabled:opacity-50 disabled:cursor-not-allowed
                                hover:bg-[#1585e0] active:scale-[0.98]
                                shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                                transition-all duration-200
                                flex items-center justify-center gap-2
                            '
                        >
                            <CreditCard className="w-5 h-5" />
                            {isSubmitting ? t("processing") : watchFields.payment_method === 'bacs' ? t("placeOrder") : t("continue")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;

