'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';

import {
    updateCartItem, removeCartItem, clearCart, applyCoupon, removeCoupon
} from "../../app/actions/Woo-Coommerce/getWooCommerce"

import { getCart as getCartAction, } from '@/app/actions/Woo-Coommerce/Shop/Cart/cart';

// LocalStorage key
const CART_STORAGE_KEY = 'afs_cart';

// Helper functions for localStorage
const getLocalStorageCart = () => {
    if (typeof window === 'undefined') return null;
    try {
        const cartData = localStorage.getItem(CART_STORAGE_KEY);
        return cartData ? JSON.parse(cartData) : null;
    } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        return null;
    }
};

const saveLocalStorageCart = (cart) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
};

const clearLocalStorageCart = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing cart from localStorage:', error);
    }
};

// Get current metadata from cookies
const getCurrentMetadata = (locale) => {
    const currency = Cookies.get('currency') || 'euro';
    const location = Cookies.get('location') || '2682';
    
    // Convert currency to format used in cart
    let currencyCode = 'EUR';
    if (currency === 'usd') currencyCode = 'USD';
    else if (currency === 'gbp') currencyCode = 'GBP';
    
    return {
        locale: locale || 'fr',
        currency: currencyCode,
        location: location
    };
};

// Validate cart metadata against current cookies
const validateCartMetadata = (cart, currentMetadata) => {
    if (!cart || !cart.metadata) return false;
    
    return (
        cart.metadata.locale === currentMetadata.locale &&
        cart.metadata.currency === currentMetadata.currency &&
        cart.metadata.location === currentMetadata.location
    );
};

// Merge localStorage cart with WooCommerce cart data (coupons and discounts)
// This allows us to keep localStorage items but show coupons applied in WooCommerce
const mergeCartWithCoupons = (localCartDisplay, wooCommerceCart) => {
    if (!localCartDisplay) return null;
    if (!wooCommerceCart) return localCartDisplay;

    // Get discount from WooCommerce (in cents)
    const discount = wooCommerceCart.totals?.total_discount || 0;
    
    // Get coupons from WooCommerce
    const coupons = wooCommerceCart.coupons || [];

    // Calculate new total price with discount applied
    const originalTotalPrice = localCartDisplay.totals?.total_price || 0;
    const newTotalPrice = Math.max(0, originalTotalPrice - discount);

    return {
        ...localCartDisplay,
        coupons: coupons,
        totals: {
            ...localCartDisplay.totals,
            total_discount: discount,
            total_price: newTotalPrice
        }
    };
};

// Convert localStorage cart to WooCommerce format for display
const convertLocalStorageCartToDisplay = (localCart) => {
    if (!localCart || !localCart.items || localCart.items.length === 0) {
        return null;
    }
    
    // Get currency symbol from cart metadata (site currency)
    const currencySymbol = localCart.metadata.currency === 'USD' ? '$' : 
                          localCart.metadata.currency === 'GBP' ? '£' : '€';
    
    // Calculate totals
    let items_count = 0;
    let subtotal = 0;
    
    const items = localCart.items.map((item, index) => {
        const quantity = item.quantity || 1;
        items_count += quantity;
        
        const price = item.productData?.price_with_tax || item.productData?.price || 0;
        const lineSubtotal = price * quantity;
        subtotal += lineSubtotal;
        
        // Convert variation object to array format for display
        // From: { "Taille": "3.0m2", "Color": "Blue" }
        // To: [{ attribute: "Taille", value: "3.0m2" }, { attribute: "Color", value: "Blue" }]
        let variationArray = [];
        let variationRaw = null;

        if (item.variation && typeof item.variation === 'object' && !Array.isArray(item.variation) && Object.keys(item.variation).length > 0) {
            // item.variation is object format - convert to array for display
            variationArray = Object.entries(item.variation).map(([attr, value]) => ({
                attribute: attr,
                value: String(value)
            }));
            variationRaw = item.variation; // Keep as-is for API calls
        } else if (Array.isArray(item.variation) && item.variation.length > 0) {
            // item.variation is already array format
            variationArray = item.variation;
            // Convert array back to object for API calls
            variationRaw = item.variation.reduce((acc, v) => {
                if (v.attribute && v.value) {
                    acc[v.attribute] = v.value;
                }
                return acc;
            }, {});
        }

        // If we still don't have variation data but have variation_id, try to get from productData
        if ((!variationRaw || Object.keys(variationRaw).length === 0) && item.variation_id && item.productData?.variations) {
            const matchedVariation = item.productData.variations.find(v => v.id === item.variation_id);
            if (matchedVariation?.attributes && Array.isArray(matchedVariation.attributes)) {
                // Use slug for API calls (WooCommerce Store API expects "pa_taille" not "Taille")
                variationRaw = matchedVariation.attributes.reduce((acc, attr) => {
                    // Prefer slug over name for API compatibility
                    const attrKey = attr.slug || attr.name || attr.attribute || '';
                    const attrValue = attr.option || attr.value || '';
                    if (attrKey && attrValue) {
                        acc[attrKey] = attrValue;
                    }
                    return acc;
                }, {});
                // For display, use the display name; for API calls in attribute field, use slug
                variationArray = matchedVariation.attributes.map(attr => ({
                    attribute: attr.slug || attr.name || attr.attribute || '', // Use slug for API
                    displayName: attr.name || attr.attribute || '',             // Keep display name for UI
                    value: attr.option || attr.value || ''
                })).filter(v => v.attribute && v.value);
            }
        }

        return {
            id: item.id,
            name: item.productData?.name || '',
            quantity: quantity,
            variation_id: item.variation_id || null,
            variation: variationArray, // Array format for display components
            _variationRaw: variationRaw, // Object format for API calls (null if no variations)
            prices: {
                price: Math.round(price * 100), // Convert to cents
                regular_price: Math.round(price * 100),
                currency_symbol: currencySymbol, // Use cart currency, not product currency
            },
            totals: {
                line_subtotal: Math.round(lineSubtotal * 100),
                line_total: Math.round(lineSubtotal * 100),
                currency_symbol: currencySymbol, // Use cart currency, not product currency
            },
            images: item.productData?.images || [],
            image: item.productData?.image || null,
            key: `local_${item.id}_${item.variation_id || 'simple'}_${index}`,
            productData: item.productData
        };
    });
    
    return {
        items: items,
        items_count: items_count,
        totals: {
            total_items: Math.round(subtotal * 100),
            total_items_tax: 0,
            total_fees: 0,
            total_tax: 0,
            total_price: Math.round(subtotal * 100),
            total_shipping: 0,
            total_discount: 0,
            currency_symbol: currencySymbol,
            currency_code: localCart.metadata.currency
        },
        coupons: [],
        shipping_address: null,
        billing_address: null,
        needs_payment: true,
        needs_shipping: true,
        metadata: localCart.metadata, // Include cart metadata (locale, currency, location)
        _localStorage: true // Flag to indicate this is from localStorage
    };
};

// Create the Cart Context
const CartContext = createContext(null);

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sideCartOpen, setSideCartOpen] = useState(false);
    const locale = useLocale();

    // Open/Close side cart
    const openSideCart = () => setSideCartOpen(true);
    const closeSideCart = () => setSideCartOpen(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const load = () => {
            try {
                const currentMetadata = getCurrentMetadata(locale);
                const localCart = getLocalStorageCart();
                
                // Validate metadata
                if (localCart && validateCartMetadata(localCart, currentMetadata)) {
                    const displayCart = convertLocalStorageCartToDisplay(localCart);
                    setCart(displayCart);
                } else {
                    // Clear invalid cart
                    if (localCart) {
                        clearLocalStorageCart();
                    }
                    setCart(null);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                console.error('Failed to load cart:', err);
                setLoading(false);
            }
        };
        load();
    }, [locale]);


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

    // Load cart data from localStorage
    const loadCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const currentMetadata = getCurrentMetadata(locale);
            const localCart = getLocalStorageCart();
            
            // Validate metadata
            if (localCart && validateCartMetadata(localCart, currentMetadata)) {
                const displayCart = convertLocalStorageCartToDisplay(localCart);
                setCart(displayCart);
            } else {
                // Clear invalid cart
                if (localCart) {
                    clearLocalStorageCart();
                }
                setCart(null);
            }
        } catch (err) {
            setError(err.message);
            console.error('Cart loading error:', err);
        } finally {
            setLoading(false);
        }
    }, [locale]);

    // Sync cart to WooCommerce API (called at checkout)
    const syncCartToAPI = useCallback(async (country) => {
        try {
            setLoading(true);
            setError(null);

            const currentMetadata = getCurrentMetadata(locale);
            const localCart = getLocalStorageCart();
            
            if (!localCart || !localCart.items || localCart.items.length === 0) {
                return { success: false, error: 'Cart is empty' };
            }

            // Validate metadata before sync
            if (!validateCartMetadata(localCart, currentMetadata)) {
                return { success: false, error: 'Cart metadata mismatch' };
            }

            // Clear existing WooCommerce cart first
            await clearCart();

            // Add each item to WooCommerce cart
            // Use the cart's currency (site currency), not individual product currencies
            const cartCurrency = localCart.metadata.currency || localCart.currency;
            
            for (const item of localCart.items) {
                const response = await fetch('/api/cart/add-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        id: item.id,
                        quantity: item.quantity || 1,
                        variation_id: item.variation_id || null,
                        variation: item.variation || {},
                        currency: cartCurrency, // Use cart currency (site currency)
                        location: currentMetadata.location // Required by Multi-Locations-Inventory-Management plugin
                    }),
                    cache: 'no-store',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to sync item' }));
                    throw new Error(errorData.error || `Failed to sync item: ${response.status}`);
                }
            }

            // Update billing address with country for shipping calculation
            if (country) {
                await fetch('/api/cart/update-billing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        billing_address: {
                            country: country
                        }
                    }),
                    cache: 'no-store',
                }).catch(err => console.error('Error updating billing address:', err));
            }

            // Load cart from API to get updated data
            const response = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`Failed to load cart: ${response.status}`);
            }

            const apiCart = await response.json();
            setCart(apiCart);

            return { success: true, data: apiCart };
        } catch (err) {
            setError(err.message);
            console.error('Cart sync error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [locale]);

    // Initial cart and tax rate load
    // useEffect(() => {
    //     loadCart();
    //     loadTaxRate();
    // }, []);

    // Add item to cart (localStorage only)
    const handleAddToCart = useCallback(async (productId, quantity = 1, variationId = null, attributes = {}, productData = null) => {
        try {
            setLoading(true);
            setError(null);

            // Always use the current site currency (from cookie), not the product currency
            // This ensures all products in the cart are in the same currency as the site
            const currentMetadata = getCurrentMetadata(locale);
            
            // Get existing cart or create new one
            let localCart = getLocalStorageCart();
            
            // Validate existing cart metadata against current site currency
            if (localCart && !validateCartMetadata(localCart, currentMetadata)) {
                // If cart exists with different currency, update to current site currency
                if (localCart.metadata.currency !== currentMetadata.currency) {
                    // Update cart currency to match current site currency
                    localCart.currency = currentMetadata.currency;
                    localCart.metadata.currency = currentMetadata.currency;
                } else {
                    // Clear invalid cart for other metadata mismatches
                    localCart = null;
                    clearLocalStorageCart();
                }
            }

            // Initialize cart if needed
            if (!localCart) {
                localCart = {
                    locale: currentMetadata.locale,
                    currency: currentMetadata.currency,
                    location: currentMetadata.location,
                    items: [],
                    metadata: {
                        ...currentMetadata,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                };
            }

            // Check if item already exists
            const existingItemIndex = localCart.items.findIndex(item => 
                item.id === productId && 
                (item.variation_id || null) === (variationId || null) &&
                JSON.stringify(item.variation || {}) === JSON.stringify(attributes || {})
            );

            if (existingItemIndex >= 0) {
                // Update quantity
                localCart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                localCart.items.push({
                    id: productId,
                    variation_id: variationId || null,
                    quantity: quantity,
                    variation: attributes || {},
                    productData: productData || {}
                });
            }

            // Update metadata
            localCart.metadata.updated_at = new Date().toISOString();

            // Save to localStorage
            saveLocalStorageCart(localCart);

            // Update state
            const displayCart = convertLocalStorageCartToDisplay(localCart);
            setCart(displayCart);

            // Open side cart on successful add
            openSideCart();

            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Add to cart error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [locale]);

    // Update cart item quantity (localStorage)
    const handleUpdateCartItem = useCallback(async (itemKey, quantity) => {
        try {
            setError(null);
            
            const currentMetadata = getCurrentMetadata(locale);
            const localCart = getLocalStorageCart();
            
            if (!localCart || !validateCartMetadata(localCart, currentMetadata)) {
                return { success: false, error: 'Cart not found or invalid' };
            }

            // Extract index from itemKey (format: local_productId_variationId_index)
            const keyParts = itemKey.split('_');
            if (keyParts.length < 4 || keyParts[0] !== 'local') {
                return { success: false, error: 'Invalid item key' };
            }

            const itemIndex = parseInt(keyParts[3], 10);
            if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= localCart.items.length) {
                return { success: false, error: 'Item not found' };
            }

            // Update quantity
            if (quantity <= 0) {
                localCart.items.splice(itemIndex, 1);
            } else {
                localCart.items[itemIndex].quantity = quantity;
            }

            // Update metadata
            localCart.metadata.updated_at = new Date().toISOString();

            // Save to localStorage
            saveLocalStorageCart(localCart);

            // Update state
            const displayCart = convertLocalStorageCartToDisplay(localCart);
            setCart(displayCart);

            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Update cart error:', err);
            return { success: false, error: err.message };
        }
    }, [locale]);

    // Remove item from cart (localStorage)
    const handleRemoveCartItem = useCallback(async (itemKey) => {
        try {
            setError(null);
            
            const currentMetadata = getCurrentMetadata(locale);
            const localCart = getLocalStorageCart();
            
            if (!localCart || !validateCartMetadata(localCart, currentMetadata)) {
                return { success: false, error: 'Cart not found or invalid' };
            }

            // Extract index from itemKey (format: local_productId_variationId_index)
            const keyParts = itemKey.split('_');
            if (keyParts.length < 4 || keyParts[0] !== 'local') {
                return { success: false, error: 'Invalid item key' };
            }

            const itemIndex = parseInt(keyParts[3], 10);
            if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= localCart.items.length) {
                return { success: false, error: 'Item not found' };
            }

            // Remove item
            localCart.items.splice(itemIndex, 1);

            // Update metadata
            localCart.metadata.updated_at = new Date().toISOString();

            // Save to localStorage
            if (localCart.items.length === 0) {
                clearLocalStorageCart();
                setCart(null);
            } else {
                saveLocalStorageCart(localCart);
                const displayCart = convertLocalStorageCartToDisplay(localCart);
                setCart(displayCart);
            }

            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Remove from cart error:', err);
            return { success: false, error: err.message };
        }
    }, [locale]);

    // Clear entire cart (localStorage)
    const handleClearCart = useCallback(async () => {
        try {
            clearLocalStorageCart();
            setCart(null);
            return { success: true };
        } catch (err) {
            console.error('Clear cart error:', err);
            return { success: false, error: err.message };
        }
    }, []);

    // Apply coupon code
    const handleApplyCoupon = async (couponCode) => {
        try {
            setError(null);
            setLoading(true);
            const result = await applyCoupon(couponCode);

            if (result.success) {
                // Small delay to ensure cookies are synchronized
                await new Promise(resolve => setTimeout(resolve, 100));

                // Load cart from localStorage first
                await loadCart();

                // Then fetch cart from WooCommerce to get coupons and discount
                try {
                    const response = await fetch('/api/cart', {
                        method: 'GET',
                        credentials: 'include',
                        cache: 'no-store',
                    });

                    if (response.ok) {
                        const wooCommerceCart = await response.json();
                        
                        // Get current cart state (from localStorage)
                        const currentMetadata = getCurrentMetadata(locale);
                        const localCart = getLocalStorageCart();
                        
                        if (localCart && validateCartMetadata(localCart, currentMetadata)) {
                            const localCartDisplay = convertLocalStorageCartToDisplay(localCart);
                            
                            // Merge with WooCommerce cart data (coupons and discount)
                            const mergedCart = mergeCartWithCoupons(localCartDisplay, wooCommerceCart);
                            
                            if (mergedCart) {
                                setCart(mergedCart);
                            }
                        }
                    }
                } catch (fetchError) {
                    console.warn('Failed to fetch cart from WooCommerce for coupons:', fetchError);
                    // Continue with localStorage cart if fetch fails
                }
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

                // Load cart from localStorage first
                await loadCart();

                // Then fetch cart from WooCommerce to get updated coupons and discount
                try {
                    const response = await fetch('/api/cart', {
                        method: 'GET',
                        credentials: 'include',
                        cache: 'no-store',
                    });

                    if (response.ok) {
                        const wooCommerceCart = await response.json();
                        
                        // Get current cart state (from localStorage)
                        const currentMetadata = getCurrentMetadata(locale);
                        const localCart = getLocalStorageCart();
                        
                        if (localCart && validateCartMetadata(localCart, currentMetadata)) {
                            const localCartDisplay = convertLocalStorageCartToDisplay(localCart);
                            
                            // Merge with WooCommerce cart data (coupons and discount)
                            const mergedCart = mergeCartWithCoupons(localCartDisplay, wooCommerceCart);
                            
                            if (mergedCart) {
                                setCart(mergedCart);
                            }
                        }
                    }
                } catch (fetchError) {
                    console.warn('Failed to fetch cart from WooCommerce for coupons:', fetchError);
                    // Continue with localStorage cart if fetch fails
                }
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
        // Calculate subtotal from cart items (prices already include tax for localStorage cart)
        let subtotal = 0;
        cart.items.forEach(item => {
            const unitPrice = parseFloat(item.prices?.price) / 100 || 0;
            subtotal += unitPrice * item.quantity;
        });
        return subtotal.toFixed(2);
    };

    // Get total tax/VAT
    const getTotalTax = () => {
        if (!cart || !cart.items) return '0.00';
        // For localStorage cart, tax is included in price
        // This is a simplified calculation - actual tax will be calculated by WooCommerce at checkout
        return '0.00';
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
        handleAddToCart,
        handleUpdateCartItem,
        handleRemoveCartItem,
        handleClearCart,
        handleApplyCoupon,
        handleRemoveCoupon,
        loadCart,
        syncCartToAPI,
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
