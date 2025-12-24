"use client"

import { useState } from 'react'

export default function CheckoutAuthorize({ 
  cartData, 
  customerData, 
  onSuccess, 
  onError,
  disabled = false 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initiatePayment = async () => {
    if (disabled) return
    
    // Check if terms are accepted
    if (!customerData.terms) {
      setError('You must accept the terms and conditions to continue.');
      return;
    }
    
    setLoading(true)
    setError(null)

    try {
      // Map customerData to the format expected by the API
      const orderPayload = {
        billing_first_name: customerData.billing_first_name || customerData.billing?.first_name || '',
        billing_last_name: customerData.billing_last_name || customerData.billing?.last_name || '',
        billing_company: customerData.billing_company || customerData.billing?.company || '',
        billing_country: customerData.billing_country || customerData.billing?.country || '',
        billing_address_1: customerData.billing_address_1 || customerData.billing?.address_1 || '',
        billing_city: customerData.billing_city || customerData.billing?.city || '',
        billing_state: customerData.billing_state || customerData.billing?.state || '',
        billing_postcode: customerData.billing_postcode || customerData.billing?.postcode || '',
        billing_phone: customerData.billing_phone || customerData.billing?.phone || '',
        billing_email: customerData.billing_email || customerData.billing?.email || '',
        shipping_first_name: customerData.shipping_first_name || customerData.shipping?.first_name || customerData.billing_first_name || customerData.billing?.first_name || '',
        shipping_last_name: customerData.shipping_last_name || customerData.shipping?.last_name || customerData.billing_last_name || customerData.billing?.last_name || '',
        shipping_company: customerData.shipping_company || customerData.shipping?.company || customerData.billing_company || customerData.billing?.company || '',
        shipping_country: customerData.shipping_country || customerData.shipping?.country || customerData.billing_country || customerData.billing?.country || '',
        shipping_address_1: customerData.shipping_address_1 || customerData.shipping?.address_1 || customerData.billing_address_1 || customerData.billing?.address_1 || '',
        shipping_city: customerData.shipping_city || customerData.shipping?.city || customerData.billing_city || customerData.billing?.city || '',
        shipping_state: customerData.shipping_state || customerData.shipping?.state || customerData.billing_state || customerData.billing?.state || '',
        shipping_postcode: customerData.shipping_postcode || customerData.shipping?.postcode || customerData.billing_postcode || customerData.billing?.postcode || '',
        order_comments: customerData.order_comments || '',
        line_items: cartData.lineItems || [],
        shipping_lines: cartData.shippingLines || [],
        payment_method: 'authnet',
        payment_method_title: 'Credit Card'
      };

      // Validate required fields
      if (!orderPayload.billing_email) {
        throw new Error('Email address is required');
      }

      // First create a WooCommerce order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const orderData = await orderResponse.json()
      const orderId = orderData.orderId

      // Get Authorize.Net payment URL from WooCommerce
      // Use dedicated endpoint to get the correct payment URL
      try {
        const paymentInitResponse = await fetch('/api/payments/authorize/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });

        if (paymentInitResponse.ok) {
          const paymentData = await paymentInitResponse.json();
          if (paymentData.payment_url) {
            console.log('Redirecting to Authorize.Net payment URL:', paymentData.payment_url);
            window.location.href = paymentData.payment_url;
            return;
          }
        }
      } catch (err) {
        console.error('Error getting Authorize.Net payment URL:', err);
      }

      // Fallback: Use payment URL from order creation response
      let paymentUrl = orderData.payment_url || orderData.checkout_payment_url;

      // If still no payment URL, try to get it from order details
      if (!paymentUrl) {
        try {
          const localeValue = window.location.pathname.split('/')[1] || 'en';
          const orderCheckResponse = await fetch(`/api/orders/${orderId}/payment-url`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (orderCheckResponse.ok) {
            const paymentData = await orderCheckResponse.json();
            paymentUrl = paymentData.payment_url || paymentData.checkout_payment_url;
          }
        } catch (err) {
          console.error('Error fetching payment URL:', err);
        }
      }

      // If we have a payment URL, redirect to it
      if (paymentUrl) {
        console.log('Redirecting to payment URL:', paymentUrl);
        window.location.href = paymentUrl;
        return;
      }

      // Last fallback: construct WooCommerce checkout URL
      // Note: For Authorize.Net, we need to use the WooCommerce order payment page
      // which should display the Authorize.Net payment form
      const localeValue = window.location.pathname.split('/')[1] || 'en';
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const orderKey = orderData.orderKey || orderData.order_key;
      
      if (orderKey) {
        // Use WooCommerce standard checkout order payment URL
        // This should trigger Authorize.Net payment gateway to show payment form
        // The URL format: /checkout/order-pay/{order_id}/?pay_for_order=true&key={order_key}
        const checkoutUrl = `${baseUrl}/${localeValue}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}`;
        console.log('Redirecting to WooCommerce checkout payment URL (should show Authorize.Net form):', checkoutUrl);
        
        // Redirect to the payment page
        // WooCommerce should automatically show Authorize.Net payment form on this page
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Unable to get payment URL. Please try again.');
      }

    } catch (err) {
      console.error('Authorize payment error:', err)
      setError(err.message)
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
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
      <button
        onClick={initiatePayment}
        disabled={loading || disabled}
        className="w-full bg-[#1D98FF] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#1585e0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </div>
  )
}

