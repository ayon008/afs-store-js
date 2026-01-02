'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';

// Create the Cart Context
const CartContext = createContext(null);

// localStorage key
const CART_STORAGE_KEY = 'afs_cart_local';

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sideCartOpen, setSideCartOpen] = useState(false);

    // Open/Close side cart
    const openSideCart = () => setSideCartOpen(true);
    const closeSideCart = () => setSideCartOpen(false);

    // Load cart from localStorage
    const loadCartFromStorage = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(CART_STORAGE_KEY);
                if (stored) {
                    return JSON.parse(stored);
                }
            }
        } catch (err) {
            console.warn('Failed to load cart from localStorage:', err);
        }
        return null;
    }, []);

    // Save cart to localStorage
    const saveCartToStorage = useCallback((cartData) => {
        try {
            if (typeof window !== 'undefined') {
                if (cartData) {
                    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
                } else {
                    localStorage.removeItem(CART_STORAGE_KEY);
                }
            }
        } catch (err) {
            console.warn('Failed to save cart to localStorage:', err);
        }
    }, []);

    // Calculate cart totals from items
    // Note: Prices are already TTC (including tax) from WooCommerce
    const calculateTotals = useCallback((items, currency = 'EUR', coupons = []) => {
        if (!items || items.length === 0) {
            return {
                total_items: 0,
                total_tax: 0,
                total_price: 0,
                total_discount: 0,
                currency_code: currency,
                currency_symbol: currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$',
            };
        }

        let totalItems = 0;
        let totalTax = 0;

        items.forEach(item => {
            // Price is already TTC (including tax)
            const unitPriceTTC = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            const lineSubtotalTTC = unitPriceTTC * quantity;
            
            // Calculate tax from TTC price: tax = TTC * (tax_rate / (1 + tax_rate))
            // For 20% VAT: tax = TTC * (0.20 / 1.20) = TTC * 0.1667
            const taxRate = 0.20; // 20% VAT
            const lineTax = lineSubtotalTTC * (taxRate / (1 + taxRate));
            const lineSubtotalHT = lineSubtotalTTC - lineTax;
            
            totalItems += lineSubtotalHT; // Store HT for subtotal
            totalTax += lineTax;
        });

        // Calculate total discount from coupons (all discounts are stored in cents)
        let totalDiscountCents = 0;
        if (coupons && coupons.length > 0) {
            coupons.forEach(coupon => {
                // Discount is stored in cents in totals.total_discount
                const discount = coupon.totals?.total_discount || 0;
                // If discount seems to be in decimal format (less than 100), convert to cents
                const discountCents = discount < 100 ? Math.round(discount * 100) : discount;
                totalDiscountCents += discountCents;
            });
        }

        // Total TTC before discount (in cents)
        const totalPriceBeforeDiscountCents = Math.round((totalItems + totalTax) * 100);
        // Apply discount (discount is in cents)
        const discountAmountCents = totalDiscountCents;
        const totalPriceCents = Math.max(0, totalPriceBeforeDiscountCents - discountAmountCents); // Ensure total doesn't go negative

        return {
            total_items: Math.round(totalItems * 100), // In cents (HT)
            total_tax: Math.round(totalTax * 100), // In cents
            total_price: totalPriceCents, // In cents (TTC after discount)
            total_discount: discountAmountCents, // In cents
            currency_code: currency,
            currency_symbol: currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$',
        };
    }, []);

    // Format cart data to match WooCommerce format
    const formatCartData = useCallback((localCart) => {
        if (!localCart || !localCart.items || localCart.items.length === 0) {
            return {
                items: [],
                items_count: 0,
                totals: calculateTotals([], localCart?.currency || 'EUR', localCart?.coupons || []),
                coupons: localCart?.coupons || [],
            };
        }

        const formattedItems = localCart.items.map((item, index) => {
            // Price is already TTC (including tax)
            const unitPriceTTC = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            const lineSubtotalTTC = unitPriceTTC * quantity;
            
            // Calculate tax from TTC: tax = TTC * (0.20 / 1.20) = TTC * 0.1667
            const taxRate = 0.20;
            const lineTax = lineSubtotalTTC * (taxRate / (1 + taxRate));
            const lineSubtotalHT = lineSubtotalTTC - lineTax;
            
            return {
                key: item.key || `local_${item.id}_${item.variation_id || 0}_${index}`,
                id: item.id,
                variation_id: item.variation_id || 0,
                name: item.name,
                quantity: item.quantity,
                prices: {
                    price: Math.round(unitPriceTTC * 100), // In cents (TTC)
                    currency_code: localCart.currency || 'EUR',
                    currency_symbol: localCart.currency === 'EUR' ? '€' : localCart.currency === 'GBP' ? '£' : '$',
                },
                totals: {
                    line_subtotal: Math.round(lineSubtotalHT * 100), // HT in cents
                    line_subtotal_tax: Math.round(lineTax * 100), // Tax in cents
                    line_total: Math.round(lineSubtotalTTC * 100), // TTC in cents
                    currency_symbol: localCart.currency === 'EUR' ? '€' : localCart.currency === 'GBP' ? '£' : '$',
                },
                image: item.image,
                variation: item.variation || [],
                stock_status: item.stock_status || 'instock',
                quantity_limits: {
                    minimum: 1,
                    maximum: item.stock_quantity || 99,
                },
            };
        });

        // Get coupons from localStorage
        const coupons = localCart.coupons || [];

        const totals = calculateTotals(localCart.items, localCart.currency || 'EUR', coupons);

        return {
            items: formattedItems,
            items_count: localCart.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
            totals,
            coupons: coupons,
        };
    }, [calculateTotals]);

    // Initialize cart from localStorage
    useEffect(() => {
        const initCart = () => {
            try {
                const currencyCookie = Cookies.get('currency') || 'euro';
                const currency = currencyCookie === 'euro' ? 'EUR' : currencyCookie === 'gbp' ? 'GBP' : 'USD';
                
                const localCart = loadCartFromStorage();
                
                if (localCart) {
                    // Update currency if changed
                    if (localCart.currency !== currency) {
                        localCart.currency = currency;
                        saveCartToStorage(localCart);
                    }
                    
                    const formattedCart = formatCartData(localCart);
                    setCart(formattedCart);
                } else {
                    // Initialize empty cart
                    const emptyCart = formatCartData({ items: [], currency });
                    setCart(emptyCart);
                }
            } catch (err) {
                console.error('Failed to initialize cart:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initCart();
    }, [loadCartFromStorage, saveCartToStorage, formatCartData]);

    // Update cart when currency changes (check every second)
    useEffect(() => {
        const checkCurrency = () => {
            const currencyCookie = Cookies.get('currency') || 'euro';
            const currency = currencyCookie === 'euro' ? 'EUR' : currencyCookie === 'gbp' ? 'GBP' : 'USD';
            
            const localCart = loadCartFromStorage();
            if (localCart && localCart.currency !== currency) {
                localCart.currency = currency;
                saveCartToStorage(localCart);
                const formattedCart = formatCartData(localCart);
                setCart(formattedCart);
            }
        };

        // Check immediately
        checkCurrency();

        // Check every second for currency changes
        const interval = setInterval(checkCurrency, 1000);
        return () => clearInterval(interval);
    }, [loadCartFromStorage, saveCartToStorage, formatCartData]);

    // Add item to cart (localStorage only)
    const handleAddToCart = async (productId, quantity = 1, variationId = null, attributes = {}, productData = null) => {
        try {
            setError(null);
            
            const currencyCookie = Cookies.get('currency') || 'euro';
            const currency = currencyCookie === 'euro' ? 'EUR' : currencyCookie === 'gbp' ? 'GBP' : 'USD';
            
            // Get product data if not provided
            let product = productData;
            if (!product) {
                // Fetch product data from API
                const response = await fetch(`/api/products/${productId}?currency=${currency}`);
                if (response.ok) {
                    const data = await response.json();
                    product = data;
                } else {
                    throw new Error('Failed to fetch product data');
                }
            }

            // Get price
            let price = 0;
            if (variationId && product.variations) {
                const variation = product.variations.find(v => v.id === variationId);
                price = variation?.price_with_tax || variation?.price || 0;
            } else {
                price = product.price_with_tax || product.price || 0;
            }

            // Load current cart
            const localCart = loadCartFromStorage() || { items: [], currency };
            
            // Generate unique key for cart item
            const itemKey = variationId 
                ? `local_${productId}_${variationId}_${JSON.stringify(attributes)}`
                : `local_${productId}_0`;

            // Check if item already exists
            const existingItemIndex = localCart.items.findIndex(item => item.key === itemKey);
            
            if (existingItemIndex >= 0) {
                // Update quantity
                localCart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                localCart.items.push({
                    key: itemKey,
                    id: productId,
                    variation_id: variationId || 0,
                    name: product.name || `Product ${productId}`,
                    quantity: quantity,
                    price: price,
                    image: product.images?.[0]?.src || product.image || '',
                    variation: Array.isArray(attributes) ? attributes : Object.entries(attributes).map(([key, value]) => ({
                        attribute: key.replace('attribute_', ''),
                        value: value
                    })),
                    stock_status: product.stock_status || 'instock',
                    stock_quantity: product.stock_quantity || 99,
                });
            }

            // Save to localStorage
            localCart.currency = currency;
            saveCartToStorage(localCart);

            // Update state
            const formattedCart = formatCartData(localCart);
            setCart(formattedCart);

            // Open side cart
            openSideCart();

            return { success: true, data: formattedCart };
        } catch (err) {
            setError(err.message);
            console.error('Add to cart error:', err);
            return { success: false, error: err.message };
        }
    };

    // Update cart item quantity (localStorage only)
    const handleUpdateCartItem = async (itemKey, quantity) => {
        try {
            setError(null);
            
            const localCart = loadCartFromStorage();
            if (!localCart || !localCart.items) {
                throw new Error('Cart not found');
            }

            const itemIndex = localCart.items.findIndex(item => item.key === itemKey);
            if (itemIndex < 0) {
                throw new Error('Item not found in cart');
            }

            // Update quantity or remove item
            if (quantity <= 0) {
                // Remove item
                localCart.items.splice(itemIndex, 1);
            } else {
                // Update quantity
                localCart.items[itemIndex].quantity = quantity;
            }

            // Save to localStorage
            saveCartToStorage(localCart);

            // Update state
            const formattedCart = formatCartData(localCart);
            setCart(formattedCart);

            return { success: true, data: formattedCart };
        } catch (err) {
            setError(err.message);
            console.error('Update cart error:', err);
            return { success: false, error: err.message };
        }
    };

    // Remove item from cart (localStorage only)
    const handleRemoveCartItem = async (itemKey) => {
        try {
            setError(null);
            
            const localCart = loadCartFromStorage();
            if (!localCart || !localCart.items) {
                throw new Error('Cart not found');
            }

            const itemIndex = localCart.items.findIndex(item => item.key === itemKey);
            if (itemIndex < 0) {
                throw new Error('Item not found in cart');
            }

            // Remove item
            localCart.items.splice(itemIndex, 1);

            // Save to localStorage
            saveCartToStorage(localCart);

            // Update state
            const formattedCart = formatCartData(localCart);
            setCart(formattedCart);

            return { success: true, data: formattedCart };
        } catch (err) {
            setError(err.message);
            console.error('Remove cart error:', err);
            return { success: false, error: err.message };
        }
    };

    // Clear entire cart (localStorage only)
    const handleClearCart = async () => {
        try {
            setError(null);
            
            // Clear localStorage
            saveCartToStorage(null);

            // Update state
            const emptyCart = formatCartData({ items: [], currency: Cookies.get('currency') === 'euro' ? 'EUR' : Cookies.get('currency') === 'gbp' ? 'GBP' : 'USD' });
            setCart(emptyCart);

            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Clear cart error:', err);
            return { success: false, error: err.message };
        }
    };

    // Sync cart with WooCommerce (for checkout)
    const syncCartToWooCommerce = async () => {
        try {
            setLoading(true);
            setError(null);

            const localCart = loadCartFromStorage();
            if (!localCart || !localCart.items || localCart.items.length === 0) {
                throw new Error('Cart is empty');
            }

            const currencyCookie = Cookies.get('currency') || 'euro';
            const currency = currencyCookie === 'euro' ? 'EUR' : currencyCookie === 'gbp' ? 'GBP' : 'USD';

            // Clear WooCommerce cart first
            await fetch(`/api/cart/clear?currency=${currency}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            // Add all items to WooCommerce cart
            for (const item of localCart.items) {
                await fetch('/api/cart/add-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        id: item.id,
                        quantity: item.quantity,
                        variation_id: item.variation_id || null,
                        variation: item.variation || [],
                        currency: currency,
                    }),
                });
            }

            // Apply coupons from localStorage to WooCommerce cart
            if (localCart.coupons && localCart.coupons.length > 0) {
                for (const coupon of localCart.coupons) {
                    try {
                        await fetch('/api/cart/apply-coupon', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ code: coupon.code }),
                        });
                    } catch (couponError) {
                        console.warn(`Failed to apply coupon ${coupon.code} during sync:`, couponError);
                        // Continue even if coupon application fails
                    }
                }
            }

            // Load cart from WooCommerce to get final totals
            const response = await fetch(`/api/cart?currency=${currency}`, {
                method: 'GET',
                credentials: 'include',
            });
            const wooCart = await response.json();

            // Update local cart with WooCommerce totals
            const updatedLocalCart = {
                ...localCart,
                wooCommerceCart: wooCart, // Store WooCommerce cart for checkout
            };
            saveCartToStorage(updatedLocalCart);

            return { success: true, cart: wooCart };
        } catch (err) {
            setError(err.message);
            console.error('Sync cart error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Load cart (for compatibility - returns local cart)
    const loadCart = async () => {
        const localCart = loadCartFromStorage();
        const formattedCart = formatCartData(localCart || { items: [], currency: Cookies.get('currency') === 'euro' ? 'EUR' : Cookies.get('currency') === 'gbp' ? 'GBP' : 'USD' });
        setCart(formattedCart);
        return formattedCart;
    };

    // Apply coupon (localStorage + validate with WooCommerce)
    const handleApplyCoupon = async (couponCode) => {
        try {
            setError(null);
            
            if (!couponCode || couponCode.trim() === '') {
                return { success: false, error: 'Veuillez entrer un code promo' };
            }

            // Validate coupon with WooCommerce API
            const response = await fetch('/api/cart/apply-coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ code: couponCode.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.error || 'Code promo invalide' };
            }

            const result = await response.json();

            if (result.success && result.data) {
                // WooCommerce returns the full cart with coupons
                const wooCartData = result.data;
                
                // Load current cart
                const localCart = loadCartFromStorage() || { items: [], currency: Cookies.get('currency') === 'euro' ? 'EUR' : Cookies.get('currency') === 'gbp' ? 'GBP' : 'USD', coupons: [] };
                
                // Extract coupons from WooCommerce response
                const wooCoupons = wooCartData.coupons || [];
                
                // Check if coupon already exists in localStorage
                const existingCouponIndex = localCart.coupons?.findIndex(c => 
                    c.code?.toUpperCase() === couponCode.trim().toUpperCase()
                );
                
                if (existingCouponIndex >= 0) {
                    return { success: false, error: 'Ce code promo est déjà appliqué' };
                }

                // Find the coupon that was just applied
                const appliedCoupon = wooCoupons.find(c => 
                    c.code?.toUpperCase() === couponCode.trim().toUpperCase()
                );

                if (!appliedCoupon && wooCoupons.length === 0) {
                    return { success: false, error: 'Code promo invalide ou expiré' };
                }

                // Add coupon to localStorage
                if (!localCart.coupons) {
                    localCart.coupons = [];
                }

                // Calculate discount from WooCommerce totals
                // WooCommerce returns total_discount in the cart totals (in cents)
                const wooTotalDiscount = wooCartData.totals?.total_discount || 0;
                
                // Calculate previous total discount from localStorage coupons
                const previousTotalDiscount = localCart.coupons.reduce((sum, c) => {
                    const discount = c.totals?.total_discount || 0;
                    // If discount is already in cents, use it directly, otherwise convert
                    return sum + (discount > 1000 ? discount / 100 : discount);
                }, 0) * 100; // Convert to cents

                // New discount is the difference
                const newDiscount = Math.max(0, wooTotalDiscount - previousTotalDiscount);

                // Extract coupon info
                const couponInfo = {
                    code: couponCode.trim().toUpperCase(),
                    discount: appliedCoupon?.discount_amount || appliedCoupon?.amount || 0,
                    discount_type: appliedCoupon?.discount_type || 'fixed_cart',
                    totals: {
                        total_discount: newDiscount, // In cents
                    }
                };

                localCart.coupons.push(couponInfo);

                // Save to localStorage
                saveCartToStorage(localCart);

                // Update state
                const formattedCart = formatCartData(localCart);
                setCart(formattedCart);

                return { success: true, data: formattedCart };
            } else {
                return { success: false, error: result.error || 'Code promo invalide' };
            }
        } catch (err) {
            setError(err.message);
            console.error('Apply coupon error:', err);
            return { success: false, error: err.message || 'Erreur lors de l\'application du code promo' };
        }
    };

    // Remove coupon (localStorage + remove from WooCommerce)
    const handleRemoveCoupon = async (couponCode) => {
        try {
            setError(null);
            
            if (!couponCode || couponCode.trim() === '') {
                return { success: false, error: 'Code promo invalide' };
            }

            // Remove coupon from WooCommerce (optional, for consistency)
            try {
                await fetch('/api/cart/remove-coupon', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ code: couponCode.trim() }),
                });
            } catch (apiError) {
                // Continue even if API call fails, we'll still remove from localStorage
                console.warn('Failed to remove coupon from WooCommerce:', apiError);
            }

            // Load current cart
            const localCart = loadCartFromStorage();
            if (!localCart || !localCart.coupons) {
                return { success: false, error: 'Aucun code promo trouvé' };
            }

            // Remove coupon from localStorage
            const couponIndex = localCart.coupons.findIndex(c => c.code === couponCode.trim().toUpperCase());
            
            if (couponIndex < 0) {
                return { success: false, error: 'Code promo non trouvé' };
            }

            localCart.coupons.splice(couponIndex, 1);

            // Save to localStorage
            saveCartToStorage(localCart);

            // Update state
            const formattedCart = formatCartData(localCart);
            setCart(formattedCart);

            return { success: true, data: formattedCart };
        } catch (err) {
            setError(err.message);
            console.error('Remove coupon error:', err);
            return { success: false, error: err.message || 'Erreur lors de la suppression du code promo' };
        }
    };

    // Get applied coupons
    const getAppliedCoupons = () => {
        return cart?.coupons || [];
    };

    // Get discount total
    const getDiscountTotal = () => {
        if (!cart || !cart.totals || !cart.totals.total_discount) return '0.00';
        return (cart.totals.total_discount / 100).toFixed(2);
    };

    // Get total price (after discount)
    const getTotalPrice = () => {
        if (!cart || !cart.totals) return '0.00';
        // total_price already includes discount in calculateTotals
        return (cart.totals.total_price / 100).toFixed(2);
    };

    // Get subtotal
    const getSubtotal = () => {
        if (!cart || !cart.totals) return '0.00';
        return (cart.totals.total_items / 100).toFixed(2);
    };

    // Get total tax/VAT
    const getTotalTax = () => {
        if (!cart || !cart.totals) return '0.00';
        return (cart.totals.total_tax / 100).toFixed(2);
    };

    // Get currency symbol
    const getCurrencySymbol = () => {
        return cart?.totals?.currency_symbol || '€';
    };

    // Get shipping total
    const getShippingTotal = () => {
        return '0.00'; // Shipping calculated at checkout
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
            const matchesVariation = variationId ? item.variation_id === variationId : true;
            return matchesProduct && matchesVariation;
        });
    };

    // Get item quantity in cart
    const getItemQuantity = (productId, variationId = null) => {
        if (!cart || !cart.items) return 0;
        const item = cart.items.find(item => {
            const matchesProduct = item.id === productId;
            const matchesVariation = variationId ? item.variation_id === variationId : true;
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
        handleAddToCart,
        handleUpdateCartItem,
        handleRemoveCartItem,
        handleClearCart,
        handleApplyCoupon,
        handleRemoveCoupon,
        loadCart,
        syncCartToWooCommerce, // New function to sync before checkout
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
