import React from "react";
import ProductCard from "../Card/ProductCard";

const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET
const authHeader = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

const getBestSellers = async (slug) => {
    const url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products?slug=${slug}&_fields=id,name,acf,images,slug,categories,price,regular_price,sale_price,price_html,type`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`
            },
            next: { revalidate: 3600 },
        })
        const data = await response.json();
        return data[0];
    } catch (error) {
        // console.log(error);
        return [];
    }
}

export default async function BestSellers() {
    const products = await Promise.all([
        getBestSellers("foil-complet-evo"),
        getBestSellers("foil-complet-enduro"),
        getBestSellers("planche-blackbird"),
        getBestSellers("d-lite"),
    ]);


    return (
        <section className="global-padding global-margin">
            <div className="max-w-[1920px] mx-auto">
                <h2 className="global-h2">
                    Best Sellers
                </h2>

                {/* Adjust grid gaps and ensure proper alignment */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
                    {
                        products?.length > 0 && products.map((product) => {
                            const images = product?.images;
                            const bestseller = product?.acf?.bestseller;
                            const hoverImage = product?.acf?.img?.url;
                            const src = Array.isArray(images) && images.length > 0 ? images[0]?.src : null;
                            return (
                                <ProductCard price={product?.price_html} singlePrice={product?.price_with_tax} type={product?.type} name={product?.name} bestseller={bestseller} hoverImage={hoverImage} image={src || ""} key={product?.id} slug={product?.slug} />
                            )
                        }
                        )
                    }
                </div>
            </div>
        </section>
    );
}
