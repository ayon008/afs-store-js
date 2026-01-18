"use client"
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react'
import './index.css'
import { data } from '@/data/data-comparatif';

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

const Page = () => {

    const [frontWing, setFrontWing] = useState('');
    const [stabilizers, setStabilizers] = useState([]);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);


    const calculateCompatibility = () => {
        if (!frontWing) {
            alert('Veuillez sélectionner une aile avant.');
            return;
        }
        if (stabilizers.length === 0 || stabilizers.length > 3) {
            alert('Veuillez sélectionner entre 1 et 3 stabilisateurs.');
            return;
        }

        const calculatedResults = stabilizers.map(stabilizer => {
            return data.find(d => d["Aile Avant"] === frontWing && d["Stabilisateur"] === stabilizer);
        });

        setResults(calculatedResults);
        setShowResults(true);
    };

    const handleStabilizerChange = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setStabilizers(selected);
    };

    return (
        <div className='global-padding pt-4 max-w-[1920px] mx-auto global-margin'>
            <BreadCums />
            <h1 className='global-h1 lg:my-[80px] my-10 text-center'>Sélectionne ton aile avant et 3 stabs pour les comparer</h1>


            <div className="calculator-container">
                <form id="tool1Form">
                    <div className="form-group">
                        <label htmlFor="frontWing">Aile avant</label>
                        <select id="frontWing" value={frontWing} onChange={(e) => setFrontWing(e.target.value)}>
                            <option value="">-- Sélectionne une aile avant --</option>
                            <optgroup label="Gamme Enduro">
                                <option value="Enduro 700">Enduro 700</option>
                                <option value="Enduro 900">Enduro 900</option>
                                <option value="Enduro 1100">Enduro 1100</option>
                                <option value="Enduro 1300">Enduro 1300</option>
                                <option value="Enduro 1600GLT">Enduro 1600GLT</option>
                            </optgroup>
                            <optgroup label="Gamme Pure">
                                <option value="Pure 700">Pure 700</option>
                                <option value="Pure 900">Pure 900</option>
                                <option value="Pure HA800">Pure HA800</option>
                                <option value="Pure HA1100">Pure HA1100</option>
                            </optgroup>
                            <optgroup label="Gamme Ultra">
                                <option value="Ultra 750">Ultra 750</option>
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
                            <optgroup label="Gamme Performer">
                                <option value="Performer 950">Performer 950</option>
                                <option value="Performer 1250">Performer 1250</option>
                                <option value="Performer 1450">Performer 1450</option>
                                <option value="Performer 1650">Performer 1650</option>
                                <option value="Performer 1900">Performer 1900</option>
                            </optgroup>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="stabilizers">Stabilisateurs (jusqu&apos;à 3)</label>
                        <small>Tu peux maintenir la touche Ctrl (ou Cmd sur Mac) pour sélectionner/désélectionner des options.</small>
                        <select id="stabilizers" size="6" multiple value={stabilizers} onChange={handleStabilizerChange}>
                            <optgroup label="Gamme Cruiser">
                                <option value="Cruiser 190">Cruiser 190</option>
                                <option value="Cruiser 220">Cruiser 220</option>
                                <option value="Cruiser 245">Cruiser 245</option>
                            </optgroup>
                            <optgroup label="Gamme Pure">
                                <option value="Pure 145">Pure 145</option>
                                <option value="Pure 150">Pure 150</option>
                                <option value="Pure HA135">Pure HA135</option>
                                <option value="Pure HA165">Pure HA165</option>
                            </optgroup>
                            <optgroup label="Gamme Silk">
                                <option value="Silk 132">Silk 132</option>
                                <option value="Silk 142">Silk 142</option>
                                <option value="Silk 152">Silk 152</option>
                                <option value="Silk HA38">Silk HA38</option>
                                <option value="Silk HA40">Silk HA40</option>
                                <option value="Silk HA43">Silk HA43</option>
                            </optgroup>
                            <optgroup label="Gamme Ultra">
                                <option value="Ultra Glide 41">Ultra Glide 41</option>
                            </optgroup>
                        </select>
                    </div>
                    <button type="button" onClick={calculateCompatibility}>Calculer</button>
                </form>
                {showResults && (
                    <div className="results">
                        <div
                            className="results-container"
                            style={{ gridTemplateColumns: `repeat(${stabilizers.length}, 1fr)` }}
                        >
                            {results.map((result, index) => (
                                <div key={index} className="result-item">
                                    {result ? (
                                        <ul>
                                            <li><strong>Stabilisateur:</strong> {result["Stabilisateur"]}</li>
                                            <li><strong>Carving Access:</strong> {result["Carving Access"]}</li>
                                            <li><strong>Carving:</strong> {result["Carving"]}</li>
                                            <li><strong>Downwind Access:</strong> {result["Downwind Access"]}</li>
                                            <li><strong>Downwind:</strong> {result["Downwind"]}</li>
                                            <li><strong>Freeride Access:</strong> {result["Freeride Access"]}</li>
                                            <li><strong>Freeride:</strong> {result["Freeride"]}</li>
                                            <li><strong>Freestyle:</strong> {result["Freestyle"]}</li>
                                            <li><strong>Freerace:</strong> {result["Freerace"]}</li>
                                            <li><strong>Wave:</strong> {result["Wave"]}</li>
                                        </ul>
                                    ) : (
                                        <p>Aucune donnée trouvée pour le stabilisateur: {stabilizers[index]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Page;
