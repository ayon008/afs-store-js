"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowUpRight, Diamond, X } from "lucide-react";
import { useForm } from "react-hook-form";
import Image from 'next/image';
import PopUp from '../PopUp/PopUp';
import useCart from '../Hooks/useCart';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { recalculatePriceForCountry, WAREHOUSES, calculatePriceWithVat } from '@/lib/countries-config';
import 'swiper/css';
import 'swiper/css/navigation';


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
    // Priorité: price_incl_tax > price_with_tax (pour compatibilité)
    const priceInclTax = data?.price_incl_tax || data?.price_with_tax;
    const priceExclTax = data?.price_excl_tax || data?.price || 0;
    const attributes = data?.attributes;
    const productId = data?.id;
    const [location, setLocation] = useState(WAREHOUSES.EUROPE);
    const [selectedCountry, setSelectedCountry] = useState('FR');
    const [currencySymbol, setCurrencySymbol] = useState('€'); // Default to EUR to avoid hydration mismatch
    const [gradeOpen, setGradeOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState("A");
    const [telephonePopUp, setTelephonePopUp] = useState(false);
    const calendlyContainerRef = React.useRef(null);

    const gradeImage = [
        { grade: "A", images: ["https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont@2x.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-6.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-8.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-11.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-12.png"] },
        { grade: "B", images: ["https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-14-e1730759964574.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-15-e1730760041494.png", , "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-16-e1730760102909.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-17-e1730760192264.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-18-e1730760254642.png", "https://afs-foiling.com/fr/wp-content/uploads/2024/10/right_cont-19-e1730760323713.png"] },
        {
            grade: "C", images: [
                "https://afs-foiling.com/fr/wp-content/uploads/2024/10/Group-1-11-e1730761608511.png",
                "https://afs-foiling.com/fr/wp-content/uploads/2024/10/Group-2-9-e1730761695455.png",
                "https://afs-foiling.com/fr/wp-content/uploads/2024/10/Group-3-5-e1730761755539.png",
                "https://afs-foiling.com/fr/wp-content/uploads/2024/10/Group-4-1-e1730761801550.png",
                "https://afs-foiling.com/fr/wp-content/uploads/2024/10/Group-5-1-e1730761843118.png"
            ]
        }
    ]

    const sliderImage = gradeImage.find((item) => item.grade === selectedGrade)?.images;


    const used = attributes?.find((item) => item?.name === "Grade") ? true : false;

    // Get location and country from cookies and determine tax display mode
    useEffect(() => {
        const cookieLocation = Cookies.get('location');
        if (cookieLocation === WAREHOUSES.EUROPE || cookieLocation === WAREHOUSES.USA) {
            setLocation(cookieLocation);
        } else {
            setLocation(WAREHOUSES.EUROPE);
        }
        
        const cookieCountry = Cookies.get('selected_country');
        if (cookieCountry) {
            setSelectedCountry(cookieCountry);
        } else {
            // Default based on location
            setSelectedCountry(cookieLocation === WAREHOUSES.USA ? 'US' : 'FR');
        }

        // Set currency symbol from cookie (client-side only to avoid hydration mismatch)
        const currency = Cookies.get('currency');
        const symbol = currency === 'euro' ? '€' : currency === 'usd' ? '$' : '£';
        setCurrencySymbol(symbol);
    }, []);

    // Determine if we should show prices with tax included (Europe) or excluded (North America)
    const isEuropeLocation = location === WAREHOUSES.EUROPE;

    // Calculate the correct price to display based on location
    // Europe (2682): TTC (price_incl_tax)
    // North America (2683): HT (price_excl_tax)
    const displayPrice = useMemo(() => {
        if (isEuropeLocation) {
            // Europe: Use TTC (price_incl_tax)
            // Si price_incl_tax n'est pas disponible, recalculer à partir du HT
            if (priceInclTax && parseFloat(priceInclTax) > 0) {
                return parseFloat(priceInclTax);
            } else if (priceExclTax && parseFloat(priceExclTax) > 0) {
                // Recalculer TTC à partir du HT et du pays sélectionné
                return calculatePriceWithVat(parseFloat(priceExclTax), selectedCountry);
            }
            return 0;
        } else {
            // North America: Use HT (price_excl_tax)
            return parseFloat(priceExclTax) || 0;
        }
    }, [isEuropeLocation, priceInclTax, priceExclTax, selectedCountry]);

    // Update the price HTML with calculated tax price
    const price = useMemo(() => {
        return updatePriceInHtml(priceHtml, displayPrice);
    }, [priceHtml, displayPrice]);

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

                    // Get selected country from cookie for accurate VAT calculation
                    const selectedCountry = Cookies.get('selected_country') || 'FR';
                    
                    // Get current location to determine tax display mode
                    const currentLocation = Cookies.get('location') || WAREHOUSES.EUROPE;
                    const isEuropeLoc = currentLocation === WAREHOUSES.EUROPE;
                    
                    // Recalculate price with correct VAT for selected country
                    // WooCommerce may not have VAT rates configured for all countries
                    const basePrice = parseFloat(matchedVariation.price) || 0;
                    const priceInclTax = parseFloat(matchedVariation.price_incl_tax) || basePrice;
                    
                    // Calculate the correct price to display based on location
                    // Europe (2682): TTC (price_incl_tax)
                    // North America (2683): HT (price)
                    let displayVariationPrice;
                    if (isEuropeLoc) {
                        // Europe: Use TTC - recalculate with correct VAT for selected country
                        displayVariationPrice = recalculatePriceForCountry(
                            basePrice,
                            priceInclTax,
                            'FR', // WooCommerce default country
                            selectedCountry
                        );
                    } else {
                        // North America: Use HT (base price without tax)
                        displayVariationPrice = basePrice;
                    }

                    setVariationPrice(displayVariationPrice);
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

        // Use slug for API compatibility (WooCommerce Store API expects "pa_taille" not "Taille")
        // Each attribute has: { id, name: "Taille", slug: "pa_taille", option: "M" }
        const formattedVariations = {};

        variationAttributes.forEach((attr) => {
            // Prefer slug over name for API calls
            const attrKey = attr.slug || attr.name || '';
            const attrValue = attr.option || '';
            if (attrKey && attrValue) {
                formattedVariations[attrKey] = attrValue;
            }
        });

        return formattedVariations;
    };

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
            }

            // Prepare product data for localStorage cart
            // IMPORTANT: No hardcoded tax calculation - prices come from WooCommerce API
            const productData = {
                id: productId,
                name: data?.name || '',
                // For variations, use the selected variation price; for simple products, use the price from API
                price: hasVariations ? (variationPrice || 0) : (parseFloat(data?.price) || 0),
                // price_with_tax comes from API (calculated by WooCommerce based on location)
                price_with_tax: hasVariations ? (variationPrice || 0) : (parseFloat(data?.price_with_tax) || parseFloat(data?.price_incl_tax) || parseFloat(data?.price) || 0),
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

    // Gérer le chargement et la réinitialisation du widget Calendly dans le modal
    useEffect(() => {
        if (!telephonePopUp || typeof window === 'undefined' || !calendlyContainerRef.current) return;

        let calendlyWidget = null;

        // Fonction pour charger le script Calendly
        const loadCalendlyScript = () => {
            return new Promise((resolve, reject) => {
                // Vérifier si le script est déjà chargé
                if (window.Calendly) {
                    resolve();
                    return;
                }

                // Vérifier si le script est déjà en cours de chargement
                const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
                if (existingScript) {
                    existingScript.addEventListener('load', resolve);
                    existingScript.addEventListener('error', reject);
                    return;
                }

                // Créer et charger le script
                const script = document.createElement('script');
                script.src = 'https://assets.calendly.com/assets/external/widget.js';
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        // Fonction pour initialiser le widget
        const initCalendlyWidget = () => {
            if (!calendlyContainerRef.current || !window.Calendly) return;

            // Nettoyer complètement le conteneur
            calendlyContainerRef.current.innerHTML = '';

            // Créer un nouveau div pour le widget
            const widgetDiv = document.createElement('div');
            widgetDiv.className = 'calendly-inline-widget';
            widgetDiv.setAttribute('data-url', 'https://calendly.com/antonin-raffarin/passage-a-l-usine-foil-co-afs');
            widgetDiv.style.minWidth = '320px';
            widgetDiv.style.height = '100%';
            calendlyContainerRef.current.appendChild(widgetDiv);

            // Initialiser le widget Calendly
            try {
                window.Calendly.initInlineWidget({
                    url: 'https://calendly.com/antonin-raffarin/passage-a-l-usine-foil-co-afs',
                    parentElement: widgetDiv
                });
                calendlyWidget = widgetDiv;
            } catch (error) {
                console.error('Erreur lors de l\'initialisation du widget Calendly:', error);
            }
        };

        // Charger le script puis initialiser le widget
        loadCalendlyScript()
            .then(() => {
                // Attendre un peu pour que Calendly soit prêt
                setTimeout(() => {
                    initCalendlyWidget();
                }, 100);
            })
            .catch((error) => {
                console.error('Erreur lors du chargement du script Calendly:', error);
            });

        // Cleanup: nettoyer complètement le widget quand le modal se ferme
        return () => {
            if (calendlyContainerRef.current) {
                calendlyContainerRef.current.innerHTML = '';
            }
            calendlyWidget = null;
        };
    }, [telephonePopUp]);




    return (
        <>
            <div>
                <h1 className="text-[clamp(2rem,1.6547rem+0.7203vw,2.375rem)] font-bold leading-[100%] lg:mt-3">{data?.name}</h1>
                <div className='mt-2 mb-3 text-[15px] leading-[22px] font-semibold' dangerouslySetInnerHTML={{ __html: short_description }} />
                {/* Show price: HTML for variable products, formatted price for simple products */}
                {hasVariations ? (
                    <div className='text-lg leading-[29px] font-bold mb-6' dangerouslySetInnerHTML={{ __html: price }} />
                ) : (
                    displayPrice > 0 && (
                        <div className='text-lg leading-[29px] font-bold mb-6'>
                            {parseFloat(displayPrice)?.toFixed(2)}{currencySymbol}
                        </div>
                    )
                )}
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
                                                {fieldName === "Grade" &&
                                                    <button onClick={() => setGradeOpen(true)} className='text-[#1D98FF] text-base leading-[100%] font-semibold cursor-pointer flex items-center mb-5'>
                                                        <span>{t("Grade")}</span>
                                                        <span className='inline'><ArrowUpRight className='inline ml-1' size={'1.1rem'} strokeWidth={2.5} /></span>
                                                    </button>
                                                }
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

                        {/* Price for variations */}
                        {hasVariations && variationPrice && !priceLoading && variationInStock && (
                            <div className='space-y-1'>
                                <span className='text-[#111] font-bold text-[24px] leading-[110%] block'>
                                    {parseFloat(variationPrice)?.toFixed(2)}{currencySymbol}
                                </span>
                                <span className='text-base font-semibold text-[#111]'>
                                    {
                                        // Amérique du Nord (2683) : afficher stock_for_usa
                                        location === WAREHOUSES.USA && matchedVariation?.acf?.stock_for_usa ?
                                            <>{t("stock_usd_acf")} : {matchedVariation?.acf?.stock_for_usa}</>
                                            :
                                            // Europe (2682) : afficher date_de_livraison_estimee_from_dolibarr
                                            isEuropeLocation && matchedVariation?.acf?.date_de_livraison_estimee_from_dolibarr &&
                                            <>{t("stock_fr_acf")} : {matchedVariation?.acf?.date_de_livraison_estimee_from_dolibarr}
                                            </>
                                    }
                                </span>
                            </div>
                        )}

                        {/* Stock info for simple products */}
                        {!hasVariations && (() => {
                            const shouldShowStockUSA = !!(location === WAREHOUSES.USA && acf?.stock_for_usa);
                            const shouldShowStockEU = !!(isEuropeLocation && acf?.date_de_livraison_estimee_from_dolibarr);
                            const shouldShowStock = shouldShowStockUSA || shouldShowStockEU;
                            
                            return shouldShowStock ? (
                                <span className='text-base font-semibold text-[#111]'>
                                    {
                                        // Amérique du Nord (2683) : afficher stock_for_usa
                                        shouldShowStockUSA ?
                                            <>{t("stock_usd_acf")} : {acf?.stock_for_usa}</>
                                            :
                                            // Europe (2682) : afficher date_de_livraison_estimee_from_dolibarr
                                            shouldShowStockEU ?
                                            <>{t("stock_fr_acf")} : {acf?.date_de_livraison_estimee_from_dolibarr}</>
                                            :
                                            null
                                    }
                                </span>
                            ) : null;
                        })()}

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
                        {/* <div className='flex items-center gap-[10px]'>
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/Layer_1-1.svg'} alt='visa' width={40} className='w-[40px] h-auto' height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/Group-26.svg'} alt='paypal;' width={80} className='w-[80px] h-auto' height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/svg3409-1.svg'} alt='mastercard' width={40} className='w-[40px] h-auto' height={50} />
                            <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/05/image-7.svg'} alt='visa' width={80} className='w-[80px] h-auto' height={50} />
                        </div> */}
                    </div>
                </div>
                <div className='flex items-stretch bg-[#F0F0F0] mt-10'>
                    <div className='p-4 2xl:w-[60%] w-full flex flex-col justify-between h-full'>
                        <div className="space-y-2">
                            <p className='text-xs font-semibold text-[#666666]'>{t("expert")}</p>
                            <h3 className='font-bold text-base leading-6'>{t("need")}</h3>
                            <p className='text-[15px] leading-4 text-[#666666]/75'>{t("we")}</p>
                        </div>
                        <p onClick={() => setTelephonePopUp(true)} className='text-sm flex items-center cursor-pointer leading-4 font-semibold mt-8 uppercase text-[#3F98FF]'>{t("phone")} <ArrowUpRight className='inline w-4 h-4' /></p>
                    </div>
                    <div className='2xl:w-[40%] w-0 bg-[url("https://afs-foiling.com/fr/wp-content/uploads/2025/06/bg_img-1.png")] bg-contain bg-center bg-no-repeat'>
                        <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/06/image-33-1.png.webp'} className='aspect-[1] w-full h-full object-cover' alt='' width={200} height={200} />
                    </div>
                </div>
            </div>


            {/* Pop Up */}
            <PopUp isOpen={isOpen} fn={setOpen}>
                <div onClick={(e) => e.stopPropagation()} className='bg-white max-w-[920px] w-[95%] max-h-[80vh] overflow-x-hidden overflow-y-scroll p-5 relative mx-auto rounded-[4px]'>
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
            {/* Guide PopUp */}

            {
                used && (
                    <PopUp isOpen={gradeOpen} fn={setGradeOpen}>
                        <div onClick={(e) => e.stopPropagation()} className='max-w-[1120px] w-[95%] max-h-[80vh] overflow-x-hidden overflow-y-scroll scroll-bar relative mx-auto rounded-[4px] bg-white -z-20'>
                            <button onClick={() => setGradeOpen(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer'>
                                <X className="w-4 h-4 lg:text-black text-white z-10" />
                            </button>
                            {/* Content */}
                            <div className='flex items-stretch gap-1 lg:flex-row flex-col'>
                                {/* Slider */}
                                <div className='flex-1 lg:w-1/2 w-full bg-[#111]'>
                                    <Swiper
                                        modules={[Navigation]}
                                        navigation
                                        slidesPerView={1}
                                        spaceBetween={0}
                                        className="swiper-grade w-full h-full"
                                    >
                                        {
                                            sliderImage?.map((item, index) => {
                                                return (
                                                    <SwiperSlide key={index} className='w-full h-full'>
                                                        <div className="w-full h-full">
                                                            <Image src={item} className='w-full h-full object-contain' alt={`Grade ${selectedGrade}`} width={100} height={100} />
                                                        </div>
                                                    </SwiperSlide>
                                                )
                                            })
                                        }
                                    </Swiper>
                                </div>
                                {/* Content */}
                                <div className='flex-1 space-y-[30px] lg:px-5 lg:py-10 p-5 bg-white'>
                                    <div className='space-y-[10px]'>
                                        <h2 className='global-h2'>{t("Our grades")}</h2>
                                        <p className='lg:text-lg text-base leading-[110%] font-semibold text-[#111111bf]'>
                                            {t("Grade-p")}
                                        </p>
                                    </div>

                                    <div className='flex flex-col gap-[10px]'>

                                        {/* Grade A */}
                                        <label className="cursor-pointer block">
                                            <input
                                                type="radio"
                                                name="grade"
                                                value="A"
                                                checked={selectedGrade === "A"}
                                                onChange={() => setSelectedGrade("A")}
                                                className="peer hidden"
                                            />

                                            <div className="px-5 py-4 rounded-[20px] border border-[#111] flex items-start gap-2
                      peer-checked:bg-[#1D98FF] peer-checked:text-white transition">
                                                <svg className='flex-[20px_0_0]' xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none"><path d="M10 12.5L8 10.3L8.6 9.29999M6 5.5H18L21 10.5L12.5 20C12.4348 20.0665 12.357 20.1194 12.2712 20.1554C12.1853 20.1915 12.0931 20.2101 12 20.2101C11.9069 20.2101 11.8147 20.1915 11.7288 20.1554C11.643 20.1194 11.5652 20.0665 11.5 20L3 10.5L6 5.5Z" stroke={selectedGrade === "A" ? "#fff" : "#1D98FF"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>

                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold leading-[100%]">Grade A</h3>
                                                    <p className="text-base leading-[110%] opacity-80">
                                                        {t("grade_a_p")}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Grade B */}
                                        <label className="cursor-pointer block">
                                            <input
                                                type="radio"
                                                name="grade"
                                                value="B"
                                                checked={selectedGrade === "B"}
                                                onChange={() => setSelectedGrade("B")}
                                                className="peer sr-only"
                                            />

                                            <div className="px-5 py-4 rounded-[20px] border border-[#111] flex items-start gap-3
                      peer-checked:bg-[#111] peer-checked:text-white transition">
                                                <input
                                                    type="radio"
                                                    tabIndex={-1}
                                                    checked={selectedGrade === "B"}
                                                    readOnly
                                                    className="mt-1 accent-[#1D98FF] pointer-events-none"
                                                />

                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold leading-[100%]">Grade B</h3>
                                                    <p className="text-base leading-[110%] opacity-80">
                                                        {t("grade_b_p")}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Grade C */}
                                        <label className="cursor-pointer block">
                                            <input
                                                type="radio"
                                                name="grade"
                                                value="C"
                                                checked={selectedGrade === "C"}
                                                onChange={() => setSelectedGrade("C")}
                                                className="peer sr-only"
                                            />

                                            <div className="px-5 py-4 rounded-[20px] border border-[#111] flex items-start gap-3
                      peer-checked:bg-[#111] peer-checked:text-white transition">
                                                <input
                                                    type="radio"
                                                    tabIndex={-1}
                                                    checked={selectedGrade === "C"}
                                                    readOnly
                                                    className="mt-1 accent-[#1D98FF] pointer-events-none"
                                                />

                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold leading-[100%]">Grade C</h3>
                                                    <p className="text-base leading-[110%] opacity-80">
                                                        {t("grade_c_p")}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </PopUp>
                    // Telephone PopUp
                )
            }
            <PopUp isOpen={telephonePopUp} fn={setTelephonePopUp}>
                <div onClick={(e) => e.stopPropagation()} className='bg-white max-w-[649px] w-[95%] h-fit overflow-x-hidden  p-5 relative mx-auto rounded-[4px] overflow-hidden'>
                    <button onClick={() => setTelephonePopUp(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer z-10'>
                        <X className="w-4 h-4" />
                    </button>
                    <div className='pt-6 h-[80vh]'>
                        <div ref={calendlyContainerRef} style={{ minWidth: "320px", height: "100%" }}></div>
                    </div>
                </div>
            </PopUp>
        </>
    );
};

export default ProductDetails;