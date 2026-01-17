"use client";
import { alliance } from "@/fonts/Alliance";
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



const Table = ({ title, tableRow, tableHead, className }) => {
    return (
        // <div className="table-container">
        //     <div className="specs-wrapper">
        //         <div className="specs-header">
        //             {tableHead?.map((item) => {
        //                 return (
        //                     <div className="cell w-[150px]" key={item} dangerouslySetInnerHTML={{ __html: item }}></div>
        //                 )
        //             })}
        //         </div>
        //         {tableRow?.map((item) => {
        //             return (
        //                 <div className="specs-row min-w-full" key={item.name}>
        //                     <div className="title">{item.name}</div>
        //                     <div className="row-data">
        //                         {item.value?.map((singleItem) => {
        //                             return (
        //                                 <div className="cell w-[150px] bg-green-500" key={singleItem}>{singleItem}</div>
        //                             )
        //                         })}
        //                     </div>
        //                 </div>
        //             )
        //         })}
        //     </div>
        // </div>
        <div className="table-container">
            <div className="specs-wrapper" data-category="foil">
                <div className="specs-header">
                    <div className="cell">
                        Surface (cm<sup>2</sup>)
                    </div>

                    <div className="cell">Wingspan (mm)</div>
                    <div className="cell">Aspect Ratio</div>
                    <div className="cell">Maximum heart rate (mm)</div>
                    <div className="cell">Maximum thickness (mm)</div>

                    <div className="cell multi-line">
                        <div>Length (mm)</div>
                        <div className="subtext">(Wing trailing edge / Fuselage end)</div>
                    </div>

                    <div className="cell">Construction</div>
                    <div className="cell">Weight (kg)</div>
                    <div className="cell">Screws</div>
                </div>

                <div className="specs-row">
                    <div className="title">Avion Silk 650</div>
                    <div className="row-data">
                        <div className="cell">650</div>
                        <div className="cell">720</div>
                        <div className="cell">8</div>
                        <div className="cell">115</div>
                        <div className="cell">13,7</div>
                        <div className="cell">572</div>
                        <div className="cell">UHM Carbone / Ame corecell</div>
                        <div className="cell">0.9</div>
                        <div className="cell">THAT</div>
                    </div>
                </div>

                <div className="specs-row">
                    <div className="title">Avion Silk 850</div>
                    <div className="row-data">
                        <div className="cell">850</div>
                        <div className="cell">824</div>
                        <div className="cell">8</div>
                        <div className="cell">134</div>
                        <div className="cell">16</div>
                        <div className="cell">555</div>
                        <div className="cell">UHM Carbone / Ame corecell</div>
                        <div className="cell">0.96</div>
                        <div className="cell">THAT</div>
                    </div>
                </div>

                <div className="specs-row">
                    <div className="title">Avion Silk 1050</div>
                    <div className="row-data">
                        <div className="cell">1050</div>
                        <div className="cell">916</div>
                        <div className="cell">8</div>
                        <div className="cell">150</div>
                        <div className="cell">17,9</div>
                        <div className="cell">538</div>
                        <div className="cell">UHM Carbone / Ame corecell</div>
                        <div className="cell">1.0</div>
                        <div className="cell">THAT</div>
                    </div>
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
            name: "Foil Characteristic - AFS",
            tables: [],
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
                            </div>
                        )
                    })
                }
            </div>
            <div className="my-16">
                <Table title="Family Monoblock Silk"
                    tableRow={[
                        { name: "avion silk 650", value: ["650", "720", "8", "115", "13.7", "572", "Uhm Carbone / Ame Corecell", "0.9", "that"] },
                    ]}
                    tableHead={["SURFACE (CM<sup>2</sup>)", "Wingspan (MM)", "ASPECT RATIO", "MAXIMUM HEART RATE (MM)", "MAXIMUM THICKNESS (MM)", "LENGTH (MM) <br/> <small>(WING TRAILING EDGE / FUSELAGE END)</small>", "Construction", "Weight (KG)", "Screws"]} />
            </div>
        </div>
    )
}

export default Page;