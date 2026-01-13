"use client";
import { useEffect, useState } from 'react';

/**
 * Wrapper pour les composants loading.jsx
 * Empêche l'affichage si NavigationShimmer est déjà actif
 */
export default function LoadingWrapper({ children }) {
    const [shouldShow, setShouldShow] = useState(true);

    useEffect(() => {
        // Vérifier si un shimmer est déjà actif au montage
        const checkShimmerActive = () => {
            if (typeof window !== 'undefined' && window.__shimmerActive) {
                setShouldShow(false);
            } else {
                setShouldShow(true);
            }
        };

        // Vérifier immédiatement
        checkShimmerActive();

        // Écouter les événements de changement d'état du shimmer
        const handleShimmerChange = () => {
            checkShimmerActive();
        };

        // Écouter les événements personnalisés
        window.addEventListener('shimmer:active', handleShimmerChange);
        window.addEventListener('shimmer:inactive', handleShimmerChange);

        return () => {
            window.removeEventListener('shimmer:active', handleShimmerChange);
            window.removeEventListener('shimmer:inactive', handleShimmerChange);
        };
    }, []);

    if (!shouldShow) return null;

    return <>{children}</>;
}
