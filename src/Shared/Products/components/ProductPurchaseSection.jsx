import React from 'react';
import { getStockDisplayMessage, WAREHOUSES } from '../utils/stockUtils';

const ProductPurchaseSection = ({
    hasVariations,
    variationPrice,
    priceLoading,
    variationInStock,
    currencySymbol,
    location,
    warehouses, // This prop might be redundant now if we import WAREHOUSES, but keeping for compatibility
    matchedVariation,
    acf,
    isEuropeLocation,
    baseInStock,
    allVariationsSelected,
    isInStock,
    isStockLimitReached,
    stockQuantity,
    isButtonReady,
    addingToCart,
    t,
    attributes
}) => {
    // Helper to determine if we should show stock for simplified products
    const renderSimpleProductStock = () => {
        const message = getStockDisplayMessage({ acf }, location);
        const shouldShowStockUSA = location === (warehouses?.USA || WAREHOUSES.USA);
        const shouldShowStockEU = location === (warehouses?.EUROPE || WAREHOUSES.EUROPE);

        if (!message) return null;

        return (
            <span className='text-base font-semibold text-[#111]'>
                {shouldShowStockUSA ? (
                    <>{t("stock_usd_acf")} : {message}</>
                ) : shouldShowStockEU ? (
                    <>{t("stock_fr_acf")} : {message}</>
                ) : null}
            </span>
        );
    };

    return (
        <div className='space-y-4'>
            {/* Price Loading */}
            {priceLoading && allVariationsSelected && (
                <span className='text-[#111] font-bold text-[24px] leading-[110%] block opacity-50'>
                    {t("loading")}
                </span>
            )}

            {/* Price for variations */}
            {hasVariations && variationPrice && !priceLoading && variationInStock && (
                <div className='space-y-1'>
                    <span className='text-[#111] font-bold text-[24px] leading-[110%] block'>
                        {parseFloat(variationPrice)?.toFixed(2)}{currencySymbol}
                    </span>
                    <span className='text-base font-semibold text-[#111]'>
                        {(() => {
                            const message = getStockDisplayMessage(matchedVariation, location);
                            const shouldShowStockUSA = location === (warehouses?.USA || WAREHOUSES.USA);
                            const shouldShowStockEU = location === (warehouses?.EUROPE || WAREHOUSES.EUROPE);

                            if (!message) return null;

                            return shouldShowStockUSA ? (
                                <>{t("stock_usd_acf")} : {message}</>
                            ) : shouldShowStockEU ? (
                                <>{t("stock_fr_acf")} : {message}</>
                            ) : null;
                        })()}
                    </span>
                </div>
            )}

            {/* Stock info for simple products */}
            {!hasVariations && renderSimpleProductStock()}

            {/* Out of Stock Messages */}
            {hasVariations && allVariationsSelected && !isInStock && !priceLoading && (
                <p className='text-red-500 font-semibold text-sm'>{t("stock")}</p>
            )}

            {!hasVariations && !baseInStock && (
                <p className='text-red-500 font-semibold text-sm'>{t("stock")}</p>
            )}

            {/* Stock Limit Reached Message */}
            {isStockLimitReached && isInStock && (
                <p className='text-red-500 font-semibold text-sm'>
                    {t("stockLimitReached") || `Quantité maximale atteinte (${stockQuantity} disponible${stockQuantity > 1 ? 's' : ''})`}
                </p>
            )}

            {/* Button */}
            <button
                disabled={!isButtonReady || addingToCart}
                className={`text-base leading-[100%] uppercase font-bold w-full rounded-sm min-h-[46px] flex items-center justify-center cursor-pointer ${isButtonReady && !addingToCart
                    ? "bg-[#1D98FF] text-white"
                    : "bg-[#1D98FF]/50 text-white cursor-not-allowed"
                    }`}
                type="submit"
            >
                {t("buy")}
            </button>
        </div>
    );
};

export default ProductPurchaseSection;
