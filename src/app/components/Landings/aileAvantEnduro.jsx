"use client";

import { useRef } from "react";
import gsap from "gsap";
import SmoothScroll from "@/app/components/SmoothScroll";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import CSSRulePlugin from "gsap/CSSRulePlugin";
import { useTranslations } from "next-intl";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CSSRulePlugin);

const aileAvantEnduro = () => {
  //define i18n
  const t = useTranslations("Enduro");
  const container = useRef(null);

  /* ----------------------------------------
   Handle image load
---------------------------------------- */
  const handleImageLoad = () => {
    // Invalidate ScrollTriggers to recalculate positions after image load
    ScrollTrigger.refresh();
  };

  /* ----------------------------------------
   GSAP animations
---------------------------------------- */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 768px) and (max-width: 1023px)",
          mobile: "(max-width: 767px)",
        },
        (context) => {
          const { desktop, tablet, mobile } = context.conditions;
          const r = (d, t, m) => (desktop ? d : tablet ? t : m);

          // Horizontal scroller
          const wrapper = document.querySelector(".horizontal-wrapper");

          // intro anim
          const tl = gsap.timeline({ delay: 0.2 });

          // hero after
          const afterRule = CSSRulePlugin.getRule(".endruo_hero::after");

          // play together
          tl.fromTo(
            ".hero_inner",
            {
              backgroundSize: "70%",
              backgroundPosition: () => `50% ${r("100%", "50%", "50%")}`,
            },
            {
              backgroundSize: "100%",
              backgroundPosition: () => `50% ${r("50%", "20%", "20%")}`,
              duration: 1,
              ease: "none",
            },
            "<"
          )
            .from(
              ".hero_h",
              {
                opacity: 0,
                x: (i) => r(40, 20, 20) * (i + 1),
                duration: 1,
                ease: "none",
              },
              "<"
            )

            .fromTo(
              afterRule,
              { cssRule: { opacity: 0, transform: "translateY(80px)" } },
              {
                cssRule: { opacity: 1, transform: "translateY(0px)" },
                duration: 1,
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ endruo_hero to about ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".endruo_hero",
                start: "top-=150 top",
                endTrigger: ".about",
                end: "center center",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .to(
              ".hero_h",
              {
                y: (i) => (i === 0 ? 0 : 40),
                ease: "none",
              },
              "<"
            )
            .fromTo(
              ".hero_inner",
              { backgroundPosition: () => `50% ${r("50%", "20%", "20%")}` },
              {
                backgroundPosition: () => `50% ${r("350%", "50%", "50%")}`,
                ease: "none",
              },
              "<"
            )

            .to(
              afterRule,
              {
                cssRule: { transform: "translateY(250px)" },
                ease: "none",
              },
              "<"
            )
            .from(
              ".about",
              {
                opacity: 0.2,
                ease: "none",
              },
              "<"
            )
            .from(
              ".about_h",
              {
                y: (i) => (i === 0 ? 20 : 40),
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ about to horizontal ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".about",
                start: "center center",
                end: "bottom top",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .to(
              ".about_h",
              {
                y: (i) => (i === 0 ? 0 : 80),
                ease: "none",
              },
              "<"
            )
            .from(
              ".hroi_h",
              {
                y: (i) => (i === 0 ? -120 : -80),
                opacity: 0,
                ease: "none",
              },
              "<"
            );

          let horizontalTween;

          if (wrapper) {
            const getScroll = () => wrapper.scrollWidth - wrapper.offsetWidth;

            horizontalTween = gsap.to(wrapper, {
              x: () => -getScroll(),
              ease: "none",
              scrollTrigger: {
                trigger: ".horizontal-section",
                pin: true,
                scrub: 1,
                start: "top top",
                end: () => `+=${getScroll()}`,
                invalidateOnRefresh: true,
                markers: false,
              },
            });
          }
        }
      );

      return () => mm.revert();
    },
    { scope: container }
  );

  return (
    <SmoothScroll>
      <div ref={container} className="main overflow-hidden bg-[#000] mx-auto">
        {/*hero*/}
        <section className="oveflow-hidden min-h-[calc(100vh-150px)] relative endruo_hero global-margin global-padding z-0">
          <div
            className="hero_inner smooth w-full min-h-[calc(100vh-150px)] lg:bg-[position:top_center] bg-[position:top_25%_center] bg-no-repeat lg:bg-contain bg-[length:100vw] max-w-[1920px] mx-auto flex lg:items-center items-end lg:pl-[80px] pl-0 lg:pb-0 pb-10"
            style={{
              backgroundImage:
                "url('https://api.afs-foiling.com/wp-content/uploads/2024/10/Enduro900_CF_UHM75_0006-5-1.png')",
            }}
          >
            <div className="relative z-10 max-w-[655px] flex flex-col gap-[26px] items-center">
              <h2 className="hero_h md:text-[70px] text-[50px] font-bold leading-[1.1] text-white">
                All road performance
              </h2>
              <p
                className="hero_h max-w-[385px] text-[22px] leading-[1.3] font-semibold"
                style={{
                  background:
                    "var(--text-gradient_wihte, linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.40) 100%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.rich("hero", {
                  bold: (chunks) => (
                    <span
                      style={{
                        background: "#1D98FF",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {chunks}
                    </span>
                  ),
                })}
              </p>
            </div>
          </div>
        </section>

        {/*about section*/}
        <section className="about max-w-[1920px] mx-auto flex flex-col items-end justify-center global-padding gap-10 lg:gap-20 global-margin relative z-1">
          <h2
            className="about_h lg:text-[clamp(3.4375rem,1.7708rem+2.6042vw,4.375rem)] md:text-[50px] text-[32px] leading-[1.1] font-semibold font-medium uppercase"
            style={{
              background:
                "var(--text-gradient_wihte, linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.40) 100%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("about")}
          </h2>
          <p className="about_h max-w-[520px] text-white text-[22px] leading-[1.3] font-semibold lg:mr-[5vw] mr-0">
            {t.rich("about_p", {
              highlight: (chunks) => (
                <span className="text-[#1D98FF]">{chunks}</span>
              ),
            })}
          </p>
        </section>

        {/* horiziontal section */}
        <section className="horizontal-section max-w-[1920px] mx-auto relative h-screen flex-nowrap mb-20">
          <div className="horizontal-wrapper flex h-full gap-10">
            {/* horiziontal panel one */}
            <div className="smooth panel panel_one flex-shrink-0 lg:w-[12.5vw] w-0 md:block hidden"></div>

            {/* horiziontal panel two */}
            <div className="smooth panel panel_two flex-shrink-0 lg:w-[2560px] w-[300vw] flex text-white text-left py-16 global-padding flex flex-col justify-center items-between lg:gap-0 gap-10">
              {/* uppper content */}
              <div className="hori_one_h relative flex flex-col gap-[20px] lg:justify-end justify-center lg:max-w-[1060px] max-w-[175vw] lg:-mb-[140px] mb-0 z-1">
                <h2 className="hroi_h smooth global-h2 uppercase text-4 font-bold leading-[1]">
                  Enduro 1300
                </h2>
                <div className="hroi_h flex gap-[40px] max-w-[1060px] lg:text-[22px] text-[18px] leading-[1.3] font-semibold text-[#FFFFFFCC] pt-[26px] border-t border-t-[1px] border-t-[#1D98FF]">
                  <p className="smooth flex-1">{t("enduro_L_i")}</p>
                  <p className="smooth flex-1">{t("enduro_L_ii")}</p>
                </div>
              </div>

              {/* middile image  */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/07/Enduro1300_0001-4-1.png`}
                alt="AFS Enduro 1300"
                className="smooth hori_two_img min-w-[100%] rlative z-0"
              />

              {/* bottom p */}
              <div className="hori_one_bottom global-padding relatuve flex justify-end rlative z-1">
                <p
                  className="lg:max-w-[720px] max-w-[95vw] lg:text-[32px] text-[22px] leading-[1.3] font-semibold uppercase"
                  style={{
                    background:
                      "var(--text-gradient_wihte, linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.40) 100%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t("enduro_L_iii")}
                </p>
              </div>
            </div>

            {/* horiziontal panel three */}
            <div className="smooth panel panel_three flex-shrink-0 lg:w-[2560px] w-[300vw] flex text-white text-left py-16 global-padding flex flex-col justify-center items-between lg:gap-0 gap-10">
              {/* uppper content */}
              <div className="hori_three_h relative flex flex-col gap-[20px] lg:justify-end justify-center lg:max-w-[1060px] max-w-[175vw] lg:-mb-[140px] mb-0 z-1">
                <h2 className="smooth global-h2 uppercase text-4 font-bold leading-[1]">
                  Enduro 1100
                </h2>
                <p className="smooth flex-1 max-w-[680px] lg:text-[22px] text-[18px] leading-[1.3] font-semibold text-[#FFFFFFCC]">
                  {t("like")}
                </p>
              </div>

              {/* middile image  */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Enduro1300_0001-5-1-1.png`}
                alt="AFS Enduro 1100"
                className="hori_three_img smooth hori_img_one min-w-[100%] rlative z-0"
              />

              {/* bottom p */}
              <div className="hori_three_bottom relatuve flex justify-end rlative z-1 global-padding"></div>
            </div>

            {/* horiziontal panel four */}
            <div className="smooth panel panel_four flex-shrink-0 lg:w-[2560px] w-[300vw] flex text-white text-left py-16 global-padding flex flex-col justify-center items-between lg:gap-0 gap-10">
              {/* uppper content */}
              <div className="relative flex flex-col gap-[20px] lg:justify-end justify-center lg:max-w-[1060px] max-w-[175vw] lg:-mb-[140px] mb-0">
                <h2 className="smooth global-h2 uppercase text-4 font-bold leading-[1]">
                  Enduro 900
                </h2>
                <div className="flex gap-[40px] max-w-[1060px] lg:text-[22px] text-[18px] leading-[1.3] font-semibold text-[#FFFFFFCC] pt-[26px] border-t border-t-[1px] border-t-[#1D98FF]">
                  <p className="smooth flex-1">{t("all-terrain")}</p>
                  <p className="smooth flex-1">{t("compare")}</p>
                </div>
              </div>

              {/* middile image  */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Enduro1300_0001-11.png`}
                alt="AFS Enduro 900"
                className="smooth hori_img_one min-w-[100%]"
              />

              {/* bottom p */}
              <div className="relatuve flex justify-end">
                <p
                  className="lg:max-w-[720px] max-w-[95vw] lg:text-[32px] text-[22px] leading-[1.3] font-semibold uppercase"
                  style={{
                    background:
                      "var(--text-gradient_wihte, linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.40) 100%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t("maneuverability")}
                </p>
              </div>
            </div>

            {/* horiziontal panel five */}
            <div className="smooth panel panel_five flex-shrink-0 lg:w-[2560px] w-[300vw] flex text-white text-left py-16 global-padding flex flex-col justify-center items-between lg:gap-0 gap-10">
              {/* uppper content */}
              <div className="relative flex flex-col gap-[20px] lg:justify-end justify-center lg:max-w-[1060px] max-w-[175vw] lg:-mb-[140px] mb-0">
                <h2 className="smooth global-h2 uppercase text-4 font-bold leading-[1]">
                  Enduro 700
                </h2>
                <div className="flex gap-[40px] max-w-[1060px] lg:text-[22px] text-[18px] leading-[1.3] font-semibold text-[#FFFFFFCC] pt-[26px] border-t border-t-[1px] border-t-[#1D98FF]">
                  <p className="smooth flex-1">{t("unprecedented")}</p>
                  <p className="smooth flex-1">{t("wing")}</p>
                </div>
              </div>

              {/* middile image  */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/10/Enduro1300_0001-10-1.png`}
                alt="AFS Enduro 700"
                className="smooth hori_img_one min-w-[100%]"
              />

              {/* bottom p */}
              <div className="relatuve flex justify-end">
                <p
                  className="lg:max-w-[720px] max-w-[95vw] lg:text-[32px] text-[22px] leading-[1.3] font-semibold uppercase"
                  style={{
                    background:
                      "var(--text-gradient_wihte, linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.40) 100%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t("glide")}
                </p>
              </div>
            </div>

            {/* horiziontal panel six */}
            <div className="smooth panel panel_six flex-shrink-0 lg:w-[2560px] w-[300vw] flex text-white text-left py-16 global-padding flex flex-col justify-center items-between lg:gap-0 gap-10">
              {/* uppper content */}
              <div className="relative flex flex-col gap-[20px] lg:justify-end justify-center lg:max-w-[1360px] max-w-[200vw] lg:-mb-[140px] mb-0">
                <h2 className="smooth global-h2 uppercase text-4 font-bold leading-[1]">
                  Enduro 600
                </h2>
                <div className="flex gap-[40px] max-w-[1360px] lg:text-[22px] text-[18px] leading-[1.3] font-semibold text-[#FFFFFFCC] pt-[26px] border-t border-t-[1px] border-t-[#1D98FF]">
                  <p className="smooth flex-1">{t("radical")}</p>
                  <p className="smooth flex-1">{t("monolithic")}</p>
                </div>
              </div>

              {/* middile image  */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/Enduro600_0001_zoom-1-scaled-1.png`}
                alt="AFS Enduro 600"
                className="smooth hori_img_one min-w-[100%]"
              />

              {/* bottom p */}
              <div className="relatuve flex justify-end">
                <p
                  className="lg:max-w-[1060px] max-w-[150vw] lg:text-[32px] text-[18px] leading-[1.3] font-semibold uppercase"
                  style={{
                    background:
                      "var(--text-gradient_wihte, linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.40) 100%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t("pleasure")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
};

export default aileAvantEnduro;
