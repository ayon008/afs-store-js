import { NextResponse } from 'next/server';

/**
 * GET /api/payments/authorize/config
 * Get Accept.js configuration for client-side card tokenization
 *
 * Returns public credentials only (safe to expose to client)
 */
export async function GET() {
  const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
  const clientKey = process.env.AUTHORIZE_NET_CLIENT_KEY;
  const environment = process.env.AUTHORIZE_NET_ENVIRONMENT || 'sandbox';

  if (!apiLoginId) {
    return NextResponse.json({
      success: false,
      error: 'Authorize.Net API Login ID is not configured',
    }, { status: 500 });
  }

  // Client key is required for Accept.js tokenization
  if (!clientKey) {
    return NextResponse.json({
      success: false,
      error: 'Authorize.Net Client Key is not configured. Please add AUTHORIZE_NET_CLIENT_KEY to your environment variables.',
      missingClientKey: true,
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    apiLoginId,
    clientKey,
    environment,
    acceptJsUrl: environment === 'production'
      ? 'https://js.authorize.net/v1/Accept.js'
      : 'https://jstest.authorize.net/v1/Accept.js',
  });
}
