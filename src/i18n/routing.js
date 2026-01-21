import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ["en", "fr"],
    defaultLocale: "en",
    localePrefix: "as-needed",
    localeDetection: false, // Disable automatic locale detection from headers
    pathnames: {
        '/foil-configurator': {
            en: '/foil-configurator',
            fr: '/configurateur-foil'
        },
        '/ahd-history': {
            en: '/ahd-history',
            fr: '/histoire-ahd'
        },
        '/afs-ambassadors': {
            en: '/afs-ambassadors',
            fr: '/ambassadeurs-afs'
        },
        '/service-request': {
            en: '/service-request',
            fr: '/demande-sav'
        },
        '/equipment-recovery': {
            en: '/equipment-recovery',
            fr: '/reprise-materiel'
        },
        '/form': {
            en: '/form',
            fr: '/formulaire'
        },
        '/general-terms-and-conditions-of-sale': {
            en: '/general-terms-and-conditions-of-sale',
            fr: '/conditions-generales-de-vente'
        },
        '/downwind-2025-guide': {
            en: '/downwind-2025-guide',
            fr: '/guide-downwind'
        },
        '/guide-sup-2024': {
            en: "/guide-sup-2024",
            fr: "/sup"
        },
        '/legal-notice': {
            en: "/legal-notice",
            fr: "/mentions-legales"
        },
        '/legal-notices': {
            en: "/legal-notices",
            fr: "/mentions-legales"
        },
        '/terms-and-conditions': {
            en: "/terms-and-conditions",
            fr: "/conditions-generales-de-vente"
        },
        '/need-advice': {
            en: "/need-advice",
            fr: "/tickets"
        },
        '/privacy-policy': {
            en: "/privacy-policy",
            fr: "/politique-de-confidentialite"
        },
        '/reconditioning': {
            en: "/reconditioning",
            fr: "/reconditionnement"
        },
        '/visit-the-factory': {
            en: "/visit-the-factory",
            fr: "/visite-de-lusine"
        },
        '/wind-foil-2023-guide': {
            en: "/wind-foil-2023-guide",
            fr: '/guide-wind-foil'
        },
        '/my-account': {
            en: '/my-account',
            fr: '/mon-compte'
        },
        '/my-account/orders': {
            en: '/my-account/orders',
            fr: '/mon-compte/commandes'
        },
        '/my-account/payment-methods': {
            en: '/my-account/payment-methods',
            fr: '/mon-compte/moyens-de-paiement'
        },
        '/my-account/reset-password': {
            en: '/my-account/reset-password',
            fr: '/mon-compte/reinitialiser-mot-de-passe'
        },
        '/my-account/logout': {
            en: '/my-account/logout',
            fr: '/mon-compte/deconnexion'
        },
        '/screw-size': {
            en: '/screw-size',
            fr: '/detail-et-dimensions-foils-planches'
        },
        '/comparatif-3-stab': {
            en: '/comparison-3-stab',
            fr: '/comparatif-3-stab'
        },
        '/best-match-stab':{
            en: '/best-match-stab',
            fr: '/best-match-stab'
        }
    }
})