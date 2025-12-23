"use client"
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { CheckCircle, X, ShoppingCart, Truck, CreditCard, Tag, Package } from 'lucide-react';
import useCart from '@/Shared/Hooks/useCart';
import FormButton from '@/Shared/Button/FormButton';
import CartList from './CartList';
import ShippingMethodCard from '@/Shared/Shipping/ShippingMethodCard';
import { selectShippingRate } from '@/app/actions/Woo-Coommerce/Shop/Cart/cart';

const Cart = () => {
    // const [shippingData, setShippingData] = useState([]);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [selectedRateId, setSelectedRateId] = useState(null);
    const [isSelectingRate, setIsSelectingRate] = useState(false); // Flag to prevent useEffect from overriding selection
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    const {
        handleApplyCoupon,
        handleRemoveCoupon,
        getAppliedCoupons,
        getDiscountTotal,
        getCurrencySymbol,
        loadCart,
        cart,
        setCart
    } = useCart();

    const appliedCoupons = getAppliedCoupons();
    const discountTotal = getDiscountTotal();
    // const totalPrice = getTotalPrice();
    const currencySymbol = getCurrencySymbol();

    const allShippingRates = cart?.shipping_rates?.flatMap(pkg =>
        pkg.shipping_rates?.map(rate => ({
            ...rate,
            package_id: pkg.package_id
        })) || []
    ) || [];


    useEffect(() => {
        // Don't override user selection while they're selecting a rate
        if (isSelectingRate) return;

        const selected = allShippingRates.find(rate => rate.selected);

        if (selected) {
            setSelectedRateId(selected.rate_id);
        } else {
            setSelectedRateId(null);
        }
    }, [allShippingRates, isSelectingRate]);


    const handleSelectRate = async (value) => {
        // Handle values like "0:free_shipping:42" or "0:local_pickup:34"
        const firstColonIndex = value.indexOf(':');
        const packageId = firstColonIndex !== -1 ? value.substring(0, firstColonIndex) : '0';
        const rateId = firstColonIndex !== -1 ? value.substring(firstColonIndex + 1) : value;
        console.log('handleSelectRate called:', { packageId, rateId, currentSelected: selectedRateId });
        
        if (rateId === selectedRateId) {
            console.log('Same rate selected, ignoring');
            return;
        }

        setIsSelectingRate(true); // Prevent useEffect from overriding
        setShippingLoading(true);
        setSelectedRateId(rateId); // Update immediately for better UX
        console.log('Setting selectedRateId to:', rateId);

        try {
            const result = await selectShippingRate(rateId, packageId);
            console.log('Select shipping rate result:', result);

            if (result.success) {
                // Use the cart data directly from the response if available
                // This ensures we have the latest data without waiting for cookie sync
                if (result.cart && result.cart.success && result.cart.data) {
                    setCart(result.cart.data);
                    console.log('Cart updated directly from response', result.cart.data);
                    
                    // Verify the shipping rate is actually selected in the updated cart
                    const updatedRates = result.cart.data?.shipping_rates?.flatMap(pkg =>
                        pkg.shipping_rates?.map(rate => ({
                            ...rate,
                            package_id: pkg.package_id
                        })) || []
                    ) || [];
                    
                    const selectedInCart = updatedRates.find(rate => rate.selected);
                    if (selectedInCart && selectedInCart.rate_id === rateId) {
                        console.log('Shipping rate confirmed selected in cart');
                    } else {
                        console.warn('Shipping rate not found as selected in cart, reloading...');
                        // Wait a bit more and reload if the rate isn't selected
                        await new Promise(resolve => setTimeout(resolve, 300));
                        await loadCart();
                    }
                } else {
                    // Fallback: wait a bit longer then reload
                    await new Promise(resolve => setTimeout(resolve, 300));
                    await loadCart();
                }
            } else {
                console.error('Failed to select shipping rate:', result.error);
                // Revert selection on error
                const selected = allShippingRates.find(rate => rate.selected);
                if (selected) {
                    setSelectedRateId(selected.rate_id);
                } else {
                    setSelectedRateId(null);
                }
            }
        } catch (error) {
            console.error('Error selecting shipping rate:', error);
            // Revert selection on error
            const selected = allShippingRates.find(rate => rate.selected);
            if (selected) {
                setSelectedRateId(selected.rate_id);
            } else {
                setSelectedRateId(null);
            }
        } finally {
            setShippingLoading(false);
            // Allow useEffect to sync again after cart is updated
            // Wait longer to ensure cart state is fully updated
            setTimeout(() => {
                setIsSelectingRate(false);
            }, 1000);
        }
    };


    const total = cart?.totals?.total_price / 100;


    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess('');

        const result = await handleApplyCoupon(couponCode);

        if (result.success) {
            setCouponSuccess('Code promo appliqué avec succès.');
            setCouponCode('');
        } else {
            setCouponError(result.error || 'Code promo invalide');
        }

        setCouponLoading(false);
    };

    const handleRemoveCouponClick = async (code) => {
        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess(''); // Clear success message when removing coupon

        const result = await handleRemoveCoupon(code);

        if (!result.success) {
            setCouponError(result.error || 'Erreur lors de la suppression du coupon');
        }
        // No success message when removing - just clear the banner

        setCouponLoading(false);
    };

    // cartItems
    const cartItems = cart?.items || [];
    // const total = cart?.totals?.total_price / 100;
    const sub_total = cart?.totals?.total_items / 100 + cart?.totals?.total_items_tax / 100 || 0;
    const total_tax = cart?.totals?.total_tax / 100;





    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Success Notification */}
            {
                couponSuccess && (
                    <div className='py-4 px-6 flex items-center gap-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md my-8 mx-auto max-w-7xl animate-slideDown'>
                        <CheckCircle className='w-5 h-5 text-green-600' />
                        <span className='text-green-800 text-lg font-medium'>Coupon applied successfully!</span>
                    </div>
                )
            }

            {/* Main Cart Container */}
            <div className='flex flex-col lg:flex-row items-start gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Cart Items Section */}
                <div className='w-full lg:flex-[2] space-y-6'>
                    {/* Cart Header */}
                    <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
                        <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-5'>
                            <div className='flex items-center gap-3'>
                                <ShoppingCart className='w-6 h-6 text-white' />
                                <h2 className='text-2xl font-bold text-white'>Your Cart ({cartItems.length} items)</h2>
                            </div>
                        </div>

                        {/* Table Header - Desktop Only */}
                        <div className='hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-medium text-gray-700 text-sm'>
                            <span className='col-span-1'></span>
                            <span className='col-span-5'>Product</span>
                            <span className='col-span-2 text-center'>Price</span>
                            <span className='col-span-2 text-center'>Quantity</span>
                            <span className='col-span-2 text-right'>Subtotal</span>
                        </div>

                        {/* Cart Items */}
                        <div className='divide-y divide-gray-100'>
                            {
                                [...cartItems].reverse().map((item, i) => {
                                    return <CartList key={i} item={item} />
                                })
                            }
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div className='bg-white rounded-2xl shadow-sm p-6 space-y-4'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Tag className='w-5 h-5 text-blue-600' />
                            <h3 className='text-lg font-semibold text-gray-800'>Have a coupon?</h3>
                        </div>

                        <form onSubmit={handleCouponSubmit} className='flex flex-col sm:flex-row gap-3'>
                            <input
                                type="text"
                                name='coupon-code'
                                placeholder='Enter coupon code'
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className='flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                                disabled={couponLoading}
                            />
                            <button
                                type='submit'
                                disabled={couponLoading || !couponCode.trim()}
                                className='px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md'
                            >
                                {couponLoading ? 'Applying...' : 'Apply Coupon'}
                            </button>
                        </form>

                        {couponError && (
                            <div className='flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg'>
                                <X className='w-4 h-4' />
                                <p className='text-sm'>{couponError}</p>
                            </div>
                        )}

                        {appliedCoupons.length > 0 && (
                            <div className='bg-green-50 rounded-lg p-4'>
                                <p className='text-sm font-medium text-gray-700 mb-2'>Applied coupons:</p>
                                <div className='flex flex-wrap gap-2'>
                                    {appliedCoupons.map((coupon, index) => (
                                        <div
                                            key={index}
                                            className='inline-flex items-center gap-2 bg-white border border-green-300 text-green-800 px-3 py-1.5 rounded-full text-sm'
                                        >
                                            <Tag className='w-3 h-3' />
                                            <span className='font-medium'>{coupon.code}</span>
                                            <span className='text-green-600 font-bold'>
                                                -{(coupon.totals?.total_discount / 100 || 0).toFixed(2)}€
                                            </span>
                                            <button
                                                type='button'
                                                onClick={() => handleRemoveCouponClick(coupon.code)}
                                                disabled={couponLoading}
                                                className='ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors disabled:opacity-50'
                                            >
                                                <X className='w-3.5 h-3.5 text-red-500' />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Right Side - Cart Totals */}
                <div className='hidden lg:block flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 sticky top-24'>
                    <h2 className='text-2xl font-bold text-[#111] pb-5 border-b border-gray-200 mb-6'>
                        Cart totals
                    </h2>

                    <div className='space-y-4'>
                        {/* Subtotal */}
                        <div className='flex items-center justify-between'>
                            <span className='text-base text-gray-600'>Sub total</span>
                            <span className='text-base text-[#111] font-semibold'>{sub_total}{currencySymbol}</span>
                        </div>

                        {/* Discount */}
                        {parseFloat(discountTotal) > 0 && (
                            <div className='flex items-center justify-between'>
                                <span className='text-base text-gray-600'>Discount</span>
                                <span className='text-base text-green-600 font-semibold'>-{discountTotal}{currencySymbol}</span>
                            </div>
                        )}

                        {/* Shipping Methods */}
                        <div className='pt-4 border-t border-gray-100'>
                            <div className='flex items-center gap-2 mb-4'>
                                <Truck className='w-5 h-5 text-[#1D98FF]' />
                                <h3 className='text-base font-semibold text-[#111]'>Méthodes de livraison</h3>
                            </div>

                            {allShippingRates && allShippingRates.length > 0 ? (
                                <div className='space-y-3'>
                                    {allShippingRates.map((rate, i) => (
                                        <ShippingMethodCard
                                            key={`shipping-rate-${rate.rate_id}-${i}`}
                                            rate={rate}
                                            selected={selectedRateId === rate.rate_id}
                                            onSelect={(r) => handleSelectRate(`${r.package_id}:${r.rate_id}`)}
                                            disabled={shippingLoading}
                                            freeLabel="Gratuit"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className='p-4 bg-gray-50 rounded-xl text-sm text-gray-500 italic'>
                                    Aucune méthode de livraison disponible. Veuillez vérifier votre adresse de livraison.
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className='flex items-center justify-between pt-4 mt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 lg:-mx-8 px-6 lg:px-8 py-5 rounded-b-2xl'>
                            <span className='text-lg font-bold text-[#111]'>Total</span>
                            <div className='text-right'>
                                <strong className='text-2xl lg:text-3xl text-[#111] font-bold block'>
                                    {total || 0}{currencySymbol}
                                </strong>
                                {parseFloat(total_tax) > 0 && (
                                    <small className='text-gray-500 text-sm'>
                                        (dont <strong>{total_tax || 0}{currencySymbol}</strong> TVA)
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <Link
                        href="/checkout"
                        className='
                            p-4 cursor-pointer bg-[#1D98FF] text-white text-center text-base
                            font-semibold uppercase w-full rounded-xl mt-6 block
                            hover:bg-[#1585e0] active:scale-[0.98]
                            shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                            transition-all duration-200
                            flex items-center justify-center gap-2
                        '
                    >
                        <CreditCard className="w-5 h-5" />
                        Continue to checkout
                    </Link>
                </div>

                {/* Mobile Sticky Cart Summary */}
                <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 animate-slideUp'>
                    <div className='flex items-center justify-between mb-3'>
                        <div>
                            <span className='text-sm text-gray-500'>Total</span>
                            {parseFloat(total_tax) > 0 && (
                                <span className='text-xs text-gray-400 ml-2'>
                                    (TVA: {total_tax}{currencySymbol})
                                </span>
                            )}
                        </div>
                        <span className='text-xl font-bold text-[#111]'>{total || 0}{currencySymbol}</span>
                    </div>
                    <Link
                        href="/checkout"
                        className='
                            w-full py-3 bg-[#1D98FF] text-white font-semibold rounded-xl
                            flex items-center justify-center gap-2
                            shadow-lg shadow-blue-500/25
                            active:scale-[0.98] transition-all duration-200
                        '
                    >
                        <CreditCard className='w-5 h-5' />
                        Checkout
                    </Link>
                </div>
            </div>
            {/* Spacer for mobile sticky */}
            <div className='lg:hidden h-28' />
        </div>
    )
}

export default Cart