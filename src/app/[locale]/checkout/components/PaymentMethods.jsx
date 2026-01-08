"use client";
import React from "react";
import { CreditCard } from "lucide-react";
import PaymentMethodCard from "@/Shared/Payment/PaymentMethodCard";
import CheckoutPayPal from "@/lib/CheckoutPaypal";
import CheckoutMonetico from "@/lib/CheckoutMonitico";
import CheckoutAuthorize from "@/lib/CheckoutAuthorize";
import Link from "next/link";

const PaymentMethods = ({
    register,
    watchFields,
    setValue,
    filteredPaymentMethods,
    getPaymentMethodTranslation,
    cart,
    items,
    isPayPalDisabled,
    allShippingRates,
    selectedRateId,
    clearSavedFormData,
    clearCart,
    router,
    t,
    PAYMENT_INSTRUCTIONS,
    setOrderProcessing,
    syncCartToAPI
}) => {
    return (
        <div className='bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden'>
            {/* Header */}
            <div className='bg-[#000000] p-6'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                        <CreditCard className='w-6 h-6 text-white' />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>{t("paymentMethod")}</h3>
                </div>
            </div>

            {/* Content */}
            <div className='p-6 space-y-4'>
                {filteredPaymentMethods?.map((method, i) => {
                    const isSelected = watchFields.payment_method === method.id;
                    const isMonetico = method.id?.toLowerCase().includes('monetico') ||
                        method.title?.toLowerCase().includes('carte bancaire');
                    const isPayPal = method.id === 'paypal' || method.id === 'ppcp-gateway';
                    const isAuthorize = method.id === 'authnet' || method.id?.toLowerCase().includes('authnet');
                    
                    // Get translated title and description
                    const paymentTranslation = getPaymentMethodTranslation(method);

                    return (
                        <PaymentMethodCard
                            key={method.id || i}
                            method={method}
                            selected={isSelected}
                            onSelect={() => setValue('payment_method', method.id)}
                            translatedTitle={paymentTranslation.title}
                            description={paymentTranslation.description}
                        >
                            {/* Payment Instructions */}
                            {PAYMENT_INSTRUCTIONS[method.id] && (
                                <div className='bg-blue-50 border-l-4 border-[#1D98FF] rounded-lg p-4 text-sm text-gray-700 mb-4'>
                                    <p>{PAYMENT_INSTRUCTIONS[method.id]}</p>
                                </div>
                            )}

                            {/* PayPal Component */}
                            {isPayPal && cart && items && (
                                <div className="mt-2">
                                    <CheckoutPayPal
                                        cartData={{
                                            totals: cart?.totals || {},
                                            lineItems: items?.map(item => ({
                                                product_id: item.id,
                                                quantity: item.quantity,
                                                variation_id: item.variation_id || 0
                                            })) || [],
                                            shippingLines: allShippingRates
                                                ?.filter(rate => rate.rate_id === selectedRateId)
                                                .map(rate => ({
                                                    method_id: rate.method_id,
                                                    method_title: rate.name,
                                                    total: (rate.price / 100).toString()
                                                })) || []
                                        }}
                                        customerData={{
                                            ...watchFields,
                                            billing: {
                                                first_name: watchFields.billing_first_name,
                                                last_name: watchFields.billing_last_name,
                                                email: watchFields.billing_email,
                                                phone: watchFields.billing_phone || ''
                                            }
                                        }}
                                        disabled={isPayPalDisabled}
                                        setOrderProcessing={setOrderProcessing}
                                        syncCartToAPI={syncCartToAPI}
                                        onSuccess={(details) => {
                                            clearSavedFormData();
                                            clearCart();
                                            router.replace(`/order-success?order_id=${details.orderId}`);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Monetico Component */}
                            {isMonetico && cart && items && (
                                <div className="mt-2">
                                    <CheckoutMonetico
                                        cartData={{
                                            totals: cart?.totals || {},
                                            lineItems: items?.map(item => ({
                                                product_id: item.id,
                                                quantity: item.quantity,
                                                variation_id: item.variation_id || 0
                                            })) || [],
                                            shippingLines: allShippingRates
                                                ?.filter(rate => rate.rate_id === selectedRateId)
                                                .map(rate => ({
                                                    method_id: rate.method_id,
                                                    method_title: rate.name,
                                                    total: (rate.price / 100).toString()
                                                })) || []
                                        }}
                                        customerData={{
                                            ...watchFields,
                                            billing: {
                                                ...watchFields,
                                                first_name: watchFields.billing_first_name,
                                                last_name: watchFields.billing_last_name,
                                                email: watchFields.billing_email,
                                            }
                                        }}
                                        disabled={!watchFields.terms}
                                        setOrderProcessing={setOrderProcessing}
                                        syncCartToAPI={syncCartToAPI}
                                        onSuccess={(details) => {
                                            clearSavedFormData();
                                            clearCart();
                                            router.replace(`/order-success?order_id=${details.orderId}`);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Authorize Component */}
                            {isAuthorize && cart && items && (
                                <div className="mt-2">
                                    <CheckoutAuthorize
                                        cartData={{
                                            totals: cart?.totals || {},
                                            lineItems: items?.map(item => ({
                                                product_id: item.id,
                                                quantity: item.quantity,
                                                variation_id: item.variation_id || 0
                                            })) || [],
                                            shippingLines: allShippingRates
                                                ?.filter(rate => rate.rate_id === selectedRateId)
                                                .map(rate => ({
                                                    method_id: rate.method_id,
                                                    method_title: rate.name,
                                                    total: (rate.price / 100).toString()
                                                })) || []
                                        }}
                                        customerData={{
                                            ...watchFields,
                                            billing: {
                                                ...watchFields,
                                                first_name: watchFields.billing_first_name,
                                                last_name: watchFields.billing_last_name,
                                                email: watchFields.billing_email,
                                            }
                                        }}
                                        disabled={!watchFields.terms}
                                        setOrderProcessing={setOrderProcessing}
                                        syncCartToAPI={syncCartToAPI}
                                        onSuccess={(details) => {
                                            clearSavedFormData();
                                            clearCart();
                                            router.replace(`/order-success?order_id=${details.orderId}`);
                                        }}
                                    />
                                </div>
                            )}
                        </PaymentMethodCard>
                    )
                })}
            </div>

            {/* Privacy Policy */}
            <div className='bg-gray-50 p-6 border-t border-gray-100'>
                <p className='text-sm text-gray-600'>
                    {t("privacyPolicyText")}{' '}
                    <Link href="/privacy-policy" className='text-[#1D98FF] hover:underline'>{t("privacyPolicy")}</Link>
                </p>
            </div>
        </div>
    );
};

export default PaymentMethods;

