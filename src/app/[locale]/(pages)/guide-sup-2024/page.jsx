"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/* ---------------- Breadcrumbs ---------------- */

const BreadCums = () => {
  const t = useTranslations("breadcum")
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999]">
        <Link href="/" className="inline">
          {t("home")}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-black">{t("guide-sup")}</span>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function Sup() {
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

  const t = useTranslations("guide")

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div
        className="global-margin"
        style={{
          backgroundImage:
            "url('https://afs-foiling.com/wp-content/uploads/2022/12/nahskwell-sup.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col gap-[20px] justify-between global-padding pt-5 pb-20 min-h-[calc(100vh-120px)] max-w-[1920px] mx-auto">
          <BreadCums />

          <div className="flex gap-[20px] justify-between flex-wrap flex-col md:flex-row">
            <h1 className="global-h1 text-white flex-1">{t("headline")}</h1>
            <p className="text-white font-semibold">#supFoil</p>
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
            {t("table")}
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
              {t("body-1")}
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
            {t.rich("body-2", {
              h2: (children) => <h2 className="global-h2 mb-5">{children}</h2>,
              p: (children) => (
                <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
                  {children}
                </p>
              )
            })}          </div>

          <div className="flex flex-col gap-[14.4px]">
            {t.rich("body-3", {
              h2: (children) => <h2 className="global-h2 mb-5">{children}</h2>,
              h3: (children) => <h3 className="text-[28px] text-[#111111] font-bold">{children}</h3>,
              p: (children) => (
                <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
                  {children}
                </p>
              )
            })}
            {t.rich("body-4", {
              h3: (children) => <h3 className="text-[28px] text-[#111111] font-bold">{children}</h3>,
              p: (children) => (
                <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
                  {children}
                </p>
              )
            })}

            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/nahskwell-fluid.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            {t.rich("body-5", {
              h3: (children) => <h3 className="text-[28px] text-[#111111] font-bold">{children}</h3>,
              p: (children) => (
                <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
                  {children}
                </p>
              )
            })}
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/nahskwell-fit-stand-up-paddle-cruising.jpeg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            {t.rich("body-6", {
              h3: (children) => <h3 className="text-[28px] text-[#111111] font-bold">{children}</h3>,
              p: (children) => (
                <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
                  {children}
                </p>
              )
            })}
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2023/02/nahskwell-sup-min-min.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("p")}
            </p>
            <div className="compatibilite">
              <table>
                <tbody>
                  {t.rich("table-24", {
                    tr: (children) => <tr>{children}</tr>,
                    th: (children) => <th>{children}</th>,
                    td: (children) => <td>{children}</td>
                  })}
                </tbody>
              </table>
            </div>
            <div className="compatibilite">
              <table>
                <tbody>
                  {t.rich("table-2", {
                    tr: (children) => <tr>{children}</tr>,
                    th: (children) => <th>{children}</th>,
                    td: (children) => <td>{children}</td>
                  })}
                </tbody>
              </table>
            </div>
            <h3 className="text-[28px] text-[#111111] font-bold mt-5">
              {t("table-footer")}
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              {t("p-1")}{" "}
              <Link
                href="https://afs-foiling.com/fr/categorie-produit/foiling/sup-foil-foiling/"
                className="text-[#1d98ff] underline"
              >
                {t("p-2")}
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col gap-[14.4px]">
            {t.rich("p-5", {
              h2: (children) => <h2 className="global-h2 mb-5">{children}</h2>,
              h3: (children) => <h3 className="text-[28px] text-[#111111] font-bold">{children}</h3>,
              p: (children) => (
                <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
                  {children}
                </p>
              ),
              strong: (children) => <strong className="text-[#111]">{children}</strong>
            })}
            <Link
              class="py-[10px] px-[14px] bg-[#1d98ff] text-white font-bold text-4 w-fit rounded-sm mx-auto mt-4"
              href="https://afs-foiling.com/fr/categorie-produit/stand-up-paddle/"
            >
              {t("p-8")}
            </Link>
          </div>

          {t.rich("p-9", {
            div: (children, { key, props }) => <div className="flex flex-col gap-[14.4px]">{children}</div>,
            h2: (children) => <h2 className="global-h2 mb-5">{children}</h2>,
            h3: (children) => <h3 className="text-[28px] text-[#111111] font-bold">{children}</h3>,
            p: (children) => (
              <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
                {children}
              </p>
            )
          })}
        </article>
      </div>
    </>
  );
}
