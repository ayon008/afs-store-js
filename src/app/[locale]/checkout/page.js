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
import { countriesList } from "@/lib/countriesList";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

const Page = () => {
    const t = useTranslations("checkout");

    const [shippingAddress, setShippingAddress] = useState(false);

    const handleShow = event => {
        setShippingAddress(event.target.checked);
    }

    // Cart
    const { cart, loadCart } = useCart();

    const cartBillingAddress = cart?.billing_address;
    const cartShippingAddress = cart?.shipping_address;
    console.log(cartBillingAddress, 'cartBillingAddress');
    

    console.log(cartShippingAddress);


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
        
        // Add shipping address if available (this will be the default for 2nd form)
        if (cartShippingAddress) {
            formValues.shipping_first_name = cartShippingAddress.first_name || '';
            formValues.shipping_last_name = cartShippingAddress.last_name || '';
            formValues.shipping_company = cartShippingAddress.company || '';
            formValues.shipping_country = cartShippingAddress.country || '';
            formValues.shipping_address_1 = cartShippingAddress.address_1 || '';
            formValues.shipping_city = cartShippingAddress.city || '';
            formValues.shipping_state = cartShippingAddress.state || '';
            formValues.shipping_postcode = cartShippingAddress.postcode || '';
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

        return methods.filter(method => {
            // Ensure method is an object
            if (!method || typeof method !== 'object') return false;
            
            const methodId = method.id?.toLowerCase() || '';
            const methodTitle = method.title?.toLowerCase() || '';

            // Exclude Credit Card
            if (methodId === 'credit-card' || methodTitle.includes('credit card')) {
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

    // Payment instructions
    const PAYMENT_INSTRUCTIONS = {
        'bacs': 'Effectuez le paiement directement depuis votre compte bancaire. Veuillez utiliser l\'ID de votre commande comme référence du paiement. Votre commande ne sera pas expédiée tant que les fonds ne seront pas reçus.',
        'paypal': 'Payer avec PayPal',
        'ppcp-gateway': 'Payer avec PayPal'
    };

    console.log(cartShippingAddress, 'cartShippingAddress');



    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const data = await getPaymentMethods();
                // Ensure data is an array
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

    useEffect(() => {
        if (watchFields.billing_country) {
            const fetchCountryDetails = async () => {
                const data = await getCountryDetails(watchFields.billing_country);
                setCountryDetails(data);
            };
            fetchCountryDetails();
        }
    }, [watchFields.billing_country, setCountryDetails])

    // Update billing address in cart when billing fields change (to calculate shipping methods)
    const updateBillingAddress = useCallback(async (billingData) => {
        // Only update if we have minimum required fields
        if (billingData.billing_country && billingData.billing_postcode && 
            billingData.billing_city && billingData.billing_address_1) {
            try {
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
                            postcode: billingData.billing_postcode || '',
                            country: billingData.billing_country || '',
                            email: billingData.billing_email || '',
                            phone: billingData.billing_phone || '',
                        }
                    })
                });
                
                if (response.ok) {
                    await loadCart();
                }
            } catch (error) {
                console.error('Error updating billing address:', error);
            } finally {
                setUpdatingShipping(false);
            }
        }
    }, [loadCart]);

    // Debounced update of billing address
    useEffect(() => {
        const timer = setTimeout(() => {
            if (watchFields.billing_country && watchFields.billing_postcode && 
                watchFields.billing_city && watchFields.billing_address_1) {
                updateBillingAddress(watchFields);
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

    const allShippingRates = cart?.shipping_rates?.flatMap(pkg =>
        pkg.shipping_rates?.map(rate => ({
            ...rate,
            package_id: pkg.package_id
        })) || []
    ) || [];

    useEffect(() => {
        const selected = allShippingRates.find(rate => rate.selected);

        if (selected) {
            setSelectedRateId(selected.rate_id);
        } else {
            setSelectedRateId(null);
        }
    }, [allShippingRates]);

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
            console.log('PayPal disabled: terms not accepted');
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

    const handleSelectRate = async (value) => {
        const [packageId, rateId] = value.split(':');
        if (rateId === selectedRateId) return;
        setShippingLoading(true);
        try {
            const result = await selectShippingRate(rateId, packageId);
            if (result.success) {
                setSelectedRateId(rateId);
                setValue('shipping_method', rateId);
                await loadCart();
            } else {
                console.error('Failed to select shipping rate:', result.error);
            }
        } catch (error) {
            console.error('Error selecting shipping rate:', error);
        } finally {
            setShippingLoading(false);
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
                    shipping: shippingAddress ? {
                        first_name: data.shipping_first_name,
                        last_name: data.shipping_last_name,
                        company: data.shipping_company || '',
                        address_1: data.shipping_address_1,
                        address_2: '',
                        city: data.shipping_city,
                        state: data.shipping_state || '',
                        postcode: data.shipping_postcode,
                        country: data.shipping_country
                    } : null
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
        );
    }

    return (
        <div>
            {/* Steps */}
            <div className='flex items-center justify-between max-w-[1080px] mx-auto relative py-[80px] lg:py-[100px]'>
                <div className='flex flex-col items-center justify-center step-1'>
                    <span className='w-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] h-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] text-[clamp(0.9375rem,0.362rem+1.2005vw,1.5625rem)] font-bold  rounded-full text-center text-white z-10! bg-[#1D98FF]'>1</span>
                    <span className='text-base text-[clamp(0.875rem,0.7599rem+0.2401vw,1rem)] text-center leading-[120%]'>
                        {t("basket")}
                    </span>
                </div>
                <div className='flex flex-col items-center justify-center step-2'>
                    <span className='w-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] h-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] text-[clamp(0.9375rem,0.362rem+1.2005vw,1.5625rem)] font-bold  rounded-full text-center text-white z-10! bg-[#1D98FF]'>2</span>
                    <span className='text-base text-[clamp(0.875rem,0.7599rem+0.2401vw,1rem)] text-center leading-[120%]'>
                        {t("securePayment")}
                    </span>
                </div>
                <div className='flex flex-col items-center justify-center step-3'>
                    <span className='w-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] h-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] border border-[#111] text-[clamp(0.9375rem,0.362rem+1.2005vw,1.5625rem)] font-bold text-[#111] rounded-full text-center bg-white z-10!'>3</span>
                    <span className='text-base text-[clamp(0.875rem,0.7599rem+0.2401vw,1rem)] text-center leading-[120%]'>
                        {t("summary")}
                    </span>
                </div>
            </div>
            {/*  */}
            <div className='global-padding global-margin'>
                {/* checkout forms */}
                <form className='space-y-10' onSubmit={handleSubmit(onSubmit)}>

                    {/* 1st section */}
                    <div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
                        {/* Billing address */}
                        <div className='flex flex-col lg:gap-8 gap-6'>
                            <h3 className='lg:text-[28px] text-[22px] leading-[100%] font-semibold text-[#111]'>{t("billingDetails")}</h3>
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
                        <div className='flex flex-col lg:gap-8 gap-6'>
                            <div className='flex items-center gap-1 flex-wrap'>
                                <input onChange={handleShow} type="checkbox" id='shipping_address' checked={shippingAddress} />
                                <h3 className='lg:text-[28px] text-[22px] leading-[100%] font-semibold text-[#111]'>{t("shippingDetails")}</h3>
                            </div>
                            {
                                shippingAddress && (
                                    <div className='grid grid-cols-1 gap-5'>
                                        <div className='grid grid-cols-2 gap-5'>
                                            {/*  */}
                                            <Input
                                                checkout={true}
                                                label='First Name'
                                                type='text'
                                                id='shipping_first_name'
                                                register={register("shipping_first_name", { required: "Ce champ est requis" })}
                                                error={getFieldError("shipping_first_name")}
                                                value={watchFields.shipping_first_name}
                                            />

                                            <Input
                                                checkout={true}
                                                label='Last Name'
                                                type='text'
                                                id='shipping_last_name'
                                                register={register("shipping_last_name", { required: "Ce champ est requis" })}
                                                error={getFieldError("shipping_last_name")}
                                                value={watchFields.shipping_last_name}
                                            />
                                        </div>
                                        <Input
                                            checkout={true}
                                            label='Company (Optional)'
                                            type='text'
                                            id='shipping_company'
                                            register={register("shipping_company", { required: false })}
                                            error={getFieldError("shipping_company")}
                                            value={watchFields.shipping_company}
                                        />
                                        <Input
                                            checkout={true}
                                            label='Country'
                                            type='text'
                                            id='shipping_country'
                                            register={register("shipping_country", { required: "Ce champ est requis" })}
                                            error={getFieldError("shipping_country")}
                                            value={watchFields.shipping_country}
                                        />
                                        <Input
                                            checkout={true}
                                            label='Post Code'
                                            type='text'
                                            id='zip'
                                            register={register("shipping_postcode", { required: "Ce champ est requis" })}
                                            error={getFieldError("shipping_postcode")}
                                            value={watchFields.shipping_postcode}
                                        />
                                        <Input
                                            checkout={true}
                                            label='State'
                                            type='text'
                                            id='state'
                                            register={register("shipping_state", { required: "Ce champ est requis" })}
                                            error={getFieldError("shipping_state")}
                                            value={watchFields.shipping_state}
                                        />

                                        <Input
                                            checkout={true}
                                            label='City'
                                            type='text'
                                            id='city'
                                            register={register("shipping_city", { required: "Ce champ est requis" })}
                                            error={getFieldError("shipping_city")}
                                            value={watchFields.shipping_city}
                                        />

                                        <Input
                                            checkout={true}
                                            label='Street number and name'
                                            type='text' id='street_number_and_name'
                                            register={register("shipping_address_1", { required: "Ce champ est requis" })}
                                            error={getFieldError("shipping_address_1")}
                                            value={watchFields.shipping_address_1}
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
                                        {allShippingRates && allShippingRates.length > 0 ? (
                                            <div>
                                                <ul className={`space-y-2 ${shippingLoading || updatingShipping ? 'opacity-50' : 'opacity-100'}`}>
                                                    {allShippingRates.map((rate, i) => {
                                                        const totalPrice = (rate.price / 100 + rate.taxes / 100);
                                                        return (
                                                            <li key={`shipping-rate-${rate.rate_id}-${i}`} className='border border-[#ccc] rounded-sm p-[15px] flex items-center gap-3 flex-wrap justify-between hover:border-[#1D98FF] transition-colors'>
                                                                <div className='flex items-center gap-3 flex-1 min-w-0'>
                                                                    <input
                                                                        checked={selectedRateId === rate.rate_id}
                                                                        value={`${rate.package_id}:${rate.rate_id}`}
                                                                        onChange={(e) => handleSelectRate(e.target.value)}
                                                                        type="radio"
                                                                        name="shipping_method"
                                                                        id={`shipping_rate_${rate.rate_id}`}
                                                                        disabled={shippingLoading || updatingShipping}
                                                                        className="cursor-pointer"
                                                                    />
                                                                    <label htmlFor={`shipping_rate_${rate.rate_id}`} className="break-normal max-w-full cursor-pointer font-medium">{rate.name}</label>
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
                                        ) : (
                                            <p className='text-sm text-gray-500 italic p-4 border border-[#ccc] rounded-sm bg-[#F9F9F9]'>
                                                {t("noShippingMethods")}
                                            </p>
                                        )}
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

                    {/* 3rd section */}
                    <div className='bg-[#F7F7F7]'>
                            <ul className='flex flex-col gap-2 p-4 border-b border-[#DDD8E3]'>
                                {filteredPaymentMethods?.map((method, i) => {
                                    const isSelected = watchFields.payment_method === method.id;
                                    const isMonetico = method.id?.toLowerCase().includes('monetico') ||
                                        method.title?.toLowerCase().includes('carte bancaire');

                                    return (
                                        <li key={method.id || i} className='flex flex-col gap-3'>
                                            <div className='flex items-center gap-1'>
                                                <input
                                                    {...register("payment_method", { required: true })}
                                                    type="radio"
                                                    value={method.id}
                                                    id={`payment_method_${method.id}`}
                                                    checked={isSelected}
                                                />
                                                <label htmlFor={`payment_method_${method.id}`} className='cursor-pointer'>
                                                    {method.title}
                                                </label>
                                            </div>

                                            {isSelected && PAYMENT_INSTRUCTIONS[method.id] && (
                                                <div className='bg-[#EBF5FF] border-l-4 border-[#1D98FF] rounded-sm p-4 text-sm ml-6'>
                                                    <p>{PAYMENT_INSTRUCTIONS[method.id]}</p>
                                                </div>
                                            )}

                                            {isSelected && (method.id === 'paypal' || method.id === 'ppcp-gateway') && (
                                                <div className="mt-2 ml-6">
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

                                            {isSelected && (isMonetico || method.id?.toLowerCase().includes('monetico')) && (
                                                <div className="mt-2 ml-6">
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
                                        </li>
                                    )
                                })}
                            </ul>

                            <div className='flex flex-col gap-2 p-4'>
                                <p>Your personal data will be used to process your order, assist you during your visit to the website, and for other reasons described in our
                                    <Link href="/privacy-policy" className='inline'>privacy policy</Link>
                                </p>
                                <div className='flex flex-col gap-1'>
                                    <div className='flex items-center gap-1'>
                                        <input {...register("terms", {
                                            required: t("termsRequired")
                                        })} type="checkbox" id="terms" />
                                        <label htmlFor="terms">{t("terms")}</label>
                                    </div>
                                    {errors.terms && (
                                        <p className="text-red-500 text-xs mt-1 ml-6">{errors.terms.message}</p>
                                    )}
                                </div>

                                {!watchFields.payment_method?.toLowerCase().includes('monetico') &&
                                    watchFields.payment_method !== 'paypal' &&
                                    watchFields.payment_method !== 'ppcp-gateway' ? (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !watchFields.terms}
                                        className='w-fit ml-auto text-white bg-[#1D98FF] rounded-sm px-[50px] uppercase py-[18px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
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

export default Page;