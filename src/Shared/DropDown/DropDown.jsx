"use client"
import { getDealerType } from '@/app/actions/WC/getDealers';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const DropDown = ({ selectedId, setSelectedId }) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selected, setSelected] = useState("ALL");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await getDealerType();
            setCategories(data);
        }
        load();
    }, [])


    return (
        <div className="relative mt-2 lg:mt-0 lg:w-[300px] w-full rounded-[4px] cursor-pointer bg-white/95"> {/* fix width to match dropdown */}
            <button
                className={`
      w-full flex items-center justify-between gap-2
      p-[10px] font-bold text-[15px] leading-[20px] uppercase cursor-pointer transition-colors border bg-white border-gray-400 rounded-[4px]
    `}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {selected}
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute left-0 w-full shadow-lg z-40 rounded-[4px]">
                    <button
                        onClick={() => {
                            setSelected("All")
                            setSelectedId(null)
                            setIsDropdownOpen(false)
                        }}
                        className={`w-full text-left p-[10px] font-bold text-[15px] leading-[20px] uppercase cursor-pointer transition-colors ${!selectedId ? 'bg-black text-white' : "bg-white text-black"}`}
                    >
                        All
                    </button>
                    {categories.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setSelected(item.name)
                                setSelectedId(item.id)
                                setIsDropdownOpen(false)
                            }}
                            className={`w-full text-left p-[10px] font-bold text-[15px] uppercase leading-[20px] cursor-pointer transition-colors ${item.name === selected ? 'bg-black text-white' : "bg-white text-black"}`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropDown;