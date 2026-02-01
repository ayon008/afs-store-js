/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useLayoutEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const uCarve130Specs = [
    { label: "Surface", value: "130 cm2" },
    { label: "Envergure", value: "360 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: "Corde maximum", value: "68" },
    { label: "Epaisseur maximum", value: "5" },
    {
        label: "Construction",
        value: "HR Carbone + HM Carbone / Monolithique",
    },
    { label: "Taille des vis", value: "12mm Torx 30" },
];

const uCarve140Specs = [
    { label: "Surface", value: "140 cm2" },
    { label: "Envergure", value: "375 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: "Corde maximum", value: "72" },
    { label: "Epaisseur maximum", value: "5" },
    {
        label: "Construction",
        value: "HR Carbone + HM Carbone / Monolithique",
    },
    { label: "Taille des vis", value: "12mm Torx 30" },
];

const uCarve150Specs = [
    { label: "Surface", value: "150 cm2" },
    { label: "Envergure", value: "390 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: "Corde maximum", value: "76" },
    { label: "Epaisseur maximum", value: "5" },
    {
        label: "Construction",
        value: "HR Carbone + HM Carbone / Monolithique",
    },
    { label: "Taille des vis", value: "12mm Torx 30" },
];

const uCarve160Specs = [
    { label: "Surface", value: "160 cm2" },
    { label: "Envergure", value: "400 mm" },
    { label: "Aspect ratio", value: "10" },
    { label: "Corde maximum", value: "80" },
    { label: "Epaisseur maximum", value: "5" },
    {
        label: "Construction",
        value: "HR Carbone + HM Carbone / Monolithique",
    },
    { label: "Taille des vis", value: "12mm Torx 30" },
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

const Ucarve = () => {
    const container = useRef(null);
    const imagesLoaded = useRef(0);
    const [allImagesLoaded, setAllImagesLoaded] = useState(false);

    // const handleImageLoad = () => {
    //     ScrollTrigger.refresh();
    // };

    const contentRef = useRef(null);

    const tabs = ["U carve 130", "U carve 140", "U carve 150", "U carve 160"];

    const [activeTab, setActiveTab] = useState(0);
    const [showPaddles, setShowPaddles] = useState(false);

    const navRef = useRef(null);
    const trackRef = useRef(null);
    const bgRef = useRef(null);
    const btnRefs = useRef([]);
    const xRef = useRef(0);

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

    //define i18n
    const t = useTranslations("ucarve");
    /* ----------------------------------------
       FLOW content
    ---------------------------------------- */
    const flowSections = [
        {
            imageSrc:
                "https://api.afs-foiling.com/wp-content/uploads/2026/02/DSC01362-Recupere.png",
            imageAlt: "AFS U Carve Stabilizer",
            text: t("flow_h_I"),
            reverse: false,
        },
        {
            imageSrc:
                "https://api.afs-foiling.com/wp-content/uploads/2026/02/DSC01362-Recupere-1.png",
            imageAlt: "Low speed performance",
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
        subtitle: "Available sizes",
        title: "The U Carve range comes in 130, 140, 150, and 160, ",
        titleEmphasis:
            "each with specific outlines. The sweep angle evolves according to the level of pivot you want:",
        description: [
            "The 160, with a straighter outline, delivers tighter turns and excellent maneuverability in small conditions, while the smaller sizes, with increased sweep, offer more drive and stability in faster, more open lines.",
            "Each rider can choose the exact model that best suits their weight, style, and preferred conditions.",
        ],
    };

    useGSAP(() => {
        if (!contentRef.current) return;
        const mm = gsap.matchMedia();

        mm.add(
            {
                desktop: "(min-width: 1024px)",
                tablet: "(min-width: 768px) and (max-width: 1023px)",
                mobile: "(max-width: 767px)",
            },
            (context) => {
                const { desktop, tablet, mobile } = context.conditions;

                // 🔹 Responsive helper
                const r = (d, t, m) => (desktop ? d : tablet ? t : m);

                const heroImg = container.current.querySelector(".hero_center_img");
                const aboutTarget = container.current.querySelector(".about_target");

                if (!heroImg || !aboutTarget) return;

                requestAnimationFrame(() => {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: ".hero",
                            start: "top top",
                            endTrigger: ".about",
                            end: "top center",
                            scrub: true,
                            markers: false,
                        },
                    });

                    tl.to(heroImg, {
                        y: () => {
                            const heroRect = heroImg.getBoundingClientRect();
                            const targetRect = aboutTarget.getBoundingClientRect();
                            const scrollTop = window.scrollY || window.pageYOffset;

                            const heroCenterY =
                                heroRect.top + heroRect.height / 1.5 + scrollTop;
                            const targetHeight = targetRect.height || heroRect.height;
                            const targetCenterY =
                                targetRect.top + targetHeight / 2 + scrollTop;

                            return targetCenterY - heroCenterY;
                        },

                        x: () => {
                            const heroRect = heroImg.getBoundingClientRect();
                            const targetRect = aboutTarget.getBoundingClientRect();
                            const scrollLeft = window.scrollX || window.pageXOffset;

                            const heroCenterX =
                                heroRect.left + heroRect.width / 2 + scrollLeft;
                            const targetCenterX =
                                targetRect.left + targetRect.width / 2 + scrollLeft;

                            return targetCenterX - heroCenterX;
                        },

                        rotate: -10,
                        width: () => `${aboutTarget.getBoundingClientRect().width}px`,
                        scale: 1,
                        transformOrigin: "center center",
                        opacity: 1,
                        ease: "power1.inOut",
                    });

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
                            { x: 0, opacity: 1, stagger: 0.1 },
                            "<"
                        )
                        .fromTo(
                            ".about_p",
                            { y: 200, opacity: 0 },
                            { y: 0, opacity: 1, stagger: 0.2 },
                            "<"
                        );

                    /* HERO → ABOUT SCROLL images */
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
                        .fromTo(".about_img_I", { x: "-200%" }, { x: 0 }, "<")
                        .fromTo(".about_img_III", { x: "100%" }, { x: 0 }, "<")
                        .fromTo(".about_img_IIII", { x: "200%" }, { x: 0 }, "<");

                    /* Flow entry */
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: ".about",
                                start: "center center",
                                end: "center top",
                                scrub: true,
                                markers: false,
                            },
                        })
                        .fromTo(".flow", { y: r(400, 200, 120) }, { y: 0 }, "<");

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
                        .to(".flow_img_one", { scale: 1.5, ease: "power1.inOut" }, "<");

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

                        .fromTo(".whole_p", { x: r(-40, -20, -20) }, { x: 0 }, "<")
                        .fromTo(
                            ".whole_h",
                            { y: r(40, 20, 20), opacity: 0.5 },
                            { y: 0, opacity: 1 },
                            "<"
                        );

                    /* size entry */
                    gsap.timeline({
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
                            { x: 0, y: 0 },
                            "<"
                        )
                        .fromTo(
                            ".sizes_img_II",
                            { x: r(-60, -20, -20), y: r(40, 20, 20) },
                            { x: 0, y: 0 },
                            "<"
                        )
                        .fromTo(
                            ".sizes_img_III",
                            { x: r(-80, -20, -20), y: r(40, 20, 20) },
                            { x: 0, y: 0 },
                            "<"
                        )
                        .fromTo(
                            ".sizes_img_IIII",
                            { x: r(-100, -20, -20), y: r(40, 20, 20) },
                            { x: 0, y: 0 },
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

                        .to(".sizes_inner", { rotate: -30 }, "<")
                        .fromTo(".sizes_img_I", { y: 0 }, { y: 40 }, "<")
                        .fromTo(".sizes_img_II", { y: 0 }, { y: 80 }, "<")
                        .fromTo(".sizes_img_III", { y: 0 }, { y: 120 }, "<")
                        .fromTo(".sizes_img_IIII", { y: 0 }, { y: 160 }, "<");

                    ScrollTrigger.refresh();
                });
            }
        );

        // Cleanup on unmount
        return () => mm.revert();
    });


    const handleImageLoad = () => {
        imagesLoaded.current += 1;
        const allImages = container.current.querySelectorAll("img");
        if (imagesLoaded.current >= allImages.length) {
            setAllImagesLoaded(true);
        }
    };

    return (
        <div className="bg-[#000]" ref={contentRef}>
            <div ref={container} className="overflow-hidden max-w-[1920px] mx-auto">
                {/*hero*/}
                <section className="relative hero smooth relative global-padding global-margin">
                    {/*hero top*/}
                    <div className="pt-20 pb-10 flex flex-col flex-wrap items-center gap-[24px] text-center text-[16px] md:text-[20px]">
                        <h3 className="text-[#FFFFFF99] leading-[1] font-bold uppercase">
                            {t("hero_p")}
                        </h3>
                        <h2 className="text-[clamp(4.375rem,1.4647rem+6.0711vw,8.75rem)] text-white leading-[1]">
                            {t("hero_h")}
                        </h2>
                        <p className="text-[#FFFFFF99] leading-[1.3] font-semibold max-w-[531px]">
                            {t("hero_p_II")}
                        </p>
                    </div>

                    {/* center hero img */}
                    <div className="hero_img_wrapper flex-1 flex items-center justify-center mt-10 -mb-[7.5%]">
                        <div className="hero-img relative scale-[1.2] overflow-hidden flex justify-center hero_center_img after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:bg-inherit after:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_100%)] after:filter after:blur-[12px]">
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave150_0001-1.png"
                                alt="AFS U Carve Stabilizer"
                                className="max-w-full h-auto opacity-[.9]"
                                onLoad={handleImageLoad}
                            />
                        </div>
                    </div>

                    {/* bottom/absolute div */}
                    <div className="relative hero_text z-1 space-y-[32px]">
                        <h3 className="global-h1 !font-semibold text-white">
                            {t("hero_bottom_p")}
                        </h3>
                        <div className="flex flex-wrap md:flex-nowrap gap-10 lg:text-[18px] text-[16px] text-[#FFFFFFCC] font-semibold leading-[130%]">
                            <p className="smooth hero_p pl-4 border-l border-l-[2px] border-l-[#FFFFFF80]">
                                {t("hero_row_p_I")}
                            </p>
                            <p className="smooth hero_p pl-4 border-l border-l-[2px] border-l-[#FFFFFF80]">
                                {t("hero_row_p_II")}
                            </p>
                            <p className="smooth hero_p pl-4 border-l border-l-[2px] border-l-[#FFFFFF80]">
                                {t("hero_row_p_III")}
                            </p>
                        </div>
                    </div>
                </section>

                {/*about*/}
                <section className="about smooth relative mb-20">
                    <div className="relative z-1 max-w-[655px] mx-auto text-center space-y-[25px] global-padding">
                        <h2 className="about_p global-h2 text-white">{t("about_h")}</h2>
                        <p className="about_p smooth max-w-[531px] mx-auto text-[#FFFFFF99] leading-[1.3] font-semibold max-w-[531px] text-[16px] md:text-[20px]">
                            {t("about_p")}
                        </p>
                    </div>
                    {/*about content*/}
                    <div
                        className="relative flex -space-x-[16%] transform -rotate-10 scale-[1.2] opacity-[0.8] -mt-[7.5%]
                after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-black/40 after:z-[10] "
                    >
                        {/*about img 1*/}
                        <div className="about_img_I relative z-[4] hero-img relative overflow-hidden flex-1">
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave160_0001-3.png"
                                alt="AFS U Carve Stabilizer"
                                // width={1920}
                                // height={1080}
                                className="max-w-full h-auto opacity-[1]"
                                onLoad={handleImageLoad}
                            />
                        </div>
                        {/*about img 2 empty*/}
                        <div className="relative z-[3] hero-img relative overflow-hidden flex justify-center flex-1 about_target"></div>
                        {/*about img 3*/}
                        <div className="about_img_III relative z-[2] hero-img relative overflow-hidden flex-1">
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave140_0001-2.png"
                                alt="AFS U Carve Stabilizer"
                                // width={1920}
                                // height={1080}
                                className="max-w-full h-auto opacity-[1]"
                                onLoad={handleImageLoad}
                            />
                        </div>
                        {/*about img 4*/}
                        <div className="about_img_IIII hero-img relative overflow-hidden flex justify-center flex-1">
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave130_0001-2.png"
                                alt="AFS U Carve Stabilizer"
                                // width={1920}
                                // height={1080}
                                className="max-w-full h-auto opacity-[1]"
                                onLoad={handleImageLoad}
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
                                className={`flex-1 overflow-hidden ${item.reverse ? "order-2 md:order-2" : ""
                                    }`}
                            >
                                <img
                                    src={item.imageSrc}
                                    alt={item.imageAlt}
                                    // width={600}
                                    // height={600}
                                    className={`${index === 0 ? "flow_img_one" : ""} ${index === 1 ? "flow_img_one" : ""
                                        } ${item.reverse ? "order-2 md:order-2" : ""}`}
                                    style={{ width: "100%", height: "auto" }}
                                    loading="lazy"
                                    onLoadingComplete={handleImageLoad}
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
                <section className="whole global-padding py-30 mx-auto flex flex-col lg:flex-row gap-[clamp(1.5rem,-5.1756rem+13.9256vw,8.75rem)]">
                    <h2 className="whole_p text-4 text-[#FFFFFF99] font-bold leading-[110%] md:flex-[200px_0_0] pt-0 lg:pt-4">
                        {challengeContent.label}
                    </h2>

                    <p className="whole_h global-h1 !font-normal text-white flex-1 !leading-[1]">
                        {challengeContent.text}
                    </p>
                </section>

                {/*Available sizes*/}
                <section className="sizes bg-[#111111] overflow-hidden mb-30">
                    <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
                        {/* Images */}
                        <div
                            className="sizes_inner flex flex-col mt-20 -translate-x-[20%] scale-[1.2]"
                            style={{ transform: "rotate(-15deg)" }}
                        >
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave160_0001-1.png"
                                alt="AFS U Carve Stabilizer"
                                // width={1920}
                                // height={1080}
                                className="sizes_img_I -mb-[32px] lg:-mb-[90px] md:-mb-[40px] z-[4] drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                                onLoad={handleImageLoad}
                            />
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave150_0001-3.png"
                                alt="AFS U Carve Stabilizer"
                                // width={1920}
                                // height={1080}
                                className="sizes_img_II -mb-[32px] lg:-mb-[80px] md:-mb-[40px] z-[3] drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                                onLoad={handleImageLoad}
                            />
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave140_0001-2.png"
                                alt="AFS U Carve Stabilizer"
                                // width={1920}
                                // height={1080}
                                className="sizes_img_III -mb-[32px] lg:-mb-[70px] md:-mb-[40px] z-[2] drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                                onLoad={handleImageLoad}
                            />
                            <img
                                src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave130_0001-2.png"
                                alt="AFS U Carve Stabilizer"
                                // width={1920}
                                // height={1080}
                                className="sizes_img_IIII drop-shadow-[5px_10px_15px_rgba(0,0,0,0.1)_2px_5px_10px_rgba(0,0,0,0.05)]"
                                onLoad={handleImageLoad}
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

                {/*Technical information section*/}
                <section className="relative global-padding max-w-[1440px] mx-auto mb-30">
                    <h2 className="global-h2 text-center text-white mb-20">
                        Technical information
                    </h2>

                    {/* Content */}
                    <div className="text-white">
                        {activeTab === 0 && (
                            <div className="relative flex flex-col">
                                <div className="bg-[#00000033] blur-20 p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                                    <h3 className="text-[28px] leading-[100%] font-semibold">
                                        U carve 130
                                    </h3>

                                    <SpecsTable data={uCarve130Specs} />
                                </div>

                                <div className="relative md:absolute lg:absolute right-0 top-20 pb-[40px] md:pb-0">
                                    <img
                                        src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/ucrave130_0001-1-1.png"
                                        alt="AFS U Carve Stabilizer"
                                        loading="lazy"
                                        // width={1000}
                                        // height={1000}
                                        style={{ height: "auto", width: "100%" }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="relative">
                                <div className="bg-[#00000033] blur-20 p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                                    <h3 className="text-[28px] leading-[100%] font-semibold">
                                        U carve 140
                                    </h3>

                                    <SpecsTable data={uCarve140Specs} />
                                </div>

                                <div className="relative md:absolute lg:absolute right-0 top-20 pb-[40px] md:pb-0">
                                    <img
                                        src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave140_0001-2.png"
                                        alt="AFS U Carve Stabilizer"
                                        loading="lazy"
                                        // width={1000}
                                        // height={1000}
                                        style={{ height: "auto", width: "100%" }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div className="relative">
                                <div className="bg-[#00000033] blur-20 p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                                    <h3 className="text-[28px] leading-[100%] font-semibold">
                                        U carve 150
                                    </h3>

                                    <SpecsTable data={uCarve150Specs} />
                                </div>

                                <div className="relative md:absolute lg:absolute right-0 top-20 pb-[40px] md:pb-0">
                                    <img
                                        src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave150_0001-3.png"
                                        alt="AFS U Carve Stabilizer"
                                        loading="lazy"
                                        // width={1000}
                                        // height={1000}
                                        style={{ height: "auto", width: "100%" }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 3 && (
                            <div className="relative">
                                <div className="bg-[#00000033] blur-20 p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                                    <h3 className="text-[28px] leading-[100%] font-semibold">
                                        U carve 160
                                    </h3>

                                    <SpecsTable data={uCarve160Specs} />
                                </div>

                                <div className="relative md:absolute lg:absolute right-0 top-20 pb-[40px] md:pb-0">
                                    <img
                                        src="https://api.afs-foiling.com/wp-content/uploads/2026/02/ucrave160_0001-2-1.png"
                                        alt="AFS U Carve Stabilizer"
                                        loading="lazy"
                                        // width={1000}
                                        // height={1000}
                                        style={{ height: "auto", width: "100%" }}
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
                                    className={`cursor-pointer relative z-10 px-[14px] py-3 rounded-full whitespace-nowrap text-sm md:text-4 font-semibold uppercase transition-colors ${activeTab === index ? "text-[#111111]" : "text-white"
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
        </div>
    );
};

export default Ucarve;
