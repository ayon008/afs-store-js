"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
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
        <span className="text-black">Downwind guide</span>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function Clinique() {
  const articleRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tocOpen, setTocOpen] = useState(false);

  /* -------- Generate IDs & collect H2 -------- */
  useEffect(() => {
    if (!articleRef.current) return;

    const h2Elements = Array.from(articleRef.current.querySelectorAll("h2"));

    const items = h2Elements.map((h2, index) => {
      const id =
        h2.id ||
        `${h2.textContent
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")}-${index}`;
      h2.id = id;
      h2.style.scrollMarginTop = "160px";
      return { id, title: h2.textContent || "" };
    });

    setHeadings(items);

    if (items.length > 0) {
      setActiveId(items[0].id); // First item active by default
    }
  }, []);

  /* -------- Active section observer -------- */
  useEffect(() => {
    if (!headings.length) return;

    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      let currentId = null;

      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const elTop = el.getBoundingClientRect().bottom;

          // Activate when top of h2 enters the viewport (bottom to top)
          if (elTop <= viewportHeight) {
            currentId = headings[i].id;
          }
        }
      }

      if (currentId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize on load

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  /* -------- Scroll handler -------- */
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTocOpen(false);
  };
  const t = useTranslations("guide-downwind-2025");
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div
        className="global-margin"
        style={{
          backgroundImage:
            "url('https://afs-foiling.com/fr/wp-content/uploads/2024/02/bg_image-4.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col gap-[20px] justify-between global-padding pt-5 pb-20 min-h-[calc(100vh-120px)] max-w-[1920px] mx-auto">
          <BreadCums />

          <div className="flex gap-[20px] justify-between flex-wrap flex-col md:flex-row">
            <h1 className="global-h1 text-white flex-1">{t("title")}</h1>
            <p className="text-white font-semibold">#DOWNWIND</p>
          </div>
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="flex gap-10 global-padding mx-auto max-w-[1920px] items-start flex-col sm:flex-row global-margin">
        {/* -------- TOC -------- */}
        <aside className="w-full md:w-[260px] md:sticky md:top-[160px] font-bold uppercase leading-[120%]">
          <button
            className="md:hidden w-full border-b py-3 flex justify-between text-[18px]"
            onClick={() => setTocOpen((prev) => !prev)}
          >
            Table of contents
            <span>{tocOpen ? "−" : "+"}</span>
          </button>

          <div
            className={`${tocOpen ? "block" : "hidden"
              } md:block mt-4 space-y-[18px] md:space-y-[28px]`}
          >
            {headings.map((item) => {
              const isActive = activeId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`cursor-pointer transition-colors`}
                >
                  <span
                    className={`flex items-start gap-2 ${isActive ? "text-black" : "text-gray-400 hover:text-black"
                      }`}
                  >
                    {isActive && (
                      <ArrowRight width={24} height={15} stroke-width={3} />
                    )}
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* -------- ARTICLE -------- */}
        <article
          ref={articleRef}
          className="flex-1 max-w-[790px] flex flex-col gap-[40px]"
        >
          <div className="flex flex-col gap-[14.4px]">
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] font-bold leading-[120%]">
              {t("Downwind")}
            </p>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("Downwind sailing")}
            </p>
          </div>

          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/uPGeGuHwB6M"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("What are")}</h2>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">{t("For downwind Stand")}</strong>{" "}
              {t("The latter should")}
            </p>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("What")}</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("The board")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">{t("In SUP")}</strong>{" "}
              {t("Generally")}
            </p>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2024/02/image-21.png"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("The foil")} foil
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">{t("If you")}</strong>{" "}
              {t("And avoid")}
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("For beginners")}
            </p>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2024/02/image-22.png"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm"
            />
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2024/02/image-23.png"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("For the foil")}
            </p>
          </div>
          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/LSqvVW_HlOQ?si=qpjHdorKh7QrCaIa"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("Basic SUP")}</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("Rowing technique")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">{t("Efficient take-off")}</strong>{" "}
              {t("This gives")}
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("Choosing the")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">{t("In downwind")}</strong>{" "}
              {t("Its a")}
            </p>
          </div>

          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/FPYktXAqdUI?si=1EXBMh_ZdV96uFhZ"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("Downwind safety tips")}</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Rowing technique
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">{t("Safety")}</strong>{" "}
              {t("Every rider")}
            </p>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF] mb-5">
              {t("Safety equipment")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  {t("The foil")} VHF
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  {t("Its a marine")}
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  {t("The foil")} Sécumar belt
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  {t("This belt")}
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  Fluorescent Lycra
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  {t("It makes")}
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  {t("The foil")} impact vest
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  {t("It protects")}
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  {t("The foil")} helmet
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  {t("Its undeniable")}
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  {t("Water")}
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  {t("Because")}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/bb1Xt7hJPz0?si=8tv6DfnHPtTZ25P0"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("Turn your")}</h2>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">{t("To make")}</strong>{" "}
              {t("And its clear")}
            </p>
          </div>
        </article>
      </div>
    </>
  );
}