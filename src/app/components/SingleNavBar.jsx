"use client";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import React, { useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

const STREAM_LANDING_SELECTOR = "#stream-landing";
const LANDING_SECTION_SELECTOR = "#product-landing-section";

const SingleNavBar = ({ setIsLanding, data, isLanding, introTl }) => {
  const t = useTranslations("singleProductNav");
  const title = data?.name;
  const acf = data?.acf;
  const caracteristiques = acf?.caracteristiques;
  const compatibilite = acf?.compatibilite;
  const programme = acf?.programme;
  const thumbnail_one = acf?.thumbnail_one;
  const [visible, setVisible] = useState(false);
  const lenis = useLenis();

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.to(".navbar", {
        position: "relative",
        duration: 0.5,
        ease: "power2.inOut",
      });
    });
    return () => ctx.revert();
  }, []);

  // Quand isLanding = false : "Learn More" quand #stream-landing est en vue, "Buy Now" quand la section landing entre en vue
  useGSAP(() => {
    if (isLanding) {
      setVisible(false);
      return;
    }
    const ctx = gsap.context(() => {
      const streamEl = document.querySelector(STREAM_LANDING_SELECTOR);
      const landingEl = document.querySelector(LANDING_SECTION_SELECTOR);
      if (isLanding) return;
      ScrollTrigger.create({
        trigger: LANDING_SECTION_SELECTOR,
        start: "top top",
        end: "bottom top",
        onEnter: () => setVisible(true),
        onLeaveBack: () => setVisible(false),
        scrub: true,
        markers: true,
      });
    });
    return () => ctx.revert();
  }, [isLanding]);

  return (
    <div className="bg-black backdrop-blur-sm sticky top-0 z-30">
      <div className="global-padding flex items-center justify-between py-[10px] gap-3 items-center">
        <h2 className="lg:text-[28px] text-4 leading-[100%] font-bold text-white ">
          {title}
        </h2>
        <div className="flex items-center gap-4 min-w-[110px] justify-end">
          {!!acf && !!thumbnail_one && (
            <button
              onClick={() => {
                setIsLanding(false);
                // Wait for the element to be visible after setIsLanding(false)
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    const el = document.querySelector("#reviews");
                    if (el) {
                      if (lenis) {
                        lenis.scrollTo(el, { offset: 0, duration: 1.5 });
                      } else {
                        el.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  });
                });
              }}
              className="text-white md:block hidden"
            >
              {t("Reviews")}
            </button>
          )}

          {!!caracteristiques && (
            <button
              onClick={() => {
                setIsLanding(false);
                // Wait for the element to be visible after setIsLanding(false)
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    const el = document.querySelector("#characteristics");
                    if (el) {
                      if (lenis) {
                        lenis.scrollTo(el, { offset: 0, duration: 1.5 });
                      } else {
                        el.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  });
                });
              }}
              className="text-white md:block hidden"
            >
              {t("Characteristics")}
            </button>
          )}
          <button
            onClick={() => {
              if (!visible && !isLanding) {
                setIsLanding(true);
              } else {
                setIsLanding(false);
              }

              // reset scroll instantly using Lenis if available, otherwise fallback to window.scrollTo
              if (lenis) {
                lenis.scrollTo(0, { immediate: true });
              } else {
                const html = document.documentElement;
                const prev = html.style.scrollBehavior;
                html.style.scrollBehavior = "auto";
                window.scrollTo(0, 0);
                html.style.scrollBehavior = prev;
              }

              // 🔥 PLAY INTRO ANIMATION
              introTl?.current?.restart();
            }}
            className="text-white bg-[#1D98FF] uppercase lg:p-3 p-2 md:text-sm text-[12px] flex items-center gap-1 font-bold rounded-sm cursor-pointer"
          >
            {!visible && !isLanding ? t("btn") : t("btn_i")}
            <ArrowUpRight strokeWidth={3} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleNavBar;
