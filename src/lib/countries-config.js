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

// Countries by region
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

// Get country from cookies or default
export function getCurrentCountryFromCookies(cookies) {
  const selectedCountry = cookies?.get?.('selected_country');
  if (selectedCountry) {
    const country = getCountryByCode(selectedCountry);
    if (country) return country;
  }
  return DEFAULT_COUNTRY;
}
