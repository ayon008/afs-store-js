import React from 'react';
const default_image = "/assets/images/GWEN-WB-D-lite-1024x573.png.webp"
import Link from 'next/link';
import Products from '@/Shared/Products/Products';
import { getParentCategory } from '@/app/actions/WC/getParentCategory';
import { getChildCategories } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { getTranslations } from 'next-intl/server';
import NotFound from '@/Shared/NotFound/404';

const page = async ({ params, searchParams }) => {
    // Catch All Route
    const { slug } = await params;
    // Getting the Category details by the slug [lase category of the slug]
    const category = await getParentCategory(slug[slug?.length - 1].toLowerCase());

    if (!category) {
        return (
            <NotFound />
        )
    }



    // Category Image
    const image = category?.image?.src || default_image;
    // child categories
    const childCategories = await getChildCategories(category?.id);

    const BreadCums = async () => {
        const t = await getTranslations("breadcum");
        let path = "/product-category";

        return (
            <div className='uppercase'>
                <div className='font-bold text-sm text-white'>
                    <Link className='inline' href="/">{t("home")}</Link>

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
        <div className='global-margin'>
            <div className='h-[calc(100vh-139px)] max-h-[780px] w-full relative mb-[clamp(3.75rem,0.2971rem+7.2029vw,7.5rem)] bg-no-repeat bg-cover bg-center'
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
                <Products childCategories={childCategories} id={category?.id} />
            </div>
        </div>
    );
};

export default page;