"use client"

import { useState, useEffect } from 'react';

/**
 * Get card brand icon based on card type
 */
function getCardIcon(cardType) {
  const type = cardType?.toLowerCase() || '';

  if (type.includes('visa')) {
    return (
      <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#1A1F71"/>
        <path d="M19.5 21.5L21 10.5H23.5L22 21.5H19.5Z" fill="white"/>
        <path d="M29.5 10.7C29 10.5 28.2 10.3 27.2 10.3C24.7 10.3 23 11.5 23 13.2C23 14.5 24.2 15.2 25.2 15.7C26.2 16.2 26.5 16.5 26.5 17C26.5 17.7 25.7 18 25 18C24 18 23.5 17.9 22.7 17.5L22.3 17.3L22 19.5C22.5 19.7 23.5 19.9 24.5 19.9C27.2 19.9 28.9 18.7 28.9 16.9C28.9 15.9 28.3 15.1 26.8 14.5C25.8 14 25.2 13.7 25.2 13.2C25.2 12.7 25.8 12.3 26.8 12.3C27.6 12.3 28.2 12.5 28.6 12.6L28.9 12.7L29.5 10.7Z" fill="white"/>
        <path d="M34.2 10.5H32.2C31.5 10.5 31 10.7 30.7 11.3L27 21.5H29.7L30.2 20H33.5L33.8 21.5H36.2L34.2 10.5ZM31 18L32 14.5L32.6 18H31Z" fill="white"/>
        <path d="M17.5 10.5L15 17.5L14.7 16C14.2 14.5 12.8 12.8 11.2 12L13.5 21.5H16.2L20.2 10.5H17.5Z" fill="white"/>
        <path d="M13 10.5H9L9 10.7C12.2 11.5 14.3 13.5 15 16L14.2 11.3C14.1 10.7 13.6 10.5 13 10.5Z" fill="#F9A825"/>
      </svg>
    );
  }

  if (type.includes('mastercard') || type.includes('master')) {
    return (
      <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#1A1F71"/>
        <circle cx="19" cy="16" r="8" fill="#EB001B"/>
        <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
        <path d="M24 10.5C25.8 12 27 14 27 16.5C27 19 25.8 21 24 22.5C22.2 21 21 19 21 16.5C21 14 22.2 12 24 10.5Z" fill="#FF5F00"/>
      </svg>
    );
  }

  if (type.includes('amex') || type.includes('american')) {
    return (
      <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#006FCF"/>
        <path d="M10 16L13 10H16L19 16L16 22H13L10 16Z" fill="white"/>
        <path d="M20 10H23L25 14L27 10H30L26 18V22H24V18L20 10Z" fill="white"/>
        <path d="M31 10H38V12H33V14H37V16H33V20H38V22H31V10Z" fill="white"/>
      </svg>
    );
  }

  if (type.includes('discover')) {
    return (
      <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#FFF"/>
        <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" stroke="#E5E5E5"/>
        <path d="M30 16C30 19.3 27.3 22 24 22C20.7 22 18 19.3 18 16C18 12.7 20.7 10 24 10C27.3 10 30 12.7 30 16Z" fill="#F47216"/>
        <text x="6" y="18" fill="#000" fontSize="6" fontWeight="bold">DISCOVER</text>
      </svg>
    );
  }

  // Default card icon
  return (
    <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#E5E5E5"/>
      <rect x="8" y="10" width="12" height="8" rx="1" fill="#999"/>
      <rect x="8" y="20" width="32" height="2" fill="#999"/>
    </svg>
  );
}

/**
 * SavedPaymentMethods Component
 *
 * Displays saved credit cards from Authorize.Net CIM
 * Allows selection, deletion, and setting default
 *
 * @param {Object} props
 * @param {string} props.customerEmail - Customer email to fetch profiles
 * @param {string} props.customerProfileId - Known customer profile ID (optional)
 * @param {Function} props.onSelect - Callback when a payment method is selected
 * @param {Function} props.onDelete - Callback when a payment method is deleted
 * @param {boolean} props.showAddNew - Show "Add new card" option
 * @param {Function} props.onAddNew - Callback when "Add new card" is clicked
 */
export default function SavedPaymentMethods({
  customerEmail,
  customerProfileId: propCustomerProfileId,
  onSelect,
  onDelete,
  showAddNew = true,
  onAddNew,
}) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [customerProfileId, setCustomerProfileId] = useState(propCustomerProfileId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Load saved payment methods
  useEffect(() => {
    async function loadPaymentMethods() {
      if (!customerEmail && !customerProfileId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let url = '/api/payments/authorize/cim/profiles?';

        if (customerProfileId) {
          url += `customerProfileId=${encodeURIComponent(customerProfileId)}`;
        } else {
          url += `email=${encodeURIComponent(customerEmail)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load payment methods');
        }

        if (data.customerProfileId) {
          setCustomerProfileId(data.customerProfileId);
        }

        setPaymentMethods(data.paymentProfiles || []);

        // Auto-select default payment method
        const defaultMethod = data.paymentProfiles?.find((m) => m.isDefault);
        if (defaultMethod) {
          setSelectedId(defaultMethod.paymentProfileId);
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPaymentMethods();
  }, [customerEmail, propCustomerProfileId]);

  // Handle selection
  const handleSelect = (method) => {
    setSelectedId(method.paymentProfileId);
    onSelect?.({
      customerProfileId,
      paymentProfileId: method.paymentProfileId,
      cardNumber: method.cardNumber,
      cardType: method.cardType,
    });
  };

  // Handle deletion
  const handleDelete = async (method) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    setDeletingId(method.paymentProfileId);

    try {
      const response = await fetch(
        `/api/payments/authorize/cim/payment-profiles?customerProfileId=${customerProfileId}&paymentProfileId=${method.paymentProfileId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete payment method');
      }

      // Remove from local state
      setPaymentMethods((prev) =>
        prev.filter((m) => m.paymentProfileId !== method.paymentProfileId)
      );

      // Clear selection if deleted method was selected
      if (selectedId === method.paymentProfileId) {
        setSelectedId(null);
        onSelect?.(null);
      }

      onDelete?.(method);
    } catch (err) {
      console.error('Failed to delete payment method:', err);
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedId(null);
    onSelect?.(null);
    onAddNew?.();
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading saved payment methods...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (paymentMethods.length === 0 && !showAddNew) {
    return null;
  }

  return (
    <div className="space-y-3">
      {paymentMethods.length > 0 && (
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Saved Payment Methods
        </h4>
      )}

      {/* Payment method list */}
      {paymentMethods.map((method) => (
        <div
          key={method.paymentProfileId}
          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
            selectedId === method.paymentProfileId
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSelect(method)}
        >
          <div className="flex items-center space-x-3">
            {/* Radio button */}
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedId === method.paymentProfileId
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}
            >
              {selectedId === method.paymentProfileId && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>

            {/* Card icon */}
            {getCardIcon(method.cardType)}

            {/* Card details */}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {method.cardType || 'Card'} ending in {method.cardNumber?.slice(-4) || '****'}
              </div>
              {method.billTo?.firstName && (
                <div className="text-xs text-gray-500">
                  {method.billTo.firstName} {method.billTo.lastName}
                </div>
              )}
            </div>

            {/* Default badge */}
            {method.isDefault && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Default
              </span>
            )}
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(method);
            }}
            disabled={deletingId === method.paymentProfileId}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Remove payment method"
          >
            {deletingId === method.paymentProfileId ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      ))}

      {/* Add new card option */}
      {showAddNew && (
        <div
          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            selectedId === null && paymentMethods.length > 0
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={handleAddNew}
        >
          <div className="flex items-center space-x-3">
            {/* Radio button */}
            {paymentMethods.length > 0 && (
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedId === null ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                {selectedId === null && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            )}

            {/* Plus icon */}
            <div className="w-8 h-5 flex items-center justify-center bg-gray-100 rounded">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>

            <span className="text-sm font-medium text-gray-700">
              Use a new card
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
