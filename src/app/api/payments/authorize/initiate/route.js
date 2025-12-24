import { NextResponse } from 'next/server';
import { getLocaleValue } from '@/app/actions/Woo-Coommerce/getWooCommerce';

const WP_BASE_URL = process.env.WP_BASE_URL || 'https://staging.afs-foiling.com/fr';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getAuthHeader() {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured');
  }
  const token = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

export async function POST(req) {
  const localeValue = await getLocaleValue();
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get order details from WooCommerce
    const baseUrl = WP_BASE_URL.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;

    const url = new URL(apiUrl);
    url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
    url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to get order');
    }

    const orderData = await response.json();

    // Get payment URL - WooCommerce should provide this for Authorize.Net
    const paymentUrl = orderData.payment_url || orderData.checkout_payment_url;

    if (paymentUrl) {
      return NextResponse.json({
        success: true,
        payment_url: paymentUrl,
        order_key: orderData.order_key
      });
    }

    // If no payment URL, construct it using WooCommerce checkout URL
    // For Authorize.Net, WooCommerce uses the order payment page which should display the payment form
    const orderKey = orderData.order_key;
    
    if (!orderKey) {
      throw new Error('Order key is missing');
    }

    // Use standard WooCommerce checkout order payment URL
    // This URL should trigger Authorize.Net payment gateway to display the payment form
    // Format: /checkout/order-pay/{order_id}/?pay_for_order=true&key={order_key}
    const constructedUrl = `${baseUrl}/${localeValue}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}`;

    console.log('Constructed Authorize.Net payment URL:', constructedUrl);
    console.log('Order ID:', orderId, 'Order Key:', orderKey);

    return NextResponse.json({
      success: true,
      payment_url: constructedUrl,
      order_key: orderKey,
      order_id: orderId
    });

  } catch (error) {
    console.error('Authorize payment initiation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

