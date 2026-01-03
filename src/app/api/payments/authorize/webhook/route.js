import { NextResponse } from 'next/server';
import { validateWebhookSignature } from '@/lib/authorize-net/AuthorizeNetService';
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

/**
 * Find WooCommerce order by transaction ID
 */
async function findOrderByTransactionId(transactionId, localeValue) {
  const baseUrl = WP_BASE_URL.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders`;

  const url = new URL(apiUrl);
  url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
  url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);
  url.searchParams.set('meta_key', '_authnet_transaction_id');
  url.searchParams.set('meta_value', transactionId);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to find order by transaction ID:', await response.text());
      return null;
    }

    const orders = await response.json();
    return orders.length > 0 ? orders[0] : null;
  } catch (error) {
    console.error('Error finding order:', error);
    return null;
  }
}

/**
 * Update WooCommerce order
 */
async function updateOrder(orderId, updateData, localeValue) {
  const baseUrl = WP_BASE_URL.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;

  const url = new URL(apiUrl);
  url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
  url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

  try {
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
      console.error('Failed to update order:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

/**
 * Add order note
 */
async function addOrderNote(orderId, note, localeValue) {
  const baseUrl = WP_BASE_URL.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}/notes`;

  const url = new URL(apiUrl);
  url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
  url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

  try {
    await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        note,
        customer_note: false,
      }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Error adding order note:', error);
  }
}

/**
 * POST /api/payments/authorize/webhook
 * Handle Authorize.Net webhook notifications
 *
 * Webhook events:
 * - net.authorize.payment.authcapture.created
 * - net.authorize.payment.capture.created
 * - net.authorize.payment.refund.created
 * - net.authorize.payment.void.created
 * - net.authorize.payment.fraud.held
 * - net.authorize.payment.fraud.approved
 * - net.authorize.payment.fraud.declined
 */
export async function POST(req) {
  const localeValue = await getLocaleValue();

  try {
    // Get raw body for signature validation
    const rawBody = await req.text();
    const signature = req.headers.get('x-anet-signature');

    // Validate webhook signature (optional but recommended)
    if (process.env.AUTHORIZE_NET_WEBHOOK_SECRET && signature) {
      const isValid = validateWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);

    console.log('Received Authorize.Net webhook:', {
      eventType: payload.eventType,
      notificationId: payload.notificationId,
    });

    const eventType = payload.eventType;
    const eventPayload = payload.payload;

    if (!eventPayload) {
      return NextResponse.json({ success: true, message: 'No payload to process' });
    }

    const transactionId = eventPayload.id || eventPayload.transId;

    if (!transactionId) {
      console.log('No transaction ID in webhook payload');
      return NextResponse.json({ success: true, message: 'No transaction ID' });
    }

    // Find the order associated with this transaction
    const order = await findOrderByTransactionId(transactionId, localeValue);

    if (!order) {
      console.log(`No order found for transaction ${transactionId}`);
      return NextResponse.json({ success: true, message: 'Order not found' });
    }

    const orderId = order.id;

    // Handle different event types
    switch (eventType) {
      case 'net.authorize.payment.authcapture.created':
      case 'net.authorize.payment.capture.created':
        // Payment captured - ensure order is marked as paid
        if (order.status !== 'processing' && order.status !== 'completed') {
          await updateOrder(orderId, {
            status: 'processing',
            set_paid: true,
          }, localeValue);
          await addOrderNote(
            orderId,
            `Payment confirmed via webhook. Transaction ID: ${transactionId}`,
            localeValue
          );
        }
        break;

      case 'net.authorize.payment.refund.created':
        // Refund processed
        const refundAmount = eventPayload.amount || eventPayload.authAmount;
        await updateOrder(orderId, {
          status: 'refunded',
        }, localeValue);
        await addOrderNote(
          orderId,
          `Refund processed via Authorize.Net. Amount: ${refundAmount}. Transaction ID: ${transactionId}`,
          localeValue
        );
        break;

      case 'net.authorize.payment.void.created':
        // Transaction voided
        await updateOrder(orderId, {
          status: 'cancelled',
        }, localeValue);
        await addOrderNote(
          orderId,
          `Transaction voided via Authorize.Net. Transaction ID: ${transactionId}`,
          localeValue
        );
        break;

      case 'net.authorize.payment.fraud.held':
        // Transaction held for review
        await updateOrder(orderId, {
          status: 'on-hold',
        }, localeValue);
        await addOrderNote(
          orderId,
          `Transaction held for fraud review by Authorize.Net. Transaction ID: ${transactionId}`,
          localeValue
        );
        break;

      case 'net.authorize.payment.fraud.approved':
        // Fraud review approved
        await updateOrder(orderId, {
          status: 'processing',
          set_paid: true,
        }, localeValue);
        await addOrderNote(
          orderId,
          `Fraud review approved by Authorize.Net. Transaction ID: ${transactionId}`,
          localeValue
        );
        break;

      case 'net.authorize.payment.fraud.declined':
        // Fraud review declined
        await updateOrder(orderId, {
          status: 'failed',
        }, localeValue);
        await addOrderNote(
          orderId,
          `Transaction declined due to fraud review by Authorize.Net. Transaction ID: ${transactionId}`,
          localeValue
        );
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${eventType} event`,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Webhook processing failed',
    }, { status: 500 });
  }
}

/**
 * GET /api/payments/authorize/webhook
 * Health check endpoint for webhook configuration
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Authorize.Net webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
