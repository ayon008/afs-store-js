"use client"


import { getEventsDestinations } from '@/app/actions/WC/getAllEvents';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const EventDropDown = ({ selectedId, setSelectedId }) => {

    const t = useTranslations("afs-event");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selected, setSelected] = useState(t("pays"));
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await getEventsDestinations();
            setCategories(data);
        }
        load();
    }, [])

    return (
        <div className="relative w-full rounded-[4px] cursor-pointer"> {/* fix width to match dropdown */}
            <button
                className={`
      w-full flex items-center justify-between gap-2
      p-[10px] font-semibold cursor-pointer transition-colors border border-gray-400 rounded-[4px]
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
                    {categories.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setSelected(item.name)
                                setSelectedId(item.id)
                                setIsDropdownOpen(false)
                            }}
                            className={`w-full text-left p-[10px] font-medium text-[18px] leading-[16px] cursor-pointer transition-colors ${item.name === selected ? 'bg-black text-white' : "bg-white text-black"}`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventDropDown;