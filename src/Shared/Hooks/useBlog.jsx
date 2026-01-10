"use client"
import { useEffect } from "react";
import { data } from "@/data";

export function useBlog(ref) {
    useEffect(() => {
        if (!ref.current) return;
        function calculateCompatibility() {
            const frontWing = document.getElementById('frontWing').value;
            const stabilizers = Array.from(document.getElementById('stabilizers').selectedOptions).map(opt => opt.value);

            if (!frontWing) {
                alert('Veuillez sélectionner une aile avant.');
                return;
            }

            if (stabilizers.length === 0 || stabilizers.length > 3) {
                alert('Veuillez sélectionner entre 1 et 3 stabilisateurs.');
                return;
            }

            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = "";
            resultsContainer.style.gridTemplateColumns = `repeat(${stabilizers.length}, 1fr)`;

            stabilizers.forEach(stabilizer => {
                const result = data.find(d => d["Aile Avant"] === frontWing && d["Stabilisateur"] === stabilizer);

                if (result) {
                    resultsContainer.innerHTML += `
                        <div class="result-item">
                            <ul>
                                <li><strong>Stabilisateur:</strong> ${result["Stabilisateur"]}</li>
                                <li><strong>Carving Access:</strong> ${result["Carving Access"]}</li>
                            
                                <li><strong>Carving:</strong> ${result["Carving"]}</li>
                                <li><strong>Downwind Access:</strong> ${result["Downwind Access"]}</li>
                                <li><strong>Downwind:</strong> ${result["Downwind"]}</li>
                                <li><strong>Freeride Access:</strong> ${result["Freeride Access"]}</li>
                                <li><strong>Freeride:</strong> ${result["Freeride"]}</li>
                                <li><strong>Freestyle:</strong> ${result["Freestyle"]}</li>
                                <li><strong>Freerace:</strong> ${result["Freerace"]}</li>
                                <li><strong>Wave:</strong> ${result["Wave"]}</li>
                            </ul>
                        </div>
                    `;
                } else {
                    resultsContainer.innerHTML += `
                        <div class="result-item">
                            <p>Aucune donnée trouvée pour le stabilisateur: ${stabilizer}</p>
                        </div>
                    `;
                }
            });

            document.getElementById('results').style.display = 'block';
        }
    }, [ref]);
}
