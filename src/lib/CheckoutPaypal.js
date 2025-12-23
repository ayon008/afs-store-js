"use client";

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Props: cartData, customerData (from checkout form state), disabled
export default function CheckoutPayPal({ cartData, customerData, onSuccess, disabled = false }) {
    const router = useRouter();
    const [wooOrderId, setWooOrderId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const initialOptions = {
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: "EUR", // Changed to EUR for European store
        intent: "capture",
        "disable-funding": "credit,card", // Optional: disable credit card if you only want PayPal
    };

    // Called when PayPal button is clicked
    const createOrder = async (data, actions) => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartData, customerData }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.message || 'Failed to create order');
            }

            setWooOrderId(responseData.wooOrderId);
            setLoading(false);

            return responseData.paypalOrderId;
        } catch (err) {
            console.error('Error creating PayPal order:', err);
            setError(err.message || 'Failed to create order');
            setLoading(false);
            throw err;
        }
    };

    // Called after user approves payment
    const onApprove = async (data, actions) => {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/orders/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paypalOrderId: data.orderID,
                    wooOrderId: wooOrderId,
                }),
            });

            const details = await res.json();

            if (!res.ok) {
                throw new Error(details.message || 'Failed to capture payment');
            }

            setLoading(false);

            // Call onSuccess callback if provided
            if (typeof onSuccess === 'function') {
                try {
                    onSuccess(details);
                } catch (error) {
                    console.error('Error in onSuccess callback:', error);
                    // Redirect to order success page as fallback
                    router.push(`/order-success?order=${details.wooOrderId}`);
                }
            } else {
                // Redirect to order success page if no handler is provided
                router.push(`/order-success?order=${details.wooOrderId}`);
            }

            return details;
        } catch (err) {
            console.error('Error capturing PayPal payment:', err);
            setError(err.message || 'Failed to complete payment');
            setLoading(false);
            throw err;
        }
    };

    // Called when user cancels the payment
    const onCancel = (data) => {
        console.log('PayPal payment cancelled:', data);
        setError('Payment was cancelled. Please try again.');
        setLoading(false);
    };

    // Called when there's an error with PayPal
    const onError = (err) => {
        console.error('PayPal error:', err);
        setError('An error occurred with the PayPal transaction. Please try again.');
        setLoading(false);
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {loading && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                    <span className="block sm:inline">Processing your payment...</span>
                </div>
            )}
            <PayPalButtons
                style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "paypal"
                }}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={onCancel}
                onError={onError}
                disabled={loading || disabled}
            />
        </PayPalScriptProvider>
    );
}
