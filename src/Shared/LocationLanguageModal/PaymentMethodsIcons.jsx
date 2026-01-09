'use client';

import { CreditCard, Building2 } from 'lucide-react';

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
 * Visa Icon SVG Component
 */
const VisaIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="6" fill="#1A1F71"/>
    <path d="M19.5 31H16L19 17H22.5L19.5 31Z" fill="white"/>
    <path d="M31.5 17.3C30.7 17 29.5 16.7 28 16.7C24.5 16.7 22 18.5 22 21.1C22 23 23.7 24 25 24.7C26.3 25.4 26.8 25.9 26.8 26.5C26.8 27.4 25.7 27.8 24.7 27.8C23.3 27.8 22.5 27.6 21.3 27.1L20.8 26.9L20.3 30.1C21.2 30.5 22.8 30.8 24.5 30.8C28.2 30.8 30.7 29 30.7 26.2C30.7 24.7 29.8 23.6 27.8 22.7C26.6 22.1 25.9 21.7 25.9 21.1C25.9 20.6 26.5 20 27.8 20C28.9 20 29.7 20.2 30.3 20.5L30.6 20.6L31.5 17.3Z" fill="white"/>
    <path d="M37.5 17H34.8C34 17 33.4 17.2 33 18.1L27.5 31H31.2L32 28.7H36.5L37 31H40.3L37.5 17ZM33 25.9C33.3 25 34.5 21.7 34.5 21.7C34.5 21.7 34.8 20.9 35 20.4L35.2 21.6C35.2 21.6 35.9 24.8 36.1 25.9H33Z" fill="white"/>
    <path d="M14.5 17L11 26.7L10.6 24.9C9.9 22.5 7.7 19.9 5.2 18.6L8.4 31H12.2L18.3 17H14.5Z" fill="white"/>
    <path d="M8.5 17H2.8L2.7 17.3C7.2 18.4 10.2 21.2 11.2 24.6L10.1 18.2C9.9 17.3 9.3 17 8.5 17Z" fill="#F9A533"/>
  </svg>
);

/**
 * Mastercard Icon SVG Component
 */
const MastercardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="6" fill="#F5F5F5"/>
    <circle cx="18" cy="24" r="10" fill="#EB001B"/>
    <circle cx="30" cy="24" r="10" fill="#F79E1B"/>
    <path d="M24 16.5C26.3 18.3 27.8 21 27.8 24C27.8 27 26.3 29.7 24 31.5C21.7 29.7 20.2 27 20.2 24C20.2 21 21.7 18.3 24 16.5Z" fill="#FF5F00"/>
  </svg>
);

/**
 * Get icon component for a payment method
 */
const getPaymentIcon = (methodId, size = 'md') => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconClass = sizeClasses[size] || sizeClasses.md;

  switch (methodId) {
    case 'paypal':
      return <PayPalIcon className={`${iconClass} text-[#003087]`} />;
    case 'monetico':
    case 'authorize':
      return (
        <div className="flex items-center gap-1">
          <VisaIcon className={iconClass} />
          <MastercardIcon className={iconClass} />
        </div>
      );
    case 'bacs':
      return <Building2 className={`${iconClass} text-gray-600`} />;
    default:
      return <CreditCard className={`${iconClass} text-gray-600`} />;
  }
};

/**
 * PaymentMethodsIcons - Displays icons for available payment methods
 * @param {string[]} methods - Array of payment method IDs
 * @param {string} size - Icon size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
const PaymentMethodsIcons = ({ methods = [], size = 'sm', className = '' }) => {
  if (!methods || methods.length === 0) return null;

  // Remove duplicates and sort for consistent display
  const uniqueMethods = [...new Set(methods)];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {uniqueMethods.map((methodId) => (
        <div
          key={methodId}
          className="flex items-center justify-center"
          title={methodId.charAt(0).toUpperCase() + methodId.slice(1)}
        >
          {getPaymentIcon(methodId, size)}
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodsIcons;
export { PayPalIcon, VisaIcon, MastercardIcon, getPaymentIcon };
