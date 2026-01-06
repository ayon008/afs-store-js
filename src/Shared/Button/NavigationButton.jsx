"use client";
import React, { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import FormButton from './FormButton';

/**
 * Composant de bouton de navigation avec feedback immédiat
 * Affiche un état de chargement dès le clic pour améliorer l'UX
 */
const NavigationButton = ({ href, label, className = "" }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        
        // Feedback immédiat
        setIsNavigating(true);
        
        // Navigation avec transition
        startTransition(() => {
            router.push(href);
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending || isNavigating}
            className={className}
            aria-label={label}
        >
            <FormButton 
                label={isPending || isNavigating ? "..." : label}
                disabled={isPending || isNavigating}
            />
        </button>
    );
};

export default NavigationButton;


