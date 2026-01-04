'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * Composant qui remet le scroll en haut de la page lors des changements de route
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // Ne scroller que si le pathname a réellement changé
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
      requestAnimationFrame(() => {
        // Double vérification pour s'assurer que le scroll se fait correctement
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
        
        // Fallback pour les navigateurs qui ne supportent pas 'instant'
        if (document.documentElement.scrollTop !== 0) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body.scrollTop !== 0) {
          document.body.scrollTop = 0;
        }
      });
    }
  }, [pathname]);

  return null;
}

