// "use client"
// import { Filter, X } from 'lucide-react';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import React, { useState, useTransition, useCallback, useRef, useEffect } from 'react'
// import RangeSlider from 'react-range-slider-input';
// import 'react-range-slider-input/dist/style.css';
// import PopUp from '../PopUp/PopUp';
// import { useTranslations } from 'use-intl';


// const RenderCategories = ({ categories, onCategoryChange, selectedCategories }) => {
//     return (
//         <ul className="space-y-3">
//             {categories?.map((cat) => (
//                 <li key={cat.id} className="flex flex-col">
//                     {/* Checkbox + Label */}
//                     <label className="flex items-center gap-2 cursor-pointer">
//                         <input
//                             type="checkbox"
//                             className="peer w-3 h-3 cursor-pointer accent-black"
//                             value={cat.id}
//                             checked={selectedCategories.has(cat.id.toString())}
//                             onChange={(e) => onCategoryChange(cat.id.toString(), e.target.checked)}
//                         />
//                         <span className="text-[#999] font-semibold text-[14px] leading-[16px] uppercase peer-checked:text-[#111111bf]">
//                             {cat.name}
//                         </span>
//                     </label>

//                     {/* Children */}
//                     {Array.isArray(cat.children) && cat.children.length > 0 && (
//                         <div className="ml-6 mt-3">
//                             <RenderCategories
//                                 categories={cat.children}
//                                 onCategoryChange={onCategoryChange}
//                                 selectedCategories={selectedCategories}
//                             />
//                         </div>
//                     )}
//                 </li>
//             ))}
//         </ul>
//     );
// };

// const FilterProducts = ({ childCategories, maxPrice, minPrice, min, max }) => {

//     const t = useTranslations("filter")
//     const a = useTranslations("orders")

//     const [value, setValue] = useState([min || minPrice, max || maxPrice]);
//     const [isOpen, setOpen] = useState(false);
//     const router = useRouter();
//     const pathname = usePathname();
//     const searchParams = useSearchParams();
//     const [isPending, startTransition] = useTransition();

//     // Refs pour les timers
//     const priceDebounceRef = useRef(null);
//     const categoryDebounceRef = useRef(null);

//     // État local pour les catégories sélectionnées
//     const [selectedCategories, setSelectedCategories] = useState(() => {
//         return new Set(searchParams.getAll('category'));
//     });

//     // Synchroniser les catégories sélectionnées avec les searchParams
//     useEffect(() => {
//         setSelectedCategories(new Set(searchParams.getAll('category')));
//     }, [searchParams]);

//     // Mise à jour instantanée de l'URL pour les catégories
//     const handleCategoryChange = useCallback((categoryId, checked) => {
//         // Mise à jour immédiate de l'état local
//         setSelectedCategories(prev => {
//             const newSet = new Set(prev);
//             if (checked) {
//                 newSet.add(categoryId);
//             } else {
//                 newSet.delete(categoryId);
//             }
//             return newSet;
//         });

//         // Clear le timer précédent
//         if (categoryDebounceRef.current) {
//             clearTimeout(categoryDebounceRef.current);
//         }

//         // Debounce léger pour éviter trop de requêtes
//         categoryDebounceRef.current = setTimeout(() => {
//             const params = new URLSearchParams(searchParams.toString());
//             params.delete('category');

//             // Reconstruire avec le nouvel état
//             const newCategories = new Set(selectedCategories);
//             if (checked) {
//                 newCategories.add(categoryId);
//             } else {
//                 newCategories.delete(categoryId);
//             }

//             newCategories.forEach(id => {
//                 params.append('category', id);
//             });

//             // Mise à jour instantanée de l'URL
//             const newUrl = `${pathname}?${params.toString()}`;
//             window.history.replaceState(null, '', newUrl);

//             // Puis mise à jour du routeur Next.js
//             startTransition(() => {
//                 router.replace(newUrl, { scroll: false });
//             });
//         }, 150); // Debounce court
//     }, [searchParams, pathname, router, startTransition, selectedCategories]);

//     // Mise à jour du prix avec debounce
//     const handlePriceChange = useCallback((val) => {
//         setValue(val); // Mise à jour immédiate de l'UI

//         if (priceDebounceRef.current) {
//             clearTimeout(priceDebounceRef.current);
//         }

//         priceDebounceRef.current = setTimeout(() => {
//             const params = new URLSearchParams(searchParams.toString());
//             params.set('min', val[0]);
//             params.set('max', val[1]);

//             // Mise à jour instantanée de l'URL
//             const newUrl = `${pathname}?${params.toString()}`;
//             window.history.replaceState(null, '', newUrl);

//             // Puis mise à jour du routeur Next.js
//             startTransition(() => {
//                 router.replace(newUrl, { scroll: false });
//             });
//         }, 500); // Debounce plus long pour le slider
//     }, [searchParams, pathname, router, startTransition]);

//     // Nettoyer les timers au démontage
//     useEffect(() => {
//         return () => {
//             if (priceDebounceRef.current) {
//                 clearTimeout(priceDebounceRef.current);
//             }
//             if (categoryDebounceRef.current) {
//                 clearTimeout(categoryDebounceRef.current);
//             }
//         };
//     }, []);

//     return (
//         <div className='lg:w-[20%] w-full md:sticky md:top-[170px]'>
//             <div className='hidden lg:block'>
//                 <div className='lg:h-[calc(90vh-140px)] h-0 overflow-y-scroll popup-scroll-bar-1'>
//                     <div className='mb-6'>
//                         <p className='font-semibold text-base leading-[100%] text-black mb-4 uppercase'>
//                             {t("categories")}
//                         </p>
//                         {childCategories && childCategories.length > 0
//                             ? <RenderCategories
//                                 categories={childCategories}
//                                 onCategoryChange={handleCategoryChange}
//                                 selectedCategories={selectedCategories}
//                             />
//                             : <p className="text-sm text-gray-500">No {t("categories")}</p>}
//                     </div>
//                     <div>
//                         <label className='uppercase text-base font-medium mb-4 block' htmlFor="vol">
//                             {a("price")}
//                         </label>
//                         <RangeSlider
//                             min={minPrice}
//                             max={maxPrice}
//                             value={value}
//                             onInput={handlePriceChange}
//                             className='my-dashed-slider -ml-2'
//                         />
//                         <div className='text-[14px] leading-[15px] font-semibold mt-4'>
//                             {
//                                 maxPrice && minPrice &&
//                                 <span>€{Number(value[0])?.toFixed(2) || max} — €{Number(value[1])?.toFixed(2) || min}</span>
//                             }
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div>
//                 <p className='uppercase text-base cursor-pointer font-semibold leading-[100%] pb-1 global-b-bottom lg:hidden block' onClick={() => setOpen(true)}>
//                     Filter
//                     <Filter className='inline ml-2 mb-1' size={'0.8rem'} />
//                 </p>
//             </div>



//             <PopUp isOpen={isOpen}>
//                 <div className='w-[90%] mx-auto bg-white/95 h-[90vh] p-4 rounded-[4px] overflow-hidden shadow-xl'>
//                     <div className='relative'>
//                         <p className='font-medium uppercase text-xs leading-[100%] pb-4 text-[#999] border-gray-300 border-b'></p>
//                         <X className="w-4 h-4 absolute cursor-pointer top-0 right-0 text-[#999]" onClick={() => setOpen(!isOpen)} />
//                     </div>
//                     <div className='mb-4 mt-4 h-[50%] overflow-y-scroll popup-scroll-bar-1'>
//                         <p className='font-semibold text-base leading-[100%] text-black mb-4'>{t("categories")}</p>
//                         {childCategories && childCategories.length > 0
//                             ? <RenderCategories
//                                 categories={childCategories}
//                                 onCategoryChange={handleCategoryChange}
//                                 selectedCategories={selectedCategories}
//                             />
//                             : <p className="text-sm text-gray-500">No {t("categories")}</p>}
//                     </div>
//                     <div>
//                         <label className='uppercase text-base font-medium mb-4 block' for="vol">{a("price")}</label>
//                         <RangeSlider min={minPrice} max={maxPrice} defaultValue={[min || minPrice, max || maxPrice]} onInput={(val) => handleChange(val)} className='my-dashed-slider -ml-2' />
//                         <div className='text-[14px] leading-[15px] font-semibold mt-4'>
//                             {
//                                 maxPrice && minPrice &&
//                                 <span>€{Number(value[0])?.toFixed(2) || max} — €{Number(value[1])?.toFixed(2) || min}</span>
//                             }
//                         </div>
//                         {/* <FormButton label={"TERMINER"}/> */}
//                         <button type='button' className='text-center bg-black text-white w-full mt-4 text-sm leading-[100%] py-5 font-semibold rounded-4xl cursor-pointer' onClick={() => setOpen(!isOpen)}>
//                             {t("finish")}
//                         </button>
//                     </div>
//                 </div>
//             </PopUp>
//         </div>
//     )
// }

// export default FilterProducts;



"use client"

import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
// cat.id.toString(),

const RenderCategories = ({ categories, onCategoryChange, selectedCategories }) => {
    return (
        <ul className="space-y-3">
            {categories?.map((cat) => (
                <li key={cat.id} className="flex flex-col">
                    {/* Checkbox + Label */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="peer w-3 h-3 cursor-pointer accent-black"
                            value={cat.id}
                            // checked={selectedCategories.has(cat.id.toString())}
                            onChange={(e) => onCategoryChange(cat.id, e.target.checked)}
                        />
                        <span className="text-[#999] font-semibold text-[14px] leading-[16px] uppercase peer-checked:text-[#111111bf]">
                            {cat.name}
                        </span>
                    </label>

                    {/* Children */}
                    {Array.isArray(cat.children) && cat.children.length > 0 && (
                        <div className="ml-6 mt-3">
                            <RenderCategories
                                categories={cat.children}
                                onCategoryChange={onCategoryChange}
                                selectedCategories={selectedCategories}
                            />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

const FilterProducts = ({ childCategories, selectedCategories, handleCategoryChange }) => {
    const t = useTranslations("filter")
    const a = useTranslations("orders")
    // const [selectedCategories, setSelectedCategories] = useState(null);

    return (
        <div>
            <div className='hidden lg:block'>
                <div className='lg:h-[calc(90vh-140px)] h-0 overflow-y-scroll popup-scroll-bar-1'>
                    <div className='mb-6'>
                        <p className='font-semibold text-base leading-[100%] text-black mb-4 uppercase'>
                            {t("categories")}
                        </p>
                        {childCategories && childCategories?.length > 0
                            ? <RenderCategories
                                categories={childCategories}
                                onCategoryChange={handleCategoryChange}
                                selectedCategories={selectedCategories}
                            />
                            : <p className="text-sm text-gray-500">No {t("categories")}</p>}
                    </div>
                    <div>
                        <label className='uppercase text-base font-medium mb-4 block' htmlFor="vol">
                            {a("price")}
                        </label>
                        {/* <RangeSlider
                            min={minPrice}
                            max={maxPrice}
                            value={value}
                            onInput={handlePriceChange}
                            className='my-dashed-slider -ml-2'
                        /> */}
                        {/* <div className='text-[14px] leading-[15px] font-semibold mt-4'>
                            {
                                maxPrice && minPrice &&
                                <span>€{Number(value[0])?.toFixed(2) || max} — €{Number(value[1])?.toFixed(2) || min}</span>
                            }
                        </div> */}
                    </div>
                </div>
            </div>
            <div>
                <p className='uppercase text-base cursor-pointer font-semibold leading-[100%] pb-1 global-b-bottom lg:hidden block' onClick={() => setOpen(true)}>
                    Filter
                    <Filter className='inline ml-2 mb-1' size={'0.8rem'} />
                </p>
            </div>

        </div>
    )
}

export default FilterProducts;