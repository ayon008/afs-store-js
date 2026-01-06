import { NextResponse } from 'next/server';
import { getLocaleValue } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import {
  createTransaction,
  createTransactionFromProfile,
  createCustomerProfileWithPayment,
  getCustomerProfileByMerchantId,
  createPaymentProfile,
  parseResponseCode,
  AuthorizeNetError,
  generateMerchantCustomerId,
} from '@/lib/authorize-net/AuthorizeNetService';

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
 * Create WooCommerce order
 */
async function createWooCommerceOrder(orderData, localeValue) {
  const baseUrl = WP_BASE_URL.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders`;

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
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error?.message || errorText;
    } catch {
      // Keep text as is
    }
    throw new Error(`Failed to create order: ${errorMessage}`);
  }

  return response.json();
}

/**
 * Update WooCommerce order status and add transaction data
 */
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
    console.error('Failed to update WooCommerce order:', errorText);
    // Don't throw here - payment was successful, order update failure shouldn't fail the transaction
  }

  return response.json();
}

/**
 * Add order note
 */
async function addOrderNote(orderId, note, localeValue, customerNote = false) {
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
        customer_note: customerNote,
      }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Failed to add order note:', error);
  }
}

export async function POST(req) {
  const localeValue = await getLocaleValue();

  try {
    // Validate environment variables
    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'WooCommerce configuration missing',
      }, { status: 500 });
    }

    if (!process.env.AUTHORIZE_NET_API_LOGIN_ID || !process.env.AUTHORIZE_NET_TRANSACTION_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Authorize.Net configuration missing',
      }, { status: 500 });
    }

    const data = await req.json();
    const {
      opaqueData,
      orderData,
      customerProfileId,
      paymentProfileId,
      saveCard = false,
      cardInfo = {},
    } = data;

    // Validate required data
    if (!orderData) {
      return NextResponse.json({
        success: false,
        error: 'Order data is required',
      }, { status: 400 });
    }

    // Either opaqueData or saved profile is required
    if (!opaqueData && (!customerProfileId || !paymentProfileId)) {
      return NextResponse.json({
        success: false,
        error: 'Payment information is required (either card details or saved payment method)',
      }, { status: 400 });
    }

    // Validate billing email
    const billingEmail = orderData.billing_email || orderData.billing?.email;
    if (!billingEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required',
      }, { status: 400 });
    }

    // Validate line items
    if (!orderData.line_items || orderData.line_items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cart is empty',
      }, { status: 400 });
    }

    // Get customer IP
    const customerIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       req.headers.get('x-real-ip') ||
                       'unknown';

    // Step 1: Create WooCommerce order with pending status
    const wcOrderData = {
      payment_method: 'authnet',
      payment_method_title: 'Credit Card (Authorize.Net)',
      set_paid: false,
      status: 'pending',
      billing: {
        first_name: orderData.billing_first_name || orderData.billing?.first_name || '',
        last_name: orderData.billing_last_name || orderData.billing?.last_name || '',
        company: orderData.billing_company || orderData.billing?.company || '',
        address_1: orderData.billing_address_1 || orderData.billing?.address_1 || '',
        city: orderData.billing_city || orderData.billing?.city || '',
        state: orderData.billing_state || orderData.billing?.state || '',
        postcode: orderData.billing_postcode || orderData.billing?.postcode || '',
        country: orderData.billing_country || orderData.billing?.country || '',
        email: billingEmail,
        phone: orderData.billing_phone || orderData.billing?.phone || '',
      },
      shipping: {
        first_name: orderData.shipping_first_name || orderData.shipping?.first_name || orderData.billing_first_name || orderData.billing?.first_name || '',
        last_name: orderData.shipping_last_name || orderData.shipping?.last_name || orderData.billing_last_name || orderData.billing?.last_name || '',
        company: orderData.shipping_company || orderData.shipping?.company || '',
        address_1: orderData.shipping_address_1 || orderData.shipping?.address_1 || orderData.billing_address_1 || orderData.billing?.address_1 || '',
        city: orderData.shipping_city || orderData.shipping?.city || orderData.billing_city || orderData.billing?.city || '',
        state: orderData.shipping_state || orderData.shipping?.state || orderData.billing_state || orderData.billing?.state || '',
        postcode: orderData.shipping_postcode || orderData.shipping?.postcode || orderData.billing_postcode || orderData.billing?.postcode || '',
        country: orderData.shipping_country || orderData.shipping?.country || orderData.billing_country || orderData.billing?.country || '',
      },
      line_items: orderData.line_items,
      shipping_lines: orderData.shipping_lines || [],
      customer_note: orderData.order_comments || '',
    };

    let order;
    try {
      order = await createWooCommerceOrder(wcOrderData, localeValue);
    } catch (error) {
      console.error('Failed to create WooCommerce order:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to create order',
      }, { status: 500 });
    }

    const orderId = order.id;
    const orderTotal = parseFloat(order.total);

    // Step 2: Process payment with Authorize.Net
    let transactionResult;

    try {
      if (customerProfileId && paymentProfileId) {
        // Use saved payment profile
        transactionResult = await createTransactionFromProfile({
          customerProfileId,
          paymentProfileId,
          amount: orderTotal,
          order: {
            invoiceNumber: `WC-${orderId}`,
            description: `Order #${orderId} from AFS Store`,
          },
        });
      } else {
        // Use opaqueData from Accept.js
        const billTo = {
          firstName: wcOrderData.billing.first_name,
          lastName: wcOrderData.billing.last_name,
          company: wcOrderData.billing.company,
          address: wcOrderData.billing.address_1,
          city: wcOrderData.billing.city,
          state: wcOrderData.billing.state,
          zip: wcOrderData.billing.postcode,
          country: wcOrderData.billing.country,
          email: wcOrderData.billing.email,
          phone: wcOrderData.billing.phone,
        };

        const shipTo = {
          firstName: wcOrderData.shipping.first_name,
          lastName: wcOrderData.shipping.last_name,
          company: wcOrderData.shipping.company,
          address: wcOrderData.shipping.address_1,
          city: wcOrderData.shipping.city,
          state: wcOrderData.shipping.state,
          zip: wcOrderData.shipping.postcode,
          country: wcOrderData.shipping.country,
        };

        transactionResult = await createTransaction({
          opaqueData,
          amount: orderTotal,
          order: {
            invoiceNumber: `WC-${orderId}`,
            description: `Order #${orderId} from AFS Store`,
          },
          billTo,
          shipTo,
          customerIP,
        });
      }
    } catch (error) {
      console.error('Authorize.Net transaction error:', error);

      // Update order to failed status
      await updateWooCommerceOrder(orderId, { status: 'failed' }, localeValue);
      await addOrderNote(orderId, `Payment failed: ${error.message}`, localeValue);

      return NextResponse.json({
        success: false,
        error: error.message || 'Payment processing failed',
        orderId,
      }, { status: 400 });
    }

    // Step 3: Handle transaction result
    if (!transactionResult.success) {
      const errorMessages = transactionResult.errors?.map(e => e.errorText).join(', ') ||
                           transactionResult.messages?.[0]?.description ||
                           'Transaction declined';

      // Update order to failed status
      await updateWooCommerceOrder(orderId, { status: 'failed' }, localeValue);
      await addOrderNote(orderId, `Payment declined: ${errorMessages}`, localeValue);

      return NextResponse.json({
        success: false,
        error: errorMessages,
        orderId,
        responseCode: transactionResult.responseCode,
      }, { status: 400 });
    }

    // Step 4: Payment successful - update order
    const updateData = {
      status: 'processing',
      set_paid: true,
      transaction_id: transactionResult.transactionId,
      meta_data: [
        { key: '_authnet_transaction_id', value: transactionResult.transactionId },
        { key: '_authnet_auth_code', value: transactionResult.authCode || '' },
        { key: '_authnet_account_number', value: transactionResult.accountNumber || '' },
        { key: '_authnet_account_type', value: transactionResult.accountType || '' },
        { key: '_authnet_card_type', value: cardInfo.cardType || cardInfo.cardTypeName || '' },
        { key: '_authnet_card_last_four', value: cardInfo.lastFour || '' },
      ],
    };

    await updateWooCommerceOrder(orderId, updateData, localeValue);

    // Build detailed payment note
    const cardDetails = cardInfo.cardTypeName || cardInfo.cardType || 'Card';
    const lastFour = cardInfo.lastFour ? ` ending in ${cardInfo.lastFour}` : '';
    await addOrderNote(
      orderId,
      `Payment successful via Authorize.Net (${cardDetails}${lastFour}). Transaction ID: ${transactionResult.transactionId}, Auth Code: ${transactionResult.authCode}`,
      localeValue
    );

    // Step 5: Save card to CIM profile if requested
    let savedProfileInfo = null;

    if (saveCard && opaqueData && !customerProfileId) {
      try {
        // Generate a unique merchant customer ID based on email (max 20 chars for Authorize.Net)
        const merchantCustomerId = generateMerchantCustomerId(billingEmail);

        // Check if customer already has a profile
        const existingProfile = await getCustomerProfileByMerchantId(merchantCustomerId);

        if (existingProfile.success && existingProfile.customerProfileId) {
          // Add payment profile to existing customer
          const paymentResult = await createPaymentProfile({
            customerProfileId: existingProfile.customerProfileId,
            opaqueData,
            billTo: {
              firstName: wcOrderData.billing.first_name,
              lastName: wcOrderData.billing.last_name,
              address: wcOrderData.billing.address_1,
              city: wcOrderData.billing.city,
              state: wcOrderData.billing.state,
              zip: wcOrderData.billing.postcode,
              country: wcOrderData.billing.country,
            },
          });

          savedProfileInfo = {
            customerProfileId: existingProfile.customerProfileId,
            paymentProfileId: paymentResult.paymentProfileId,
          };
        } else {
          // Create new customer profile with payment
          const profileResult = await createCustomerProfileWithPayment({
            merchantCustomerId,
            email: billingEmail,
            opaqueData,
            billTo: {
              firstName: wcOrderData.billing.first_name,
              lastName: wcOrderData.billing.last_name,
              address: wcOrderData.billing.address_1,
              city: wcOrderData.billing.city,
              state: wcOrderData.billing.state,
              zip: wcOrderData.billing.postcode,
              country: wcOrderData.billing.country,
              email: billingEmail,
            },
          });

          savedProfileInfo = {
            customerProfileId: profileResult.customerProfileId,
            paymentProfileId: profileResult.paymentProfileIds?.[0],
          };
        }

        // Store profile info in order meta
        if (savedProfileInfo.customerProfileId) {
          await updateWooCommerceOrder(orderId, {
            meta_data: [
              { key: '_authnet_customer_profile_id', value: savedProfileInfo.customerProfileId },
              { key: '_authnet_payment_profile_id', value: savedProfileInfo.paymentProfileId || '' },
            ],
          }, localeValue);
        }
      } catch (error) {
        console.error('Failed to save card to profile:', error);
        // Don't fail the transaction if card saving fails
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      orderId,
      orderNumber: order.number,
      orderKey: order.order_key,
      transactionId: transactionResult.transactionId,
      authCode: transactionResult.authCode,
      cardType: cardInfo.cardType || cardInfo.cardTypeName || transactionResult.accountType || null,
      cardLastFour: cardInfo.lastFour || transactionResult.accountNumber?.slice(-4) || null,
      savedProfile: savedProfileInfo,
    });

  } catch (error) {
    console.error('Payment process error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred',
    }, { status: 500 });
  }
}
