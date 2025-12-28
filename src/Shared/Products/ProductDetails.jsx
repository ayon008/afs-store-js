"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowUpRight, X } from "lucide-react";
import { useForm } from "react-hook-form";
import Image from 'next/image';
import PopUp from '../PopUp/PopUp';
import { getPrice } from '@/app/actions/Woo-Coommerce/getWooCommerce';
import useCart from '../Hooks/useCart';
import Cookies from 'js-cookie';


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


const ProductDetails = ({ data }) => {

    const [priceLoading, setPriceLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const { register, handleSubmit, watch } = useForm();
    const [variationPrice, setVariationPrice] = useState(null);
    const [variationTaxAmount, setVariationTaxAmount] = useState(null);
    const [variationCountry, setVariationCountry] = useState(null);
    const [variationId, setVariationId] = useState(null);
    const [variationInStock, setVariationInStock] = useState(true);
    const [variationAttributes, setVariationAttributes] = useState(null);
    const productId = data?.id;

    // Check if product is in stock (base product)
    const baseInStock = data?.stock_status === 'instock' || data?.in_stock === true;

    // Final stock check: base product AND selected variation must be in stock
    const isInStock = baseInStock && variationInStock;

    const { handleAddToCart } = useCart();

    const acf = data?.acf;
    const compatibilite = acf?.compatibilite;
    const short_description = data?.short_description;
    const priceHtml = data?.price_html;
    const priceWithTax = data?.price_with_tax;
    const attributes = data?.attributes;

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
            setVariationTaxAmount(null);
            setVariationCountry(null);
            setVariationId(null);
            setVariationInStock(true);
            setVariationAttributes(null);
            return;
        }

        const fetchVariationPrice = async () => {
            setPriceLoading(true);
            try {
                const matchedVariation = await getPrice(productId, watchedValues);
                if (matchedVariation) {
                    setVariationPrice(matchedVariation.price);
                    setVariationTaxAmount(matchedVariation.taxAmount);
                    setVariationCountry(matchedVariation.userCountry);
                    setVariationId(matchedVariation.id);
                    // Store the variation attributes for cart submission
                    setVariationAttributes(matchedVariation.attributes?.attributes || null);
                    // Check if the variation is in stock
                    const stockStatus = matchedVariation.attributes?.stock_status;
                    const variationStock = stockStatus
                        ? stockStatus === 'instock'
                        : (matchedVariation.attributes?.in_stock === true || matchedVariation.attributes?.is_in_stock === true || matchedVariation.attributes?.purchasable !== false);
                    setVariationInStock(variationStock);
                } else {
                    setVariationPrice(null);
                    setVariationTaxAmount(null);
                    setVariationCountry(null);
                    setVariationId(null);
                    setVariationAttributes(null);
                }
            } catch (error) {
                console.error('Error fetching variation price:', error);
                setVariationPrice(null);
                setVariationTaxAmount(null);
                setVariationCountry(null);
                setVariationId(null);
                setVariationAttributes(null);
            } finally {
                setPriceLoading(false);
            }
        };

        fetchVariationPrice();
    }, [allVariationsSelected, JSON.stringify(watchedValues), productId, attributes]);

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

    // Handle add to cart
    const onSubmit = async (formData) => {
        // For variable products: require variationPrice and isInStock
        // For simple products: only require baseInStock
        if (hasVariations) {
            if (!variationPrice || !isInStock) return;
        } else {
            if (!baseInStock) return;
        }

        setAddingToCart(true);
        try {
            // Use variation attributes from the matched variation (already in correct WooCommerce format)
            const formattedVariations = hasVariations
                ? formatVariationsForWooCommerce()
                : {};

            const result = await handleAddToCart(
                productId,
                1,
                variationId || null,
                formattedVariations
            );
            console.log(result, 'result');

            if (!result?.success) {
                alert(decodeHtmlEntities(result?.error) || 'Une erreur est survenue lors de l\'ajout au panier.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(decodeHtmlEntities(error?.message) || 'Une erreur est survenue lors de l\'ajout au panier.');
        } finally {
            setAddingToCart(false);
        }
    };

    const [isOpen, setOpen] = useState(false);

    // Button is ready only when: all variations selected + price loaded + in stock
    const isButtonReady = hasVariations
        ? (allVariationsSelected && variationPrice && !priceLoading && isInStock)
        : (baseInStock && !priceLoading);

    return (
        <>
            <div>
                <h1 className="text-[clamp(2rem,1.6547rem+0.7203vw,2.375rem)] font-bold leading-[100%] lg:mt-3">{data?.name}</h1>
                <div className='mt-2 mb-3 text-[15px] leading-[22px] font-semibold' dangerouslySetInnerHTML={{ __html: short_description }} />
                <div className='text-lg leading-[29px] font-bold mb-6' dangerouslySetInnerHTML={{ __html: price }} />
                {
                    compatibilite && <button onClick={() => setOpen(true)} className='text-[#1D98FF] text-base leading-[100%] font-semibold cursor-pointer'>
                        <span>Guide taille</span>
                        <span className='inline'><ArrowUpRight className='inline ml-1' size={'1.1rem'} strokeWidth={2.5} /></span>
                    </button>
                }

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-[30px] mt-5">
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
                                                            {" "} : {selectedValue}
                                                        </span>
                                                    )}
                                                </label>
                                            </th>
                                            <td>
                                                <ul className="flex flex-wrap gap-1">
                                                    {singleAttribute.options?.map((singleOption, idx) => (
                                                        <li key={idx}>
                                                            <label
                                                                className={`text-base leading-[130%] border-[2px] border-[#999]! cursor-pointer px-2 py-1 flex items-center justify-center font-semibold rounded-[34px] text-[#111111bf]
                                                ${watch(fieldName) === singleOption
                                                                        ? "bg-[#111111bf] text-white"
                                                                        : "border-black text-[#111111bf]"
                                                                    }
                                                `}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    value={singleOption}
                                                                    {...register(fieldName, { required: true })}
                                                                    className="hidden"
                                                                />
                                                                {singleOption}
                                                            </label>
                                                        </li>
                                                    ))}
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
                                Chargement du prix...
                            </span>
                        )}

                        {/* Price */}
                        {variationPrice && !priceLoading && (
                            <div className='space-y-1'>
                                <span className='text-[#111] font-bold text-[24px] leading-[110%] block'>
                                    {parseFloat(variationPrice)?.toFixed(2)}{currencySymbol}
                                </span>
                            </div>
                        )}

                        {/* Select variations message */}
                        {!allVariationsSelected && attributes?.length > 0 && (
                            <p className='text-gray-500 text-sm'>Veuillez sélectionner toutes les options</p>
                        )}

                        {/* Out of Stock Message - for variable products */}
                        {hasVariations && allVariationsSelected && !isInStock && !priceLoading && (
                            <p className='text-red-500 font-semibold text-sm'>Rupture de stock</p>
                        )}

                        {/* Out of Stock Message - for simple products */}
                        {!hasVariations && !baseInStock && (
                            <p className='text-red-500 font-semibold text-sm'>Rupture de stock</p>
                        )}

                        {/* Button */}
                        <button
                            disabled={!isButtonReady || addingToCart}
                            className={`text-base leading-[100%] uppercase font-bold w-full rounded-sm min-h-[46px] flex items-center justify-center cursor-pointer ${isButtonReady && !addingToCart ? "bg-[#1D98FF] text-white" : "bg-[#1D98FF]/50 text-white cursor-not-allowed"}`}
                            type="submit"
                        >
                            {addingToCart
                                ? 'AJOUT EN COURS...'
                                : (hasVariations ? (!isInStock && allVariationsSelected) : !baseInStock)
                                    ? 'RUPTURE DE STOCK'
                                    : 'AJOUTER AU PANIER'
                            }
                        </button>

                    </div>
                </form>

                {/* Other Details */}
                <div className='space-y-10 mt-10'>
                    <div className='space-y-2'>
                        <p className='text-base leading-[100%] font-bold'>Garantie</p>
                        <small className='text-[15px] leading-[19px] block'>Tous nos produits sont garantis 2 ans</small>
                    </div>
                    <div className='space-y-2'>
                        <p className='text-base leading-[100%] font-bold'>Après vente</p>
                        <small className='text-[15px] leading-[19px] block'>Retour gratuit sous 15 jours</small>
                    </div>
                    <div className='space-y-2'>
                        <p className='text-base leading-[100%] font-bold'>Modes de paiement</p>
                        <small className='text-[15px] leading-[19px] block'>Paiement sécurisé. Simple et rapide.</small>
                        <div className='flex items-center gap-4 mt-4'>
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/Layer_1-1.svg'} alt='visa' width={50} height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/Group-26.svg'} alt='visa' width={50} height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/svg3409-1.svg'} alt='visa' width={50} height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/image-7.svg'} alt='visa' width={50} height={50} />
                        </div>
                    </div>
                </div>
                <div className='flex items-stretch bg-[#F0F0F0] mt-10'>
                    <div className='p-4 2xl:w-[60%] w-full'>
                        <div className="space-y-2">
                            <p className='text-xs font-semibold text-[#666666]'>Expert produit AFS</p>
                            <h3 className='font-bold text-base leading-[24px]'>Besoin d'aide pour choisir votre matériel ?</h3>
                            <p className='text-[15px] leading-4 text-[#666666]/75'>Nous sommes là pour vous apporter des réponses complètes et des conseils qui vous aideront à faire le bon choix.</p>
                        </div>
                        <p className='text-xs leading-4 font-semibold mt-8 uppercase text-[#3F98FF]'>Prendre un rdv téléphonique <ArrowUpRight className='inline w-4 h-4' /></p>
                    </div>
                    <div className='2xl:w-[40%] w-0'>
                        <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/06/image-33-1.png.webp'} className='aspect-[1] w-full h-full' alt='' width={200} height={200} />
                    </div>
                </div>
            </div>


            {/* Pop Up */}
            <PopUp isOpen={isOpen}>
                <div className='bg-white max-w-[920px] w-[95%] p-5 relative mx-auto rounded-[4px]'>
                    <div className='global-b-bottom pb-2'>
                        {/* Absolute Button for closing Pop Up */}
                        <button onClick={() => setOpen(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer '>
                            <X className="w-4 h-4" />
                        </button>
                        <h2 className='text-[clamp(1.375rem,1.1448rem+0.4802vw,1.625rem)] leading-[100%] font-bold'>Guide des tailles</h2>

                    </div>
                    <div className='lg:mt-4 mt-0'>
                        <div className='font-bold compatibilite' dangerouslySetInnerHTML={{ __html: compatibilite }} />
                    </div>
                </div>
            </PopUp>
        </>
    );
};

export default ProductDetails;