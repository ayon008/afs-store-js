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
    const { id } = params;

    // Build the API URL
    const baseUrl = WP_BASE_URL.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${id}`;
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
      throw new Error(errorText);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch order details error:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors de la récupération de la commande'
    }, { status: 500 });
  }
}

