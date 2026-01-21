"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function HeroAbout() {
    const container = useRef(null);
    const heroImage = useRef(null);
    const aboutImage = useRef(null);


    useGSAP(() => {
        if (!heroImage.current || !aboutImage.current) return;

        const heroRect = heroImage.current.getBoundingClientRect();
        console.log(heroRect,'heroRect');
        
        const aboutRect = aboutImage.current.getBoundingClientRect();

        const scaleX = heroRect.width / aboutRect.width;
        const scaleY = heroRect.height / aboutRect.height;

        const translateX = heroRect.left - aboutRect.left;
        const translateY = heroRect.top - aboutRect.top;

        const ctx = gsap.context(() => {
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: heroImage.current,
                    endTrigger: aboutImage.current,
                    start: "top center",
                    end: "bottom top",
                    scrub: true,
                    markers: true,
                    invalidateOnRefresh: true,
                }
            });
            // Set initial state (at hero position)
            gsap.set(aboutImage.current, {
                x: translateX,
                y: translateY,
                scaleX: scaleX,
                scaleY: scaleY,
                transformOrigin: "top left",
                rotate: 10,
            });

            // Animate back to original position
            timeline.to(aboutImage.current, {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                transformOrigin: "top left",
                rotate: 0,
                ease: "none"
            });

        }, { scope: container });

        return () => ctx.revert();
    }, []);


    const handleImageLoad = () => {
        ScrollTrigger.refresh();
    };

    return (
        <div ref={container} className=" bg-black">
            {/* HERO */}
            <div className="hero relative max-w-[1920px] mx-auto global-padding global-margin">
                <div className="py-20 flex flex-col flex-wrap items-center gap-[24px] text-center text-[16px] md:text-[20px]">
                    <h3 className="text-[#FFFFFF99] leading-[1] font-bold uppercase">
                        designed to feel the wave.
                    </h3>
                    <h2 className="text-[clamp(4.375rem,1.4647rem+6.0711vw,8.75rem)] text-white leading-[1]">
                        The U-Carve range
                    </h2>
                    <p className="text-[#FFFFFF99] leading-[1.3] font-semibold max-w-[531px]">
                        This range is designed to elevate three essential on-water
                        sensations: glide, precision, and pure carving feel.
                    </p>
                </div>

                <div className="hero-img flex-1 flex items-center justify-center mt-10 -mb-[7.5%]">
                    <div className="relative scale-[1.2]  after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:bg-inherit after:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_100%)] after:filter after:blur-[12px] flex justify-center">
                        <Image
                            ref={heroImage}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/ucrave150_0001-2.png"
                            alt="AFS U Carve Stabilizer"
                            width={1920}
                            height={1080}
                            className="max-w-full h-auto opacity-[.9]"
                        />
                    </div>
                </div>

                <div className="relative hero_text z-1 space-y-[32px]">
                    <h3 className="global-h1 !font-semibold text-white">
                        The U Carve range is built around a full-base concept, with a
                        generous mounting footprint that delivers stiffness and a precise,
                        dependable feel underfoot.
                    </h3>
                </div>
            </div>

            {/* ABOUT */}
            <div className="relative max-w-[1920px] mx-auto mb-20">
                {/*about content*/}
                <div className="relative z-1 max-w-[655px] mx-auto text-center space-y-[25px] global-padding">
                    {/* <h2 className="global-h2 text-white">
                        For riders who carve, connect, and draw lines
                    </h2> */}
                    {/* <p className="max-w-[531px] mx-auto text-[#FFFFFF99] leading-[1.3] font-semibold max-w-[531px] text-[16px] md:text-[20px]">
                        The range is aimed at both committed carving-focused wingers and
                        demanding surf foilers seeking the perfect blend of connection,
                        pumping efficiency, and expressive riding in the wave, plus
                        downwinders who love drawing clean lines. It allows you to shape
                        your turns in a fluid, instinctive and fully intuitive way, for a
                        lively, efficient, and inspiring glide.
                    </p> */}
                </div>

                {/*about img*/}
                <div
                    className="relative flex -space-x-[16%] transform -rotate-10 scale-[1.2] opacity-[0.8] -mt-[7.5%]
                      after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-black/40 after:z-[10]"
                >
                    <div className="relative z-[3] relative ">
                        <Image
                            src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/ucrave150_0001-2.png"
                            alt="AFS U Carve Stabilizer"
                            width={1920}
                            height={1080}
                            className="max-w-full h-auto opacity-[.9]"
                        />
                    </div>

                    <div className="about_img relative z-[4] relative   after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:bg-inherit after:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_100%)] after:filter after:blur-[12px] flex justify-center">
                        <Image
                            ref={aboutImage}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/ucrave150_0001-2.png"
                            alt="AFS U Carve Stabilizer"
                            width={1920}
                            height={1080}
                            className="max-w-full h-auto opacity-[.9]"
                        />
                    </div>

                    <div className="relative z-[2] relative flex justify-center">
                        <Image
                            src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/ucrave150_0001-2.png"
                            alt="AFS U Carve Stabilizer"
                            width={1920}
                            height={1080}
                            className="max-w-full h-auto opacity-[.9]"
                        />
                    </div>

                    <div className="relative  flex justify-center">
                        <Image
                            src="https://staging.afs-foiling.com/wp-content/uploads/2026/01/ucrave150_0001-2.png"
                            alt="AFS U Carve Stabilizer"
                            width={1920}
                            height={1080}
                            className="max-w-full h-auto opacity-[.9]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}