"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React, { useState } from "react";



const BreadCums = () => {
    const t = useTranslations("breadcum");
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <span className='text-black'> Foil Details and Dimensions</span>
            </div>
        </div>
    )
}



const Table = ({ title, tableRow, tableHead }) => {
    return (
        <div class="product_dimantion min-w-full overflow-x-auto overflow-y-hidden">
            <h3 class="product_name text-[clamp(1.25rem,1.0093rem+0.7407vw,1.75rem)] font-semibold">
                {title}
            </h3>
            <div class="table-container">
                <div class="specs-wrapper" data-category="foil">
                    <div class="specs-header">
                        {tableHead?.map((item) => {
                            return (
                                <div className="cell" key={item} dangerouslySetInnerHTML={{ __html: item }}></div>
                            )
                        })}
                    </div>
                    {tableRow?.map((item) => {
                        return (
                            <div class="specs-row" key={item.name}>
                                <div class="title">{item.name}</div>
                                <div class="row-data">
                                    {item.value?.map((singleItem) => {
                                        return (
                                            <div class="cell" key={singleItem}>{singleItem}</div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}


const Page = () => {
    const [selectedId, setSelectedId] = useState(0);

    const handleClick = (id) => {
        setSelectedId(id);
    }

    const data = [
        {
            id: 0,
            name: "Caractéristique Foil - AFS",
        }
    ]

    return (
        <div className="global-padding pt-4 max-w-[1920px] mx-auto min-h-screen">
            <BreadCums />
            <h1 className="global-h1 lg:mt-20 mt-10">
                Details and <br className="hidden lg:block" /> dimensions of <br className="hidden lg:block" /> foils/boards
            </h1>
            <div className="mt-10 w-full border-b border-[#111] pb-[6px] flex items-center gap-6">
                <button
                    id="0"
                    onClick={() => handleClick(0)}
                    className="font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors text-[#111] hover:text-[#1D98FF] duration-200">
                    ALL <sup>(20)</sup>
                </button>
                <button id="1" onClick={() => handleClick(1)} className="font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors text-[#111] hover:text-[#1D98FF] duration-200">FOIL <sup>(20)</sup></button>
                <button id="2" onClick={() => handleClick(2)} className="font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors text-[#111] hover:text-[#1D98FF] duration-200">PLATE <sup>(20)</sup></button>
                <button id="3" onClick={() => handleClick(3)} className="font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors text-[#111] hover:text-[#1D98FF] duration-200">PREVIOUS Range <sup>(20)</sup></button>
            </div>
            <div className="mt-16">
                {
                    data?.filter((item) => item.id === selectedId)?.map((item) => {
                        return (
                            <div key={item.id}>
                                <h2 className="lg:text-[32px] leading-[110%] font-bold text-[#111] text-[24px]">{item.name}</h2>
                                {item.id === 0 &&
                                    <div className="mt-16 space-y-16">
                                        <Table title="Aile monoblock Silk"
                                            tableRow={[
                                                { name: "avion silk 650", value: ["650", "720", "8", "115", "13.7", "572", "Uhm Carbone / Ame Corecell", "0.9", "NA"] },
                                                { name: "avion silk 850", value: ["850", "824", "8", "134", "16", "555", "Uhm Carbone / Ame Corecell", "0.96", "NA"] },
                                                { name: "avion silk 1050", value: ["1050", "916", "8", "150", "17.9", "538", "Uhm Carbone / Ame Corecell", "1.0", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Wingspan (MM)", "ASPECT RATIO", "MAXIMUM HEART RATE (MM)", "MAXIMUM THICKNESS (MM)", "LENGTH (MM) <br/> <small>(WING TRAILING EDGE / FUSELAGE END)</small>", "Construction", "Weight (KG)", "Screws"]} />
                                        <Table title="Aile monoblock Silk"
                                            tableRow={[
                                                { name: "avion silk 650", value: ["650", "720", "8", "115", "13.7", "572", "Uhm Carbone / Ame Corecell", "0.9", "NA"] },
                                                { name: "avion silk 850", value: ["850", "824", "8", "134", "16", "555", "Uhm Carbone / Ame Corecell", "0.96", "NA"] },
                                                { name: "avion silk 1050", value: ["1050", "916", "8", "150", "17.9", "538", "Uhm Carbone / Ame Corecell", "1.0", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Wingspan (MM)", "ASPECT RATIO", "MAXIMUM HEART RATE (MM)", "MAXIMUM THICKNESS (MM)", "LENGTH (MM) <br/> <small>(WING TRAILING EDGE / FUSELAGE END)</small>", "Construction", "Weight (KG)", "Screws"]} />
                                    </div>
                                }
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default Page;