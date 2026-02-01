"use client";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const STREAM_LANDING_SELECTOR = "#stream-landing";
const LANDING_SECTION_SELECTOR = "#product-landing-section";

const SingleNavBar = ({ setIsLanding, data, isLanding }) => {
    const title = data?.name;
    const acf = data?.acf;
    const caracteristiques = acf?.caracteristiques;
    const compatibilite = acf?.compatibilite;
    const programme = acf?.programme;
    const thumbnail_one = acf?.thumbnail_one;
    const [visible, setVisible] = useState(false);


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
            });
        });
        return () => ctx.revert();
    }, [isLanding]);

    // 🔑 ONLY ADDITION — post-layout refresh
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                ScrollTrigger.refresh(true);
            });
        });
    }, [isLanding]);

    return (
        <div className="bg-black sticky top-0 z-30">
            <div className="global-padding flex items-center justify-between py-[10px]">
                <h2 className="lg:text-[28px] text-lg leading-[100%] font-bold text-white ">
                    {title}
                </h2>
                <div className="flex items-center gap-4">
                    {!!acf && !!thumbnail_one && (
                        <Link
                            onClick={() => setIsLanding(false)}
                            href={"#reviews"}
                            className="text-white md:block hidden"
                        >
                            Reviews
                        </Link>
                    )}
                    {!!caracteristiques && (
                        <Link
                            onClick={() => setIsLanding(false)}
                            href={"#characteristics"}
                            className="text-white md:block hidden"
                        >
                            Characteristics
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            if (!visible && !isLanding) {
                                setIsLanding(!isLanding);
                            } else {
                                setIsLanding(false);
                            }

                            // Temporarily disable CSS smooth scroll
                            const html = document.documentElement;
                            const prevScrollBehavior = html.style.scrollBehavior;
                            html.style.scrollBehavior = "auto";

                            window.scrollTo(0, 0); // instant jump

                            // restore previous scroll behavior
                            html.style.scrollBehavior = prevScrollBehavior;
                        }}
                        className="text-white bg-[#1D98FF] uppercase lg:p-3 p-2 text-sm flex items-center gap-1 font-bold rounded-sm cursor-pointer"
                    >
                        {!visible && !isLanding ? "Learn More" : "Buy Now"}{" "}
                        <ArrowUpRight strokeWidth={3} className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SingleNavBar;