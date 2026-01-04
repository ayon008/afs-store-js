import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ["en", "fr"],
    defaultLocale: "en",
    localePrefix: "as-needed",
    localeDetection: false, // Disable automatic locale detection from headers
})