import React from "react";
import ProductCard from "../Card/ProductCard";
import { getLocale, getTranslations } from "next-intl/server";
import default_image from "../../../public/assets/images/Team/Group-1-3.png.webp"
import { getCurrency, getLang, getSelectedCountry } from "@/app/actions/Woo-Coommerce/getWooCommerce";
import { getAuthenticatedUser } from "@/app/actions/WC/Auth/getAuth";



const getProduct = async (slug) => {
    const locale = await getLocale();
    const currency = await getCurrency();
    const user = await getAuthenticatedUser();
    // Priority: 1. User shipping/billing country, 2. Selected country from cookie, 3. Default
    const userCountry = user?.shipping?.country || user?.billing?.country;
    const selectedCountry = await getSelectedCountry();
    const shippingCountry = userCountry || selectedCountry || "";
    try {
        const res = await fetch(`${process.env.WP_BASE_URL}/wp-json/afs/v1/products?slug=${slug}&per_page=100&lang=${locale}&shipping_country=${shippingCountry}&currency=${currency}`, {
            cache: 'no-cache'
        });
        if (!res.ok) {
            throw new Error("Something went wrong");
        }
        const { data } = await res.json();
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export default async function BestSellers() {
    const localeValue = await getLang();
    const products = await Promise.all([
        // getProduct(localeValue === "en" ? "evo-foil-full-set" : "d-lite"),
        getProduct(localeValue === "en" ? "enduro-foil-full-set" : "foil-complet-enduro"),
        getProduct(localeValue === "en" ? "blackbird-mid-length" : "planche-blackbird"),
        getProduct("dock-star"),
        getProduct("stream"),
    ]);

    const t = await getTranslations("home");

    return (
        <section className="global-padding global-margin">
            <div className="max-w-[1920px] mx-auto">
                <h2 className="global-h2">
                    {t("featuredTitle")}
                </h2>

                {/* Adjust grid gaps and ensure proper alignment */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
                    {
                        products?.length > 0 && products.map((singleProduct, i) => {
                            const product = singleProduct[0];
                            const image = product?.featured_img;
                            const bestseller = product?.bestseller;
                            const hoverImage = product?.img;
                            return (
                                <ProductCard
                                    price={product?.price_html}
                                    // TTC depuis l'API WP (price_incl_tax)
                                    singlePrice={product?.price_incl_tax}
                                    // HT depuis l'API WP (price_excl_tax)
                                    priceExclTax={product?.price_excl_tax}
                                    type={product?.type || "simple"}
                                    name={product?.name}
                                    bestseller={bestseller}
                                    hoverImage={hoverImage}
                                    image={image || default_image}
                                    key={i}
                                    slug={product?.slug}
                                />
                            )
                        })
                    }
                </div>
            </div>
        </section>
    );
}
