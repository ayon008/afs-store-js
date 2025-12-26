"use client"
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import React, { useState, useTransition, useEffect } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { Filter, X } from 'lucide-react';
import ProductCard from '../Card/ProductCard';
import PopUp from '../PopUp/PopUp';
import SkeletonProjectCard from '../Loader/SkeletonLoader';
import { getChildCategories, getProductsByCategoryId } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';


const Products = ({ id }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const t = useTranslations('product');
    const a = useTranslations('filter');
    const currency = Cookies.get('currency');
    const currencySymbol = currency === 'euro' ? '€' : currency === 'usd' ? '$' : '£';

    const [ids, setIds] = useState([id]);


    const renderCategories = (categories) => {
        const logSelectedCategoryIds = () => {
            const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const selectedIds = Array.from(checkedBoxes).map(cb => cb.value)?.length > 0 ? Array.from(checkedBoxes).map(cb => cb.value) : id;
            setIds(selectedIds);
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

    const [isOpen, setOpen] = useState(false);


    const params = useSearchParams();
    const min = params.get('min');
    const max = params.get('max');

    // Child Categories
    const { isLoading: isLoadingChildCategories, isError: isErrorChildCategories, error: errorChildCategories, data: childCategories, refetch: refetchChildCategories } = useQuery({
        queryKey: ['child-categories', id],
        queryFn: async () => {
            const data = await getChildCategories(id);
            return data;
        },
    })

    // Products
    const { isLoading, isError, data: productData, refetch } = useQuery({
        queryKey: ['product-data', ids, max, min],
        queryFn: async () => {
            const data = await getProductsByCategoryId(ids, max, min);
            return data;
        },
    })

    // Products
    const { isLoading: isLoadingAllProducts, isError: isErrorAllProducts, data: allProductsData, refetch: refetchAllProducts } = useQuery({
        queryKey: ['all-products-data', ids],
        queryFn: async () => {
            const data = await getProductsByCategoryId(ids);
            return data;
        },
    })

    const maxPrice = isLoadingAllProducts ? 0 : Math.max(...allProductsData?.map(p => p?.price));
    const minPrice = isLoadingAllProducts ? 0 : Math.min(...allProductsData?.map(p => p?.price));

    const [value, setValue] = useState([minPrice, maxPrice]);

    const handleChange = (val) => {
        // Use current pathname instead of hardcoded slug so this works for any category
        const newUrl = `${pathname}?min=${val[0]}&max=${val[1]}`;
        setValue(val)
        // perform client navigation then refresh the server-rendered data
        startTransition(() => {
            router.replace(newUrl, { scroll: false });
            router.refresh();
        });
    }



    return (
        <div className='flex items-start justify-center gap-10 lg:flex-row flex-col global-padding max-w-[1920px] mx-auto relative'>
            <div className='lg:w-[20%] w-full md:sticky md:top-[170px]'>
                <div className='hidden lg:block'>
                    <div className='lg:h-[calc(90vh-140px)] h-0 overflow-y-scroll popup-scroll-bar-1'>
                        <div className='mb-6'>
                            <p className='font-semibold text-base leading-[100%] text-black mb-4 uppercase'>{a("categories")}</p>
                            {
                                isLoadingChildCategories ? <div>Loading...</div> : <>
                                    {childCategories && childCategories.length > 0
                                        ? renderCategories(childCategories)
                                        : <p className="text-sm text-gray-500">No {a("categories")}</p>}
                                </>
                            }
                        </div>
                        {
                            isLoading ? <div>Loading...</div> : <>
                                <div>
                                    <label className='uppercase text-base font-medium mb-4 block' htmlFor="vol">{t("price")}</label>
                                    <RangeSlider min={minPrice} max={maxPrice} defaultValue={[min || minPrice, max || maxPrice]} onInput={(val) => handleChange(val)} className='my-dashed-slider -ml-2' />
                                    <div className='text-[14px] leading-[15px] font-semibold mt-4'>
                                        {currencySymbol}{min || value[0].toFixed(2)} — {currencySymbol}{max || value[1].toFixed(2)}
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
                <div>
                    <p className='uppercase text-base font-semibold leading-[100%] pb-1 global-b-bottom lg:hidden block' onClick={() => setOpen(true)}>
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
                            productData?.map((product, i) => {
                                const images = product?.images;
                                const bestseller = product?.acf?.bestseller;
                                const hoverImage = product?.acf?.img?.url;
                                const src = Array.isArray(images) && images.length > 0 ? images[0]?.src : null;
                                return (
                                    <ProductCard price={product?.price_html} singlePrice={product?.price} type={product?.type} name={product?.name} bestseller={bestseller} hoverImage={hoverImage} image={src || default_image} key={i} slug={product?.slug} />
                                )
                            })
                        }
                    </div>
            }

            {/* PopUp */}


            <PopUp isOpen={isOpen}>
                <div className='w-[90%] mx-auto bg-white/95 h-[90vh] p-4 rounded-[4px] overflow-hidden shadow-xl'>
                    <div className='relative'>
                        <p className='font-medium uppercase text-xs leading-[100%] pb-4 text-[#999] border-gray-300 border-b'>Filters</p>
                        <X className="w-4 h-4 absolute top-0 right-0 text-[#999]" onClick={() => setOpen(!isOpen)} />
                    </div>
                    <div className='mb-4 mt-4 h-[50%] overflow-y-scroll popup-scroll-bar-1'>
                        <p className='font-semibold text-base leading-[100%] text-black mb-4'>{a("categories")}</p>
                        {
                            isLoadingChildCategories ? <div>Loading...</div> : <>
                                {childCategories && childCategories.length > 0
                                    ? renderCategories(childCategories)
                                    : <p className="text-sm text-gray-500">No {a("categories")}</p>}
                            </>
                        }
                    </div>
                    <div>
                        {isLoading ? <div>Loading...</div> :
                            <>
                                <label className='uppercase text-base font-medium mb-4 block' for="vol">PRIX</label>
                                <RangeSlider min={minPrice} max={maxPrice} defaultValue={[min || minPrice, max || maxPrice]} onInput={(val) => handleChange(val)} className='my-dashed-slider -ml-2' />
                                <div className='text-[14px] leading-[15px] font-semibold mt-4'>
                                    {currencySymbol} {min || minPrice.toFixed(2)} — {currencySymbol} {max || maxPrice.toFixed(2)}
                                </div>
                            </>
                        }
                        {/* <FormButton label={"TERMINER"}/> */}
                        <button type='button' className='text-center bg-black text-white w-full mt-4 text-sm leading-[100%] py-5 font-semibold rounded-4xl cursor-pointer' onClick={() => setOpen(!isOpen)}>
                            {a("finish")}
                        </button>
                    </div>
                </div>
            </PopUp>

        </div>
    );
};

export default Products;



