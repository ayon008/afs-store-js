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
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CSSRulePlugin);

const MastSkinny = () => {
  //define i18n
  const t = useTranslations("skinny");
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
          tl.from(
            ".hero_img",
            {
              opacity: 0,
              rotate: 15,
              scale: 0,
              duration: 1,
              ease: "power1.out",
            },
            "<"
          )
            .from(
              ".hero_h",
              {
                opacity: 0,
                y: (i) => r(60, 20, 20) * (i + 1),
                duration: 1,
                ease: "power1.out",
              },
              "<"
            )
            .from(
              ".hero_bottom",
              {
                opacity: 0,
                duration: 1,
                ease: "power1.out",
              },
              "<"
            );

          /* ------------------------------ endruo_hero to about ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".hero",
                start: "top-=150 top",
                endTrigger: ".about",
                end: "top 35%",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .fromTo(
              ".hero_bottom",
              {
                y: 0,
              },
              {
                y: r(-120, -20, 20),
                ease: "none",
              },
              "<"
            )

            .from(
              ".about_inner",
              {
                y: -20,
                ease: "none",
              },
              "<"
            )
            .from(
              ".about_h",
              {
                y: -40,
                ease: "none",
              },
              "<"
            )

            .from(
              ".about_img",
              {
                y: (i) => {
                  if (i === 0) return "10%";
                  if (i === 1) return "0%";
                  if (i === 2) return "-5%";
                  if (i === 3) return "-10%";
                  if (i === 4) return "-20%";
                },
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ about pin ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".about",
                start: "top 30%",
                endTrigger: ".old_mast",
                end: "top 30%",
                pin: ".about_inner",
                pinSpacing: false,
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .fromTo(
              ".about_inner_up",
              {
                y: 0,
              },
              {
                y: "-50vh",
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ old_mast anim ------------------------------ */

          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".connection_img",
                start: "top center",
                end: "center center",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .to(
              ".conecttion_t",
              {
                y: (i) => 20 * 2 ** i,
                ease: "none",
              },
              "<"
            )
            .from(
              ".new",
              {
                y: -120,
                ease: "none",
              },
              "<"
            )
            .from(
              ".connection_h",
              {
                opacity: 0.1,
                y: (i) => 20 * 2 ** i,
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ old_mast bottom entry ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".connexion_details",
                start: "top bottom",
                end: "bottom 100%",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .from(
              ".connexion_details",
              {
                y: (i) => r(40, 40, 20) * 2 ** i,
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ super bottom entry ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".super",
                start: "top bottom",
                end: "center center",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .from(
              ".super_h",
              {
                y: (i) => -120 + i * 30,
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ super bottom entry ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".fuse",
                start: "top bottom",
                end: "center center",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .from(
              ".fuse_h",
              {
                y: (i) => -120 + i * 30,
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ tag bottom entry ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".fuse",
                start: "center center",
                endTrigger: ".tag",
                end: "center center",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })

            .to(
              ".fuse",
              {
                scale: 0.8,
                rotate: 6,
                y: -40,
                ease: "none",
              },
              "<"
            )
            .from(
              ".tracker",
              {
                y: r(120, 80, 40),
                ease: "none",
              },
              "<"
            );

          /* ------------------------------ tag bottom pin ------------------------------ */
          gsap.timeline({
            scrollTrigger: {
              trigger: ".tag",
              start: "center center",
              pin: ".tag",
              end: "bottom top",
              scrub: true,
              markers: false,
              invalidateOnRefresh: true,
            },
          });

          /* ------------------------------ Ticker ------------------------------ */
          const el = container.current.querySelector(".ticker-content");
          const width = el.offsetWidth / 2;
          gsap.to(el, {
            x: -width,
            ease: "linear",
            repeat: -1,
            duration: 100,
          });
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
        <section className="oveflow-hidden min-h-[calc(100svh-160px)] relative hero lg:mb-[200px] mb-[120px] global-padding z-0 max-w-[1920px] mx-auto flex flex-col justify-center items-center md:gap-[0] gap-[38px] py-10">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/UHM85-1.png`}
            alt="AFS UHM85"
            className="smooth hero_img min-w-[100%]"
          />

          {/* Content */}
          <div className="md:absolute relative lg:max-w-[650px] max-w-[500px] flex flex-col items-center justify-center text-center gap-[20px] lg:gap-[38px]">
            <h2 className="hero_h global-h1 text-white">
              Better connection — better masts
            </h2>
            <p className="hero_h text-[#FFFFFFCC] text-[22px] leading-[1.3] font-semibold max-w-[400px]">
              {t("hero_p")}
            </p>
          </div>

          {/* bottom p */}
          <p className="hero_bottom max-w-[520px] text-4 leading-[1.3] font-semibold uppercase text-[#666666] md:text-left text-center md:absolute relative mt-20 md:bottom-10 mb-5 right-[clamp(1.25rem,-5.4167rem+10.4167vw,5rem)] md:left-auto left-0">
            {t("hero_b")}
          </p>
        </section>

        {/* About section */}
        <section className="about relative max-w-[1600px] mx-auto global-padding">
          {/* conten div */}
          <div className="about_inner max-w-[520px] z-2 md:absolute relative top-0 left-0 right-0  md:right-[clamp(1.25rem,-5.4167rem+10.4167vw,5rem)] md:left-auto">
            <div className="about_inner_up flex flex-col gap-[24px]">
              <h2 className="about_h global-h2 text-white">Choose the one</h2>
              <p className="text-white text-[20px] uppercase font-bold leading-[1.3] flex flex-col gap-4">
                {t("size_p")}
                <span className="about_p text-[18px] normal-case text-[#FFFFFFCC] font-semibold">
                  {t("size_p_i")}
                </span>
              </p>
            </div>
          </div>

          {/* Images div */}
          <div className="md:pt-30 pt-10 relative flex before:content-[''] before:absolute before:inset-0 before:w-full before:h-full before:z-[5] before:bg-[linear-gradient(180deg,_#00000000_0%,_#000000_100%)] z-0">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/image-15-3.png`}
              alt="AFS UHM85"
              className="smooth about_img lg:max-w-[clamp(19.075rem,-7.1711rem+34.4211vw,27.25rem)] max-w-[33vw] filter drop-shadow-[-50px_40px_100px_rgba(0,0,0,0.9)]"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/UHM85-1-1-1.png`}
              alt="AFS UHM85"
              className="smooth about_img max-w-[31.5vw] lg:max-w-[clamp(18.15625rem,-6.8257rem+32.7632vw,25.9375rem)] absolute bottom-0 left-[15vw] lg:left-[clamp(10.5rem,-3.9474rem+18.9474vw,15rem)] filter drop-shadow-[-50px_40px_100px_rgba(0,0,0,0.9)]"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/UHM85_S_carbon-2-1.png`}
              alt="AFS UHM85"
              className="smooth about_img max-w-[31.5vw] lg:max-w-[clamp(18.6375rem,-7.0066rem+33.6316vw,26.625rem)] absolute bottom-0 left-[30vw] lg:left-[clamp(19.075rem,-7.1711rem+34.4211vw,27.25rem)] filter drop-shadow-[-50px_40px_100px_rgba(0,0,0,0.9)]"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/UHM80-1-1-1-1.png`}
              alt="AFS UHM85"
              className="smooth about_img max-w-[28vw] lg:max-w-[clamp(17.0625rem,-6.4145rem+30.7895vw,24.375rem)] absolute bottom-0 left-[45vw] lg:left-[clamp(28.65625rem,-10.773rem+51.7105vw,40.9375rem)] filter drop-shadow-[-50px_40px_100px_rgba(0,0,0,0.9)]"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/UHM75_S_carbon-1.png`}
              alt="AFS UHM85"
              className="smooth about_img max-w-[28vw] lg:max-w-[clamp(17.0625rem,-6.4145rem+30.7895vw,24.375rem)] absolute bottom-0 left-[60vw] lg:left-[clamp(37.1875rem,-13.9803rem+67.1053vw,53.125rem)] filter drop-shadow-[-50px_40px_100px_rgba(0,0,0,0.9)]"
            />
          </div>
        </section>

        {/* old to new section */}
        <section className="old_mast max-w-[602px] mx-auto flex flex-col md:gap-[84px] gap-[60px]  justify-center relative z-2 px-5 global-margin">
          {/* Content div */}
          <div className="connection_top smooth max-[540px] flex flex-col gap-6 text-center mb-[10px]">
            <h2 className="conecttion_t global-h2 text-white">
              Ultimate shape
            </h2>
            <p className="conecttion_t text-white text-[20px] uppercase font-bold leading-[1.3] flex flex-col gap-4">
              {t("shape_p")}
              <span className="text-[18px] normal-case text-[#FFFFFFCC] font-semibold">
                {t("shape_p_i")}
              </span>
            </p>
          </div>

          {/* Content div */}
          <div className="connection_img flex items-center justify-start items-start gap-2">
            {/* old mast connexion */}
            <div className="old smooth relative flex-1 flex justify-end">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/imgonline-com-ua-Replace-color-q7ChPdhKkGjnz-1-e1740772997214.png`}
                alt="AFS UHM85"
                className="relative z-0"
              />
              <p className="connection_h smooth absolute bottom-0 z-2 text-[#666666] text-4 uppercase font-bold text-center">
                {t("Old")} — <span className="text-white">Performer UHM</span>
              </p>
              <table className="connection_h smooth text-white md:text-4 text-3 uppercase !font-bold absolute left-0 md:bottom-[20%] bottom-[33%]">
                <tbody className="flex flex-col gap-2">
                  <tr className="flex flex-wrap gap-1">
                    <th className="!bg-transparent !p-0">chord</th>
                    <td className="text-[#CCCCCC]">120 mm</td>
                  </tr>
                  <tr className="flex flex-wrap gap-1">
                    <th className="!bg-transparent !p-0">{t("th")}</th>
                    <td className="text-[#CCCCCC]">14.3 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* new mast connexion */}
            <div className="new smooth relative pt-30 flex-1 flex justify-start">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/image-1-4-e1740772874693.png`}
                alt="AFS UHM85"
                className="realtive z-0"
              />
              <p className="connection_h smooth absolute bottom-0 z-2 text-[#D5494C] text-4 uppercase font-bold text-center">
                {t("New")} —{" "}
                <span className="text-[#CCCCCC]">Fuse Link UHM</span>
              </p>

              <table className="connection_h smooth text-white md:text-4 text-3 uppercase !font-bold absolute right-0 md:bottom-[20%] bottom-[33%]">
                <tbody className="flex flex-col gap-2">
                  <tr className="flex flex-wrap gap-1">
                    <th className="!bg-transparent !p-0">chord</th>
                    <td className="text-[#CCCCCC]">115 mm</td>
                  </tr>
                  <tr className="flex flex-wrap gap-1">
                    <th className="!bg-transparent !p-0">{t("th")}</th>
                    <td className="text-[#CCCCCC]">13.5 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-white text-center text-[20px] uppercase font-bold leading-[1.3] flex flex-col gap-4 max-w-[520px]">
            <span className="connexion_details smooth">{t("shape_b")}</span>
            <span className="connexion_details text-[14px] text-[#666666] font-semibold">
              {t("shape_b_i")}
            </span>
            <span className="connexion_details smooth text-[18px] normal-case text-[#FFFFFFCC] font-semibold">
              {t("shape_b_ii")}
            </span>
          </p>
        </section>

        {/* Super stiff */}
        <section
          className="super smooth max-w-[1920px] mx-auto min-h-[720px] flex items-center justify-center bg-center bg-cover global-padding global-margin"
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/17820231_SL-092619-23740-39-1.png)`,
          }}
        >
          <div className="max-w-[560px] flex flex-col gap-6 text-center">
            <h2 className="super_h smooth global-h2 text-white">Super stiff</h2>
            <p className="text-white text-center text-[20px] uppercase font-bold leading-[1.3] flex flex-col gap-4">
              <span className="super_h">{t("super")}</span>
              <span className="super_h smooth smooth text-[18px] normal-case text-[#FFFFFFCC] font-semibold">
                {t("super_i")}
              </span>
            </p>
          </div>
        </section>

        {/* Fuse Link Connection */}
        <section
          className="fuse relative bg-[#090A0A] max-w-[1920px] mx-auto bg-center md:bg-cover bg-[length:0] bg-no-repeat lg:min-h-[840px] md:min-h-[600px] flex flex  items-start justify-end flex-col md:pb-10 global-margin"
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/Fuselink_1000_4-1.png`,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/09/Fuselink_1000_4-1.png`}
            alt="AFS UHM85"
            className="smooth min-w-[100%] md:hidden block"
          />
          {/* content */}
          <div className="global-padding relative z-1">
            <div className="max-w-[440px] flex flex-col gap-6">
              <h2 className="fuse_h global-h2 text-white">
                Fuse Link Connection
              </h2>
              <p className="fuse_h text-[#FFFFFFCC] text-[18px] font-bold leading-[1.3] flex flex-col gap-4">
                {t("system")}
                <a
                  href="/product/fuselage-evo"
                  className="flex items-center gap-[5px] uppercase text-4 text-[#D5494C]"
                >
                  {t("btn")}
                  <ArrowUpRight
                    strokeWidth={3}
                    className="w-5 h-5 text-current"
                  />
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* tag line */}
        <section className="tag max-w-[1920px] mx-auto relative flex items-center global-margin flex-col">
          <h2 className="text-white text-[clamp(3.75rem,-0.8538rem+9.6038vw,8.75rem)] font-semibold uppercase leading-[90%] text-center global-padding">
            {t("tag")}
          </h2>

          {/* tracker*/}
          <div className="tracker absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-[#D44841] py-[10px] text-white font-bold text-[22px] uppercase  bottom-20 -rotate-[1deg] z-2 drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] flex flex-nowrap whitespace-nowrap">
            <div className="ticker-content flex gap-10 md:gap-[60px] whitespace-nowrap max-h-10">
              {Array(10)
                .fill(
                  <>
                    <span>{t("ticker")}</span>
                  </>
                )
                .map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {item}
                  </span>
                ))}
            </div>
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
};

export default MastSkinny;
