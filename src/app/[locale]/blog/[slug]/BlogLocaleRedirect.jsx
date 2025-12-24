"use client";

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function BlogLocaleRedirect({ multiLangSlug, currentSlug, locale }) {
    const router = useRouter();

    useEffect(() => {
        // Calculer expectedSlug directement dans le useEffect pour s'assurer qu'il se met à jour
        if (!multiLangSlug) {
            console.log('[BlogLocaleRedirect] No multiLangSlug available');
            return;
        }

        console.log(locale, 'locale');
        

        const expectedSlug = locale === 'en'
            ? multiLangSlug["slug-en"]
            : multiLangSlug["slug-fr"];

        console.log(locale, 'locale');


        console.log(expectedSlug, 'expectedSlug');


        if (!expectedSlug) {
            console.log('[BlogLocaleRedirect] No expected slug, skipping redirect');
            return;
        }

        if (expectedSlug !== currentSlug) {
            console.log('[BlogLocaleRedirect] Redirecting to:', `/${locale}/blog/${expectedSlug}`);
            router.replace(`/${locale}/blog/${expectedSlug}`);
        } else {
            console.log('[BlogLocaleRedirect] Slug matches, no redirect needed');
        }
    }, [locale, currentSlug, router, multiLangSlug]);

    return null; // Ce composant ne rend rien
}

