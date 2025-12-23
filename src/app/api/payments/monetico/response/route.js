import { NextResponse } from 'next/server';
import { getMoneticoConfig } from '@/lib/monetico-config';
import MoneticoPayment, { convertMoneticoFormData, logMoneticoResponse } from '@/lib/monetico';
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
    const formData = await req.formData();
    const responseData = convertMoneticoFormData(formData);

    logMoneticoResponse(responseData, 'Confirmation');

    const orderId = responseData.reference;
    const config = getMoneticoConfig(orderId);
    const monetico = new MoneticoPayment(config);

    // Verify MAC
    const isValid = monetico.verifyResponseMac(responseData);

    if (!isValid) {
      console.error('Invalid MAC received from Monetico');
      const confirmation = monetico.createConfirmationResponse(false);
      return new Response(confirmation.response, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const details = monetico.parseResponse(responseData);

    // Build the API URL
    const baseUrl = WP_BASE_URL.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;
    const url = new URL(apiUrl);
    url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
    url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

    if (details.isSuccess) {
      // Update order in WooCommerce
      await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          status: 'processing',
          set_paid: true,
          transaction_id: details.transactionId,
          customer_note: `Paiement Monetico réussi. Autorisation: ${details.authorizationNumber}`
        }),
        cache: 'no-store',
      });
    } else {
      // Mark as failed
      await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          status: 'failed',
          customer_note: `Paiement Monetico échoué. Code: ${details.returnCode}`
        }),
        cache: 'no-store',
      });
    }

    const confirmation = monetico.createConfirmationResponse(true);
    return new Response(confirmation.response, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Monetico response handling error:', error);
    return new Response('version=2\ncdr=1\n', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

