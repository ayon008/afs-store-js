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

async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal capture failed: ${errorText}`);
  }

  return response.json();
}

async function updateWooCommerceOrder(orderId, updateData, localeValue) {
  const baseUrl = WP_BASE_URL.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;

  const url = new URL(apiUrl);
  url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
  url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(updateData),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update order: ${errorText}`);
  }

  return response.json();
}

export async function POST(req) {
  const localeValue = await getLocaleValue();
  let requestData = null;
  
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

    requestData = await req.json();
    const { paypalOrderId, wooOrderId } = requestData;

    if (!paypalOrderId) {
      return NextResponse.json({
        success: false,
        error: 'PayPal Order ID is required'
      }, { status: 400 });
    }

    if (!wooOrderId) {
      return NextResponse.json({
        success: false,
        error: 'WooCommerce Order ID is required'
      }, { status: 400 });
    }

    // Capture PayPal payment
    const captureResult = await capturePayPalOrder(paypalOrderId);

    // Check if capture was successful
    const captureStatus = captureResult.status;
    const isSuccess = captureStatus === 'COMPLETED';

    if (!isSuccess) {
      // Update WooCommerce order to failed
      await updateWooCommerceOrder(wooOrderId, { 
        status: 'failed',
        customer_note: `Paiement PayPal non complété. Statut: ${captureStatus}`
      }, localeValue);
      
      return NextResponse.json({
        success: false,
        error: `PayPal payment not completed. Status: ${captureStatus}`,
        captureResult
      }, { status: 400 });
    }

    // Get transaction details
    const purchaseUnit = captureResult.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const transactionId = capture?.id;
    const amount = capture?.amount?.value;

    // Update WooCommerce order to processing/completed
    const updateData = {
      status: 'processing',
      payment_method_title: 'PayPal',
      meta_data: [
        {
          key: '_paypal_transaction_id',
          value: transactionId || paypalOrderId
        },
        {
          key: '_paypal_order_id',
          value: paypalOrderId
        },
        {
          key: '_paypal_capture_id',
          value: capture?.id || ''
        }
      ]
    };

    await updateWooCommerceOrder(wooOrderId, updateData, localeValue);

    return NextResponse.json({
      success: true,
      wooOrderId: wooOrderId,
      transactionId: transactionId,
      amount: amount,
      captureResult: captureResult
    });

  } catch (error) {
    console.error('PayPal capture error:', error);
    
    // If we have a wooOrderId from the request, try to update order status to failed
    // Note: requestData is available in the outer scope
    if (requestData?.wooOrderId) {
      try {
        await updateWooCommerceOrder(requestData.wooOrderId, { 
          status: 'failed',
          customer_note: `Erreur lors de la capture PayPal: ${error.message || 'Erreur inconnue'}`
        }, localeValue);
      } catch (updateError) {
        console.error('Failed to update order status after PayPal capture error:', updateError);
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la capture du paiement PayPal'
    }, { status: 500 });
  }
}
