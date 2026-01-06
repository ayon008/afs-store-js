/**
 * Authorize.Net Service
 *
 * Service class for communicating with Authorize.Net API (XML)
 * Handles transactions, CIM profiles, and validation
 *
 * @class AuthorizeNetService
 */

const AUTHORIZE_NET_SANDBOX_URL = 'https://apitest.authorize.net/xml/v1/request.api';
const AUTHORIZE_NET_PRODUCTION_URL = 'https://api.authorize.net/xml/v1/request.api';

/**
 * Get API URL based on environment
 * @returns {string}
 */
function getApiUrl() {
  const environment = process.env.AUTHORIZE_NET_ENVIRONMENT || 'sandbox';
  return environment === 'production' ? AUTHORIZE_NET_PRODUCTION_URL : AUTHORIZE_NET_SANDBOX_URL;
}

/**
 * Get merchant authentication object
 * @returns {object}
 */
function getMerchantAuthentication() {
  return {
    name: process.env.AUTHORIZE_NET_API_LOGIN_ID,
    transactionKey: process.env.AUTHORIZE_NET_TRANSACTION_KEY,
  };
}

/**
 * Make API request to Authorize.Net
 * @param {object} requestBody - Request body
 * @returns {Promise<object>}
 */
async function makeApiRequest(requestBody) {
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  // Check for errors
  if (data.messages?.resultCode === 'Error') {
    const errorMessage = data.messages?.message?.[0]?.text || 'Unknown error';
    const errorCode = data.messages?.message?.[0]?.code || 'E00000';
    throw new AuthorizeNetError(errorMessage, errorCode, data);
  }

  return data;
}

/**
 * Custom error class for Authorize.Net errors
 */
export class AuthorizeNetError extends Error {
  constructor(message, code, response) {
    super(message);
    this.name = 'AuthorizeNetError';
    this.code = code;
    this.response = response;
  }
}

/**
 * Create a transaction with opaqueData from Accept.js
 *
 * @param {object} params
 * @param {object} params.opaqueData - Token data from Accept.js
 * @param {string} params.opaqueData.dataDescriptor
 * @param {string} params.opaqueData.dataValue
 * @param {number} params.amount - Transaction amount
 * @param {object} params.order - Order information
 * @param {string} params.order.invoiceNumber
 * @param {string} params.order.description
 * @param {object} params.billTo - Billing address
 * @param {object} params.shipTo - Shipping address (optional)
 * @param {string} params.customerIP - Customer IP address (optional)
 * @param {string} params.transactionType - 'authCaptureTransaction' or 'authOnlyTransaction'
 * @returns {Promise<object>}
 */
export async function createTransaction({
  opaqueData,
  amount,
  order,
  billTo,
  shipTo,
  customerIP,
  transactionType = 'authCaptureTransaction',
}) {
  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      transactionRequest: {
        transactionType,
        amount: amount.toFixed(2),
        payment: {
          opaqueData: {
            dataDescriptor: opaqueData.dataDescriptor,
            dataValue: opaqueData.dataValue,
          },
        },
        order: {
          invoiceNumber: order.invoiceNumber?.substring(0, 20) || '',
          description: order.description?.substring(0, 255) || '',
        },
        billTo: formatAddress(billTo),
        ...(shipTo && { shipTo: formatAddress(shipTo, false) }),
        ...(customerIP && { customerIP }),
      },
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: response.transactionResponse?.responseCode === '1',
    transactionId: response.transactionResponse?.transId,
    authCode: response.transactionResponse?.authCode,
    avsResultCode: response.transactionResponse?.avsResultCode,
    cvvResultCode: response.transactionResponse?.cvvResultCode,
    accountNumber: response.transactionResponse?.accountNumber,
    accountType: response.transactionResponse?.accountType,
    messages: response.transactionResponse?.messages,
    errors: response.transactionResponse?.errors,
    responseCode: response.transactionResponse?.responseCode,
    rawResponse: response,
  };
}

/**
 * Create a transaction using a saved payment profile (CIM)
 *
 * @param {object} params
 * @param {string} params.customerProfileId
 * @param {string} params.paymentProfileId
 * @param {number} params.amount
 * @param {object} params.order
 * @param {string} params.transactionType
 * @returns {Promise<object>}
 */
export async function createTransactionFromProfile({
  customerProfileId,
  paymentProfileId,
  amount,
  order,
  transactionType = 'authCaptureTransaction',
}) {
  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      transactionRequest: {
        transactionType,
        amount: amount.toFixed(2),
        profile: {
          customerProfileId,
          paymentProfile: {
            paymentProfileId,
          },
        },
        order: {
          invoiceNumber: order.invoiceNumber?.substring(0, 20) || '',
          description: order.description?.substring(0, 255) || '',
        },
      },
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: response.transactionResponse?.responseCode === '1',
    transactionId: response.transactionResponse?.transId,
    authCode: response.transactionResponse?.authCode,
    responseCode: response.transactionResponse?.responseCode,
    messages: response.transactionResponse?.messages,
    errors: response.transactionResponse?.errors,
    rawResponse: response,
  };
}

/**
 * Capture a previously authorized transaction
 *
 * @param {string} transactionId - Original transaction ID
 * @param {number} amount - Amount to capture (optional, defaults to original amount)
 * @returns {Promise<object>}
 */
export async function captureTransaction(transactionId, amount = null) {
  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      transactionRequest: {
        transactionType: 'priorAuthCaptureTransaction',
        refTransId: transactionId,
        ...(amount !== null && { amount: amount.toFixed(2) }),
      },
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: response.transactionResponse?.responseCode === '1',
    transactionId: response.transactionResponse?.transId,
    responseCode: response.transactionResponse?.responseCode,
    rawResponse: response,
  };
}

/**
 * Void a transaction
 *
 * @param {string} transactionId - Transaction ID to void
 * @returns {Promise<object>}
 */
export async function voidTransaction(transactionId) {
  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      transactionRequest: {
        transactionType: 'voidTransaction',
        refTransId: transactionId,
      },
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: response.transactionResponse?.responseCode === '1',
    transactionId: response.transactionResponse?.transId,
    rawResponse: response,
  };
}

/**
 * Refund a transaction
 *
 * @param {string} transactionId - Original transaction ID
 * @param {number} amount - Amount to refund
 * @param {string} cardNumber - Last 4 digits of card (required for refunds)
 * @returns {Promise<object>}
 */
export async function refundTransaction(transactionId, amount, cardNumber) {
  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      transactionRequest: {
        transactionType: 'refundTransaction',
        amount: amount.toFixed(2),
        refTransId: transactionId,
        payment: {
          creditCard: {
            cardNumber,
            expirationDate: 'XXXX', // Use XXXX for refunds
          },
        },
      },
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: response.transactionResponse?.responseCode === '1',
    transactionId: response.transactionResponse?.transId,
    rawResponse: response,
  };
}

// ==================== CIM PROFILE MANAGEMENT ====================

/**
 * Generate a merchant customer ID that respects Authorize.Net's 20 character limit
 * Format: cust_<hash> where hash is derived from email
 * 
 * @param {string} email - Customer email
 * @returns {string} merchantCustomerId (max 20 characters)
 */
export function generateMerchantCustomerId(email) {
  if (!email) {
    // Fallback: use timestamp-based ID (max 20 chars)
    const timestamp = Date.now().toString().slice(-12); // Last 12 digits
    return `cust_${timestamp}`.substring(0, 20);
  }
  
  // Create a simple hash from email
  const emailPart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Create a hash from the full email (djb2 hash algorithm)
  let hash = 5381;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) + hash) + email.charCodeAt(i);
    hash = hash & 0x7fffffff; // Ensure positive 32-bit integer
  }
  
  // Convert to base36 and pad to ensure consistent length
  const hashStr = hash.toString(36).padStart(8, '0').substring(0, 8);
  
  // Limit email part to fit within 20 chars: "cust_" (5) + hash (8) + "_" (1) + emailPart (max 6)
  const maxEmailLength = 6;
  const truncatedEmail = emailPart.substring(0, maxEmailLength);
  
  // Format: cust_<hash>_<emailPart> (max 20 chars: 5 + 8 + 1 + 6 = 20)
  const merchantId = `cust_${hashStr}_${truncatedEmail}`;
  
  // Ensure it doesn't exceed 20 characters (Authorize.Net limit)
  return merchantId.substring(0, 20);
}

/**
 * Create a customer profile
 *
 * @param {object} params
 * @param {string} params.merchantCustomerId - Unique customer ID (max 20 chars)
 * @param {string} params.email - Customer email
 * @param {string} params.description - Customer description (optional)
 * @returns {Promise<object>}
 */
export async function createCustomerProfile({ merchantCustomerId, email, description }) {
  const requestBody = {
    createCustomerProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      profile: {
        merchantCustomerId,
        email,
        ...(description && { description }),
      },
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    customerProfileId: response.customerProfileId,
    rawResponse: response,
  };
}

/**
 * Get customer profile
 *
 * @param {string} customerProfileId
 * @returns {Promise<object>}
 */
export async function getCustomerProfile(customerProfileId) {
  const requestBody = {
    getCustomerProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      customerProfileId,
      includeIssuerInfo: true,
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    profile: response.profile,
    rawResponse: response,
  };
}

/**
 * Get customer profile by merchant customer ID
 *
 * @param {string} merchantCustomerId
 * @returns {Promise<object>}
 */
export async function getCustomerProfileByMerchantId(merchantCustomerId) {
  const requestBody = {
    getCustomerProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      merchantCustomerId,
      includeIssuerInfo: true,
    },
  };

  try {
    const response = await makeApiRequest(requestBody);
    return {
      success: true,
      profile: response.profile,
      customerProfileId: response.profile?.customerProfileId,
      rawResponse: response,
    };
  } catch (error) {
    // Profile not found is not an error in this context
    if (error.code === 'E00040') {
      return { success: false, profile: null };
    }
    throw error;
  }
}

/**
 * Delete customer profile
 *
 * @param {string} customerProfileId
 * @returns {Promise<object>}
 */
export async function deleteCustomerProfile(customerProfileId) {
  const requestBody = {
    deleteCustomerProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      customerProfileId,
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    rawResponse: response,
  };
}

/**
 * Create a payment profile for a customer
 *
 * @param {object} params
 * @param {string} params.customerProfileId
 * @param {object} params.opaqueData - Token from Accept.js
 * @param {object} params.billTo - Billing address
 * @param {boolean} params.defaultPaymentProfile - Set as default (optional)
 * @returns {Promise<object>}
 */
export async function createPaymentProfile({
  customerProfileId,
  opaqueData,
  billTo,
  defaultPaymentProfile = false,
}) {
  const validationMode = process.env.AUTHORIZE_NET_VALIDATION_MODE || 'testMode';

  const requestBody = {
    createCustomerPaymentProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      customerProfileId,
      paymentProfile: {
        billTo: formatAddress(billTo),
        payment: {
          opaqueData: {
            dataDescriptor: opaqueData.dataDescriptor,
            dataValue: opaqueData.dataValue,
          },
        },
        defaultPaymentProfile,
      },
      validationMode,
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    paymentProfileId: response.customerPaymentProfileId,
    validationDirectResponse: response.validationDirectResponse,
    rawResponse: response,
  };
}

/**
 * Get payment profile
 *
 * @param {string} customerProfileId
 * @param {string} paymentProfileId
 * @returns {Promise<object>}
 */
export async function getPaymentProfile(customerProfileId, paymentProfileId) {
  const requestBody = {
    getCustomerPaymentProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      customerProfileId,
      customerPaymentProfileId: paymentProfileId,
      includeIssuerInfo: true,
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    paymentProfile: response.paymentProfile,
    rawResponse: response,
  };
}

/**
 * Delete payment profile
 *
 * @param {string} customerProfileId
 * @param {string} paymentProfileId
 * @returns {Promise<object>}
 */
export async function deletePaymentProfile(customerProfileId, paymentProfileId) {
  const requestBody = {
    deleteCustomerPaymentProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      customerProfileId,
      customerPaymentProfileId: paymentProfileId,
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    rawResponse: response,
  };
}

/**
 * Create customer profile and payment profile together (with opaqueData)
 *
 * @param {object} params
 * @param {string} params.merchantCustomerId
 * @param {string} params.email
 * @param {object} params.opaqueData
 * @param {object} params.billTo
 * @returns {Promise<object>}
 */
export async function createCustomerProfileWithPayment({
  merchantCustomerId,
  email,
  opaqueData,
  billTo,
  shipTo,
}) {
  const validationMode = process.env.AUTHORIZE_NET_VALIDATION_MODE || 'testMode';

  const requestBody = {
    createCustomerProfileRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      profile: {
        merchantCustomerId,
        email,
        paymentProfiles: {
          billTo: formatAddress(billTo),
          payment: {
            opaqueData: {
              dataDescriptor: opaqueData.dataDescriptor,
              dataValue: opaqueData.dataValue,
            },
          },
        },
        ...(shipTo && {
          shipToList: formatAddress(shipTo, false),
        }),
      },
      validationMode,
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    customerProfileId: response.customerProfileId,
    paymentProfileIds: response.customerPaymentProfileIdList,
    shippingProfileIds: response.customerShippingAddressIdList,
    validationDirectResponse: response.validationDirectResponseList,
    rawResponse: response,
  };
}

// ==================== TRANSACTION DETAILS ====================

/**
 * Get transaction details
 *
 * @param {string} transactionId
 * @returns {Promise<object>}
 */
export async function getTransactionDetails(transactionId) {
  const requestBody = {
    getTransactionDetailsRequest: {
      merchantAuthentication: getMerchantAuthentication(),
      transId: transactionId,
    },
  };

  const response = await makeApiRequest(requestBody);

  return {
    success: true,
    transaction: response.transaction,
    rawResponse: response,
  };
}

// ==================== WEBHOOK VALIDATION ====================

/**
 * Validate webhook signature
 *
 * @param {string} payload - Raw request body
 * @param {string} signature - X-ANET-Signature header
 * @returns {boolean}
 */
export function validateWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const webhookSecret = process.env.AUTHORIZE_NET_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha512', webhookSecret)
    .update(payload)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha512=${expectedSignature}`)
  );
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format address for Authorize.Net API
 *
 * @param {object} address
 * @param {boolean} includeEmail - Include email field (billTo only)
 * @returns {object}
 */
function formatAddress(address, includeEmail = true) {
  const formatted = {
    firstName: address.firstName?.substring(0, 50) || address.first_name?.substring(0, 50) || '',
    lastName: address.lastName?.substring(0, 50) || address.last_name?.substring(0, 50) || '',
    company: address.company?.substring(0, 50) || '',
    address: address.address?.substring(0, 60) || address.address_1?.substring(0, 60) || '',
    city: address.city?.substring(0, 40) || '',
    state: address.state?.substring(0, 40) || '',
    zip: address.zip?.substring(0, 20) || address.postcode?.substring(0, 20) || '',
    country: address.country?.substring(0, 60) || '',
  };

  if (includeEmail && (address.email || address.billing_email)) {
    formatted.email = (address.email || address.billing_email)?.substring(0, 255);
  }

  if (address.phone || address.billing_phone) {
    formatted.phoneNumber = (address.phone || address.billing_phone)?.substring(0, 25);
  }

  return formatted;
}

/**
 * Parse transaction response code
 *
 * @param {string} responseCode
 * @returns {object}
 */
export function parseResponseCode(responseCode) {
  const codes = {
    '1': { status: 'approved', message: 'Transaction approved' },
    '2': { status: 'declined', message: 'Transaction declined' },
    '3': { status: 'error', message: 'Transaction error' },
    '4': { status: 'held', message: 'Transaction held for review' },
  };

  return codes[responseCode] || { status: 'unknown', message: 'Unknown response' };
}

/**
 * Get client key for Accept.js
 *
 * @returns {string}
 */
export function getClientKey() {
  return process.env.AUTHORIZE_NET_CLIENT_KEY;
}

/**
 * Get API login ID for Accept.js
 *
 * @returns {string}
 */
export function getApiLoginId() {
  return process.env.AUTHORIZE_NET_API_LOGIN_ID;
}

/**
 * Check if in sandbox mode
 *
 * @returns {boolean}
 */
export function isSandbox() {
  return (process.env.AUTHORIZE_NET_ENVIRONMENT || 'sandbox') !== 'production';
}

export default {
  createTransaction,
  createTransactionFromProfile,
  captureTransaction,
  voidTransaction,
  refundTransaction,
  createCustomerProfile,
  getCustomerProfile,
  getCustomerProfileByMerchantId,
  deleteCustomerProfile,
  createPaymentProfile,
  getPaymentProfile,
  deletePaymentProfile,
  createCustomerProfileWithPayment,
  getTransactionDetails,
  validateWebhookSignature,
  parseResponseCode,
  getClientKey,
  getApiLoginId,
  isSandbox,
  AuthorizeNetError,
};
