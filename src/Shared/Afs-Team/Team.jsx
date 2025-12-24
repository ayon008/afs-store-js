"use client"
import TeamImage from "./TeamImage";
const image = "/assets/images/Team/Rectangle-10.jpg";
const hoverImage = "/assets/images/Team/Rectangle-11-1.jpg.webp";
const image2 = "/assets/images/Team/Image-de-OneDrive-1_11zon-scaled.jpg";
const hoverImage2 = "/assets/images/Team/Photo-DSC-9853-from-OneDrive_11zon-1-1_11zon-scaled.jpg.webp";
const image3 = "/assets/images/Team/DSC1470-2_11zon-scaled.jpg";
const hoverImage3 = "/assets/images/Team/DSC1481-2_11zon-scaled.jpg.webp";
const image4 = "/assets/images/Team/Rectangle-15.jpg";
const hoverImage4 = "/assets/images/Team/Rectangle-14.jpg.webp";
const image5 = "/assets/images/Team/DSC9878-scaled.jpg";
const hoverImage5 = "/assets/images/Team/Rectangle-16.jpg.webp";
const image6 = "/assets/images/Team/Rectangle-17.jpg";
const hoverImage6 = "/assets/images/Team/Rectangle-18.jpg.webp";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useRef, useState } from 'react';
import TeamCard from "../Card/TeamCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger)

const Team = ({ data }) => {
    const t = useTranslations("afs-team");
    const { administration, marketing, burue, logistique, commerce, production_foil, production_plances } = data;
    // const teamRef = useRef(null);
    const contentRef = useRef(null)
    const [activeId, setActiveId] = useState("foil");


    console.log(activeId);



    useGSAP(() => {
        if (!contentRef.current) return;
        const ids = document.querySelectorAll(".team-section");
        const ctx = gsap.context(() => {
            ids.forEach(h => {
                ScrollTrigger.create({
                    trigger: h,
                    start: "top center", // When h2 center reaches viewport center
                    end: "top bottom",
                    onEnter: () => {
                        setActiveId(h.id);
                    },
                    onEnterBack: () => {
                        setActiveId(h.id);
                    },
                    markers: false
                });
            });
        }, contentRef);
        return () => ctx.revert();
    }, [activeId])

    return (
        <div className="flex items-start justify-between relative h-full min-h-screen gap-10">
            <div className="lg:w-[18%] w-0 hidden lg:block z-30 h-fit sticky top-[174px]">
                <div>
                    <h3 className="text-xl uppercase font-semibold">{t("team")}</h3>
                    <ul className="mt-4 space-y-6 text-gray-400">
                        <li onClick={() => setActiveId("foil")}
                            className={`uppercase font-semibold hover:text-black text-base leading-[130%] cursor-pointer ${activeId === "foil" ? "text-black" : ""} flex items-center gap-1`}>
                            <Link href="#foil" className="flex items-center gap-1">{activeId === "foil" && <ArrowRight className="w-5 h-5" />}
                                {t("p-foils")}
                            </Link>
                        </li>

                        <li onClick={() => setActiveId("plances")} className={`uppercase font-semibold hover:text-black text-base leading-[130%] cursor-pointer ${activeId === "plances" ? "text-black" : ""} flex items-center gap-1`}>
                            <Link href="#plances" className="flex items-center gap-1">{activeId === "plances" && <ArrowRight className="w-5 h-5" />}
                                {t("boards")}
                            </Link>
                        </li>

                        <li onClick={() => setActiveId("burue")} className={`uppercase font-semibold hover:text-black text-base leading-[130%] cursor-pointer ${activeId === "burue" ? "text-black" : ""} flex items-center gap-1`}>
                            <Link href="#burue" className="flex items-center gap-1">{activeId === "burue" && <ArrowRight className="w-5 h-5" />}
                                {t("bur")}
                            </Link>
                        </li>

                        <li onClick={() => setActiveId("logistic")} className={`uppercase font-semibold hover:text-black text-base leading-[130%] cursor-pointer ${activeId === "logistic" ? "text-black" : ""} flex items-center gap-1`}>
                            <Link href="#logistic" className="flex items-center gap-1">{activeId === "logistic" && <ArrowRight className="w-5 h-5" />}
                                {t("logistics")}
                            </Link>
                        </li>

                        <li onClick={() => setActiveId("commerce")} className={`uppercase font-semibold hover:text-black text-base leading-[130%] cursor-pointer ${activeId === "commerce" ? "text-black" : ""} flex items-center gap-1`}>
                            <Link href="#commerce" className="flex items-center gap-1">{activeId === "commerce" && <ArrowRight className="w-5 h-5" />}
                                {t("commerce")}
                            </Link>
                        </li>

                        <li onClick={() => setActiveId("marketing")} className={`uppercase font-semibold hover:text-black text-base leading-[130%] cursor-pointer ${activeId === "marketing" ? "text-black" : ""} flex items-center gap-1`}>
                            <Link href="#marketing" className="flex items-center gap-1">{activeId === "marketing" && <ArrowRight className="w-5 h-5" />}
                                MARKETING</Link>
                        </li>

                        <li onClick={() => setActiveId("administration")} className={`uppercase font-semibold hover:text-black text-base leading-[130%] cursor-pointer ${activeId === "administration" ? "text-black" : ""} flex items-center gap-1`}>
                            <Link href="#administration" className="flex items-center gap-1">{activeId === "administration" && <ArrowRight className="w-5 h-5" />}
                                ADMINISTRATION</Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="lg:w-[82%] w-full mt-4" ref={contentRef}>
                <div className="flex items-center justify-center w-[90%] mx-auto">
                    <div className="mb-10 flex items-center justify-center lg:gap-3 gap-[6px]">
                        <p className="global-h1">40</p>
                        <p className="lg:text-[30px] text-2xl font-bold leading-[110%] tracking-[-0.01em]">
                            {t("number")} <br />
                            {t("foil-co")}
                        </p>
                    </div>
                </div>

                {/* Production Foils */}
                <div id="foil" className="team-section">
                    <TeamImage
                        hoverSrc={hoverImage}
                        src={image}
                        text={t("p-foils")}
                    />
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-5 gap-[10px] my-8">
                        {production_foil?.map((member, i) => {
                            return (
                                <div key={i}>
                                    <TeamCard member={member} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Production Plances */}
                <div id="plances" className="team-section">
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-6 gap-[10px]"></div>
                    <TeamImage
                        src={image2}
                        hoverSrc={hoverImage2}
                        text={t("boards")}
                    />
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-5 gap-[10px] my-8">
                        {production_plances?.map((member, i) => {
                            return (
                                <div key={i}>
                                    <TeamCard member={member} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div id="burue" className="team-section">
                    {/* Burue */}
                    <TeamImage
                        src={image3}
                        hoverSrc={hoverImage3}
                        text={t("bur")}
                    />
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-5 gap-[10px] my-8">
                        {burue?.map((member, i) => {
                            return (
                                <div key={i}>
                                    <TeamCard member={member} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div id="logistic" className="team-section">
                    <TeamImage src={image4} hoverSrc={hoverImage4} text={t("logistics")} />
                    {/*Logisitc member-role=2133  */}
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-5 gap-[10px] my-8">
                        {logistique?.map((member, i) => {
                            return (
                                <div key={i}>
                                    <TeamCard member={member} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div id="commerce" className="team-section">
                    {/* Commerce */}
                    <p className="text-center global-h2">Commerce</p>
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-5 gap-[10px] my-8">
                        {commerce?.map((member, i) => {
                            return (
                                <div key={i}>
                                    <TeamCard member={member} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div id="marketing" className="team-section">
                    {/* Marketing */}
                    <TeamImage src={image5} hoverSrc={hoverImage5} text={"MARKETING"} />
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-5 gap-[10px] my-8">
                        {marketing?.map((member, i) => {
                            return (
                                <div key={i}>
                                    <TeamCard member={member} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div id="administration" className="team-section">
                    <TeamImage
                        src={image6}
                        hoverSrc={hoverImage6}
                        text={"ADMINISTRATION"}
                    />
                    {/* Administration member-role=2485 */}
                    <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 lg:gap-5 gap-[10px] my-8">
                        {administration?.map((member, i) => {
                            return (
                                <div key={i}>
                                    <TeamCard member={member} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Team;
