"use client"
import React, { useState, useEffect, useMemo } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { ArrowUpRight, Filter, X } from 'lucide-react';
import ProductCard from '../Card/ProductCard';
import PopUp from '../PopUp/PopUp';
import SkeletonProjectCard from '../Loader/SkeletonLoader';
import PriceFilterShimmer from '../Loader/PriceFilterShimmer';
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
    const [telephonePopUp, setTelephonePopUp] = useState(false);

    // Products
    const { isLoading, isError, data: allProductsData } = useQuery({
        queryKey: ['all-products-data', ids],
        queryFn: async () => {
            const data = await getProductsByCategoryId(ids);
            return data;
        },
        staleTime: 60 * 60 * 1000, // Cache for 1 hour
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
        <div className='flex items-stretch justify-center gap-10 lg:flex-row flex-col global-padding max-w-[1920px] mx-auto'>
            <div className='lg:w-[20%] w-full relative'>
                <div className='hidden lg:block md:sticky md:top-[170px] pb-10'>
                    <div className='lg:h-auto lg:max-h-[calc(100vh-170px)] h-0 overflow-y-scroll popup-scroll-bar-1'>
                        <div className='mb-6'>
                            {childCategories && childCategories.length > 0 &&

                                <>
                                    <p className='font-semibold text-base leading-[100%] text-black mb-4 uppercase'>{a("categories")}</p>
                                    {renderCategories(childCategories)}
                                </>
                            }
                        </div>
                        {
                            isLoading ? <PriceFilterShimmer /> : <>
                                <div>
                                    <label className='font-semibold text-base leading-[100%] text-black uppercase' htmlFor="vol">{t("price")}</label>
                                    <RangeSlider
                                        min={minPrice}
                                        max={maxPrice}
                                        value={priceRange}
                                        onInput={handleChange}
                                        className='my-dashed-slider -ml-2 mt-4'
                                    />
                                    <div className='text-[14px] leading-[15px] font-semibold mt-4'>
                                        {currencySymbol}{priceRange[0].toFixed(2)} — {currencySymbol}{priceRange[1].toFixed(2)}
                                    </div>
                                </div>
                            </>
                        }
                        <div className='flex bg-[#f7f7f7] p-[10px] mt-4 rounded-sm gap-2'>
                            <svg className='flex-[30px_0_0]' xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none"><path d="M32.2166 14.239C29.3667 11.7865 24.3568 9.5 19 9.5C13.6432 9.5 8.63327 11.7865 5.7834 14.239C3.58063 16.1346 5.29389 19.2939 7.25191 18.978C10.1889 18.5041 16.7972 18.0302 19 18.978C21.2028 18.0302 27.8111 18.5041 30.7481 18.978C32.7061 19.2939 34.4194 16.1346 32.2166 14.239Z" stroke="#111111" strokeWidth="2.375" strokeLinecap="square"></path><path d="M19 28.5007L11.875 28.5007M19 28.5007L26.125 28.5007M19 28.5007L19 25.334M11.875 28.5007L4.75 28.5007L4.75 25.334M11.875 28.5007L11.875 25.334M26.125 28.5007L33.25 28.5006L33.25 25.334M26.125 28.5007L26.125 25.334" stroke="#111111" strokeWidth="2.375" strokeLinecap="square"></path></svg>
                            <div className=''>
                                <h3 className='text-base leading-[100%]'>{t("chat_h")}</h3>
                                <p className='text-sm mt-2 mb-3'>{t("chat_p")}</p>
                                <button onClick={() => setTelephonePopUp(true)} className='text-sm flex items-center border p-3 font-bold rounded-sm cursor-pointer'>{t("chat_btn")} <ArrowUpRight className='inline w-4 h-4' /></button>
                            </div>
                        </div>
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
                    <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto'>
                        {
                            [...Array(6)].map((_, i) => {
                                return (
                                    <SkeletonProjectCard key={i} />
                                )
                            })
                        }
                    </div>
                    : <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto'>
                        {
                            filteredProducts?.map((product, i) => {
                                const image = product?.featured_img;
                                const bestseller = product?.bestseller;
                                const hoverImage = product?.img;
                                return (
                                    <ProductCard
                                        key={i}
                                        price={product?.price_html}
                                        // TTC depuis l'API WP (price_incl_tax)
                                        singlePrice={product?.price_incl_tax}
                                        // HT depuis l'API WP (price_excl_tax)
                                        priceExclTax={product?.price_excl_tax}
                                        type={product?.type}
                                        name={product?.name}
                                        bestseller={bestseller}
                                        hoverImage={hoverImage}
                                        image={image || default_image}
                                        slug={product?.slug}
                                    />
                                )
                            })
                        }
                    </div>
            }

            {/* PopUp */}

            <PopUp isOpen={isOpen} fn={setOpen}>
                <div onClick={(e) => e.stopPropagation()} className='w-[90%] mx-auto bg-[#F7F7F7] h-auto p-[10px] rounded-[4px] overflow-hidden shadow-xl'>
                    <div className='relative'>
                        <p className='font-medium uppercase text-xs leading-[100%] pb-4 text-[#999] border-gray-300 border-b'>Filters</p>
                        <X className="w-4 h-4 absolute top-0 right-0 text-[#999]" onClick={() => setOpen(!isOpen)} />
                    </div>
                    {
                        childCategories && childCategories.length > 0 && (
                            <p className='font-semibold text-base leading-[100%] text-black my-4'>{a("categories")}</p>
                        )
                    }
                    <div className='mb-4 mt-4 max-h-[50vh] overflow-y-scroll popup-scroll-bar-1'>
                        {
                            childCategories && childCategories.length > 0 && renderCategories(childCategories)
                        }
                    </div>
                    <div>
                        {isLoading ? <PriceFilterShimmer /> :
                            <>
                                <label className='font-semibold text-base leading-[100%] text-black mb-4 uppercase' htmlFor="vol">{t("price")}</label>
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

            <PopUp isOpen={telephonePopUp} fn={setTelephonePopUp}>
                <div onClick={(e) => e.stopPropagation()} className='bg-white max-w-[1180px] w-[95%] max-h-[80vh] overflow-x-hidden lg:p-20 p-5 relative mx-auto rounded-[4px] overflow-y-scroll scroll-bar'>
                    <button onClick={() => setTelephonePopUp(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer '>
                        <X className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className='global-h2 mb-10'>{t("chat_pop_h")}</h2>
                        <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5'>
                            <div className='p-5 border border-[#666] rounded-[10px] flex flex-col justify-between gap-5'>
                                <div className='space-y-[10px]'>
                                    <h3 className='lg:text-[28px] font-semibold leading-[100%] text-[#111] md:text-[24px] text-[20px]'>{t("chat_pop_div_one_h")}</h3>
                                    <p className='text-[#111111bf] text-base leading-[110%]'>
                                        {t("chat_pop_div_one_p")}
                                    </p>
                                </div>
                                <button className='cursor-pointer text-[#1d98ff] lg:text-base md:text-sm uppercase font-semibold flex items-center gap-1'>
                                    {t("chat_pop_div_one_btn")}
                                    <ArrowUpRight className='inline w-4 h-4' />
                                </button>
                            </div>

                            <div className='p-5 border border-[#666] rounded-[10px] flex flex-col justify-between gap-5'>
                                <div className='space-y-[10px]'>
                                    <h3 className='lg:text-[28px] font-semibold leading-[100%] text-[#111] md:text-[24px] text-[20px]'>{t("chat_pop_div_two_h")}</h3>
                                    <p className='text-[#111111bf] text-base leading-[110%]'>
                                        {t("chat_pop_div_two_p")}
                                    </p>
                                </div>
                                <button className='cursor-pointer text-[#1d98ff] lg:text-base md:text-sm uppercase font-semibold flex items-center gap-1'>
                                    {t("chat_pop_div_two_btn")}
                                    <ArrowUpRight className='inline w-4 h-4' />
                                </button>
                            </div>
                            <div className='p-5 border border-[#666] rounded-[10px] flex flex-col justify-between gap-5'>
                                <div className='space-y-[10px]'>
                                    <h3 className='lg:text-[28px] font-semibold leading-[100%] text-[#111] md:text-[24px] text-[20px]'>{t("chat_pop_div_three_h")}</h3>
                                    <p className='text-[#111111bf] text-base leading-[110%]'>
                                        {t("chat_pop_div_three_p")}
                                    </p>
                                </div>
                                <button className='cursor-pointer text-[#1d98ff] lg:text-base md:text-sm uppercase font-semibold flex items-center gap-1'>
                                    {t("chat_pop_div_three_btn")}
                                    <ArrowUpRight className='inline w-4 h-4' />
                                </button>
                            </div>
                            <div className='p-5 border border-[#666] rounded-[10px] flex flex-col justify-between gap-5'>
                                <div className='space-y-[10px]'>
                                    <h3 className='lg:text-[28px] font-semibold leading-[100%] text-[#111] md:text-[24px] text-[20px]'>{t("chat_pop_div_four_h")}</h3>
                                </div>
                                <button className='cursor-pointer text-[#1d98ff] lg:text-base md:text-sm uppercase font-semibold flex items-center gap-1'>
                                    {t("chat_pop_div_four_btn")}
                                    <ArrowUpRight className='inline w-4 h-4' />
                                </button>
                            </div>
                            <div className='p-5 border border-[#666] rounded-[10px] flex flex-col justify-between gap-5'>
                                <div className='space-y-[10px]'>
                                    <h3 className='lg:text-[28px] font-semibold leading-[100%] text-[#111] md:text-[24px] text-[20px]'>{t("chat_pop_div_five_h")}</h3>
                                </div>
                                <button className='cursor-pointer text-[#1d98ff] lg:text-base md:text-sm uppercase font-semibold flex items-center gap-1'>
                                    {t("chat_pop_div_five_btn")}
                                    <ArrowUpRight className='inline w-4 h-4' />
                                </button>
                            </div>
                            <div className='p-5 border border-[#666] rounded-[10px] flex flex-col justify-between gap-5'>
                                <div className='space-y-[10px]'>
                                    <h3 className='lg:text-[28px] font-semibold leading-[100%] text-[#111] md:text-[24px] text-[20px]'>{t("chat_pop_div_six_h")}</h3>
                                </div>
                                <button className='cursor-pointer text-[#1d98ff] lg:text-base md:text-sm uppercase font-semibold flex items-center gap-1'>
                                    {t("chat_pop_div_six_btn")}
                                    <ArrowUpRight className='inline w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </PopUp>

        </div>
    );
};

export default Products;


