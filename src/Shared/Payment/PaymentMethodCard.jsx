'use client';

import { Check, CreditCard, Building2 } from 'lucide-react';

/**
 * PayPal Icon SVG Component
 */
const PayPalIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.722a.77.77 0 0 1 .76-.644h6.35c2.097 0 3.785.57 4.79 1.63.937.992 1.326 2.395 1.158 4.175-.204 2.178-1.07 3.907-2.497 5.003-1.39 1.066-3.262 1.607-5.565 1.607H7.74a.77.77 0 0 0-.76.645l-.903 5.8-.001.001z"/>
    <path d="M18.594 7.82c-.133 1.422-.594 2.583-1.364 3.472-.94 1.088-2.362 1.64-4.229 1.64H11.1a.385.385 0 0 0-.38.322l-.692 4.46-.194 1.26a.32.32 0 0 0 .316.37h2.3a.385.385 0 0 0 .38-.322l.156-.822.302-1.949a.385.385 0 0 1 .38-.322h.24c1.55 0 2.767-.324 3.617-.962.767-.577 1.297-1.4 1.576-2.449.205-.768.261-1.433.17-1.997a2.4 2.4 0 0 0-.277-.701z"/>
  </svg>
);

/**
 * PaymentMethodCard - Modern payment method selection card
 * @param {object} method - Payment method data { id, title, description }
 * @param {boolean} selected - Whether this option is selected
 * @param {function} onSelect - Callback when selected
 * @param {node} children - Expandable content when selected (PayPal button, etc.)
 * @param {string} description - Optional description text
 */
const PaymentMethodCard = ({
  method,
  selected = false,
  onSelect,
  children,
  description
}) => {
  const isPayPal = method.id === 'paypal' || method.id === 'ppcp-gateway';
  const isMonetico = method.id?.toLowerCase().includes('monetico') ||
                     method.title?.toLowerCase().includes('carte bancaire');
  const isBacs = method.id === 'bacs' ||
                 method.title?.toLowerCase().includes('virement');

  const getIcon = () => {
    if (isPayPal) {
      return <PayPalIcon className={`w-6 h-6 ${selected ? 'text-white' : 'text-[#003087]'}`} />;
    }
    if (isMonetico) {
      return <CreditCard className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-600'}`} />;
    }
    if (isBacs) {
      return <Building2 className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-600'}`} />;
    }
    return <CreditCard className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-600'}`} />;
  };

  const getDefaultDescription = () => {
    if (isPayPal) return 'Paiement rapide et sécurisé';
    if (isMonetico) return 'Carte bancaire sécurisée';
    if (isBacs) return 'Virement bancaire direct';
    return '';
  };

  return (
    <div className='space-y-3'>
      <label
        className={`
          payment-card flex items-center gap-4
          ${selected ? 'payment-card-selected' : ''}
        `}
      >
        <input
          type="radio"
          name="payment_method"
          value={method.id}
          checked={selected}
          onChange={() => onSelect?.(method)}
          className='sr-only'
        />

        {/* Payment Icon */}
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${selected ? 'bg-[#1D98FF]' : 'bg-gray-100'}
          `}
        >
          {getIcon()}
        </div>

        {/* Payment Info */}
        <div className='flex-1 min-w-0'>
          <p className='font-semibold text-[#111] text-sm lg:text-base'>
            {method.title}
          </p>
          <p className='text-xs lg:text-sm text-gray-500 mt-0.5'>
            {description || getDefaultDescription()}
          </p>
        </div>

        {/* Selection Indicator */}
        <div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${selected
              ? 'border-[#1D98FF] bg-[#1D98FF]'
              : 'border-gray-300'
            }
          `}
        >
          {selected && (
            <Check className='w-4 h-4 text-white animate-scaleIn' />
          )}
        </div>
      </label>

      {/* Expandable Content */}
      {selected && children && (
        <div className='ml-16 animate-slideDown'>
          {children}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;
