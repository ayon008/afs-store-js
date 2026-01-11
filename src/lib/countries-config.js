/**
 * Countries Configuration
 *
 * Contains all supported countries grouped by region with their:
 * - Languages available
 * - Currency
 * - Warehouse ID
 * - Payment gateways
 */

// Currency to payment methods mapping
export const CURRENCY_PAYMENT_METHODS = {
  EUR: ['paypal', 'monetico', 'bacs'],
  USD: ['authorize'],
  GBP: ['paypal', 'monetico'],
};

// Warehouse IDs
export const WAREHOUSES = {
  EUROPE: '2682',
  USA: '2683',
};

// Payment method display info
export const PAYMENT_METHOD_INFO = {
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: 'paypal',
  },
  monetico: {
    id: 'monetico',
    name: 'Credit Card',
    icon: 'card',
  },
  authorize: {
    id: 'authorize',
    name: 'Credit Card',
    icon: 'card',
  },
  bacs: {
    id: 'bacs',
    name: 'Bank Transfer',
    icon: 'bank',
  },
};

// Regions configuration
export const REGIONS = {
  europe: {
    id: 'europe',
    nameKey: 'regions.europe',
    defaultExpanded: true,
  },
  uk: {
    id: 'uk',
    nameKey: 'regions.uk',
    defaultExpanded: false,
  },
  us: {
    id: 'us',
    nameKey: 'regions.us',
    defaultExpanded: false,
  },
  emirates: {
    id: 'emirates',
    nameKey: 'regions.emirates',
    defaultExpanded: false,
  },
};

// Countries by region (with VAT rates)
export const COUNTRIES = {
  europe: [
    {
      code: 'FR',
      name: 'France',
      nameKey: 'countries.france',
      flag: 'fr',
      languages: ['fr', 'en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 20,
    },
    {
      code: 'BE',
      name: 'Belgium',
      nameKey: 'countries.belgium',
      flag: 'be',
      languages: ['fr', 'en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 21,
    },
    {
      code: 'CH',
      name: 'Switzerland',
      nameKey: 'countries.switzerland',
      flag: 'ch',
      languages: ['fr', 'en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 0, // No EU VAT for exports
    },
    {
      code: 'LU',
      name: 'Luxembourg',
      nameKey: 'countries.luxembourg',
      flag: 'lu',
      languages: ['fr', 'en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 17,
    },
    {
      code: 'DE',
      name: 'Germany',
      nameKey: 'countries.germany',
      flag: 'de',
      languages: ['en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 19,
    },
    {
      code: 'IT',
      name: 'Italy',
      nameKey: 'countries.italy',
      flag: 'it',
      languages: ['en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 22,
    },
    {
      code: 'NL',
      name: 'Netherlands',
      nameKey: 'countries.netherlands',
      flag: 'nl',
      languages: ['en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 21,
    },
    {
      code: 'PT',
      name: 'Portugal',
      nameKey: 'countries.portugal',
      flag: 'pt',
      languages: ['en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 23,
    },
    {
      code: 'AT',
      name: 'Austria',
      nameKey: 'countries.austria',
      flag: 'at',
      languages: ['en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 20,
    },
    {
      code: 'GR',
      name: 'Greece',
      nameKey: 'countries.greece',
      flag: 'gr',
      languages: ['en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 24,
    },
    {
      code: 'IE',
      name: 'Ireland',
      nameKey: 'countries.ireland',
      flag: 'ie',
      languages: ['en'],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 23,
    },
    {
      code: 'ES',
      name: 'Spain',
      nameKey: 'countries.spain',
      flag: 'es',
      languages: [],
      currency: 'EUR',
      currencyKey: 'euro',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.EUR,
      vatRate: 21,
      isExternal: true,
      externalUrl: 'https://afs-foiling.es',
    },
  ],
  uk: [
    {
      code: 'GB',
      name: 'United Kingdom',
      nameKey: 'countries.unitedKingdom',
      flag: 'gb',
      languages: ['en'],
      currency: 'GBP',
      currencyKey: 'gbp',
      warehouse: WAREHOUSES.EUROPE,
      paymentMethods: CURRENCY_PAYMENT_METHODS.GBP,
      vatRate: 20,
    },
  ],
  us: [
    {
      code: 'US',
      name: 'United States',
      nameKey: 'countries.unitedStates',
      flag: 'us',
      languages: ['en'],
      currency: 'USD',
      currencyKey: 'usd',
      warehouse: WAREHOUSES.USA,
      paymentMethods: CURRENCY_PAYMENT_METHODS.USD,
      vatRate: 0, // No VAT, sales tax handled separately
    },
    {
      code: 'CA',
      name: 'Canada',
      nameKey: 'countries.canada',
      flag: 'ca',
      languages: ['en', 'fr'],
      currency: 'USD',
      currencyKey: 'usd',
      warehouse: WAREHOUSES.USA,
      paymentMethods: CURRENCY_PAYMENT_METHODS.USD,
      vatRate: 0, // No VAT, GST/HST handled separately
    },
  ],
  emirates: [
    {
      code: 'AE',
      name: 'United Arab Emirates',
      nameKey: 'countries.uae',
      flag: 'ae',
      languages: ['en'],
      currency: 'USD',
      currencyKey: 'usd',
      warehouse: WAREHOUSES.USA,
      paymentMethods: CURRENCY_PAYMENT_METHODS.USD,
      vatRate: 5,
    },
    {
      code: 'SA',
      name: 'Saudi Arabia',
      nameKey: 'countries.saudiArabia',
      flag: 'sa',
      languages: ['en'],
      currency: 'USD',
      currencyKey: 'usd',
      warehouse: WAREHOUSES.USA,
      paymentMethods: CURRENCY_PAYMENT_METHODS.USD,
      vatRate: 15,
    },
  ],
};

// Flat list of all countries
export const ALL_COUNTRIES = Object.values(COUNTRIES).flat();

// Helper functions
export function getCountryByCode(code) {
  return ALL_COUNTRIES.find(country => country.code === code);
}

export function getCountriesByRegion(regionId) {
  return COUNTRIES[regionId] || [];
}

export function getPaymentMethodsForCurrency(currency) {
  return CURRENCY_PAYMENT_METHODS[currency] || [];
}

export function getPaymentMethodInfo(methodId) {
  return PAYMENT_METHOD_INFO[methodId] || null;
}

export function getCurrencySymbol(currency) {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    default:
      return '€';
  }
}

export function getCurrencyFromKey(currencyKey) {
  switch (currencyKey) {
    case 'euro':
      return 'EUR';
    case 'usd':
      return 'USD';
    case 'gbp':
      return 'GBP';
    default:
      return 'EUR';
  }
}

// Language display names
export const LANGUAGE_NAMES = {
  fr: {
    native: 'Français',
    en: 'French',
  },
  en: {
    native: 'English',
    en: 'English',
  },
};

// Get language display name
export function getLanguageName(langCode, displayLocale = 'en') {
  const lang = LANGUAGE_NAMES[langCode];
  if (!lang) return langCode.toUpperCase();
  return displayLocale === langCode ? lang.native : lang[displayLocale] || lang.native;
}

// Default country (France)
export const DEFAULT_COUNTRY = COUNTRIES.europe[0];

// Default VAT rate (France)
export const DEFAULT_VAT_RATE = 20;

// Get country from cookies or default
export function getCurrentCountryFromCookies(cookies) {
  const selectedCountry = cookies?.get?.('selected_country');
  if (selectedCountry) {
    const country = getCountryByCode(selectedCountry);
    if (country) return country;
  }
  return DEFAULT_COUNTRY;
}

/**
 * Get VAT rate for a country code
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {number} VAT rate as percentage (e.g., 20 for 20%)
 */
export function getVatRate(countryCode) {
  if (!countryCode) return DEFAULT_VAT_RATE;
  const country = getCountryByCode(countryCode.toUpperCase());
  return country?.vatRate !== undefined ? country.vatRate : DEFAULT_VAT_RATE;
}

/**
 * Calculate price including VAT for a specific country
 * @param {number} priceExclTax - Price excluding tax
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {number} Price including VAT
 */
export function calculatePriceWithVat(priceExclTax, countryCode) {
  const vatRate = getVatRate(countryCode);
  return priceExclTax * (1 + vatRate / 100);
}

/**
 * Recalculate price_incl_tax based on the selected country
 * Useful when WooCommerce doesn't properly calculate VAT for all countries
 * @param {number} price - Base price (without tax)
 * @param {number} currentPriceInclTax - Current price_incl_tax from WooCommerce
 * @param {string} currentCountry - Country WooCommerce used for calculation
 * @param {string} targetCountry - Country we want to calculate for
 * @returns {number} Recalculated price including VAT
 */
export function recalculatePriceForCountry(price, currentPriceInclTax, currentCountry, targetCountry) {
  // If same country, no recalculation needed
  if (currentCountry === targetCountry) {
    return currentPriceInclTax;
  }
  
  // Use base price to calculate with target country's VAT
  const basePrice = parseFloat(price);
  if (isNaN(basePrice) || basePrice <= 0) {
    return currentPriceInclTax;
  }
  
  const targetVatRate = getVatRate(targetCountry);
  const newPrice = basePrice * (1 + targetVatRate / 100);
  
  return Math.round(newPrice * 100) / 100; // Round to 2 decimal places
}
