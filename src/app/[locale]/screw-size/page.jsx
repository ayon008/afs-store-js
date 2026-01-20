"use client";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
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
    const t = useTranslations("screw");

    return (
        <div className="product_dimantion min-w-full overflow-x-auto overflow-y-hidden">
            <h3 className="product_name text-[clamp(1.25rem,1.0093rem+0.7407vw,1.75rem)] font-semibold">
                {t(title)}
            </h3>
            <div className="table-container">
                <div className="specs-wrapper" data-category="foil">
                    <div className="specs-header">
                        {tableHead?.map((item, i) => {
                            const raw = t(item);
                            const needsRich = /<\s*(small|sup|br)\s*>/i.test(raw);
                            return (
                                <div className="cell" key={i}>
                                    {
                                        i === 0 ? t.rich(item, {
                                            sup: (chunks) => <sup>{chunks}</sup>,
                                        }) : needsRich
                                            ? t.rich(item, {
                                                small: (chunks) => (
                                                    <small>{chunks}</small>
                                                ),
                                            })
                                            : item ? t(item) : item
                                    }
                                </div>
                            )
                        })}
                    </div>
                    {tableRow?.map((item, i) => {
                        return (
                            <div className="specs-row" key={i}>
                                <div className="title">{item.name}</div>
                                <div className="row-data">
                                    {item.value?.map((singleItem, i) => {
                                        return (
                                            <div className="cell" key={i}>{singleItem}</div>
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

    const t = useTranslations("screw")

    const handleClick = (id) => {
        setSelectedId(id);
    }

    const data = [
        {
            id: 0,
            name: t("Caractéristique Foil - AFS"),
        },
        {
            id: 1,
            name: t("Caractéristique Foil - AFS"),
        },
        {
            id: 2,
        },
        {
            id: 3,
        }
    ]

    const locale = useLocale();
    const fr = "fr";

    return (
        <div className="global-padding pt-4 max-w-[1920px] mx-auto min-h-screen global-margin">
            <BreadCums />
            <h1 className="global-h1 lg:mt-20 mt-10">
                {t.rich("Détail et dimensions Foils / Planches", {
                    br: () => <br className="hidden lg:block" />
                })}
            </h1>
            <div className="mt-10 w-full border-b border-[#111] pb-[6px] flex items-center gap-6 flex-wrap">
                <button
                    id="0"
                    onClick={() => handleClick(0)}
                    className={`font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors hover:text-[#1D98FF] duration-200 ${selectedId === 0 ? 'text-[#1D98FF]' : 'text-[#111]'}`}>
                    {t("ALL")} <sup>(22)</sup>
                </button>
                <button id="1" onClick={() => handleClick(1)} className={`font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors hover:text-[#1D98FF] duration-200 ${selectedId === 1 ? 'text-[#1D98FF]' : 'text-[#111]'}`}>FOIL <sup>(13)</sup></button>
                <button id="2" onClick={() => handleClick(2)} className={`font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors hover:text-[#1D98FF] duration-200 ${selectedId === 2 ? 'text-[#1D98FF]' : 'text-[#111]'}`}>{t("Planche")}<sup>(3)</sup></button>
                <button id="3" onClick={() => handleClick(3)} className={`font-bold text-[18px] uppercase leading-[20px] cursor-pointer transition-colors hover:text-[#1D98FF] duration-200 ${selectedId === 3 ? 'text-[#1D98FF]' : 'text-[#111]'}`}>{t("Gamme précédente")} <sup>(6)</sup></button>
            </div>
            <div className="mt-16">
                {
                    data?.filter((item) => item.id === selectedId)?.map((item) => {
                        return (
                            <div key={item.id}>
                                <h2 className="lg:text-[32px] leading-[110%] font-bold text-[#111] text-[24px]">{item.name}</h2>
                                {item.id === 0 && <>
                                    <div className="mt-16 space-y-16">
                                        <Table title="Aile monoblock Silk"
                                            tableRow={[
                                                { name: "avion silk 650", value: ["650", "720", "8", "115", "13.7", "572", "Uhm Carbone / Ame Corecell", "0.9", "NA"] },
                                                { name: "avion silk 850", value: ["850", "824", "8", "134", "16", "555", "Uhm Carbone / Ame Corecell", "0.96", "NA"] },
                                                { name: "avion silk 1050", value: ["1050", "916", "8", "150", "17.9", "538", "Uhm Carbone / Ame Corecell", "1.0", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Longueur (mm) <small>(Bord de fuite Aile / Extrémité fuselage)</small>", "Construction", "Poids (kg)", "Visserie"]} />
                                        {/* 2nd table */}
                                        <Table title="Aile Silk Démontable"
                                            tableRow={[
                                                { name: "Avion Silk 850", value: ["850", "824", "8", "134", "16", "HR Carbone / Ame corecell", "0.7", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Avion Silk 1050", value: ["1050", "916", "8", "150", "17,9", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]} />
                                        {/* 3rd table */}
                                        <Table title="Ultra monobloc"
                                            tableRow={[
                                                { name: "Ultra 750", value: ["750", "1024", "14", "95", "12.3", "579", "UHM et HM Carbone", "1.2", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Longueur (mm) <small>(Bord de fuite Aile / Extrémité fuselage)</small>", "Construction", "Poids (kg)", "Visserie"]} />

                                        {/*  */}
                                        <Table title="Ultra Aile Avant"
                                            tableRow={[
                                                {
                                                    name: "Ultra 600",
                                                    value: ["600", "980", "16", "84", "10.8", "UHM et HM Carbone"]
                                                },
                                                {
                                                    name: "Ultra 750",
                                                    value: ["750", "1060", "15", "95", "12.3", "UHM et HM Carbone"]
                                                },
                                                {
                                                    name: "Ultra 900",
                                                    value: ["900", "1120", "14", "106", "13.9", "UHM et HM Carbone"]
                                                }
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction"]} />

                                        {/* 4th table */}
                                        <Table title="Aile Enduro"
                                            tableRow={[
                                                { name: "Enduro 1600 GLT", value: ["1600", "1323", "11", "162", "19", "HR Carbone / Ame corecell", "1.4", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 1300", value: ["1300", "1190", "11", "149", "17,8", "HR Carbone / Ame corecell", "1", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 1100", value: ["1100", "1100", "11", "136", "16.2", "HR Carbone / Ame corecell", "0.9", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 1000", value: ["1000", "1050", "11", "129.5", "15.5", "HR Carbone / Ame corecell", "0.85", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 900", value: ["900", "994", "11", "122", "14.6", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 800", value: ["800", "940", "11", "116", "13.9", "HR Carbone / Ame corecell", "0.65", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 700", value: ["700", "877", "11", "108", "12.9", "HR Carbone / Ame corecell", "0.5", "M8x20mm Torx40 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]} />

                                        {/* 5th Table */}

                                        <Table title="Aile monobloc Pure Fuselink"
                                            tableRow={[
                                                { name: "Pure 560", value: ["560 aile avant / stabilisateur", "750", "10", "-", "-", "667mm", "Uhm Carbone / HM Carbone", "1.2", "NA"] },
                                                { name: "Pure HA 800", value: ["800", "1000", "13", "100", "11.6", "572mm", "HM Carbone", "1.4", "NA"] },
                                                { name: "Pure HA 1100", value: ["1100", "1100", "11", "125", "14.5", "553mm", "HM Carbone", "1.5", "NA"] },
                                                { name: "Pure 600", value: ["600", "708", "8.4", "108", "11.4", "522mm", "HM Carbone / HR Carbone / Monolithique", "1.1", "NA"] },
                                                { name: "Pure 700", value: ["700", "820", "9.6", "112", "11.5", "574mm", "HM Carbone", "1.2", "NA"] },
                                                { name: "Pure 900", value: ["880", "900", "9.2", "137", "14.1", "555mm", "HM Carbone", "1.7", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Longueur (mm) <small>(Bord de fuite Aile / Extrémité fuselage)</small>", "Construction", "Poids (kg)", "Visserie"]} />

                                        {/* 6th Table */}
                                        <Table title="Aile Evo"
                                            tableRow={[
                                                { name: "Evo 950", value: ["950", "880", "8.1", "150", "13.5", "HR Carbone / Ame corecell", "0.7", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo 1250", value: ["1240", "970", "7.6", "185", "16.5", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo 1450", value: ["1440", "1040", "7.6", "195", "17.5", "HR Carbone / Ame corecell", "1", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo 1650", value: ["1640", "1110", "7.5", "195", "17.5", "HR Carbone / Ame corecell", "1.1", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo HA 750", value: ["750", "1000", "13.3", "113", "13.8", "HR Carbone / HM Carbone / Monolithique", "0.7", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo HA 1000", value: ["1000", "1100", "12.1", "135", "16", "HR Carbone / HM Carbone / Monolithique", "1.1", "M8x20mm Torx40 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]} />
                                        {/* 7th Table */}
                                        <Table title="Fuselage Evo"
                                            tableRow={[
                                                { name: "Fuselink standard", value: ["680mm (hors tout)", "Carbone HR monolithique", "0.6", "2 positions"] },
                                                { name: "Fuselink Short", value: ["650mm (hors tout)", "Carbone HR monolithique", "0.6", "2 positions"] },
                                                { name: "Switch", value: ["680mm (hors tout)", "Carbone HR monolithique", "0.6", "2 positions"] },
                                            ]}
                                            tableHead={["Longueur", "Construction", "Poids (kg)", "Position de stab"]} />
                                        {/* 8th Table */}
                                        <Table
                                            title="Aile avant Flyer V2"
                                            tableRow={[
                                                {
                                                    name: "Flyer 1500",
                                                    value: ["1430", "955", "6.3", "185", "20", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"]
                                                },
                                                {
                                                    name: "Flyer 1800",
                                                    value: ["1735", "1050", "6.3", "205", "22", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"]
                                                },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]}
                                        />
                                        {/* 9th Table */}
                                        <Table
                                            title="Mâts Fuselink"
                                            tableRow={[
                                                { name: "80 HR", value: ["80 cm", "135mm", "16mm (+-0.1mm)", `Carbone HR / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "2x M8x45mm Torx 40"] },
                                                { name: "80 HM", value: ["80 cm", "120mm", "15 (+-0.1mm)", `Carbone HM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "85 HM", value: ["85 cm", "120mm", "15 (+-0.1mm)", `Carbone HM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "75 UHM", value: ["75 cm", "100mm", "12.8 (±0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "80 UHM", value: ["80 cm", "115mm", "13.8 (+-0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "85 UHM", value: ["85 cm", "115mm", "13.5 (+-0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "2 kg", "0", "M8x45mm Torx 40"] },
                                                { name: "80 UHM Skinny", value: ["80", "105mm", "13.2 (+-0.1mm)", `Carbone UHM / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "1.9 kg", "0", "M8x45mm Torx 40"] },
                                                { name: "85 UHM Skinny", value: ["85", "105mm", "13.2 (+-0.1mm)", `Carbone UHM / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "2 kg", "0", "M8x45mm Torx 40"] },
                                                { name: "95 UHM", value: ["95 cm", "115mm", "14.0 (+-0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "2.05 kg", "0.5°", "M8x45mm Torx 40"] },
                                                { name: "95 UHM RACE", value: ["95 cm", "120mm", "12.3 (+-0.1mm)", `Carbone UHM / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "", "2.5°", "M8x45mm Torx 40"] },
                                                // { name: "75 UHM SKINNY", value: ["75 cm", "100", "12.8 (±0.1)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "1.5", "M8x45mm Torx 40 tête fraisée (mât/fuselage)\nM8x30mm Torx 45 tête bombée (mat/platine)"] },
                                            ]}
                                            tableHead={["Longueur", "corde", "esp", "Construction", "Poids (kg)", "Rake", "screw-size"]}
                                        />
                                        {/* 10th Table */}

                                        <Table
                                            title="Stabilisateur Silk"
                                            tableRow={[
                                                { name: "Silk 132", value: ["132", "310", "7.2", "58.8", "7.10", "HR Carbone", "0.1", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk 142", value: ["142", "330", "7.8", "58", "7", "HR Carbone", "0.1", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk 152", value: ["152", "350", "8", "57.3", "6.9", "HR Carbone", "0.1", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk HA 38", value: ["135", "380", "11.9", "43", "6.5", "HR Carbone", "0.09", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk HA 40", value: ["145", "405", "11.3", "43", "6.5", "HR Carbone", "0.09", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk HA 43", value: ["155", "430", "10.6", "43", "6.5", "HR Carbone", "0.09", "M6x12mm Torx 30 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]}
                                        />

                                        {/* 11th table */}
                                        <Table
                                            title="Stabilisateur Ultra Glide"
                                            tableRow={[
                                                { name: "Ultra glide 43", value: ["133", "430", "13.7", "48.3(mm)", "5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                                { name: "Ultra glide 41", value: ["123", "410", "13.8", "46(mm)", "5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                                { name: "Ultra glide 39", value: ["113", "390", "13.9", "44(mm)", "4.5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]}
                                        />
                                        <Table
                                            title="Stabilisateur U Curve"
                                            tableRow={[
                                                { name: "U-CARVE 130", value: ["130", "360", "10", "68", "5", `HR Carbone + HM Carbone / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "", "12mm Torx 30", ""] },
                                                { name: "U-CARVE 140", value: ["140", "375", "10", "72", "5", `HR Carbone + HM Carbone / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "", "12mm Torx 30", ""] },
                                                { name: "U-CARVE 150", value: ["150", "390", "10", "76", "5", `HR Carbone + HM Carbone / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "", "12mm Torx 30", ""] },
                                                { name: "U-CARVE 160", value: ["160", "400", "10", "80", "5", `HR Carbone + HM Carbone / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "", "12mm Torx 30", ""] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "corde", "esp", "Construction", "Poids (kg)", "screw-size", "Compatibilité"]}
                                        />

                                        {/* 12th table */}
                                        <Table
                                            title="Caractéristiques planche AFS Advanced"
                                            tableRow={[
                                                {
                                                    name: "",
                                                    value: ["5.6", "20.5", "75L", "Carbone / Glass"]
                                                },
                                                {
                                                    name: "",
                                                    value: ["6’0", "22", "90L", "Carbone Or Glass"],
                                                },
                                                {
                                                    name: "",
                                                    value: ["6.3 ", "22.5", "100L", "Carbone Or Glass"],
                                                }
                                            ]}
                                            tableHead={["Longueur (in/cm)", "Largeur (cm)", "Volume (litre)", "Construction"]}
                                        />
                                        <Table
                                            title="Dock Star"
                                            tableRow={[
                                                {
                                                    name: "Dock Star",
                                                    value: ["83", "38.5", "3", "7L", "Carbone pré-preg / Mousse Corecell Haute densité / double stringer", "Rail US 250mm", "1.75"]
                                                },
                                            ]}
                                            tableHead={["Longueur (cm)", "Largeur (cm)", "Épaisseur max (cm)", "Volume (litre)", "Construction", "Rail", "Poids (kg)"]}
                                        />
                                        <Table
                                            title="Fly One 2026"
                                            tableRow={[
                                                {
                                                    name: "Fly One S",
                                                    value: [`5'8"`, "", "", "90L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                },
                                                {
                                                    name: "Fly One M",
                                                    value: [`6'0"`, "", "", "105L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                },
                                                {
                                                    name: "Fly One L",
                                                    value: [`6'2"`, "", "", "115L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                },
                                                {
                                                    name: "Fly One XL",
                                                    value: [`6'4"`, "", "", "125L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                },
                                            ]}
                                            tableHead={["Longueur", "Largeur (cm)", "Épaisseur max (cm)", "Volume (litre)", "Construction", "Rail", "Poids (kg)", ""]}
                                        />

                                        <h2 className="lg:text-[32px] leading-[110%] font-bold text-[#111] text-[24px]">{t("Gamme précédente ( performer / flyer v1)")}</h2>

                                        <Table
                                            title="Stabilisateur Performer Surf"
                                            tableRow={[
                                                { name: "Performer Surf 160", value: ["160", "361", "8.1", "82", "8.9", "HR Carbone", "0.14", "16mm (fuselage Performer)", "Tous les fuselages"] },
                                                { name: "Performer Surf 190", value: ["190", "384", "7.7", "66.5", "9.4", "HR Carbone", "0.16", "16mm (fuselage Performer)", "Tous les fuselages"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Taille des vis", "Compatibilité"]}
                                        />
                                        <Table
                                            title="Stabilisateurs Performer RS"
                                            tableRow={[
                                                { name: "Performer RS 230", value: ["230", "435", "8.2", "58.8", "7.10", "HR Carbone", "0.16", "16mm (fuselage Performer)", "Tous les fuselages"] },
                                                { name: "Performer RS 260", value: ["260", "480", "8.8", "58.8", "7.10", "HR Carbone", "0.16", "16mm (fuselage Performer)", "Tous fuselages"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Taille des vis", "Compatibilité"]}
                                        />

                                        <Table
                                            title="Mâts Performer"
                                            tableRow={[
                                                { name: "Performer 78 HM", value: ["78 cm", "120", "14.3", "HM Carbon", "1.7", "Dépend du fuselage (Performer ou Pure)"] },
                                                { name: "Performer 78 UHM", value: ["78 cm", "120", "14.3", "UHM Carbon", "1.78", "-"] },
                                                { name: "Performer 85 HM", value: ["85 cm", "120", "14.3", "HM Carbon", "1.72", "-"] },
                                                { name: "Performer 85 UHM", value: ["85 cm", "120", "15.3", "UHM Carbon", "1.9", "-"] },
                                                { name: "Performer 97 HM", value: ["97 cm", "120", "15.3", "HM Carbon", "2.1", "-"] },
                                                { name: "Performer 97 UHM", value: ["97 cm", "120", "15.3", "UHM Carbon", "2.3", "-"] },
                                                { name: "Performer 107 HM", value: ["107 cm", "120", "15.3", "HM Carbon", "2.15", "-"] },
                                                { name: "Performer 107 UHM", value: ["107 cm", "120", "15.3", "UHM Carbon", "2.4", "-"] },
                                                { name: "Silk 80 cm", value: ["80 cm", "115", "13.8", "UHM Carbon", "1.74", "-"] },
                                                { name: "Pure 560 95 cm", value: ["95 cm", "120", "12.3", "UHM Carbon", "2.05", "-"] },
                                                { name: "Alpha 75", value: ["75 cm", "135", "16", "Carbon Prepreg", "1.7", "-"] },
                                                { name: "Alpha 85", value: ["85 cm", "135", "16", "Carbon Prepreg", "1.9", "-"] },
                                            ]}
                                            tableHead={["Longueur", "Corde minimum (mm)", "Epaisseur minimum (mm)", "Construction", "Poids (kg)", "Taille des vis (mât/fuselage)"]}
                                        />
                                        <Table
                                            title="Aile avant Flyer V1"
                                            tableRow={[
                                                { name: "Flyer 850", value: ["850", "800", "7.3", "152", "18.8", "HR Carbone", "3.1", "25mm Fuselage Performer"] },
                                                { name: "Flyer 1000", value: ["1000", "840", "7.1", "139", "19.5", "HR Carbone", "3.1", "25mm Fuselage Performer"] },
                                                { name: "Flyer 1300", value: ["1300", "1000", "7.7", "133", "20", "HR Carbone", "3.0", "25mm Fuselage Performer"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Épaisseur maximum (mm)", "Construction", "Poids foil complet (kg)", "Taille des vis"]}
                                        />

                                        <Table
                                            title="Aile Performer"
                                            tableRow={[
                                                { name: "Performer 750", value: ["750", "750", "7.5", "118", "11.88", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.62", "25mm Fuselage Performer"] },
                                                { name: "Performer 950", value: ["950", "840", "7.4", "133.65", "12.28", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.62", "25mm Fuselage Performer"] },
                                                { name: "Performer 1250", value: ["1250", "950", "7.2", "165", "17.9", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.70", "25mm Fuselage Performer"] },
                                                { name: "Performer 1450", value: ["1450", "970", "6.5", "187", "19.1", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.92", "25mm Fuselage Performer"] },
                                                { name: "Performer 1950", value: ["1950", "990", "5.9", "207", "19.4", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "1.02", "25mm Fuselage Performer"] },
                                                { name: "Performer 1900", value: ["1900", "1025", "5.7", "225", "21", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "1.2", "25mm Fuselage Performer"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Épaisseur maximum (mm)", "Construction", "Poids (kg)", "Taille des vis"]}
                                        />

                                        <Table
                                            title="Aile monobloc Pure (accostage performer)"
                                            tableRow={[
                                                { name: "Pure 700", value: ["700", "750", "8", "120", "12", "510", "UHM Kevlar Carbone", "1.75", "M8x45mm Torx 45"] },
                                                { name: "Pure 900", value: ["900", "880", "9", "130", "12", "600", "UHM Kevlar Carbone", "1.8", "M8x45mm Torx 45"] },
                                                { name: "Pure HA 800", value: ["800", "1000", "13", "100", "11.6", "592", "UHM Kevlar Carbone", "1.35", "M8x45mm Torx 45"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Épaisseur maximum (mm)", "Longueur (mm)", "Construction", "Poids (kg)", "Taille des vis mât"]}
                                        />
                                    </div>
                                </>}
                                {item.id === 1 &&
                                    <div className="mt-16 space-y-16">
                                        <Table title="Aile monoblock Silk"
                                            tableRow={[
                                                { name: "avion silk 650", value: ["650", "720", "8", "115", "13.7", "572", "Uhm Carbone / Ame Corecell", "0.9", "NA"] },
                                                { name: "avion silk 850", value: ["850", "824", "8", "134", "16", "555", "Uhm Carbone / Ame Corecell", "0.96", "NA"] },
                                                { name: "avion silk 1050", value: ["1050", "916", "8", "150", "17.9", "538", "Uhm Carbone / Ame Corecell", "1.0", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Longueur (mm) <small>(Bord de fuite Aile / Extrémité fuselage)</small>", "Construction", "Poids (kg)", "Visserie"]} />
                                        {/* 2nd table */}
                                        <Table title="Aile Silk Démontable"
                                            tableRow={[
                                                { name: "Avion Silk 850", value: ["850", "824", "8", "134", "16", "HR Carbone / Ame corecell", "0.7", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Avion Silk 1050", value: ["1050", "916", "8", "150", "17,9", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]} />
                                        {/* 3rd table */}
                                        <Table title="Ultra monobloc"
                                            tableRow={[
                                                { name: "Ultra 750", value: ["750", "1024", "14", "95", "12.3", "579", "UHM et HM Carbone", "1.2", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Longueur (mm) <small>(Bord de fuite Aile / Extrémité fuselage)</small>", "Construction", "Poids (kg)", "Visserie"]} />

                                        <Table title="Ultra Aile Avant"
                                            tableRow={[
                                                {
                                                    name: "Ultra 600",
                                                    value: ["600", "980", "16", "84", "10.8", "UHM et HM Carbone"]
                                                },
                                                {
                                                    name: "Ultra 750",
                                                    value: ["750", "1060", "15", "95", "12.3", "UHM et HM Carbone"]
                                                },
                                                {
                                                    name: "Ultra 900",
                                                    value: ["900", "1120", "14", "106", "13.9", "UHM et HM Carbone"]
                                                }
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction"]} />

                                        {/* 4th table */}
                                        <Table title="Aile Enduro"
                                            tableRow={[
                                                { name: "Enduro 1600 GLT", value: ["1600", "1323", "11", "162", "19", "HR Carbone / Ame corecell", "1.4", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 1300", value: ["1300", "1190", "11", "149", "17,8", "HR Carbone / Ame corecell", "1", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 1100", value: ["1100", "1100", "11", "136", "16.2", "HR Carbone / Ame corecell", "0.9", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 1000", value: ["1000", "1050", "11", "129.5", "15.5", "HR Carbone / Ame corecell", "0.85", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 900", value: ["900", "994", "11", "122", "14.6", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 800", value: ["800", "940", "11", "116", "13.9", "HR Carbone / Ame corecell", "0.65", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Enduro 700", value: ["700", "877", "11", "108", "12.9", "HR Carbone / Ame corecell", "0.5", "M8x20mm Torx40 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]} />

                                        {/* 5th Table */}

                                        <Table title="Aile monobloc Pure Fuselink"
                                            tableRow={[
                                                { name: "Pure 560", value: ["560 aile avant / stabilisateur", "750", "10", "-", "-", "667mm", "Uhm Carbone / HM Carbone", "1.2", "NA"] },
                                                { name: "Pure HA 800", value: ["800", "1000", "13", "100", "11.6", "572mm", "HM Carbone", "1.4", "NA"] },
                                                { name: "Pure HA 1100", value: ["1100", "1100", "11", "125", "14.5", "553mm", "HM Carbone", "1.5", "NA"] },
                                                { name: "Pure 600", value: ["600", "708", "8.4", "108", "11.4", "522mm", "HM Carbone / HR Carbone / Monolithique", "1.1", "NA"] },
                                                { name: "Pure 700", value: ["700", "820", "9.6", "112", "11.5", "574mm", "HM Carbone", "1.2", "NA"] },
                                                { name: "Pure 900", value: ["880", "900", "9.2", "137", "14.1", "555mm", "HM Carbone", "1.7", "NA"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Longueur (mm) <small>(Bord de fuite Aile / Extrémité fuselage)</small>", "Construction", "Poids (kg)", "Visserie"]} />

                                        {/* 6th Table */}
                                        <Table title="Aile Evo"
                                            tableRow={[
                                                { name: "Evo 950", value: ["950", "880", "8.1", "150", "13.5", "HR Carbone / Ame corecell", "0.7", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo 1250", value: ["1240", "970", "7.6", "185", "16.5", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo 1450", value: ["1440", "1040", "7.6", "195", "17.5", "HR Carbone / Ame corecell", "1", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo 1650", value: ["1640", "1110", "7.5", "195", "17.5", "HR Carbone / Ame corecell", "1.1", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo HA 750", value: ["750", "1000", "13.3", "113", "13.8", "HR Carbone / HM Carbone / Monolithique", "0.7", "M8x20mm Torx40 tête fraisée"] },
                                                { name: "Evo HA 1000", value: ["1000", "1100", "12.1", "135", "16", "HR Carbone / HM Carbone / Monolithique", "1.1", "M8x20mm Torx40 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]} />
                                        {/* 7th Table */}
                                        <Table title="Fuselage Evo"
                                            tableRow={[
                                                { name: "Fuselink standard", value: ["680mm (hors tout)", "Carbone HR monolithique", "0.6", "2 positions"] },
                                                { name: "Fuselink Short", value: ["650mm (hors tout)", "Carbone HR monolithique", "0.6", "2 positions"] },
                                                { name: "Switch", value: ["680mm (hors tout)", "Carbone HR monolithique", "0.6", "2 positions"] },
                                            ]}
                                            tableHead={["Longueur", "Construction", "Poids (kg)", "Position de stab"]} />
                                        {/* 8th Table */}
                                        <Table
                                            title="Aile avant Flyer V2"
                                            tableRow={[
                                                {
                                                    name: "Flyer 1500",
                                                    value: ["1430", "955", "6.3", "185", "20", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"]
                                                },
                                                {
                                                    name: "Flyer 1800",
                                                    value: ["1735", "1050", "6.3", "205", "22", "HR Carbone / Ame corecell", "0.8", "M8x20mm Torx40 tête fraisée"]
                                                },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]}
                                        />
                                        {/* 9th Table */}
                                        <Table
                                            title="Mâts Fuselink"
                                            tableRow={[
                                                { name: "80 HR", value: ["80 cm", "135mm", "16mm (+-0.1mm)", `Carbone HR / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "2x M8x45mm Torx 40"] },
                                                { name: "80 HM", value: ["80 cm", "120mm", "15 (+-0.1mm)", `Carbone HM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "85 HM", value: ["85 cm", "120mm", "15 (+-0.1mm)", `Carbone HM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "75 UHM", value: ["75 cm", "100mm", "12.8 (±0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "80 UHM", value: ["80 cm", "115mm", "13.8 (+-0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "", "0", "M8x45mm Torx 40"] },
                                                { name: "85 UHM", value: ["85 cm", "115mm", "13.5 (+-0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "2 kg", "0", "M8x45mm Torx 40"] },
                                                { name: "80 UHM Skinny", value: ["80", "105mm", "13.2 (+-0.1mm)", `Carbone UHM / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "1.9 kg", "0", "M8x45mm Torx 40"] },
                                                { name: "85 UHM Skinny", value: ["85", "105mm", "13.2 (+-0.1mm)", `Carbone UHM / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "2 kg", "0", "M8x45mm Torx 40"] },
                                                { name: "95 UHM", value: ["95 cm", "115mm", "14.0 (+-0.1mm)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "2.05 kg", "0.5°", "M8x45mm Torx 40"] },
                                                { name: "95 UHM RACE", value: ["95 cm", "120mm", "12.3 (+-0.1mm)", `Carbone UHM / ${locale === "fr" ? "Monolithique" : "Monolithic"}`, "", "2.5°", "M8x45mm Torx 40"] },
                                                // { name: "75 UHM SKINNY", value: ["75 cm", "100", "12.8 (±0.1)", `Carbone UHM / ${locale === fr ? "Âme Corecell" : "Corecell core"}`, "1.5", "M8x45mm Torx 40 tête fraisée (mât/fuselage)\nM8x30mm Torx 45 tête bombée (mat/platine)"] },
                                            ]}
                                            tableHead={["Longueur", "corde", "esp", "Construction", "Poids (kg)", "Rake", "screw-size"]}
                                        />
                                        {/* 10th Table */}

                                        <Table
                                            title="Stabilisateur Silk"
                                            tableRow={[
                                                { name: "Silk 132", value: ["132", "310", "7.2", "58.8", "7.10", "HR Carbone", "0.1", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk 142", value: ["142", "330", "7.8", "58", "7", "HR Carbone", "0.1", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk 152", value: ["152", "350", "8", "57.3", "6.9", "HR Carbone", "0.1", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk HA 38", value: ["135", "380", "11.9", "43", "6.5", "HR Carbone", "0.09", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk HA 40", value: ["145", "405", "11.3", "43", "6.5", "HR Carbone", "0.09", "M6x12mm Torx 30 tête fraisée"] },
                                                { name: "Silk HA 43", value: ["155", "430", "10.6", "43", "6.5", "HR Carbone", "0.09", "M6x12mm Torx 30 tête fraisée"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]}
                                        />

                                        {/* 11th table */}
                                        <Table
                                            title="Stabilisateur Ultra Glide"
                                            tableRow={[
                                                { name: "Ultra glide 43", value: ["133", "430", "13.7", "48.3(mm)", "5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                                { name: "Ultra glide 41", value: ["123", "410", "13.8", "46(mm)", "5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                                { name: "Ultra glide 39", value: ["113", "390", "13.9", "44(mm)", "4.5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Visserie"]}
                                        />

                                        <Table
                                            title="Stabilisateur U Curve"
                                            tableRow={[
                                                { name: "Ultra glide 43", value: ["133", "430", "13.7", "48.3(mm)", "5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                                { name: "Ultra glide 41", value: ["123", "410", "13.8", "46(mm)", "5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                                { name: "Ultra glide 39", value: ["113", "390", "13.9", "44(mm)", "4.5mm", `HM Carbone / ${locale === "fr" ? "Âme HM Carbone" : "HM Carbon Core"}`, "", "12mm Torx 30"] },
                                            ]}
                                            tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "screw-size", "Compatibilité"]}
                                        />

                                    </div>
                                }
                                {
                                    item.id === 2 && (
                                        <div className="mt-16 space-y-16">

                                            <Table
                                                title="Dock Star"
                                                tableRow={[
                                                    {
                                                        name: "Dock Star",
                                                        value: ["83", "38.5", "3", "7L", "Carbone pré-preg / Mousse Corecell Haute densité / double stringer", "Rail US 250mm", "1.75"]
                                                    },
                                                ]}
                                                tableHead={["Longueur (cm)", "Largeur (cm)", "Épaisseur max (cm)", "Volume (litre)", "Construction", "Rail", "Poids (kg)"]}
                                            />

                                            <Table
                                                title="Caractéristiques planche AFS Advanced"
                                                tableRow={[
                                                    {
                                                        name: "",
                                                        value: ["5.6", "20.5", "75L", "Carbone / Glass"]
                                                    },
                                                    {
                                                        name: "",
                                                        value: ["6’0", "22", "90L", "Carbone Or Glass"],
                                                    },
                                                    {
                                                        name: "",
                                                        value: ["6.3 ", "22.5", "100L", "Carbone Or Glass"],
                                                    }
                                                ]}
                                                tableHead={["Longueur (in/cm)", "Largeur (cm)", "Volume (litre)", "Construction"]}
                                            />
                                            <Table
                                                title="Fly One 2026"
                                                tableRow={[
                                                    {
                                                        name: "Fly One S",
                                                        value: [`5'8"`, "", "", "90L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                    },
                                                    {
                                                        name: "Fly One M",
                                                        value: [`6'0"`, "", "", "105L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                    },
                                                    {
                                                        name: "Fly One L",
                                                        value: [`6'2"`, "", "", "115L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                    },
                                                    {
                                                        name: "Fly One XL",
                                                        value: [`6'4"`, "", "", "125L", `${locale === "fr" ? "Fiber de verre" : "Fiberglass"} / sandwitch PVC`, "Double US 250mm", "", "Insert / Pads"]
                                                    },
                                                ]}
                                                tableHead={["Longueur", "Largeur (cm)", "Épaisseur max (cm)", "Volume (litre)", "Construction", "Rail", "Poids (kg)", ""]}
                                            />
                                        </div>
                                    )
                                }
                                {
                                    item.id === 3 && (
                                        <div className="mt-16 space-y-16">
                                            <h2 className="lg:text-[32px] leading-[110%] font-bold text-[#111] text-[24px]">{t("Gamme précédente ( performer / flyer v1)")}</h2>

                                            <Table
                                                title="Stabilisateur Performer Surf"
                                                tableRow={[
                                                    { name: "Performer Surf 160", value: ["160", "361", "8.1", "82", "8.9", "HR Carbone", "0.14", "16mm (fuselage Performer)", "Tous les fuselages"] },
                                                    { name: "Performer Surf 190", value: ["190", "384", "7.7", "66.5", "9.4", "HR Carbone", "0.16", "16mm (fuselage Performer)", "Tous les fuselages"] },
                                                ]}
                                                tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Taille des vis", "Compatibilité"]}
                                            />
                                            <Table
                                                title="Stabilisateurs Performer RS"
                                                tableRow={[
                                                    { name: "Performer RS 230", value: ["230", "435", "8.2", "58.8", "7.10", "HR Carbone", "0.16", "16mm (fuselage Performer)", "Tous les fuselages"] },
                                                    { name: "Performer RS 260", value: ["260", "480", "8.8", "58.8", "7.10", "HR Carbone", "0.16", "16mm (fuselage Performer)", "Tous fuselages"] },
                                                ]}
                                                tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Epaisseur maximum (mm)", "Construction", "Poids (kg)", "Taille des vis", "Compatibilité"]}
                                            />

                                            <Table
                                                title="Mâts Performer"
                                                tableRow={[
                                                    { name: "Performer 78 HM", value: ["78 cm", "120", "14.3", "HM Carbon", "1.7", "Dépend du fuselage (Performer ou Pure)"] },
                                                    { name: "Performer 78 UHM", value: ["78 cm", "120", "14.3", "UHM Carbon", "1.78", "-"] },
                                                    { name: "Performer 85 HM", value: ["85 cm", "120", "14.3", "HM Carbon", "1.72", "-"] },
                                                    { name: "Performer 85 UHM", value: ["85 cm", "120", "15.3", "UHM Carbon", "1.9", "-"] },
                                                    { name: "Performer 97 HM", value: ["97 cm", "120", "15.3", "HM Carbon", "2.1", "-"] },
                                                    { name: "Performer 97 UHM", value: ["97 cm", "120", "15.3", "UHM Carbon", "2.3", "-"] },
                                                    { name: "Performer 107 HM", value: ["107 cm", "120", "15.3", "HM Carbon", "2.15", "-"] },
                                                    { name: "Performer 107 UHM", value: ["107 cm", "120", "15.3", "UHM Carbon", "2.4", "-"] },
                                                    { name: "Silk 80 cm", value: ["80 cm", "115", "13.8", "UHM Carbon", "1.74", "-"] },
                                                    { name: "Pure 560 95 cm", value: ["95 cm", "120", "12.3", "UHM Carbon", "2.05", "-"] },
                                                    { name: "Alpha 75", value: ["75 cm", "135", "16", "Carbon Prepreg", "1.7", "-"] },
                                                    { name: "Alpha 85", value: ["85 cm", "135", "16", "Carbon Prepreg", "1.9", "-"] },
                                                ]}
                                                tableHead={["Longueur", "Corde minimum (mm)", "Epaisseur minimum (mm)", "Construction", "Poids (kg)", "Taille des vis (mât/fuselage)"]}
                                            />
                                            <Table
                                                title="Aile avant Flyer V1"
                                                tableRow={[
                                                    { name: "Flyer 850", value: ["850", "800", "7.3", "152", "18.8", "HR Carbone", "3.1", "25mm Fuselage Performer"] },
                                                    { name: "Flyer 1000", value: ["1000", "840", "7.1", "139", "19.5", "HR Carbone", "3.1", "25mm Fuselage Performer"] },
                                                    { name: "Flyer 1300", value: ["1300", "1000", "7.7", "133", "20", "HR Carbone", "3.0", "25mm Fuselage Performer"] },
                                                ]}
                                                tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Épaisseur maximum (mm)", "Construction", "Poids foil complet (kg)", "Taille des vis"]}
                                            />

                                            <Table
                                                title="Aile Performer"
                                                tableRow={[
                                                    { name: "Performer 750", value: ["750", "750", "7.5", "118", "11.88", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.62", "25mm Fuselage Performer"] },
                                                    { name: "Performer 950", value: ["950", "840", "7.4", "133.65", "12.28", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.62", "25mm Fuselage Performer"] },
                                                    { name: "Performer 1250", value: ["1250", "950", "7.2", "165", "17.9", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.70", "25mm Fuselage Performer"] },
                                                    { name: "Performer 1450", value: ["1450", "970", "6.5", "187", "19.1", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "0.92", "25mm Fuselage Performer"] },
                                                    { name: "Performer 1950", value: ["1950", "990", "5.9", "207", "19.4", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "1.02", "25mm Fuselage Performer"] },
                                                    { name: "Performer 1900", value: ["1900", "1025", "5.7", "225", "21", `HR Carbone / ${locale === fr ? "Âme corecell" : "Corecell core"}`, "1.2", "25mm Fuselage Performer"] },
                                                ]}
                                                tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Épaisseur maximum (mm)", "Construction", "Poids (kg)", "Taille des vis"]}
                                            />

                                            <Table
                                                title="Aile monobloc Pure (accostage performer)"
                                                tableRow={[
                                                    { name: "Pure 700", value: ["700", "750", "8", "120", "12", "510", "UHM Kevlar Carbone", "1.75", "M8x45mm Torx 45"] },
                                                    { name: "Pure 900", value: ["900", "880", "9", "130", "12", "600", "UHM Kevlar Carbone", "1.8", "M8x45mm Torx 45"] },
                                                    { name: "Pure HA 800", value: ["800", "1000", "13", "100", "11.6", "592", "UHM Kevlar Carbone", "1.35", "M8x45mm Torx 45"] },
                                                ]}
                                                tableHead={["SURFACE (CM<sup>2</sup>)", "Envergure (mm)", "ASPECT RATIO", "Corde maximum (mm)", "Épaisseur maximum (mm)", "Longueur (mm)", "Construction", "Poids (kg)", "Taille des vis mât"]}
                                            />
                                        </div>
                                    )
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