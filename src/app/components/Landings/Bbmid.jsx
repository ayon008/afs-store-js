"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

const Bbmid = () => {
    const container = useRef(null);

    const tabs = ["Carbon version", "Fiberglass version"];
    const [activeTab, setActiveTab] = useState(0);

    const navRef = useRef(null);
    const trackRef = useRef(null);
    const bgRef = useRef(null);
    const btnRefs = useRef([]);

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
            onComplete: () => {
                ScrollTrigger.refresh();
            },
        });
    };

    useLayoutEffect(() => {
        moveIndicator();
    }, [activeTab]);

    //GSAP Start from here for tab 1
    useLayoutEffect(() => {
        if (activeTab !== 0) return;

        const ctx = gsap.context(() => {
            ScrollTrigger.getAll().forEach((t) => t.kill());

            const mm = gsap.matchMedia();

            mm.add(
                {
                    desktop: "(min-width: 1024px)",
                    tablet: "(min-width: 768px) and (max-width: 1023px)",
                    mobile: "(max-width: 767px)",
                },
                (context) => {
                    const { desktop, tablet, mobile } = context.conditions;

                    // 🔹 Responsive helper (use everywhere)
                    const r = (d, t, m) => (desktop ? d : tablet ? t : m);

                    // 🔥 HERO → ABOUT
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: ".hero",
                                endTrigger: ".about",
                                start: "top top",
                                end: "center center",
                                scrub: true,
                                markers: false,
                            },
                        })
                        .fromTo(".hero-img", { scale: 1 }, { scale: 1.2 })
                        .fromTo(
                            ".hero-text",
                            { y: 0 },
                            { y: r(200, 140, 100), stagger: r(0.15, 0.12, 0.1) },
                            "<"
                        )
                        .fromTo(
                            ".about_right_p",
                            { y: 120 },
                            { y: 0, stagger: r(0.15, 0.12, 0.1) },
                            "<"
                        );

                    // 🔥 ABOUT 2
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: ".about_2",
                                start: "top bottom",
                                end: "center center",
                                scrub: true,
                                markers: false,
                            },
                        })
                        .to(".about_2_img", {
                            scale: 1.15,
                            transformOrigin: "center center",
                            ease: "none",
                        })
                        .fromTo(
                            ".about_red_p",
                            { y: 0 },
                            { y: r(-120, -80, -40), ease: "none" },
                            "<"
                        )
                        .fromTo(
                            ".about_2_P",
                            { y: r(160, 120, 200) },
                            { y: 0, stagger: r(0.15, 0.12, 0.1), ease: "none" },
                            "<+=0.3"
                        );

                    // Horizontal scroller
                    const wrapper = document.querySelector(".horizontal-wrapper");

                    let horizontalTween;

                    if (wrapper) {
                        const getScroll = () => wrapper.scrollWidth - window.innerWidth;

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
                                markers: true,
                            },
                        });

                        // 🔥 About 2 to Horizontal
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".horizontal-section",
                                    start: "top bottom",
                                    end: "center center",
                                    scrub: true,
                                    markers: false,
                                },
                            })

                            .fromTo(
                                ".about_2_last_p",
                                { y: 0 },
                                { y: r(120, 80, 40), ease: "none" },
                                "<+=.3"
                            )

                            .fromTo(
                                ".hori_h2",
                                { y: 0 },
                                {
                                    y: r(-120, -80, -40),
                                    stagger: r(0.15, 0.12, 0.1),
                                    ease: "none",
                                },
                                "<"
                            );

                        // Horizontal inner panel one to two
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".panel_one",
                                    containerAnimation: horizontalTween,
                                    start: "right right",
                                    end: "right left",
                                    scrub: true,
                                    markers: false,
                                },
                            })

                            .fromTo(
                                ".hori_last_p",
                                { x: 0 },
                                { x: r(160, 60, 40), ease: "none" },
                                "<"
                            )

                            .fromTo(
                                ".hori_two_p_tow",
                                { x: r(-160, -60, -40) },
                                { x: 0, ease: "none" },
                                "<"
                            );

                        // Horizontal inner panel tow to three
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".panel_inner_one",
                                    containerAnimation: horizontalTween,
                                    start: "right right",
                                    end: "right left",
                                    scrub: true,
                                    markers: false,
                                },
                            })

                            .fromTo(
                                ".panel_inner_two",
                                { x: r(-320, -120, 40) },
                                { x: 0, ease: "none" },
                                "<"
                            );

                        // expo_sec animation
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".expo_sec",
                                    start: "top bottom",
                                    end: "center center",
                                    scrub: true,
                                    markers: false,
                                },
                            })

                            .fromTo(".expo_img", { scale: 1.5 }, { scale: 1 }, "<")
                            .fromTo(".hori_two_p_tow_b", { y: 0 }, { y: -40 }, "<");

                        // expo_sec pin
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".expo_sec",
                                    start: "center center",
                                    end: "bottom center",
                                    scrub: true,
                                    pin: true,
                                    markers: false,
                                },
                            })

                            .fromTo(".expo_p", { y: 340 }, { y: 0 }, "<");

                        // expo_sec to although
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".although",
                                    start: "top bottom",
                                    end: "bottom bottom",
                                    scrub: true,
                                    markers: false,
                                },
                            })

                            .fromTo(".expo_p", { y: 0 }, { y: r(-80, -40, -20) }, "<")
                            .fromTo(".although_p", { y: -200 }, { y: 0 }, "<");

                        // although pin
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".although",
                                    start: "center center",
                                    end: "bottom top+=250",
                                    scrub: true,
                                    markers: false,
                                },
                            })

                            .fromTo(
                                ".although_img",
                                { y: 0 },
                                { y: "-80%", ease: "power1.out" },
                                "<"
                            );

                        // although to size chart
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".size_chart",
                                    start: "top bottom",
                                    end: "bottom bottom",
                                    scrub: true,
                                    markers: false,
                                },
                            })

                            .fromTo(
                                ".although_p",
                                { y: 0 },
                                { y: r(80, 40, 40), ease: "power1.out" },
                                "<"
                            );

                        // although to size chart
                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: ".size_box",
                                    start: "top bottom",
                                    end: "center center",
                                    scrub: true,
                                    markers: false,
                                },
                            })
                            .fromTo(".size_p", { y: -80 }, { y: 0, ease: "power1.out" }, "<")
                            .fromTo(
                                ".size_img_one",
                                { x: "15%" },
                                { x: 0, ease: "power1.out" },
                                "<"
                            )

                            .fromTo(
                                ".size_img_two",
                                { x: "-15%" },
                                { x: 0, ease: "power1.out" },
                                "<"
                            );
                    }
                }
            );

            ScrollTrigger.refresh();
        }, container);

        return () => ctx.revert();
    }, [activeTab]);

    // GSAP for tab 2 (responsive)
    useLayoutEffect(() => {
        if (activeTab !== 1) return;

        const ctx = gsap.context(() => {
            ScrollTrigger.getAll().forEach((t) => t.kill());

            const mm = gsap.matchMedia();

            mm.add(
                {
                    desktop: "(min-width: 1024px)",
                    tablet: "(min-width: 768px) and (max-width: 1023px)",
                    mobile: "(max-width: 767px)",
                },
                (context) => {
                    const { desktop, tablet, mobile } = context.conditions;

                    // 🔹 responsive helper (same as tab 1)
                    const r = (d, t, m) => (desktop ? d : tablet ? t : m);

                    // 🔥 HERO animation
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: ".hero_ii",
                                start: "top top",
                                end: "bottom top",
                                scrub: true,
                                markers: false,
                            },
                        })
                        .fromTo(
                            ".hero_ii_img",
                            {
                                scale: 1,
                                y: 0,
                            },
                            {
                                scale: 1.1,
                                y: r(220, 140, 120),
                                ease: "none",
                            }
                        );

                    // 🔥 HERO text entry
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: ".hero_ii_p_div",
                                start: "top bottom",
                                end: "center center",
                                scrub: true,
                                markers: false,
                            },
                        })
                        .fromTo(".hero_ii_p", { y: 40 }, { y: 0, ease: "none" })
                        .fromTo(".hero_ii_p_ii", { y: 80 }, { y: 0, ease: "none" }, 0);

                    gsap.utils.toArray(".about_ii_inner_i").forEach((item) => {
                        const img = item.querySelector(".about_ii_inner_i_img");
                        const p = item.querySelector(".about_ii_inner_i_p");

                        gsap
                            .timeline({
                                scrollTrigger: {
                                    trigger: item,
                                    start: "top bottom",
                                    end: "center center",
                                    scrub: true,
                                    markers: true,
                                },
                            })
                            .fromTo(img, { scale: 1 }, { scale: 1.2, ease: "none" }, 0)
                            .fromTo(p, { y: r(-40, -40, -20) }, { y: 0, ease: "none" }, 0);
                    });

                    // 🔥 HERO animation
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: ".key",
                                start: "top bottom",
                                end: "top center",
                                scrub: true,
                                markers: true,
                            },
                        })
                        .fromTo(
                            ".key_box",
                            {
                                y: r(200, 120, 60),
                            },
                            {
                                y: 0,
                                stagger: 0.1,
                                ease: "none",
                            }
                        );

                    // although to size chart
                    gsap
                        .timeline({
                            scrollTrigger: {
                                trigger: ".size_box",
                                start: "top bottom",
                                end: "center center",
                                scrub: true,
                                markers: false,
                            },
                        })
                        .fromTo(".size_p", { y: -80 }, { y: 0, ease: "power1.out" }, "<")
                        .fromTo(
                            ".size_img_one",
                            { x: "15%" },
                            { x: 0, ease: "power1.out" },
                            "<"
                        )

                        .fromTo(
                            ".size_img_two",
                            { x: "-15%" },
                            { x: 0, ease: "power1.out" },
                            "<"
                        );
                }
            );

            ScrollTrigger.refresh();
        }, container);

        return () => ctx.revert();
    }, [activeTab]);

    // Set GSAP after IMAGE get it's size
    const handleImageLoad = () => {
        ScrollTrigger.refresh();
    };

    //define i18n
    const t = useTranslations("blackBird");

    //DEFINE content

    //TAB 1
    //Hero content
    const heroContent = {
        title: t("Hero_t"),
        image: {
            src: "https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0006-4.png",
            width: 800,
            height: 600,
            alt: "BBML Graphic",
            className:
                "smooth hero-img h-[100vh] min-h-[100vh] lg:h-auto lg:min-h-auto object-cover",
            style: { width: "100%" },
        },
    };

    //About

    const aboutContent = {
        left: t("about_h"),
        right: {
            heading: "Version longue",
            intro: `Born from expertise developed in the world of downwind, the BlackBird Mid-Length pushes the boundaries of board design.`,
            details: [
                `By reinterpreting the principles of downwind boards to meet the demands of wingfoiling, we have created a board capable of combining quick take-off in light winds, exceptional glide, and maneuverability.`,
                `Inspired by the BlackBird, a true innovation in the downwind world, its optimized length-to-width ratio allows it to excel in light conditions or small swells, offering precise control and rapid take-off even with smaller foils.`,
            ],
        },
    };

    return (
        <div ref={container} className="overflow-hidden bg-[#000]">
            {/* ======================
          PAGE CONTENT
      ====================== */}
            {activeTab === 0 && (
                /* ======================
                  carbon version
              ====================== */
                <div className="smooth relative max-w-[1920px] mx-auto">
                    {/* Hero */}
                    <section className="smooth min-h-[100vh] hero relative">
                        <h2 className="text-[70px] md:text-[clamp(4.375rem,1.4647rem+6.0711vw,8.75rem)] text-white leading-[1] absolute top-20 global-padding z-1 hero-text">
                            {heroContent.title}
                        </h2>
                        <Image
                            src={heroContent.image.src}
                            width={heroContent.image.width}
                            height={heroContent.image.height}
                            alt={heroContent.image.alt}
                            className={heroContent.image.className}
                            style={heroContent.image.style}
                        />
                    </section>

                    {/* about */}
                    <section className="smooth about z-1 relative -mt-[20px] md:-mt-[20%] global-margin max-w-[1920px] global-padding mx-auto flex flex-col md:flex-row gap-[50px]">
                        {/* about left */}
                        <div className="about_red_p text-[#D44841] text-4 leading-[1.3] flex items-end w-full md:w-1/2 order-2 md:order-0">
                            <span className="max-w-[293px]">{aboutContent.left}</span>
                        </div>

                        {/* about right */}
                        <div className="about_right w-full md:w-1/2 flex flex-col gap-[50px]">
                            <h2 className="about_right_p font-bold uppercase text-white">
                                {aboutContent.right.heading}
                            </h2>
                            <p className="about_right_p text-[#FFFFFFCC] global-h1 leading-[1.1] font-bold">
                                {aboutContent.right.intro}
                            </p>
                            <p className="about_right_p max-w-[560px] text-[20px] flex flex-col gap-6 leading-[1.3] font-semibold text-[#FFFFFFCC]">
                                {aboutContent.right.details.map((detail, index) => (
                                    <span key={index}>{detail}</span>
                                ))}
                            </p>
                        </div>
                    </section>

                    {/* about two */}
                    <section className="smooth about_2 relative overflow-hidden bg-no-repeat bg-cover bg-center min-h-[calc(100vh-60px)] global-padding py-[120px]">
                        {/* Background wrapper */}
                        <div
                            className="about_2_img absolute inset-0 bg-center bg-cover"
                            style={{
                                backgroundImage:
                                    "url('https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0006-5.png')",
                            }}
                        ></div>
                        <div className="flex flex-col gap-[50px] max-w-[1195px]">
                            <h2 className="about_2_P text-white font-bold uppercase">
                                Ultra-Premium Carbon Construction
                            </h2>
                            <div className="about_2_P flex flex-col gap-[20px]">
                                <p className="text-white global-h1 !font-semibold">
                                    Continuing the legacy of our iconic BlackBird, the BlackBird
                                    Mid-Length embodies the essence of AFS Advanced expertise.
                                </p>
                                <div className="about_2_P pt-[30px] border-t-2 border-[#D44841] text-white flex flex-wrap gap-[clamp(1.5rem,-1.7227rem+6.7227vw,5rem)] max-w-[1060px] font-semibold leading-[1.3]">
                                    <p className="md:flex-[1] flex-[100%]">
                                        Featuring premium carbon construction and an innovative
                                        shape, this board pushes the limits of performance and
                                        innovation. Its design includes a highly optimized hull, the
                                        result of years of research and refinement on BlackBird
                                        shapes.
                                    </p>

                                    <p className="about_2_P about_2_last_p md:flex-[1] flex-[100%]">
                                        Manufactured in our French factory using cutting-edge
                                        technologies, the BlackBird Mid-Length achieves an
                                        unprecedented level of optimization, ensuring easy
                                        take-offs, excellent stability, and ultra-efficient glide.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* horiziontal section */}
                    <section className="horizontal-section relative overflow-hidden h-screen flex-nowrap ">
                        <div className="horizontal-wrapper flex h-full">
                            {/* horiziontal panel one */}
                            <div className="smooth panel panel_one flex-shrink-0 w-[100%] flex lg:justify-end justify-center flex flex-col gap-[50px] text-white text-left py-16 global-padding">
                                <h2 className="smooth hori_h2 uppercase text-4 font-bold leading-[1]">
                                    A Hybrid Experience Without Compromise
                                </h2>
                                <p className="smooth  hori_h2 global-h1">
                                    With the BlackBird Mid-Length, we aim to redefine the foiling
                                    experience by offering a compact yet ultra-efficient hybrid
                                    board.
                                </p>
                                <p className="smooth hori_h2 hori_last_p max-w-[655px] text-[20px] leading-[1.3] font-medium">
                                    A true crossover, it adapts to each of your sessions and
                                    disciplines with remarkable optimization. Every detail has
                                    been meticulously crafted to deliver maximum performance.
                                </p>
                            </div>
                            {/* horiziontal panel two */}
                            <div className="smooth panel panel_two flex-shrink-0 lg:w-[3638px] w-[2400px] flex items-center justify-center text-white text-4xl flex flex-nowrap py-10">
                                {/* horiziontal panel two div one*/}
                                <div className="smooth min-w-1/2 global-padding panel_inner_one relative z-1">
                                    <p className="smooth hori_two_p_tow pl-[20px] border-l border-l-[2px] border-l-[#D44841] max-w-[250px] text-[20px] text-[#FFFFFFCC] font-semibold ml-[75%] -mb-[60px] relative z-1">
                                        Enhanced pumping for immediate and efficient handling.
                                    </p>
                                    <Image
                                        src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_CF_0007-1.png"
                                        width={800}
                                        alt="BBML Graphic"
                                        height={600}
                                        style={{ width: "100%", height: "auto" }}
                                        className="smooth hori_img_one min-w-[100%] scale-[1] lg:scale-[1.2] filter drop-shadow-[5px_10px_24px_#0000001A] 
                    drop-shadow-[20px_39px_44px_#00000017]
                    drop-shadow-[44px_89px_59px_#0000000D]"
                                    />
                                    <p className="smooth hori_two_p_tow pl-[20px] border-l border-l-[2px] border-l-[#D44841] max-w-[250px] text-[20px] text-[#FFFFFFCC] font-semibold ml-[25%]">
                                        Refined deck plans for ergonomics and comfort that meet the
                                        expectations of the most demanding riders.
                                    </p>
                                </div>

                                <div className="smooth min-w-1/2 global-padding panel_inner_two">
                                    <p className="smooth pl-[20px] border-l border-l-[2px] border-l-[#D44841] max-w-[250px] text-[20px] text-[#FFFFFFCC] font-semibold ml-[75%] -mb-[120px] relative z-1">
                                        Inspired by the first generation of BlackBird (6'2 and 6'4),
                                        ahead of their time in their own right, true benchmarks in
                                        the Mid-Length board market.
                                    </p>
                                    <Image
                                        src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0007-2.png"
                                        width={800}
                                        alt="BBML Graphic"
                                        height={600}
                                        style={{ width: "100%", height: "auto" }}
                                        className="smooth min-w-[100%] scale-[1] lg:scale-[1.2] hori_img_two"
                                    />
                                    <p className="smooth pl-[20px] hori_two_p_tow_b border-l border-l-[2px] border-l-[#D44841] max-w-[250px] text-[20px] text-[#FFFFFFCC] font-semibold ml-[25%]">
                                        High-end construction synonymous with durability, stiffness
                                        and lightness.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Experience_section */}
                    <section className="smooth expo_sec lg:min-h-[calc(100vh-50px)] min-h-auto mt-[80px] flex flex-col lg:flex-row overflow-hidden">
                        <div className="lg:w-1/2 w-[100%] overflow-hidden">
                            <Image
                                src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0006-6.png"
                                width={800}
                                alt="BBML Graphic"
                                height={600}
                                style={{ width: "100%", height: "auto" }}
                                className="min-w-[100%] min-h-[100%] expo_img smooth object-cover"
                            />
                        </div>

                        <div className="smooth lg:w-1/2 w-full bg-[#F7F7F7] global-padding flex items-end py-10">
                            <h2 className="smooth expo_p max-w-[500px] text-[#111111] text-[20px] leading-[1.3] font-semibold">
                                This hybrid board opens up new possibilities with its
                                exceptional performance in light winds and its ability to take
                                off quickly and smoothly in mild conditions. Yet it's
                                aerodynamic design and optimized volume distribution also make
                                it a perfect supportive board in rougher weather.
                            </h2>
                        </div>
                    </section>

                    {/* Although designed */}
                    <section className="smooth although relative max-w-[1920px] global-padding flex min-h-[calc(100vh-50px)] mx-auto text-center text-white flex items-center font-bold flex-col global-margin overflow-hidden">
                        <h2 className="smooth although_p max-w-[960px] lg:mt-[40vh] mt-[25vh] relative z-1">
                            Although designed for advanced performance, the BlackBird
                            Mid-Length remains intuitive and accessible. Whether you are
                            passionate about downwind, a fan of high-performance SUP foiling,
                            or seeking thrills in wing foiling, parawing, or even surf foiling
                            in certain conditions, this board is designed to adapt to all
                            spots and conditions without compromise.
                        </h2>

                        <Image
                            src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0009-6.png"
                            width={800}
                            alt="BBML Graphic"
                            height={600}
                            className="smooth although_img w-[100%] max-w-[30vw] absolute lg:top-[50vh] top-[70vh] lg:scale-[1] scale-[1.5]"
                        />
                    </section>
                </div>
            )}

            {activeTab === 1 && (
                /* ======================
                  fiberglass version 
              ====================== */

                <div className="relative max-w-[1920px] mx-auto">
                    {/* HERO */}
                    <section className="hero_ii pb-[80px] lg:pb-[clamp(7.5rem,-1.3889rem+13.8889vw,12.5rem)] bg-[linear-gradient(268.11deg,_#000000_0%,_#1F1F1F_100%)]">
                        <Image
                            src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/FRONTTAIL-TRANSPARENT.png"
                            width={800}
                            height={600}
                            alt="BBML Graphic"
                            className="hero_ii_img object-cover mx-auto -mt-[12%]"
                            style={{ width: "75vw" }}
                        />
                        <div className="mx-auto text-white relative z-1 lg:-mt-[200px] mt-[0] flex flex-col gap-[50px] global-padding">
                            <h2 className="text-4 max-w-[300px] uppercase font-bold leading-[1.3]">
                                The performance, <br />
                                made accessible by AFS
                            </h2>
                            <p className="text-[clamp(3.125rem,-2.0543rem+10.8043vw,8.75rem)] font-semibold leading-[1]">
                                Smooth, stable, and endlessly enjoyable
                            </p>

                            <div className="hero_ii_p_div border-t border-t-[2] border-t-[#6CC9E6] flex flex-col lg:flex-row gap-[50px] pt-[50px] text-[22px] leading-[1.3] font-semibold text-[#FFFFFFCC]">
                                <p className="flex-1">
                                    The Blackbird has long been one of the standout innovations
                                    from our AFS Advanced Lab : a board loved for its glide,
                                    balance, and unmistakable feel.
                                </p>

                                <p className="hero_ii_p flex-1">
                                    This year, we wanted to bring that same magic to more riders.
                                    So we took the iconic mid-length shape and re-engineered it
                                    using our trusted{" "}
                                    <span className="text-white font-bold">
                                        PVC Sandwich Glass Construction
                                    </span>
                                    , creating a more accessible, more versatile version: the{" "}
                                    <span className="text-white font-bold">
                                        Blackbird Mid Length by AFS
                                    </span>
                                </p>

                                <p className="hero_ii_p_ii flex-1">
                                    Refreshed with a modern design and available in two colorways,
                                    it delivers the legendary Blackbird sensation across wingfoil,
                                    downwind, and SUP foil.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* about */}
                    <section className="about_ii global-margin">
                        {/* about inner one */}
                        <div className="about_ii_inner_i flex lg:text-[22px] text-4 leading-[1.3] font-semibold text-[#FFFFFFCC] text-center flex-col md:flex-row">
                            <div className="flex-1 overflow-hidden">
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/DSC01362-Recupere-2.png"
                                    width={800}
                                    height={600}
                                    alt="BBML Graphic"
                                    style={{ width: "100%" }}
                                    className="about_ii_inner_i_img"
                                />
                            </div>
                            <div className="flex items-center justify-center flex-1 overflow-hidden">
                                <p className="about_ii_inner_i_p max-w-[600px] p-[40px]">
                                    The{" "}
                                    <span className="text-[#6CC9E6]">Blackbird Mid Length </span>
                                    transfers the proven hydrodynamics of the AFS Advanced
                                    Blackbird into a more accessible construction.
                                </p>
                            </div>
                        </div>

                        {/* about inner two */}
                        <div className="about_ii_inner_i flex lg:text-[22px] text-4 leading-[1.3] font-semibold text-[#FFFFFFCC] text-center flex-col md:flex-row bg-[#111111]">
                            <div className="flex-1 overflow-hidden">
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/DSC01362-Recupere-3.png"
                                    width={800}
                                    height={600}
                                    alt="BBML Graphic"
                                    style={{ width: "100%" }}
                                    className="about_ii_inner_i_img"
                                />
                            </div>
                            <div className="flex items-center justify-center flex-1 overflow-hidden">
                                <p className="max-w-[600px] p-[40px]">
                                    Built in{" "}
                                    <span className="text-[#6CC9E6]">PVC Sandwich Glass </span>,
                                    it retains the original’s mid-length outline for early
                                    takeoff, linear acceleration, optimized pitch balance, and
                                    efficient pumping. <br /> <br />
                                    The hybrid design makes it suitable for
                                    <span className="text-[#6CC9E6]">
                                        wingfoil, parawing, SUP foil and surf foil{" "}
                                    </span>
                                    with volumes from 80L to 100L and sizes from 5'6 to 6'3.
                                </p>
                            </div>
                        </div>

                        {/* about inner three */}
                        <div className="about_ii_inner_i flex lg:text-[22px] text-4 leading-[1.3] font-semibold text-[#FFFFFFCC] text-center flex-col md:flex-row bg-[#1F1F1F]">
                            <div className="flex-1 overflow-hidden">
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/Frame-65.png"
                                    width={800}
                                    height={600}
                                    alt="BBML Graphic"
                                    style={{ width: "100%" }}
                                    className="about_ii_inner_i_img"
                                />
                            </div>
                            <div className="flex items-center justify-center flex-1 overflow-hidden">
                                <p className="max-w-[600px] p-[40px]">
                                    A modern redesign and{" "}
                                    <span className="text-[#6CC9E6]">two color </span>options
                                    complete a board engineered for intuitive performance and
                                    multi-discipline efficiency.
                                </p>
                            </div>
                        </div>
                    </section>
                    {/* key sec */}
                    <section className="key global-margin global-padding space-y-[60px]">
                        <h2 className="global-h2 text-center text-white">Key features</h2>
                        {/* key main  */}
                        <div className="text-[#FFFFFFCC] flex gap-[20px] flex-wrap justify-center">
                            {/* box one */}
                            <div className="key_box lg:flex-[1] flex-[320px_0_0] min-h-[220px] bg-[#1F1F1F] rounded p-[20px] flex flex-col justify-between gap-4">
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M14.2745 29.3332C9.99917 15.9998 13.3325 2.6665 15.9992 2.6665C18.6658 2.6665 21.9992 15.9998 17.7239 29.3332H14.2745Z"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <path
                                        d="M16 26.1959V23.0586"
                                        stroke="white"
                                        stroke-opacity="0.6"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                </svg>
                                <p className="text-[20px] font-semibold leading-[1.3]">
                                    Same iconic{" "}
                                    <span className="text-[#6CC9E6]">
                                        mid-length Blackbird shape
                                    </span>
                                </p>
                            </div>
                            {/* box two */}
                            <div className="key_box lg:flex-[1] flex-[320px_0_0] min-h-[220px] bg-[#1F1F1F] rounded p-[20px] flex flex-col justify-between gap-4">
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M22.599 16C22.599 14.1776 21.8603 12.5276 20.666 11.3333"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M16.0176 22.5985C17.84 22.5985 19.4899 21.8598 20.6843 20.6655"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M9.41661 16.0161C9.41661 17.8386 10.1553 19.4885 11.3496 20.6828"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M16 9.4171C14.1776 9.4171 12.5276 10.1558 11.3333 11.3501"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                    <rect
                                        x="2.66602"
                                        y="16"
                                        width="7.54248"
                                        height="7.54248"
                                        transform="rotate(-45 2.66602 16)"
                                        stroke="#A5A5A5"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <rect
                                        x="10.666"
                                        y="24"
                                        width="7.54248"
                                        height="7.54248"
                                        transform="rotate(-45 10.666 24)"
                                        stroke="#A5A5A5"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <rect
                                        x="10.666"
                                        y="8"
                                        width="7.54248"
                                        height="7.54248"
                                        transform="rotate(-45 10.666 8)"
                                        stroke="#A5A5A5"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <rect
                                        x="18.666"
                                        y="16"
                                        width="7.54248"
                                        height="7.54248"
                                        transform="rotate(-45 18.666 16)"
                                        stroke="#A5A5A5"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <path
                                        d="M20.6637 11.3417C19.375 10.053 17.686 9.40866 15.997 9.40866"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M11.3421 11.3534C10.0535 12.642 9.40915 14.331 9.40915 16.0201"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M11.3539 20.674C12.6425 21.9626 14.3315 22.607 16.0205 22.607"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M20.6754 20.6627C21.9641 19.3741 22.6084 17.6851 22.6084 15.9961"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                    />
                                </svg>

                                <p className="text-[20px] font-semibold leading-[1.3]">
                                    Hybrid board designed for{" "}
                                    <span className="text-[#6CC9E6]">
                                        Wingfoil / Parawing / SUP Foil / Surf Foil
                                    </span>
                                </p>
                            </div>
                            {/* box three */}
                            <div className="key_box lg:flex-[1] flex-[320px_0_0]  min-h-[220px] bg-[#1F1F1F] rounded p-[20px] flex flex-col justify-between gap-4">
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5.33398 10.5693C8.88954 6.57079 12.4451 7.74104 16.0007 10.6667C19.5562 13.5923 23.1118 14.7625 26.6673 10.764"
                                        stroke="white"
                                        stroke-opacity="0.6"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M5.33398 21.2358C8.88954 17.2373 12.4451 18.4075 16.0007 21.3332C19.5562 24.2588 23.1118 25.429 26.6673 21.4305"
                                        stroke="white"
                                        stroke-opacity="0.6"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M5.33398 15.9028C8.88954 11.9043 12.4451 13.0745 16.0007 16.0002C19.5562 18.9258 23.1118 20.096 26.6673 16.0975"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>

                                <p className="text-[20px] font-semibold leading-[1.3]">
                                    <span className="text-[#6CC9E6]">Smooth</span> takeoff,{" "}
                                    <span className="text-[#6CC9E6]">balanced</span> stance, and{" "}
                                    <span className="text-[#6CC9E6]">natural</span> carving feel
                                </p>
                            </div>
                            {/* box four */}
                            <div className="key_box lg:flex-[1] flex-[320px_0_0]  min-h-[220px] bg-[#1F1F1F] rounded p-[20px] flex flex-col justify-between gap-4">
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5.33398 21.3335L16.0007 26.6668L26.6673 21.3335"
                                        stroke="white"
                                        stroke-opacity="0.6"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <path
                                        d="M5.33398 16L16.0007 21.3333L26.6673 16"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <path
                                        d="M16.0007 5.3335L5.33398 10.6668L16.0007 16.0002L26.6673 10.6668L16.0007 5.3335Z"
                                        stroke="white"
                                        stroke-opacity="0.6"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                </svg>

                                <p className="text-[20px] font-semibold leading-[1.3]">
                                    <span className="text-[#6CC9E6]">
                                        PVC Sandwich Glass Construction
                                    </span>{" "}
                                    for durability & lightweight performance
                                </p>
                            </div>
                            {/* box five */}
                            <div className="key_box lg:flex-[1] flex-[320px_0_0]  min-h-[220px] bg-[#1F1F1F] rounded p-[20px] flex flex-col justify-between gap-4">
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5.33398 28.0366C5.55659 14.1826 9.35826 4.03662 12.6394 4.03662C13.119 4.03662 13.6098 4.25339 14.0988 4.66683"
                                        stroke="white"
                                        stroke-opacity="0.6"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                    <path
                                        d="M12 27.9707C12.2234 14.1547 16.0394 4.03662 19.3328 4.03662C22.6315 4.03662 26.4543 14.1869 26.6667 28.0366"
                                        stroke="#6CC9E6"
                                        stroke-width="1.5"
                                        stroke-linecap="square"
                                    />
                                </svg>

                                <p className="text-[20px] font-semibold leading-[1.3]">
                                    Fresh AFS design +{" "}
                                    <span className="text-[#6CC9E6]">
                                        two color options: Red or Blue
                                    </span>
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <div
                ref={navRef}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 overflow-hidden rounded-full bg-[#1F1F1F]"
            >
                <div
                    ref={bgRef}
                    className="absolute top-0 left-0 bg-white rounded-full z-0"
                />

                <div ref={trackRef} className="flex min-w-100%">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab}
                            ref={(el) => (btnRefs.current[index] = el)}
                            onClick={() => {
                                setActiveTab(index);
                                window.scrollTo({ top: 0, behavior: "auto" });
                            }}
                            className={`cursor-pointer relative z-10 px-5 py-3 rounded-full text-sm font-semibold uppercase transition-colors ${activeTab === index ? "text-black" : "text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sized chart */}
            <section className="smooth size_chart global-padding max-w-[1920px] mx-auto text-white global-margin flex flex-col gap-[20px]">
                <h2 className="smooth size_p uppercase text-4 font-bold leading-[1]">
                    Technical Info
                </h2>
                {/* item_listt */}
                <div className="smooth flex justify-between gap-[20px] text-center">
                    {/* Frame 75 */}
                    <div className="smooth grid grid-cols-2 lg:gap-[90px] gap-10 text-center md:grid-cols-4 justify-between w-[100%]">
                        {/* spec_item 1*/}
                        <div className="smooth size_box flex flex-col gap-10 flex-[1_0_0] max-w-[320px]">
                            <div className="smooth flex items-center justify-center">
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_CF_0009.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="size_img_one -mr-[15%]"
                                />
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0009-9.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="size_img_two -ml-[15%]"
                                />
                            </div>

                            <div className="smooth flex flex-col gap-[5px] items-center">
                                <h3 className="smooth text-white lg:text-[18px] text-[16px] leading-[1] font-bold uppercase">
                                    BlackBird Mid-Length
                                </h3>
                                <p className="smooth text-[#FFFFFF99] lg:text-[20px] text-[18px] leading-[1] font-bold uppercase">
                                    6.3*22.5*100 L
                                </p>
                            </div>
                        </div>

                        {/* spec_item 1*/}
                        <div className="smooth size_box flex flex-col gap-10 flex-[1_0_0] max-w-[320px]">
                            <div className="smooth flex items-center justify-center">
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_CF_0009.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="smooth size_img_one -mr-[15%]"
                                />
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0009-9.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="smooth size_img_two -ml-[15%]"
                                />
                            </div>

                            <div className="smooth flex flex-col gap-[5px] items-center">
                                <h3 className="smooth text-white lg:text-[18px] text-[16px] leading-[1] font-bold uppercase">
                                    BlackBird Mid-Length
                                </h3>
                                <p className="smooth text-[#FFFFFF99] lg:text-[20px] text-[18px leading-[1] font-bold uppercase">
                                    6.3*22.5*100 L
                                </p>
                            </div>
                        </div>

                        {/* spec_item 1*/}
                        <div className="smooth size_box flex flex-col gap-10 flex-[1_0_0] max-w-[320px]">
                            <div className="flex items-center justify-center">
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_CF_0009.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="smooth size_img_one -mr-[15%]"
                                />
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0009-9.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="smooth size_img_two -ml-[15%]"
                                />
                            </div>

                            <div className="smooth flex flex-col gap-[5px] items-center">
                                <h3 className="smooth text-white lg:text-[18px] text-[16px] leading-[1] font-bold uppercase">
                                    BlackBird Mid-Length
                                </h3>
                                <p className="smooth text-[#FFFFFF99] lg:text-[20px] text-[18px leading-[1] font-bold uppercase">
                                    6.3*22.5*100 L
                                </p>
                            </div>
                        </div>

                        {/* spec_item 1*/}
                        <div className="smooth size_box flex flex-col gap-10 flex-[1_0_0] max-w-[320px]">
                            <div className="smooth flex items-center justify-center">
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_CF_0009-2.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="smooth size_img_one -mr-[15%]"
                                />
                                <Image
                                    src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/PP_BB_B_0009-10.png"
                                    width={800}
                                    alt="BBML Graphic"
                                    height={600}
                                    style={{ width: "100%", height: "auto" }}
                                    className="smooth size_img_two -ml-[15%]"
                                />
                            </div>

                            <div className="smooth flex flex-col gap-[5px] items-center">
                                <h3 className="smooth text-white lg:text-[18px] text-[16px] leading-[1] font-bold uppercase">
                                    BlackBird Mid-Length
                                </h3>
                                <p className="smooth text-[#FFFFFF99] lg:text-[20px] text-[18px leading-[1] font-bold uppercase">
                                    6.3*22.5*100 L
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Bbmid;