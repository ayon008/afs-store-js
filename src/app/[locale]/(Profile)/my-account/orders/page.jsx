import React from 'react';
import OrderDetails from './OrderDetails';
import { getOrders } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import { getTranslations } from 'next-intl/server';



const page = async () => {
    const orders = await getOrders() || [];
    const t = await getTranslations('orders');
    const a = await getTranslations("profile")
    return (
        <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]'>
            <div className='space-y-[clamp(0.875rem,0.5297rem+0.7203vw,1.25rem)]'>
                <h2 className='global-h2'>{a("order")}</h2>
                <p className='profile-p'>{t("p")}</p>
            </div>
            <div className='space-y-1'>
                {
                    orders?.map((order) => {
                        return <OrderDetails key={order.id} order={order} />
                    })
                }
            </div>
        </div>
    );
};

export default page;