import React from 'react';

const ProductPurchaseSection = ({
    hasVariations,
    variationPrice,
    priceLoading,
    variationInStock,
    currencySymbol,
    location,
    warehouses,
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
        const shouldShowStockUSA = !!(location === warehouses.USA && acf?.stock_for_usa);
        const shouldShowStockEU = !!(isEuropeLocation && acf?.date_de_livraison_estimee_from_dolibarr);
        const shouldShowStock = shouldShowStockUSA || shouldShowStockEU;

        return shouldShowStock ? (
            <span className='text-base font-semibold text-[#111]'>
                {shouldShowStockUSA ? (
                    <>{t("stock_usd_acf")} : {acf?.stock_for_usa}</>
                ) : shouldShowStockEU ? (
                    <>{t("stock_fr_acf")} : {acf?.date_de_livraison_estimee_from_dolibarr}</>
                ) : null}
            </span>
        ) : null;
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
                        {location === warehouses.USA && matchedVariation?.acf?.stock_for_usa ? (
                            <>{t("stock_usd_acf")} : {matchedVariation?.acf?.stock_for_usa}</>
                        ) : isEuropeLocation && matchedVariation?.acf?.date_de_livraison_estimee_from_dolibarr && (
                            <>{t("stock_fr_acf")} : {matchedVariation?.acf?.date_de_livraison_estimee_from_dolibarr}</>
                        )}
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
