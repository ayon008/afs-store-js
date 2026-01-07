"use client"
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'


const BreadCums = () => {
    const t = useTranslations("breadcum");
    const locale = useLocale();
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>{t("home")}</Link> / <Link className='inline' href={locale === "en" ? "/blog/categories/dockstart-en" : "/blog/categories/dockstart"}>DOCKSTAR</Link> / <span className='text-black'>Foil Configurator</span>
            </div>
        </div>
    )
}


const Page = () => {
    const [weight, setWeight] = useState(75);
    // onchange="updatePractice()"

    const updateWeightOutput = (e) => {
        setWeight(e.target.value);
    }

    return (
        <div className='global-padding pt-4'>
            <BreadCums />
            <div className="lg:my-[80px] my-10">
                <h1 className='global-h1 text-center'>Foil Configurator</h1>
            </div>
            <div className="criteria">
                <div className="criteria-title">Pratique :</div>

                <div class="practice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/02/afs-whitebird-scaled.jpeg"
                        alt="Sup Foil"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="supfoil" name="practice" value="supfoil" />
                    <label htmlFor="supfoil" class="criteria-label">Sup Foil</label>
                </div>
                <div class="practice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2023/11/afs-fire-scaled.jpg"
                        alt="Wing Foil"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="wingfoil" name="practice" value="wingfoil" />
                    <label htmlFor="wingfoil" class="criteria-label">Wing Foil</label>
                </div>
                <div class="practice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/03/background.png"
                        alt="Surf Foil"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="surffoil" name="practice" value="surffoil" />
                    <label htmlFor="surffoil" class="criteria-label">Surf Foil</label>
                </div>
                <div class="practice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/02/afs-blackbird-v2.jpeg"
                        alt="Downwind"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="downwind" name="practice" value="downwind" />
                    <label htmlFor="downwind" class="criteria-label">Downwind</label>
                </div>
                <div class="practice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/10/Action-sk8-9.png"
                        alt="Dockstart"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="dockstart" name="practice" value="dockstart" />
                    <label htmlFor="dockstart" class="criteria-label">Dockstart</label>
                </div>
                <div class="practice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2023/10/Action-sk8-35.png"
                        alt="Wakefoil"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="wakefoil" name="practice" value="wakefoil" />
                    <label htmlFor="wakefoil" class="criteria-label">Wakefoil</label>
                </div>
                <div class="practice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/09/AFS_Wind_Aile_S.jpg"
                        alt="Windfoil"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="windfoil" name="practice" value="windfoil" />
                    <label htmlFor="windfoil" class="criteria-label">Windfoil</label>
                </div>
            </div>
            {/* Sous-pratique Wingfoil  */}
            {/* onchange="updateRecommendation()" */}
            <div class="criteria" id="subpractice-section">
                <div class="criteria-title">Sous-Pratique Wing Foil :</div>
                <div class="subpractice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/09/jump-afs.jpg"
                        alt="Freestyle"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="freestyle" name="subpractice" value="freestyle" />
                    <label for="freestyle" class="criteria-label">Freestyle</label>
                </div>
                <div class="subpractice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/Rectangle-22.png"
                        alt="Wave"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="wave" name="subpractice" value="wave" />
                    <label for="wave" class="criteria-label">Wave</label>
                </div>
                <div class="subpractice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/06/diamond-V2-3.jpg"
                        alt="Race"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="race" name="subpractice" value="race" />
                    <label for="race" class="criteria-label">Race</label>
                </div>
                <div class="subpractice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2023/10/cat-wing-foil-gwen.jpeg"
                        alt="Freeride"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="freeride" name="subpractice" value="freeride" />
                    <label htmlFor="freeride" class="criteria-label">Freeride</label>
                </div>
                <div class="subpractice-option">
                    <Image
                        src="https://afs-foiling.com/fr/wp-content/uploads/2024/12/depositphotos_163039262-stock-photo-outraged-woman-asking-what-the.webp"
                        alt="Jesaispas"
                        width={100}
                        height={100}
                    />
                    <input type="radio" id="unknown" name="subpractice" value="unknown" />
                    <label htmlFor="unknown" class="criteria-label">C&apos;est quoi ces mots barbares ?</label>
                </div>
            </div>
            {/*  */}
            <div className="criteria w-full">
                <div className="criteria-title">Poids du pratiquant :</div>
                <input type="range" id="weight" min="40" max="150" value={weight} className="w-full" step="1" onChange={updateWeightOutput} />
                <output className='font-bold' id="weightOutput">{weight} kg</output>
            </div>
        </div>
    )
}

export default Page;