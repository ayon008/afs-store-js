"use client";
import { useEffect, useState } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * Composant qui affiche une barre de progression en haut de la page
 * pendant les transitions de route
 */
export default function RouteLoadingBar() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Détecter les clics sur les liens de navigation
        const handleLinkClick = (e) => {
            const target = e.target.closest('a[href]');
            if (target && target.href) {
                const href = target.getAttribute('href');
                // Ignorer les liens externes, ancres et mailto
                if (href && 
                    !href.startsWith('http') && 
                    !href.startsWith('#') && 
                    !href.startsWith('mailto:') &&
                    !href.startsWith('tel:')) {
                    setIsLoading(true);
                    setProgress(0);
                }
            }
        };

        // Détecter les clics sur les boutons de navigation (discover, etc.)
        const handleButtonClick = (e) => {
            const button = e.target.closest('button');
            if (button) {
                const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
                const buttonText = button.textContent?.toLowerCase() || '';
                // Détecter les boutons de navigation
                if (ariaLabel.includes('discover') || 
                    buttonText.includes('discover') ||
                    button.classList.contains('navigation-button')) {
                    setIsLoading(true);
                    setProgress(0);
                }
            }
        };

        // Écouter les événements personnalisés de navigation
        const handleNavigationStart = () => {
            setIsLoading(true);
            setProgress(0);
        };

        document.addEventListener('click', handleLinkClick, true);
        document.addEventListener('click', handleButtonClick, true);
        window.addEventListener('navigation:start', handleNavigationStart);

        return () => {
            document.removeEventListener('click', handleLinkClick, true);
            document.removeEventListener('click', handleButtonClick, true);
            window.removeEventListener('navigation:start', handleNavigationStart);
        };
    }, []);

    useEffect(() => {
        if (isLoading) {
            // Simuler une progression rapide au début
            setProgress(30);
            
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 5;
                });
            }, 30);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    useEffect(() => {
        // Quand la route change, compléter la barre puis la masquer
        if (isLoading) {
            setProgress(100);
            const timer = setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [pathname, isLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
            <div
                className="h-full bg-blue-500 transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

