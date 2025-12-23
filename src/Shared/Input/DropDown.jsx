"use client";
import React from "react";

const CountrySelect = ({ label, id, register, error, defaultValue, registerPage = false, countries = [], show = true, checkout = false }) => {
    return (
        <div>
            <div className="relative">
                <label
                    htmlFor={id}
                    className={`${checkout ? 'bg-white' : 'bg-[#F0F0F0]'} absolute px-[2px] left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px]`}
                >
                    <span className="uppercase">{label}</span>
                </label>

                <select
                    disabled={!show}
                    {...register}
                    id={id}
                    defaultValue={defaultValue}
                    className={`border border-[#BFBFBF] rounded-[4px] w-full py-3 px-3 focus:outline-none text-lg leading-[23px] text-black font-semibold
                        appearance-none -webkit-appearance-none -moz-appearance-none cursor-pointer
            ${error ? "border-red-500" : ""}`}
                >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.name}
                        </option>
                    ))}
                </select>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default CountrySelect;
