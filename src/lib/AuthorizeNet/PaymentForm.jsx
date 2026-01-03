"use client"

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';

/**
 * PaymentForm Component
 *
 * Renders a credit card form with Accept.js integration for PCI-compliant
 * card tokenization. Card data never touches our servers.
 *
 * @param {Object} props
 * @param {Function} props.onTokenized - Callback when card is tokenized successfully
 * @param {Function} props.onError - Callback when tokenization fails
 * @param {boolean} props.disabled - Disable the form
 * @param {boolean} props.loading - Show loading state
 */
export default function PaymentForm({
  onTokenized,
  onError,
  disabled = false,
  loading = false,
}) {
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [acceptJsLoaded, setAcceptJsLoaded] = useState(false);

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Validation state
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Accept.js configuration
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/payments/authorize/config');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load payment configuration');
        }

        setConfig(data);
      } catch (error) {
        console.error('Failed to load Authorize.Net config:', error);
        setConfigError(error.message);
      } finally {
        setConfigLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    if (!cleanCardNumber || cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!expMonth || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
      newErrors.expMonth = 'Invalid month';
    }

    const currentYear = new Date().getFullYear();
    const yearValue = parseInt(expYear);
    if (!expYear || yearValue < currentYear || yearValue > currentYear + 20) {
      newErrors.expYear = 'Invalid year';
    }

    // Check if card is expired
    if (expMonth && expYear) {
      const currentMonth = new Date().getMonth() + 1;
      if (yearValue === currentYear && parseInt(expMonth) < currentMonth) {
        newErrors.expMonth = 'Card has expired';
      }
    }

    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'Please enter CVV';
    }

    if (!cardName || cardName.trim().length < 2) {
      newErrors.cardName = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle tokenization with Accept.js
  const tokenizeCard = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    if (!window.Accept) {
      const error = 'Payment system not loaded. Please refresh the page.';
      setErrors({ general: error });
      onError?.(new Error(error));
      return;
    }

    setIsProcessing(true);
    setErrors({});

    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    // Prepare card data for Accept.js
    const secureData = {
      authData: {
        clientKey: config.clientKey,
        apiLoginID: config.apiLoginId,
      },
      cardData: {
        cardNumber: cleanCardNumber,
        month: expMonth.padStart(2, '0'),
        year: expYear,
        cardCode: cvv,
        fullName: cardName,
      },
    };

    // Call Accept.js to tokenize the card
    window.Accept.dispatchData(secureData, (response) => {
      setIsProcessing(false);

      if (response.messages.resultCode === 'Error') {
        const errorMessages = response.messages.message
          .map((m) => m.text)
          .join(', ');
        setErrors({ general: errorMessages });
        onError?.(new Error(errorMessages));
        return;
      }

      // Success - return opaque data
      onTokenized({
        dataDescriptor: response.opaqueData.dataDescriptor,
        dataValue: response.opaqueData.dataValue,
      });
    });
  }, [cardNumber, expMonth, expYear, cvv, cardName, config, onTokenized, onError]);

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i <= 15; i++) {
    yearOptions.push(currentYear + i);
  }

  if (configLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading payment form...
      </div>
    );
  }

  if (configError) {
    return (
      <div className="p-4 text-center text-red-600">
        {configError}
      </div>
    );
  }

  const isFormDisabled = disabled || loading || isProcessing || !acceptJsLoaded;

  return (
    <>
      {/* Load Accept.js from Authorize.Net */}
      {config && (
        <Script
          src={config.acceptJsUrl}
          onLoad={() => setAcceptJsLoaded(true)}
          onError={() => {
            setConfigError('Failed to load payment system');
            setAcceptJsLoaded(false);
          }}
        />
      )}

      <div className="space-y-4">
        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        {/* Card Number */}
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            autoComplete="cc-number"
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="John Doe"
            disabled={isFormDisabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardName ? 'border-red-500' : 'border-gray-300'
            } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            autoComplete="cc-name"
          />
          {errors.cardName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
          )}
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="expMonth" className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              id="expMonth"
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              disabled={isFormDisabled}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.expMonth ? 'border-red-500' : 'border-gray-300'
              } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              autoComplete="cc-exp-month"
            >
              <option value="">MM</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
            {errors.expMonth && (
              <p className="mt-1 text-sm text-red-600">{errors.expMonth}</p>
            )}
          </div>

          <div>
            <label htmlFor="expYear" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="expYear"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              disabled={isFormDisabled}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.expYear ? 'border-red-500' : 'border-gray-300'
              } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              autoComplete="cc-exp-year"
            >
              <option value="">YYYY</option>
              {yearOptions.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
            {errors.expYear && (
              <p className="mt-1 text-sm text-red-600">{errors.expYear}</p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              maxLength={4}
              disabled={isFormDisabled}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cvv ? 'border-red-500' : 'border-gray-300'
              } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              autoComplete="cc-csc"
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center text-xs text-gray-500 mt-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your card information is encrypted and secure
        </div>

        {/* Tokenize button - exposed for parent to trigger */}
        <input type="hidden" id="tokenizeCard" onClick={tokenizeCard} />
      </div>

      {/* Expose tokenize function to parent via ref */}
      <style jsx global>{`
        #tokenizeCard:focus {
          outline: none;
        }
      `}</style>
    </>
  );
}

// Export tokenize function for use by parent
PaymentForm.tokenize = () => {
  document.getElementById('tokenizeCard')?.click();
};
