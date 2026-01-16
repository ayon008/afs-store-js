"use client"
import React, { useState, useRef, useEffect } from 'react'
import { CheckCircle, ShoppingCart, Truck, CreditCard, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import useCart from '@/Shared/Hooks/useCart';
import CartList from './CartList';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { WAREHOUSES } from '@/lib/countries-config';

gsap.registerPlugin(ScrollTrigger);

// Helper to get cookie value
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const Cart = () => {
    const t = useTranslations("cart");
    const totalsRef = useRef(null);

    // Get location from cookie to determine tax display mode
    const [isEuropeLocation, setIsEuropeLocation] = useState(true);

    useEffect(() => {
        const locationFromCookie = getCookie('location');
        setIsEuropeLocation(locationFromCookie === WAREHOUSES.EUROPE || !locationFromCookie);

        // Log for debugging
        console.log('[Cart] Location:', locationFromCookie, 'isEurope:', locationFromCookie === WAREHOUSES.EUROPE || !locationFromCookie);
    }, []);

    // Shipping rates will be calculated at checkout
    const {
        getCurrencySymbol,
        getTotalPrice,
        getSubtotal,
        getTotalTax,
        cart,
    } = useCart();
    // const totalPrice = getTotalPrice();
    const currencySymbol = getCurrencySymbol();

    // Shipping rates will be handled at checkout after syncing with WooCommerce
    // For now, we'll show a message that shipping will be calculated at checkout
    const allShippingRates = [];


    // Use helper functions for totals (they work with localStorage cart)
    const total = parseFloat(getTotalPrice()) || 0;



    // cartItems
    const cartItems = cart?.items || [];
    const sub_total = parseFloat(getSubtotal()) || 0;
    const total_tax = parseFloat(getTotalTax()) || 0;

    // GSAP ScrollTrigger for sticky totals
    useGSAP(() => {
        if (!totalsRef.current) return;

        const ctx = gsap.context(() => {
            const element = totalsRef.current;
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
        }, { scope: totalsRef });

        return () => ctx?.revert();
    }, [cartItems.length]);





    return (
        <div className="bg-white">

            {/* Main Cart Container */}
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='flex flex-col lg:flex-row items-start gap-8'>
                    {/* Cart Items Section */}
                    <div className='w-full lg:flex-[2] space-y-6'>
                    {/* Cart Header */}
                    <div className='bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100'>
                        <div className='bg-[#000000] p-6'>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm'>
                                    <ShoppingCart className='w-6 h-6 text-white' />
                                </div>
                                <h2 className='text-2xl font-bold text-white'>
                                    {t("yourCart")} ({cartItems.length} {cartItems.length === 1 ? t("item") : t("items")})
                                </h2>
                            </div>
                        </div>

                        {/* Table Header - Desktop Only */}
                        <div className='hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#000000] global-b-bottom font-semibold text-gray-100 text-sm'>
                            <span className='col-span-1'></span>
                            <span className='col-span-5'>{t("product")}</span>
                            <span className='col-span-2 text-center'>{t("price")}</span>
                            <span className='col-span-2 text-center'>{t("quantity")}</span>
                            <span className='col-span-2 text-right'>{t("subtotalLabel")}</span>
                        </div>

                        {/* Cart Items */}
                        <div>
                            {
                                [...cartItems].reverse().map((item, i) => {
                                    return (
                                        <div key={i} className={i > 0 ? 'global-border-top' : ''}>
                                            <CartList item={item} />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                    </div>
                    {/* Right Side - Cart Totals */}
                    <div className='hidden lg:block flex-1'>
                        <div ref={totalsRef} className='bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col max-h-[calc(100vh-200px)]'>
                            <div className='bg-[#000000] p-6 lg:p-8 rounded-t-lg'>
                                <h2 className='text-2xl font-bold text-white flex items-center gap-3'>
                                    <Package className='w-6 h-6' />
                                    {t("cartTotals")}
                                </h2>
                            </div>

                            <div className='flex-1 overflow-y-auto p-6 lg:p-8 space-y-4'>
                                {/* Subtotal */}
                                <div className='flex items-center justify-between'>
                                    <span className='text-base text-gray-600'>
                                        {t("subtotal")}
                                        {/* Show HT indicator for North America */}
                                        {!isEuropeLocation && <span className='text-xs text-gray-400 ml-1'>({t("excludingTax") || "excl. tax"})</span>}
                                    </span>
                                    <span className='text-base text-[#111] font-semibold'>{sub_total}{currencySymbol}</span>
                                </div>

                                {/* Tax line - Only for North America */}
                                {!isEuropeLocation && parseFloat(total_tax) > 0 && (
                                    <div className='flex items-center justify-between'>
                                        <span className='text-base text-gray-600'>{t("tax") || "Tax"}</span>
                                        <span className='text-base text-[#111] font-semibold'>{total_tax}{currencySymbol}</span>
                                    </div>
                                )}

                                {/* Shipping Methods */}
                                <div className='pt-4 global-border-top'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <div className='w-8 h-8 bg-[#000000] rounded-lg flex items-center justify-center'>
                                            <Truck className='w-4 h-4 text-white' />
                                        </div>
                                        <h3 className='text-base font-semibold text-gray-900'>{t("shipping")}</h3>
                                    </div>

                                    <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700'>
                                        <p className='font-semibold mb-1 text-gray-900'>{t("shippingCalculatedAtCheckout")}</p>
                                        <p className='text-gray-600 text-xs'>
                                            {t("shippingCalculatedAtCheckoutDescription")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Total - Sticky Bottom */}
                            <div className='bg-white global-border-top p-6 lg:p-8 flex-shrink-0'>
                                <div className='flex items-center justify-between bg-[#000000] -mx-6 lg:-mx-8 px-6 lg:px-8 py-5 rounded-lg'>
                                    <span className='text-lg font-bold text-white'>{t("total")}</span>
                                    <div className='text-right'>
                                        <strong className='text-2xl lg:text-3xl text-white font-bold block'>
                                            {total || 0}{currencySymbol}
                                        </strong>
                                        {/* Europe: Show "including VAT" */}
                                        {isEuropeLocation && parseFloat(total_tax) > 0 && (
                                            <small className='text-gray-300 text-sm'>
                                                ({t("includingVAT")} <strong>{total_tax || 0}{currencySymbol}</strong> {t("VAT")})
                                            </small>
                                        )}
                                        {/* North America: Show "includes tax" */}
                                        {!isEuropeLocation && parseFloat(total_tax) > 0 && (
                                            <small className='text-gray-300 text-sm'>
                                                ({t("includesTax") || "includes tax"})
                                            </small>
                                        )}
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                {cartItems.length > 0 ? (
                                    <Link
                                        href="/checkout"
                                        className='
                                        p-4 cursor-pointer bg-[#1D98FF] text-white text-center text-base
                                        font-semibold uppercase w-full rounded-lg mt-6 block
                                            hover:bg-[#1585e0] active:scale-[0.98]
                                            shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                                            transition-all duration-200
                                            flex items-center justify-center gap-2
                                        '
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        {t("continueToCheckout")}
                                    </Link>
                                ) : (
                                    <div
                                        className='
                                        p-4 bg-gray-300 text-gray-500 text-center text-base
                                        font-semibold uppercase w-full rounded-lg mt-6 block
                                            flex items-center justify-center gap-2
                                            cursor-not-allowed
                                        '
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        {t("continueToCheckout")}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Cart Summary */}
                <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 animate-slideUp'>
                    <div className='flex items-center justify-between mb-3'>
                        <div>
                            <span className='text-sm text-gray-500'>{t("total")}</span>
                            {/* Europe: Show VAT included */}
                            {isEuropeLocation && parseFloat(total_tax) > 0 && (
                                <span className='text-xs text-gray-400 ml-2'>
                                    ({t("includingVAT")} {total_tax}{currencySymbol} {t("VAT")})
                                </span>
                            )}
                            {/* North America: Show "includes tax" */}
                            {!isEuropeLocation && parseFloat(total_tax) > 0 && (
                                <span className='text-xs text-gray-400 ml-2'>
                                    ({t("includesTax")})
                                </span>
                            )}
                        </div>
                        <span className='text-xl font-bold text-[#111]'>{total || 0}{currencySymbol}</span>
                    </div>
                    {cartItems.length > 0 ? (
                        <Link
                            href="/checkout"
                            className='
                                w-full py-3 bg-[#1D98FF] text-white font-semibold rounded-lg
                                flex items-center justify-center gap-2
                                shadow-lg shadow-blue-500/25
                                active:scale-[0.98] transition-all duration-200
                                hover:bg-[#1585e0]
                            '
                        >
                            <CreditCard className='w-5 h-5' />
                            {t("checkout")}
                        </Link>
                    ) : (
                        <div
                            className='
                                w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg
                                flex items-center justify-center gap-2
                                cursor-not-allowed
                            '
                        >
                            <CreditCard className='w-5 h-5' />
                            {t("checkout")}
                        </div>
                    )}
                </div>
            </div>
            {/* Spacer for mobile sticky */}
            <div className='lg:hidden h-28' />
        </div>
    )
}

export default Cart