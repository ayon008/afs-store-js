"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

/* ======================================================
   HERO SECTION (UNCHANGED)
====================================================== */

// YouTube video ID
const YOUTUBE_VIDEO_ID = "So9EJiIJ6eQ";


// Full embed URL
const YOUTUBE_EMBED_URL =
  `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?` +
  `autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}` +
  `&controls=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1` +
  `&start=3&end=20`;

export default function Page() {
  const [loading, setLoading] = useState(true);

  const t = useTranslations("advance");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <div className="relative w-full h-[100vh] overflow-hidden bg-[#0a0a0a] shadow-xl">
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 scale-[1.25]"
            src={YOUTUBE_EMBED_URL}
            frameBorder="0"
            allow="autoplay; encrypted-media; fullscreen"
            title="Background Video"
            style={{
              pointerEvents: "none",
              opacity: loading ? 0 : 1,
              transition: "opacity 1.5s ease-in-out",
            }}
          />
        </div>

        {loading && (
          <div className="absolute inset-0 bg-[#101010] flex items-center justify-center" />
        )}

        <div className="absolute inset-0 bg-black opacity-30" />

        <div className="absolute inset-0 flex items-center justify-center">
          <h1
            className="text-center uppercase tracking-wider"
            style={{
              fontFamily: '"Alliance No.2", sans-serif',
              fontSize: "60px",
              fontWeight: 100,
              lineHeight: "60px",
              color: "#fff",
            }}
          >
            {t("pageTitle")}
          </h1>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div
        className="text-white font-['Inter',_sans-serif] overflow-hidden"
        style={{ backgroundColor: "#1c1c1c" }}
      >
        <div className="max-w-6xl mx-auto text-center pt-24 mb-16 px-4">
          <h1
            className="text-[40px] md:text-[50px] font-semibold leading-[48px] md:leading-[55px]"
            style={{ fontFamily: '"Alliance No.2", sans-serif' }}
          >
            <span className="font-light">
              AFS Advanced is our way of concentrating our
            </span>{" "}
            <b>know-how</b> <span className="font-light">and</span>{" "}
            <b>expertise</b>{" "}
            <span className="font-light">
              into the most advanced designs, which is the essence and the
            </span>{" "}
            <b className="underline">future of AFS.</b>
          </h1>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 px-4 md:px-8">
          <img
            src="https://afs-foiling.com/wp-content/uploads/2022/09/CleanShot-2022-09-14-at-11.51.22.jpg"
            className="w-full object-cover shadow-xl"
            alt=""
          />
          <img
            src="https://afs-foiling.com/wp-content/uploads/2022/09/CleanShot-2022-09-14-at-09.56.24.jpg"
            className="w-full object-cover shadow-xl"
            alt=""
          />
        </div>

        <div className="w-full pb-20">
          <img
            src="https://afs-foiling.com/wp-content/uploads/2022/09/Group-16.png"
            className="w-full object-cover"
            alt=""
          />
        </div>
      </div>

      {/* ======================================================
         MISSION SECTION
      ====================================================== */}
      <MissionSection />

      {/* ======================================================
         AFS CARE SECTION
      ====================================================== */}
      <AFSCareSection />
    </>
  );
}

/* ======================================================
   MISSION SECTION COMPONENT
====================================================== */

const pillars = [
  { title: "Development", description: "Develop products of excellence." },
  {
    title: "Expertise",
    description: "Provide advanced expertise at the highest level.",
  },
  { title: "Innovation", description: "Innovation at the service of passion." },
  {
    title: "Experience",
    description: "Offer an exceptional customer experience.",
  },
];

const MissionPillar = ({ title, description }) => (
  <div className="mb-12 md:mb-16">
    <h3
      style={{
        fontFamily: '"Alliance No.2", sans-serif',
        fontSize: "32px",
        fontWeight: 600,
        lineHeight: "36px",
        color: "#fff",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        fontFamily: '"Alliance No.2", sans-serif',
        fontSize: "18px",
        fontWeight: 300,
        lineHeight: "28px",
        color: "rgba(255,255,255,0.75)",
      }}
    >
      {description}
    </p>
  </div>
);

function MissionSection() {
  const t = useTranslations("advance");
  return (
    <section
      className="min-h-screen py-20"
      style={{ backgroundColor: "#1c1c1c" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <header className="flex flex-col md:flex-row justify-between mb-16">
          <h1
            style={{
              fontFamily: '"Alliance No.2", sans-serif',
              fontSize: "80px",
              fontWeight: 400,
              lineHeight: "80px",
              color: "#fff",
            }}
          >
            {t("mission")}
          </h1>
          <p className="max-w-xs text-right text-white">
            Our mission at AFS Advanced is based on 4 pillars.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-20">
          <img
            src="https://afs-foiling.com/wp-content/uploads/2022/09/CleanShot-2022-09-27-at-11.03.18@2x-768x820.jpg"
            className="w-full object-cover shadow-2xl"
            alt=""
          />
          <div>
            {pillars.map((pillar, i) => (
              <MissionPillar key={i} {...pillar} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   AFS CARE SECTION
====================================================== */

function AFSCareSection() {
  return (
    <section
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `
          linear-gradient(rgba(28,28,28,0.8), rgba(28,28,28,0.8)),
          url("https://afs-foiling.com/wp-content/uploads/2022/09/CleanShot-2022-09-20-at-10.12.03@2x.png")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="text-center space-y-6">
        <img
          src="https://afs-foiling.com/wp-content/uploads/2022/09/logo-afs-advance-300x121.png"
          className="mx-auto w-[240px]"
          alt=""
        />
        <p className="text-white font-medium">3 years warranty</p>
        <p className="text-white">Extensive live consulting service</p>
        <p className="text-white">
          Getting started session with development team
        </p>
      </div>
    </section>
  );
}
