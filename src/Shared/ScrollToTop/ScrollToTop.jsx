'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/**
 * Composant qui remet le scroll en haut de la page lors des changements de route
 * Utilise GSAP pour une animation fluide
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const scrollTweenRef = useRef(null);
  const scrollObjRef = useRef({ y: 0 });

  useGSAP(() => {
    // Ne scroller que si le pathname a réellement changé
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      
      // Annuler l'animation précédente si elle existe
      if (scrollTweenRef.current) {
        scrollTweenRef.current.kill();
      }
      
      // Obtenir la position de scroll actuelle
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      
      // Si on est déjà en haut, pas besoin d'animer
      if (currentScroll === 0) {
        return;
      }
      
      // Initialiser l'objet de scroll avec la position actuelle
      scrollObjRef.current.y = currentScroll;
      
      // Créer une animation GSAP pour scroller vers le haut
      scrollTweenRef.current = gsap.to(scrollObjRef.current, {
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: function() {
          const scrollY = scrollObjRef.current.y;
          window.scrollTo(0, scrollY);
          document.documentElement.scrollTop = scrollY;
          document.body.scrollTop = scrollY;
        },
        onComplete: () => {
          // S'assurer qu'on est bien en haut après l'animation
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          scrollObjRef.current.y = 0;
        }
      });
    }
  }, { dependencies: [pathname] });

  // Nettoyer l'animation au démontage
  useEffect(() => {
    return () => {
      if (scrollTweenRef.current) {
        scrollTweenRef.current.kill();
      }
    };
  }, []);

  return null;
}

