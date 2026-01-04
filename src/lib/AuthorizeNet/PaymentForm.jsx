"use client"

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Script from 'next/script';

/**
 * Detect card type from card number
 */
function detectCardType(cardNumber) {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  if (!cleanNumber) return null;

  // Visa: starts with 4
  if (/^4/.test(cleanNumber)) {
    return { type: 'visa', name: 'Visa' };
  }

  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return { type: 'mastercard', name: 'Mastercard' };
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleanNumber)) {
    return { type: 'amex', name: 'American Express' };
  }

  // Discover: starts with 6011, 622126-622925, 644-649, 65
  if (/^6011/.test(cleanNumber) || /^622/.test(cleanNumber) || /^64[4-9]/.test(cleanNumber) || /^65/.test(cleanNumber)) {
    return { type: 'discover', name: 'Discover' };
  }

  // Diners Club: starts with 36, 38, 300-305
  if (/^36/.test(cleanNumber) || /^38/.test(cleanNumber) || /^30[0-5]/.test(cleanNumber)) {
    return { type: 'diners', name: 'Diners Club' };
  }

  // JCB: starts with 35
  if (/^35/.test(cleanNumber)) {
    return { type: 'jcb', name: 'JCB' };
  }

  // UnionPay: starts with 62
  if (/^62/.test(cleanNumber)) {
    return { type: 'unionpay', name: 'UnionPay' };
  }

  return null;
}

/**
 * Card type icon component
 */
function CardTypeIcon({ cardType }) {
  if (!cardType) {
    return (
      <svg className="w-8 h-5 text-gray-300" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="currentColor"/>
        <rect x="8" y="10" width="12" height="8" rx="1" fill="#999"/>
        <rect x="8" y="20" width="32" height="2" fill="#999"/>
      </svg>
    );
  }

  switch (cardType.type) {
    case 'visa':
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
    case 'mastercard':
      return (
        <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#000"/>
          <circle cx="19" cy="16" r="8" fill="#EB001B"/>
          <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
          <path d="M24 10C25.8 11.5 27 13.5 27 16C27 18.5 25.8 20.5 24 22C22.2 20.5 21 18.5 21 16C21 13.5 22.2 11.5 24 10Z" fill="#FF5F00"/>
        </svg>
      );
    case 'amex':
      return (
        <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#006FCF"/>
          <path d="M8 16L12 10H15L18 16L15 22H12L8 16Z" fill="white"/>
          <text x="20" y="19" fill="white" fontSize="8" fontWeight="bold">AMEX</text>
        </svg>
      );
    case 'discover':
      return (
        <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#FFF"/>
          <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" stroke="#E5E5E5"/>
          <circle cx="30" cy="16" r="7" fill="#F47216"/>
          <text x="5" y="19" fill="#000" fontSize="7" fontWeight="bold">DISCOVER</text>
        </svg>
      );
    case 'diners':
      return (
        <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#0079BE"/>
          <circle cx="24" cy="16" r="9" fill="white"/>
          <circle cx="20" cy="16" r="6" stroke="#0079BE" strokeWidth="1" fill="none"/>
          <circle cx="28" cy="16" r="6" stroke="#0079BE" strokeWidth="1" fill="none"/>
        </svg>
      );
    case 'jcb':
      return (
        <svg className="w-8 h-5" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#FFF"/>
          <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" stroke="#E5E5E5"/>
          <rect x="8" y="8" width="10" height="16" rx="2" fill="#0E4C96"/>
          <rect x="19" y="8" width="10" height="16" rx="2" fill="#E11837"/>
          <rect x="30" y="8" width="10" height="16" rx="2" fill="#009B3A"/>
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-5 text-gray-400" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="currentColor"/>
          <rect x="8" y="10" width="12" height="8" rx="1" fill="#666"/>
          <rect x="8" y="20" width="32" height="2" fill="#666"/>
        </svg>
      );
  }
}

/**
 * PaymentForm Component
 *
 * Renders a credit card form with Accept.js integration for PCI-compliant
 * card tokenization. Card data never touches our servers.
 */
const PaymentForm = forwardRef(function PaymentForm({
  onTokenized,
  onError,
  disabled = false,
  loading = false,
}, ref) {
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

  // Detected card type
  const [cardType, setCardType] = useState(null);

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
        setConfigError(null);
      } catch (error) {
        console.error('Failed to load Authorize.Net config:', error);
        setConfigError(error.message);
      } finally {
        setConfigLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Detect card type when card number changes
  useEffect(() => {
    const detected = detectCardType(cardNumber);
    setCardType(detected);
  }, [cardNumber]);

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
      return v;
    }
  };

  // Validate form
  const validateForm = useCallback(() => {
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

    // CVV length depends on card type (AMEX = 4, others = 3)
    const cvvLength = cardType?.type === 'amex' ? 4 : 3;
    if (!cvv || cvv.length < cvvLength) {
      newErrors.cvv = `Please enter ${cvvLength}-digit CVV`;
    }

    if (!cardName || cardName.trim().length < 2) {
      newErrors.cardName = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumber, expMonth, expYear, cvv, cardName, cardType]);

  // Handle tokenization with Accept.js
  const tokenizeCard = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    if (!config) {
      const error = 'Payment configuration not loaded. Please refresh the page.';
      setErrors({ general: error });
      onError?.(new Error(error));
      return;
    }

    if (!window.Accept) {
      const error = 'Payment system not loaded. Please wait or refresh the page.';
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

      // Success - return opaque data with card info
      onTokenized({
        dataDescriptor: response.opaqueData.dataDescriptor,
        dataValue: response.opaqueData.dataValue,
        cardType: cardType?.type || 'unknown',
        cardTypeName: cardType?.name || 'Card',
        lastFour: cleanCardNumber.slice(-4),
      });
    });
  }, [cardNumber, expMonth, expYear, cvv, cardName, config, cardType, validateForm, onTokenized, onError]);

  // Expose tokenize method via ref
  useImperativeHandle(ref, () => ({
    tokenize: tokenizeCard,
    isValid: () => validateForm(),
    getCardType: () => cardType,
  }), [tokenizeCard, validateForm, cardType]);

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i <= 15; i++) {
    yearOptions.push(currentYear + i);
  }

  // Only disable inputs during actual processing, not while loading config/Accept.js
  const isFormDisabled = disabled || loading || isProcessing;

  return (
    <>
      {/* Load Accept.js from Authorize.Net */}
      {config && (
        <Script
          src={config.acceptJsUrl}
          onLoad={() => setAcceptJsLoaded(true)}
          onError={() => {
            console.error('Failed to load Accept.js');
            setAcceptJsLoaded(false);
          }}
        />
      )}

      <div className="space-y-4">
        {/* Config loading indicator */}
        {configLoading && (
          <div className="text-sm text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading payment form...
          </div>
        )}

        {/* Config error */}
        {configError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
            <strong>Configuration required:</strong> {configError}
          </div>
        )}

        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        {/* Card Number with type icon */}
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              disabled={isFormDisabled}
              className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              autoComplete="cc-number"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CardTypeIcon cardType={cardType} />
            </div>
          </div>
          {cardType && (
            <p className="mt-1 text-xs text-gray-500">{cardType.name} detected</p>
          )}
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
              placeholder={cardType?.type === 'amex' ? '1234' : '123'}
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

        {/* Accept.js loading status */}
        {config && !acceptJsLoaded && !configError && (
          <div className="text-xs text-gray-400 flex items-center">
            <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading secure payment system...
          </div>
        )}

        {/* Security notice */}
        <div className="flex items-center text-xs text-gray-500 mt-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your card information is encrypted and secure
        </div>
      </div>
    </>
  );
});

export default PaymentForm;
