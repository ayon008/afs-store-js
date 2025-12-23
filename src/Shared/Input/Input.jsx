import { Check, AlertCircle } from 'lucide-react';
import React from 'react';

const Input = ({
    label,
    type,
    id,
    placeholder,
    register,
    error,
    registerPage = false,
    value,
    show = true,
    checkout = false,
    showValidation = false // New prop for showing validation icons
}) => {
    // value: the current value of the input, passed from parent via react-hook-form's watch
    const showSuccess = value && value.length >= 2 && !error;

    return (
        <div>
            <div className='relative'>
                <label
                    htmlFor={id}
                    className={`${checkout ? 'bg-white' : 'bg-[#F0F0F0]'} px-[2px] absolute left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px] transition-colors duration-200`}
                >
                    <span className='uppercase'>{label}</span>
                    {registerPage && (
                        error
                            ? <span className='text-red-800 ml-1 font-normal'>× Woops</span>
                            : showSuccess
                                ? <Check className='inline ml-1' size={14} strokeWidth={6} color="#2A7029" />
                                : null
                    )}
                </label>

                <input
                    {...register}
                    type={type}
                    id={id}
                    defaultValue={value}
                    placeholder={placeholder}
                    className={`
                        border border-[#BFBFBF] rounded-[4px] w-full py-3 px-3
                        focus:outline-none focus:ring-2 focus:ring-[#1D98FF]/20 focus:border-[#1D98FF]
                        text-lg leading-[23px] text-black font-semibold
                        transition-all duration-200
                        ${error ? "border-red-500 input-modern-error" : ""}
                        ${showSuccess && (showValidation || checkout) ? "input-modern-success pr-10" : ""}
                        ${error && (showValidation || checkout) ? "pr-10" : ""}
                    `}
                    disabled={!show}
                />

                {/* Validation Icons for checkout mode */}
                {(showValidation || checkout) && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                        {error && (
                            <AlertCircle className='w-5 h-5 text-red-500 animate-scaleIn' />
                        )}
                        {showSuccess && !error && (
                            <Check className='w-5 h-5 text-green-500 animate-scaleIn' />
                        )}
                    </div>
                )}
            </div>

            {/* Animated Error Message */}
            {error && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-slideDown">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
