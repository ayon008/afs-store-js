import Link from "next/link";
import Image from "next/image";
import React from "react";

const categories = [
  {
    name: "WING FOIL",
    slug: "foiling/wing-foil",
    url: "https://afs-foiling.com/product-category/foiling/wing-foil/",
    image:
      "https://afs-foiling.com/wp-content/uploads/2023/04/Capture-decran-2025-06-05-a-16.07.13.png",
    alt_text: "wing foil",
  },
  {
    name: "DOWNWIND",
    slug: "foiling/downwind-foil",
    url: "https://afs-foiling.com/product-category/foiling/downwind-foil/",
    image: "https://afs-foiling.com/wp-content/uploads/2023/11/afs-pure-ha.png",
    alt_text: "downwind",
  },
  {
    name: "DOCKSTART",
    slug: "foiling/dockstart",
    url: "https://afs-foiling.com/product-category/foiling/dockstart/",
    image: "https://afs-foiling.com/wp-content/uploads/2025/05/enduro-GLT.jpg",
    alt_text: "dockstart",
  },
  {
    name: "SUP FOIL",
    slug: "foiling/sup-foil",
    url: "https://afs-foiling.com/product-category/foiling/sup-foil/",
    image:
      "https://afs-foiling.com/wp-content/uploads/2024/01/afs-downwind.jpeg",
    alt_text: "sup foil",
  },
  {
    name: "SURF FOIL",
    slug: "foiling/prone-foil",
    url: "https://afs-foiling.com/product-category/foiling/prone-foil/",
    image:
      "https://afs-foiling.com/wp-content/uploads/2025/06/surf-foil-scaled.jpg",
    alt_text: "surf foil",
  },
  {
    name: "WINDFOIL",
    slug: "windfoiling",
    url: "https://afs-foiling.com/product-category/foiling/windfoiling/",
    image:
      "https://afs-foiling.com/wp-content/uploads/2022/07/afs-windfoil.jpg",
    alt_text: "windfoil",
  },
  {
    name: "WINDSURF",
    slug: "windsurf-foil",
    url: "https://afs-foiling.com/product-category/windsurf-foil/",
    image:
      "https://afs-foiling.com/wp-content/uploads/2022/07/ahd-windsurf.jpg",
    alt_text: "windsurf",
  },
  {
    name: "SUP",
    slug: "stand-up-paddle",
    url: "https://afs-foiling.com/product-category/stand-up-paddle/",
    image: "https://afs-foiling.com/wp-content/uploads/2025/06/sup.jpg",
    alt_text: "sup",
  },
].map((c) => ({
  ...c,
  path: `/product-category/${c.slug}`,
}));

export default function CategorySection() {
  return (
    <section className="w-full">
      <div className="max-w-[1920px] mx-auto global-padding global-margin">
        {/* Title */}
        <h2 className="global-h2 mb-8">Shop by category</h2>

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
                  <p className="text-white font-bold tracking-tight text-[18px] sm:text-[20px] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
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
