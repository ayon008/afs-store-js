/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useCart from "@/Shared/Hooks/useCart";
import CountrySelect from "@/Shared/Input/DropDown";
import Input from "@/Shared/Input/Input";
import Select from "@/Shared/Input/Select";
import { clearCart, getPaymentMethods, getCountryDetails } from "@/app/actions/Woo-Coommerce/getWooCommerce";
import { selectShippingRate, updateBillingAndCart } from "@/app/actions/Woo-Coommerce/Shop/Cart/cart";
import CheckoutMonetico from "@/lib/CheckoutMonitico";
import CheckoutPayPal from "@/lib/CheckoutPaypal";
import CheckoutAuthorize from "@/lib/CheckoutAuthorize";
import { countriesList } from "@/lib/countriesList";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Notification from "@/Shared/Notification/Notification";
import ProgressStepper from "@/Shared/Stepper/ProgressStepper";
import PaymentMethodCard from "@/Shared/Payment/PaymentMethodCard";
import { User, MapPin, CreditCard, Package } from "lucide-react";

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

    // Filter payment methods to show only allowed ones
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

        // Check if currency is USD and locale is EN
        const currencySymbol = cart?.totals?.currency_symbol || '';
        const currencyCode = cart?.totals?.currency_code || '';
        const isUSD = currencySymbol === '$' || 
                     currencySymbol === 'USD' ||
                     currencySymbol?.toUpperCase() === 'USD' ||
                     currencyCode?.toUpperCase() === 'USD';
        const isEUR = currencySymbol === '€' || 
                     currencySymbol === 'EUR' ||
                     currencySymbol?.toUpperCase() === 'EUR' ||
                     currencyCode?.toUpperCase() === 'EUR';
        const isEN = locale === 'en';

        // Debug logging
        console.log('Payment method filter - Currency:', currencySymbol, 'Currency Code:', currencyCode, 'Locale:', locale, 'isUSD:', isUSD, 'isEUR:', isEUR, 'isEN:', isEN);

        // If locale is EN AND currency is USD (not EUR), show only authnet (Authorize.Net) payment method
        if (isEN && isUSD && !isEUR) {
            console.log('EN locale and USD currency detected: Filtering for authnet (Authorize.Net) payment method only');
            const authorizeMethods = methods.filter(method => {
                // Ensure method is an object
                if (!method || typeof method !== 'object') return false;
                
                const methodId = method.id?.toLowerCase() || '';
                const methodTitle = method.title?.toLowerCase() || '';
                
                // Return only methods that contain "authnet" in ID (Authorize.Net gateway)
                // or "authorize" in ID/title as fallback
                const isAuthorize = methodId === 'authnet' || 
                                   methodId.includes('authnet') ||
                                   methodId.includes('authorize') || 
                                   methodTitle.includes('authorize');
                
                if (isAuthorize) {
                    console.log(`Authorize method found - ID: ${method.id}, Title: ${method.title}`);
                }
                
                return isAuthorize;
            });
            console.log('Authorize methods found:', authorizeMethods.length, authorizeMethods.map(m => ({ id: m.id, title: m.title })));
            
            // Only return authorize methods if we found any, otherwise return empty array
            if (authorizeMethods.length > 0) {
                return authorizeMethods;
            }
        }

        // Otherwise, use the existing filter logic
        return methods.filter(method => {
            // Ensure method is an object
            if (!method || typeof method !== 'object') return false;
            
            const methodId = method.id?.toLowerCase() || '';
            const methodTitle = method.title?.toLowerCase() || '';

            // Exclude Credit Card
            if (methodId === 'credit-card' || methodTitle.includes('credit card')) {
                return false;
            }

            // Exclude Authorize.Net - should only show for EN locale with USD currency
            // If we reach here, it means we're not in EN+USD scenario, so exclude Authorize
            if (methodId === 'authnet' || 
                methodId.includes('authnet') ||
                methodId.includes('authorize') || 
                methodTitle.includes('authorize')) {
                return false;
            }

            // Include PayPal
            if (methodId === 'paypal' || methodId === 'ppcp-gateway' || methodTitle.includes('paypal')) {
                return true;
            }

            // Include all Monetico variants (Carte Bancaire, Carte bancaire en 2 fois, etc.)
            if (methodId.includes('monetico') ||
                methodTitle.includes('carte bancaire') ||
                methodTitle.includes('monetico')) {
                return true;
            }

            // Include Bank Transfer (Virement bancaire)
            if (methodId === 'bacs' || methodTitle.includes('virement bancaire') || methodTitle.includes('virement')) {
                return true;
            }

            return false;
        });
    };

    const filteredPaymentMethods = filterPaymentMethods(paymentMethods);
    
    // Debug: Log filtered payment methods
    useEffect(() => {
        console.log('Filtered payment methods:', filteredPaymentMethods);
        console.log('Cart currency:', cart?.totals?.currency_symbol);
        console.log('Locale:', locale);
    }, [filteredPaymentMethods, cart?.totals?.currency_symbol, locale]);

    // Function to get translated payment method title and description
    const getPaymentMethodTranslation = (method) => {
        const methodId = method.id?.toLowerCase() || '';
        const methodTitle = method.title?.toLowerCase() || '';
        
        // Check for Authorize
        if (methodId.includes('authorize') || methodTitle.includes('authorize')) {
            return {
                title: method.title || 'Authorize.Net',
                description: t("paymentMethods.cardDescription") || 'Pay securely with your credit card'
            };
        }
        
        // Check for PayPal
        if (methodId === 'paypal' || methodId === 'ppcp-gateway' || methodTitle.includes('paypal')) {
            return {
                title: t("paymentMethods.paypal"),
                description: t("paymentMethods.paypalDescription")
            };
        }
        
        // Check for Monetico/Carte Bancaire
        if (methodId.includes('monetico') || methodTitle.includes('carte bancaire')) {
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
                // Debug: Log all payment methods to identify authorize ID
                console.log('All payment methods received:', data);
                if (Array.isArray(data)) {
                    data.forEach(method => {
                        console.log(`Payment method - ID: ${method.id}, Title: ${method.title}, Enabled: ${method.enabled}`);
                    });
                    setPaymentMethods(data);
                } else if (data && typeof data === 'object') {
                    // If it's an object, try to convert to array
                    const methodsArray = Object.values(data);
                    if (Array.isArray(methodsArray)) {
                        methodsArray.forEach(method => {
                            console.log(`Payment method - ID: ${method.id}, Title: ${method.title}, Enabled: ${method.enabled}`);
                        });
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

    const cartTotal = parseFloat(cart?.totals?.total_price).toFixed(2) / 100;
    const sousTotal = cart?.items?.reduce(
        (acc, item) =>
            acc +
            Number(item.totals.line_subtotal) +
            Number(item.totals.line_subtotal_tax),
        0
    ) / 100;

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
                console.log(`PayPal disabled: ${fieldName} is empty`);
                return true;
            }
        }

        // Validate email format
        if (watchFields.billing_email) {
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(watchFields.billing_email.trim())) {
                console.log('PayPal disabled: invalid email format');
                return true;
            }
        }

        // Check if "Autre" is selected but survey_other is empty
        if (watchFields.survey === "Autre (veuillez préciser)") {
            if (isEmpty(watchFields.survey_other)) {
                console.log('PayPal disabled: survey_other is empty');
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
                    console.log(`PayPal disabled: ${fieldName} is empty`);
                    return true;
                }
            }
        }

        // Check if shipping method is selected (only if shipping rates are available)
        if (allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0) {
            if (!selectedRateId) {
                console.log('PayPal disabled: shipping method not selected');
                return true;
            }
        }

        console.log('PayPal enabled: all validations passed');
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
        console.log(data, 'formData');

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
                    alert(`Erreur lors de la création de la commande : ${result.error || 'Une erreur est survenue'}`);
                }
            } catch (error) {
                console.error('Error creating order:', error);
                alert('Erreur lors de la création de la commande. Veuillez réessayer.');
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

    return (
        <div>
            {/* Notification */}
            {notification && (
                <Notification
                    message={notification}
                    type="info"
                    onClose={() => setNotification(null)}
                    duration={5000}
                />
            )}
            
            {/* Progress Stepper */}
            <ProgressStepper
                currentStep={2}
                steps={[t("basket"), t("securePayment"), t("summary")]}
            />
            {/*  */}
            <div className='global-padding global-margin'>
                {/* checkout forms */}
                <form className='space-y-10' onSubmit={handleSubmit(onSubmit)}>

                    {/* 1st section */}
                    <div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
                        {/* Billing address */}
                        <div className='card-modern p-6 lg:p-8'>
                            <div className='flex items-center gap-3 mb-6'>
                                <div className='w-10 h-10 bg-[#1D98FF]/10 rounded-full flex items-center justify-center'>
                                    <User className='w-5 h-5 text-[#1D98FF]' />
                                </div>
                                <h3 className='text-xl lg:text-2xl font-bold text-[#111]'>{t("billingDetails")}</h3>
                            </div>
                            <div className='grid grid-cols-1 gap-5'>
                                <div className='grid grid-cols-2 gap-5'>
                                    <Input
                                        label={t("firstName")}
                                        type="text"
                                        id="billing_first_name"
                                        register={register("billing_first_name", { required: t("required") })}
                                        error={getFieldError("billing_first_name")}
                                        value={watchFields.billing_first_name}
                                        checkout={true}
                                    />
                                    <Input
                                        label={t("lastName")}
                                        type="text"
                                        id="billing_last_name"
                                        register={register("billing_last_name", { required: t("required") })}
                                        error={getFieldError("billing_last_name")}
                                        value={watchFields.billing_last_name}
                                        checkout={true}
                                    />
                                </div>
                                <Input
                                    label={t("company")}
                                    type="text"
                                    id="billing_company"
                                    register={register("billing_company", { required: false })}
                                    error={getFieldError("billing_company")}
                                    value={watchFields.billing_company}
                                    checkout={true}
                                />
                                <CountrySelect
                                    label={t("country")}
                                    id="country"
                                    defaultValue={watchFields.billing_country}
                                    register={register("billing_country", { required: t("required") })}
                                    checkout={true}
                                    countries={countriesList}
                                />
                                {getFieldError("billing_country") && (
                                    <p className="text-red-500 text-xs mt-1">{getFieldError("billing_country")}</p>
                                )}
                                <Input
                                    label={t("address")}
                                    type="text"
                                    id="billing_address_1"
                                    register={register("billing_address_1", { required: t("required") })}
                                    error={getFieldError("billing_address_1")}
                                    value={watchFields.billing_address_1}
                                    checkout={true}
                                />
                                <Input
                                    label={t("city")}
                                    type="text"
                                    id="billing_city"
                                    register={register("billing_city", { required: t("required") })}
                                    error={getFieldError("billing_city")}
                                    value={watchFields.billing_city}
                                    checkout={true}
                                />
                                {
                                    states.length > 0 && (
                                        <Select
                                            label={t("state")}
                                            id="billing_state"
                                            register={register("billing_state", { required: t("required") })}
                                            error={getFieldError("billing_state")}
                                            value={watchFields.billing_state}
                                            checkout={true}
                                            options={[...(states.map((state) => ({ value: state.code, label: state.name })))]}
                                        />
                                    )
                                }
                                <Input
                                    label={t("postcode")}
                                    type="text"
                                    id="billing_postcode"
                                    register={register("billing_postcode", { required: t("required") })}
                                    error={getFieldError("billing_postcode")}
                                    value={watchFields.billing_postcode}
                                    checkout={true}
                                />
                                <Input
                                    label={t("email")}
                                    type="email"
                                    id="billing_email"
                                    register={register("billing_email", {
                                        required: t("required"),
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: t("invalidEmail")
                                        }
                                    })}
                                    error={getFieldError("billing_email")}
                                    value={watchFields.billing_email}
                                    checkout={true}
                                />
                                <Input
                                    label={t("phone")}
                                    type="tel"
                                    id="billing_phone"
                                    register={register("billing_phone", { required: false })}
                                    error={getFieldError("billing_phone")}
                                    value={watchFields.billing_phone}
                                    checkout={true}
                                />
                                <Select
                                    checkout={true}
                                    label={t("survey")}
                                    id='survey'
                                    register={register("survey", { required: t("required") })}
                                    error={getFieldError("survey")}
                                    value={watchFields.survey}
                                    options={[
                                        { value: 'Recherche Google/Bing', label: t("surveyOptions.google") },
                                        { value: 'facebook', label: t("surveyOptions.facebook") },
                                        { value: 'instagram', label: t("surveyOptions.instagram") },
                                        { value: 'youtube', label: t("surveyOptions.youtube") },
                                        { value: 'Publicité Google (Google Ads)', label: t("surveyOptions.googleAds") },
                                        { value: "Recommandation d'un ami ou d'un membre de la famille", label: t("surveyOptions.recommendation") },
                                        { value: "Article de blog ou revue en ligne", label: t("surveyOptions.blog") },
                                        { value: "Lien direct (j'ai tapé l'adresse du site)", label: t("surveyOptions.direct") },
                                        { value: "Publicité Display/Bannière", label: t("surveyOptions.display") },
                                        { value: "Autre (veuillez préciser)", label: t("surveyOptions.other") },
                                    ]}
                                    placeholder={t("surveyPlaceholder")}
                                />
                                {watchFields.survey === "Autre (veuillez préciser)" && (
                                    <Input
                                        label={t("pleaseSpecify")}
                                        type="text"
                                        id="survey_other"
                                        register={register("survey_other", {
                                            required: t("pleaseSpecify")
                                        })}
                                        error={getFieldError("survey_other")}
                                        value={watchFields.survey_other}
                                        checkout={true}
                                    />
                                )}
                            </div>
                        </div>
                        {/* Shipping address */}
                        <div className='card-modern p-6 lg:p-8'>
                            <div className='flex items-center gap-3 mb-6'>
                                <div className='w-10 h-10 bg-[#1D98FF]/10 rounded-full flex items-center justify-center'>
                                    <MapPin className='w-5 h-5 text-[#1D98FF]' />
                                </div>
                                <label htmlFor='shipping_address' className='flex items-center gap-3 cursor-pointer'>
                                    <input
                                        onChange={handleShow}
                                        type="checkbox"
                                        id='shipping_address'
                                        checked={shippingAddress}
                                        className='w-5 h-5 rounded border-gray-300 text-[#1D98FF] focus:ring-[#1D98FF]'
                                    />
                                    <h3 className='text-xl lg:text-2xl font-bold text-[#111]'>{t("shippingDetails")}</h3>
                                </label>
                            </div>
                            {
                                shippingAddress && (
                                    <div className='grid grid-cols-1 gap-5'>
                                        <div className='grid grid-cols-2 gap-5'>
                                            {/*  */}
                                            <Input
                                                checkout={true}
                                                label={t("firstName")}
                                                type='text'
                                                id='shipping_first_name'
                                                register={register("shipping_first_name", { required: t("required") })}
                                                error={getFieldError("shipping_first_name")}
                                                value={watchFields.shipping_first_name}
                                            />

                                            <Input
                                                checkout={true}
                                                label={t("lastName")}
                                                type='text'
                                                id='shipping_last_name'
                                                register={register("shipping_last_name", { required: t("required") })}
                                                error={getFieldError("shipping_last_name")}
                                                value={watchFields.shipping_last_name}
                                            />
                                        </div>
                                        <Input
                                            checkout={true}
                                            label={t("company")}
                                            type='text'
                                            id='shipping_company'
                                            register={register("shipping_company", { required: false })}
                                            error={getFieldError("shipping_company")}
                                            value={watchFields.shipping_company}
                                        />
                                        <CountrySelect
                                            label={t("country")}
                                            id="shipping_country"
                                            defaultValue={watchFields.shipping_country || watchFields.billing_country || ''}
                                            register={register("shipping_country", { 
                                                required: t("required"),
                                                onChange: (e) => {
                                                    // If shipping country is empty, use billing country
                                                    if (!e.target.value && watchFields.billing_country) {
                                                        setValue('shipping_country', watchFields.billing_country);
                                                    }
                                                }
                                            })}
                                            checkout={true}
                                            countries={countriesList}
                                        />
                                        {getFieldError("shipping_country") && (
                                            <p className="text-red-500 text-xs mt-1">{getFieldError("shipping_country")}</p>
                                        )}
                                        <Input
                                            checkout={true}
                                            label={t("address")}
                                            type='text'
                                            id='shipping_address_1'
                                            register={register("shipping_address_1", { required: t("required") })}
                                            error={getFieldError("shipping_address_1")}
                                            value={watchFields.shipping_address_1}
                                        />
                                        <Input
                                            checkout={true}
                                            label={t("city")}
                                            type='text'
                                            id='shipping_city'
                                            register={register("shipping_city", { required: t("required") })}
                                            error={getFieldError("shipping_city")}
                                            value={watchFields.shipping_city}
                                        />
                                        {
                                            (shippingCountryDetails?.states || countryDetails?.states) && (shippingCountryDetails?.states || countryDetails?.states).length > 0 && (
                                                <Select
                                                    label={t("state")}
                                                    id="shipping_state"
                                                    register={register("shipping_state", { required: t("required") })}
                                                    error={getFieldError("shipping_state")}
                                                    value={watchFields.shipping_state}
                                                    checkout={true}
                                                    options={[...((shippingCountryDetails?.states || countryDetails?.states).map((state) => ({ value: state.code, label: state.name })))]}
                                                />
                                            )
                                        }
                                        <Input
                                            checkout={true}
                                            label={t("postcode")}
                                            type='text'
                                            id='shipping_postcode'
                                            register={register("shipping_postcode", { required: t("required") })}
                                            error={getFieldError("shipping_postcode")}
                                            value={watchFields.shipping_postcode}
                                        />

                                    </div>
                                )
                            }
                            <div className='relative'>
                                <label
                                    htmlFor='comments'
                                    className='bg-white absolute left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px] uppercase'
                                >
                                    {t("orderNotes")}
                                </label>
                                <textarea
                                    {...register("order_comments")}
                                    id='comments'
                                    className='border border-[#BFBFBF] rounded-[4px] w-full py-3 px-3 focus:outline-none text-lg leading-[23px] text-black font-semibold min-h-[120px] resize-y'
                                    placeholder={t("orderNotesPlaceholder")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2nd section */}
                    <div className=''>
                        <h3 className='lg:text-[28px] text-[22px] leading-[100%] font-semibold text-[#111] block mb-6'>{t("yourOrder")}</h3>
                        <table className='w-full border border-[#111]'>
                            <thead>
                                <tr className='border-b border-[#111]'>
                                    <th className='!px-3 py-2 text-left'>{t("product")}</th>
                                    <th className='!px-3 py-2 !border-l text-left border-[#111]'>{t("subtotal")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    items?.map((singleItem, i) => {
                                        const totalPrice = parseFloat(singleItem?.totals?.line_subtotal) / 100 + parseFloat(singleItem?.totals?.line_subtotal_tax) / 100;
                                        return (
                                            <tr key={singleItem.id || singleItem.key || i} className='border-b border-[#111]'>
                                                <td className='!px-3 py-2 text-left'>{singleItem?.name} x {singleItem?.quantity}</td>
                                                <td className='!px-3 py-2 !border-l text-left border-[#111]'>{totalPrice} {singleItem?.totals?.currency_symbol} (TTC)</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                            <tfoot>
                                <tr className='border-b border-[#111]'>
                                    <th className='!px-3 py-2 text-left'>{t("subtotal")}</th>
                                    <td className='!px-3 py-2 !border-l text-left border-[#111]'>{sousTotal} {cart?.totals?.currency_symbol} (TTC)</td>
                                </tr>
                                <tr className='border-b border-[#111]'>
                                    <th className='!px-3 py-2 text-left'>{t("shippingMethods")}</th>
                                    <td className={`!px-3 py-2 !border-l text-left border-[#111]`}>
                                        {(() => {
                                            // Check if we have at least the country (minimum requirement)
                                            const hasCountry = !!watchFields.billing_country;
                                            
                                            // Check if address is more complete (for better shipping calculation)
                                            const hasCompleteAddress = watchFields.billing_country && 
                                                                      watchFields.billing_postcode && 
                                                                      watchFields.billing_city && 
                                                                      watchFields.billing_address_1;
                                            
                                            // Debug: Log shipping rates availability
                                            // If updating shipping, show loading state
                                            if (updatingShipping || shippingLoading) {
                                                return (
                                                    <p className='text-sm text-gray-500 italic p-4 border border-[#ccc] rounded-sm bg-[#F9F9F9]'>
                                                        {t("processing")}
                                                    </p>
                                                );
                                            }
                                            
                                            // If no country selected, show message
                                            if (!hasCountry) {
                                                return (
                                                    <p className='text-sm text-gray-400 italic p-4 border border-[#ccc] rounded-sm bg-[#F9F9F9]'>
                                                        {t("shippingMethods")}
                                                    </p>
                                                );
                                            }
                                            
                                            // If address is not complete, show a message but still try to show rates if available
                                            if (!hasCompleteAddress) {
                                                // Still try to show rates if they exist (WooCommerce might have calculated with just country)
                                                if (allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0) {
                                                    // Don't show warning message if rates are available - just show the rates
                                                    return (
                                                        <div>
                                                            <ul className={`space-y-2 ${shippingLoading || updatingShipping ? 'opacity-50' : 'opacity-100'}`}>
                                                                {allShippingRates.map((rate, i) => {
                                                                    const totalPrice = (rate.price / 100 + rate.taxes / 100);
                                                                    const safeId = `shipping_rate_${String(rate.rate_id).replace(/[:]/g, '_')}`;
                                                                    return (
                                                                        <li key={`shipping-rate-${rate.rate_id}-${i}`} className='border border-[#ccc] rounded-sm p-[15px] flex items-center gap-3 flex-wrap justify-between hover:border-[#1D98FF] transition-colors'>
                                                                            <div className='flex items-center gap-3 flex-1 min-w-0'>
                                                                                <input
                                                                                    checked={selectedRateId === rate.rate_id}
                                                                                    value={`${rate.package_id}:${rate.rate_id}`}
                                                                                    onChange={(e) => handleSelectRate(e.target.value)}
                                                                                    type="radio"
                                                                                    name="shipping_method"
                                                                                    id={safeId}
                                                                                    disabled={shippingLoading || updatingShipping}
                                                                                    className="cursor-pointer"
                                                                                />
                                                                                <label htmlFor={safeId} className="break-normal max-w-full cursor-pointer font-medium">{rate.name}</label>
                                                                            </div>
                                                                            <div className='text-base text-[#111] font-semibold leading-[100%]'>
                                                                                {
                                                                                    totalPrice === 0 ? <span className='text-green-600'>{t("free")}</span> : `${totalPrice.toFixed(2)}${rate.currency_symbol || cart?.totals?.currency_symbol || '€'}`
                                                                                }
                                                                            </div>
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        </div>
                                                    );
                                                }
                                                // No rates and incomplete address
                                                const missingFields = [];
                                                if (!watchFields.billing_address_1) missingFields.push(t("address"));
                                                if (!watchFields.billing_city) missingFields.push(t("city"));
                                                if (!watchFields.billing_postcode) missingFields.push(t("postcode"));
                                                
                                                return (
                                                    <p className='text-sm text-gray-500 italic p-4 border border-[#ccc] rounded-sm bg-[#F9F9F9]'>
                                                        {missingFields.length > 0 
                                                            ? `${t("pleaseSpecify")} ${missingFields.join(", ")} ${locale === 'fr' ? "pour calculer les méthodes de livraison" : "to calculate shipping methods"}`
                                                            : t("noShippingMethods")
                                                        }
                                                    </p>
                                                );
                                            }
                                            
                                            // If address is complete and shipping methods are available
                                            if (allShippingRates && Array.isArray(allShippingRates) && allShippingRates.length > 0) {
                                                return (
                                                    <div>
                                                        <ul className={`space-y-2 ${shippingLoading || updatingShipping ? 'opacity-50' : 'opacity-100'}`}>
                                                            {allShippingRates.map((rate, i) => {
                                                                const totalPrice = (rate.price / 100 + rate.taxes / 100);
                                                                const safeId = `shipping_rate_${String(rate.rate_id).replace(/[:]/g, '_')}`;
                                                                return (
                                                                    <li key={`shipping-rate-${rate.rate_id}-${i}`} className='border border-[#ccc] rounded-sm p-[15px] flex items-center gap-3 flex-wrap justify-between hover:border-[#1D98FF] transition-colors'>
                                                                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                                                                            <input
                                                                                checked={selectedRateId === rate.rate_id}
                                                                                value={`${rate.package_id}:${rate.rate_id}`}
                                                                                onChange={(e) => handleSelectRate(e.target.value)}
                                                                                type="radio"
                                                                                name="shipping_method"
                                                                                id={safeId}
                                                                                disabled={shippingLoading || updatingShipping}
                                                                                className="cursor-pointer"
                                                                            />
                                                                            <label htmlFor={safeId} className="break-normal max-w-full cursor-pointer font-medium">{rate.name}</label>
                                                                        </div>
                                                                        <div className='text-base text-[#111] font-semibold leading-[100%]'>
                                                                            {
                                                                                totalPrice === 0 ? <span className='text-green-600'>{t("free")}</span> : `${totalPrice.toFixed(2)}${rate.currency_symbol || cart?.totals?.currency_symbol || '€'}`
                                                                            }
                                                                        </div>
                                                                    </li>
                                                                )
                                                            })}
                                                        </ul>
                                                    </div>
                                                );
                                            }
                                            
                                            // Address is complete but no shipping methods found
                                            return (
                                                <p className='text-sm text-gray-500 italic p-4 border border-[#ccc] rounded-sm bg-[#F9F9F9]'>
                                                    {t("noShippingMethods")}
                                                </p>
                                            );
                                        })()}
                                    </td>
                                </tr>
                                <tr>
                                    <th className='!px-3 py-2 text-left'>{t("total")}</th>
                                    <td className='!px-3 py-2 !border-l text-left border-[#111] flex items-center gap-1'>
                                        <span>
                                            <strong>{cartTotal}{cart?.totals?.currency_symbol}</strong>
                                        </span>
                                        <span>
                                            ({t("includingVAT")} <strong>{Number(cart?.totals?.total_tax).toFixed(2) / 100} {cart?.totals?.currency_symbol}</strong> {t("VAT")})
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* 3rd section - Payment Methods */}
                    <div className='card-modern overflow-hidden'>
                        <div className='p-6 border-b border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-[#1D98FF]/10 rounded-full flex items-center justify-center'>
                                    <CreditCard className='w-5 h-5 text-[#1D98FF]' />
                                </div>
                                <h3 className='text-xl lg:text-2xl font-bold text-[#111]'>{t("paymentMethod") || "Mode de paiement"}</h3>
                            </div>
                        </div>

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
                                        {isPayPal && (
                                            <div className="mt-2">
                                                <CheckoutPayPal
                                                    cartData={{
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
                                                    onSuccess={(details) => {
                                                        clearSavedFormData();
                                                        clearCart();
                                                        router.push(`/order-success?order_id=${details.orderId}`);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Monetico Component */}
                                        {isMonetico && (
                                            <div className="mt-2">
                                                <CheckoutMonetico
                                                    cartData={{
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
                                                    onSuccess={(details) => {
                                                        clearSavedFormData();
                                                        clearCart();
                                                        router.push(`/order-success?order_id=${details.orderId}`);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Authorize Component */}
                                        {isAuthorize && (
                                            <div className="mt-2">
                                                <CheckoutAuthorize
                                                    cartData={{
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
                                                    onSuccess={(details) => {
                                                        clearSavedFormData();
                                                        clearCart();
                                                        router.push(`/order-success?order_id=${details.orderId}`);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </PaymentMethodCard>
                                )
                            })}
                        </div>

                        {/* Terms and Submit */}
                        <div className='bg-gray-50 p-6 space-y-4'>
                            <p className='text-sm text-gray-600'>
                                Your personal data will be used to process your order, assist you during your visit to the website, and for other reasons described in our{' '}
                                <Link href="/privacy-policy" className='text-[#1D98FF] hover:underline'>privacy policy</Link>
                            </p>

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
                                <p className="text-red-500 text-xs animate-slideDown">{errors.terms.message}</p>
                            )}

                            {!watchFields.payment_method?.toLowerCase().includes('monetico') &&
                                watchFields.payment_method !== 'paypal' &&
                                watchFields.payment_method !== 'ppcp-gateway' &&
                                watchFields.payment_method !== 'authnet' ? (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !watchFields.terms}
                                    className='
                                        w-full lg:w-auto lg:ml-auto text-white bg-[#1D98FF] rounded-xl
                                        px-8 py-4 uppercase font-semibold
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        hover:bg-[#1585e0] active:scale-[0.98]
                                        shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                                        transition-all duration-200
                                        flex items-center justify-center gap-2
                                    '
                                >
                                    {isSubmitting ? t("processing") : watchFields.payment_method === 'bacs' ? t("placeOrder") : t("continue")}
                                </button>
                            ) : null}
                        </div>
                    </div>

                </form>
            </div>
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