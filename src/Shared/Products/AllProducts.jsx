import React from 'react'
import ProductCard from '../Card/ProductCard';
import { getProductsByCategoryId } from '@/app/actions/Woo-Coommerce/getWooCommerce';

const AllProducts = async ({ ids, max, min }) => {
    const productData = await getProductsByCategoryId(ids, max, min);
    return (
        <div className='grid xl:grid-cols-3 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 gap-4 lg:w-[80%] w-full grid-cols-2 max-w-[1920px] mx-auto global-margin'>
            {
                productData?.map((product) => {
                    const { images } = product;
                    const bestseller = product?.acf?.bestseller;
                    return (
                        <ProductCard price={product?.price_html} singlePrice={product?.price_with_tax} type={product?.type} name={product?.name} bestseller={bestseller} hoverImage={images[1]?.src} image={images[0]?.src} key={product?.id} slug={product?.slug} />
                    )
                })
            }
        </div>
    )
}

export default AllProducts;