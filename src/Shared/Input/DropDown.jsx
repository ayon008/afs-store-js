"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { translateCountry } from "@/lib/translateCountry";
import { Search, ChevronDown, X } from "lucide-react";

const CountrySelect = ({ label, id, register, error, defaultValue, registerPage = false, countries = [], show = true, checkout = false }) => {
    const t = useTranslations("checkout");
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(defaultValue || "");
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Get register props
    const { onChange, onBlur, name, ref } = register || {};

    // Filter countries based on search term
    const filteredCountries = countries.filter((country) => {
        const countryName = translateCountry(country.code, locale).toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return countryName.includes(searchLower) || country.code.toLowerCase().includes(searchLower);
    });

    // Get selected country name
    const selectedCountryName = selectedCountry
        ? translateCountry(selectedCountry, locale)
        : t("selectCountry");

    // Handle country selection
    const handleSelectCountry = (countryCode) => {
        setSelectedCountry(countryCode);
        setIsOpen(false);
        setSearchTerm("");
        
        // Trigger register onChange if provided
        if (onChange) {
            onChange({ target: { name, value: countryCode } });
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Update selected country when defaultValue changes
    useEffect(() => {
        if (defaultValue !== undefined) {
            setSelectedCountry(defaultValue);
        }
    }, [defaultValue]);

    return (
        <div>
            <div className="relative" ref={dropdownRef}>
                <label
                    htmlFor={id}
                    className={`${checkout ? 'bg-white' : 'bg-[#F0F0F0]'} absolute px-[2px] left-3 font-semibold -top-[14px] text-[#666] text-sm leading-[28px] z-10`}
                >
                    <span className="uppercase">{label}</span>
                </label>

                {/* Hidden input for react-hook-form */}
                <input
                    type="hidden"
                    id={id}
                    name={name || id}
                    value={selectedCountry}
                    ref={(e) => {
                        if (ref) ref(e);
                    }}
                    onBlur={onBlur}
                />

                {/* Custom dropdown button */}
                <button
                    type="button"
                    disabled={!show}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`border border-[#BFBFBF] rounded-[4px] w-full py-3 px-3 focus:outline-none text-lg leading-[23px] text-black font-semibold
                        appearance-none -webkit-appearance-none -moz-appearance-none cursor-pointer
                        flex items-center justify-between
                        ${error ? "border-red-500" : ""}
                        ${!show ? "opacity-50 cursor-not-allowed" : ""}
                        ${isOpen ? "border-[#1D98FF] ring-2 ring-[#1D98FF]" : ""}`}
                >
                    <span className={selectedCountry ? "text-black" : "text-gray-400"}>
                        {selectedCountryName}
                    </span>
                    <ChevronDown 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "transform rotate-180" : ""}`} 
                    />
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-[#BFBFBF] rounded-[4px] shadow-lg max-h-80 overflow-hidden flex flex-col">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t("searchCountry") || "Search country..."}
                                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1D98FF] text-sm"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Countries list */}
                        <div className="overflow-y-auto max-h-64">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => {
                                    const countryName = translateCountry(country.code, locale);
                                    const isSelected = selectedCountry === country.code;
                                    
                                    return (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleSelectCountry(country.code)}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors
                                                ${isSelected ? "bg-[#1D98FF] text-white hover:bg-[#1585e0]" : "text-black"}`}
                                        >
                                            {countryName}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    {t("noCountryFound") || "No country found"}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default CountrySelect;
