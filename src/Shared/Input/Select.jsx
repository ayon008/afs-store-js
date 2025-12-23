import { Check } from 'lucide-react';
import React from 'react';

const Select = ({ label, id, register, error, registerPage = false, value, show = true, checkout = false, options = [], placeholder = "Select..." }) => {
    const showAyon = value && value.length >= 2;

    return (
        <div>
            <div className='relative'>
                <label
                    htmlFor={id}
                    className={`${checkout ? 'bg-white' : 'bg-[#F0F0F0]'} absolute left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px] z-10`}
                >
                    <span className='uppercase'>{label}</span>
                    {registerPage && (
                        error
                            ? <span className='text-red-800 ml-1 font-normal'>× Woops</span>
                            : showAyon
                                ? <Check className='inline ml-1' size={14} strokeWidth={6} color="#2A7029" />
                                : null
                    )}
                </label>

                <select
                    {...register}
                    id={id}
                    className={`border border-[#BFBFBF] rounded-[4px] w-full py-3 px-3 focus:outline-none text-lg leading-[23px] text-black font-semibold bg-white appearance-none cursor-pointer
                    ${error ? "border-red-500" : ""}`}
                    disabled={!show}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom arrow icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Select;

