/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useCart from "@/Shared/Hooks/useCart";
import { clearCart, getPaymentMethods, getCountryDetails, applyCoupon, removeCoupon } from "@/app/actions/Woo-Coommerce/getWooCommerce";
import { selectShippingRate } from "@/app/actions/Woo-Coommerce/Shop/Cart/cart";
import { countriesList } from "@/lib/countriesList";
import { WAREHOUSES } from "@/lib/countries-config";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Notification from "@/Shared/Notification/Notification";
import BillingDetails from "./components/BillingDetails";
import ShippingDetails from "./components/ShippingDetails";
import ShippingMethods from "./components/ShippingMethods";
import PaymentMethods from "./components/PaymentMethods";
import OrderSummary from "./components/OrderSummary";
import { CreditCard, ShoppingCart, ArrowRight } from "lucide-react";

// Helper to get cookie value
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Helper functions for localStorage cart coupons
const CART_STORAGE_KEY = 'afs_cart';

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

// Save coupons to localStorage cart
const saveCouponsToLocalStorage = (coupons, discount, cart = null) => {
    let localCart = getLocalStorageCart();

    // If cart doesn't exist but we have a cart object passed, use it
    if (!localCart && cart && cart.items && cart.items.length > 0) {
        // Create a minimal cart structure from the current cart
        const currentMetadata = {
            locale: cart.metadata?.locale || 'fr',
            currency: cart.metadata?.currency || cart.totals?.currency_code || 'EUR',
            location: cart.metadata?.location || '2682'
        };

        localCart = {
            items: cart.items.map(item => ({
                id: item.id,
                variation_id: item.variation_id || null,
                quantity: item.quantity || 1,
                variation: item.variation || {},
                productData: item.productData || {}
            })),
            metadata: {
                ...currentMetadata,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        };

    }

    if (localCart) {
        const couponsToSave = coupons || [];
        const discountToSave = discount || 0;

        localCart.coupons = couponsToSave;
        localCart.couponDiscount = discountToSave;

        try {
            saveLocalStorageCart(localCart);

            // Verify it was saved
            const verifyCart = getLocalStorageCart();
            const savedCoupons = verifyCart?.coupons || [];
            const savedDiscount = verifyCart?.couponDiscount || 0;



            return true;
        } catch (error) {
            console.error('[Checkout] Error saving coupons to localStorage:', error);
            return false;
        }
    } else {
        console.warn('[Checkout] ⚠️ Cannot save coupons: localStorage cart does not exist and no cart provided');
        return false;
    }
};

// Load coupons from localStorage cart
const loadCouponsFromLocalStorage = () => {
    const localCart = getLocalStorageCart();
    if (localCart) {
        const coupons = localCart.coupons || [];
        const discount = localCart.couponDiscount || 0;

        return {
            coupons: coupons,
            discount: discount
        };
    }
    return { coupons: [], discount: 0 };
};

// Wrapper component to ensure NextIntl context is available
const CheckoutPageContent = () => {
    const t = useTranslations("checkout");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const pathname = usePathname();

    const [shippingAddress, setShippingAddress] = useState(false);

    const handleShow = event => {
        const isChecked = event.target.checked;
        setShippingAddress(isChecked);

        // If unchecking, reset shipping fields to billing values
        if (!isChecked) {
            setValue('shipping_first_name', watchFields.billing_first_name || '');
            setValue('shipping_last_name', watchFields.billing_last_name || '');
            setValue('shipping_company', watchFields.billing_company || '');
            setValue('shipping_country', watchFields.billing_country || '');
            setValue('shipping_address_1', watchFields.billing_address_1 || '');
            setValue('shipping_city', watchFields.billing_city || '');
            setValue('shipping_state', watchFields.billing_state || '');
            setValue('shipping_postcode', watchFields.billing_postcode || '');
        }
    }

    // Cart
    const { cart, loadCart, handleClearCart, syncCartToAPI } = useCart();

    const cartBillingAddress = cart?.billing_address;
    const cartShippingAddress = cart?.shipping_address;


    const items = cart?.items;

    // React Hook Form
    const {
        register,
        handleSubmit,
        watch,
        reset,
        trigger,
        setValue,
        getValues,
        control,
        formState: { errors }
    } = useForm({
        mode: 'onChange', // Changed from 'onTouched' to 'onChange' to detect changes immediately
        defaultValues: {
            billing_first_name: '',
            billing_last_name: '',
            billing_company: '',
            billing_country: '',
            billing_address_1: '',
            billing_city: '',
            billing_state: '',
            billing_postcode: '',
            billing_phone: '',
            billing_email: '',
            survey: '',
            survey_other: '',
            shipping_first_name: '',
            shipping_last_name: '',
            shipping_company: '',
            shipping_country: '',
            shipping_address_1: '',
            shipping_city: '',
            shipping_state: '',
            shipping_postcode: '',
            order_comments: '',
            payment_method: '',
            shipping_method: 'free',
            terms: false
        }
    });

    // Don't check shipping address by default - user must explicitly check it
    // Removed the useEffect that auto-checks shipping address

    // Use a ref to track if form has been initialized to avoid multiple resets
    const formInitializedRef = useRef(false);

    useEffect(() => {
        // Only initialize once on mount, or when cart address changes from null to a value
        // Don't reset if form was already initialized and user has entered data
        if (formInitializedRef.current) {
            return; // Form already initialized, don't reset
        }

        // Get selected country from cookie (from "Choose your location")
        const selectedCountryFromCookie = getCookie('selected_country');

        // Build form values object, merging both billing and shipping addresses
        const formValues = {};

        // Add billing address if available
        if (cartBillingAddress) {
            formValues.billing_first_name = cartBillingAddress.first_name || '';
            formValues.billing_last_name = cartBillingAddress.last_name || '';
            formValues.billing_company = cartBillingAddress.company || '';
            // Use cart country if available, otherwise use selected country from cookie
            formValues.billing_country = cartBillingAddress.country || selectedCountryFromCookie || '';
            formValues.billing_address_1 = cartBillingAddress.address_1 || '';
            formValues.billing_city = cartBillingAddress.city || '';
            formValues.billing_state = cartBillingAddress.state || '';
            formValues.billing_postcode = cartBillingAddress.postcode || '';
            formValues.billing_phone = cartBillingAddress.phone || '';
            formValues.billing_email = cartBillingAddress.email || '';
        } else if (selectedCountryFromCookie) {
            // If no cart billing address, pre-fill country from cookie
            formValues.billing_country = selectedCountryFromCookie;
        }

        // Initialize shipping address with billing address by default
        // Only use cart shipping address if it's different from billing
        if (cartBillingAddress) {
            formValues.shipping_first_name = cartShippingAddress?.first_name || cartBillingAddress.first_name || '';
            formValues.shipping_last_name = cartShippingAddress?.last_name || cartBillingAddress.last_name || '';
            formValues.shipping_company = cartShippingAddress?.company || cartBillingAddress.company || '';
            // Use cart shipping country if available, otherwise use billing country, otherwise use selected country from cookie
            formValues.shipping_country = cartShippingAddress?.country || cartBillingAddress.country || selectedCountryFromCookie || '';
            formValues.shipping_address_1 = cartShippingAddress?.address_1 || cartBillingAddress.address_1 || '';
            formValues.shipping_city = cartShippingAddress?.city || cartBillingAddress.city || '';
            formValues.shipping_state = cartShippingAddress?.state || cartBillingAddress.state || '';
            formValues.shipping_postcode = cartShippingAddress?.postcode || cartBillingAddress.postcode || '';
        } else if (selectedCountryFromCookie) {
            // If no cart billing address, pre-fill shipping country from cookie
            formValues.shipping_country = selectedCountryFromCookie;
        }

        // Only reset if we have at least one address or a country to pre-fill
        if (Object.keys(formValues).length > 0) {
            reset(formValues);
            formInitializedRef.current = true;
        }
    }, [reset, cartShippingAddress, cartBillingAddress]);

    // Note: Cart stays in localStorage during checkout
    // We only sync to WooCommerce API when the order is submitted
    // Shipping rates are calculated via a separate API call based on country selection

    // Use useWatch for proper form value subscription in production
    // Unlike watch(), useWatch subscribes to form changes and triggers re-renders
    const watchFields = useWatch({ control });
    // Also watch survey and terms separately to ensure they're tracked
    const surveyValue = useWatch({ control, name: "survey" });
    const termsValue = useWatch({ control, name: "terms" });
    // Watch billing fields directly to ensure they're detected
    const billingFirstName = useWatch({ control, name: "billing_first_name" });
    const billingLastName = useWatch({ control, name: "billing_last_name" });
    const billingEmail = useWatch({ control, name: "billing_email" });
    const billingCountry = useWatch({ control, name: "billing_country" });
    const billingAddress = useWatch({ control, name: "billing_address_1" });
    const billingCity = useWatch({ control, name: "billing_city" });
    const billingPostcode = useWatch({ control, name: "billing_postcode" });

    // Get error message only if field has been touched or form has been submitted
    const getFieldError = (fieldName) => {
        const fieldError = errors[fieldName];
        return fieldError?.message || null;
    };

    const [countryDetails, setCountryDetails] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCartEmpty, setIsCartEmpty] = useState(false);
    const [orderProcessing, setOrderProcessing] = useState(false); // Full-screen overlay during order creation

    // Get location from cookie to determine tax display mode
    // Europe (2682): TTC - tax included in price
    // North America (2683): HT - tax shown separately
    const [currentLocation, setCurrentLocation] = useState(WAREHOUSES.EUROPE);

    useEffect(() => {
        const locationFromCookie = getCookie('location');
        if (locationFromCookie) {
            setCurrentLocation(locationFromCookie);
        }
    }, []);

    // Update country fields if selected_country cookie exists and fields are empty
    useEffect(() => {
        const selectedCountryFromCookie = getCookie('selected_country');
        if (selectedCountryFromCookie) {
            // Only update if billing country is empty
            if (!watchFields.billing_country) {
                setValue('billing_country', selectedCountryFromCookie);
            }
            // Only update shipping country if it's empty and billing country is also empty or same as cookie
            if (!watchFields.shipping_country && (!watchFields.billing_country || watchFields.billing_country === selectedCountryFromCookie)) {
                setValue('shipping_country', selectedCountryFromCookie);
            }
        }
    }, [setValue, watchFields.billing_country, watchFields.shipping_country]);

    // Determine if we should show taxes included (Europe) or separate (North America)
    const isEuropeLocation = currentLocation === WAREHOUSES.EUROPE;

    // Filter payment methods to show only allowed ones based on currency
    const filterPaymentMethods = (methods) => {
        // Ensure methods is an array
        if (!methods) return [];
        if (!Array.isArray(methods)) {
            // If methods is an object, try to convert it to an array
            if (typeof methods === 'object') {
                // Check if it's an object with payment methods as values
                const methodsArray = Object.values(methods);
                if (Array.isArray(methodsArray) && methodsArray.length > 0) {
                    methods = methodsArray;
                } else {
                    return [];
                }
            } else {
                return [];
            }
        }

        // Get currency from cart
        const currencySymbol = cart?.totals?.currency_symbol || '';
        const currencyCode = cart?.totals?.currency_code || '';

        // Determine currency type - more comprehensive detection
        const isUSD = currencySymbol === '$' ||
            currencySymbol === 'USD' ||
            currencySymbol?.toUpperCase() === 'USD' ||
            currencyCode?.toUpperCase() === 'USD' ||
            currencyCode === 'USD';
        const isEUR = currencySymbol === '€' ||
            currencySymbol === 'EUR' ||
            currencySymbol?.toUpperCase() === 'EUR' ||
            currencyCode?.toUpperCase() === 'EUR' ||
            currencyCode === 'EUR';
        const isGBP = currencySymbol === '£' ||
            currencySymbol === 'GBP' ||
            currencySymbol?.toUpperCase() === 'GBP' ||
            currencyCode?.toUpperCase() === 'GBP' ||
            currencyCode === 'GBP';

        // Filter methods based on currency
        const filtered = methods.filter(method => {
            // Ensure method is an object and enabled
            if (!method || typeof method !== 'object') {
                return false;
            }

            // Only include enabled methods
            if (method.enabled !== true) {
                return false;
            }

            const methodId = method.id?.toLowerCase() || '';
            const methodTitle = method.title?.toLowerCase() || '';

            // USD: Only Authorize.Net - Check this FIRST before excluding generic credit cards
            if (isUSD) {
                const isAuthorize = methodId === 'authnet' ||
                    methodId === 'authorize_net' ||
                    methodId === 'authorize-net' ||
                    methodId.includes('authnet') ||
                    methodId.includes('authorize') ||
                    methodTitle.includes('authorize') ||
                    methodTitle.includes('authorize.net') ||
                    methodTitle.includes('authorize net');
                if (isAuthorize) {
                    return true;
                } else {
                    return false;
                }
            }

            // Exclude Credit Card (generic) - but only if not USD (Authorize.Net already handled above)
            if (methodId === 'credit-card' || methodTitle.includes('credit card')) {
                return false;
            }

            // EUR: PayPal, Monetico, and Bank Transfer
            if (isEUR) {
                // PayPal
                if (methodId === 'paypal' || methodId === 'ppcp-gateway' || methodTitle.includes('paypal')) {
                    return true;
                }
                // Monetico variants
                if (methodId.includes('monetico') ||
                    methodTitle.includes('carte bancaire') ||
                    methodTitle.includes('monetico')) {
                    return true;
                }
                // Bank Transfer
                if (methodId === 'bacs' || methodTitle.includes('virement bancaire') || methodTitle.includes('virement')) {
                    return true;
                }
                return false;
            }

            // GBP: PayPal and Monetico
            if (isGBP) {
                // PayPal
                if (methodId === 'paypal' || methodId === 'ppcp-gateway' || methodTitle.includes('paypal')) {
                    return true;
                }
                // Monetico variants
                if (methodId.includes('monetico') ||
                    methodTitle.includes('carte bancaire') ||
                    methodTitle.includes('monetico')) {
                    return true;
                }
                return false;
            }

            // Default: If currency is not recognized, return all methods (fallback)
            // Include PayPal
            if (methodId === 'paypal' || methodId === 'ppcp-gateway' || methodTitle.includes('paypal')) {
                return true;
            }
            // Include Monetico
            if (methodId.includes('monetico') ||
                methodTitle.includes('carte bancaire') ||
                methodTitle.includes('monetico')) {
                return true;
            }
            // Include Bank Transfer
            if (methodId === 'bacs' || methodTitle.includes('virement bancaire') || methodTitle.includes('virement')) {
                return true;
            }
            // Include Authorize
            if (methodId === 'authnet' ||
                methodId.includes('authnet') ||
                methodId.includes('authorize') ||
                methodTitle.includes('authorize')) {
                return true;
            }

            return false;
        });

        return filtered;
    };

    const filteredPaymentMethods = filterPaymentMethods(paymentMethods);

    // Function to get translated payment method title and description
    const getPaymentMethodTranslation = (method) => {
        const methodId = method.id?.toLowerCase() || '';
        const methodTitle = method.title?.toLowerCase() || '';

        // Check for Authorize
        if (methodId.includes('authorize') || methodTitle.includes('authorize')) {
            return {
                title: t("paymentMethods.authorize") || method.title || 'Authorize.Net',
                description: t("paymentMethods.authorizeDescription") || t("paymentMethods.cardDescription")
            };
        }

        // Check for PayPal
        if (methodId === 'paypal' || methodId === 'ppcp-gateway' || methodTitle.includes('paypal')) {
            return {
                title: t("paymentMethods.paypal"),
                description: t("paymentMethods.paypalDescription")
            };
        }

        // Check for Monetico variants (2x, 3x, 4x)
        if (methodId.includes('monetico') || methodTitle.includes('carte bancaire')) {
            // Check for specific variants first
            if (methodId.includes('monetico2x') || methodId.includes('2x') || methodTitle.includes('2 fois') || methodTitle.includes('2x')) {
                return {
                    title: t("paymentMethods.monetico2x"),
                    description: t("paymentMethods.cardDescription")
                };
            }
            if (methodId.includes('monetico3x') || methodId.includes('3x') || methodTitle.includes('3 fois') || methodTitle.includes('3x')) {
                return {
                    title: t("paymentMethods.monetico3x"),
                    description: t("paymentMethods.cardDescription")
                };
            }
            if (methodId.includes('monetico4x') || methodId.includes('4x') || methodTitle.includes('4 fois') || methodTitle.includes('4x')) {
                return {
                    title: t("paymentMethods.monetico4x"),
                    description: t("paymentMethods.cardDescription")
                };
            }
            // Default Monetico
            return {
                title: t("paymentMethods.monetico"),
                description: t("paymentMethods.cardDescription")
            };
        }

        // Check for Bank Transfer
        if (methodId === 'bacs' || methodTitle.includes('virement bancaire') || methodTitle.includes('virement')) {
            return {
                title: t("paymentMethods.bacs"),
                description: t("paymentMethods.bankTransferDescription")
            };
        }

        // Default fallback
        return {
            title: method.title,
            description: t("paymentMethods.cardDescription")
        };
    };

    // Payment instructions (translated)
    const PAYMENT_INSTRUCTIONS = {
        'bacs': t("paymentMethods.bacsInstructions"),
        'paypal': t("paymentMethods.paypalDescription"),
        'ppcp-gateway': t("paymentMethods.paypalDescription")
    };




    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const data = await getPaymentMethods();
                if (Array.isArray(data)) {
                    setPaymentMethods(data);
                } else if (data && typeof data === 'object') {
                    // If it's an object, try to convert to array
                    const methodsArray = Object.values(data);
                    if (Array.isArray(methodsArray)) {
                        setPaymentMethods(methodsArray);
                    } else {
                        setPaymentMethods([]);
                    }
                } else {
                    setPaymentMethods([]);
                }
            } catch (error) {
                console.error('Error fetching payment methods:', error);
                setPaymentMethods([]);
            }
        };
        fetchPaymentMethods();
    }, []);

    // State for shipping country details
    const [shippingCountryDetails, setShippingCountryDetails] = useState(null);

    useEffect(() => {
        if (watchFields.billing_country) {
            const fetchCountryDetails = async () => {
                const data = await getCountryDetails(watchFields.billing_country);
                setCountryDetails(data);
            };
            fetchCountryDetails();
        }
    }, [watchFields.billing_country, setCountryDetails]);

    // Fetch shipping country details when shipping country changes
    useEffect(() => {
        const shippingCountry = watchFields.shipping_country || watchFields.billing_country;
        if (shippingCountry) {
            const fetchShippingCountryDetails = async () => {
                const data = await getCountryDetails(shippingCountry);
                setShippingCountryDetails(data);
            };
            fetchShippingCountryDetails();
        }
    }, [watchFields.shipping_country, watchFields.billing_country]);

    // Ref to track last update to prevent infinite loops
    const lastUpdateRef = React.useRef({ country: '', postcode: '', city: '', address: '', state: '', key: '' });
    const isUpdatingRef = React.useRef(false);
    const isSyncingCartRef = React.useRef(false);
    // Ref to access current appliedCoupons without causing re-renders
    const appliedCouponsRef = React.useRef([]);
    // Refs to store callback functions to avoid dependency issues
    const syncCartAndUpdateTaxesRef = React.useRef(null);
    const calculateShippingRatesRef = React.useRef(null);

    // State for shipping
    const [shippingLoading, setShippingLoading] = useState(false);
    const [updatingShipping, setUpdatingShipping] = useState(false);
    const [selectedRateId, setSelectedRateId] = useState(null);
    const [notification, setNotification] = useState(null); // { message: string, type: 'info' | 'warning' | 'error' }
    const [calculatedShippingRates, setCalculatedShippingRates] = useState([]);

    // State for dynamic tax calculation
    const [updatingTaxes, setUpdatingTaxes] = useState(false);
    const [apiCartItems, setApiCartItems] = useState([]);

    // State for coupons
    // Load coupons from localStorage on mount
    const initialCoupons = typeof window !== 'undefined' ? loadCouponsFromLocalStorage() : { coupons: [], discount: 0 };
    const [appliedCoupons, setAppliedCoupons] = useState(initialCoupons.coupons);
    const [couponDiscount, setCouponDiscount] = useState(initialCoupons.discount);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    // Sync ref with state whenever appliedCoupons changes (but don't trigger callbacks)
    useEffect(() => {
        appliedCouponsRef.current = appliedCoupons;
    }, [appliedCoupons]);

    // Helper to show notification with type
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };

    // Calculate shipping rates based on country and cart items
    const calculateShippingRates = useCallback(async (addressData) => {
        // Need at least country and cart items
        const shippingCountry = addressData.shipping_country || addressData.billing_country;
        if (!shippingCountry || !cart?.items || cart.items.length === 0) {
            return;
        }

        // Prevent if already syncing cart
        if (isSyncingCartRef.current) {
            console.log('[Checkout] Cart sync in progress, skipping shipping calculation...');
            return;
        }

        // Check if we're already updating or if nothing has changed
        const currentKey = `${shippingCountry}-${addressData.billing_postcode || ''}-${addressData.billing_city || ''}`;
        if (isUpdatingRef.current || lastUpdateRef.current.key === currentKey) {
            return;
        }

        try {
            // Mark as updating BEFORE setting the key to prevent race conditions
            isUpdatingRef.current = true;
            lastUpdateRef.current.key = currentKey;
            setUpdatingShipping(true);

            // Prepare items from localStorage cart (include variation attributes for variable products)
            // Use _variationRaw (object format) if it has data, otherwise use variation (array format)
            const items = cart.items.map(item => {
                // Determine which variation format to use
                // _variationRaw is object format: { "attribute_pa_taille": "M" }
                // variation is array format: [{ attribute: "attribute_pa_taille", value: "M" }]
                let variationData = null;

                // Check if _variationRaw has actual data (not empty object)
                if (item._variationRaw && typeof item._variationRaw === 'object' && Object.keys(item._variationRaw).length > 0) {
                    variationData = item._variationRaw;
                }
                // Fall back to array format if available
                else if (Array.isArray(item.variation) && item.variation.length > 0) {
                    // Convert array to object format for consistency
                    variationData = item.variation.reduce((acc, v) => {
                        if (v.attribute && v.value) {
                            acc[v.attribute] = v.value;
                        }
                        return acc;
                    }, {});
                }
                // Last resort: try to get from productData if available
                else if (item.productData?.variations && item.variation_id) {
                    const matchedVariation = item.productData.variations.find(v => v.id === item.variation_id);
                    if (matchedVariation?.attributes) {
                        // Use slug for API compatibility (WooCommerce Store API expects "pa_taille" not "Taille")
                        variationData = matchedVariation.attributes.reduce((acc, attr) => {
                            const attrKey = attr.slug || attr.name || attr.attribute || '';
                            const attrValue = attr.option || attr.value || '';
                            if (attrKey && attrValue) {
                                acc[attrKey] = attrValue;
                            }
                            return acc;
                        }, {});
                    }
                }



                return {
                    id: item.id,
                    quantity: item.quantity,
                    variation_id: item.variation_id || null,
                    variation: variationData
                };
            });

            // Get location from cart metadata (set when items were added)
            const cartLocation = cart?.metadata?.location || cart?._localStorage?.location;


            // Call the shipping calculation API
            const response = await fetch('/api/shipping/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    country: shippingCountry,
                    state: addressData.billing_state || addressData.shipping_state || '',
                    postcode: addressData.billing_postcode?.trim() || addressData.shipping_postcode?.trim() || '',
                    city: addressData.billing_city || addressData.shipping_city || '',
                    items: items,
                    location: cartLocation // Pass location for Multi-Locations-Inventory-Management plugin
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.shipping_rates) {
                    // Extract flat list of shipping rates from packages
                    const rates = result.shipping_rates.flatMap((pkg, pkgIndex) => {
                        if (pkg.shipping_rates && Array.isArray(pkg.shipping_rates)) {
                            return pkg.shipping_rates.map(rate => ({
                                ...rate,
                                package_id: pkg.package_id || pkgIndex
                            }));
                        }
                        return [];
                    });
                    // Set shipping rates first
                    setCalculatedShippingRates(rates);

                    // Auto-select first rate if none selected
                    // OR force select if there's only one rate (unique shipping method)
                    if (rates.length > 0) {
                        const firstRateValue = `${rates[0].package_id || 0}:${rates[0].rate_id}`;
                        // If there's only one rate (unique method), ALWAYS force select it
                        // This ensures the shipping cost is added to the total
                        if (rates.length === 1) {
                            // Force selection for unique shipping method - always update
                            // Clear user selection ref to allow auto-selection
                            userSelectedRateRef.current = null;
                            // Always set, even if selectedRateId already exists, to ensure sync
                            setSelectedRateId(firstRateValue);
                            setValue('shipping_method', rates[0].rate_id);
                        } else {
                            // For multiple rates, only select if none is selected
                            // Use functional update to get current state
                            setSelectedRateId(prev => {
                                if (!prev) {
                                    setValue('shipping_method', rates[0].rate_id);
                                    return firstRateValue;
                                }
                                return prev;
                            });
                        }
                    }
                } else {
                    setCalculatedShippingRates([]);
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to calculate shipping rates:', errorText);
                setCalculatedShippingRates([]);
            }
        } catch (error) {
            console.error('Error calculating shipping rates:', error);
            setCalculatedShippingRates([]);
        } finally {
            setUpdatingShipping(false);
            isUpdatingRef.current = false;
        }
    }, [cart?.items, selectedRateId, setValue]);

    // Sync cart to WooCommerce and update taxes based on billing/shipping address
    // This function preserves applied coupons by saving and reapplying them after sync
    const syncCartAndUpdateTaxes = useCallback(async (addressFields) => {
        // Need cart items to sync
        if (!cart?.items || cart.items.length === 0) {
            return;
        }

        // Prevent multiple simultaneous calls
        if (isSyncingCartRef.current) {
            console.log('[Checkout] syncCartAndUpdateTaxes already in progress, skipping...');
            return;
        }

        // Prevent if already updating shipping
        if (isUpdatingRef.current) {
            console.log('[Checkout] Shipping calculation in progress, skipping sync...');
            return;
        }

        isSyncingCartRef.current = true;
        setUpdatingTaxes(true);
        try {
            // Update the key to prevent duplicate calls
            const shippingCountry = addressFields.shipping_country || addressFields.billing_country;
            const currentState = shippingAddress
                ? (addressFields.shipping_state || addressFields.billing_state || '')
                : (addressFields.billing_state || '');
            const syncKey = `${shippingCountry}-${currentState}-${addressFields.billing_postcode || addressFields.shipping_postcode}-${addressFields.billing_city || addressFields.shipping_city}`;
            lastUpdateRef.current.key = syncKey;

            // 0. Save current coupons before clearing cart (use ref to avoid dependency)
            const savedCouponCodes = [];
            const currentCoupons = appliedCouponsRef.current;
            if (currentCoupons && currentCoupons.length > 0) {
                // Extract coupon codes from appliedCoupons (can be string or object with code property)
                savedCouponCodes.push(...currentCoupons.map(coupon => {
                    if (typeof coupon === 'string') return coupon;
                    return coupon.code || coupon;
                }).filter(Boolean));
            }


            // 1. Clear existing WooCommerce cart
            await fetch('/api/cart/clear', {
                method: 'DELETE',
                credentials: 'include',
            });

            // Get location from cart metadata
            const cartLocation = cart?.metadata?.location || '2682';

            // 2. Add each item to WooCommerce cart
            for (const item of cart.items) {
                // Determine which variation format to use
                let variationData = null;
                if (item._variationRaw && typeof item._variationRaw === 'object' && Object.keys(item._variationRaw).length > 0) {
                    variationData = item._variationRaw;
                } else if (Array.isArray(item.variation) && item.variation.length > 0) {
                    variationData = item.variation.reduce((acc, v) => {
                        if (v.attribute && v.value) {
                            acc[v.attribute] = v.value;
                        }
                        return acc;
                    }, {});
                }

                await fetch('/api/cart/add-item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        id: item.id,
                        quantity: item.quantity || 1,
                        variation_id: item.variation_id || null,
                        variation: variationData,
                        location: cartLocation,
                    }),
                });
            }

            // 3. Reapply saved coupons after items are added
            if (savedCouponCodes.length > 0) {

                // Wait a bit for cart to be ready
                await new Promise(resolve => setTimeout(resolve, 500));

                // Reapply each coupon sequentially
                for (const couponCode of savedCouponCodes) {
                    try {
                        const result = await applyCoupon(couponCode);
                        // Small delay between coupon applications to avoid race conditions
                        await new Promise(resolve => setTimeout(resolve, 300));
                    } catch (error) {
                        console.error(`[Checkout] Error reapplying coupon ${couponCode}:`, error);
                    }
                }
                // Wait a bit more after all coupons are reapplied
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // 4. Update billing/shipping address to trigger tax recalculation
            const billingAddress = {
                country: addressFields.billing_country || '',
                state: addressFields.billing_state || '',
                postcode: addressFields.billing_postcode || '',
                city: addressFields.billing_city || '',
            };

            const shippingAddr = shippingAddress ? {
                country: addressFields.shipping_country || addressFields.billing_country || '',
                state: addressFields.shipping_state || addressFields.billing_state || '',
                postcode: addressFields.shipping_postcode || addressFields.billing_postcode || '',
                city: addressFields.shipping_city || addressFields.billing_city || '',
            } : null;

            await fetch('/api/cart/update-billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    billing_address: billingAddress,
                    shipping_address: shippingAddr,
                }),
            });

            // 5. Fetch updated cart with recalculated taxes and coupons
            const cartResponse = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'include',
            });

            if (cartResponse.ok) {
                const apiCart = await cartResponse.json();
                // Store API cart items for tax calculation display
                if (apiCart.items && apiCart.items.length > 0) {
                    setApiCartItems(apiCart.items);
                    console.log('[Checkout] Tax calculation updated:', {
                        itemsCount: apiCart.items.length,
                        totalTax: apiCart.totals?.total_tax,
                        items: apiCart.items.map(i => ({
                            name: i.name,
                            line_subtotal_tax: i.totals?.line_subtotal_tax
                        }))
                    });
                }
                // Update coupons and discount from WooCommerce cart
                // Preserve localStorage coupons if API doesn't return them (they might not be synced yet)
                const localCoupons = loadCouponsFromLocalStorage();
                let finalCoupons = [];
                let finalDiscount = 0;

                if (apiCart.coupons && Array.isArray(apiCart.coupons) && apiCart.coupons.length > 0) {
                    // API has coupons - use them
                    finalCoupons = apiCart.coupons;

                } else if (localCoupons.coupons.length > 0) {
                    // API doesn't have coupons, but localStorage does - preserve them
                    finalCoupons = localCoupons.coupons;
                }

                // Update both state and ref
                appliedCouponsRef.current = finalCoupons;
                setAppliedCoupons(finalCoupons);

                if (apiCart.totals?.total_discount) {
                    finalDiscount = parseFloat(apiCart.totals.total_discount) / 100;
                } else if (localCoupons.discount > 0) {
                    finalDiscount = localCoupons.discount;
                }

                setCouponDiscount(finalDiscount);
                // Save to localStorage
                saveCouponsToLocalStorage(finalCoupons, finalDiscount, cart);
            }
        } catch (error) {
            console.error('Error syncing cart for tax calculation:', error);
            // Silent failure - keep existing taxes
        } finally {
            setUpdatingTaxes(false);
            isSyncingCartRef.current = false;
        }
    }, [cart?.items, cart?.metadata?.location, shippingAddress]);

    // Store callbacks in refs to avoid dependency issues
    useEffect(() => {
        syncCartAndUpdateTaxesRef.current = syncCartAndUpdateTaxes;
        calculateShippingRatesRef.current = calculateShippingRates;
    }, [syncCartAndUpdateTaxes, calculateShippingRates]);

    // Debounced calculation of shipping rates and taxes - trigger on address change
    useEffect(() => {
        // Skip if already updating or syncing
        if (isUpdatingRef.current || isSyncingCartRef.current) {
            return;
        }

        // Determine which country to use (shipping address takes priority if set)
        const shippingCountry = shippingAddress
            ? (watchFields.shipping_country || watchFields.billing_country)
            : watchFields.billing_country;

        const timer = setTimeout(() => {
            // Skip if syncing started during the timeout
            if (isSyncingCartRef.current || !syncCartAndUpdateTaxesRef.current || !calculateShippingRatesRef.current) {
                return;
            }

            // Calculate shipping rates and taxes if country is set
            if (shippingCountry) {
                // Determine which state to use (shipping takes priority if different address)
                const currentState = shippingAddress
                    ? (watchFields.shipping_state || watchFields.billing_state || '')
                    : (watchFields.billing_state || '');

                // Include state in the key - important for North America tax calculation
                const currentKey = `${shippingCountry}-${currentState}-${watchFields.billing_postcode || watchFields.shipping_postcode}-${watchFields.billing_city || watchFields.shipping_city}`;

                // Only calculate if something actually changed
                if (lastUpdateRef.current.key !== currentKey) {
                    // Don't update the key here - let the functions update it after execution
                    // This prevents race conditions
                    // Calculate shipping rates
                    calculateShippingRatesRef.current(watchFields);
                    // Sync cart and recalculate taxes based on new address (including state for US/CA)
                    syncCartAndUpdateTaxesRef.current(watchFields);
                }
            }
        }, 800); // Wait 800ms after user stops typing

        return () => clearTimeout(timer);
    }, [
        watchFields.billing_country,
        watchFields.shipping_country,
        watchFields.billing_postcode,
        watchFields.shipping_postcode,
        watchFields.billing_city,
        watchFields.shipping_city,
        watchFields.billing_state,
        watchFields.shipping_state,
        shippingAddress
        // Removed calculateShippingRates and syncCartAndUpdateTaxes from dependencies to prevent loops
    ]);

    const states = countryDetails?.states || [];

    // Use calculated shipping rates from API (not from cart)
    const allShippingRates = calculatedShippingRates;

    // Calculate subtotal from localStorage cart items
    // localStorage cart items have: price (unit price as string/number), quantity
    const sousTotal = React.useMemo(() => {
        if (!cart?.items || cart.items.length === 0) return 0;

        return cart.items.reduce((acc, item) => {
            // Handle different price formats
            let unitPrice = 0;
            if (item.totals?.line_subtotal) {
                // API cart format
                unitPrice = (Number(item.totals.line_subtotal) + Number(item.totals.line_subtotal_tax || 0)) / 100;
            } else if (item.price) {
                // localStorage cart format - price is already in decimal format
                unitPrice = parseFloat(item.price) * (item.quantity || 1);
            }
            return acc + unitPrice;
        }, 0);
    }, [cart?.items]);

    // Calculate selected shipping cost (including taxes)
    const selectedShippingCost = React.useMemo(() => {
        if (!selectedRateId) {
            return 0;
        }

        // If no rates available yet, return 0 (will recalculate when rates are loaded)
        if (allShippingRates.length === 0) {
            return 0;
        }

        // selectedRateId is now in format "package_id:rate_id"
        // Note: rate_id can contain colons (e.g., "flat_rate:49"), so we need to split carefully
        const colonIndex = selectedRateId.indexOf(':');
        if (colonIndex === -1) {
            return 0; // Invalid format
        }
        const packageId = selectedRateId.substring(0, colonIndex);
        const rateId = selectedRateId.substring(colonIndex + 1); // Everything after first colon

        const selectedRate = allShippingRates.find(rate => {
            const rateMatches = rate.rate_id === rateId;
            const packageMatches = String(rate.package_id || 0) === String(packageId);
            return rateMatches && packageMatches;
        });

        // If rate not found, return 0 (might be a timing issue, will recalculate)
        if (!selectedRate) {
            // Debug: log when rate is not found
            console.log('[Checkout] Shipping rate not found:', {
                selectedRateId,
                packageId,
                rateId,
                availableRates: allShippingRates.map(r => ({
                    rate_id: r.rate_id,
                    package_id: r.package_id,
                    name: r.name,
                    price: r.price
                }))
            });
            return 0;
        }

        // Price and taxes are in cents, convert to decimal and add them
        const price = parseFloat(selectedRate.price || 0) / 100;
        const taxes = parseFloat(selectedRate.taxes || 0) / 100;
        const total = price + taxes;

        // Debug: log successful calculation
        console.log('[Checkout] Shipping cost calculated:', {
            selectedRateId,
            rateName: selectedRate.name,
            price,
            taxes,
            total
        });

        return total;
    }, [selectedRateId, allShippingRates]);

    // Total = subtotal + shipping - coupon discount
    const cartTotal = Math.max(0, sousTotal + selectedShippingCost - couponDiscount);

    // Ref to track user's manual selection (local state takes priority)
    const userSelectedRateRef = React.useRef(null);

    // Special effect: Force select unique shipping method to ensure it's added to total
    // This runs independently to guarantee the unique rate is selected
    useEffect(() => {
        // Only run if there's exactly one shipping rate
        if (allShippingRates.length === 1) {
            const singleRate = allShippingRates[0];
            if (!singleRate) return;

            const singleRateValue = `${singleRate.package_id || 0}:${singleRate.rate_id}`;
            // Always force select the unique rate to ensure shipping cost is in total
            // Clear any user selection ref for unique method (auto-selected)
            userSelectedRateRef.current = null;
            // Always set to ensure it's selected (even if already set, this ensures sync)
            setSelectedRateId(singleRateValue);
            setValue('shipping_method', singleRate.rate_id);
        }
    }, [allShippingRates, setValue]);

    // Auto-select shipping rate when rates change (only for multiple rates)
    // Single rate is handled by the special effect above
    useEffect(() => {
        // Skip if there's only one rate (handled by special effect above)
        if (allShippingRates.length === 1) {
            return;
        }

        // If user has manually selected a rate, prioritize that
        if (userSelectedRateRef.current) {
            // userSelectedRateRef.current is now in format "package_id:rate_id"
            // Note: rate_id can contain colons (e.g., "flat_rate:49"), so we need to split carefully
            const colonIndex = userSelectedRateRef.current.indexOf(':');
            if (colonIndex !== -1) {
                const packageId = userSelectedRateRef.current.substring(0, colonIndex);
                const rateId = userSelectedRateRef.current.substring(colonIndex + 1);
                const userSelected = allShippingRates.find(rate =>
                    rate.rate_id === rateId && String(rate.package_id || 0) === String(packageId)
                );
                if (userSelected) {
                    if (selectedRateId !== userSelectedRateRef.current) {
                        setSelectedRateId(userSelectedRateRef.current);
                        setValue('shipping_method', rateId);
                    }
                    return;
                } else {
                    // User selection no longer available, clear it
                    userSelectedRateRef.current = null;
                }
            }
        }

        // Auto-select first rate if none selected (for multiple rates only)
        if (allShippingRates.length > 1 && !selectedRateId) {
            const firstRate = allShippingRates[0];
            if (firstRate) {
                const firstRateValue = `${firstRate.package_id || 0}:${firstRate.rate_id}`;
                setSelectedRateId(firstRateValue);
                setValue('shipping_method', firstRate.rate_id);
            }
        }
    }, [allShippingRates, selectedRateId, setValue]);

    // Check if PayPal button should be disabled
    const isPayPalDisabled = useMemo(() => {
        // Helper function to check if a field is empty
        const isEmpty = (value) => {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string' && value.trim() === '') return true;
            return false;
        };

        // Check if terms are not accepted
        // Use termsValue directly to ensure checkbox updates are detected
        // For checkboxes, React Hook Form returns true when checked, false when unchecked
        const currentTerms = termsValue !== undefined ? termsValue : (watchFields.terms !== undefined ? watchFields.terms : false);

        // Explicitly check if terms is true (checkbox is checked)
        if (currentTerms !== true) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Checkout] PayPal: Terms not accepted', {
                    termsValue,
                    watchFieldsTerms: watchFields.terms,
                    currentTerms
                });
            }
            return true;
        }

        // Only check email - other fields are not required for PayPal
        const emailToValidate = billingEmail || watchFields.billing_email;
        
        // Check if email is empty
        if (isEmpty(emailToValidate)) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Checkout] PayPal: Email is empty', {
                    billingEmail,
                    watchFieldsEmail: watchFields.billing_email
                });
            }
            return true;
        }

        // Validate email format
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(String(emailToValidate).trim())) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Checkout] PayPal: Invalid email format', { emailToValidate });
            }
            return true;
        }

        // All validations passed - PayPal should be enabled
        if (process.env.NODE_ENV === 'development') {
            console.log('[Checkout] PayPal: All validations passed, button should be ENABLED', {
                terms: currentTerms,
                billingEmail: emailToValidate
            });
        }

        return false;
    }, [
        termsValue,
        billingEmail,
        watchFields.terms,
        watchFields.billing_email
    ]);

    // Debug: Log PayPal disabled state changes
    useEffect(() => {
        console.log('[Checkout] PayPal disabled state:', isPayPalDisabled, {
            termsValue,
            billingEmail,
            watchFieldsTerms: watchFields.terms,
            watchFieldsEmail: watchFields.billing_email
        });
    }, [isPayPalDisabled, termsValue, billingEmail, watchFields.terms, watchFields.billing_email]);

    // Check if Place Order button should be disabled (same validation as PayPal)
    const isPlaceOrderDisabled = useMemo(() => {
        // Helper function to check if a field is empty
        const isEmpty = (value) => {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string' && value.trim() === '') return true;
            return false;
        };

        // Check if terms are not accepted
        // Use termsValue directly to ensure checkbox updates are detected
        // For checkboxes, React Hook Form returns true when checked, false when unchecked
        const currentTerms = termsValue !== undefined ? termsValue : (watchFields.terms !== undefined ? watchFields.terms : false);

        // Explicitly check if terms is true (checkbox is checked)
        if (currentTerms !== true) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Checkout] Terms not accepted', {
                    termsValue,
                    watchFieldsTerms: watchFields.terms,
                    currentTerms,
                    type: typeof currentTerms,
                    isTrue: currentTerms === true,
                    isFalse: currentTerms === false
                });
            }
            return true;
        }

        // Check required billing fields
        // Use surveyValue directly to ensure Controller updates are detected
        // Use direct watch values to ensure they're detected even if watchFields is stale
        const currentSurvey = surveyValue || watchFields.survey;
        const requiredFields = {
            billing_first_name: billingFirstName !== undefined ? billingFirstName : watchFields.billing_first_name,
            billing_last_name: billingLastName !== undefined ? billingLastName : watchFields.billing_last_name,
            billing_country: billingCountry !== undefined ? billingCountry : watchFields.billing_country,
            billing_address_1: billingAddress !== undefined ? billingAddress : watchFields.billing_address_1,
            billing_city: billingCity !== undefined ? billingCity : watchFields.billing_city,
            billing_postcode: billingPostcode !== undefined ? billingPostcode : watchFields.billing_postcode,
            billing_email: billingEmail !== undefined ? billingEmail : watchFields.billing_email,
            survey: currentSurvey
        };

        for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
            if (isEmpty(fieldValue)) {
                // Debug: log which field is missing
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Checkout] Field missing: ${fieldName}`, {
                        value: fieldValue,
                        type: typeof fieldValue,
                        isNull: fieldValue === null,
                        isUndefined: fieldValue === undefined,
                        isEmptyString: fieldValue === '',
                        directWatch: fieldName === 'billing_first_name' ? billingFirstName :
                            fieldName === 'billing_last_name' ? billingLastName :
                                fieldName === 'billing_email' ? billingEmail :
                                    fieldName === 'billing_country' ? billingCountry :
                                        fieldName === 'billing_address_1' ? billingAddress :
                                            fieldName === 'billing_city' ? billingCity :
                                                fieldName === 'billing_postcode' ? billingPostcode : null,
                        watchFieldsSnapshot: {
                            billing_first_name: watchFields.billing_first_name,
                            billing_last_name: watchFields.billing_last_name,
                            billing_email: watchFields.billing_email
                        }
                    });
                }
                return true;
            }
        }

        // Validate email format
        if (watchFields.billing_email) {
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(watchFields.billing_email.trim())) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Checkout] Invalid email format');
                }
                return true;
            }
        }

        // Check if "Autre" is selected but survey_other is empty
        const currentSurveyValue = surveyValue || watchFields.survey;
        if (currentSurveyValue === "other") {
            if (isEmpty(watchFields.survey_other)) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Checkout] Survey "other" selected but survey_other is empty');
                }
                return true;
            }
        }

        // Check shipping address fields if shipping address is different
        if (shippingAddress) {
            const shippingFields = {
                shipping_first_name: watchFields.shipping_first_name,
                shipping_last_name: watchFields.shipping_last_name,
                shipping_country: watchFields.shipping_country,
                shipping_address_1: watchFields.shipping_address_1,
                shipping_city: watchFields.shipping_city,
                shipping_postcode: watchFields.shipping_postcode
            };

            for (const [fieldName, fieldValue] of Object.entries(shippingFields)) {
                if (isEmpty(fieldValue)) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[Checkout] Shipping field missing: ${fieldName}`, fieldValue);
                    }
                    return true;
                }
            }
        }

        // Check if shipping method is selected (only if shipping rates are available)
        if (allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0) {
            if (!selectedRateId) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[Checkout] Shipping method not selected', { allShippingRates, selectedRateId });
                }
                return true;
            }
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('[Checkout] All validations passed, button should be enabled', {
                survey: surveyValue || watchFields.survey,
                terms: termsValue !== undefined ? termsValue : watchFields.terms,
                termsValue,
                watchFieldsTerms: watchFields.terms,
                selectedRateId,
                shippingAddress
            });
        }
        return false;
    }, [
        termsValue,
        termsValue,
        watchFields.terms,
        billingFirstName,
        billingLastName,
        billingEmail,
        billingCountry,
        billingAddress,
        billingCity,
        billingPostcode,
        watchFields.billing_first_name,
        watchFields.billing_last_name,
        watchFields.billing_country,
        watchFields.billing_address_1,
        watchFields.billing_city,
        watchFields.billing_postcode,
        watchFields.billing_email,
        surveyValue,
        watchFields.survey,
        watchFields.survey_other,
        watchFields.shipping_first_name,
        watchFields.shipping_last_name,
        watchFields.shipping_country,
        watchFields.shipping_address_1,
        watchFields.shipping_city,
        watchFields.shipping_postcode,
        shippingAddress,
        allShippingRates,
        selectedRateId,
        t
    ]);

    // Handle shipping rate selection (local state only, sync happens at order submission)
    const handleSelectRate = (value) => {
        // value is already in format "package_id:rate_id"
        if (value === selectedRateId) {
            return;
        }

        // Update local state only - store the full value "package_id:rate_id"
        const [packageId, rateId] = value.split(':');
        userSelectedRateRef.current = value; // Store full value
        setSelectedRateId(value); // Store full value "package_id:rate_id"
        setValue('shipping_method', rateId); // Form still uses just rate_id
    };

    // Check if cart is empty
    useEffect(() => {
        if (!cart) {
            setIsCartEmpty(true);
        } else if (!cart.items || cart.items.length === 0) {
            setIsCartEmpty(true);
        } else {
            setIsCartEmpty(false);
        }
    }, [cart]);

    // Get currency symbol from cart metadata or default to €
    // IMPORTANT: This must be defined before any early returns to avoid hooks order issues
    const currencySymbol = React.useMemo(() => {
        // Try API cart format first
        if (cart?.totals?.currency_symbol) return cart.totals.currency_symbol;
        // Try localStorage cart metadata
        if (cart?.metadata?.currency) {
            const curr = cart.metadata.currency.toLowerCase();
            if (curr === 'usd') return '$';
            if (curr === 'gbp') return '£';
            return '€';
        }
        return '€';
    }, [cart?.totals?.currency_symbol, cart?.metadata?.currency]);

    // Calculate total tax from API cart items (updated when address changes)
    const totalTax = React.useMemo(() => {
        // Use API cart items if available (they have calculated taxes from WooCommerce)
        if (apiCartItems?.length > 0) {
            return apiCartItems.reduce((sum, item) => {
                const tax = parseFloat(item?.totals?.line_subtotal_tax || 0) / 100;
                return sum + tax;
            }, 0);
        }

        // Fallback: Use cart items if they have API format (from loadCart)
        if (cart?.items?.[0]?.totals?.line_subtotal_tax !== undefined) {
            return cart.items.reduce((sum, item) => {
                const tax = parseFloat(item?.totals?.line_subtotal_tax || 0) / 100;
                return sum + tax;
            }, 0);
        }

        // Default: No tax calculated yet (localStorage cart only)
        return 0;
    }, [apiCartItems, cart?.items]);

    // Fetch coupons on initial load if cart is already synced
    // Use a ref to track if we've already loaded coupons to avoid multiple loads
    const couponsLoadedRef = React.useRef(false);

    useEffect(() => {
        // Only fetch if we have cart items and haven't loaded coupons yet
        if (cart?.items && cart.items.length > 0 && !couponsLoadedRef.current) {
            couponsLoadedRef.current = true; // Mark as loaded to prevent multiple loads

            // First, try to load from localStorage
            const localCoupons = loadCouponsFromLocalStorage();

            if (localCoupons.coupons.length > 0 || localCoupons.discount > 0) {
                // Use localStorage coupons
                appliedCouponsRef.current = localCoupons.coupons;
                setAppliedCoupons(localCoupons.coupons);
                setCouponDiscount(localCoupons.discount);

                // Also try to sync with WooCommerce in background (but don't overwrite if localStorage has coupons)
                // This ensures WooCommerce is aware of the coupons
                const syncWithWooCommerce = async () => {
                    try {
                        // Re-apply coupons to WooCommerce if they exist in localStorage
                        for (const coupon of localCoupons.coupons) {
                            const couponCode = typeof coupon === 'string' ? coupon : (coupon.code || coupon);
                            if (couponCode) {
                                try {
                                    await applyCoupon(couponCode);
                                    await new Promise(resolve => setTimeout(resolve, 300));
                                } catch (error) {
                                    // Silent fail - coupon may already be applied
                                }
                            }
                        }
                    } catch (error) {
                        // Silent fail - background sync
                    }
                };
                // Sync in background without blocking
                syncWithWooCommerce();
            } else {
                // If no localStorage coupons, try to load from WooCommerce
                const fetchCoupons = async () => {
                    try {
                        const cartResponse = await fetch('/api/cart', {
                            method: 'GET',
                            credentials: 'include',
                            cache: 'no-store',
                        });
                        if (cartResponse.ok) {
                            const apiCart = await cartResponse.json();
                            if (apiCart.coupons && Array.isArray(apiCart.coupons) && apiCart.coupons.length > 0) {
                                const discount = apiCart.totals?.total_discount ? parseFloat(apiCart.totals.total_discount) / 100 : 0;
                                appliedCouponsRef.current = apiCart.coupons;
                                setAppliedCoupons(apiCart.coupons);
                                setCouponDiscount(discount);
                                // Save to localStorage
                                saveCouponsToLocalStorage(apiCart.coupons, discount, cart);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching cart for coupons:', error);
                    }
                };
                fetchCoupons();
            }
        }

        // Reset loaded flag if cart is cleared
        if (!cart || !cart.items || cart.items.length === 0) {
            couponsLoadedRef.current = false;
        }
    }, [cart?.items?.length]); // Only run when cart items change (removed appliedCoupons.length and couponDiscount to prevent loops)

    // Clear coupon success message after 5 seconds (increased to give user time to see it)
    useEffect(() => {
        if (couponSuccess) {
            const timer = setTimeout(() => {
                setCouponSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [couponSuccess]);

    // Reset coupons when cart is cleared
    useEffect(() => {
        if (!cart || !cart.items || cart.items.length === 0) {
            appliedCouponsRef.current = [];
            setAppliedCoupons([]);
            setCouponDiscount(0);
            setCouponCode('');
            setCouponError('');
            setCouponSuccess('');
            // Clear from localStorage
            saveCouponsToLocalStorage([], 0, cart);
        }
    }, [cart?.items?.length]);

    // Clear cart if locale changes (user navigated to different language checkout)
    // Use a ref to track the previous locale to detect actual changes
    const previousLocaleRef = React.useRef(null);
    const isInitialMount = React.useRef(true);

    useEffect(() => {
        // Skip on initial mount - just store the current locale
        if (isInitialMount.current) {
            isInitialMount.current = false;
            previousLocaleRef.current = locale;
            return;
        }

        // Only proceed if we have all required values
        if (!locale || !cart) {
            return;
        }

        // Check if locale has actually changed from the previous value
        const localeChanged = previousLocaleRef.current !== null && previousLocaleRef.current !== locale;

        // Only clear cart if locale actually changed and cart has items
        if (localeChanged && cart.items && cart.items.length > 0) {
            const clearCartForLocaleChange = async () => {
                try {
                    const result = await handleClearCart();
                    if (result && result.success) {
                        // Show warning notification with clear message
                        showNotification(tCommon("cartClearedLanguage"), 'warning');
                        // Reload cart to update state
                        await loadCart();
                    }
                } catch (error) {
                    console.error('Error clearing cart on locale change:', error);
                    showNotification(tCommon("cartClearedLanguage"), 'warning'); // Show notification anyway
                }
            };

            clearCartForLocaleChange();
        }

        // Update previous locale after checking
        previousLocaleRef.current = locale;
    }, [locale, cart, handleClearCart, tCommon, loadCart]);

    // Clear saved form data from localStorage
    const clearSavedFormData = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('checkout_form_data');
            localStorage.removeItem('checkout_shipping_address');
        }
    };

    // Helper to fetch cart and update coupons/discount
    const fetchCartAndUpdateCoupons = async () => {
        try {
            // First, check if we have coupons in localStorage (preserve them if API doesn't return them yet)
            const localCoupons = loadCouponsFromLocalStorage();

            const cartResponse = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            });
            if (cartResponse.ok) {
                const apiCart = await cartResponse.json();
                const apiCoupons = (apiCart.coupons && Array.isArray(apiCart.coupons)) ? apiCart.coupons : [];
                const discount = apiCart.totals?.total_discount ? parseFloat(apiCart.totals.total_discount) / 100 : 0;

                // Use API coupons if available, otherwise preserve localStorage coupons
                // This prevents losing coupons that were just applied but not yet returned by WooCommerce
                let coupons = apiCoupons;
                if (apiCoupons.length === 0 && localCoupons.coupons.length > 0) {
                    // API doesn't have coupons yet, but we have them in localStorage - preserve them
                    coupons = localCoupons.coupons;
                }

                // Use API discount if available, otherwise use localStorage discount
                const finalDiscount = discount > 0 ? discount : (localCoupons.discount || 0);

                // Update state and ref
                appliedCouponsRef.current = coupons;
                setAppliedCoupons(coupons);
                setCouponDiscount(finalDiscount);

                // Save to localStorage immediately with the final values (preserve coupons if API doesn't have them)
                // Pass current cart context if localStorage cart doesn't exist
                const saved = saveCouponsToLocalStorage(coupons, finalDiscount, cart);


                return { coupons, discount: finalDiscount };
            } else {
                console.error('[Checkout] Failed to fetch cart:', cartResponse.status);
            }
        } catch (error) {
            console.error('Error fetching cart for coupons:', error);
        }

        // If API call failed, return localStorage coupons as fallback
        const localCoupons = loadCouponsFromLocalStorage();
        return { coupons: localCoupons.coupons, discount: localCoupons.discount };
    };

    // Handle coupon application
    const handleApplyCoupon = async (e) => {
        e?.preventDefault();
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess('');

        try {
            // Ensure cart is synced to WooCommerce before applying coupon
            // Only sync if not already syncing to avoid loops
            const shippingCountry = watchFields.shipping_country || watchFields.billing_country;
            if (shippingCountry && cart?.items && cart.items.length > 0 && !isSyncingCartRef.current) {
                // Sync cart first to ensure it exists in WooCommerce
                // syncCartAndUpdateTaxes now preserves coupons, so it's safe to call
                await syncCartAndUpdateTaxes(watchFields);
                // Wait a bit for sync to complete
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const couponCodeToApply = couponCode.trim();
            const result = await applyCoupon(couponCodeToApply);

            if (result.success) {
                setCouponSuccess(t("couponApplied") || "Coupon applied successfully!");
                setCouponCode('');

                // Immediately save the coupon code to localStorage as a fallback
                // This ensures the coupon is saved even if API doesn't return it immediately
                const currentCoupons = appliedCouponsRef.current || [];
                const newCoupons = [...currentCoupons];
                // Check if coupon already exists
                const couponExists = newCoupons.some(c => {
                    const code = typeof c === 'string' ? c : (c.code || c);
                    return code.toLowerCase() === couponCodeToApply.toLowerCase();
                });
                if (!couponExists) {
                    newCoupons.push(couponCodeToApply);
                    appliedCouponsRef.current = newCoupons;
                    setAppliedCoupons(newCoupons);
                    // Save to localStorage immediately
                    saveCouponsToLocalStorage(newCoupons, couponDiscount, cart);
                }

                // Wait longer for cookies to sync and WooCommerce to process the coupon
                // WooCommerce needs time to update the cart session
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Fetch cart to get updated coupons and discount from WooCommerce
                // This will update the discount amount and verify the coupon is applied
                let couponResult = { coupons: [], discount: 0 };
                let found = false;

                for (let attempt = 1; attempt <= 3; attempt++) {
                    couponResult = await fetchCartAndUpdateCoupons();

                    if (couponResult.coupons && couponResult.coupons.length > 0) {
                        found = true;
                        break;
                    }

                    if (attempt < 3) {
                        const delay = attempt * 500; // 500ms, 1000ms
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }

                // Don't call update-billing here as it can trigger syncCartAndUpdateTaxes via useEffect
                // The useEffect will handle tax recalculation when needed
            } else {
                setCouponError(result.error || t("invalidCoupon") || "Invalid coupon code");
            }
        } catch (error) {
            console.error('Apply coupon error:', error);
            setCouponError(error.message || t("errorApplyingCoupon") || "Error applying coupon");
        } finally {
            setCouponLoading(false);
        }
    };

    // Handle coupon removal
    const handleRemoveCoupon = async (couponCodeToRemove) => {
        setCouponLoading(true);
        setCouponError('');
        setCouponSuccess('');

        try {
            const result = await removeCoupon(couponCodeToRemove);

            if (result.success) {
                // Immediately remove from localStorage as well
                const currentCoupons = appliedCouponsRef.current || [];
                const updatedCoupons = currentCoupons.filter(c => {
                    const code = typeof c === 'string' ? c : (c.code || c);
                    return code.toLowerCase() !== couponCodeToRemove.toLowerCase();
                });
                appliedCouponsRef.current = updatedCoupons;
                setAppliedCoupons(updatedCoupons);
                setCouponDiscount(0); // Reset discount, will be updated from API
                // Save to localStorage immediately
                saveCouponsToLocalStorage(updatedCoupons, 0, cart);


                // Wait a bit for cookies to sync
                await new Promise(resolve => setTimeout(resolve, 500));

                // Fetch cart to get updated coupons and discount from WooCommerce
                // This will verify the removal and update the discount
                const couponResult = await fetchCartAndUpdateCoupons();


                // Don't call update-billing here as it can trigger syncCartAndUpdateTaxes via useEffect
                // The useEffect will handle tax recalculation when needed
            } else {
                console.error('Remove coupon error:', result.error);
                setCouponError(result.error || t("errorRemovingCoupon") || "Error removing coupon");
            }
        } catch (error) {
            console.error('Remove coupon error:', error);
            setCouponError(error.message || t("errorRemovingCoupon") || "Error removing coupon");
        } finally {
            setCouponLoading(false);
        }
    };

    const onSubmit = async (data) => {

        // Prevent submission if cart is empty
        if (isCartEmpty) {
            alert(t("emptyCartMessage"));
            return;
        }

        // Validate terms acceptance
        if (!data.terms) {
            alert(t("termsRequired"));
            return;
        }

        // Validate shipping method selection
        if (!selectedRateId && allShippingRates.length > 0) {
            alert(t("selectShippingMethod"));
            return;
        }

        // PayPal is handled directly by the CheckoutPayPal component
        // No need to handle it in onSubmit

        if (data.payment_method === 'bacs') {
            setIsSubmitting(true);
            setOrderProcessing(true); // Show full-screen overlay
            try {
                // Step 1: Sync localStorage cart to WooCommerce API
                const syncResult = await syncCartToAPI();
                if (!syncResult.success) {
                    throw new Error(syncResult.error || 'Failed to sync cart');
                }

                // Update coupons and discount from synced cart
                if (syncResult.data) {
                    if (syncResult.data.coupons && Array.isArray(syncResult.data.coupons)) {
                        appliedCouponsRef.current = syncResult.data.coupons;
                        setAppliedCoupons(syncResult.data.coupons);
                    }
                    if (syncResult.data.totals?.total_discount) {
                        setCouponDiscount(parseFloat(syncResult.data.totals.total_discount) / 100);
                    } else {
                        setCouponDiscount(0);
                    }
                }

                // Step 2: Select shipping rate if available
                // selectedRateId is now in format "package_id:rate_id"
                // Note: rate_id can contain colons (e.g., "flat_rate:49"), so we need to split carefully
                const colonIndex = selectedRateId.indexOf(':');
                if (colonIndex === -1) {
                    throw new Error('Invalid selectedRateId format');
                }
                const packageId = selectedRateId.substring(0, colonIndex);
                const rateId = selectedRateId.substring(colonIndex + 1); // Everything after first colon
                const selectedRate = allShippingRates.find(rate =>
                    rate.rate_id === rateId && String(rate.package_id || 0) === String(packageId)
                );
                if (selectedRate) {
                    await selectShippingRate(rateId, selectedRate.package_id || 0);
                }

                // Step 3: Create order with synced cart data
                // Format data according to /api/orders expectations
                const orderPayload = {
                    // Billing info at root level
                    billing_email: data.billing_email,
                    billing_first_name: data.billing_first_name,
                    billing_last_name: data.billing_last_name,
                    billing_company: data.billing_company || '',
                    billing_address_1: data.billing_address_1,
                    billing_city: data.billing_city,
                    billing_state: data.billing_state || '',
                    billing_postcode: data.billing_postcode,
                    billing_country: data.billing_country,
                    billing_phone: data.billing_phone || '',
                    // Shipping info
                    shipping_first_name: shippingAddress ? data.shipping_first_name : data.billing_first_name,
                    shipping_last_name: shippingAddress ? data.shipping_last_name : data.billing_last_name,
                    shipping_company: shippingAddress ? (data.shipping_company || '') : (data.billing_company || ''),
                    shipping_address_1: shippingAddress ? data.shipping_address_1 : data.billing_address_1,
                    shipping_city: shippingAddress ? data.shipping_city : data.billing_city,
                    shipping_state: shippingAddress ? (data.shipping_state || '') : (data.billing_state || ''),
                    shipping_postcode: shippingAddress ? data.shipping_postcode : data.billing_postcode,
                    shipping_country: shippingAddress ? (data.shipping_country || data.billing_country) : data.billing_country,
                    // Payment
                    payment_method: 'bacs',
                    payment_method_title: 'Virement bancaire',
                    // Line items
                    line_items: cart.items.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity,
                        variation_id: item.variation_id || 0
                    })),
                    // Shipping lines
                    shipping_lines: selectedRate ? [{
                        method_id: selectedRate.method_id,
                        method_title: selectedRate.name,
                        total: (parseFloat(selectedRate.price || 0) / 100).toString()
                    }] : [],
                    // Order notes
                    order_comments: data.order_comments || '',
                    // Survey - use survey_other if "other" is selected
                    survey: data.survey === "other" && data.survey_other ? data.survey_other : data.survey || '',
                    survey_other: data.survey_other || ''
                };

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(orderPayload)
                });

                const result = await response.json();

                if (response.ok && result.orderId) {
                    // Clear form data and cart BEFORE redirect
                    clearSavedFormData();
                    handleClearCart();
                    // Keep overlay visible during redirect
                    // Use replace to prevent back navigation to checkout
                    router.replace(`/order-success?order_id=${result.orderId}`);
                    // Don't set isSubmitting or orderProcessing to false - let the redirect happen
                    return;
                } else {
                    setOrderProcessing(false);
                    alert(`${t("orderCreationError")} : ${result.error || t("unknownError")}`);
                }
            } catch (error) {
                console.error('Error creating order:', error);
                setOrderProcessing(false);
                alert(t("orderCreationErrorRetry"));
            } finally {
                setIsSubmitting(false);
            }
        }
    };



    // Show empty cart message if cart is empty or loading
    // BUT NOT when order is being processed (to avoid flash during redirect)
    if (!orderProcessing && (isCartEmpty || !cart || !cart.items || cart.items.length === 0)) {
        return (
            <>
                {notification && (
                    <Notification
                        message={notification.message || notification}
                        type={notification.type || "info"}
                        onClose={() => setNotification(null)}
                        duration={6000}
                    />
                )}
                <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4'>
                    <div className='max-w-2xl w-full'>
                        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
                            {/* Icon Section */}
                            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-12 text-center'>
                                <div className='inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-6'>
                                    <ShoppingCart className='w-12 h-12 text-gray-400' />
                                </div>
                                <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-3'>
                                    {t("emptyCart")}
                                </h2>
                                <p className='text-lg text-gray-600 max-w-md mx-auto'>
                                    {t("emptyCartMessage")}
                                </p>
                            </div>

                            {/* Action Section */}
                            <div className='p-8 text-center bg-gray-50'>
                                <Link
                                    href="/product-category/foiling/wing-foil"
                                    className='
                                        inline-flex items-center justify-center gap-3
                                        bg-[#1D98FF] text-white font-semibold
                                        px-8 py-4 rounded-xl
                                        hover:bg-[#1585e0] active:scale-[0.98]
                                        shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                                        transition-all duration-200
                                        text-base uppercase tracking-wide
                                    '
                                >
                                    {t("backToShop")}
                                    <ArrowRight className='w-5 h-5' />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="bg-white">
            {/* Full-screen overlay during order processing */}
            {orderProcessing && (
                <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-6">
                        {/* Spinner */}
                        <div className="w-16 h-16 border-4 border-[#1D98FF] border-t-transparent rounded-full animate-spin"></div>
                        {/* Message */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-[#111] mb-2">
                                {t("processingOrder") || "Traitement de votre commande..."}
                            </h2>
                            <p className="text-gray-600">
                                {t("pleaseWait") || "Veuillez patienter, ne fermez pas cette page."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <Notification
                    message={notification.message || notification}
                    type={notification.type || "info"}
                    onClose={() => setNotification(null)}
                    duration={6000}
                />
            )}

            {/* Main Checkout Container */}
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='flex flex-col lg:flex-row items-start gap-8'>
                    {/* Left Side - Forms */}
                    <div className='w-full lg:flex-[2] space-y-6'>
                        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>

                            {/* Billing Details */}
                            <BillingDetails
                                register={register}
                                watchFields={watchFields}
                                errors={errors}
                                getFieldError={getFieldError}
                                countryDetails={countryDetails}
                                states={states}
                                countriesList={countriesList}
                                t={t}
                                control={control}
                            />

                            {/* Shipping Details */}
                            <ShippingDetails
                                register={register}
                                watchFields={watchFields}
                                errors={errors}
                                getFieldError={getFieldError}
                                setValue={setValue}
                                shippingAddress={shippingAddress}
                                handleShow={handleShow}
                                shippingCountryDetails={shippingCountryDetails}
                                countryDetails={countryDetails}
                                countriesList={countriesList}
                                t={t}
                            />

                            {/* Shipping Methods */}
                            <ShippingMethods
                                allShippingRates={allShippingRates}
                                selectedRateId={selectedRateId}
                                handleSelectRate={handleSelectRate}
                                shippingLoading={shippingLoading}
                                updatingShipping={updatingShipping}
                                watchFields={watchFields}
                                cart={cart}
                                t={t}
                            />

                            {/* Payment Methods */}
                            <PaymentMethods
                                register={register}
                                watchFields={watchFields}
                                setValue={setValue}
                                getValues={getValues}
                                control={control}
                                filteredPaymentMethods={filteredPaymentMethods}
                                getPaymentMethodTranslation={getPaymentMethodTranslation}
                                cart={cart}
                                items={items}
                                isPayPalDisabled={isPayPalDisabled}
                                allShippingRates={allShippingRates}
                                selectedRateId={selectedRateId}
                                clearSavedFormData={clearSavedFormData}
                                clearCart={clearCart}
                                router={router}
                                t={t}
                                PAYMENT_INSTRUCTIONS={PAYMENT_INSTRUCTIONS}
                                setOrderProcessing={setOrderProcessing}
                                syncCartToAPI={syncCartToAPI}
                            />
                        </form>
                    </div>

                    {/* Right Side - Order Summary (Desktop) */}
                    <OrderSummary
                        cart={cart}
                        items={items}
                        allShippingRates={allShippingRates}
                        selectedRateId={selectedRateId}
                        watchFields={watchFields}
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        isPlaceOrderDisabled={isPlaceOrderDisabled}
                        onSubmit={handleSubmit(onSubmit)}
                        control={control}
                        t={t}
                        currencySymbol={currencySymbol}
                        sousTotal={sousTotal}
                        cartTotal={cartTotal}
                        totalTax={totalTax}
                        updatingTaxes={updatingTaxes}
                        isEuropeLocation={isEuropeLocation}
                        appliedCoupons={appliedCoupons}
                        couponDiscount={couponDiscount}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        couponLoading={couponLoading}
                        couponError={couponError}
                        couponSuccess={couponSuccess}
                        handleApplyCoupon={handleApplyCoupon}
                        handleRemoveCoupon={handleRemoveCoupon}
                    />
                </div>

                {/* Mobile Sticky Summary */}
                <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 animate-slideUp'>
                    <div className='flex items-center justify-between mb-3'>
                        <div>
                            <span className='text-sm text-gray-500'>{t("total")}</span>
                            {/* Europe: Show "including VAT" info */}
                            {isEuropeLocation && (parseFloat(totalTax || 0) > 0 || updatingTaxes) && (
                                <span className='text-xs text-gray-400 ml-2'>
                                    ({t("includingVAT")}{' '}
                                    {updatingTaxes ? (
                                        <span className="animate-pulse">...</span>
                                    ) : (
                                        `${totalTax ? parseFloat(totalTax).toFixed(2) : '0.00'}${currencySymbol}`
                                    )}{' '}
                                    {t("VAT")})
                                </span>
                            )}
                            {/* North America: Show state tax info */}
                            {!isEuropeLocation && parseFloat(totalTax || 0) > 0 && (() => {
                                const country = watchFields.shipping_country || watchFields.billing_country || '';
                                const state = watchFields.shipping_state || watchFields.billing_state || '';
                                const stateInfo = (country === 'US' || country === 'CA') && state ? ` ${state}` : '';
                                return (
                                    <span className='text-xs text-gray-400 ml-2'>
                                        ({t("includesTax") || "includes tax"}{stateInfo ? `:${stateInfo}` : ''})
                                    </span>
                                );
                            })()}
                        </div>
                        <span className='text-xl font-bold text-[#111]'>{cartTotal ? cartTotal.toFixed(2) : '0.00'}{currencySymbol}</span>
                    </div>
                    {items && items.length > 0 ? (
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting || isPlaceOrderDisabled}
                            className='
                                w-full py-3 bg-[#1D98FF] text-white font-semibold rounded-lg
                                flex items-center justify-center gap-2
                                shadow-lg shadow-blue-500/25
                                active:scale-[0.98] transition-all duration-200
                                hover:bg-[#1585e0]
                                disabled:opacity-50 disabled:cursor-not-allowed
                            '
                        >
                            <CreditCard className='w-5 h-5' />
                            {isSubmitting ? t("processing") : t("placeOrder")}
                        </button>
                    ) : (
                        <div
                            className='
                                w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg
                                flex items-center justify-center gap-2
                                cursor-not-allowed
                            '
                        >
                            <CreditCard className='w-5 h-5' />
                            {t("placeOrder")}
                        </div>
                    )}
                </div>
            </div>
            {/* Spacer for mobile sticky */}
            <div className='lg:hidden h-28' />
        </div>
    )
}

// Main page component with client-side only rendering
const Page = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only render the content after component is mounted (client-side)
    if (!isMounted) {
        return null; // or a loading spinner
    }

    return <CheckoutPageContent />;
}

export default Page;
