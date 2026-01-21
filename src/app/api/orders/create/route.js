import { NextResponse } from 'next/server';
import { getLocaleValue } from '@/app/actions/Woo-Coommerce/getWooCommerce';

const WP_BASE_URL = process.env.WP_BASE_URL || 'https://staging.afs-foiling.com/fr';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

const PAYPAL_BASE_URL = PAYPAL_MODE === 'production' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

function getAuthHeader() {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured');
  }
  const token = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal auth failed: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createPayPalOrder(amount, currency = 'EUR') {
  const accessToken = await getPayPalAccessToken();

  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2),
      },
    }],
  };

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal order creation failed: ${errorText}`);
  }

  return response.json();
}

export async function POST(req) {
  const localeValue = await getLocaleValue();
  
  try {
    // Validate environment variables
    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Configuration WooCommerce manquante. Veuillez contacter l\'administrateur.'
      }, { status: 500 });
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Configuration PayPal manquante. Veuillez contacter l\'administrateur.'
      }, { status: 500 });
    }

    const { cartData, customerData } = await req.json();

    if (!cartData || !cartData.totals || !cartData.totals.total_price) {
      return NextResponse.json({
        success: false,
        error: 'Données du panier invalides'
      }, { status: 400 });
    }

    // Validate required customer data
    if (!customerData || !customerData.billing_email) {
      return NextResponse.json({
        success: false,
        error: 'L\'adresse email est requise'
      }, { status: 400 });
    }

    // Prepare WooCommerce order data
    const totalAmount = cartData.totals.total_price / 100; // Convert from cents to euros

    // Get survey value
    const surveyValue = customerData.survey === 'other' && customerData.survey_other 
      ? customerData.survey_other 
      : customerData.survey || '';

    const orderData = {
      payment_method: 'paypal',
      payment_method_title: 'PayPal',
      set_paid: false,
      billing: {
        first_name: customerData.billing_first_name || customerData.billing?.first_name || '',
        last_name: customerData.billing_last_name || customerData.billing?.last_name || '',
        company: customerData.billing_company || customerData.billing?.company || '',
        address_1: customerData.billing_address_1 || customerData.billing?.address_1 || '',
        city: customerData.billing_city || customerData.billing?.city || '',
        state: customerData.billing_state || customerData.billing?.state || '',
        postcode: customerData.billing_postcode || customerData.billing?.postcode || '',
        country: customerData.billing_country || customerData.billing?.country || '',
        email: customerData.billing_email || customerData.billing?.email || '',
        phone: customerData.billing_phone || customerData.billing?.phone || '',
      },
      shipping: {
        first_name: customerData.shipping_first_name || customerData.shipping?.first_name || customerData.billing_first_name || customerData.billing?.first_name || '',
        last_name: customerData.shipping_last_name || customerData.shipping?.last_name || customerData.billing_last_name || customerData.billing?.last_name || '',
        company: customerData.shipping_company || customerData.shipping?.company || customerData.billing_company || customerData.billing?.company || '',
        address_1: customerData.shipping_address_1 || customerData.shipping?.address_1 || customerData.billing_address_1 || customerData.billing?.address_1 || '',
        city: customerData.shipping_city || customerData.shipping?.city || customerData.billing_city || customerData.billing?.city || '',
        state: customerData.shipping_state || customerData.shipping?.state || customerData.billing_state || customerData.billing?.state || '',
        postcode: customerData.shipping_postcode || customerData.shipping?.postcode || customerData.billing_postcode || customerData.billing?.postcode || '',
        country: customerData.shipping_country || customerData.shipping?.country || customerData.billing_country || customerData.billing?.country || '',
      },
      line_items: cartData.lineItems?.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variation_id: item.variation_id || 0,
      })) || [],
      shipping_lines: cartData.shippingLines?.map(line => ({
        method_id: line.method_id,
        method_title: line.method_title,
        total: line.total,
      })) || [],
      customer_note: customerData.order_comments || '',
      status: 'pending',
      meta_data: surveyValue ? [
        {
          key: 'survey',
          value: surveyValue
        }
      ] : [],
    };

    // Create WooCommerce order
    const baseUrl = WP_BASE_URL.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders`;
    const url = new URL(apiUrl);
    url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
    url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

    const wcResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(orderData),
      cache: 'no-store',
    });

    if (!wcResponse.ok) {
      const errorText = await wcResponse.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error?.message || errorJson.error || errorText;
      } catch {
        // Keep the text as is
      }

      console.error('WooCommerce API Error:', {
        status: wcResponse.status,
        statusText: wcResponse.statusText,
        errorMessage,
      });

      throw new Error(errorMessage || `Erreur ${wcResponse.status}: ${wcResponse.statusText}`);
    }

    const wcOrderData = await wcResponse.json();
    const wooOrderId = wcOrderData.id;

    try {
      // Create PayPal order
      const paypalOrder = await createPayPalOrder(totalAmount, 'EUR');

      return NextResponse.json({
        success: true,
        wooOrderId: wooOrderId,
        paypalOrderId: paypalOrder.id,
      });
    } catch (paypalError) {
      // If WooCommerce order was created but PayPal order creation failed,
      // update the WooCommerce order status to failed
      console.error('PayPal order creation failed after WooCommerce order was created:', paypalError);
      
      if (wooOrderId) {
        try {
          const baseUrl = WP_BASE_URL.replace(/\/$/, '');
          const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${wooOrderId}`;
          const url = new URL(apiUrl);
          url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
          url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

          await fetch(url.toString(), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader(),
            },
            body: JSON.stringify({
              status: 'failed',
              customer_note: `Échec de la création de la commande PayPal: ${paypalError.message || 'Erreur inconnue'}`
            }),
            cache: 'no-store',
          });
        } catch (updateError) {
          console.error('Failed to update order status after PayPal error:', updateError);
        }
      }

      throw paypalError;
    }

  } catch (error) {
    console.error('PayPal order creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la création de la commande PayPal'
    }, { status: 500 });
  }
}
