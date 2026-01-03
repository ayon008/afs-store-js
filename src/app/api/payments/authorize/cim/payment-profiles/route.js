import { NextResponse } from 'next/server';
import {
  createPaymentProfile,
  getPaymentProfile,
  deletePaymentProfile,
  getCustomerProfile,
} from '@/lib/authorize-net/AuthorizeNetService';

/**
 * GET /api/payments/authorize/cim/payment-profiles
 * Get payment profiles for a customer
 *
 * Query params:
 * - customerProfileId: Customer profile ID
 * - paymentProfileId: Optional specific payment profile ID
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const customerProfileId = searchParams.get('customerProfileId');
    const paymentProfileId = searchParams.get('paymentProfileId');

    if (!customerProfileId) {
      return NextResponse.json({
        success: false,
        error: 'customerProfileId is required',
      }, { status: 400 });
    }

    if (paymentProfileId) {
      // Get specific payment profile
      const result = await getPaymentProfile(customerProfileId, paymentProfileId);

      return NextResponse.json({
        success: true,
        paymentProfile: {
          paymentProfileId: result.paymentProfile?.customerPaymentProfileId,
          cardNumber: result.paymentProfile?.payment?.creditCard?.cardNumber || 'XXXX',
          cardType: result.paymentProfile?.payment?.creditCard?.cardType || 'Unknown',
          expirationDate: result.paymentProfile?.payment?.creditCard?.expirationDate,
          billTo: result.paymentProfile?.billTo,
        },
      });
    }

    // Get all payment profiles for customer
    const result = await getCustomerProfile(customerProfileId);

    const paymentProfiles = result.profile?.paymentProfiles?.map(pp => ({
      paymentProfileId: pp.customerPaymentProfileId,
      cardNumber: pp.payment?.creditCard?.cardNumber || 'XXXX',
      cardType: pp.payment?.creditCard?.cardType || 'Unknown',
      expirationDate: pp.payment?.creditCard?.expirationDate,
      billTo: pp.billTo,
      isDefault: pp.defaultPaymentProfile || false,
    })) || [];

    return NextResponse.json({
      success: true,
      paymentProfiles,
    });

  } catch (error) {
    console.error('Get payment profiles error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get payment profiles',
    }, { status: 500 });
  }
}

/**
 * POST /api/payments/authorize/cim/payment-profiles
 * Create a new payment profile for a customer
 *
 * Body:
 * - customerProfileId: Customer profile ID
 * - opaqueData: Token from Accept.js
 * - billTo: Billing address
 * - defaultPaymentProfile: Set as default (optional)
 */
export async function POST(req) {
  try {
    const data = await req.json();
    const { customerProfileId, opaqueData, billTo, defaultPaymentProfile = false } = data;

    if (!customerProfileId) {
      return NextResponse.json({
        success: false,
        error: 'customerProfileId is required',
      }, { status: 400 });
    }

    if (!opaqueData || !opaqueData.dataDescriptor || !opaqueData.dataValue) {
      return NextResponse.json({
        success: false,
        error: 'Valid opaqueData is required',
      }, { status: 400 });
    }

    if (!billTo) {
      return NextResponse.json({
        success: false,
        error: 'Billing address is required',
      }, { status: 400 });
    }

    const result = await createPaymentProfile({
      customerProfileId,
      opaqueData,
      billTo,
      defaultPaymentProfile,
    });

    return NextResponse.json({
      success: true,
      paymentProfileId: result.paymentProfileId,
    });

  } catch (error) {
    console.error('Create payment profile error:', error);

    // Check for duplicate card
    if (error.code === 'E00039') {
      return NextResponse.json({
        success: false,
        error: 'This card is already saved to your account',
        code: 'DUPLICATE_CARD',
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create payment profile',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/payments/authorize/cim/payment-profiles
 * Delete a payment profile
 *
 * Query params:
 * - customerProfileId: Customer profile ID
 * - paymentProfileId: Payment profile ID to delete
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const customerProfileId = searchParams.get('customerProfileId');
    const paymentProfileId = searchParams.get('paymentProfileId');

    if (!customerProfileId || !paymentProfileId) {
      return NextResponse.json({
        success: false,
        error: 'customerProfileId and paymentProfileId are required',
      }, { status: 400 });
    }

    await deletePaymentProfile(customerProfileId, paymentProfileId);

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully',
    });

  } catch (error) {
    console.error('Delete payment profile error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete payment method',
    }, { status: 500 });
  }
}
