import { getLocaleValue } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { NextResponse } from 'next/server';

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

export async function GET(req, { params }) {
  const localeValue = await getLocaleValue();
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 });
    }

    // Build the API URL
    const baseUrl = WP_BASE_URL.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;

    // Add consumer keys to URL for authentication
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
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error?.message || errorJson.error || errorText;
      } catch {
        // Keep the text as is
      }

      throw new Error(errorMessage || `Error ${response.status}: ${response.statusText}`);
    }

    const orderData = await response.json();

    return NextResponse.json({
      success: true,
      payment_url: orderData.payment_url || null,
      checkout_payment_url: orderData.checkout_payment_url || null,
      order_key: orderData.order_key || null,
    });
  } catch (error) {
    console.error('Get payment URL error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error getting payment URL'
    }, { status: 500 });
  }
}

