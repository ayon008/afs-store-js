"use client";
import React, { useState } from 'react';
import { data } from '@/data/best-sab';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

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

const FoilSelector = () => {
    const [aileAvant, setAileAvant] = useState('');
    const [pratique, setPratique] = useState('');
    const [resultats, setResultats] = useState([]);

    const pratiqueMapping = {
        "Accessibilité": "Freeride",
        "Sauter": "Freestyle",
        "Glider": "Downwind",
        "Pumper": "Downwind",
        "Manœuvrabilité": "Wave",
        "Vitesse": "Freerace",
        "Portance": "Downwind"
    };

    const genererPodium = () => {
        // Vérifier que les deux champs soient sélectionnés
        if (!aileAvant) {
            alert("Veuillez sélectionner une aile avant.");
            return;
        }
        if (!pratique) {
            alert("Veuillez sélectionner une pratique.");
            return;
        }

        const mappedPratique = pratiqueMapping[pratique];
        const resultatsFiltrés = data
            .filter(item => item["Aile Avant"] === aileAvant)
            .sort((a, b) => (parseInt(b[mappedPratique] || 0) - parseInt(a[mappedPratique] || 0)))
            .slice(0, 3);

        setResultats(resultatsFiltrés);
    };

    const getResultClass = (index, count) => {
        if (count === 1) {
            return "only-one";
        } else if (count === 2) {
            return index === 0 ? "only-two-1" : "only-two-2";
        } else {
            // count === 3
            if (index === 0) return "first-place";
            if (index === 1) return "second-place";
            if (index === 2) return "third-place";
        }
        return "";
    };

    return (
        <div className="global-padding pt-4 max-w-[1920px] mx-auto">
            <BreadCums />
            <div id="configurateur">
                <h1 className="global-h1 lg:my-[80px] my-10">Best match stab</h1>
                <div id="selectionForm">
                    <label htmlFor="aileAvant">Choisis ton aile avant :</label>
                    <select
                        id="aileAvant"
                        name="aileAvant"
                        value={aileAvant}
                        onChange={(e) => setAileAvant(e.target.value)}
                    >
                        <option value="" disabled>-- Choisis ton aile avant --</option>
                        <optgroup label="Gamme Pure">
                            <option value="Pure 700">Pure 700</option>
                            <option value="Pure 900">Pure 900</option>
                            <option value="Pure HA800">Pure HA800</option>
                            <option value="Pure HA1100">Pure HA1100</option>
                        </optgroup>
                        <optgroup label="Gamme Silk">
                            <option value="Silk 650">Silk 650</option>
                            <option value="Silk 850">Silk 850</option>
                            <option value="Silk 1050">Silk 1050</option>
                        </optgroup>
                        <optgroup label="Gamme Evo">
                            <option value="Evo 950">Evo 950</option>
                            <option value="Evo 1250">Evo 1250</option>
                            <option value="Evo 1450">Evo 1450</option>
                            <option value="Evo 1650">Evo 1650</option>
                            <option value="Evo HA750">Evo HA750</option>
                            <option value="Evo HA1000">Evo HA1000</option>
                        </optgroup>
                        <optgroup label="Gamme Flyer">
                            <option value="Flyer 1500">Flyer 1500</option>
                            <option value="Flyer 1800">Flyer 1800</option>
                        </optgroup>
                        <optgroup label="Gamme Enduro">
                            <option value="Enduro 700">Enduro 700</option>
                            <option value="Enduro 900">Enduro 900</option>
                            <option value="Enduro 1100">Enduro 1100</option>
                            <option value="Enduro 1300">Enduro 1300</option>
                            <option value="Enduro 1600GLT">Enduro 1600GLT</option>
                        </optgroup>
                        <optgroup label="Gamme Ultra">
                            <option value="Ultra 750">Ultra 750</option>
                        </optgroup>
                    </select>

                    <label htmlFor="pratique">Choisis ta pratique :</label>
                    <select
                        id="pratique"
                        name="pratique"
                        value={pratique}
                        onChange={(e) => setPratique(e.target.value)}
                    >
                        <option value="" disabled>-- Choisis ta pratique --</option>
                        <option value="Accessibilité">Accessibilité</option>
                        <option value="Sauter">Sauter</option>
                        <option value="Glider">Glider</option>
                        <option value="Pumper">Pumper</option>
                        <option value="Manœuvrabilité">Manœuvrabilité</option>
                        <option value="Vitesse">Vitesse</option>
                        <option value="Portance">Portance</option>
                    </select>

                    <button type="button" id="genererPodium" onClick={genererPodium}>
                        Générer le podium
                    </button>
                </div>

                <div id="podium">
                    <div id="resultats">
                        {resultats.length === 0 ? null : (
                            resultats.map((resultat, index) => (
                                <div
                                    key={index}
                                    className={`resultat ${getResultClass(index, resultats.length)}`}
                                >
                                    <img src={resultat.Image} alt={resultat.Stabilisateur} />
                                    <h3>{index + 1} - {resultat.Stabilisateur}</h3>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoilSelector;