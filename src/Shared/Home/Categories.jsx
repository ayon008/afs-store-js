import Image from "next/image";
import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTranslatedCategoryRoute } from "@/lib/product-routes";
import { getParentCategory } from "@/app/actions/WC/getParentCategory";

// Helper function to get category name from WordPress
async function getCategoryName(slug, locale) {
  try {
    // Extract the last slug part for hierarchical categories
    const slugParts = slug.split('/');
    const lastSlug = slugParts[slugParts.length - 1];
    
    const category = await getParentCategory(lastSlug);
    return category?.name || slug.toUpperCase().replace(/-/g, ' ');
  } catch (error) {
    console.error(`Error fetching category name for ${slug}:`, error);
    // Fallback to slug-based name
    return slug.split('/').pop().toUpperCase().replace(/-/g, ' ');
  }
}

export default async function CategorySection() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  const categoriesData = [
    {
      slug: "foiling/wing-foil",
      image:
        `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2023/04/Capture-decran-2025-06-05-a-16.07.13.png`,
      alt_text: "wing foil",
    },
    {
      slug: "foiling/downwind-foil",
      image: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2023/11/afs-pure-ha.png`,
      alt_text: "downwind",
    },
    {
      slug: "foiling/prone-foil",
      image:
        `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/06/surf-foil-scaled.jpg`,
      alt_text: "surf foil",
    },
    {
      slug: "foiling/sup-foil-foiling",
      image:
        `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/01/afs-downwind.jpeg`,
      alt_text: "sup foil",
    },
    {
      slug: "foiling/dockstart",
      image: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/05/enduro-GLT.jpg`,
      alt_text: "dockstart",
    },
    {
      slug: "foiling/parawing",
      image:
        `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/07/parawing.jpg`,
      alt_text: "windsurf",
    },
    {
      slug: "foiling/wakefoil",
      image:
        `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/07/wake-foil-cat.jpg`,
      alt_text: "windfoil",
    },
    {
      slug: "stand-up-paddle",
      image: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/06/sup.jpg`,
      alt_text: "sup",
    },
  ];

  // Generate translated routes and names for all categories
  const categories = await Promise.all(
    categoriesData.map(async (c) => {
      const [translatedPath, translatedName] = await Promise.all([
        getTranslatedCategoryRoute(c.slug, locale, locale),
        getCategoryName(c.slug, locale),
      ]);
      return {
        ...c,
        name: translatedName,
        path: translatedPath,
      };
    })
  );


  return (
    <section className="w-full">
      <div className="max-w-[1920px] mx-auto global-padding global-margin">
        {/* Title */}
        <h2 className="global-h2 mb-8">{t("category")}</h2>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 gap-3 justify-center">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.path}
              className="relative group block overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              aria-label={`View ${cat.name} category`}
            >
              <div
                className="relative w-full"
                style={{
                  paddingTop: "130%", // reduced height for mobile & tablet
                }}
              >
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.alt_text || cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="absolute inset-0 w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-700 ease-in-out"
                  />
                )}

                <div className="absolute lg:bottom-8 lg:left-[20px] bottom-3 left-3 z-10">
                  <p className="text-white font-bold tracking-tight text-[18px] uppercase sm:text-[20px] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                    {cat.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
