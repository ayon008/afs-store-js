"use client"
import { recommendations } from '@/data/recommend'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'

const BreadCums = () => {
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-gray-500'>
                <Link className='inline hover:underline' href='/'>HOME</Link> / <Link className='inline hover:underline' href='/blog/categories/dockstart'>DOCKSTART</Link> / <span className='text-black'>Foil Configurator</span>
            </div>
        </div>
    )
}

const Page = () => {
    const [weight, setWeight] = useState(75);
    const [practice, setPractice] = useState('');
    const [subpractice, setSubpractice] = useState('');
    const [level, setLevel] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [showSubpractice, setShowSubpractice] = useState(false);

    const updateWeightOutput = (e) => {
        setWeight(e.target.value);
    }

    const updatePractice = (e) => {
        const selectedPractice = e.target.value;
        setPractice(selectedPractice);

        // Reset subpractice when practice changes
        setSubpractice('');

        // Show subpractice section only for wingfoil
        if (selectedPractice === "wingfoil") {
            setShowSubpractice(true);
        } else {
            setShowSubpractice(false);
        }
    }

    const updateSubpractice = (e) => {
        setSubpractice(e.target.value);
    }

    const updateLevel = (e) => {
        setLevel(e.target.value);
    }

    // Update recommendation whenever inputs change
    useEffect(() => {
        if (!practice || !level) {
            setRecommendation('Veuillez sélectionner toutes les options pour obtenir une recommandation.');
            return;
        }

        // If wingfoil is selected but no subpractice, wait for it
        if (practice === 'wingfoil' && !subpractice) {
            setRecommendation('Veuillez sélectionner une sous-pratique pour Wing Foil.');
            return;
        }

        // Adjust weight to nearest 5kg
        const adjustedWeight = Math.max(40, Math.min(150, Math.round(weight / 5) * 5));

        // Find matching recommendation
        const match = recommendations.find(rec =>
            rec.Pratique === practice &&
            (rec["Sous-Pratique"] || "") === subpractice &&
            rec.Niveau === level &&
            rec["Poids (kg)"] == adjustedWeight
        );

        if (match) {
            // Make URLs clickable
            const urlMatch = match.Recommandation.match(/https?:\/\/[^\s]+/);
            const url = urlMatch ? urlMatch[0] : "#";
            const recommendationText = match.Recommandation.replace(url, `<a href="${url}" target="_blank" class="text-blue-600 hover:underline">${url}</a>`);
            setRecommendation(recommendationText);
        } else {
            setRecommendation('Désolé, aucune recommandation spécifique trouvée pour cette combinaison.');
        }
    }, [practice, subpractice, weight, level]);

    return (
        <div className='max-w-6xl mx-auto px-4 pt-4 global-margin'>
            <BreadCums />
            <div className="my-10 lg:my-20">
                <h1 className='text-4xl lg:text-5xl font-bold text-center'>Foil Configurator</h1>
            </div>

            {/* Pratique */}
            <div className="mb-8">
                <div className="text-3xl font-bold mb-4 text-gray-900">Pratique :</div>

                {[
                    { id: "supfoil", value: "supfoil", label: "Sup Foil", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/02/afs-whitebird-scaled.jpeg" },
                    { id: "wingfoil", value: "wingfoil", label: "Wing Foil", img: "https://afs-foiling.com/fr/wp-content/uploads/2023/11/afs-fire-scaled.jpg" },
                    { id: "surffoil", value: "surffoil", label: "Surf Foil", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/03/background.png" },
                    { id: "downwind", value: "downwind", label: "Downwind", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/02/afs-blackbird-v2.jpeg" },
                    { id: "dockstart", value: "dockstart", label: "Dockstart", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/10/Action-sk8-9.png" },
                    { id: "wakefoil", value: "wakefoil", label: "Wakefoil", img: "https://afs-foiling.com/fr/wp-content/uploads/2023/10/Action-sk8-35.png" },
                    { id: "windfoil", value: "windfoil", label: "Windfoil", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/09/AFS_Wind_Aile_S.jpg" }
                ].map(option => (
                    <div key={option.id} className="flex items-center mb-4">
                        <Image
                            width={100}
                            height={100}
                            src={option.img}
                            alt={option.label}
                            className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-md mr-3"
                        />
                        <input
                            type="radio"
                            id={option.id}
                            name="practice"
                            value={option.value}
                            checked={practice === option.value}
                            onChange={updatePractice}
                            className="mr-2"
                        />
                        <label htmlFor={option.id} className="text-xl text-gray-700 cursor-pointer">{option.label}</label>
                    </div>
                ))}
            </div>

            {/* Sous-pratique Wingfoil */}
            {showSubpractice && (
                <div className="mb-8">
                    <div className="text-3xl font-bold mb-4 text-gray-900">Sous-Pratique Wing Foil :</div>
                    {[
                        { id: "freestyle", value: "freestyle", label: "Freestyle", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/09/jump-afs.jpg" },
                        { id: "wave", value: "wave", label: "Wave", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/01/Rectangle-22.png" },
                        { id: "race", value: "race", label: "Race", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/06/diamond-V2-3.jpg" },
                        { id: "freeride", value: "freeride", label: "Freeride", img: "https://afs-foiling.com/fr/wp-content/uploads/2023/10/cat-wing-foil-gwen.jpeg" },
                        { id: "unknown", value: "unknown", label: "C'est quoi ces mots barbares ?", img: "https://afs-foiling.com/fr/wp-content/uploads/2024/12/depositphotos_163039262-stock-photo-outraged-woman-asking-what-the.webp" }
                    ].map(option => (
                        <div key={option.id} className="flex items-center mb-4">
                            <Image
                                width={100}
                                height={100}
                                src={option.img}
                                alt={option.label}
                                className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-md mr-3"
                            />
                            <input
                                type="radio"
                                id={option.id}
                                name="subpractice"
                                value={option.value}
                                checked={subpractice === option.value}
                                onChange={updateSubpractice}
                                className="mr-2"
                            />
                            <label htmlFor={option.id} className="text-xl text-gray-700 cursor-pointer">{option.label}</label>
                        </div>
                    ))}
                </div>
            )}

            {/* Poids */}
            <div className="mb-8">
                <div className="text-3xl font-bold mb-4 text-gray-900">Poids du pratiquant :</div>
                <input
                    type="range"
                    id="weight"
                    min="40"
                    max="150"
                    value={weight}
                    className="w-full h-2 rounded-lg cursor-pointer"
                    step="1"
                    onChange={updateWeightOutput}
                />
                <output className='block mt-2 font-bold text-lg' id="weightOutput">{weight} kg</output>
            </div>

            {/* Niveau */}
            <div className="mb-8">
                <div className="text-3xl font-bold mb-4 text-gray-900">Niveau :</div>
                {[
                    { id: "beginner", value: "beginner", label: "Débutant complet" },
                    { id: "first-flights", value: "first-flights", label: "Premiers vols" },
                    { id: "autonomous", value: "autonomous", label: "Autonome (je sais remonter au vent)" },
                    { id: "good-rider", value: "good-rider", label: "Bon rider" },
                    { id: "pro", value: "pro", label: "Pro" }
                ].map(option => (
                    <div key={option.id} className="mb-3">
                        <input
                            type="radio"
                            id={option.id}
                            name="level"
                            value={option.value}
                            checked={level === option.value}
                            onChange={updateLevel}
                            className="mr-2"
                        />
                        <label htmlFor={option.id} className="text-xl text-gray-700 cursor-pointer">{option.label}</label>
                    </div>
                ))}
            </div>

            {/* Result */}
            <div className="mt-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
                <h2 className="text-2xl font-bold mb-3">Recommandation :</h2>
                <p className="text-lg" dangerouslySetInnerHTML={{ __html: recommendation }}></p>
            </div>
        </div>
    )
}

export default Page;