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
    getValues,
    control,
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
    syncCartToAPI,
    reloadPaymentMethods,
    loadCart
}) => {
    // Helper function to get form values directly from DOM (bypasses React Compiler issues with getValues)
    // This is a workaround for React Compiler compatibility issues with React Hook Form
    const getFormValuesFromDOM = () => {
        const form = document.querySelector('form');
        if (!form) {
            console.warn('[PaymentMethods] No form found in DOM');
            return {};
        }
        
        const values = {};
        
        // Get all input, select, and textarea values by name attribute
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const name = input.name || input.id;
            if (name) {
                if (input.type === 'checkbox') {
                    values[name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        values[name] = input.value;
                    }
                } else {
                    values[name] = input.value || '';
                }
            }
        });
        
        return values;
    };
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
                                            shippingLines: (() => {
                                                if (!selectedRateId || !allShippingRates) return [];
                                                // selectedRateId is now in format "package_id:rate_id"
                                                // Note: rate_id can contain colons (e.g., "flat_rate:49"), so we need to split carefully
                                                const colonIndex = selectedRateId.indexOf(':');
                                                if (colonIndex === -1) return [];
                                                const packageId = selectedRateId.substring(0, colonIndex);
                                                const rateId = selectedRateId.substring(colonIndex + 1);
                                                return allShippingRates
                                                    .filter(rate =>
                                                        rate.rate_id === rateId &&
                                                        String(rate.package_id || 0) === String(packageId)
                                                    )
                                                    .map(rate => ({
                                                        method_id: rate.method_id,
                                                        method_title: rate.name,
                                                        total: (rate.price / 100).toString()
                                                    }));
                                            })()
                                        }}
                                        getCustomerData={() => {
                                            // Read values directly from DOM to bypass React Compiler issues with getValues()
                                            const domValues = getFormValuesFromDOM();
                                            
                                            // Also try getValues() and watchFields as fallbacks
                                            let rhfValues = {};
                                            if (getValues && typeof getValues === 'function') {
                                                try {
                                                    rhfValues = getValues();
                                                } catch (e) {
                                                    console.warn('[PayPal] getValues() failed, using DOM values');
                                                }
                                            }
                                            
                                            // Merge: DOM values take precedence (most reliable), then RHF values, then watchFields
                                            const values = {
                                                ...watchFields,
                                                ...rhfValues,
                                                ...domValues // DOM values override everything (most current)
                                            };
                                            
                                            return {
                                                ...values,
                                                billing: {
                                                    first_name: domValues.billing_first_name || values.billing_first_name || '',
                                                    last_name: domValues.billing_last_name || values.billing_last_name || '',
                                                    email: domValues.billing_email || values.billing_email || '',
                                                    phone: domValues.billing_phone || values.billing_phone || '',
                                                    company: domValues.billing_company || values.billing_company || '',
                                                    country: domValues.billing_country || values.billing_country || '',
                                                    address_1: domValues.billing_address_1 || values.billing_address_1 || '',
                                                    city: domValues.billing_city || values.billing_city || '',
                                                    state: domValues.billing_state || values.billing_state || '',
                                                    postcode: domValues.billing_postcode || values.billing_postcode || ''
                                                }
                                            };
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
                                            shippingLines: (() => {
                                                if (!selectedRateId || !allShippingRates) return [];
                                                // selectedRateId is now in format "package_id:rate_id"
                                                // Note: rate_id can contain colons (e.g., "flat_rate:49"), so we need to split carefully
                                                const colonIndex = selectedRateId.indexOf(':');
                                                if (colonIndex === -1) return [];
                                                const packageId = selectedRateId.substring(0, colonIndex);
                                                const rateId = selectedRateId.substring(colonIndex + 1);
                                                return allShippingRates
                                                    .filter(rate =>
                                                        rate.rate_id === rateId &&
                                                        String(rate.package_id || 0) === String(packageId)
                                                    )
                                                    .map(rate => ({
                                                        method_id: rate.method_id,
                                                        method_title: rate.name,
                                                        total: (rate.price / 100).toString()
                                                    }));
                                            })()
                                        }}
                                        getCustomerData={() => {
                                            // Read values directly from DOM to bypass React Compiler issues with getValues()
                                            // This is a workaround for React Compiler compatibility issues with React Hook Form
                                            const domValues = getFormValuesFromDOM();
                                            
                                            // Also try getValues() and watchFields as fallbacks
                                            let rhfValues = {};
                                            if (getValues && typeof getValues === 'function') {
                                                try {
                                                    rhfValues = getValues();
                                                } catch (e) {
                                                    console.warn('[Monetico] getValues() failed, using DOM values');
                                                }
                                            }
                                            
                                            // Merge: DOM values take precedence (most reliable), then RHF values, then watchFields
                                            const values = {
                                                ...watchFields,
                                                ...rhfValues,
                                                ...domValues // DOM values override everything (most current)
                                            };
                                            
                                            // Ensure we have billing_email from multiple sources
                                            const billingEmail = domValues.billing_email || 
                                                                values.billing_email || 
                                                                rhfValues.billing_email ||
                                                                watchFields?.billing_email ||
                                                                '';
                                            
                                            const result = {
                                                ...values,
                                                billing_email: billingEmail, // Ensure it's at root level
                                                billing: {
                                                    first_name: domValues.billing_first_name || values.billing_first_name || '',
                                                    last_name: domValues.billing_last_name || values.billing_last_name || '',
                                                    email: billingEmail,
                                                    phone: domValues.billing_phone || values.billing_phone || '',
                                                    company: domValues.billing_company || values.billing_company || '',
                                                    country: domValues.billing_country || values.billing_country || '',
                                                    address_1: domValues.billing_address_1 || values.billing_address_1 || '',
                                                    city: domValues.billing_city || values.billing_city || '',
                                                    state: domValues.billing_state || values.billing_state || '',
                                                    postcode: domValues.billing_postcode || values.billing_postcode || ''
                                                }
                                            };
                                            
                                            return result;
                                        }}
                                        disabled={!watchFields.terms}
                                        setOrderProcessing={setOrderProcessing}
                                        syncCartToAPI={syncCartToAPI}
                                        onSuccess={(details) => {
                                            clearSavedFormData();
                                            clearCart();
                                            router.replace(`/order-success?order_id=${details.orderId}`);
                                        }}
                                        onError={async (error) => {
                                            // Reload cart and payment methods after error to update currency/location
                                            console.log('[Authorize] Payment error, reloading cart and payment methods...');
                                            if (loadCart) {
                                                await loadCart();
                                            }
                                            if (reloadPaymentMethods) {
                                                await reloadPaymentMethods();
                                            }
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
                                            shippingLines: (() => {
                                                if (!selectedRateId || !allShippingRates) return [];
                                                // selectedRateId is now in format "package_id:rate_id"
                                                // Note: rate_id can contain colons (e.g., "flat_rate:49"), so we need to split carefully
                                                const colonIndex = selectedRateId.indexOf(':');
                                                if (colonIndex === -1) return [];
                                                const packageId = selectedRateId.substring(0, colonIndex);
                                                const rateId = selectedRateId.substring(colonIndex + 1);
                                                return allShippingRates
                                                    .filter(rate =>
                                                        rate.rate_id === rateId &&
                                                        String(rate.package_id || 0) === String(packageId)
                                                    )
                                                    .map(rate => ({
                                                        method_id: rate.method_id,
                                                        method_title: rate.name,
                                                        total: (rate.price / 100).toString()
                                                    }));
                                            })()
                                        }}
                                        getCustomerData={() => {
                                            // Read values directly from DOM to bypass React Compiler issues with getValues()
                                            const domValues = getFormValuesFromDOM();
                                            
                                            // Also try getValues() and watchFields as fallbacks
                                            let rhfValues = {};
                                            if (getValues && typeof getValues === 'function') {
                                                try {
                                                    rhfValues = getValues();
                                                } catch (e) {
                                                    console.warn('[Authorize] getValues() failed, using DOM values');
                                                }
                                            }
                                            
                                            // Merge: DOM values take precedence (most reliable), then RHF values, then watchFields
                                            const values = {
                                                ...watchFields,
                                                ...rhfValues,
                                                ...domValues // DOM values override everything (most current)
                                            };
                                            
                                            return {
                                                ...values,
                                                billing_email: domValues.billing_email || values.billing_email || '', // Add at root level for Authorize.Net
                                                billing: {
                                                    first_name: domValues.billing_first_name || values.billing_first_name || '',
                                                    last_name: domValues.billing_last_name || values.billing_last_name || '',
                                                    email: domValues.billing_email || values.billing_email || '',
                                                    phone: domValues.billing_phone || values.billing_phone || '',
                                                    company: domValues.billing_company || values.billing_company || '',
                                                    country: domValues.billing_country || values.billing_country || '',
                                                    address_1: domValues.billing_address_1 || values.billing_address_1 || '',
                                                    city: domValues.billing_city || values.billing_city || '',
                                                    state: domValues.billing_state || values.billing_state || '',
                                                    postcode: domValues.billing_postcode || values.billing_postcode || ''
                                                }
                                            };
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

