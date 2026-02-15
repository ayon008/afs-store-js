"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import SmoothScroll from "@/app/components/SmoothScroll";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

gsap.registerPlugin(ScrollTrigger);

const Uglide = () => {
  //define i18n
  const t = useTranslations("Uglide");
  const g = useTranslations("productDimension");
  const container = useRef(null);

  // slider define
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = [
    {
      id: 1,
      title: "Enduro",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-1.png",
    },
    {
      id: 2,
      title: "Silk",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-3.png",
    },
    {
      id: 3,
      title: "Ultra Ha",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-4.png",
    },
    {
      id: 4,
      title: "Enduro",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-1.png",
    },
    {
      id: 5,
      title: "Silk",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-3.png",
    },
    {
      id: 6,
      title: "Ultra Ha",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-4.png",
    },

    {
      id: 7,
      title: "Enduro",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-1.png",
    },
    {
      id: 8,
      title: "Silk",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-3.png",
    },
    {
      id: 9,
      title: "Ultra Ha",
      image:
        "https://api.afs-foiling.com/wp-content/uploads/2026/02/Group-5-4.png",
    },
  ];

  const tabs = ["U-Glide-39", "U-Glide-41", "U-Glide-43"];

  const [activeTab, setActiveTab] = useState(0);
  const [showPaddles, setShowPaddles] = useState(false);

  const navRef = useRef(null);
  const trackRef = useRef(null);
  const bgRef = useRef(null);
  const btnRefs = useRef([]);
  const xRef = useRef(0);

  const goPrev = () => setActiveTab((i) => Math.max(0, i - 1));
  const goNext = () => setActiveTab((i) => Math.min(tabs.length - 1, i + 1));

  const UGlide39 = [
    { label: g("Surface"), value: "113 cm²" },
    { label: "Aspect Ratio", value: "13.9" },
    { label: g("Thickness"), value: "4.5 mm" },
    {
      label: g("Materials"),
      value: g("modulus"),
    },
    { label: g("Best"), value: "Downwind, glide" },
  ];

  const UGlide41 = [
    { label: g("Surface"), value: "123 cm²" },
    { label: "Aspect Ratio", value: "13.8" },
    { label: g("Thickness"), value: "5 mm" },
    {
      label: g("Materials"),
      value: g("modulus"),
    },
    { label: g("Best"), value: "Downwind, glide" },
  ];

  const UGlide43 = [
    { label: g("Surface"), value: "133 cm²" },
    { label: "Aspect Ratio", value: "13.7" },
    { label: g("Thickness"), value: "5 mm" },
    {
      label: g("Materials"),
      value: g("modulus"),
    },
    { label: g("Best"), value: "Downwind, glide" },
  ];

  /* ----------------------------------------
     REUSABLE TABLE (SAME MARKUP)
  ---------------------------------------- */
  function SpecsTable({ data }) {
    return (
      <table>
        <tbody className="text-4 lg:text-[16px] font-bold leading-[110%] flex flex-col gap-4 leading-[1.3]">
          {data.map((row, index) => (
            <tr
              key={index}
              className="py-[2px] border-b border-b-[1px] border-b-[#FFFFFF26] flex justify-between gap-[40px]"
            >
              <th
                style={{ padding: 0, backgroundColor: "transparent" }}
                className="font-bold text-left text-white !whitespace-break-spaces"
              >
                {row.label}
              </th>

              <td
                style={{ textAlign: "right" }}
                className="font-smibold text-[#FFFFFF99] !whitespace-break-spaces max-w-[225px]"
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

  // Check if paddles should be shown (when content overflows)
  useEffect(() => {
    const checkPaddles = () => {
      const nav = navRef.current;
      const track = trackRef.current;
      if (nav && track) {
        const navWidth = nav.offsetWidth;
        const trackWidth = track.scrollWidth;
        setShowPaddles(trackWidth > navWidth);
      }
    };

    // Check after initial render and after tab changes
    const timeoutId = setTimeout(() => {
      checkPaddles();
    }, 100);

    window.addEventListener("resize", checkPaddles);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkPaddles);
    };
  }, [activeTab]);

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

          const aboutImg = container.current.querySelector(".about_img");
          const aboutTarget = container.current.querySelector(".hero_target");
          const heroSection = container.current.querySelector(".hero");
          const aboutSection = container.current.querySelector(".about");

          // intro anim
          const tl = gsap.timeline({ delay: 0.2 });

          // play together
          tl.fromTo(
            ".main",
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: "power2.out" }
          )

            .from(
              ".glide_43",
              {
                rotate: 20,
                duration: 1.2,
                ease: "power2.out",
              },
              "<"
            )
            .from(
              ".glide_41",
              {
                rotate: 25,
                duration: 1.2,
                ease: "power2.out",
              },
              "<"
            )
            .from(
              ".glide_39",
              {
                rotate: 30,
                duration: 1.2,
                ease: "power2.out",
              },
              "<"
            )
            .from(".hero_b_p", {
              y: "110%",
              ease: "power2.out",
            })

            .from(
              ".glide_svg_i",
              {
                y: "110%",
                duration: 1,
                ease: "power2.out",
                stagger: 0.1,
              },
              "<"
            );

          /* ------------------------------ move all the GLide img in x ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: heroSection,
                start: "top-=150 top",
                end: "top+=50 top",
                scrub: true,
                markers: false,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              ".hero_img",
              { x: "-5%" },
              { x: 0, duration: 1, ease: "none" }
            )
            .fromTo(
              ".about_img_i",
              { x: "-10%" },
              { x: 0, duration: 1, ease: "none" },
              0
            );

          // Wait until the image has loaded to calculate y properly
          if (aboutImg.complete) {
            initAnimation();
          } else {
            aboutImg.onload = initAnimation;
          }

          function initAnimation() {
            gsap.from(aboutImg, {
              y: () => {
                const imgBox = aboutImg.getBoundingClientRect();
                const targetBox = aboutTarget.getBoundingClientRect();
                if (imgBox.height === 0 || targetBox.height === 0) return 0;

                const imgCenterY =
                  imgBox.top + window.scrollY + imgBox.height / 2;
                const targetCenterY =
                  targetBox.top + window.scrollY + targetBox.height / 2;
                const offset = targetBox.height * r(0.7, 0.7, 1.2);

                return targetCenterY - offset - imgCenterY;
              },
              scale: r(1.3, 1.75, 1.75),
              ease: "none",
              scrollTrigger: {
                trigger: heroSection,
                start: "top+=50 top",
                endTrigger: aboutSection,
                end: "center center",
                scrub: true,
                markers: false,
              },
            });
          }

          /* ------------------------------ HERO → ABOUT SCROLL ------------------------------ */ gsap
            .timeline({
              scrollTrigger: {
                trigger: ".about",
                start: "top 80%",
                end: "center center",
                scrub: true,
                markers: false,
              },
            })
            .fromTo(
              ".about_h",
              { x: r("100%", 0, 0), y: "-100%" },
              { x: 0, y: 0, ease: "none" },
              "0"
            )

            .fromTo(
              ".abou_p",
              {
                y: (i) => `${100 + i * 50}%`,
              },
              {
                y: "0%",
                ease: "none",
              },
              "0"
            );

          /* ------------------------------ about → Slider SCROLL ------------------------------ */ gsap
            .timeline({
              scrollTrigger: {
                trigger: ".about",
                start: "center center",
                end: "bottom top",
                scrub: true,
                markers: false,
              },
            })

            .fromTo(".slider_div", { y: 120 }, { y: 0, ease: "none" }, "0")
            .fromTo(
              ".slider_div_h",
              {
                y: (i) => (i + 1) * 20,
              },
              {
                y: 0,
                ease: "none",
              },
              "0"
            )

            .to(
              ".glide_39",
              {
                y: -120,
                ease: "none",
              },
              "0"
            );

          /* ------------------------------ Slider → performance SCROLL ------------------------------ */ gsap
            .timeline({
              scrollTrigger: {
                trigger: ".slider_div",
                start: "center center",
                end: "center top",
                scrub: true,
                markers: false,
              },
            })
            .fromTo(".performance", { y: 80 }, { y: 0, ease: "none" }, "0")
            .fromTo(
              ".performance_div",
              { y: (i) => 40 * 2 ** i },
              { y: 0, ease: "none" },
              "0"
            );

          /* ------------------------------ Slider → performance SCROLL ------------------------------ */ gsap
            .timeline({
              scrollTrigger: {
                trigger: ".performance",
                start: "center center",
                end: "center top",
                scrub: true,
                markers: false,
              },
            })
            .fromTo(
              ".achieve_h",
              { y: (i) => 80 * 2 ** i },
              { y: 0, ease: "none" },
              "0"
            );

          /* ------------------------------ achieve → twist SCROLL ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".twist",
                start: "top bottom",
                end: "center center",
                scrub: true,
                markers: false,
              },
            })

            .from(".twist_img", { y: "0%", rotate: 45, ease: "none" }, "0")
            .from(".twist_img_ii", { y: "50%", rotate: 45, ease: "none" }, "0")
            .from(".twist_img_i", { rotate: 45, ease: "none" }, "0")
            .from(".twist_h", { y: (i) => -160 + i * 40, ease: "none" }, "0");

          /* ------------------------------ twist → information SCROLL ------------------------------ */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".information",
                start: "top bottom",
                end: "bottom bottom",
                scrub: true,
                markers: false,
              },
            })
            .to(".twist_h", { y: (i) => -160 + i * 40, ease: "none" }, "0")
            .to(".twist_img_i", { y: 80, ease: "none" }, "0")
            .to(".twist_img_ii", { y: 160, ease: "none" }, "0")
            .fromTo(
              ".information_div",
              { y: (i) => 80 * 2 ** i },
              { y: 0, ease: "none" },
              "0"
            );
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

        <section className="hero min-h-[calc(100vh-150px)] relative hero smooth global-padding flex flex-col justify-between pb-10 pt-50 global-margin items-center">
          <div></div>
          {/* Top images */}
          <div className="hero_target relative  flex felex-col items-center">
            {/* GLIDE 43 */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/uglide43_0003-2.png`}
              alt="AFS U GLide 43"
              className="max-w-[1920px] w-full h-auto lg:scale-[1.3] scale-[1.75] relative glide_43"
            />
            {/* GLIDE 41 */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/UGlide_0002-4.png`}
              alt="AFS U GLide 41"
              className="hero_img max-w-[1920px] w-full h-auto lg:scale-[1.3] scale-[1.75] absolute z-0 md:-top-[35%]  -top-[60%] right-[0] z-1 glide_41"
            />
          </div>

          {/* text bottom div */}
          <div className="w-[100%] max-w-[1920px] mx-auto flex lg:gap-[20px] gap-5 justify-between flex-col md:flex-row md:items-end items-start">
            {/* Glide SVG LOGO */}
            <div className="flex-1 max-w-[790px]">
              <svg
                width="100%"
                maxWidth="790"
                height="100%"
                viewBox="0 0 800 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_19996_101257)">
                  <path
                    className="glide_svg_i"
                    d="M200.166 73.6751H261.183L276.399 51.8502H248.426L258.109 38.0175H315.746L289.463 75.5195C286.594 79.6182 282.24 82.6922 276.399 84.7413C270.661 86.6883 262.516 87.6615 251.961 87.6615H185.411C177.419 87.6615 171.629 87.0977 168.043 85.9708C164.457 84.8439 162.664 83.1016 162.664 80.7451C162.664 79.3109 163.381 77.5686 164.816 75.5195L205.853 16.9611C208.516 13.1699 212.769 10.1985 218.609 8.0467C224.552 5.89495 232.8 4.81908 243.354 4.81908H338.954L329.271 18.8055H238.59C237.36 18.8055 236.284 18.9079 235.362 19.1129C234.44 19.3178 233.825 19.6252 233.518 20.035L196.631 72.7529C196.631 73.3677 197.809 73.6751 200.166 73.6751ZM336.043 73.6751H426.724L416.888 87.6615H321.288C313.296 87.6615 307.507 87.0977 303.921 85.9708C300.334 84.8439 298.541 83.1016 298.541 80.7451C298.541 79.3109 299.258 77.5686 300.693 75.5195L350.183 4.81908H380L332.508 72.7529C332.508 73.3677 333.686 73.6751 336.043 73.6751ZM427.348 87.6615L485.292 4.81908H515.109L457.165 87.6615H427.348ZM467.934 87.6615L525.878 4.81908H621.475C629.467 4.81908 635.258 5.43386 638.843 6.66343C642.433 7.79052 644.222 9.53246 644.222 11.8891C644.222 13.2212 643.509 14.9118 642.07 16.9611L601.035 75.5195C598.166 79.6182 593.811 82.6922 587.971 84.7413C582.232 86.6883 574.087 87.6615 563.533 87.6615H467.934ZM606.876 18.8055H546.012L507.588 73.6751H568.451C571.32 73.6751 573.011 73.2651 573.523 72.4455L610.257 20.035C610.359 19.9325 610.411 19.7788 610.411 19.5739C610.411 19.0616 609.232 18.8055 606.876 18.8055ZM647.616 73.6751H738.297L728.46 87.6615H632.861C624.869 87.6615 619.077 87.0977 615.493 85.9708C611.906 84.8439 610.112 83.1016 610.112 80.7451C610.112 79.3109 610.83 77.5686 612.264 75.5195L653.302 16.9611C655.964 13.1699 660.219 10.1985 666.059 8.0467C672.004 5.89495 680.248 4.81908 690.804 4.81908H786.404L776.721 18.8055H686.04C684.81 18.8055 683.734 18.9079 682.812 19.1129C681.89 19.3178 681.275 19.6252 680.968 20.035L668.365 38.0175H737.374L727.691 51.8502H658.682L644.081 72.7529C644.081 73.3677 645.261 73.6751 647.616 73.6751Z"
                    fill="white"
                  />
                  <mask
                    id="mask0_19996_101257"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x="160"
                    y="2"
                    width="630"
                    height="88"
                  >
                    <path
                      d=" 2.82101H160.459V89.5058H790V2.82101Z"
                      fill="white"
                    />
                    <path
                      d="M200.166 73.6751H261.183L276.399 51.8502H248.426L258.109 38.0175H315.746L289.463 75.5195C286.594 79.6182 282.24 82.6922 276.399 84.7413C270.661 86.6883 262.516 87.6615 251.961 87.6615H185.411C177.419 87.6615 171.629 87.0977 168.043 85.9708C164.457 84.8439 162.664 83.1016 162.664 80.7451C162.664 79.3109 163.381 77.5686 164.816 75.5195L205.853 16.9611C208.516 13.1699 212.769 10.1985 218.609 8.0467C224.552 5.89495 232.8 4.81908 243.354 4.81908H338.954L329.271 18.8055H238.59C237.36 18.8055 236.284 18.9079 235.362 19.1129C234.44 19.3178 233.825 19.6252 233.518 20.035L196.631 72.7529C196.631 73.3677 197.809 73.6751 200.166 73.6751ZM336.043 73.6751H426.724L416.888 87.6615H321.288C313.296 87.6615 307.507 87.0977 303.921 85.9708C300.334 84.8439 298.541 83.1016 298.541 80.7451C298.541 79.3109 299.258 77.5686 300.693 75.5195L350.183 4.81908H380L332.508 72.7529C332.508 73.3677 333.686 73.6751 336.043 73.6751ZM427.348 87.6615L485.292 4.81908H515.109L457.165 87.6615H427.348ZM467.934 87.6615L525.878 4.81908H621.475C629.467 4.81908 635.258 5.43386 638.843 6.66343C642.433 7.79052 644.222 9.53246 644.222 11.8891C644.222 13.2212 643.509 14.9118 642.07 16.9611L601.035 75.5195C598.166 79.6182 593.811 82.6922 587.971 84.7413C582.232 86.6883 574.087 87.6615 563.533 87.6615H467.934ZM606.876 18.8055H546.012L507.588 73.6751H568.451C571.32 73.6751 573.011 73.2651 573.523 72.4455L610.257 20.035C610.359 19.9325 610.411 19.7788 610.411 19.5739C610.411 19.0616 609.232 18.8055 606.876 18.8055ZM647.616 73.6751H738.297L728.46 87.6615H632.861C624.869 87.6615 619.077 87.0977 615.493 85.9708C611.906 84.8439 610.112 83.1016 610.112 80.7451C610.112 79.3109 610.83 77.5686 612.264 75.5195L653.302 16.9611C655.964 13.1699 660.219 10.1985 666.059 8.0467C672.004 5.89495 680.248 4.81908 690.804 4.81908H786.404L776.721 18.8055H686.04C684.81 18.8055 683.734 18.9079 682.812 19.1129C681.89 19.3178 681.275 19.6252 680.968 20.035L668.365 38.0175H737.374L727.691 51.8502H658.682L644.081 72.7529C644.081 73.3677 645.261 73.6751 647.616 73.6751Z"
                      fill="black"
                    />
                  </mask>
                  <g mask="url(#mask0_19996_101257)">
                    <path
                      d="M261.183 73.6751V75.5195H262.146L262.696 74.7301L261.183 73.6751ZM276.399 51.8502L277.912 52.9052L279.933 50.0058H276.399V51.8502ZM248.426 51.8502L246.915 50.7928L244.884 53.6946H248.426V51.8502ZM258.109 38.0175V36.1732H257.149L256.598 36.9598L258.109 38.0175ZM315.745 38.0175L317.256 39.0762L319.29 36.1732H315.745V38.0175ZM289.463 75.5195L287.953 74.4608L287.952 74.462L289.463 75.5195ZM276.399 84.7412L276.992 86.4879L277.001 86.4848L277.01 86.4817L276.399 84.7412ZM164.815 75.5195L163.305 74.4608L163.304 74.462L164.815 75.5195ZM205.852 16.9611L204.343 15.9007L204.342 15.9026L205.852 16.9611ZM218.609 8.0467L217.982 6.31251L217.977 6.31429L217.972 6.31608L218.609 8.0467ZM338.954 4.81907L340.47 5.86888L342.474 2.97472H338.954V4.81907ZM329.271 18.8055V20.6498H330.237L330.787 19.8553L329.271 18.8055ZM233.518 20.035L232.042 18.9284L232.024 18.9528L232.007 18.9777L233.518 20.035ZM196.631 72.7529L195.119 71.6955L194.786 72.1719V72.7529H196.631ZM200.166 73.6751V75.5195H261.183V73.6751V71.8307H200.166V73.6751ZM261.183 73.6751L262.696 74.7301L277.912 52.9052L276.399 51.8502L274.886 50.7952L259.67 72.6201L261.183 73.6751ZM276.399 51.8502V50.0058H248.426V51.8502V53.6946H276.399V51.8502ZM248.426 51.8502L249.937 52.9076L259.62 39.0749L258.109 38.0175L256.598 36.9598L246.915 50.7928L248.426 51.8502ZM258.109 38.0175V39.8619H315.745V38.0175V36.1732H258.109V38.0175ZM315.745 38.0175L314.235 36.959L287.953 74.4608L289.463 75.5195L290.974 76.5781L317.256 39.0762L315.745 38.0175ZM289.463 75.5195L287.952 74.462C285.352 78.1759 281.352 81.0489 275.789 83.0008L276.399 84.7412L277.01 86.4817C283.127 84.3355 287.836 81.0599 290.974 76.5769L289.463 75.5195ZM276.399 84.7412L275.806 82.9946C270.35 84.8458 262.44 85.8171 251.961 85.8171V87.6615V89.5058C262.59 89.5058 270.972 88.5302 276.992 86.4879L276.399 84.7412ZM251.961 87.6615V85.8171H185.411V87.6615V89.5058H251.961V87.6615ZM185.411 87.6615V85.8171C177.444 85.8171 171.896 85.2485 168.596 84.2113L168.043 85.9708L167.49 87.7303C171.363 88.9476 177.393 89.5058 185.411 89.5058V87.6615ZM168.043 85.9708L168.596 84.2113C166.951 83.6943 165.905 83.0906 165.294 82.4961C164.731 81.9489 164.508 81.3925 164.508 80.7451H162.664H160.819C160.819 82.4549 161.494 83.9476 162.723 85.1421C163.904 86.2893 165.549 87.1205 167.49 87.7303L168.043 85.9708ZM162.664 80.7451H164.508C164.508 79.8789 164.966 78.5208 166.327 76.5769L164.815 75.5195L163.304 74.462C161.796 76.6169 160.819 78.7422 160.819 80.7451H162.664ZM164.815 75.5195L166.326 76.5781L207.363 18.0196L205.852 16.9611L204.342 15.9026L163.305 74.4608L164.815 75.5195ZM205.852 16.9611L207.362 18.0215C209.747 14.6264 213.64 11.8431 219.247 9.77732L218.609 8.0467L217.972 6.31608C211.898 8.55378 207.285 11.7135 204.343 15.9007L205.852 16.9611ZM218.609 8.0467L219.237 9.78089C224.889 7.7347 232.891 6.66343 243.354 6.66343V4.81907V2.97472C232.71 2.97472 224.216 4.0552 217.982 6.31251L218.609 8.0467ZM243.354 4.81907V6.66343H338.954V4.81907V2.97472H243.354V4.81907ZM338.954 4.81907L337.437 3.76927L327.754 17.7556L329.271 18.8055L330.787 19.8553L340.47 5.86888L338.954 4.81907ZM329.271 18.8055V16.9611H238.59V18.8055V20.6498H329.271V18.8055ZM238.59 18.8055V16.9611C237.264 16.9611 236.048 17.0711 234.962 17.3124L235.362 19.1128L235.762 20.9133C236.52 20.7447 237.457 20.6498 238.59 20.6498V18.8055ZM235.362 19.1128L234.962 17.3124C233.931 17.5416 232.76 17.9713 232.042 18.9284L233.518 20.035L234.993 21.1416C234.927 21.2303 234.899 21.2141 235.034 21.1467C235.167 21.0803 235.398 20.9943 235.762 20.9133L235.362 19.1128ZM233.518 20.035L232.007 18.9777L195.119 71.6955L196.631 72.7529L198.142 73.8104L235.029 21.0924L233.518 20.035ZM196.631 72.7529H194.786C194.786 73.5976 195.228 74.2284 195.715 74.609C196.147 74.9471 196.645 75.1235 197.049 75.2293C197.872 75.4438 198.948 75.5195 200.166 75.5195V73.6751V71.8307C199.027 71.8307 198.335 71.7527 197.98 71.6598C197.795 71.6119 197.851 71.5965 197.988 71.7041C198.18 71.8541 198.475 72.2156 198.475 72.7529H196.631ZM426.724 73.6751L428.232 74.7362L430.276 71.8307H426.724V73.6751ZM416.888 87.6615V89.5058H417.845L418.396 88.7226L416.888 87.6615ZM350.183 4.81907V2.97472H349.223L348.672 3.7614L350.183 4.81907ZM380 4.81907L381.512 5.87583L383.54 2.97472H380V4.81907ZM332.508 72.7529L330.996 71.6961L330.664 72.1719V72.7529H332.508ZM336.043 73.6751V75.5195H426.724V73.6751V71.8307H336.043V73.6751ZM426.724 73.6751L425.215 72.614L415.379 86.6004L416.888 87.6615L418.396 88.7226L428.232 74.7362L426.724 73.6751ZM416.888 87.6615V85.8171H321.288V87.6615V89.5058H416.888V87.6615ZM321.288 87.6615V85.8171C313.321 85.8171 307.773 85.2485 304.473 84.2113L303.921 85.9708L303.367 87.7303C307.24 88.9476 313.27 89.5058 321.288 89.5058V87.6615ZM303.921 85.9708L304.473 84.2113C302.828 83.6943 301.783 83.0906 301.171 82.4961C300.608 81.9489 300.386 81.3925 300.386 80.7451H298.541H296.697C296.697 82.4549 297.371 83.9476 298.601 85.1421C299.782 86.2893 301.426 87.1205 303.367 87.7303L303.921 85.9708ZM298.541 80.7451H300.386C300.386 79.8789 300.843 78.5208 302.204 76.5769L300.693 75.5195L299.182 74.462C297.673 76.6169 296.697 78.7422 296.697 80.7451H298.541ZM300.693 75.5195L302.204 76.5769L351.694 5.87675L350.183 4.81907L348.672 3.7614L299.182 74.462L300.693 75.5195ZM350.183 4.81907V6.66343H380V4.81907V2.97472H350.183V4.81907ZM380 4.81907L378.489 3.76232L330.996 71.6961L332.508 72.7529L334.019 73.8097L381.512 5.87583L380 4.81907ZM332.508 72.7529H330.664C330.664 73.5976 331.106 74.2284 331.592 74.609C332.024 74.9471 332.522 75.1235 332.926 75.2293C333.749 75.4438 334.825 75.5195 336.043 75.5195V73.6751V71.8307C334.905 71.8307 334.212 71.7527 333.857 71.6598C333.672 71.6119 333.728 71.5965 333.866 71.7041C334.057 71.8541 334.353 72.2156 334.353 72.7529H332.508ZM427.348 87.6615L425.837 86.6047L423.808 89.5058H427.348V87.6615ZM485.292 4.81907V2.97472H484.331L483.781 3.76195L485.292 4.81907ZM515.109 4.81907L516.621 5.8762L518.65 2.97472H515.109V4.81907ZM457.165 87.6615V89.5058H458.126L458.677 88.7183L457.165 87.6615ZM427.348 87.6615L428.86 88.7183L486.803 5.8762L485.292 4.81907L483.781 3.76195L425.837 86.6047L427.348 87.6615ZM485.292 4.81907V6.66343H515.109V4.81907V2.97472H485.292V4.81907ZM515.109 4.81907L513.598 3.76195L455.654 86.6047L457.165 87.6615L458.677 88.7183L516.621 5.8762L515.109 4.81907ZM457.165 87.6615V85.8171H427.348V87.6615V89.5058H457.165V87.6615ZM467.934 87.6615L466.422 86.6047L464.393 89.5058H467.934V87.6615ZM525.877 4.81907V2.97472H524.917L524.366 3.76195L525.877 4.81907ZM638.842 6.66343L638.246 8.40807L638.271 8.41582L638.289 8.42295L638.842 6.66343ZM642.07 16.9611L643.582 18.0196V18.0188L642.07 16.9611ZM601.035 75.5195L599.524 74.4608L599.524 74.462L601.035 75.5195ZM587.971 84.7412L588.563 86.4879L588.572 86.4848L588.581 86.4817L587.971 84.7412ZM546.012 18.8055V16.9611H545.051L544.5 17.7475L546.012 18.8055ZM507.588 73.6751L506.076 72.6171L504.044 75.5195H507.588V73.6751ZM573.523 72.4455L572.013 71.3869L571.985 71.4268L571.959 71.468L573.523 72.4455ZM610.257 20.035L608.952 18.7309L608.838 18.8447L608.746 18.9765L610.257 20.035ZM467.934 87.6615L469.445 88.7183L527.389 5.8762L525.877 4.81907L524.366 3.76195L466.422 86.6047L467.934 87.6615ZM525.877 4.81907V6.66343H621.475V4.81907V2.97472H525.877V4.81907ZM621.475 4.81907V6.66343C629.442 6.66343 634.969 7.28394 638.246 8.40807L638.842 6.66343L639.445 4.91879C635.547 3.58379 629.498 2.97472 621.475 2.97472V4.81907ZM638.842 6.66343L638.289 8.42295C639.937 8.93992 640.982 9.54346 641.591 10.1381C642.156 10.6853 642.378 11.242 642.378 11.8891H644.222H646.066C646.066 10.1796 645.396 8.68694 644.167 7.49229C642.98 6.34497 641.339 5.51403 639.396 4.90391L638.842 6.66343ZM644.222 11.8891H642.378C642.378 12.6335 641.941 13.9312 640.564 15.9034L642.07 16.9611L643.582 18.0188C645.07 15.8924 646.066 13.8088 646.066 11.8891H644.222ZM642.07 16.9611L640.564 15.9026L599.524 74.4608L601.035 75.5195L602.546 76.5781L643.582 18.0196L642.07 16.9611ZM601.035 75.5195L599.524 74.462C596.924 78.1759 592.924 81.0489 587.36 83.0008L587.971 84.7412L588.581 86.4817C594.698 84.3355 599.408 81.0599 602.546 76.5769L601.035 75.5195ZM587.971 84.7412L587.378 82.9946C581.922 84.8458 574.011 85.8171 563.533 85.8171V87.6615V89.5058C574.162 89.5058 582.543 88.5302 588.563 86.4879L587.971 84.7412ZM563.533 87.6615V85.8171H467.934V87.6615V89.5058H563.533V87.6615ZM606.875 18.8055V16.9611H546.012V18.8055V20.6498H606.875V18.8055ZM546.012 18.8055L544.5 17.7475L506.076 72.6171L507.588 73.6751L509.098 74.7331L547.522 19.8634L546.012 18.8055ZM507.588 73.6751V75.5195H568.451V73.6751V71.8307H507.588V73.6751ZM568.451 73.6751V75.5195C569.951 75.5195 571.256 75.4143 572.305 75.1604C573.278 74.9243 574.436 74.4651 575.087 73.423L573.523 72.4455L571.959 71.468C572.098 71.2455 572.154 71.401 571.437 71.575C570.795 71.7305 569.82 71.8307 568.451 71.8307V73.6751ZM573.523 72.4455L575.033 73.5042L611.767 21.0936L610.257 20.035L608.746 18.9765L572.013 71.3869L573.523 72.4455ZM610.257 20.035L611.561 21.3392C612.131 20.7688 612.255 20.0631 612.255 19.5739H610.41H608.566C608.566 19.4946 608.587 19.0963 608.952 18.7309L610.257 20.035ZM610.41 19.5739H612.255C612.255 18.6039 611.652 17.9896 611.197 17.6929C610.774 17.4169 610.299 17.278 609.919 17.1953C609.13 17.024 608.086 16.9611 606.875 16.9611V18.8055V20.6498C608.021 20.6498 608.744 20.715 609.135 20.7998C609.344 20.8453 609.311 20.8664 609.182 20.7826C609.022 20.6779 608.566 20.2878 608.566 19.5739H610.41ZM738.296 73.6751L739.803 74.7362L741.85 71.8307H738.296V73.6751ZM728.46 87.6615V89.5058H729.419L729.966 88.7226L728.46 87.6615ZM612.264 75.5195L610.754 74.4608L610.754 74.462L612.264 75.5195ZM653.302 16.9611L651.79 15.9007V15.9026L653.302 16.9611ZM666.059 8.0467L665.432 6.31251L665.426 6.31429L665.42 6.31608L666.059 8.0467ZM786.403 4.81907L787.916 5.86888L789.92 2.97472H786.403V4.81907ZM776.721 18.8055V20.6498H777.686L778.233 19.8553L776.721 18.8055ZM680.968 20.035L679.492 18.9284L679.474 18.9521L679.455 18.9765L680.968 20.035ZM668.365 38.0175L666.852 36.959L664.817 39.8619H668.365V38.0175ZM737.374 38.0175L738.887 39.0749L740.915 36.1732H737.374V38.0175ZM727.691 51.8502V53.6946H728.65L729.204 52.9076L727.691 51.8502ZM658.682 51.8502V50.0058H657.716L657.169 50.794L658.682 51.8502ZM644.08 72.7529L642.568 71.6967L642.236 72.1726V72.7529H644.08ZM647.615 73.6751V75.5195H738.296V73.6751V71.8307H647.615V73.6751ZM738.296 73.6751L736.784 72.614L726.947 86.6004L728.46 87.6615L729.966 88.7226L739.803 74.7362L738.296 73.6751ZM728.46 87.6615V85.8171H632.861V87.6615V89.5058H728.46V87.6615ZM632.861 87.6615V85.8171C624.893 85.8171 619.348 85.2485 616.046 84.2113L615.493 85.9708L614.94 87.7303C618.813 88.9476 624.844 89.5058 632.861 89.5058V87.6615ZM615.493 85.9708L616.046 84.2113C614.4 83.6943 613.355 83.0906 612.742 82.4961C612.179 81.9489 611.957 81.3925 611.957 80.7451H610.112H608.268C608.268 82.4549 608.942 83.9476 610.173 85.1421C611.354 86.2893 612.997 87.1205 614.94 87.7303L615.493 85.9708ZM610.112 80.7451H611.957C611.957 79.8789 612.415 78.5208 613.775 76.5769L612.264 75.5195L610.754 74.462C609.245 76.6169 608.268 78.7422 608.268 80.7451H610.112ZM612.264 75.5195L613.775 76.5781L654.815 18.0196L653.302 16.9611L651.79 15.9026L610.754 74.4608L612.264 75.5195ZM653.302 16.9611L654.808 18.0215C657.194 14.6264 661.092 11.8431 666.698 9.77732L666.059 8.0467L665.42 6.31608C659.346 8.55378 654.735 11.7135 651.79 15.9007L653.302 16.9611ZM666.059 8.0467L666.686 9.78089C672.336 7.7347 680.341 6.66343 690.804 6.66343V4.81907V2.97472C680.156 2.97472 671.666 4.0552 665.432 6.31251L666.059 8.0467ZM690.804 4.81907V6.66343H786.403V4.81907V2.97472H690.804V4.81907ZM786.403 4.81907L784.885 3.76927L775.202 17.7556L776.721 18.8055L778.233 19.8553L787.916 5.86888L786.403 4.81907ZM776.721 18.8055V16.9611H686.04V18.8055V20.6498H776.721V18.8055ZM686.04 18.8055V16.9611C684.712 16.9611 683.494 17.0711 682.412 17.3124L682.812 19.1128L683.212 20.9133C683.968 20.7447 684.908 20.6498 686.04 20.6498V18.8055ZM682.812 19.1128L682.412 17.3124C681.38 17.5416 680.211 17.9713 679.492 18.9284L680.968 20.035L682.443 21.1416C682.375 21.2303 682.351 21.2141 682.486 21.1467C682.615 21.0803 682.849 20.9943 683.212 20.9133L682.812 19.1128ZM680.968 20.035L679.455 18.9765L666.852 36.959L668.365 38.0175L669.877 39.0762L682.48 21.0936L680.968 20.035ZM668.365 38.0175V39.8619H737.374V38.0175V36.1732H668.365V38.0175ZM737.374 38.0175L735.862 36.9598L726.179 50.7928L727.691 51.8502L729.204 52.9076L738.887 39.0749L737.374 38.0175ZM727.691 51.8502V50.0058H658.682V51.8502V53.6946H727.691V51.8502ZM658.682 51.8502L657.169 50.794L642.568 71.6967L644.08 72.7529L645.593 73.8091L660.194 52.9064L658.682 51.8502ZM644.08 72.7529H642.236C642.236 73.5976 642.679 74.2284 643.164 74.609C643.595 74.9471 644.093 75.1235 644.498 75.2293C645.322 75.4438 646.398 75.5195 647.615 75.5195V73.6751V71.8307C646.478 71.8307 645.783 71.7527 645.427 71.6598C645.242 71.6119 645.298 71.5965 645.439 71.7041C645.63 71.8541 645.925 72.2156 645.925 72.7529H644.08Z"
                      fill="white"
                    />
                  </g>
                  <path
                    className="glide_svg_i"
                    d="M181.802 2.0829C181.432 1.43756 180.784 0.976654 179.951 0.976654H133.204C132.556 0.976654 131.908 1.3454 131.538 1.89853L87.7539 64.5849H57.9471L100.158 4.20317C100.621 3.55783 100.621 2.72818 100.25 2.0829C99.88 1.43756 99.232 0.976654 98.399 0.976654H54.1518C53.5039 0.976654 52.8559 1.3454 52.4856 1.80631L2.49931 72.8814C0.833109 75.2778 0 77.3982 0 79.3342C0 81.2702 1.20338 84.7732 6.85001 86.5247C10.7378 87.723 16.6621 88.2763 24.9931 88.2763H92.1042C103.027 88.2763 111.359 87.2625 117.561 85.1421C123.763 83.0217 128.576 79.6109 131.723 75.1856L181.617 4.11096C182.08 3.46568 182.08 2.63596 181.71 1.99068L181.802 2.0829ZM128.391 72.8814C125.799 76.5689 121.726 79.4264 116.265 81.2702C110.618 83.2061 102.565 84.1277 92.197 84.1277H25.0857C17.3101 84.1277 11.5709 83.575 8.2385 82.5606C4.25809 81.2702 4.25809 79.7953 4.25809 79.242C4.25809 78.6887 4.5358 77.306 6.01687 75.1856L55.3552 5.03283H94.6039L52.3931 65.4142C51.9302 66.0597 51.9302 66.8891 52.2079 67.5346C52.4856 68.1801 53.3187 68.6406 54.0593 68.6406H88.8649C89.5128 68.6406 90.1608 68.2717 90.5309 67.7191L134.315 5.03283H175.97L128.391 72.7892V72.8814Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_19996_101257">
                    <rect width="790" height="90" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="max-w-[520px] flex-1 overflow-hidden">
              <p className="hero_b_p text-[#FFFFFFCC] text-[20px] leading-[1.3] font-semibold">
                {t.rich("hero", {
                  bold: (chunks) => <b className="text-white">{chunks}</b>,
                })}
              </p>
            </div>
          </div>
        </section>

        {/*about*/}
        <section className="about smooth relative mb-20 flex flex-col global-padding global-margin z-2 gap-20 lg:gap-0">
          {/*about img*/}
          <div className="about_img_i max-w-[1920px] mx-auto relative">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/uglide39_0003-2.png`}
              alt="AFS U GLide 39"
              className="about_img max-w-[1920px] w-full h-auto rlative z-1 mx-auto scale-[1] glide_39"
            />
          </div>

          {/*about content*/}
          <div className="flex flex-col gap-10 max-w-[1920px] mx-auto">
            <div className="relative overflow-hidden w-fit">
              <h2 className="about_h text-white text-[22px] font-bold leadin-1 uppercase">
                {t("water")}
              </h2>
            </div>
            <div className="text-[#FFFFFFCC] text-[18px] leading-[1.3] grid grid-cols-1 min-[540px]:grid-cols-2 min-[1220px]:grid-cols-2 lg:grid-cols-4 gap-5 font-semibold">
              <div className="overflow-hidden flex items-center font-semibold">
                <p className="abou_p border-l-2 border-white px-5">
                  {t.rich("pumping", {
                    bold: (chunks) => (
                      <b className="text-white font-bold">{chunks}</b>
                    ),
                  })}
                </p>
              </div>
              <div className="overflow-hidden flex items-center">
                <p className="abou_p border-l-2 border-white px-5">
                  {t.rich("glide", {
                    bold: (chunks) => (
                      <b className="text-white font-bold">{chunks}</b>
                    ),
                  })}
                </p>
              </div>
              <div className="overflow-hidden flex items-center">
                <p className="abou_p border-l-2 border-white px-5">
                  {t.rich("flight", {
                    bold: (chunks) => (
                      <b className="text-white font-bold">{chunks}</b>
                    ),
                  })}
                </p>
              </div>
              <div className="overflow-hidden flex items-center">
                <p className="abou_p border-l-2 border-white px-5">
                  {t.rich("stability", {
                    bold: (chunks) => (
                      <b className="text-white font-bold">{chunks}</b>
                    ),
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/*slider section*/}
        <section className="slider_div relative max-w-[100%] mx-auto flex flex-col items-center md:mb-0 mb-10">
          {/* top content */}
          <div className="global-padding relative">
            <div className="max-w-[791px] text-white flex flex-col gap-[25px] items-center text-center">
              <h2 className="global-h2 slider_div_h">{t("sizes")}</h2>

              <ul className="flex lg:gap-[20px] gap-3 md:flex-row flex-col text-[18px] md:text-[20px] leading-[1.3] font-semibold text-[#FFFFFFCC]">
                <li className="slider_div_h relative pl-[28px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[8px] before:h-[8px] before:bg-[#FFFFFF66] before:rounded-full md:before:hidden">
                  {t.rich("span39", {
                    bold: (chunks) => (
                      <span className="text-white font-bold">{chunks}</span>
                    ),
                  })}
                </li>

                <li className="slider_div_h relative pl-[28px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[8px] before:h-[8px] before:bg-[#FFFFFF66] before:rounded-full">
                  {t.rich("span41", {
                    bold: (chunks) => (
                      <span className="text-white font-bold">{chunks}</span>
                    ),
                  })}
                </li>

                <li className="slider_div_h relative pl-[28px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[8px] before:h-[8px] before:bg-[#FFFFFF66] before:rounded-full">
                  {t.rich("span43", {
                    bold: (chunks) => (
                      <span className="text-white font-bold">{chunks}</span>
                    ),
                  })}
                </li>
              </ul>

              <p className="slider_div_h max-w-[520px] text-[20px] leading-[1.3] text-[#FFFFFFCC] font-semibold">
                {t("size_p")}
              </p>
            </div>
          </div>

          {/* slider */}
          <div className="slider_div_h relative w-full mt-10 py-10">
            <button
              className="swiper-prev absolute left-[clamp(1.25rem,-5.4167rem+10.4167vw,5rem)] top-[50%] -translate-y-1/2 z-10
                       w-12 h-12 backdrop-blur flex items-center justify-center text-white cursor-pointer"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              className="swiper-next absolute right-[clamp(1.25rem,-5.4167rem+10.4167vw,5rem)] top-[50%] -translate-y-1/2 z-10
                       w-12 h-12 backdrop-blur flex items-center justify-center text-white cursor-pointer"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <Swiper
              modules={[Navigation]}
              slidesPerView="auto"
              spaceBetween={10}
              navigation={{
                prevEl: ".swiper-prev",
                nextEl: ".swiper-next",
              }}
              centeredSlides={true}
              loop={true}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              className="relative z-1 w-full py-10"
            >
              {slides.map((slide, i) => (
                <SwiperSlide
                  key={slide.id}
                  className="!w-auto !h-auto flex items-stretch"
                >
                  <div className="realive lg:aspect-[1/1] aspect-auto">
                    <div
                      className={`max-w-[75vw] lg:w-[520px] w-[400px] flex flex-col gap-[20px] items-center justify-center transition-all duration-300 will-change-transform ${
                        i === activeIndex ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      <h4 className="text-[13.6px] font-semibold text-white uppercase">
                        {slide.title}
                      </h4>
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="relative z-1"
                      />

                      <img
                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/UGlide_0002-4.png`}
                        alt="AFS U GLide 41"
                        className={`max-w-full h-auto absolute md:w-[228px] w-[30vw] md:bottom-[20px] bottom-[20px] left-1/2 -translate-x-1/2 ${
                          i === activeIndex ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={(e) => handleImageLoad(e.target)}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* GLIDE 41 */}
          </div>
        </section>

        {/*The performance section*/}
        <section className="performance relative max-w-[1920px] mx-auto flex flex-col items-center global-padding global-margin gap-[60px]">
          <h2 className="performance_h max-w-[690px] text-white global-h2 text-center">
            {t("performance")}
          </h2>
          {/*The performance content*/}
          <div className="text-[#FFFFFF99] text-[20px] leading-[1.3] grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 font-semibold">
            {/*box one*/}
            <div className="performance_div bg-[#1F1F1F] p-[20px] rounded-[4px] flex flex-col min-h-[220px] justify-between flex">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.29297 26.5453L6.58586 25.2525C7.36691 24.4714 8.63324 24.4714 9.41429 25.2525L10.5859 26.424C11.3669 27.2051 12.6332 27.2051 13.4143 26.424L14.5859 25.2525C15.3669 24.4714 16.6332 24.4714 17.4143 25.2525L18.5859 26.424C19.3669 27.2051 20.6332 27.2051 21.4143 26.424L22.5859 25.2525C23.3669 24.4714 24.6332 24.4714 25.4143 25.2525L26.7072 26.5453M5.29297 19.8787L6.58586 18.5858C7.36691 17.8047 8.63324 17.8047 9.41429 18.5858L10.5859 19.7574C11.3669 20.5384 12.6332 20.5384 13.4143 19.7574L14.5859 18.5858C15.3669 17.8047 15.219 18.9763 16.0001 19.7574H18.5859C19.3669 20.5384 20.6332 20.5384 21.4143 19.7574L22.5859 18.5858C23.3669 17.8047 24.6332 17.8047 25.4143 18.5858L26.7072 19.8787"
                  stroke="white"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
                <path
                  d="M16 9.19608C16 9.19608 10.9804 8.67839 8.3653 10.1362C6.53046 11.1591 2.54788 13.24 4.54796 13.8968C5.25509 14.129 6.45663 13.8968 6.45663 13.8968C6.45663 13.8968 12.2545 12.9567 16 12.9567C19.7455 12.9567 25.5434 13.8968 25.5434 13.8968C25.5434 13.8968 26.7449 14.129 27.452 13.8968C29.4521 13.24 25.4695 11.1591 23.6347 10.1362C21.0196 8.67839 16 9.19608 16 9.19608ZM16 9.19608L16 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>

              <p>
                {t.rich("glideEfficiency", {
                  bold: (chunks) => <b className="text-white">{chunks}</b>,
                })}
              </p>
            </div>

            {/*box two*/}
            <div className="performance_div bg-[#1F1F1F] p-[20px] rounded-[4px] flex flex-col min-h-[220px] justify-between">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M26.6667 6.66663L4 29.3333H26.6667"
                  stroke="white"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
                <path
                  d="M2.66675 14.6667L2.66675 20M2.66675 20L8.00008 20M2.66675 20L17.3334 5.33337"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
              <p>
                {t.rich("backFootLoad", {
                  bold: (chunks) => <b className="text-white">{chunks}</b>,
                })}
              </p>
            </div>

            {/*box three*/}
            <div className="performance_div bg-[#1F1F1F] p-[20px] rounded-[4px] flex flex-col min-h-[220px] justify-between">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.9999 13.3334H18.6666M18.6666 13.3334V8.00004M18.6666 13.3334L26.6666 5.33337M7.99992 18.6667H13.3333M13.3333 18.6667V24M13.3333 18.6667L5.33325 26.6667"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
                <path
                  d="M8.00008 13.3334H13.3334M13.3334 13.3334V8.00004M13.3334 13.3334L5.33341 5.33337M24.0001 18.6667H18.6667M18.6667 18.6667V24M18.6667 18.6667L26.6667 26.6667"
                  stroke="white"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
              <p>
                {t.rich("connectLine", {
                  bold: (chunks) => <b className="text-white">{chunks}</b>,
                })}
              </p>
            </div>
          </div>
        </section>

        {/*To achieve section*/}
        <section className="achieve max-w-[1920px] mx-auto relative global-padding flex flex-col items-end gap-10 mb-[120px]">
          <h2 className="achieve_h text-[42px] md:text-[clamp(2.625rem,1.1328rem+3.1128vw,3.125rem)] lg:text-[clamp(3.125rem,0.9028rem+3.4722vw,4.375rem)] font-semibold text-[#FFFFFF99] leading-[1.1]">
            {t.rich("performance_achieve", {
              highlight: (chunks) => (
                <span className="text-white">{chunks}</span>
              ),
            })}
          </h2>

          <div className="text-[#FFFFFFCC] overflow-hidden flex items-center text-[20px] max-w-[520px] font-semibold leading-[1.3]">
            <p className="achieve_h border-l-2 border-white px-5">
              {t("construction")}
            </p>
          </div>
        </section>

        {/*The twist section*/}
        <section className="twist relative max-w-[2700px] mx-auto flex items-end gap-[20px] global-margin global-padding md:flex-row flex-col">
          {/*image div*/}
          <div className="relative flex-[60%] overflow-hidden bg-[#111111] rounded-[4px] aspect-[1/1]">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/uglide39_0001.png`}
              alt="AFS U GLide 39"
              onLoad={(e) => handleImageLoad(e.target)}
              className="twist_img min-w-[120%] -translate-x-[50%] translate-y-[40%] z-2 rotate-0"
              style={{
                filter: `drop-shadow(0px 162px 126px rgba(0, 0, 0, 0.15))`,
              }}
            />
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/UGlide_0003.png`}
              alt="AFS U GLide 41"
              onLoad={(e) => handleImageLoad(e.target)}
              className="twist_img_i absolute top-[30%] right-[27.5%] min-w-[120%] z-1 rotate-0"
              style={{
                filter: `drop-shadow(0px 162px 126px rgba(0, 0, 0, 0.15))`,
              }}
            />

            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/uglide43_0001.png`}
              alt="AFS U GLide 43"
              onLoad={(e) => handleImageLoad(e.target)}
              className="twist_img_ii absolute top-[35%] right-[15%] min-w-[120%] rotate-0"
              style={{
                filter: `drop-shadow(0px 162px 126px rgba(0, 0, 0, 0.15))`,
              }}
            />
          </div>

          {/*content div*/}
          <div className="text-white flex-[60%] flex flex-col gap-[20px]">
            <h2 className="twist_h global-h2">{t("twist")}</h2>
            <p className="relative max-w-[520px] text-[20px] text-[#FFFFFFCC] leading-[1.3] font-semibold flex flex-col gap-[20px]">
              <span className="twist_h">
                {t.rich("twist_p", {
                  bold: (chunks) => <b className="text-white">{chunks}</b>,
                })}
              </span>
              <span className="twist_h">
                {t.rich("twist_p_i", {
                  bold: (chunks) => <b className="text-white">{chunks}</b>,
                })}
              </span>
            </p>
          </div>
        </section>

        {/*Technical information section*/}
        <section className="information max-w-[1920px] relative global-padding max-w-[1440px] mx-auto global-margin flex flex-col">
          {/* Content */}
          <div className="text-white">
            {activeTab === 0 && (
              <div className="relative flex flex-col items-center justify-center">
                {/* content */}
                <div className="information_div bg-[#00000033] backdrop-blur-[20px] p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                  <h2 className="information global-h2 text-center text-white mb-20">
                    {g("Technical_s")}
                  </h2>
                  <SpecsTable data={UGlide39} />
                </div>

                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/uglide39_0002.png`}
                  alt="AFS U GLide 39"
                  style={{ height: "auto", width: "100%" }}
                  onLoad={(e) => handleImageLoad(e.target)}
                  className="md:absolute relative max-w-[1180px]"
                />
              </div>
            )}

            {activeTab === 1 && (
              <div className="relative flex flex-col items-center justify-center">
                {/* content */}
                <div className="information_div bg-[#00000033] backdrop-blur-[20px] p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                  <h2 className="information global-h2 text-center text-white mb-20">
                    {g("Technical_s")}
                  </h2>
                  <SpecsTable data={UGlide41} />
                </div>

                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/UGlide_0001-1.png`}
                  alt="AFS U GLide 41"
                  style={{ height: "auto", width: "100%" }}
                  onLoad={(e) => handleImageLoad(e.target)}
                  className="md:absolute relative max-w-[1180px]"
                />
              </div>
            )}

            {activeTab === 2 && (
              <div className="relative flex flex-col items-center justify-center">
                {/* content */}
                <div className="information_div bg-[#00000033] backdrop-blur-[20px] p-4 md:p-[30px] max-w-[520px] flex flex-col gap-5 md:gap-[25px] rounded-sm z-10 relative">
                  <h2 className="information global-h2 text-center text-white mb-20">
                    {g("Technical_s")}
                  </h2>
                  <SpecsTable data={UGlide43} />
                </div>

                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2026/02/uglide43_0002.png`}
                  alt="AFS U GLide 43"
                  style={{ height: "auto", width: "100%" }}
                  onLoad={(e) => handleImageLoad(e.target)}
                  className="md:absolute relative max-w-[1180px]"
                />
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div
            ref={navRef}
            className="information_div relative overflow-hidden rounded-full bg-[#1F1F1F] max-w-fit mx-auto mt-20"
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
                  className={`uppercase cursor-pointer relative z-10 px-[14px] py-3 rounded-full whitespace-nowrap text-sm md:text-4 font-semibold uppercase transition-colors ${
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

          <p className="information_div max-w-[420px] relative text-[#FFFFFFCC] text-center mx-auto mt-[30px] text-4 leading-[1.3] font-semibold">
            {t.rich("info", {
              bold: (chunks) => (
                <span className="text-white font-bold">{chunks}</span>
              ),
            })}
          </p>
        </section>
      </div>
    </SmoothScroll>
  );
};

export default Uglide;
