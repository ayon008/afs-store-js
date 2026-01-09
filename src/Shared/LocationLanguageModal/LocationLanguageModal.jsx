'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown, ChevronUp, MapPin, ExternalLink, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import 'flag-icons/css/flag-icons.min.css';
import {
  COUNTRIES,
  REGIONS,
  getCountryByCode,
  getCurrencySymbol,
  DEFAULT_COUNTRY,
} from '@/lib/countries-config';
import PaymentMethodsIcons from './PaymentMethodsIcons';

/**
 * LocationLanguageModal - Modern location and language selection modal
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback to close modal
 * @param {string} currentLocale - Current locale (fr/en)
 * @param {string} currentCurrency - Current currency key (euro/usd/gbp)
 * @param {string} currentLocation - Current location ID (2682/2683)
 * @param {string} currentCountryCode - Current selected country code
 * @param {function} onSubmit - Callback with selection { country, language, currency, location }
 */
const LocationLanguageModal = ({
  isOpen,
  onClose,
  currentLocale = 'en',
  currentCurrency = 'euro',
  currentLocation = '2682',
  currentCountryCode = 'FR',
  onSubmit,
}) => {
  const t = useTranslations('location');

  // State for expanded regions
  const [expandedRegions, setExpandedRegions] = useState({
    europe: true,
    uk: false,
    us: false,
    emirates: false,
  });

  // State for selected country and language
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale);
  const [notification, setNotification] = useState(null);

  // Initialize selected country from current country code
  useEffect(() => {
    if (currentCountryCode) {
      const country = getCountryByCode(currentCountryCode);
      if (country) {
        setSelectedCountry(country);
        // Expand the region containing the current country
        const regionId = Object.keys(COUNTRIES).find(
          (region) => COUNTRIES[region].some((c) => c.code === currentCountryCode)
        );
        if (regionId) {
          setExpandedRegions((prev) => ({ ...prev, [regionId]: true }));
        }
      }
    } else {
      setSelectedCountry(DEFAULT_COUNTRY);
    }
  }, [currentCountryCode]);

  // Update selected language when country changes
  useEffect(() => {
    if (selectedCountry && !selectedCountry.languages.includes(selectedLanguage)) {
      // If current language is not available for selected country, use first available
      if (selectedCountry.languages.length > 0) {
        setSelectedLanguage(selectedCountry.languages[0]);
      }
    }
  }, [selectedCountry, selectedLanguage]);

  // Toggle region expansion
  const toggleRegion = useCallback((regionId) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [regionId]: !prev[regionId],
    }));
  }, []);

  // Handle country selection
  const handleCountrySelect = useCallback((country) => {
    if (country.isExternal) {
      // For external countries like Spain, open in new tab
      window.open(country.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedCountry(country);
    // Auto-select first available language if current isn't available
    if (!country.languages.includes(selectedLanguage)) {
      setSelectedLanguage(country.languages[0] || 'en');
    }
  }, [selectedLanguage]);

  // Handle language selection
  const handleLanguageSelect = useCallback((langCode) => {
    setSelectedLanguage(langCode);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!selectedCountry) return;

    onSubmit?.({
      country: selectedCountry,
      language: selectedLanguage,
      currency: selectedCountry.currencyKey,
      location: selectedCountry.warehouse,
    });
  }, [selectedCountry, selectedLanguage, onSubmit]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get current country info for display
  const currentCountry = selectedCountry || getCountryByCode(currentCountryCode) || DEFAULT_COUNTRY;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative bg-[#f5f5f5] rounded-lg shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between">
          <h2
            id="location-modal-title"
            className="text-xl font-bold text-[#111]"
          >
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label={t('close')}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className="mx-6 mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3 animate-slideDown">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">{notification}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Current Selection Display */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-[#1D98FF]" />
              <span className="text-sm font-medium text-gray-500">
                {t('currentSelection')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`fi fi-${currentCountry.flag} text-2xl rounded shadow-sm`} />
              <div className="flex-1">
                <p className="font-semibold text-[#111]">
                  {t(`countries.${currentCountry.nameKey?.split('.')[1]}`) || currentCountry.name}
                </p>
                <p className="text-sm text-gray-500">
                  {t(`languages.${selectedLanguage}`)} &bull; {getCurrencySymbol(currentCountry.currency)} {currentCountry.currency}
                </p>
              </div>
              <PaymentMethodsIcons methods={currentCountry.paymentMethods} size="sm" />
            </div>
          </div>

          {/* Regions */}
          {Object.entries(REGIONS).map(([regionId, region]) => {
            const countries = COUNTRIES[regionId] || [];
            const isExpanded = expandedRegions[regionId];

            return (
              <div key={regionId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Region Header */}
                <button
                  onClick={() => toggleRegion(regionId)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="font-semibold text-[#111]">
                    {t(`regions.${regionId}`)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {/* Countries List */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {countries.map((country) => {
                      const isSelected = selectedCountry?.code === country.code;
                      const isExternal = country.isExternal;

                      return (
                        <div
                          key={country.code}
                          className={`
                            px-4 py-3 border-b border-gray-50 last:border-b-0
                            ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                            transition-colors
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {/* Flag */}
                            <span className={`fi fi-${country.flag} text-xl rounded shadow-sm`} />

                            {/* Country Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#111]">
                                  {t(`countries.${country.nameKey?.split('.')[1]}`) || country.name}
                                </span>
                                {isExternal && (
                                  <ExternalLink className="w-4 h-4 text-gray-400" />
                                )}
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#1D98FF]" />
                                )}
                              </div>

                              {/* Languages */}
                              {!isExternal && country.languages.length > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                  {country.languages.map((lang) => {
                                    const isLangSelected = isSelected && selectedLanguage === lang;
                                    return (
                                      <button
                                        key={lang}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCountrySelect(country);
                                          handleLanguageSelect(lang);
                                        }}
                                        className={`
                                          text-xs px-2 py-1 rounded-md transition-colors
                                          ${isLangSelected
                                            ? 'bg-[#1D98FF] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }
                                        `}
                                      >
                                        {t(`languages.${lang}`)}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* External Site Note */}
                              {isExternal && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {t('externalSite')}
                                </p>
                              )}
                            </div>

                            {/* Select Button (for non-external) */}
                            {!isExternal && (
                              <button
                                onClick={() => handleCountrySelect(country)}
                                className={`
                                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                  ${isSelected
                                    ? 'bg-[#1D98FF] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }
                                `}
                              >
                                {isSelected ? t('selected') : t('select')}
                              </button>
                            )}

                            {/* External Link Button */}
                            {isExternal && (
                              <a
                                href={country.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              >
                                {t('visit')}
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Payment Methods Info */}
          {selectedCountry && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-3">
                {t('availablePaymentMethods')}
              </p>
              <PaymentMethodsIcons methods={selectedCountry.paymentMethods} size="md" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!selectedCountry}
            className="w-full py-3 bg-[#111] text-white font-semibold rounded-xl hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationLanguageModal;
