"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import useCart from '../Hooks/useCart';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { recalculatePriceForCountry, WAREHOUSES, calculatePriceWithVat } from '@/lib/countries-config';
import { getStockStatusForLocation } from './utils/stockUtils';

// Import new sub-components
import ProductHeader from './components/ProductHeader';
import ProductForm from './components/ProductForm';
import ProductPurchaseSection from './components/ProductPurchaseSection';
import ProductInfo from './components/ProductInfo';
import ExpertAdvice from './components/ExpertAdvice';
import CompatibilityModal from './components/CompatibilityModal';
import GradeModal from './components/GradeModal';
import CalendlyModal from './components/CalendlyModal';

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

    const [location, setLocation] = useState(WAREHOUSES.EUROPE);
    const [selectedCountry, setSelectedCountry] = useState('FR');
    const [currencySymbol, setCurrencySymbol] = useState('€'); // Default to EUR to avoid hydration mismatch
    const [gradeOpen, setGradeOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState("A");
    const [telephonePopUp, setTelephonePopUp] = useState(false);
    const calendlyContainerRef = React.useRef(null);
    const [isOpen, setOpen] = useState(false); // For CompatibilityModal

    const { register, handleSubmit, watch } = useForm();
    const [variationPrice, setVariationPrice] = useState(null);
    const [variationId, setVariationId] = useState(null);
    const [variationInStock, setVariationInStock] = useState(true);
    const [variationAttributes, setVariationAttributes] = useState(null);
    const [matchedVariation, setMatchedVariation] = useState(null);

    const t = useTranslations("product");
    const a = useTranslations("profile");

    // Check if product is in stock (base product)
    // const baseInStock = data?.stock_status === 'instock' || data?.in_stock === true;
    const { isInStock: baseInStock } = getStockStatusForLocation(data, location);

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


    const gradeImage = [
        { grade: "A", images: [`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont@2x.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-6.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-8.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-11.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-12.png`] },
        { grade: "B", images: [`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-14-e1730759964574.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-15-e1730760041494.png`, , `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-16-e1730760102909.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-17-e1730760192264.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-18-e1730760254642.png`, `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/right_cont-19-e1730760323713.png`] },
        {
            grade: "C", images: [
                `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Group-1-11-e1730761608511.png`,
                `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Group-2-9-e1730761695455.png`,
                `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Group-3-5-e1730761755539.png`,
                `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Group-4-1-e1730761801550.png`,
                `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Group-5-1-e1730761843118.png`
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
    const displayPrice = useMemo(() => {
        if (isEuropeLocation) {
            // Europe: Use TTC (price_incl_tax)
            if (priceInclTax && parseFloat(priceInclTax) > 0) {
                return parseFloat(priceInclTax);
            } else if (priceExclTax && parseFloat(priceExclTax) > 0) {
                // Recalculate TTC from HT
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

    // Only treat as variable when WooCommerce type is "variable" AND we have actual variations.
    const hasVariations = data?.type === 'variable' && Array.isArray(variations) && variations.length > 0;

    // Check if all variations are selected
    const allVariationsSelected = hasVariations
        ? attributes.every(attr => watchedValues[attr.name])
        : true;

    // Auto-fetch price when all variations are selected
    useEffect(() => {
        if (!hasVariations) return;
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
                    const basePrice = parseFloat(matchedVariation.price) || 0;
                    const priceInclTax = parseFloat(matchedVariation.price_incl_tax) || basePrice;

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

                    // Check if the variation is in stock using multi-location logic
                    const { isInStock } = getStockStatusForLocation(matchedVariation, currentLocation);
                    setVariationInStock(isInStock);
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
    }, [hasVariations, allVariationsSelected, JSON.stringify(watchedValues), productId, attributes]);


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

        const formattedVariations = {};

        variationAttributes.forEach((attr) => {
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
            const currentItem = hasVariations ? matchedVariation : data;
            const { backordersAllowed } = getStockStatusForLocation(currentItem, location);

            if (!backordersAllowed && currentQuantityInCart >= stockQuantity) {
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

            if (result && result.success === false && result.error) {
                alert(decodeHtmlEntities(result.error) || 'Une erreur est survenue lors de l\'ajout au panier.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(decodeHtmlEntities(error?.message) || 'Une erreur est survenue lors de l\'ajout au panier.');
        } finally {
            setAddingToCart(false);
        }
    };

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
        // Use multi-location stock logic to check backorder status
        const currentItem = hasVariations ? matchedVariation : data;
        const { backordersAllowed } = getStockStatusForLocation(currentItem, location);

        if (backordersAllowed) {
            return false; // No limit if backorders are allowed
        }

        return stockQuantity !== null && stockQuantity !== undefined && currentQuantityInCart >= stockQuantity;
    }, [stockQuantity, currentQuantityInCart, hasVariations, matchedVariation, data, location]);

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
                    // Use multi-location check on the variation object
                    // We need the full variation object, but v is from variationIndex which is simplified.
                    // We need to look up the original variation from `variations` array.
                    const fullVariation = variations.find(originalV => {
                        // Simple equality check of attributes (v.attrs vs originalV.attributes)
                        // But since we can't easily link back, maybe we should have stored ID in variationIndex.
                        // Optimization: let's assume if attributes match, it's the one.
                        return Object.entries(v.attrs).every(([k, val]) => {
                            const attr = originalV.attributes.find(a => a.name === k);
                            return attr && attr.option === val;
                        });
                    });

                    if (!fullVariation) return false;

                    const { isInStock: varInStock } = getStockStatusForLocation(fullVariation, location);
                    if (!varInStock) return false;

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
            widgetDiv.setAttribute('data-url', 'https://calendly.com/antonin-raffarin/besoin-d-etre-conseille-clone');
            widgetDiv.style.minWidth = '320px';
            widgetDiv.style.height = '100%';
            calendlyContainerRef.current.appendChild(widgetDiv);

            // Initialiser le widget Calendly
            try {
                window.Calendly.initInlineWidget({
                    url: 'https://calendly.com/antonin-raffarin/besoin-d-etre-conseille-clone',
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
                <ProductHeader
                    name={data?.name}
                    shortDescription={short_description}
                    priceHtml={price}
                    displayPrice={displayPrice}
                    currencySymbol={currencySymbol}
                    hasVariations={hasVariations}
                    t={t}
                    compatibilite={compatibilite}
                    setOpen={setOpen}
                />

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className={`space-y-[30px] mt-5`}>
                    <ProductForm
                        hasVariations={hasVariations}
                        attributes={attributes}
                        watch={watch}
                        register={register}
                        optionAvailability={optionAvailability}
                        decodeHtml={decodeHtml}
                        setGradeOpen={setGradeOpen}
                        t={t}
                    />

                    <ProductPurchaseSection
                        hasVariations={hasVariations}
                        variationPrice={variationPrice}
                        priceLoading={priceLoading}
                        variationInStock={variationInStock}
                        currencySymbol={currencySymbol}
                        location={location}
                        warehouses={WAREHOUSES}
                        matchedVariation={matchedVariation}
                        acf={acf}
                        isEuropeLocation={isEuropeLocation}
                        baseInStock={baseInStock}
                        allVariationsSelected={allVariationsSelected}
                        isInStock={isInStock}
                        isStockLimitReached={isStockLimitReached}
                        stockQuantity={stockQuantity}
                        isButtonReady={isButtonReady}
                        addingToCart={addingToCart}
                        t={t}
                        attributes={attributes}
                    />
                </form>

                <ProductInfo t={t} a={a} />
                <ExpertAdvice t={t} onOpenContact={() => setTelephonePopUp(true)} />
            </div>

            {/* Modals */}
            <CompatibilityModal
                isOpen={isOpen}
                setOpen={setOpen}
                content={compatibilite}
                t={t}
            />

            {used && (
                <GradeModal
                    isOpen={gradeOpen}
                    setOpen={setGradeOpen}
                    selectedGrade={selectedGrade}
                    setSelectedGrade={setSelectedGrade}
                    sliderImages={sliderImage}
                    t={t}
                />
            )}

            <CalendlyModal
                isOpen={telephonePopUp}
                setOpen={setTelephonePopUp}
                containerRef={calendlyContainerRef}
            />
        </>
    );
};

export default ProductDetails;