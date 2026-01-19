import React from 'react';

const ProductInfo = ({ t, a }) => {
    return (
        <div className='space-y-5 mt-10'>
            <div className='space-y-2'>
                <p className='text-base leading-[100%] font-bold'>{t('warranty')}</p>
                <small className='text-[15px] leading-[19px] block'>
                    {t("Tous nos produits sont garantis 2 ans.")}
                </small>
            </div>
            <div className='space-y-2'>
                <p className='text-base leading-[100%] font-bold'>{t("after-sale")}</p>
                <small className='text-[15px] leading-[19px] block'>{t("return")}</small>
            </div>
            <div className='space-y-2'>
                <p className='text-base leading-[100%] font-bold'>{a("payment")}</p>
                <small className='text-[15px] leading-[19px] block'>{t("payment_single")}</small>
            </div>
        </div>
    );
};

export default ProductInfo;
