"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FilterTab = ({ name, isActive, onClick }) => {
    const activeClasses =
        "bg-[#1d98ff] text-white hover:bg-[#1180e0] transition-colors";
    const inactiveClasses =
        "bg-[#F2F2F2] text-[#c3c3c3] hover:bg-gray-200 transition-colors";

    return (
        <button
            onClick={onClick}
            className={`
        px-5 py-3 rounded-[5px] cursor-pointer font-bold text-[15px] leading-[19px] whitespace-nowrap
        border-none focus:outline-none
        ${isActive ? activeClasses : inactiveClasses}
      `}
        >
            {name}
        </button>
    );
};

const Sec1 = ({ categories, activeTab, setActiveTab, countries, country, setCountry, countryName, setCountryName }) => {

    // ✅ Added dropdown open/close state and selected country
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const countryDropdownClasses = `
    flex items-center justify-between gap-2
    px-5 py-2 font-medium text-sm
    bg-[#1d98ff] text-white
    hover:bg-[#1180e0] transition-colors
    focus:outline-none
  `;

    return (
        <div className="font-sans flex items-start">
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-3 w-full bg-white">
                {/* Filter Tabs */}
                <div
                    id="filter-menu"
                    className={`
            w-auto
            flex flex-wrap flex-row gap-2
            transition-all duration-300 ease-in-out
          `}
                >
                    <FilterTab
                        key={1}
                        name={"TOUS"}
                        isActive={activeTab === null}
                        onClick={() => setActiveTab(null)}
                    />
                    {categories.map((category) => (
                        <FilterTab
                            key={category.id}
                            name={category.name}
                            isActive={activeTab === category.id}
                            onClick={() => setActiveTab(category.id)}
                        />
                    ))}
                </div>

                {/* ✅ Country Dropdown */}
                {/* ✅ Country Dropdown */}
                <div className="relative mt-2 lg:mt-0 w-[220px] rounded-[4px] bg-[#1d98ff] cursor-pointer"> {/* fix width to match dropdown */}
                    <button
                        className={`
      w-full flex items-center justify-between gap-2
      p-[10px] font-bold text-[15px] leading-[20px]
      bg-[#1d98ff] text-white
      hover:bg-[#1180e0] transition-colors
      focus:outline-none rounded-[4px]
    `}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {countryName}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"
                                }`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute left-0 w-full bg-[#1d98ff] text-white shadow-lg z-10 rounded-b-[4px] -mt-1">
                            {countries.map((country) => (
                                <button
                                    key={country.id}
                                    onClick={() => {
                                        setCountry(country.id);
                                        setIsDropdownOpen(false);
                                        setCountryName(country.name)
                                    }}
                                    className="w-full text-left p-[10px]  font-bold text-[15px] leading-[20px] hover:bg-white hover:text-[#1d98ff] transition-colors"
                                >
                                    {country.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Sec1;
