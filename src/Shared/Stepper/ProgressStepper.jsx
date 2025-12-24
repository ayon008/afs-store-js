'use client';

import { Check } from 'lucide-react';

/**
 * ProgressStepper - Animated checkout progress stepper
 * @param {number} currentStep - Current active step (1, 2, or 3)
 * @param {string[]} steps - Array of step labels
 */
const ProgressStepper = ({ currentStep = 2, steps = ['Panier', 'Paiement', 'Confirmation'] }) => {
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'pending';
  };

  const getProgressWidth = () => {
    if (currentStep === 1) return '0%';
    if (currentStep === 2) return '50%';
    return '100%';
  };

  return (
    <div className='flex items-center justify-between max-w-[600px] mx-auto relative py-8 lg:py-12 px-4'>
      {/* Background Line */}
      <div className='absolute left-[15%] right-[15%] top-[calc(50%-12px)] lg:top-[calc(50%-16px)] h-0.5 bg-gray-200 -z-10' />

      {/* Animated Progress Line */}
      <div
        className='absolute left-[15%] top-[calc(50%-12px)] lg:top-[calc(50%-16px)] h-0.5 bg-[#1D98FF] -z-10 transition-all duration-700 ease-out'
        style={{ width: getProgressWidth() === '0%' ? '0%' : `calc(${getProgressWidth()} - 30%)` }}
      />

      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const status = getStepStatus(stepNumber);

        return (
          <div key={stepNumber} className='flex flex-col items-center gap-2 lg:gap-3 relative z-10'>
            {/* Step Circle */}
            <div
              className={`
                stepper-circle
                ${status === 'completed' ? 'stepper-circle-completed' : ''}
                ${status === 'active' ? 'stepper-circle-active' : ''}
                ${status === 'pending' ? 'stepper-circle-pending' : ''}
              `}
            >
              {status === 'completed' ? (
                <Check className='w-5 h-5 animate-scaleIn' />
              ) : (
                <span className='text-[clamp(0.875rem,0.7599rem+0.2401vw,1rem)]'>
                  {stepNumber}
                </span>
              )}
            </div>

            {/* Step Label */}
            <span
              className={`
                text-[clamp(0.75rem,0.6rem+0.3vw,0.875rem)] font-medium text-center transition-colors duration-300
                ${status === 'completed' || status === 'active' ? 'text-[#111]' : 'text-gray-400'}
              `}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
