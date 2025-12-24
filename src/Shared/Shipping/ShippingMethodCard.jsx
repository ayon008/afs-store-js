'use client';

import { Truck } from 'lucide-react';

/**
 * ShippingMethodCard - Modern shipping method selection card
 * @param {object} rate - Shipping rate data
 * @param {boolean} selected - Whether this option is selected
 * @param {function} onSelect - Callback when selected
 * @param {boolean} disabled - Disabled state during loading
 * @param {string} freeLabel - Label for free shipping
 */
const ShippingMethodCard = ({
  rate,
  selected = false,
  onSelect,
  disabled = false,
  freeLabel = 'Gratuit'
}) => {
  const totalPrice = (rate.price / 100) + (rate.taxes / 100);
  const currencySymbol = rate.currency_symbol || '€';
  const safeId = `shipping_rate_${String(rate.rate_id).replace(/[:]/g, '_')}`;
  const inputValue = rate.package_id !== undefined ? `${rate.package_id}:${rate.rate_id}` : rate.rate_id;

  return (
    <label
      htmlFor={safeId}
      className={`
        shipping-option group block w-full
        ${selected ? 'shipping-option-selected' : ''}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        type="radio"
        name="shipping_rate"
        id={safeId}
        value={inputValue}
        checked={selected}
        onChange={() => onSelect?.(rate)}
        disabled={disabled}
        className='sr-only'
      />

      <div className='flex items-center gap-4 w-full'>
        {/* Custom Radio Indicator */}
        <div
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center
            transition-all duration-200 flex-shrink-0
            ${selected
              ? 'border-[#1D98FF] bg-[#1D98FF]'
              : 'border-gray-300 group-hover:border-[#1D98FF]'
            }
          `}
        >
          {selected && (
            <div className='w-2 h-2 rounded-full bg-white animate-scaleIn' />
          )}
        </div>

        {/* Shipping Icon */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          transition-colors duration-200
          ${selected ? 'bg-[#1D98FF]/10' : 'bg-gray-100 group-hover:bg-[#1D98FF]/10'}
        `}>
          <Truck
            className={`
              w-5 h-5 transition-colors duration-200
              ${selected ? 'text-[#1D98FF]' : 'text-gray-500 group-hover:text-[#1D98FF]'}
            `}
          />
        </div>

        {/* Shipping Info */}
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-[#111] text-sm lg:text-base truncate'>
            {rate.name}
          </p>
        </div>

        {/* Price */}
        <div className='text-right flex-shrink-0'>
          {totalPrice === 0 ? (
            <span className='text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full text-sm'>
              {freeLabel}
            </span>
          ) : (
            <span className='font-bold text-[#111] text-sm lg:text-base'>
              {totalPrice.toFixed(2)}{currencySymbol}
            </span>
          )}
        </div>
      </div>
    </label>
  );
};

export default ShippingMethodCard;
