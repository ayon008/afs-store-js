"use client"

import { useState } from 'react'

export default function CheckoutMonetico({ 
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
      setError('Vous devez accepter les conditions générales pour continuer.');
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
        payment_method: 'monetico',
        payment_method_title: 'Monetico Payment Gateway'
      };

      // Validate required fields
      if (!orderPayload.billing_email) {
        throw new Error('L\'adresse email est requise');
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

      // Initialize Monetico payment
      // Ensure email is included in customerData for Monetico
      const moneticoCustomerData = {
        ...customerData,
        billing_email: orderPayload.billing_email,
        billing: {
          ...customerData.billing,
          email: orderPayload.billing_email
        }
      };

      const paymentResponse = await fetch('/api/payments/monetico/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerData: moneticoCustomerData,
          cartData
        })
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.error || 'Failed to initiate payment')
      }

      const paymentResponseData = await paymentResponse.json()

      // Validate response structure
      if (!paymentResponseData.formData || !paymentResponseData.actionUrl) {
        console.error('Invalid Monetico response:', paymentResponseData);
        throw new Error('Réponse invalide de Monetico. Veuillez réessayer.');
      }

      // Create and submit the form to redirect to Monetico
      createAndSubmitForm(paymentResponseData.formData, paymentResponseData.actionUrl)

    } catch (err) {
      console.error('Monetico payment error:', err)
      setError(err.message)
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }

  const createAndSubmitForm = (formData, actionUrl) => {
    // Validate inputs
    if (!formData || typeof formData !== 'object') {
      console.error('Invalid formData:', formData);
      throw new Error('Données de formulaire invalides');
    }

    if (!actionUrl || typeof actionUrl !== 'string') {
      console.error('Invalid actionUrl:', actionUrl);
      throw new Error('URL de paiement invalide');
    }

    // Remove any existing hidden form
    const existingForm = document.getElementById('monetico-payment-form')
    if (existingForm) {
      existingForm.remove()
    }

    // Create a hidden form for Monetico payment
    const form = document.createElement('form')
    form.id = 'monetico-payment-form'
    form.method = 'POST'
    form.action = actionUrl
    form.style.display = 'none'

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value !== null && value !== undefined ? String(value) : ''
      form.appendChild(input)
    })

    // Add form to document and submit
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <div className="monetico-payment-wrapper">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <button
        onClick={initiatePayment}
        disabled={disabled || loading}
        className={`w-full py-3 px-4 rounded font-medium transition-colors ${
          disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Traitement en cours...
          </div>
        ) : (
          'Payer par Carte Bancaire (Monetico)'
        )}
      </button>

      <div className="mt-3 text-xs text-gray-600 text-center">
        <p>Vous allez être redirigé vers une page de paiement sécurisée</p>
        <p>Propulsé par Monetico Paiement</p>
      </div>
    </div>
  )
}