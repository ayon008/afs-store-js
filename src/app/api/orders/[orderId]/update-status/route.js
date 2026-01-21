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

async function updateWooCommerceOrderStatus(orderId, status, note = null, localeValue) {
  const baseUrl = WP_BASE_URL.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;

  const url = new URL(apiUrl);
  url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
  url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

  const updateData = {
    status: status
  };

  // Add customer note if provided
  if (note) {
    updateData.customer_note = note;
  }

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
    console.error('Failed to update WooCommerce order status:', errorText);
    throw new Error(`Failed to update order status: ${errorText}`);
  }

  return response.json();
}

export async function POST(req, { params }) {
  const localeValue = await getLocaleValue();
  
  try {
    // Validate environment variables
    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Configuration WooCommerce manquante. Veuillez contacter l\'administrateur.'
      }, { status: 500 });
    }

    const { orderId } = await params;
    const { status, note, paymentMethod } = await req.json();

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required'
      }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    // Build note with payment method info if provided
    let finalNote = note;
    if (paymentMethod && !note) {
      const paymentMethodNames = {
        'paypal': 'PayPal',
        'monetico': 'Monetico',
        'authnet': 'Authorize.Net',
        'authorize': 'Authorize.Net'
      };
      const methodName = paymentMethodNames[paymentMethod.toLowerCase()] || paymentMethod;
      finalNote = `Paiement ${methodName} échoué ou annulé.`;
    }

    // Update order status
    await updateWooCommerceOrderStatus(orderId, status, finalNote, localeValue);

    return NextResponse.json({
      success: true,
      orderId: orderId,
      status: status
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la mise à jour du statut de la commande'
    }, { status: 500 });
  }
}
