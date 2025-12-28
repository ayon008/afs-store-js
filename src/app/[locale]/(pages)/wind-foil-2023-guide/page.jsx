"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { alliance } from "@/fonts/Alliance";

/* ---------------- Breadcrumbs ---------------- */

const BreadCums = () => {
  const t = useTranslations("breadcum");
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999]">
        <Link href="/" className="inline">
          {t("home")}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-black">{t("Wind Foil 2023 Guide")}</span>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function Wind() {
  const articleRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tocOpen, setTocOpen] = useState(false);

  const t = useTranslations("wind-foil-2023-guide");

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

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div
        className="global-margin"
        style={{
          backgroundImage:
            "url('https://afs-foiling.com/wp-content/uploads/2024/09/AFS_Wind_Aile_S.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col gap-[20px] justify-between global-padding pt-5 pb-20 min-h-[calc(100vh-120px)] max-w-[1920px] mx-auto">
          <BreadCums />

          <div className="flex gap-[20px] justify-between flex-wrap flex-col md:flex-row">
            <h1 className="global-h1 text-white flex-1">{t("Windfoil")}</h1>
            <p className="text-white font-semibold">
              #Windfoil
              <br />
              {t("date")} <br />
              Antonin
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="flex gap-30 global-padding mx-auto max-w-[1920px] items-start flex-col sm:flex-row global-margin">
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
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%]">
              {t.rich("if-you", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}{" "}
              <a
                href="https://staging.afs-foiling.com/categorie-produit/foiling/windfoil/"
                className="text-[#1D98FF]"
              >
                Windfoil
              </a>{" "}
              {t("is-a")}{" "}
            </p>

            <Image
              src="https://afs-foiling.com/wp-content/uploads/2021/03/nahskwell-fluid-stand-up-paddle-cruising.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("what's-in")}</h2>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("firstly")}
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("secondly")}
            </p>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("how")}</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("depending")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("if-you'r")}
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("for-intermediate")}
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("for-sup")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("what-size")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("generally-speaking")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("the-length")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("gthe")}
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("the-width")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("it-provides")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("thickness")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("thickness_sub")}
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold"></h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("nose_sub")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("shape_h")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("shape_sub")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("choice_according")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("choice_according_sub")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("paddles_h")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("paddles_sub")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("allround_paddles_h")}
            </h3>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/nahskwell-fluid.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("allround_paddles_sub")}
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("touring_paddles")}
            </h3>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/nahskwell-fit-stand-up-paddle-cruising.jpeg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("touring_paddles_sub")}
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("paddles_race")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("paddles_race_sub")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("paddles_for_surfing")}
            </h3>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2023/02/nahskwell-sup-min-min.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("paddles_for_surfing_sub")}
            </p>
            <div className="compatibilite">
              <table className={`${alliance.className}`}>
                <tbody>
                  <tr>
                    <th>{t("table_1_practical_walk")}</th>
                    <th>~ 50-60 KG</th>
                    <th>~ 70-80 KG</th>
                    <th>+ 90 KG</th>
                  </tr>
                  <tr>
                    <th>All round</th>
                    <td>
                      {t("length")} 30′ {t("to")} 31′ – {t("width")} 10′{" "}
                      {t("to")} 11’6 “
                    </td>
                    <td>
                      {t("length")} 31′ {t("to")} 32′ – {t("width")} 10′{" "}
                      {t("to")} 11’6 ”
                    </td>
                    <td>
                      {t("length")} 32-36′ – {t("width")} 10’5 “ {t("to")} 11’6
                      ”
                    </td>
                  </tr>
                  <tr>
                    <th>{t("touring_exploring")}</th>
                    <td>
                      {t("length")} 11’6 “ {t("to")} 12’6 ” – {t("width")} 28′{" "}
                      {t("to")} 30′
                    </td>
                    <td>
                      {t("length")} 12’6 “ {t("to")} 14′ – {t("width")} 29′{" "}
                      {t("to")} 32′
                    </td>
                    <td>
                      {t("length")} 12’6 ” {t("to")} 14′ – {t("width")} 32′{" "}
                      {t("to")} 34′
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="compatibilite">
              <table>
                <tbody>
                  <tr>
                    <th>{t("tabel_2_wave_practice")}</th>
                    <th>~ 50-60 KG</th>
                    <th>~ 70-80 KG</th>
                    <th>+ 90 KG</th>
                  </tr>
                  <tr>
                    <th>{t("beginner")}</th>
                    <td>
                      {t("length")} 8’5“ {t("to")} 9′ {t("width")} 30” {t("to")}{" "}
                      31″
                    </td>
                    <td>
                      {t("length")} 9′ {t("to")} 10′ {t("width")} 31″ {t("to")}{" "}
                      33″
                    </td>
                    <td>
                      {t("length")} 10′ {t("to")} 11′ {t("width")} 32″ {t("to")}{" "}
                      36″
                    </td>
                  </tr>
                  <tr>
                    <th>{t("intermediate")}</th>
                    <td>
                      {t("same_size")} – {t("minimum_volume")} ={" "}
                      {t("your_weight")} + 35 {t("to")} 40 L
                    </td>
                    <td>
                      {t("same_size")} – {t("minimum_volume")} ={" "}
                      {t("your_weight")} + 35 {t("to")} 40 L
                    </td>
                    <td>
                      {t("same_size")} – {t("minimum_volume")} ={" "}
                      {t("your_weight")} + 35 {t("to")} 40 L
                    </td>
                  </tr>
                  <tr>
                    <th>{t("expert")}</th>
                    <td>
                      {t("width")} 25“ {t("to")} 28” Volume ={" "}
                      {t("your_weight_at_your_weight")} + 30 L
                    </td>
                    <td>
                      {t("width")} 26“ {t("to")} 29” Volume ={" "}
                      {t("your_weight_at_your_weight")} + 30 L
                    </td>
                    <td>
                      {t("width")} 28“ {t("to")} 32” Volume = {t("your_weight")}{" "}
                      + 30 L
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="text-[28px] text-[#111111] font-bold mt-5">
              {t("discipline_p")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("discipline_p")}{" "}
              <Link
                href="https://afs-foiling.com/fr/categorie-produit/foiling/sup-foil-foiling/"
                className="text-[#1d98ff] underline"
              >
                {t("guide_specifically")}
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("essential_h")}</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("leash_h")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("lesh_p")}
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              {t("paddle")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]"> {t("in_downwind_p_s")} </strong>{" "}
              {t("in_downwind_p")}
            </p>
            <Link
              class="py-[10px] px-[14px] bg-[#1d98ff] text-white font-bold text-4 w-fit rounded-sm mx-auto mt-4"
              href="https://afs-foiling.com/fr/categorie-produit/stand-up-paddle/"
            >
              {t("discover_our_stand_up_paddles")}
            </Link>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("buying_an_inflatable")}</h2>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("the_advantages_p")}
            </p>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">{t("paddle_spots")}</h2>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("the_french_spots_p")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">Stroll</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("when_it_comes")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">Breed</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("a_wide_range_p")}
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">Supsurf</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("all_the_surf_p")}
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("less_common")}
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("We_told_you")}
            </p>
          </div>
        </article>
      </div>
    </>
  );
}