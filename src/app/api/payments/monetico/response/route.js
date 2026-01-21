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
  let orderId = null;
  
  try {
    const formData = await req.formData();
    const responseData = convertMoneticoFormData(formData);

    logMoneticoResponse(responseData, 'Confirmation');

    orderId = responseData.reference;
    
    if (!orderId) {
      console.error('Monetico response missing order reference');
      return new Response('version=2\ncdr=1\n', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Detect payment type from TPE in response
    // Compare with configured TPEs to determine if it's split or immediate
    const receivedTpe = responseData.TPE;
    const immediateTpe = process.env.MONETICO_TPE_IMMEDIATE || process.env.MONETICO_TPE;
    const splitTpe = process.env.MONETICO_TPE_SPLIT;
    
    // Determine payment type based on TPE match
    let paymentType = 'immediate'; // default
    if (splitTpe && receivedTpe === splitTpe) {
      paymentType = 'split';
    } else if (immediateTpe && receivedTpe === immediateTpe) {
      paymentType = 'immediate';
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Monetico Response: Detected payment type', {
        receivedTpe,
        immediateTpe,
        splitTpe,
        paymentType,
        orderId
      });
    }
    
    const config = getMoneticoConfig(orderId, paymentType);
    const monetico = new MoneticoPayment(config);

    // Verify MAC
    const isValid = monetico.verifyResponseMac(responseData);

    if (!isValid) {
      console.error('Invalid MAC received from Monetico for order:', orderId);
      
      // Try to update order status to failed even if MAC is invalid
      // This helps track orders that failed validation
      try {
        const baseUrl = WP_BASE_URL.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;
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
            customer_note: 'Paiement Monetico échoué - MAC invalide'
          }),
          cache: 'no-store',
        });
      } catch (updateError) {
        console.error('Failed to update order status after MAC validation failure:', updateError);
      }
      
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
      console.log(`[Monetico Response] Payment failed for order ${orderId}, code: ${details.returnCode}`);
      
      const updateResponse = await fetch(url.toString(), {
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
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`[Monetico Response] Failed to update order ${orderId} to failed status:`, errorText);
      } else {
        console.log(`[Monetico Response] Order ${orderId} successfully updated to failed status`);
      }
    }

    const confirmation = monetico.createConfirmationResponse(true);
    return new Response(confirmation.response, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Monetico response handling error:', error);
    
    // If we have an orderId from earlier in the function, try to update it to failed status
    if (orderId) {
      try {
        const baseUrl = WP_BASE_URL.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;
        const url = new URL(apiUrl);
        url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
        url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

        const updateResponse = await fetch(url.toString(), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            status: 'failed',
            customer_note: `Erreur lors du traitement de la réponse Monetico: ${error.message || 'Erreur inconnue'}`
          }),
          cache: 'no-store',
        });
        
        if (updateResponse.ok) {
          console.log(`[Monetico Response] Order ${orderId} updated to failed due to processing error`);
        } else {
          const errorText = await updateResponse.text();
          console.error(`[Monetico Response] Failed to update order ${orderId} to failed:`, errorText);
        }
      } catch (updateError) {
        console.error('Failed to update order status after Monetico response error:', updateError);
      }
    } else {
      console.warn('[Monetico Response] No orderId available to update status');
    }
    
    return new Response('version=2\ncdr=1\n', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

