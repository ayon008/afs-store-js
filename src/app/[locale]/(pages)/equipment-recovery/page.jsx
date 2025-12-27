"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/* ---------------- Breadcrumbs ---------------- */

const BreadCums = () => {
  const b = useTranslations("breadcum");

  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999]">
        <Link href="/" className="inline">
          {b("home")}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-black">Equipment recovery</span>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function equipment() {
  const t = useTranslations("equipment");

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div className=" bg-black relative">
        {/* First Section - Sticky */}
        <div
          className="sticky top-[78px] lg:top-[142px] z-[10]"
          style={{
            backgroundImage:
              "url('https://afs-foiling.com/wp-content/uploads/2023/08/zyro-image-1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col global-padding pt-5 pb-20 min-h-[600px] lg:min-h-[calc(100vh-140px)] mx-auto max-w-[1920px]">
            <BreadCums />

            {/* Centered content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-[20px] z-[1]">
              <h1 className="global-h1 text-white">Equipment recovery</h1>
              <p className="text-white font-semibold text-[22px] max-w-[520px]">
                {t("sub")}
              </p>
            </div>
          </div>
        </div>

        {/* Second Section - Scrolls above */}
        <div className="relative z-[20] global-padding bg-black pt-[40px]">
          <div className="flex flex-col gap-[40px] mx-auto max-w-[1920px]">
            <h2 className="global-h2 text-[#fff] pb-[20px] global-b-bottom-d">
              {t("Heres")}
            </h2>
            <div className="flex gap-[40px] flex-col md:flex-row">
              {/* Stage 01 */}
              <div className="flex-[1_0_0] flex flex-col gap-5">
                <h3 className="text-[22px] font-bold text-white leading-[1] uppercase">
                  {t("Stage")} 01
                </h3>
                <div className="flex flex-col gap-10 max-w-[400px]">
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    {t("UsRegistering")}
                  </p>
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    {t("Using")}
                  </p>
                </div>
                <a
                  href="https://tally.so/r/n9qZQQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline text-blue font-bold uppercase"
                >
                  {t("Register equipment")}
                  <ArrowUpRight className="w-5 h-5 text-[#1D98FF]" />
                </a>
                <p className="flex flex-col gap-5 text-[#999] font-semibold text-[16px] leading-[1.3] max-w-[400px]">
                  {t("You will")}
                </p>
              </div>

              {/* Stage 02 */}
              <div className="flex-[1_0_0] flex flex-col gap-5">
                <h3 className="text-[22px] font-bold text-white leading-[1] uppercase">
                  {t("Stage")} 02
                </h3>
                <div className="flex flex-col gap-5 max-w-[400px]">
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    {t("After")}
                  </p>
                  <p className="flex flex-col gap-5 text-white font-bold text-[18px] leading-[1.3] uppercase">
                    FOIL AND CO Espace Joseph Rolland MODULE 3 - ZA DE,
                    Gorréquer, 29800 PENCRAN
                  </p>
                </div>
              </div>

              {/* Stage 03 */}
              <div className="flex-[1_0_0] flex flex-col gap-5">
                <h3 className="text-[22px] font-bold text-white leading-[1] uppercase">
                  {t("Stage")} 03
                </h3>
                <div className="flex flex-col gap-10 max-w-[400px]">
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    {t("Once")}
                  </p>
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    {t("Using the")}
                  </p>
                </div>
                <p className="flex flex-col gap-5 text-white font-bold text-[18px] leading-[1.3] uppercase">
                  {t("All you")}
                </p>

                <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3] max-w-[400px]">
                  {t("Well")}
                </p>

                <a
                  href="https://tally.so/r/n9qZQQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline text-blue font-bold uppercase"
                >
                  {t("Have")}
                  <ArrowUpRight className="w-5 h-5 text-[#1D98FF]" />
                </a>
              </div>
            </div>

            <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3] max-w-[680px] uppercase">
              {t("ATTENTION")}
            </p>
            {/* banner */}
            <div className="bg-[#f0f0f0] flex flex-col md:flex-row gap-5 items-center global-margin">
              <div className="space-y-5 lg:py-5 lg:pl-5 lg:pr-5 p-5">
                <p className="text-[12px] text-[#666666] uppercase font-semibold">
                  {t("AFS")}
                </p>
                <h2 className="text-[clamp(1.25rem,1.1346rem+0.5128vw,1.75rem)] font-bold mb-[28px] rounded-sm">
                  {t("Our")}
                </h2>

                <a
                  href="https://tally.so/r/n9qZQQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline text-[#404040] font-bold uppercase"
                >
                  {t("Have a")}
                  <ArrowUpRight className="w-5 h-5 text-[#404040]" />
                </a>
              </div>
              <Image
                src="https://afs-foiling.com/wp-content/uploads/2023/08/Group-2-2.png"
                width={800}
                height={600}
                className="max-w-[420px] hidden md:block"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}