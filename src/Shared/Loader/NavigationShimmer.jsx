"use client";
import { useEffect, useState, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import PageShimmer from './PageShimmerServer';

// État global pour éviter les doubles shimmers
if (typeof window !== 'undefined') {
    window.__shimmerActive = window.__shimmerActive || false;
}

/**
 * Composant qui affiche un shimmer pendant la navigation entre les pages
 * S'affiche dès qu'un clic sur un lien est détecté
 * Ne s'affiche pas si un autre shimmer est déjà actif
 */
export default function NavigationShimmer() {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);
    const navigationTimeoutRef = useRef(null);

    useEffect(() => {
        // Détecter les clics sur les liens de navigation
        const handleLinkClick = (e) => {
            // Vérifier si un shimmer est déjà actif
            if (window.__shimmerActive) {
                return;
            }

            const target = e.target.closest('a[href]');
            if (target) {
                const href = target.getAttribute('href');
                if (!href) return;
                
                const currentPath = window.location.pathname;
                
                // Ignorer les liens externes, ancres, mailto et tel
                if (href.startsWith('http') || 
                    href.startsWith('#') || 
                    href.startsWith('mailto:') ||
                    href.startsWith('tel:')) {
                    return;
                }
                
                // Normaliser le href (enlever les query params et hash)
                const normalizedHref = href.split('?')[0].split('#')[0];
                const normalizedCurrentPath = currentPath.split('?')[0].split('#')[0];
                
                // Vérifier si c'est une navigation vers une nouvelle page
                if (normalizedHref !== normalizedCurrentPath && normalizedHref.startsWith('/')) {
                    // Marquer le shimmer comme actif
                    window.__shimmerActive = true;
                    window.dispatchEvent(new CustomEvent('shimmer:active'));
                    setIsNavigating(true);
                    
                    // Nettoyer le timeout précédent
                    if (navigationTimeoutRef.current) {
                        clearTimeout(navigationTimeoutRef.current);
                    }
                }
            }
        };

        // Écouter les événements personnalisés de navigation
        const handleNavigationStart = () => {
            // Vérifier si un shimmer est déjà actif
            if (window.__shimmerActive) {
                return;
            }
            
            window.__shimmerActive = true;
            setIsNavigating(true);
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };

        // Utiliser capture phase pour attraper tous les clics, même dans le footer
        document.addEventListener('click', handleLinkClick, true);
        window.addEventListener('navigation:start', handleNavigationStart);

        return () => {
            document.removeEventListener('click', handleLinkClick, true);
            window.removeEventListener('navigation:start', handleNavigationStart);
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Quand la route change, masquer le shimmer après un court délai
        if (isNavigating) {
            // Nettoyer le timeout précédent
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
            
            // Masquer le shimmer après que la nouvelle page soit chargée
            navigationTimeoutRef.current = setTimeout(() => {
                setIsNavigating(false);
                window.__shimmerActive = false;
                window.dispatchEvent(new CustomEvent('shimmer:inactive'));
            }, 300);
        }
    }, [pathname, isNavigating]);

    // Nettoyer l'état si le composant est démonté
    useEffect(() => {
        return () => {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
            window.__shimmerActive = false;
            window.dispatchEvent(new CustomEvent('shimmer:inactive'));
        };
    }, []);

    if (!isNavigating) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-white">
            <PageShimmer />
        </div>
    );
}
