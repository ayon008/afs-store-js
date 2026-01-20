"use client"

import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import PaymentForm from './AuthorizeNet/PaymentForm'
import SavedPaymentMethods from './AuthorizeNet/SavedPaymentMethods'

/**
 * CheckoutAuthorize Component
 *
 * Native Authorize.Net checkout with Accept.js tokenization.
 * Card data never touches our servers - PCI SAQ A compliant.
 *
 * @param {Object} props
 * @param {Object} props.cartData - Cart data with lineItems and shippingLines
 * @param {Function} props.getCustomerData - Callback to get current customer billing/shipping data
 * @param {Function} props.onSuccess - Callback on successful payment
 * @param {Function} props.onError - Callback on payment error
 * @param {boolean} props.disabled - Disable payment button
 */
export default function CheckoutAuthorize({
  cartData,
  getCustomerData,
  onSuccess,
  onError,
  disabled = false,
  setOrderProcessing,
  syncCartToAPI
}) {
  const t = useTranslations("checkout.authorize")
  const tCheckout = useTranslations("checkout")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saveCard, setSaveCard] = useState(false)
  const [useNewCard, setUseNewCard] = useState(true)
  const [selectedPaymentProfile, setSelectedPaymentProfile] = useState(null)

  // Ref to PaymentForm for triggering tokenization
  const paymentFormRef = useRef(null)
  const [opaqueData, setOpaqueData] = useState(null)

  // Get customer email for saved cards (get current value)
  const currentCustomerData = getCustomerData ? getCustomerData() : {};
  const customerEmail = currentCustomerData.billing_email ||
    currentCustomerData.billing?.email ||
    currentCustomerData.email

  /**
   * Handle payment method selection from saved cards
   */
  const handlePaymentMethodSelect = useCallback((method) => {
    if (method) {
      setSelectedPaymentProfile(method)
      setUseNewCard(false)
      setOpaqueData(null)
    } else {
      setSelectedPaymentProfile(null)
      setUseNewCard(true)
    }
  }, [])

  /**
   * Handle card tokenization success
   */
  const handleTokenized = useCallback((data) => {
    console.log('Card tokenized:', {
      cardType: data.cardType,
      cardTypeName: data.cardTypeName,
      lastFour: data.lastFour,
    })
    setOpaqueData(data)
    setError(null)
  }, [])

  /**
   * Handle card tokenization error
   */
  const handleTokenizeError = useCallback((err) => {
    setError(err.message || 'Failed to process card information')
    setOpaqueData(null)
  }, [])

  /**
   * Process the payment
   */
  const processPayment = async () => {
    if (disabled) return

    // Get current form values at payment time
    const customerData = getCustomerData ? getCustomerData() : {};

    // Validate terms acceptance
    if (!customerData.terms) {
      setError('You must accept the terms and conditions to continue.')
      return
    }

    // Validate payment method
    if (useNewCard && !opaqueData) {
      setError('Please enter your card information.')
      return
    }

    if (!useNewCard && !selectedPaymentProfile) {
      setError('Please select a payment method.')
      return
    }

    setLoading(true)
    setError(null)
    // Show full-screen overlay
    if (setOrderProcessing) setOrderProcessing(true)

    try {
      // Sync localStorage cart to WooCommerce API first
      if (syncCartToAPI) {
        const syncResult = await syncCartToAPI();
        if (!syncResult.success) {
          throw new Error(syncResult.error || 'Failed to sync cart');
        }
      }

      // Build order data
      const orderData = {
        billing_first_name: customerData.billing_first_name || customerData.billing?.first_name || '',
        billing_last_name: customerData.billing_last_name || customerData.billing?.last_name || '',
        billing_company: customerData.billing_company || customerData.billing?.company || '',
        billing_country: customerData.billing_country || customerData.billing?.country || '',
        billing_address_1: customerData.billing_address_1 || customerData.billing?.address_1 || '',
        billing_city: customerData.billing_city || customerData.billing?.city || '',
        billing_state: customerData.billing_state || customerData.billing?.state || '',
        billing_postcode: customerData.billing_postcode || customerData.billing?.postcode || '',
        billing_phone: customerData.billing_phone || customerData.billing?.phone || '',
        billing_email: customerData.billing_email || customerData.billing?.email || customerData.email,
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
      }

      // Validate required fields
      if (!orderData.billing_email) {
        throw new Error('Email address is required')
      }

      if (!orderData.line_items || orderData.line_items.length === 0) {
        throw new Error('Your cart is empty')
      }

      // Build payment request
      const paymentRequest = {
        orderData,
        saveCard: useNewCard ? saveCard : false,
      }

      if (useNewCard) {
        paymentRequest.opaqueData = {
          dataDescriptor: opaqueData.dataDescriptor,
          dataValue: opaqueData.dataValue,
        }
        paymentRequest.cardInfo = {
          cardType: opaqueData.cardType,
          cardTypeName: opaqueData.cardTypeName,
          lastFour: opaqueData.lastFour,
        }
      } else {
        paymentRequest.customerProfileId = selectedPaymentProfile.customerProfileId
        paymentRequest.paymentProfileId = selectedPaymentProfile.paymentProfileId
        paymentRequest.cardInfo = {
          cardType: selectedPaymentProfile.cardType,
          lastFour: selectedPaymentProfile.cardNumber?.slice(-4),
        }
      }

      // Call the process endpoint
      const response = await fetch('/api/payments/authorize/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Payment failed')
      }

      // Payment successful
      console.log('Payment successful:', {
        orderId: result.orderId,
        transactionId: result.transactionId
      })

      // Redirect to success page
      const localeValue = window.location.pathname.split('/')[1] || 'en'
      const successUrl = `/${localeValue}/order-success?order_id=${result.orderId}&order_key=${result.orderKey}`

      if (onSuccess) {
        onSuccess({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          orderKey: result.orderKey,
          transactionId: result.transactionId,
        })
      }

      // Redirect to order success page
      window.location.href = successUrl

    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'An error occurred during payment')
      if (onError) onError(err)
      if (setOrderProcessing) setOrderProcessing(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{tCheckout("processing")}</span>
          </div>
        </div>
      )}

      {/* Saved payment methods */}
      {customerEmail && (
        <SavedPaymentMethods
          customerEmail={customerEmail}
          onSelect={handlePaymentMethodSelect}
          showAddNew={true}
          onAddNew={() => setUseNewCard(true)}
        />
      )}

      {/* New card form */}
      {useNewCard && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            {customerEmail ? t("enterNewCardDetails") : t("cardDetails")}
          </h4>

          <PaymentForm
            ref={paymentFormRef}
            onTokenized={handleTokenized}
            onError={handleTokenizeError}
            disabled={loading || disabled}
            loading={loading}
          />

          {/* Save card checkbox */}
          {customerEmail && (
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="saveCard"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                disabled={loading || disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="saveCard" className="ml-2 text-sm text-gray-600">
                {t("saveCard")}
              </label>
            </div>
          )}
        </div>
      )}

      {/* Selected saved card info */}
      {!useNewCard && selectedPaymentProfile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700">
              {t("usingSavedCard")} <strong>{selectedPaymentProfile.cardNumber?.slice(-4) || '****'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Pay button */}
      <button
        type="button"
        onClick={processPayment}
        disabled={loading || disabled || (useNewCard && !opaqueData)}
        className="w-full bg-[#1D98FF] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#1585e0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {tCheckout("processing")}
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t("paySecurely")}
          </>
        )}
      </button>

      {/* Security badges */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          {t("sslEncryption")}
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t("pciCompliant")}
        </div>
      </div>
    </div>
  )
}
