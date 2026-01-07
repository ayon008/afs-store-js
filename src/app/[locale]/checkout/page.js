/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useCart from "@/Shared/Hooks/useCart";
import { clearCart, getPaymentMethods, getCountryDetails } from "@/app/actions/Woo-Coommerce/getWooCommerce";
import { selectShippingRate } from "@/app/actions/Woo-Coommerce/Shop/Cart/cart";
import { countriesList } from "@/lib/countriesList";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Notification from "@/Shared/Notification/Notification";
import BillingDetails from "./components/BillingDetails";
import ShippingDetails from "./components/ShippingDetails";
import PaymentMethods from "./components/PaymentMethods";
import OrderSummary from "./components/OrderSummary";
import { CreditCard } from "lucide-react";

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
    const { cart, loadCart, handleClearCart } = useCart();

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
        formState: { errors }
    } = useForm({
        mode: 'onTouched',
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

    useEffect(() => {
        // Build form values object, merging both billing and shipping addresses
        const formValues = {};
        
        // Add billing address if available
        if (cartBillingAddress) {
            formValues.billing_first_name = cartBillingAddress.first_name || '';
            formValues.billing_last_name = cartBillingAddress.last_name || '';
            formValues.billing_company = cartBillingAddress.company || '';
            formValues.billing_country = cartBillingAddress.country || '';
            formValues.billing_address_1 = cartBillingAddress.address_1 || '';
            formValues.billing_city = cartBillingAddress.city || '';
            formValues.billing_state = cartBillingAddress.state || '';
            formValues.billing_postcode = cartBillingAddress.postcode || '';
            formValues.billing_phone = cartBillingAddress.phone || '';
            formValues.billing_email = cartBillingAddress.email || '';
        }
        
        // Initialize shipping address with billing address by default
        // Only use cart shipping address if it's different from billing
        if (cartBillingAddress) {
            formValues.shipping_first_name = cartShippingAddress?.first_name || cartBillingAddress.first_name || '';
            formValues.shipping_last_name = cartShippingAddress?.last_name || cartBillingAddress.last_name || '';
            formValues.shipping_company = cartShippingAddress?.company || cartBillingAddress.company || '';
            formValues.shipping_country = cartShippingAddress?.country || cartBillingAddress.country || '';
            formValues.shipping_address_1 = cartShippingAddress?.address_1 || cartBillingAddress.address_1 || '';
            formValues.shipping_city = cartShippingAddress?.city || cartBillingAddress.city || '';
            formValues.shipping_state = cartShippingAddress?.state || cartBillingAddress.state || '';
            formValues.shipping_postcode = cartShippingAddress?.postcode || cartBillingAddress.postcode || '';
        }
        
        // Only reset if we have at least one address
        if (Object.keys(formValues).length > 0) {
            reset(formValues);
        }
    }, [reset, cartShippingAddress, cartBillingAddress, trigger]);


    const watchFields = watch();

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
    const lastUpdateRef = React.useRef({ country: '', postcode: '', city: '', address: '' });
    const isUpdatingRef = React.useRef(false);

    // Update billing address in cart when billing fields change (to calculate shipping methods)
    const updateBillingAddress = useCallback(async (billingData) => {
        // Update if we have at least the country (minimum requirement for shipping calculation)
        // WooCommerce can sometimes calculate shipping with just country, but ideally we need more fields
        if (billingData.billing_country) {
            // Check if we're already updating or if nothing has changed
            const currentKey = `${billingData.billing_country}-${billingData.billing_postcode}-${billingData.billing_city}-${billingData.billing_address_1}`;
            if (isUpdatingRef.current || lastUpdateRef.current.key === currentKey) {
                return;
            }

            try {
                isUpdatingRef.current = true;
                lastUpdateRef.current.key = currentKey;
                setUpdatingShipping(true);
                
                // Use API route for guest users, or server action for authenticated users
                const response = await fetch('/api/cart/update-billing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        billing_address: {
                            first_name: billingData.billing_first_name || '',
                            last_name: billingData.billing_last_name || '',
                            company: billingData.billing_company || '',
                            address_1: billingData.billing_address_1 || '',
                            address_2: '',
                            city: billingData.billing_city || '',
                            state: billingData.billing_state || '',
                            postcode: billingData.billing_postcode?.trim() || '',
                            country: billingData.billing_country || '',
                            email: billingData.billing_email || '',
                            phone: billingData.billing_phone || '',
                        }
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    
                    // Check if shipping rates are already in the response
                    const hasShippingRatesInResponse = result.data?.shipping_rates?.some(
                        pkg => pkg.shipping_rates && Array.isArray(pkg.shipping_rates) && pkg.shipping_rates.length > 0
                    );
                    
                    // Only reload cart once, with a single delay if needed
                    if (hasShippingRatesInResponse || result.hasShippingRates) {
                        await loadCart();
                    } else {
                        // Wait for WooCommerce to calculate shipping rates (single wait)
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        await loadCart();
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Failed to update billing address:', errorText);
                }
            } catch (error) {
                console.error('Error updating billing address:', error);
            } finally {
                setUpdatingShipping(false);
                isUpdatingRef.current = false;
            }
        }
    }, [loadCart]);

    // Debounced update of billing address - trigger on country change or when address is complete
    useEffect(() => {
        // Skip if already updating
        if (isUpdatingRef.current) {
            return;
        }

        const timer = setTimeout(() => {
            // Update if country is set (minimum requirement)
            // This allows WooCommerce to at least try to calculate shipping rates
            if (watchFields.billing_country) {
                const currentKey = `${watchFields.billing_country}-${watchFields.billing_postcode}-${watchFields.billing_city}-${watchFields.billing_address_1}`;
                
                // Only update if something actually changed
                if (lastUpdateRef.current.key !== currentKey) {
                    updateBillingAddress(watchFields);
                }
            }
        }, 1000); // Wait 1 second after user stops typing

        return () => clearTimeout(timer);
    }, [
        watchFields.billing_country,
        watchFields.billing_postcode,
        watchFields.billing_city,
        watchFields.billing_address_1,
        watchFields.billing_first_name,
        watchFields.billing_last_name,
        watchFields.billing_email,
        updateBillingAddress
    ]);

    const states = countryDetails?.states || [];

    const cartTotal = parseFloat(cart?.totals?.total_price || 0) / 100;
    const sousTotal = (cart?.items?.reduce(
        (acc, item) =>
            acc +
            Number(item.totals?.line_subtotal || 0) +
            Number(item.totals?.line_subtotal_tax || 0),
        0
    ) || 0) / 100;

    const [shippingLoading, setShippingLoading] = useState(false);
    const [updatingShipping, setUpdatingShipping] = useState(false);
    const [selectedRateId, setSelectedRateId] = useState(null);
    const [notification, setNotification] = useState(null);

    // Extract shipping rates from cart - optimized, no logs
    const allShippingRates = React.useMemo(() => {
        if (!cart?.shipping_rates) {
            return [];
        }
        
        // Handle array of packages
        if (Array.isArray(cart.shipping_rates)) {
            return cart.shipping_rates.flatMap((pkg, pkgIndex) => {
                if (pkg.shipping_rates && Array.isArray(pkg.shipping_rates)) {
                    return pkg.shipping_rates.map(rate => ({
                        ...rate,
                        package_id: pkg.package_id || pkgIndex
                    }));
                }
                if (Array.isArray(pkg) && pkg.length > 0) {
                    return pkg.map(rate => ({
                        ...rate,
                        package_id: pkgIndex
                    }));
                }
                return [];
            });
        }
        
        // Handle object structure
        if (typeof cart.shipping_rates === 'object') {
            return Object.values(cart.shipping_rates).flatMap((pkg, pkgIndex) => {
                if (pkg?.shipping_rates && Array.isArray(pkg.shipping_rates)) {
                    return pkg.shipping_rates.map(rate => ({
                        ...rate,
                        package_id: pkg.package_id || pkgIndex
                    }));
                }
                return [];
            });
        }
        
        return [];
    }, [cart?.shipping_rates]);

    // Ref to track user's manual selection (local state takes priority)
    const userSelectedRateRef = React.useRef(null);
    // Ref to store pending sync info (rateId and packageId to sync)
    const pendingSyncRef = React.useRef(null);
    // Ref to store debounce timer
    const syncTimerRef = React.useRef(null);

    useEffect(() => {
        // If user has manually selected a rate, prioritize that over cart state
        if (userSelectedRateRef.current) {
            const userSelected = allShippingRates.find(rate => rate.rate_id === userSelectedRateRef.current);
            if (userSelected) {
                // User selection exists in available rates, keep it
                if (selectedRateId !== userSelectedRateRef.current) {
                    setSelectedRateId(userSelectedRateRef.current);
                    setValue('shipping_method', userSelectedRateRef.current);
                }
                return;
            } else {
                // User selection no longer available, clear it
                userSelectedRateRef.current = null;
            }
        }

        // Only auto-update from cart if no user selection
        const selected = allShippingRates.find(rate => rate.selected);
        if (selected && selected.rate_id !== selectedRateId) {
            setSelectedRateId(selected.rate_id);
            setValue('shipping_method', selected.rate_id);
        } else if (!selected && allShippingRates.length > 0 && !selectedRateId && !userSelectedRateRef.current) {
            // Auto-select first rate if none selected (only on initial load)
            const firstRate = allShippingRates[0];
            if (firstRate) {
                setSelectedRateId(firstRate.rate_id);
                setValue('shipping_method', firstRate.rate_id);
            }
        }
    }, [allShippingRates, selectedRateId, setValue]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
            }
        };
    }, []);

    // Check if PayPal button should be disabled
    const isPayPalDisabled = useMemo(() => {
        // Helper function to check if a field is empty
        const isEmpty = (value) => {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string' && value.trim() === '') return true;
            return false;
        };

        // Check if terms are not accepted
        if (!watchFields.terms) {
            return true;
        }

        // Check required billing fields
        const requiredFields = {
            billing_first_name: watchFields.billing_first_name,
            billing_last_name: watchFields.billing_last_name,
            billing_country: watchFields.billing_country,
            billing_address_1: watchFields.billing_address_1,
            billing_city: watchFields.billing_city,
            billing_postcode: watchFields.billing_postcode,
            billing_email: watchFields.billing_email,
            survey: watchFields.survey
        };

        for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
            if (isEmpty(fieldValue)) {
                return true;
            }
        }

        // Validate email format
        if (watchFields.billing_email) {
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(watchFields.billing_email.trim())) {
                return true;
            }
        }

        // Check if "Autre" is selected but survey_other is empty
        if (watchFields.survey === t("surveyOptions.other")) {
            if (isEmpty(watchFields.survey_other)) {
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
                    return true;
                }
            }
        }

        // Check if shipping method is selected (only if shipping rates are available)
        if (allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0) {
            if (!selectedRateId) {
                return true;
            }
        }

        return false;
    }, [
        watchFields.terms,
        watchFields.billing_first_name,
        watchFields.billing_last_name,
        watchFields.billing_country,
        watchFields.billing_address_1,
        watchFields.billing_city,
        watchFields.billing_postcode,
        watchFields.billing_email,
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
        selectedRateId
    ]);

    // Ref to prevent multiple simultaneous syncs
    const isSyncingShippingRef = React.useRef(false);
    
    // Function to sync shipping rate with server (silent, no loading state)
    const syncShippingRateToServer = async (rateId, packageId, showLoading = false) => {
        if (!rateId || !packageId) return;
        
        // Prevent multiple simultaneous syncs
        if (isSyncingShippingRef.current) {
            return;
        }
        
        isSyncingShippingRef.current = true;
        
        if (showLoading) {
            setShippingLoading(true);
        }
        
        try {
            const result = await selectShippingRate(rateId, packageId);
            if (result.success) {
                // Reload cart once (no setTimeout, direct call)
                await loadCart();
            }
        } catch (error) {
            console.error('Error syncing shipping rate:', error);
        } finally {
            if (showLoading) {
                setShippingLoading(false);
            }
            isSyncingShippingRef.current = false;
        }
    };

    const handleSelectRate = (value) => {
        const [packageId, rateId] = value.split(':');
        if (rateId === selectedRateId) {
            return;
        }
        
        // Update local state immediately (purely local - no server call, no loading state)
        userSelectedRateRef.current = rateId;
        setSelectedRateId(rateId);
        setValue('shipping_method', rateId);
        
        // Store pending sync info for later (only sync before form submission)
        pendingSyncRef.current = { rateId, packageId };
        
        // Clear any existing timer (no automatic sync)
        if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
            syncTimerRef.current = null;
        }
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
                        // Show notification
                        setNotification(tCommon("cartClearedLanguage"));
                        // Reload cart to update state
                        await loadCart();
                    }
                } catch (error) {
                    console.error('Error clearing cart on locale change:', error);
                    setNotification(tCommon("cartClearedLanguage")); // Show notification anyway
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

        // Sync shipping method to server before submission if there's a pending sync
        if (pendingSyncRef.current || (selectedRateId && userSelectedRateRef.current === selectedRateId)) {
            // Clear any pending timer
            if (syncTimerRef.current) {
                clearTimeout(syncTimerRef.current);
                syncTimerRef.current = null;
            }
            
            // Find packageId for the selected rate
            const selectedRate = allShippingRates.find(rate => rate.rate_id === selectedRateId);
            if (selectedRate && selectedRate.package_id) {
                // Sync immediately before submission (with loading state only here)
                await syncShippingRateToServer(selectedRateId, selectedRate.package_id, true);
                pendingSyncRef.current = null;
            } else if (pendingSyncRef.current) {
                // Use pending sync info if available
                await syncShippingRateToServer(
                    pendingSyncRef.current.rateId,
                    pendingSyncRef.current.packageId,
                    true
                );
                pendingSyncRef.current = null;
            }
        }

        // PayPal is handled directly by the CheckoutPayPal component
        // No need to handle it in onSubmit

        if (data.payment_method === 'bacs') {
            setIsSubmitting(true);
            try {
                const customerData = {
                    ...data,
                    billing: {
                        first_name: data.billing_first_name,
                        last_name: data.billing_last_name,
                        company: data.billing_company || '',
                        address_1: data.billing_address_1,
                        address_2: '',
                        city: data.billing_city,
                        state: data.billing_state || '',
                        postcode: data.billing_postcode,
                        country: data.billing_country,
                        email: data.billing_email,
                        phone: data.billing_phone || ''
                    },
                    // Use shipping address only if checkbox is checked, otherwise use billing address
                    shipping: shippingAddress ? {
                        first_name: data.shipping_first_name,
                        last_name: data.shipping_last_name,
                        company: data.shipping_company || '',
                        address_1: data.shipping_address_1,
                        address_2: '',
                        city: data.shipping_city,
                        state: data.shipping_state || '',
                        postcode: data.shipping_postcode,
                        country: data.shipping_country || data.billing_country
                    } : {
                        // Use billing address as shipping address by default
                        first_name: data.billing_first_name,
                        last_name: data.billing_last_name,
                        company: data.billing_company || '',
                        address_1: data.billing_address_1,
                        address_2: '',
                        city: data.billing_city,
                        state: data.billing_state || '',
                        postcode: data.billing_postcode,
                        country: data.billing_country
                    }
                };

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cartData: {
                            totals: cart.totals,
                            lineItems: items.map(item => ({
                                product_id: item.id,
                                quantity: item.quantity,
                                variation_id: item.variation_id || 0
                            })),
                            shippingLines: cart.shipping_rates?.[0]?.shipping_rates
                                ?.filter(rate => rate.selected)
                                .map(rate => ({
                                    method_id: rate.method_id,
                                    method_title: rate.name,
                                    total: (rate.price / 100).toString()
                                })) || []
                        },
                        customerData,
                        paymentMethod: 'bacs'
                    })
                });

                const result = await response.json();

                if (response.ok && result.orderId) {
                    clearSavedFormData();
                    clearCart();
                    router.push(`/order-success?order_id=${result.orderId}`);
                } else {
                    alert(`${t("orderCreationError")} : ${result.error || t("unknownError")}`);
                }
            } catch (error) {
                console.error('Error creating order:', error);
                alert(t("orderCreationErrorRetry"));
            } finally {
                setIsSubmitting(false);
            }
        }
    };



    // Show empty cart message if cart is empty or loading
    if (isCartEmpty || !cart || !cart.items || cart.items.length === 0) {
        return (
            <>
                {notification && (
                    <Notification
                        message={notification}
                        type="info"
                        onClose={() => setNotification(null)}
                        duration={5000}
                    />
                )}
                <div className='global-padding global-margin'>
                <div className='max-w-[800px] mx-auto py-[80px] lg:py-[100px]'>
                    <div className='bg-[#F7F7F7] p-8 lg:p-12 text-center rounded-sm border border-[#ddd]'>
                        <h2 className='text-2xl lg:text-3xl font-bold text-[#111] mb-4'>{t("emptyCart")}</h2>
                        <p className='text-lg text-gray-600 mb-8'>{t("emptyCartMessage")}</p>
                        <Link 
                            href="/" 
                            className='inline-block text-white bg-[#1D98FF] rounded-sm px-[50px] uppercase py-[18px] font-semibold hover:bg-[#1a7acc] transition-colors'
                        >
                            {t("backToShop")}
                        </Link>
                    </div>
                </div>
            </div>
            </>
        );
    }

    const currencySymbol = cart?.totals?.currency_symbol || '€';
    const totalTax = Number(cart?.totals?.total_tax) / 100 || 0;

    return (
        <div className="bg-white">
            {/* Notification */}
            {notification && (
                <Notification
                    message={notification}
                    type="info"
                    onClose={() => setNotification(null)}
                    duration={5000}
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

                            {/* Payment Methods */}
                            <PaymentMethods
                                register={register}
                                watchFields={watchFields}
                                setValue={setValue}
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
                            />
                        </form>
                    </div>

                    {/* Right Side - Order Summary (Desktop) */}
                    <OrderSummary
                        cart={cart}
                        items={items}
                        allShippingRates={allShippingRates}
                        selectedRateId={selectedRateId}
                        handleSelectRate={handleSelectRate}
                        shippingLoading={shippingLoading}
                        updatingShipping={updatingShipping}
                        watchFields={watchFields}
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmit(onSubmit)}
                        t={t}
                        currencySymbol={currencySymbol}
                        sousTotal={sousTotal}
                        cartTotal={cartTotal}
                        totalTax={totalTax}
                    />
                </div>

                {/* Mobile Sticky Summary */}
                <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 animate-slideUp'>
                    <div className='flex items-center justify-between mb-3'>
                        <div>
                            <span className='text-sm text-gray-500'>{t("total")}</span>
                            {parseFloat(totalTax || 0) > 0 && (
                                <span className='text-xs text-gray-400 ml-2'>
                                    ({t("includingVAT")} {totalTax ? parseFloat(totalTax).toFixed(2) : '0.00'}{currencySymbol} {t("VAT")})
                                </span>
                            )}
                        </div>
                        <span className='text-xl font-bold text-[#111]'>{cartTotal ? cartTotal.toFixed(2) : '0.00'}{currencySymbol}</span>
                    </div>
                    {items && items.length > 0 ? (
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting || !watchFields.terms}
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
