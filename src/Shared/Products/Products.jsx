"use client"
import React, { useState, useEffect, useMemo } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { Filter, X } from 'lucide-react';
import ProductCard from '../Card/ProductCard';
import PopUp from '../PopUp/PopUp';
import SkeletonProjectCard from '../Loader/SkeletonLoader';
import { getProductsByCategoryId } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import default_image from '../../../public/assets/images/Team/Group-1-3.png.webp';

const Products = ({ id, childCategories }) => {
    const t = useTranslations('product');
    const a = useTranslations('filter');
    const currency = Cookies.get('currency');
    const currencySymbol = currency === 'euro' ? '€' : currency === 'usd' ? '$' : '£';
    const [isOpen, setOpen] = useState(false);
    const [ids, setIds] = useState([id]);
    const [priceRange, setPriceRange] = useState([0, 0]);

    // Products
    const { isLoading, isError, data: allProductsData } = useQuery({
        queryKey: ['all-products-data', ids],
        queryFn: async () => {
            const data = await getProductsByCategoryId(ids);
            return data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const { minPrice, maxPrice } = useMemo(() => {
        if (!allProductsData || allProductsData.length === 0) {
            return { minPrice: 0, maxPrice: 0 };
        }

        const prices = allProductsData.map(p => Number(p?.price));
        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices)
        };
    }, [allProductsData]);

    useEffect(() => {
        if (minPrice > 0 || maxPrice > 0) {
            setPriceRange([minPrice, maxPrice]);
        }
    }, [minPrice, maxPrice]);


    const filteredProducts = useMemo(() => {
        if (!allProductsData) return [];

        const [min, max] = priceRange;
        return allProductsData.filter(product => {
            const price = Number(product?.price);
            return price >= min && price <= max;
        });
    }, [allProductsData, priceRange]);

    useEffect(() => {
        setPriceRange([minPrice, maxPrice]);
    }, [minPrice, maxPrice]);

    const handleChange = (val) => {
        setPriceRange(val);
    }

    const renderCategories = (categories) => {
        const logSelectedCategoryIds = () => {
            // Save current scroll position
            const scrollPosition = window.scrollY || window.pageYOffset;
            const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const selectedIds = Array.from(checkedBoxes).map(cb => cb.value)?.length > 0 ? Array.from(checkedBoxes).map(cb => cb.value) : id;
            setIds(selectedIds);
            // Restore scroll position after render
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    window.scrollTo(0, scrollPosition);
                });
            });
        };

        return (
            <ul className="space-y-3">
                {categories.map((cat) => (
                    <li key={cat.id} className="flex flex-col">
                        {/* Checkbox + Label */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="peer w-3 h-3 cursor-pointer accent-black"
                                value={cat.id}
                                onChange={logSelectedCategoryIds}
                            />
                            <span className="text-[#999] font-semibold text-[14px] leading-[16px] uppercase peer-checked:text-[#111111bf]">
                                {cat.name}
                            </span>
                        </label>

                        {/* Children */}
                        {Array.isArray(cat.children) && cat.children.length > 0 && (
                            <div className="ml-6 mt-3">
                                {renderCategories(cat.children)}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className='flex items-start justify-center gap-10 lg:flex-row flex-col global-padding max-w-[1920px] mx-auto relative'>
            <div className='lg:w-[20%] w-full md:sticky md:top-[170px]'>
                <div className='hidden lg:block'>
                    <div className='lg:h-[calc(90vh-140px)] h-0 overflow-y-scroll popup-scroll-bar-1'>
                        <div className='mb-6'>
                            <p className='font-semibold text-base leading-[100%] text-black mb-4 uppercase'>{a("categories")}</p>
                            {childCategories && childCategories.length > 0
                                ? renderCategories(childCategories)
                                : <p className="text-sm text-gray-500">No {a("categories")}</p>}
                        </div>
                        {
                            isLoading ? <div>Loading...</div> : <>
                                <div>
                                    <label className='uppercase text-base font-medium mb-4 block' htmlFor="vol">{t("price")}</label>
                                    <RangeSlider
                                        min={minPrice}
                                        max={maxPrice}
                                        value={priceRange}
                                        onInput={handleChange}
                                        className='my-dashed-slider -ml-2'
                                    />
                                    <div className='text-[14px] leading-[15px] font-semibold mt-4'>
                                        {currencySymbol}{priceRange[0].toFixed(2)} — {currencySymbol}{priceRange[1].toFixed(2)}
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
                <div>
                    <p className='uppercase text-base font-semibold leading-[100%] pb-1 global-b-bottom-d lg:hidden block' onClick={() => setOpen(true)}>
                        Filter
                        <Filter className='inline ml-2 mb-1' size={'0.8rem'} />
                    </p>
                </div>
            </div>


            {
                isLoading ?
                    <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto global-margin'>
                        {
                            [...Array(6)].map((_, i) => {
                                return (
                                    <SkeletonProjectCard key={i} />
                                )
                            })
                        }
                    </div>
                    : <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto global-margin'>
                        {
                            filteredProducts?.map((product, i) => {
                                const image = product?.featured_img;
                                const bestseller = product?.bestseller;
                                const hoverImage = product?.img;
                                return (
                                    <ProductCard price={product?.price_html} singlePrice={product?.price_with_tax} type={product?.type} name={product?.name} bestseller={bestseller} hoverImage={hoverImage} image={image || default_image} key={i} slug={product?.slug} />
                                )
                            })
                        }
                    </div>
            }

            {/* PopUp */}


            <PopUp isOpen={isOpen}>
                <div className='w-[90%] mx-auto bg-[#F7F7F7] h-auto p-[10px] rounded-[4px] overflow-hidden shadow-xl'>
                    <div className='relative'>
                        <p className='font-medium uppercase text-xs leading-[100%] pb-4 text-[#999] border-gray-300 border-b'>Filters</p>
                        <X className="w-4 h-4 absolute top-0 right-0 text-[#999]" onClick={() => setOpen(!isOpen)} />
                    </div>
                    <p className='font-semibold text-base leading-[100%] text-black my-4'>{a("categories")}</p>
                    <div className='mb-4 mt-4 max-h-[50vh] overflow-y-scroll popup-scroll-bar-1'>
                        {childCategories && childCategories.length > 0
                            ? renderCategories(childCategories)
                            : <p className="text-sm text-gray-500">No {a("categories")}</p>}
                    </div>
                    <div>
                        {isLoading ? <div>Loading...</div> :
                            <>
                                <label className='font-semibold text-base leading-[100%] text-black mb-4 block' for="vol">{t("price")}</label>
                                <RangeSlider
                                    min={minPrice}
                                    max={maxPrice}
                                    value={priceRange}
                                    onInput={handleChange}
                                    className='my-dashed-slider -ml-2'
                                />
                                <div className='text-[14px] leading-[15px] font-semibold mt-4'>
                                    {currencySymbol}{priceRange[0].toFixed(2)} — {currencySymbol}{priceRange[1].toFixed(2)}
                                </div>
                            </>
                        }
                        <button type='button' className='text-center bg-black text-white w-full mt-6 text-sm leading-[100%] py-4 font-semibold rounded-4xl cursor-pointer' onClick={() => setOpen(!isOpen)}>
                            {a("finish")}
                        </button>
                    </div>
                </div>
            </PopUp>

        </div>
    );
};

export default Products;


