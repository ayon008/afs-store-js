import { NextResponse } from 'next/server';
import {
  createCustomerProfile,
  getCustomerProfile,
  getCustomerProfileByMerchantId,
  deleteCustomerProfile,
  generateMerchantCustomerId,
} from '@/lib/authorize-net/AuthorizeNetService';

/**
 * GET /api/payments/authorize/cim/profiles
 * Get customer profile by merchant customer ID (email-based)
 *
 * Query params:
 * - email: Customer email to find profile for
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const customerProfileId = searchParams.get('customerProfileId');

    if (!email && !customerProfileId) {
      return NextResponse.json({
        success: false,
        error: 'Email or customerProfileId is required',
      }, { status: 400 });
    }

    let result;

    if (customerProfileId) {
      // Get profile by ID
      result = await getCustomerProfile(customerProfileId);
    } else {
      // Search by merchant customer ID (derived from email)
      // Use the same generation function to ensure consistency
      const merchantCustomerIdBase = generateMerchantCustomerId(email);

      result = await getCustomerProfileByMerchantId(merchantCustomerIdBase);

      if (!result.success) {
        // Profile not found is not an error - return empty
        return NextResponse.json({
          success: true,
          profile: null,
          paymentProfiles: [],
        });
      }
    }

    // Extract payment profiles
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
      customerProfileId: result.profile?.customerProfileId,
      email: result.profile?.email,
      paymentProfiles,
    });

  } catch (error) {
    console.error('Get customer profile error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get customer profile',
    }, { status: 500 });
  }
}

/**
 * POST /api/payments/authorize/cim/profiles
 * Create a new customer profile
 *
 * Body:
 * - email: Customer email
 * - description: Optional description
 */
export async function POST(req) {
  try {
    const data = await req.json();
    const { email, description } = data;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required',
      }, { status: 400 });
    }

    // Generate merchant customer ID from email (max 20 chars for Authorize.Net)
    const merchantCustomerId = generateMerchantCustomerId(email);

    const result = await createCustomerProfile({
      merchantCustomerId,
      email,
      description,
    });

    return NextResponse.json({
      success: true,
      customerProfileId: result.customerProfileId,
      merchantCustomerId,
    });

  } catch (error) {
    console.error('Create customer profile error:', error);

    // Check if profile already exists
    if (error.code === 'E00039') {
      return NextResponse.json({
        success: false,
        error: 'A customer profile already exists for this email',
        code: 'PROFILE_EXISTS',
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create customer profile',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/payments/authorize/cim/profiles
 * Delete a customer profile
 *
 * Query params:
 * - customerProfileId: Profile ID to delete
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const customerProfileId = searchParams.get('customerProfileId');

    if (!customerProfileId) {
      return NextResponse.json({
        success: false,
        error: 'customerProfileId is required',
      }, { status: 400 });
    }

    await deleteCustomerProfile(customerProfileId);

    return NextResponse.json({
      success: true,
      message: 'Customer profile deleted successfully',
    });

  } catch (error) {
    console.error('Delete customer profile error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete customer profile',
    }, { status: 500 });
  }
}
