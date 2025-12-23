"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

/* ---------------- Breadcrumbs ---------------- */

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999]">
        <Link href="/" className="inline">
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-black">Equipment recovery</span>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function equipment() {
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
                We’ll take back your old AFS foil if you buy a new AFS foil!
              </p>
            </div>
          </div>
        </div>

        {/* Second Section - Scrolls above */}
        <div className="relative z-[20] global-padding bg-black pt-[40px]">
          <div className="flex flex-col gap-[40px] mx-auto max-w-[1920px]">
            <h2 className="global-h2 text-[#fff] pb-[20px] global-b-bottom-d">
              Here's how it works
            </h2>
            <div className="flex gap-[40px] flex-col md:flex-row">
              {/* Stage 01 */}
              <div className="flex-[1_0_0] flex flex-col gap-5">
                <h3 className="text-[22px] font-bold text-white leading-[1] uppercase">
                  Stage 01
                </h3>
                <div className="flex flex-col gap-10 max-w-[400px]">
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    Register your equipment – complete foil, front wing,
                    stabilizer or TBAR – online.
                  </p>
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    Using the same link, you indicate the material you wish to
                    purchase.
                  </p>
                </div>
                <a
                  href="https://tally.so/r/n9qZQQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline text-blue font-bold uppercase"
                >
                  Register equipment
                  <ArrowUpRight className="w-5 h-5 text-[#1D98FF]" />
                </a>
                <p className="flex flex-col gap-5 text-[#999] font-semibold text-[16px] leading-[1.3] max-w-[400px]">
                  You will receive the estimated cost of restoration within 24
                  hours.
                </p>
              </div>

              {/* Stage 02 */}
              <div className="flex-[1_0_0] flex flex-col gap-5">
                <h3 className="text-[22px] font-bold text-white leading-[1] uppercase">
                  Stage 02
                </h3>
                <div className="flex flex-col gap-5 max-w-[400px]">
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    After validating the trade-in offer, I drop off my equipment
                    at the post office for delivery to :
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
                  Stage 03
                </h3>
                <div className="flex flex-col gap-10 max-w-[400px]">
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    Once acceptance has been confirmed, the new equipment is
                    dispatched.
                  </p>
                  <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3]">
                    Using the same link, you indicate the material you wish to
                    purchase.
                  </p>
                </div>
                <p className="flex flex-col gap-5 text-white font-bold text-[18px] leading-[1.3] uppercase">
                  All you have to do is ride!
                </p>

                <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3] max-w-[400px]">
                  We’ll help you assess the condition of your equipment so you
                  can trade it in today.
                </p>

                <a
                  href="https://tally.so/r/n9qZQQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline text-blue font-bold uppercase"
                >
                  Have a trade-in estimate
                  <ArrowUpRight className="w-5 h-5 text-[#1D98FF]" />
                </a>
              </div>
            </div>

            <p className="flex flex-col gap-5 text-[#999] font-semibold text-[18px] leading-[1.3] max-w-[680px] uppercase">
              ATTENTION: rework is done piece by piece: it is not possible to
              rework a wing against a foil, for example. It will be a foil for a
              foil, a fuselage for a fuselage…
            </p>
            {/* banner */}
            <div className="bg-[#f0f0f0] flex flex-col md:flex-row gap-5 items-center global-margin">
              <div className="space-y-5 lg:py-5 lg:pl-5 lg:pr-5 p-5">
                <p className="text-[12px] text-[#666666] uppercase font-semibold">
                  AFS product specialists – Antonin & Elouann{" "}
                </p>
                <h2 className="text-[clamp(1.25rem,1.1346rem+0.5128vw,1.75rem)] font-bold mb-[28px] rounded-sm">
                  Our passionate experts are here to answer all your trade-in
                  and equipment valuation questions!
                </h2>

                <a
                  href="https://tally.so/r/n9qZQQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline text-[#404040] font-bold uppercase"
                >
                  Have a trade-in estimate
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
