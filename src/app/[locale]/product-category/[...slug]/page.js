import React from 'react';
const default_image = "/assets/images/GWEN-WB-D-lite-1024x573.png.webp"
import Link from 'next/link';
import Products from '@/Shared/Products/Products';
import { getParentCategory } from '@/app/actions/WC/getParentCategory';
import { getChildCategories, getProductsByCategoryId } from '@/app/actions/Woo-Coommerce/getWooCommerce';

const page = async ({ params, searchParams }) => {
    // Catch All Route
    const { slug } = await params;
    // Destructuring the params from slug
    const [parent, ...children] = slug;

    // Getting the Category details by the slug [lase category of the slug]
    const category = await getParentCategory(slug[slug?.length - 1].toLowerCase());


    // Category Image
    const image = category?.image?.src || default_image;
    const productData = await getProductsByCategoryId(category?.id);

    // console.log("productData", productData.length);

    const maxPrice = Math.max(...productData.map(p => p?.price_with_tax));
    const minPrice = Math.min(...productData.map(p => p?.price_with_tax));

    const childCategories = await getChildCategories(category?.id);

    const { min = null, max = null } = await searchParams;

    const BreadCums = () => {
        let path = "/category-product";

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
            <div>
                {/* <Products maxPrice={maxPrice} minPrice={minPrice} childCategories={childCategories} min={min} max={max} id={category?.id} /> */}
            </div>
        </div>
    );
};

export default page;