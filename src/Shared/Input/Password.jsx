"use client"
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

const Password = ({ label, id, placeholder, register, error, value }) => {

    const [type, setType] = useState("password");

    return (
        <>
            <div className='relative'>
                <label
                    htmlFor={id}
                    className='uppercase bg-[#F0F0F0] absolute left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px]'
                >
                    {label}
                </label>

                <input
                    {...register}
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className={`borders rounded-[4px] w-full border py-3 px-3 focus:outline-none text-lg leading-[23px] text-black font-semibold
                    ${error ? "border-red-500" : "border-[#BFBFBF]"}`}
                />

                {type === "text" ? (
                    <Eye
                        className='absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer'
                        onClick={() => setType("password")}
                    />
                ) : (
                    <EyeOff
                        className='absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer'
                        onClick={() => setType("text")}
                    />
                )}


            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </>
    );
};

export default Password;
