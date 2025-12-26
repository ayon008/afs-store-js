'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import FormButton from '../Button/FormButton';
import { useTranslations } from 'next-intl';

// Helper function to format price
const formatPrice = (price) => {
    // Return default price format if no price is provided
    if (!price && price !== 0) return '';

    // Convert the price to a clean string first
    let cleanPrice = price;

    // If it's HTML content, clean it up
    if (typeof price === 'string') {
        // Remove HTML tags
        cleanPrice = cleanPrice.replace(/<\/?[^>]+(>|$)/g, '');
        // Replace HTML entities
        cleanPrice = cleanPrice.replace(/&euro;/g, '');
        cleanPrice = cleanPrice.replace(/&nbsp;/g, ' ');
        // Remove 'From' if present
        cleanPrice = cleanPrice.replace(/From\s+/i, '');
        // Remove currency symbols
        cleanPrice = cleanPrice.replace(/[€$£]/g, '');
        // Clean up any extra spaces
        cleanPrice = cleanPrice.trim();
    }

    // Handle numeric input
    if (typeof price === 'number') {
        return price.toFixed(2).replace('.', ',') + '€';
    }

    // Convert to number if possible
    const numPrice = parseFloat(cleanPrice.replace(',', '.'));
    if (isNaN(numPrice)) return '0,00€';

    // Format the price with comma as decimal separator
    return numPrice.toFixed(2).replace('.', ',') + '€';
};

export default function ProductCard({
    name = 'D-LITE',
    image = 'https://placehold.co/600x600/E0E0E0/000000?text=Product+Image',
    hoverImage = null,
    slug,
    category = 'VERSATILITY',
    price,
    singlePrice,
    bestseller = "",
    alt,
    type = "simple"
}) {
    const productLink = `/product/${slug || name.toLowerCase().replace(/\s+/g, '-')}`;

    const cleanTitle = name
        .replace(/ - Duplicate/g, "")
        .replace(/ - \[#\d+\]/g, "")
        .trim();


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


    // Update the price HTML with calculated tax price
    const changePrice = useMemo(() => {
        return updatePriceInHtml(price, singlePrice);
    }, [price, singlePrice]);


    const t = useTranslations('product');


    return (
        <div className="group w-full bg-[#F7F7F7] flex flex-col justify-between mx-auto rounded-[4px] overflow-hidden h-auto">
            {/* Image Section */}
            <Link href={productLink} className="block">
                <div className="relative w-full aspect-[1] h-full overflow-hidden flex items-center justify-center group">

                    {/* Featured (default) Image */}
                    <Image
                        src={image}
                        alt={alt || name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={` object-contain absolute inset-0 pt-5
      opacity-100 ${hoverImage && "group-hover:opacity-0"}
      transition-opacity duration-300
      ease-[cubic-bezier(.19,1,.22,1)]`}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                'https://placehold.co/600x600/E0E0E0/000000?text=Image+Load+Error';
                        }}
                    />

                    {/* Hover Image */}
                    {hoverImage && (
                        <Image
                            src={hoverImage}
                            alt={`${alt || name} - hover`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="
        object-cover absolute inset-0
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        ease-[cubic-bezier(.19,1,.22,1)]
      "
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.classList.add('opacity-0');
                            }}
                            aria-hidden="true"
                        />
                    )}

                    {/* Label */}
                    {bestseller && (
                        <div className="absolute top-2 left-2 z-10">
                            <span className="inline-block px-2 py-1 bg-[#E6E6E6] text-black lg:text-xs text-[10px] font-semibold uppercase tracking-wider">
                                {bestseller}
                            </span>
                        </div>
                    )}
                </div>

            </Link>
            {/* Text Section */}
            <div className="flex flex-col flex-1 px-4 mt-[10px] gap-5 pb-4 text-center">
                <div className="flex-1">
                    <h2 className="text-[clamp(0.875rem,0.805rem+0.2667vw,1.125rem)] uppercase lg:leading-[20px] leading-[100%] font-bold">
                        {cleanTitle}
                    </h2>
                    <p
                        className="text-[clamp(0.8125rem,0.76rem+0.2vw,1rem)] leading-[100%] text-[#111111bf] font-bold mt-1"
                        dangerouslySetInnerHTML={{ __html: price }}
                    />
                </div>
                <div className="">
                    <Link href={`/product/${slug}`}>
                        <FormButton label={t('discover')} />
                    </Link>
                </div>
            </div>
        </div >
    );
}