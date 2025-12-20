import { Check } from 'lucide-react';
import React from 'react';

const Input = ({ label, type, id, placeholder, register, error, registerPage = false, value, show = true, checkout = false }) => {
    // value: the current value of the input, passed from parent via react-hook-form's watch
    const showAyon = value && value.length >= 2;

    return (
        <div>
            <div className='relative'>
                <label
                    htmlFor={id}
                    className={`${checkout ? 'bg-white' : 'bg-[#F0F0F0]'} absolute left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px]`}
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

                <input
                    {...register}
                    type={type}
                    id={id}
                    defaultValue={value}
                    placeholder={placeholder}
                    className={`border border-[#BFBFBF] rounded-[4px] w-full py-3 px-3 focus:outline-none text-lg leading-[23px] text-black font-semibold
                    ${error ? "border-red-500" : ""}`}
                    disabled={!show}
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Input;
