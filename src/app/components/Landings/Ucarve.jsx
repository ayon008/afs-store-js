"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SmoothScroll from "@/app/components/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

const Ucarve = () => {
  //define i18n
  const t = useTranslations("ucarve");
  const g = useTranslations("productDimension");
  const container = useRef(null);

  const tabs = ["U carve 130", "U carve 140", "U carve 150", "U carve 160"];

  const [activeTab, setActiveTab] = useState(0);
  const [showPaddles, setShowPaddles] = useState(false);

  const navRef = useRef(null);
  const trackRef = useRef(null);
  const bgRef = useRef(null);
  const btnRefs = useRef([]);
  const xRef = useRef(0);

  const uCarve130Specs = [
    { label: "Surface", value: "130 cm2" },
    { label: g("Envergure"), value: "360 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: g("Corde maximum"), value: "68" },
    { label: g("Epaisseur maximum"), value: "5" },
    {
      label: "Construction",
      value: `HR ${g("Carbone")} + HM ${g("Carbone")} / ${g("Monolithiqu")}`,
    },
    { label: g("Taille des vis"), value: "12mm Torx 30" },
  ];

  const uCarve140Specs = [
    { label: "Surface", value: "140 cm2" },
    { label: g("Envergure"), value: "375 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: g("Corde maximum"), value: "72" },
    { label: g("Epaisseur maximum"), value: "5" },
    {
      label: "Construction",
      value: `HR ${g("Carbone")} + HM ${g("Carbone")} / ${g("Monolithiqu")}`,
    },
    { label: g("Taille des vis"), value: "12mm Torx 30" },
  ];

  const uCarve150Specs = [
    { label: "Surface", value: "150 cm2" },
    { label: g("Envergure"), value: "390 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: g("Corde maximum"), value: "76" },
    { label: g("Epaisseur maximum"), value: "5" },
    {
      label: "Construction",
      value: `HR ${g("Carbone")} + HM ${g("Carbone")} / ${g("Monolithiqu")}`,
    },

    { label: g("Taille des vis"), value: "12mm Torx 30" },
  ];

  const uCarve160Specs = [
    { label: "Surface", value: "160 cm2" },
    { label: g("Envergure"), value: "400 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: g("Corde maximum"), value: "80" },
    { label: g("Epaisseur maximum"), value: "5" },
    {
      label: "Construction",
      value: `HR ${g("Carbone")} + HM ${g("Carbone")} / ${g("Monolithiqu")}`,
    },
    { label: g("Taille des vis"), value: "12mm Torx 30" },
  ];

  /* ----------------------------------------
     REUSABLE TABLE (SAME MARKUP)
  ---------------------------------------- */
  function SpecsTable({ data }) {
    return (
      <table>
        <tbody className="text-4 lg:text-[18px] font-bold leading-[110%] flex flex-col gap-2">
          {data.map((row, index) => (
            <tr
              key={index}
              className="py-[2px] border-b border-b-[1px] border-b-[#FFFFFF26] flex justify-between gap-[40px]"
            >
              <th
                style={{ padding: 0, backgroundColor: "transparent" }}
                className="text-left text-[#FFFFFFCC] !whitespace-break-spaces"
              >
                {row.label}
              </th>

              <td
                style={{ textAlign: "right" }}
                className="font-semibold !whitespace-break-spaces"
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  /* ----------------------------------------
       Indicator animation
    ---------------------------------------- */
  const moveIndicator = () => {
    const nav = navRef.current;
    const activeBtn = btnRefs.current[activeTab];
    const bg = bgRef.current;

    if (!nav || !activeBtn || !bg) return;

    const navRect = nav.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    gsap.to(bg, {
      x: btnRect.left - navRect.left,
      width: btnRect.width,
      height: btnRect.height,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  /* ----------------------------------------
       Center active tab
    ---------------------------------------- */
  const centerActiveTab = () => {
    const nav = navRef.current;
    const track = trackRef.current;
    const btn = btnRefs.current[activeTab];

    if (!nav || !track || !btn) return;

    const navWidth = nav.offsetWidth;
    const trackWidth = track.scrollWidth;

    const btnOffset = btn.offsetLeft + btn.offsetWidth / 2;

    let targetX = navWidth / 2 - btnOffset;

    const minX = Math.min(0, navWidth - trackWidth);
    targetX = gsap.utils.clamp(minX, 0, targetX);

    xRef.current = targetX;

    gsap.to(track, {
      x: targetX,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: moveIndicator,
    });
  };

  useLayoutEffect(() => {
    moveIndicator();
    centerActiveTab();
  }, [activeTab]);

  /* ----------------------------------------
       FLOW content
    ---------------------------------------- */
  const flowSections = [
    {
      imageSrc: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/DSC01362-Recupere.png`,
      imageAlt: "AFS U Carve Stabilizer",
      text: t("flow_h_I"),
      reverse: false,
    },
    {
      imageSrc: `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/DSC01362-Recupere-1.png`,
      imageAlt: "AFS U Carve Stabilizer",
      text: t("flow_h_II"),
      reverse: true,
    },
  ];

  /* ----------------------------------------
     WHOLE CHALLENGE content
  ---------------------------------------- */
  const challengeContent = {
    label: t("whole_h"),
    text: t("whole_p"),
  };

  /* ----------------------------------------
     AVAILABLE SIZES content
  ---------------------------------------- */
  const sizesContent = {
    subtitle: t("size_h"),
    title: t("size_p_i"),
    titleEmphasis: t("size_p_ii"),
    description: [t("size_p_iii"), t("size_p_iiii")],
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

          const heroImg = container.current.querySelector(".hero_center_img");
          const aboutTarget = container.current.querySelector(".about_target");
          const heroSection = container.current.querySelector(".hero");
          const aboutSection = container.current.querySelector(".about");

          if (!heroImg || !aboutTarget || !heroSection || !aboutSection) return;

          // Get initial scale applied via CSS
          const initialScale =
            parseFloat(
              window
                .getComputedStyle(heroImg)
                .transform.split(",")[0]
                .replace("matrix(", "")
            ) || 1;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                endTrigger: aboutSection,
                end: "center center",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })
            .to(
              heroImg,
              {
                x: () => {
                  const heroBox = heroImg.getBoundingClientRect();
                  const targetBox = aboutTarget.getBoundingClientRect();
                  return (
                    targetBox.left +
                    targetBox.width / 2 -
                    (heroBox.left + heroBox.width / 2)
                  );
                },
                y: () => {
                  const heroBox = heroImg.getBoundingClientRect();
                  const targetBox = aboutTarget.getBoundingClientRect();

                  // Calculate centers
                  const heroCenterY =
                    heroBox.top + window.scrollY + heroBox.height / 2;
                  const targetCenterY =
                    targetBox.top + window.scrollY + targetBox.height / 2;

                  return targetCenterY - heroCenterY;
                },
                scale: () => {
                  // Adjust for initial scale applied via CSS
                  const targetBox = aboutTarget.getBoundingClientRect();
                  return (targetBox.width / heroImg.offsetWidth) * initialScale;
                },
                rotate: -10,
                opacity: 1,
                transformOrigin: "center",
                ease: "none",
              },
              "<"
            )
            .to(".hero_img_op", { opacity: 1, ease: "none" }, "<");

          /* HERO → ABOUT SCROLL text */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                endTrigger: ".about",
                end: "top center",
                scrub: true,
                markers: false,
              },
            })
            .fromTo(
              ".hero_p",
              { x: -20, opacity: 0 },
              { x: 0, opacity: 1, stagger: 0.1, ease: "none" },
              "<"
            )
            .fromTo(
              ".about_p",
              { y: 200, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.2, ease: "none" },
              "<"
            );

          /* HERO → ABOUT SCROLL images */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                endTrigger: ".about",
                end: "center center",
                scrub: true,
                markers: false,
              },
            })
            .fromTo(
              ".about_img_I",
              { x: "-200vw" },
              { x: 0, ease: "none" },
              "<"
            )
            .fromTo(
              ".about_img_III",
              { x: "100vw" },
              { x: 0, ease: "none" },
              "<"
            )
            .fromTo(
              ".about_img_IIII",
              { x: "200vw" },
              { x: 0, ease: "none" },
              "<"
            );

          /* Flow entry */
          const vh40 = window.innerHeight * 0.4;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".flow_main",
                start: `top center`,
                end: "top top",
                scrub: true,
                markers: false,
              },
            })
            .fromTo(
              ".flow",
              { y: r(400, 200, 120) },
              { y: 0, ease: "none" },
              "<"
            );

          /* Flow entry */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".flow_main",
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                markers: false,
              },
            })
            .to(".flow_img_one", { scale: 1.5, ease: "none" }, "<");

          /* whole entry */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".whole",
                start: "top bottom",
                end: "center center",
                scrub: true,
                markers: false,
              },
            })

            .fromTo(
              ".whole_p",
              { x: r(-40, -20, 0), y: r(0, 0, 0) },
              { x: 0, ease: "none" },
              "<"
            )
            .fromTo(
              ".whole_h",
              { y: r(40, 20, 20), opacity: 0.5 },
              { y: 0, opacity: 1, ease: "none" },
              "<"
            );
          /* size entry */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".sizes",
                start: "top bottom",
                end: "center center",
                scrub: true,
                markers: false,
              },
            })

            .fromTo(
              ".sizes_img_I",
              { x: r(-40, -20, -20), y: 40 },
              { x: 0, y: 0, ease: "none" },
              "<"
            )
            .fromTo(
              ".sizes_img_II",
              { x: r(-60, -20, -20), y: r(40, 20, 20) },
              { x: 0, y: 0, ease: "none" },
              "<"
            )
            .fromTo(
              ".sizes_img_III",
              { x: r(-80, -20, -20), y: r(40, 20, 20) },
              { x: 0, y: 0, ease: "none" },
              "<"
            )
            .fromTo(
              ".sizes_img_IIII",
              { x: r(-100, -20, -20), y: r(40, 20, 20) },
              { x: 0, y: 0, ease: "none" },
              "<"
            );

          /* size entry */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".sizes",
                start: "center center",
                end: "bottom top",
                scrub: true,
                markers: false,
              },
            })

            .to(".sizes_inner", { rotate: -30, ease: "none" }, "<")
            .fromTo(".sizes_img_I", { y: 0 }, { y: 40, ease: "none" }, "<")
            .fromTo(".sizes_img_II", { y: 0 }, { y: 80, ease: "none" }, "<")
            .fromTo(".sizes_img_III", { y: 0 }, { y: 120, ease: "none" }, "<")
            .fromTo(".sizes_img_IIII", { y: 0 }, { y: 160, ease: "none" }, "<");

          const short = document.querySelector(".short");
          const imgs = [
            document.querySelector(".short_img_i"),
            document.querySelector(".short_img_ii"),
          ];

          // calculate offsets for each image
          const offsets = imgs.map((img) => {
            const shortRect = short.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();
            const parentCenter = shortRect.left + shortRect.width / 2;
            const imgCenter = imgRect.left + imgRect.width / 2;
            return parentCenter - imgCenter;
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: r(".sizes", short, short),
              endTrigger: short,
              start: r("bottom bottom", "top bottom", "top bottom"),
              end: r("center center", "bottom bottom", "bottom bottom"),
              scrub: true,
              markers: false,
            },
          });

          // optional opacity fade for some element
          tl.fromTo(
            ".short_t_div",
            { y: 40, opacity: 0.5 },
            { y: 0, opacity: 1, ease: "none" }
          );

          // animate each image
          imgs.forEach((img, i) => {
            tl.fromTo(img, { x: offsets[i] }, { x: 0, ease: "none" }, "<");
          });
        }
      );

      return () => mm.revert();
    },
    { scope: container }
  );

  /* --------------------------------------------------
     🔥 IMAGE LOAD FIX (CRITICAL FOR SCROLLTRIGGER)
     --------------------------------------------------
     Next <Image /> loads with intrinsic size first
     → layout shifts after decode
     → ScrollTrigger needs refresh AFTER decode
  -------------------------------------------------- */

  const handleImageLoad = (img) => {
    // Wait for browser layout + decode
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  return (
    <SmoothScroll>
      <div ref={container} className="overflow-hidden bg-[#000] mx-auto">
        {/*hero*/}
        <section className="min-h-[100vh] relative hero smooth global-padding global-margin">
          {/*hero top*/}
          <div className="pt-20 pb-10 flex flex-col flex-wrap items-center gap-[20px] text-center text-[16px] md:text-[20px] z-1">
            <h3 className="text-[#FFFFFF99] leading-[1] font-bold uppercase">
              {t("hero_p")}
            </h3>
            <h2 className="md:text-[clamp(4.375rem,1.4647rem+6.0711vw,8.75rem)] text-[50px] text-white leading-[1]">
              {t("hero_h")}
            </h2>
            <p className="text-[#FFFFFF99] leading-[1.3] font-semibold max-w-[531px]">
              {t("hero_p_II")}
            </p>
          </div>

          {/* center hero img */}
          <div className="hero_img_wrapper flex-1 flex items-center justify-center lg:mt-[100px] lg:mt-[60px] mt-[20px] lg:-mb-[7.5%] md:mb-20 mb-[20px]">
            <div className="hero-img relative scale-[1.3] overflow-hidden flex justify-center hero_center_img after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:bg-inherit after:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_100%)] after:filter after:blur-[12px] w-[100%]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave150_0001-5.png`}
                alt="AFS U Carve Stabilizer 150"
                className="hero_img_op smooth w-full h-auto opacity-[.9] flex-1 scale-[1]"
                width={800}
                height={600}
                onLoadingComplete={(img) => handleImageLoad(img)}
                priority={true}
              />
            </div>
          </div>

          {/* bottom/absolute div */}
          <div className="relative hero_text z-1 space-y-[32px] max-w-[1920px] mx-auto">
            <h3 className="global-h1 !font-semibold text-white">
              {t("hero_bottom_p")}
            </h3>
            <div className="flex flex-wrap md:flex-nowrap lg:gap-10 gap-[20px] lg:text-[18px] text-[16px] text-[#FFFFFFCC] font-semibold leading-[130%]">
              <p className="md:flex-1 smooth hero_p pl-4 border-l border-l-[2px] border-l-[#FFFFFF80]">
                {t("hero_row_p_I")}
              </p>
              <p className="md:flex-1 smooth hero_p pl-4 border-l border-l-[2px] border-l-[#FFFFFF80]">
                {t("hero_row_p_II")}
              </p>
              <p className="md:flex-1 smooth hero_p pl-4 border-l border-l-[2px] border-l-[#FFFFFF80]">
                {t("hero_row_p_III")}
              </p>
            </div>
          </div>
        </section>

        {/*about*/}
        <section className="about smooth relative mb-20 flex flex-col">
          <div className="relative z-1 max-w-[655px] mx-auto text-center space-y-[25px] px-[20px]">
            <h2 className="about_p global-h2 text-white">{t("about_h")}</h2>
            <p className="about_p smooth max-w-[531px] mx-auto text-[#FFFFFF99] leading-[1.3] font-semibold max-w-[571px] text-[16px] md:text-[20px]">
              {t("about_p")}
            </p>
          </div>
          {/*about content*/}
          <div
            className="relative flex -space-x-[16%] transform -rotate-10 scale-[1.2] opacity-[0.8] md:-mt-[7.5%] mt-[5%] flex-wrap
                after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-black/40 after:z-[10] "
          >
            {/*about img 1*/}
            <div className="about_img_I relative z-[4] hero-img relative overflow-hidden md:flex-1 flex-[50%]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave160_0001-3.png`}
                alt="AFS U Carve Stabilizer 160"
                width={1920}
                height={1080}
                className="max-w-full h-auto opacity-[1]"
                onLoad={(e) => handleImageLoad(e.target)}
              />
            </div>
            {/*about img 2 empty*/}
            <div className="relative z-[3] hero-img relative overflow-hidden flex justify-center md:flex-1 about_target flex-[50%]"></div>
            {/*about img 3*/}
            <div className="about_img_III relative z-[2] hero-img relative overflow-hidden md:flex-1 flex-[50%]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave140_0001-2.png`}
                alt="AFS U Carve Stabilizer 140"
                width={1920}
                height={1080}
                className="max-w-full h-auto opacity-[1]"
                onLoad={(e) => handleImageLoad(e.target)}
              />
            </div>
            {/*about img 4*/}
            <div className="about_img_IIII hero-img relative overflow-hidden flex justify-center md:flex-1 flex-[50%]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave130_0001-2.png`}
                alt="AFS U Carve Stabilizer 130"
                width={1920}
                height={1080}
                className="max-w-full h-auto opacity-[1]"
                onLoad={(e) => handleImageLoad(e.target)}
              />
            </div>
          </div>
        </section>

        {/*Flow*/}
        <section className="flow_main text-center text-[#FFFFFFCC] text-[22px] leading-[130%] uppercase relative z-1">
          {flowSections.map((item, index) => (
            <div
              key={index}
              className={`
                  flex flex-col md:flex-row flow smooth
                  ${index === 0 ? "flow_img_one_div" : ""}
                  ${index === 1 ? "flow_img_tow_div" : ""}
                `}
            >
              <div
                className={`lg:min-h-auto min-h-[50vh] flex flex-1 overflow-hidden ${
                  item.reverse ? "order-2 md:order-2" : ""
                }`}
              >
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  width={600}
                  height={600}
                  className={`object-cover ${
                    index === 0 ? "flow_img_one" : ""
                  } ${index === 1 ? "flow_img_one" : ""} ${
                    item.reverse ? "order-2 md:order-2" : ""
                  }`}
                  style={{ width: "100%", height: "auto" }}
                  loading="lazy"
                  onLoad={(e) => handleImageLoad(e.target)}
                />
              </div>
              <div
                className={`
                bg-[#111111]
                flex-1
                flex items-center
                ${item.reverse ? "order-1 md:order-1" : ""}
              `}
              >
                <h3
                  className={`
                  max-w-[520px] mx-auto py-10 px-5
                  ${index === 0 ? "flow_text_one" : ""}
                  ${index === 1 ? "flow_text_two" : ""}
                `}
                >
                  {item.text}
                </h3>
              </div>
            </div>
          ))}
        </section>

        {/* Whole challenge section */}
        <section className="max-w-[1920px] mx-auto whole global-padding md:py-30 py-20 mx-auto flex flex-col lg:flex-row md:gap-[clamp(1.5rem,-5.1756rem+13.9256vw,8.75rem)] gap-4">
          <h2 className="whole_p text-4 text-[#FFFFFF99] font-bold leading-[110%] lg:md:flex-[200px_0_0] md:flex-1 pt-0 lg:pt-4">
            {challengeContent.label}
          </h2>

          <p className="whole_h global-h1 !font-normal text-white flex-1 !leading-[1]">
            {challengeContent.text}
          </p>
        </section>

        {/*Available sizes*/}
        <section className="relative z-1 max-w-[1920px] mx-auto sizes bg-[#111] overflow-hidden mb-30">
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Images */}
            <div
              className="sizes_inner flex flex-col mt-20 -translate-x-[20%]  scale-[1.2]"
              style={{ transform: "rotate(-15deg)" }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave160_0001-1.png`}
                alt="AFS U Carve Stabilizer 160"
                width={1920}
                height={1080}
                className="sizes_img_I -mb-[32px] lg:-mb-[140px] md:-mb-[40px] z-[4] drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                onLoad={(e) => handleImageLoad(e.target)}
              />
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave150_0001-3.png`}
                alt="AFS U Carve Stabilizer 150"
                width={1920}
                height={1080}
                className="sizes_img_II -mb-[32px] lg:-mb-[130px] md:-mb-[40px] z-[3] drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                onLoad={(e) => handleImageLoad(e.target)}
              />
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave140_0001-2.png`}
                alt="AFS U Carve Stabilizer 140"
                width={1920}
                height={1080}
                className="sizes_img_III -mb-[32px] lg:-mb-[120px] md:-mb-[40px] z-[2] drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                onLoad={(e) => handleImageLoad(e.target)}
              />
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave130_0001-2.png`}
                alt="AFS U Carve Stabilizer 130"
                width={1920}
                height={1080}
                className="sizes_img_IIII drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                onLoad={(e) => handleImageLoad(e.target)}
              />
            </div>

            {/* Content */}
            <div className="max-w-[520px] flex flex-col gap-5 lg:gap-10 items-start py-10 px-[clamp(1.25rem,-5.4167rem+10.4167vw,5rem)] lg:pl-0">
              <h2 className="text-[#FFFFFFCC] text-4 leading-[130%] uppercase">
                {sizesContent.subtitle}
              </h2>

              <h3 className="text-[32px] text-white font-bold leading-[125%]">
                {sizesContent.title}
                <span className="font-semibold text-[#FFFFFFCC]">
                  {sizesContent.titleEmphasis}
                </span>
              </h3>

              <p className="text-[#FFFFFFCC] text-24 lg:text-[18px] leading-[130%] font-medium flex flex-col gap-5">
                {sizesContent.description.map((text, index) => (
                  <span key={index}>{text}</span>
                ))}
              </p>
            </div>
          </div>
        </section>

        {/*short sec*/}
        <section className="short smooth mb-10 md:mb-20 lg:mb-30">
          {/* top text */}
          <div className="max-w-[1920px] mx-auto short_t_div smooth flex flex-col text-white items-end gap-6 md:gap-10 global-padding relative z-1">
            <h2 className="short_h global-h1 !font-normal">{t("short_h")}</h2>
            <p className="text-[18px] leading-[1.3] max-w-[520px] font-semibold">
              {t("short_p")}
            </p>
          </div>
          {/* image div */}

          <div className="smooth flex relative z-0 -mt-[5%] md:-mt-[20%] after:content-[''] after:absolute after:top-0 after:left-0 after:w-[110%] after:h-full after:bg-[linear-gradient(180deg,_#000000_0%,_rgba(0,0,0,0)_100%)] after:z-[5] after:pointer-events-none">
            <div
              style={{
                width: "auto",
                maxWidth: "33.33%",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "visible",
                maxHeight: "1200px",
                minHeight: "50vw",
              }}
              className="short_img_i"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave130_0002-1.png`}
                alt="AFS U Carve Stabilizer 130"
                width={1200}
                height={1200}
                onLoadingComplete={(img) => handleImageLoad(img)}
                style={{
                  transform: "rotate(-45deg)",
                  display: "block",
                  maxWidth: "1200px",
                  height: "auto",
                  minWidth: "50vw",
                }}
              />
            </div>

            <div
              style={{
                width: "auto",
                maxWidth: "33.33%",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "visible",
                maxHeight: "1200px",
                minHeight: "50vw",
              }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave140_0002-1.png`}
                alt="AFS U Carve Stabilizer 140"
                width={1200}
                height={1200}
                onLoadingComplete={(img) => handleImageLoad(img)}
                style={{
                  transform: "rotate(-45deg)",
                  display: "block",
                  maxWidth: "1200px",
                  height: "auto",
                  minWidth: "50vw",
                }}
              />
            </div>

            <div
              style={{
                width: "auto",
                maxWidth: "33.33%",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "visible",
                maxHeight: "1200px",
                minHeight: "50vw",
              }}
              className="short_img_ii"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave150_0002-1.png`}
                alt="AFS U Carve Stabilizer 150"
                width={1200}
                height={1200}
                onLoadingComplete={(img) => handleImageLoad(img)}
                style={{
                  transform: "rotate(-45deg)",
                  display: "block",
                  maxWidth: "1200px",
                  height: "auto",
                  minWidth: "50vw",
                }}
              />
            </div>
          </div>
        </section>

        {/*Technical information section*/}
        <section className="max-w-[1440px] relative global-padding max-w-[1440px] mx-auto global-margin">
          <h2 className="global-h2 text-center text-white mb-20">
            {t("information")}
          </h2>

          {/* Content */}
          <div className="text-white">
            {activeTab === 0 && (
              <div className="relative flex flex-col">
                <div className="bg-[#00000033] backdrop-blur-[20px] p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                  <h3 className="text-[28px] leading-[100%] font-bold">
                    U carve 130
                  </h3>

                  <SpecsTable data={uCarve130Specs} />
                </div>

                <div className="relative lg:absolute md:top-1/3 right-0  pb-[40px] md:pb-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave130_0001-2.png`}
                    alt="AFS U Carve Stabilizer 130"
                    loading="lazy"
                    width={1000}
                    height={1000}
                    style={{ height: "auto", width: "100%" }}
                    onLoad={(e) => handleImageLoad(e.target)}
                    className="lg:max-w-[50vw] max-w-[100%] lg:min-w-[50vw] min-w-[100%]"
                  />
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="relative">
                <div className="bg-[#00000033] backdrop-blur-[20px] p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                  <h3 className="text-[28px] leading-[100%] font-semibold">
                    U carve 140
                  </h3>

                  <SpecsTable data={uCarve140Specs} />
                </div>

                <div className="relative lg:absolute md:top-1/3 right-0  pb-[40px] md:pb-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave140_0001-2.png`}
                    alt="AFS U Carve Stabilizer 140"
                    loading="lazy"
                    width={1000}
                    height={1000}
                    style={{ height: "auto", width: "100%" }}
                    onLoad={(e) => handleImageLoad(e.target)}
                    className="lg:max-w-[50vw] max-w-[100%] lg:min-w-[50vw] min-w-[100%]"
                  />
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="relative">
                <div className="bg-[#00000033] backdrop-blur-[20px] p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                  <h3 className="text-[28px] leading-[100%] font-semibold">
                    U carve 150
                  </h3>

                  <SpecsTable data={uCarve150Specs} />
                </div>

                <div className="relative lg:absolute md:top-1/3 right-0  pb-[40px] md:pb-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave150_0001-3.png`}
                    alt="AFS U Carve Stabilizer 150"
                    loading="lazy"
                    width={1000}
                    height={1000}
                    style={{ height: "auto", width: "100%" }}
                    onLoad={(e) => handleImageLoad(e.target)}
                    className="lg:max-w-[50vw] max-w-[100%] lg:min-w-[50vw] min-w-[100%]"
                  />
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="relative">
                <div className="bg-[#00000033] backdrop-blur-[20px] p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                  <h3 className="text-[28px] leading-[100%] font-semibold">
                    U carve 160
                  </h3>

                  <SpecsTable data={uCarve160Specs} />
                </div>

                <div className="relative lg:absolute md:top-1/3 right-0  pb-[40px] md:pb-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/ucrave160_0001-2-1.png`}
                    alt="AFS U Carve Stabilizer 160"
                    loading="lazy"
                    width={1000}
                    height={1000}
                    style={{ height: "auto", width: "100%" }}
                    onLoad={(e) => handleImageLoad(e.target)}
                    className="lg:max-w-[50vw] max-w-[100%] lg:min-w-[50vw] min-w-[100%]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div
            ref={navRef}
            className="relative overflow-hidden rounded-full bg-[#1F1F1F] max-w-fit mx-auto mt-20"
          >
            <div
              ref={bgRef}
              className="absolute top-0 left-0 bg-white rounded-full z-0"
            />

            <div ref={trackRef} className="flex">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  ref={(el) => (btnRefs.current[index] = el)}
                  onClick={() => setActiveTab(index)}
                  className={`cursor-pointer relative z-10 px-[14px] py-3 rounded-full whitespace-nowrap text-sm md:text-4 font-semibold uppercase transition-colors ${
                    activeTab === index ? "text-[#111111]" : "text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {showPaddles && activeTab > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#1F1F1F] w-12 h-8 flex items-center justify-center text-white"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            {showPaddles && activeTab < tabs.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-[#1F1F1F] w-12 h-8 flex items-center justify-center text-white"
              >
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
};

export default Ucarve;
