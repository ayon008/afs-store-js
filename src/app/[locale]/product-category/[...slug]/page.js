import React, { Suspense } from 'react';
const default_image = "/assets/images/GWEN-WB-D-lite-1024x573.png.webp"
import Link from 'next/link';
import { getParentCategory } from '@/app/actions/WC/getParentCategory';
import { getChildCategories, getLocaleValue, getProductsByCategoryId } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import FilterProducts from '@/Shared/Products/Filter';
import SkeletonProjectCard from '@/Shared/Loader/SkeletonLoader';
import AllProducts from '@/Shared/Products/AllProducts';

const page = async ({ params, searchParams }) => {
    const locale = await getLocaleValue();
    const { slug } = await params;
    const [parent, ...children] = slug;

    // Getting the Category details by the slug [lase category of the slug]
    const category = await getParentCategory(slug[slug?.length - 1].toLowerCase());


    // Category Image
    const image = category?.image?.src || default_image;
    // const productData = await getProductsByCategoryId(category?.id);
    const { min = null, max = null, category: categoryIds } = await searchParams;

    const productData = await getProductsByCategoryId(category?.id);
    const maxPrice = Math.max(...productData.map(p => p?.price_with_tax));
    const minPrice = Math.min(...productData.map(p => p?.price_with_tax));
    const childCategories = await getChildCategories(category?.id);


    const SkeletonGrid = () => {
        return (
            <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto global-margin'>
                {
                    [...Array(6)].map((_, i) => {
                        return (
                            <SkeletonProjectCard key={i} />
                        )
                    })
                }
            </div>
        )
    }

    const BreadCums = () => {
        let path = `/${locale}/product-category`;

        return (
            <div className='uppercase'>
                <div className='font-bold text-sm text-white'>
                    <Link className='inline' href="/">Accueil</Link>

                    {slug?.map((singleSlug, i) => {
                        path = path + `/${singleSlug}`
                        return (
                            <Link
                                key={i}
                                href={path}
                                className="uppercase inline"
                            >
                                {" / "}{singleSlug.split("-").join(" ")}
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className='lg:h-[620px] h-[485px] w-full relative global-margin bg-no-repeat bg-cover bg-center'
                style={{ backgroundImage: `url(${image})` }}
            >
                <div className='global-padding pt-4 max-w-[1920px] mx-auto'>
                    <BreadCums />
                    <div>
                        <h1 className='global-h2 text-white absolute bottom-8'>
                            {category?.name}
                        </h1>
                    </div>
                </div>
            </div>
            <div className='flex items-start justify-center gap-10 lg:flex-row flex-col global-padding max-w-[1920px] mx-auto relative lg:pb-20 pb-10'>
                {/* Product Filter */}
                <FilterProducts maxPrice={maxPrice} minPrice={minPrice} min={min} max={max} childCategories={childCategories} id={category?.id} />

                {/* Products */}
                <Suspense
                    key={`${categoryIds}-${max}-${min}`}
                    fallback={
                        <SkeletonGrid />
                    }>
                    <AllProducts ids={categoryIds ? categoryIds : [category?.id]} max={max} min={min} />
                </Suspense>
            </div>
        </div>
    );
};

export default page;