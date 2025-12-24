"use client";

import { ArrowUpRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function More() {
  const t = useTranslations("home");
  return (
    <section className="global-padding global-margin max-w-[1920px] mx-auto">
      <h2 className="global-h2 mb-8">{t("more")}</h2>
      <div className="flex md:flex-row flex-col gap-5 items-stretch justify-between h-[800px] md:h-[clamp(30rem,15.406rem+17.094vw,32.5rem)] w-full">
        <div
          style={{
            backgroundImage: `url(${`https://afs-foiling.com/fr/wp-content/uploads/2025/06/1A4A82C8-D73A-4826-B627-E39C082F1173.jpg`})`,
          }}
          className="bg-cover bg-no-repeat bg-center w-full rounded-[4px] py-6 px-5 md:py-10 relative team-box group overflow-hidden h-1/2 md:h-full"
        >
          <h3 className="text-white text-[24px] lg:text-[36px] leading-[100%] font-bold relative w-fit transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-0.6rem] after:w-full after:h-[4px] after:bg-white after:origin-left after:scale-x-0 after:transition-all after:duration-300 after:ease-in-out group-hover:after:scale-x-100 group-hover:after:opacity-100 max-lg:after:scale-x-100 max-lg:after:opacity-100">
            {t("team")}
          </h3>

          <Link
            href="/afs-team"
            className="text-[14px] bg-white text-[#111] flex gap-1 rounded-sm items-center py-[12px] px-[16px] leading-[100%] font-semibold uppercase absolute left-1/2 -translate-x-1/2 opacity-100 bottom-[20px] lg:opacity-0 lg:bottom-0 lg:group-hover:opacity-100 lg:group-hover:bottom-10 lg:transition-all lg:duration-500 lg:ease-out"
          >
            {t("see-more")} <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>

        <div
          style={{
            backgroundImage: `url(${`https://afs-foiling.com/fr/wp-content/uploads/2025/06/MicrosoftTeams-.png`})`,
          }}
          className="bg-cover bg-no-repeat bg-center w-full rounded-[4px] py-6 px-5 md:py-10 relative team-box group overflow-hidden h-1/2 md:h-full"
        >
          <h3 className="text-[#111] text-[24px] lg:text-[36px] leading-[100%] font-bold relative w-fit transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-0.6rem] after:w-full after:h-[4px] after:bg-black after:origin-left after:scale-x-0 after:transition-all after:duration-300 after:ease-in-out group-hover:after:scale-x-100 group-hover:after:opacity-100 max-lg:after:scale-x-100 max-lg:after:opacity-100">
            {t("ambassadors")}
          </h3>

          <Link
            href="/afs-team"
            className="text-[14px] bg-white text-[#111] flex gap-1 rounded-sm items-center py-[12px] px-[16px] leading-[100%] font-semibold uppercase absolute left-1/2 -translate-x-1/2 opacity-100 bottom-[20px] lg:opacity-0 lg:bottom-0 lg:group-hover:opacity-100 lg:group-hover:bottom-10 lg:transition-all lg:duration-500 lg:ease-out"
          >
            {t("see-more")} <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}