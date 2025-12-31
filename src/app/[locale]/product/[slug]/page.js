import { getProductBySlug } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import NotFound from '@/Shared/NotFound/404';
import SingleProduct from '@/Shared/Products/SingleProduct';
import React from 'react';

const page = async ({ params }) => {
    const { slug } = await params;
    const data = await getProductBySlug(slug);

    if (!data) {
        return (
            <NotFound />
        )
    }

    return (
        <div>
            <SingleProduct data={data} />
        </div>
    );
};

export default page;