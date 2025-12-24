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

    const data = await req.json();

    // Validate required fields
    if (!data.billing_email) {
      return NextResponse.json({
        success: false,
        error: 'L\'adresse email est requise'
      }, { status: 400 });
    }

    if (!data.line_items || data.line_items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Le panier est vide'
      }, { status: 400 });
    }

    // Map the incoming data to WooCommerce order structure
    const orderData = {
      payment_method: data.payment_method,
      payment_method_title: data.payment_method_title || data.payment_method,
      set_paid: false,
      billing: {
        first_name: data.billing_first_name || data.billing?.first_name,
        last_name: data.billing_last_name || data.billing?.last_name,
        company: data.billing_company || data.billing?.company || '',
        address_1: data.billing_address_1 || data.billing?.address_1,
        city: data.billing_city || data.billing?.city,
        state: data.billing_state || data.billing?.state || '',
        postcode: data.billing_postcode || data.billing?.postcode,
        country: data.billing_country || data.billing?.country,
        email: data.billing_email || data.billing?.email,
        phone: data.billing_phone || data.billing?.phone || '',
      },
      shipping: {
        first_name: data.shipping_first_name || data.shipping?.first_name || data.billing_first_name || data.billing?.first_name,
        last_name: data.shipping_last_name || data.shipping?.last_name || data.billing_last_name || data.billing?.last_name,
        company: data.shipping_company || data.shipping?.company || data.billing_company || data.billing?.company || '',
        address_1: data.shipping_address_1 || data.shipping?.address_1 || data.billing_address_1 || data.billing?.address_1,
        city: data.shipping_city || data.shipping?.city || data.billing_city || data.billing?.city,
        state: data.shipping_state || data.shipping?.state || data.billing_state || data.billing?.state || '',
        postcode: data.shipping_postcode || data.shipping?.postcode || data.billing_postcode || data.billing?.postcode,
        country: data.shipping_country || data.shipping?.country || data.billing_country || data.billing?.country,
      },
      line_items: data.line_items || [],
      shipping_lines: data.shipping_lines || [],
      customer_note: data.order_comments || '',
      status: data.payment_method === 'bacs' ? 'on-hold' : 'pending',
    };

    // Build the API URL
    const baseUrl = WP_BASE_URL.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders`;

    // Add consumer keys to URL for authentication
    const url = new URL(apiUrl);
    url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
    url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(orderData),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      let errorCode = null;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error?.message || errorJson.error || errorText;
        errorCode = errorJson.code || errorJson.error?.code;
      } catch {
        // Keep the text as is
      }

      console.error('WooCommerce API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorCode,
        errorMessage,
        url: url.toString()
      });

      throw new Error(errorMessage || `Erreur ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    return NextResponse.json({
      success: true,
      orderId: responseData.id,
      orderNumber: responseData.number,
      status: responseData.status,
      payment_url: responseData.payment_url || null,
      checkout_payment_url: responseData.checkout_payment_url || null,
      orderKey: responseData.order_key || null,
      order_key: responseData.order_key || null,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la création de la commande'
    }, { status: 500 });
  }
}

