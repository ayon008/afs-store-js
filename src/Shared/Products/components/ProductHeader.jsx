import React from 'react';
import { ArrowUpRight } from "lucide-react";

const ProductHeader = ({
    name,
    shortDescription,
    priceHtml,
    displayPrice,
    currencySymbol,
    hasVariations,
    t,
    compatibilite,
    setOpen
}) => {
    return (
        <div>
            <h1 className="text-[clamp(2rem,1.6547rem+0.7203vw,2.375rem)] font-bold leading-[100%] lg:mt-3">
                {name}
            </h1>
            <div
                className='mt-2 mb-3 text-[15px] leading-[22px] font-semibold'
                dangerouslySetInnerHTML={{ __html: shortDescription }}
            />

            {/* Show price: HTML for variable products, formatted price for simple products */}
            {hasVariations ? (
                <div
                    className='text-lg leading-[29px] font-bold mb-6'
                    dangerouslySetInnerHTML={{ __html: priceHtml }}
                />
            ) : (
                displayPrice > 0 && (
                    <div className='text-lg leading-[29px] font-bold mb-6'>
                        {parseFloat(displayPrice)?.toFixed(2)}{currencySymbol}
                    </div>
                )
            )}

            {compatibilite && (
                <button
                    onClick={() => setOpen(true)}
                    className='text-[#1D98FF] text-base leading-[100%] font-semibold cursor-pointer flex items-center'
                >
                    <span>{t("size")}</span>
                    <span className='inline'>
                        <ArrowUpRight className='inline ml-1' size={'1.1rem'} strokeWidth={2.5} />
                    </span>
                </button>
            )}
        </div>
    );
};

export default ProductHeader;
