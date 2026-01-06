"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowUpRight, X } from "lucide-react";
import { useForm } from "react-hook-form";
import Image from 'next/image';
import PopUp from '../PopUp/PopUp';
import useCart from '../Hooks/useCart';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';


// Helper function to update price in WooCommerce HTML
const updatePriceInHtml = (priceHtml, newPrice) => {
    if (!priceHtml || !newPrice) return priceHtml;

    // Format the new price (e.g., 374.17 -> "374,17")
    const formattedPrice = parseFloat(newPrice).toFixed(2).replace('.', ',');

    // Replace the price inside <bdi> tags, keeping the currency symbol
    // Pattern: matches content before the currency symbol span
    const updatedHtml = priceHtml.replace(
        /(<bdi>)[\d\s,.]+(<span class="woocommerce-Price-currencySymbol">)/g,
        `$1${formattedPrice}$2`
    );

    return updatedHtml;
};





function decodeHtml(html) {
    if (typeof window === 'undefined') return html;
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

const ProductDetails = ({ data, variations }) => {

    const [priceLoading, setPriceLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const { register, handleSubmit, watch } = useForm();
    const [variationPrice, setVariationPrice] = useState(null);
    const [variationId, setVariationId] = useState(null);
    const [variationInStock, setVariationInStock] = useState(true);
    const [variationAttributes, setVariationAttributes] = useState(null);
    const [matchedVariation, setMatchedVariation] = useState(null);

    const t = useTranslations("product");

    // Check if product is in stock (base product)
    const baseInStock = data?.stock_status === 'instock' || data?.in_stock === true;

    // Final stock check: base product AND selected variation must be in stock
    // const isInStock = baseInStock && variationInStock;
    const isInStock = variationInStock;

    const { handleAddToCart, getItemQuantity, cart } = useCart();

    const acf = data?.acf;

    const compatibilite = acf?.compatibilite;
    const short_description = data?.short_description;
    const priceHtml = data?.price_html;
    const priceWithTax = data?.price_with_tax;
    const attributes = data?.attributes;
    const productId = data?.id;

    console.log(matchedVariation?.stock_quantity);


    // Update the price HTML with calculated tax price
    const price = useMemo(() => {
        return updatePriceInHtml(priceHtml, priceWithTax);
    }, [priceHtml, priceWithTax]);

    // Watch all form values
    const watchedValues = watch();

    // Check if product has variations
    const hasVariations = attributes && attributes.length > 0;

    // Check if all variations are selected
    const allVariationsSelected = hasVariations
        ? attributes.every(attr => watchedValues[attr.name])
        : true;

    // Auto-fetch price when all variations are selected
    useEffect(() => {
        if (!attributes || attributes.length === 0) return;
        if (!allVariationsSelected) {
            // Reset price when selections change
            setVariationPrice(null);
            setVariationId(null);
            setVariationInStock(true);
            setVariationAttributes(null);
            return;
        }

        const fetchVariationPrice = async () => {
            setPriceLoading(true);
            try {
                const matchedVariation = variations?.find((variation) => {
                    return variation.attributes.every((attr) => {
                        // WooCommerce provides english slug → convert to readable name
                        const attrName = attr.name
                            .replace("attribute_", "")
                            .toLowerCase()
                            .trim();

                        // Convert selectedVariation keys to lower-case comparison form
                        const selectedEntry = Object.entries(watchedValues).find(
                            ([key]) => key.toLowerCase().trim() === attrName
                        );

                        if (!selectedEntry) {
                            return true;
                        }

                        const selectedValue = selectedEntry[1];

                        if (!selectedValue) return false;

                        // Compare values
                        return (
                            selectedValue.toLowerCase().trim() ===
                            attr.option.toLowerCase().trim()
                        );
                    });
                });

                if (matchedVariation) {
                    // Find the corresponding attribute definition to get the slug
                    const getAttributeSlug = (attrName) => {
                        const attrDef = attributes?.find(a => a.name === attrName);
                        return attrDef?.slug || `pa_${attrName.toLowerCase().replace(/\s+/g, '-')}`;
                    };

                    const missingAttributes = Object.keys(watchedValues).filter(key => !matchedVariation?.attributes?.some(attr => {
                        const attrNameClean = attr?.name?.replace('attribute_', '').replace('pa_', '');
                        return attrNameClean === key.toLowerCase() || attr?.name === key;
                    }));
                    const missingAttributeData = missingAttributes?.map(attrName => {
                        const slug = getAttributeSlug(attrName);
                        return {
                            id: 0,
                            name: `attribute_${slug}`,
                            option: watchedValues[attrName]?.replace(/['/]/g, "") || watchedValues[attrName]
                        };
                    });

                    setMatchedVariation(matchedVariation);

                    setVariationPrice(matchedVariation.price_incl_tax);
                    setVariationId(matchedVariation.id);
                    // Store the variation attributes for cart submission
                    setVariationAttributes([...matchedVariation.attributes, ...missingAttributeData] || null);
                    // Check if the variation is in stock
                    const stockStatus = matchedVariation.stock_status;
                    const variationStock = stockStatus
                        ? stockStatus === 'instock'
                        : (matchedVariation.in_stock === true || matchedVariation.is_in_stock === true || matchedVariation.purchasable !== false);
                    setVariationInStock(variationStock);
                } else {
                    setVariationPrice(null);
                    setVariationId(null);
                    setVariationAttributes(null);
                }
            } catch (error) {
                console.error('Error fetching variation price:', error);
                setVariationPrice(null);
                setVariationId(null);
                setVariationAttributes(null);
            } finally {
                setPriceLoading(false);
            }
        };

        fetchVariationPrice();
    }, [allVariationsSelected, JSON.stringify(watchedValues), productId, attributes]);

    const a = useTranslations("profile")

    // Decode HTML entities
    const decodeHtmlEntities = (text) => {
        if (!text) return text;
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    // Transform variation attributes to WooCommerce format
    const formatVariationsForWooCommerce = () => {
        if (!hasVariations || !variationAttributes || !Array.isArray(variationAttributes)) {
            return {};
        }

        // variationAttributes from WooCommerce already has the correct format
        // Each attribute has: { name: "attribute_pa_taille", option: "M" }
        const formattedVariations = {};

        variationAttributes.forEach((attr) => {
            if (attr.name && attr.option) {
                formattedVariations[attr.name] = attr.option;
            }
        });

        return formattedVariations;
    };

    const currency = Cookies.get('currency');
    const currencySymbol = currency === 'euro' ? '€' : currency === 'usd' ? '$' : '£';
    const location = Cookies.get('location');
    console.log(location);


    // Handle add to cart
    const onSubmit = async (formData) => {
        // For variable products: require variationPrice and isInStock
        // For simple products: only require baseInStock
        if (hasVariations) {
            if (!variationPrice || !isInStock) return;
        } else {
            if (!baseInStock) return;
        }

        // Check stock quantity before adding to cart
        const stockQuantity = hasVariations
            ? (matchedVariation?.stock_quantity ?? null)
            : (data?.stock_quantity ?? null);

        // Get current quantity in cart for this product/variation
        const currentQuantityInCart = getItemQuantity(productId, variationId || null);

        // Check if adding 1 more would exceed stock
        if (stockQuantity !== null && stockQuantity !== undefined) {
            if (currentQuantityInCart >= stockQuantity) {
                alert(t("stockLimitReached") || `Vous ne pouvez pas ajouter plus de ${stockQuantity} exemplaire(s) de ce produit. Quantité disponible : ${stockQuantity}.`);
                return;
            }
        }

        setAddingToCart(true);
        try {
            // Use variation attributes from the matched variation (already in correct WooCommerce format)
            const formattedVariations = hasVariations
                ? formatVariationsForWooCommerce()
                : {};

            // Debug logging
            console.log('Adding to cart:', {
                productId,
                variationId,
                hasVariations,
                variationAttributes,
                formattedVariations,
                watchedValues
            });

            // For variable products, if formattedVariations is empty but we have watchedValues, use those
            let finalVariations = formattedVariations;
            if (hasVariations && Object.keys(formattedVariations).length === 0 && Object.keys(watchedValues).length > 0) {
                // Use watchedValues as fallback - these are the form values selected by user
                // WooCommerce expects attribute slugs (e.g., "pa_color") not names (e.g., "Color")
                finalVariations = {};
                attributes.forEach(attr => {
                    if (watchedValues[attr.name]) {
                        // Use slug if available, otherwise construct from name
                        const attrKey = attr.slug || `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`;
                        finalVariations[attrKey] = watchedValues[attr.name];
                    }
                });
                console.log('Using watchedValues as fallback:', finalVariations);
            }

            // Prepare product data for localStorage cart
            const productData = {
                id: productId,
                name: data?.name || '',
                price: hasVariations ? (variationPrice || 0) : (parseFloat(data?.price_with_tax) || parseFloat(data?.price) || 0),
                price_with_tax: hasVariations ? (variationPrice || 0) : (parseFloat(data?.price_with_tax) || parseFloat(data?.price) * 1.2 || 0),
                images: data?.images || [],
                image: data?.images?.[0]?.src || data?.image || '',
                stock_status: hasVariations ? (isInStock ? 'instock' : 'outofstock') : (baseInStock ? 'instock' : 'outofstock'),
                stock_quantity: hasVariations ? (variations?.find(v => v.id === variationId)?.stock_quantity || null) : (data?.stock_quantity || null),
                variations: variations || [],
            };

            const result = await handleAddToCart(
                productId,
                1,
                variationId || null,
                finalVariations,
                productData
            );

            // Only show alert if there's an actual error (success is explicitly false)
            // Don't show alert if success is true or if result is undefined/null
            if (result && result.success === false && result.error) {
                alert(decodeHtmlEntities(result.error) || 'Une erreur est survenue lors de l\'ajout au panier.');
            }
            // If success is true, the cart should open automatically via useCart hook
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(decodeHtmlEntities(error?.message) || 'Une erreur est survenue lors de l\'ajout au panier.');
        } finally {
            setAddingToCart(false);
        }
    };

    const [isOpen, setOpen] = useState(false);

    // Get current quantity in cart for this product/variation (recalculate when variationId changes)
    const currentQuantityInCart = useMemo(() => {
        return getItemQuantity(productId, variationId || null);
    }, [productId, variationId, getItemQuantity]);

    // Get stock quantity (recalculate when matchedVariation changes)
    const stockQuantity = useMemo(() => {
        return hasVariations
            ? (matchedVariation?.stock_quantity ?? null)
            : (data?.stock_quantity ?? null);
    }, [hasVariations, matchedVariation?.stock_quantity, data?.stock_quantity]);

    // Check if stock limit is reached (recalculate when currentQuantityInCart or stockQuantity changes)
    const isStockLimitReached = useMemo(() => {
        return stockQuantity !== null && stockQuantity !== undefined && currentQuantityInCart >= stockQuantity;
    }, [stockQuantity, currentQuantityInCart]);

    // Button is ready only when: all variations selected + price loaded + in stock + stock limit not reached
    const isButtonReady = hasVariations
        ? (allVariationsSelected && variationPrice && !priceLoading && isInStock && !isStockLimitReached)
        : (baseInStock && !priceLoading && !isStockLimitReached);


    const variationIndex = useMemo(() => {
        return variations?.map(v => ({
            inStock: v.stock_status === 'instock',
            attrs: v.attributes.reduce((acc, a) => {
                acc[a.name] = a.option;
                return acc;
            }, {})
        })) || [];
    }, [variations]);


    const variationValueMap = useMemo(() => {
        const map = {}; // { attributeName: Set(options) }

        variations?.forEach(v => {
            v.attributes.forEach(attr => {
                if (!map[attr.name]) {
                    map[attr.name] = new Set();
                }
                map[attr.name].add(attr.option);
            });
        });

        return map;
    }, [variations]);

    const optionAvailability = useMemo(() => {
        if (!attributes?.length) return {};

        const availability = {};

        attributes.forEach(attr => {
            availability[attr.name] = {};

            attr.options.forEach(option => {

                // 🔑 find variations that even use this attribute
                const relevantVariations = variationIndex.filter(v =>
                    v.attrs[attr.name] !== undefined
                );

                // 🟢 COMMON OPTION → attribute not used in any variation
                if (relevantVariations.length === 0) {
                    availability[attr.name][option] = true;
                    return;
                }

                // build selection (ignore common attrs automatically)
                const testSelection = {
                    ...Object.fromEntries(
                        Object.entries(watchedValues).filter(([k]) =>
                            attributes.some(a => a.name === k)
                        )
                    ),
                    [attr.name]: option
                };

                // stock check
                const inStock = relevantVariations.some(v => {
                    if (!v.inStock) return false;

                    return Object.entries(v.attrs).every(([key, value]) => {
                        if (!testSelection[key]) return true;
                        return testSelection[key] === value;
                    });
                });

                availability[attr.name][option] = inStock;
            });
        });

        return availability;
    }, [attributes, watchedValues, variationIndex]);




    return (
        <>
            <div>
                <h1 className="text-[clamp(2rem,1.6547rem+0.7203vw,2.375rem)] font-bold leading-[100%] lg:mt-3">{data?.name}</h1>
                <div className='mt-2 mb-3 text-[15px] leading-[22px] font-semibold' dangerouslySetInnerHTML={{ __html: short_description }} />
                <div className='text-lg leading-[29px] font-bold mb-6' dangerouslySetInnerHTML={{ __html: price }} />
                {
                    compatibilite && <button onClick={() => setOpen(true)} className='text-[#1D98FF] text-base leading-[100%] font-semibold cursor-pointer flex items-center'>
                        <span>{t("size")}</span>
                        <span className='inline'><ArrowUpRight className='inline ml-1' size={'1.1rem'} strokeWidth={2.5} /></span>
                    </button>
                }

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className={`space-y-[30px] mt-5`}>
                    <div className="flex flex-col gap-4">
                        <table>
                            <tbody className="flex flex-col gap-5">
                                {attributes?.map((singleAttribute, index) => {
                                    const fieldName = singleAttribute.name;
                                    const selectedValue = watch(fieldName);
                                    return (
                                        <tr key={index} className="flex flex-col gap-[6px]">
                                            <th className="font-bold text-left p-0!">
                                                <label className='font-semibold text-base leading-[100%] text-left'>
                                                    {singleAttribute?.name}
                                                    {selectedValue && (
                                                        <span className="">
                                                            {" "} : {decodeHtml(selectedValue)}
                                                        </span>
                                                    )}
                                                </label>
                                            </th>
                                            <td>
                                                <ul className="flex flex-wrap gap-1">
                                                    {singleAttribute.options?.map((singleOption, idx) => {
                                                        const inStock = optionAvailability[singleAttribute.name]?.[singleOption] ?? true;
                                                        const selected = watch(fieldName) === singleOption;

                                                        return (
                                                            <li key={idx}>
                                                                <label
                                                                    className={`text-base leading-[130%] border-[2px] border-[#111]! cursor-pointer px-2 py-1 flex items-center justify-center font-semibold rounded-[34px]
                    ${selected
                                                                            ? "bg-[#111] text-white"
                                                                            : "border-[#111] text-[#111]"
                                                                        }
                    ${!inStock ? "opacity-50 line-through cursor-not-allowed" : ""}
                `}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        value={singleOption}
                                                                        {...register(fieldName, { required: true })}
                                                                        className="hidden"
                                                                        disabled={!inStock} // prevent selecting unavailable option
                                                                    />
                                                                    {decodeHtml(singleOption)}
                                                                </label>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className='space-y-4'>
                        {/* Price Loading */}
                        {priceLoading && allVariationsSelected && (
                            <span className='text-[#111] font-bold text-[24px] leading-[110%] block opacity-50'>
                                {t("loading")}
                            </span>
                        )}

                        {/* Price */}
                        {variationPrice && !priceLoading && variationInStock && (
                            <div className='space-y-1'>
                                <span className='text-[#111] font-bold text-[24px] leading-[110%] block'>
                                    {parseFloat(variationPrice)?.toFixed(2)}{currencySymbol}
                                </span>
                                <span className='text-base font-semibold text-[#111]'>
                                    {
                                        location === '2683' && matchedVariation?.acf?.USA_Stock ?
                                            <>{t("stock_usd_acf")} : {matchedVariation?.acf?.USA_Stock}</>
                                            :
                                            matchedVariation?.acf?.date_de_livraison_estimee_from_dolibarr &&
                                            <>{t("stock_fr_acf")} : {matchedVariation?.acf?.date_de_livraison_estimee_from_dolibarr}
                                            </>
                                    }
                                </span>
                            </div>
                        )}

                        {/* Select variations message */}
                        {/* {!allVariationsSelected && attributes?.length > 0 && (
                            <p className='text-gray-500 text-sm'>{t("select")}</p>
                        )} */}

                        {/* Out of Stock Message - for variable products */}
                        {hasVariations && allVariationsSelected && !isInStock && !priceLoading && (
                            <p className='text-red-500 font-semibold text-sm'>{t("stock")}</p>
                        )}

                        {/* Out of Stock Message - for simple products */}
                        {!hasVariations && !baseInStock && (
                            <p className='text-red-500 font-semibold text-sm'>{t("stock")}</p>
                        )}

                        {/* Stock Limit Reached Message */}
                        {/* {isStockLimitReached && isInStock && (
                            <p className='text-red-500 font-semibold text-sm'>
                                {t("stockLimitReached") || `Quantité maximale atteinte (${stockQuantity} disponible${stockQuantity > 1 ? 's' : ''})`}
                            </p>
                        )} */}

                        {/* Button */}
                        <button
                            disabled={!isButtonReady || addingToCart}
                            className={`text-base leading-[100%] uppercase font-bold w-full rounded-sm min-h-[46px] flex items-center justify-center cursor-pointer ${isButtonReady && !addingToCart ? "bg-[#1D98FF] text-white" : "bg-[#1D98FF]/50 text-white cursor-not-allowed"}`}
                            type="submit"
                        >
                            {addingToCart
                                ? t("buy")
                                : t("buy")
                            }
                        </button>
                    </div>
                </form>

                {/* Other Details */}
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
                        <div className='flex items-center gap-[10px]'>
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/Layer_1-1.svg'} alt='visa' width={40} className='w-[40px] h-auto' height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/Group-26.svg'} alt='paypal;' width={80} className='w-[80px] h-auto' height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/svg3409-1.svg'} alt='mastercard' width={40} className='w-[40px] h-auto' height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/image-7.svg'} alt='visa' width={80} className='w-[80px] h-auto' height={50} />
                        </div>
                    </div>
                </div>
                <div className='flex items-stretch bg-[#F0F0F0] mt-10'>
                    <div className='p-4 2xl:w-[60%] w-full flex flex-col justify-between h-full'>
                        <div className="space-y-2">
                            <p className='text-xs font-semibold text-[#666666]'>{t("expert")}</p>
                            <h3 className='font-bold text-base leading-6'>{t("need")}</h3>
                            <p className='text-[15px] leading-4 text-[#666666]/75'>{t("we")}</p>
                        </div>
                        <p className='text-xs leading-4 font-semibold mt-8 uppercase text-[#3F98FF]'>{t("phone")} <ArrowUpRight className='inline w-4 h-4' /></p>
                    </div>
                    <div className='2xl:w-[40%] w-0 bg-[url("https://afs-foiling.com/fr/wp-content/uploads/2025/06/bg_img-1.png")] bg-contain bg-center bg-no-repeat'>
                        <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/06/image-33-1.png.webp'} className='aspect-[1] w-full h-full object-cover' alt='' width={200} height={200} />
                    </div>
                </div>
            </div>


            {/* Pop Up */}
            <PopUp isOpen={isOpen}>
                <div className='bg-white max-w-[920px] w-[95%] max-h-[80vh] overflow-x-hidden overflow-y-scroll p-5 relative mx-auto rounded-[4px]'>
                    <div className='global-b-bottom-d pb-2'>
                        {/* Absolute Button for closing Pop Up */}
                        <button onClick={() => setOpen(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer '>
                            <X className="w-4 h-4" />
                        </button>
                        <h2 className='text-[clamp(1.375rem,1.1448rem+0.4802vw,1.625rem)] leading-[100%] font-bold'>{t("guide")}</h2>
                    </div>
                    <div className='lg:mt-4 mt-0'>
                        <div
                            className="scroll-bar faq"
                            dangerouslySetInnerHTML={{ __html: compatibilite }}
                        />
                    </div>
                </div>
            </PopUp>
        </>
    );
};

export default ProductDetails;