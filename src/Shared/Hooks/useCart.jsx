'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// import {
//     getCart as getCartAction, addToCart as addToCartAction, updateCartItem,
//     removeCartItem,
//     clearCart,
//     applyCoupon,
//     removeCoupon
// } from '../../app/actions/Woo-Coommerce/getWooCommerce';
// import { getUserTaxRate } from '../funtions/getWooCommerce';

import {
    addToCart as addToCartAction, updateCartItem, removeCartItem, clearCart, applyCoupon, removeCoupon
} from "../../app/actions/Woo-Coommerce/getWooCommerce"

import { getCart as getCartAction, } from '@/app/actions/Woo-Coommerce/Shop/Cart/cart';

// Create the Cart Context
const CartContext = createContext(null);

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sideCartOpen, setSideCartOpen] = useState(false);
    // const [taxInfo, setTaxInfo] = useState({ rate: 20, country: 'FR' }); // Default France 20%

    // Open/Close side cart
    const openSideCart = () => setSideCartOpen(true);
    const closeSideCart = () => setSideCartOpen(false);


    useEffect(() => {
        const load = async () => {
            try {
                // Use API route instead of Server Action for better cookie synchronization
                const data = await getCartAction();
                console.log(data, 'data');
                // const data = await response.json();
                setCart(data.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                console.error('Failed to load cart:', err);
                setLoading(false);
            }
        }
        load();
    }, []);


    // // Load tax rate based on user country
    // const loadTaxRate = async () => {
    //     try {
    //         const taxData = await getUserTaxRate();
    //         setTaxInfo(taxData);
    //     } catch (err) {
    //         console.error('Error loading tax rate:', err);
    //         // Keep default France rate
    //     }
    // };

    // Load cart data
    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use API route instead of Server Action for better cookie synchronization
            const response = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'include', // Important: include cookies
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`Failed to load cart: ${response.status}`);
            }

            const data = await response.json();
            console.log(data, 'resultFromLoadCart');
            setCart(data);
        } catch (err) {
            setError(err.message);
            console.error('Cart loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial cart and tax rate load
    // useEffect(() => {
    //     loadCart();
    //     loadTaxRate();
    // }, []);

    // Add item to cart
    const handleAddToCart = async (productId, quantity = 1, variationId = null, attributes = {}) => {
        try {
            setLoading(true);
            setError(null);
            const result = await addToCartAction(productId, quantity, variationId, attributes);

            if (result.success) {
                // Small delay to ensure cookies are synchronized
                await new Promise(resolve => setTimeout(resolve, 100));

                // Update items_count immediately for better UX
                setCart(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        items_count: (prev.items_count || 0) + quantity
                    };
                });

                // Then refresh full cart data (now getCart() calls WooCommerce directly with synced cookies)
                await loadCart();

                // Open side cart on successful add
                openSideCart();
            } else {
                setError(result.error);
                console.error('Add to cart error:', result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            console.error('Add to cart error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update cart item quantity
    const handleUpdateCartItem = async (itemKey, quantity) => {
        try {
            setError(null);
            const result = await updateCartItem(itemKey, quantity);

            if (result.success) {
                // Small delay to ensure cookies are synchronized
                await new Promise(resolve => setTimeout(resolve, 100));

                // Update local cart state immediately for better UX
                setCart(prev => {
                    if (!prev || !prev.items) return prev;

                    return {
                        ...prev,
                        items: prev.items.map(item =>
                            item.key === itemKey
                                ? { ...item, quantity: quantity }
                                : item
                        )
                    };
                });

                // Then refresh full cart data (now getCart() calls WooCommerce directly with synced cookies)
                await loadCart();
            } else {
                setError(result.error);
                console.error('Update cart error:', result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            console.error('Update cart error:', err);
            return { success: false, error: err.message };
        }
    };

    // Remove item from cart
    const handleRemoveCartItem = async (itemKey) => {
        try {
            setError(null);
            const result = await removeCartItem(itemKey);

            if (result.success) {
                // Small delay to ensure cookies are synchronized
                await new Promise(resolve => setTimeout(resolve, 100));

                // Update local cart state immediately
                setCart(prev => {
                    if (!prev || !prev.items) return prev;

                    const removedItem = prev.items.find(item => item.key === itemKey);
                    const removedQty = removedItem?.quantity || 1;

                    return {
                        ...prev,
                        items: prev.items.filter(item => item.key !== itemKey),
                        items_count: (prev.items_count || 0) - removedQty
                    };
                });

                // Then refresh full cart data (now getCart() calls WooCommerce directly with synced cookies)
                await loadCart();
            } else {
                setError(result.error);
                console.error('Remove from cart error:', result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            console.error('Remove from cart error:', err);
            return { success: false, error: err.message };
        }
    };

    // Clear entire cart
    const handleClearCart = async () => {
        try {
            const result = await clearCart();

            if (result.success) {
                setCart(null);
            }

            return result;
        } catch (err) {
            console.error('Clear cart error:', err);
            return { success: false, error: err.message };
        }
    };

    // Apply coupon code
    const handleApplyCoupon = async (couponCode) => {
        try {
            setError(null);
            setLoading(true);
            const result = await applyCoupon(couponCode);

            if (result.success) {
                // Small delay to ensure cookies are synchronized
                await new Promise(resolve => setTimeout(resolve, 100));

                // Then refresh full cart data (now getCart() calls WooCommerce directly with synced cookies)
                await loadCart();
            } else {
                setError(result.error);
                console.error('Apply coupon error:', result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            console.error('Apply coupon error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Remove coupon code
    const handleRemoveCoupon = async (couponCode) => {
        try {
            setError(null);
            setLoading(true);
            const result = await removeCoupon(couponCode);

            if (result.success) {
                // Small delay to ensure cookies are synchronized
                await new Promise(resolve => setTimeout(resolve, 100));

                // Then refresh full cart data (now getCart() calls WooCommerce directly with synced cookies)
                await loadCart();
            } else {
                setError(result.error);
                console.error('Remove coupon error:', result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            console.error('Remove coupon error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Get applied coupons
    const getAppliedCoupons = () => {
        return cart?.coupons || [];
    };

    // Get discount total
    const getDiscountTotal = () => {
        if (!cart || !cart.totals || !cart.totals.total_discount) return 0;
        return (cart.totals.total_discount / 100).toFixed(2);
    };

    // Get total price
    const getTotalPrice = () => {
        if (!cart || !cart.items) return '0.00';

        // Calculate total with tax from cart items
        let totalWithTax = 0;
        cart.items.forEach(item => {
            const unitPrice = parseFloat(item.prices?.price) / 100 || 0;
            totalWithTax += unitPrice * item.quantity;
        });

        // Add shipping
        const shipping = (cart.totals?.total_shipping || 0) / 100;
        totalWithTax += shipping;

        // Subtract discount
        const discount = (cart.totals?.total_discount || 0) / 100;
        totalWithTax -= discount;

        return totalWithTax.toFixed(2);
    };

    // Get subtotal (items total with tax)
    const getSubtotal = () => {
        if (!cart || !cart.items) return '0.00';
        // Calculate subtotal with tax from cart items
        let subtotalWithTax = 0;
        cart.items.forEach(item => {
            const unitTotalPrice = parseFloat(item?.totals?.line_subtotal) / 100 || 0;
            // Price + Tax = Price * (1 + rate/100)
            subtotalWithTax += unitTotalPrice * (1 + taxInfo.rate / 100);
        });

        return subtotalWithTax.toFixed(2);
    };

    // Get total tax/VAT
    const getTotalTax = () => {
        if (!cart || !cart.items) return '0.00';
        let totalTax = 0;
        cart.items.forEach(item => {
            const unitTotalPrice = parseFloat(item?.totals?.line_subtotal) / 100 || 0;
            // TVA = Prix HT * (taux / 100)
            totalTax += unitTotalPrice * (taxInfo.rate / 100);
        });

        return totalTax.toFixed(2);
    };

    // Get currency symbol
    const getCurrencySymbol = () => {
        return cart?.totals?.currency_symbol || '€';
    };

    // Get shipping total
    const getShippingTotal = () => {
        if (!cart || !cart.totals || !cart.totals.total_shipping) return 0;
        return (cart.totals.total_shipping / 100).toFixed(2);
    };

    // Get item count
    const getItemCount = () => {
        return cart?.items_count || 0;
    };

    // Check if item is in cart
    const isInCart = (productId, variationId = null) => {
        if (!cart || !cart.items) return false;

        return cart.items.some(item => {
            const matchesProduct = item.id === productId;
            const matchesVariation = variationId
                ? item.variation_id === variationId
                : true;

            return matchesProduct && matchesVariation;
        });
    };

    // Get item quantity in cart
    const getItemQuantity = (productId, variationId = null) => {
        if (!cart || !cart.items) return 0;

        const item = cart.items.find(item => {
            const matchesProduct = item.id === productId;
            const matchesVariation = variationId
                ? item.variation_id === variationId
                : true;

            return matchesProduct && matchesVariation;
        });

        return item ? item.quantity : 0;
    };

    const value = {
        cart,
        setCart,
        loading,
        error,
        sideCartOpen,
        openSideCart,
        closeSideCart,
        // taxInfo,
        // loadTaxRate,
        handleAddToCart,
        handleUpdateCartItem,
        handleRemoveCartItem,
        handleClearCart,
        handleApplyCoupon,
        handleRemoveCoupon,
        loadCart,
        getTotalPrice,
        getSubtotal,
        getTotalTax,
        getCurrencySymbol,
        getShippingTotal,
        getItemCount,
        isInCart,
        getItemQuantity,
        getAppliedCoupons,
        getDiscountTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Hook to use the cart context
const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default useCart;
