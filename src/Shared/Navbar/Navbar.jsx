
"use client";
import { ArrowLeft, DollarSign, Euro, Search, X, PoundSterling } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState, useEffect, useCallback } from "react";
import "flag-icons/css/flag-icons.min.css";
import gsap from "gsap";
import Menu from "./Menu";
import { useGSAP } from "@gsap/react";
import useCart from "../Hooks/useCart";
import SideCart from "../Cart/SideCart";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import SearchOverlay from "./search";
import Cookies from 'js-cookie';
import Notification from "../Notification/Notification";
import LocationLanguageModal from "../LocationLanguageModal/LocationLanguageModal";
import { getCountryByCode, DEFAULT_COUNTRY, WAREHOUSES } from "@/lib/countries-config";

const Navbar = ({ NAV_LINKS }) => {
  const t = useTranslations("common");
  const tCart = useTranslations("cart");

  // Search Open
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { cart, sideCartOpen, openSideCart, closeSideCart, handleClearCart, loadCart } = useCart();

  // Normalize URL by removing locale prefix (next-intl will add it automatically)
  const normalizeUrl = (url) => {
    if (!url || typeof url !== 'string') return url || '';
    // Don't modify external URLs (http/https) or anchor links
    if (url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    // Remove /fr/ or /en/ prefix if present
    return url.replace(/^\/(fr|en)\//, '/');
  };

  // États pour la langue et la devise sélectionnées
  const [selectedLanguage, setSelectedLanguage] = useState(locale || 'fr');
  const currentCurrencySymbol = cart?.totals?.currency_symbol || '€';
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const cookieLocation = Cookies.get('location');
    if (cookieLocation === '2682' || cookieLocation === '2683') {
      return cookieLocation;
    } else {
      return Cookies.set('location', '2682', { expires: 365, sameSite: 'Lax', path: '/' });
    }
  });

  // Initialize with a default value that's the same on server and client to avoid hydration mismatch
  const [selectedCurrency, setSelectedCurrency] = useState('euro');
  // Track if the initial cookie has been read to avoid overwriting it
  const [cookieInitialized, setCookieInitialized] = useState(false);
  // Selected country code for the new modal
  const [selectedCountryCode, setSelectedCountryCode] = useState('FR');

  // Update selectedCurrency from cookie/client-side data after mount to avoid hydration mismatch
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const cookieCurrency = Cookies.get('currency');
    if (cookieCurrency === 'euro' || cookieCurrency === 'usd' || cookieCurrency === 'gbp') {
      setSelectedCurrency(cookieCurrency);
    } else {
      // First visit: determine currency based on location and country from country-config.js
      const cookieLocation = Cookies.get('location');
      const cookieCountry = Cookies.get('selected_country');
      
      let initialCurrency = 'euro'; // Default fallback
      
      if (cookieLocation || cookieCountry) {
        // Try to get country from cookie
        let country = null;
        if (cookieCountry) {
          country = getCountryByCode(cookieCountry);
        }
        
        // If no country from cookie, determine from location
        if (!country && cookieLocation) {
          if (cookieLocation === WAREHOUSES.EUROPE) {
            // Europe: default to France (EUR)
            country = getCountryByCode('FR');
          } else if (cookieLocation === WAREHOUSES.USA) {
            // North America: default to US (USD)
            country = getCountryByCode('US');
          }
        }
        
        // Use country currency if found
        if (country && country.currencyKey) {
          initialCurrency = country.currencyKey;
        } else {
          // Fallback to cart currency symbol if available
          initialCurrency = currentCurrencySymbol === '€' || currentCurrencySymbol === 'EUR'
            ? 'euro'
            : currentCurrencySymbol === '£' || currentCurrencySymbol === 'GBP'
              ? 'gbp'
              : 'usd';
        }
      } else {
        // No location or country cookie: fallback to cart currency symbol
        initialCurrency = currentCurrencySymbol === '€' || currentCurrencySymbol === 'EUR'
          ? 'euro'
          : currentCurrencySymbol === '£' || currentCurrencySymbol === 'GBP'
            ? 'gbp'
            : 'usd';
      }
      
      setSelectedCurrency(initialCurrency);
      // Set currency cookie for first visit
      Cookies.set('currency', initialCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
      const wcmlCurrency = initialCurrency === 'euro' ? 'EUR' : initialCurrency === 'gbp' ? 'GBP' : 'USD';
      Cookies.set('wcml_client_currency', wcmlCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
    }

    const cookieLocation = Cookies.get('location');
    if (cookieLocation === '2682' || cookieLocation === '2683') {
      setSelectedLocation(cookieLocation);
    } else {
      setSelectedLocation('2682');
    }

    // Read selected country from cookie
    const cookieCountry = Cookies.get('selected_country');
    if (cookieCountry) {
      setSelectedCountryCode(cookieCountry);
    } else {
      // First visit: set default country based on location
      const location = Cookies.get('location') || WAREHOUSES.EUROPE;
      if (location === WAREHOUSES.EUROPE) {
        setSelectedCountryCode('FR');
        Cookies.set('selected_country', 'FR', { expires: 365, sameSite: 'Lax', path: '/' });
      } else if (location === WAREHOUSES.USA) {
        setSelectedCountryCode('US');
        Cookies.set('selected_country', 'US', { expires: 365, sameSite: 'Lax', path: '/' });
      }
    }

    // Mark cookie as initialized after reading
    setCookieInitialized(true);
  }, [currentCurrencySymbol]);

  // Set cookie whenever selectedCurrency changes, but only after initial read
  useEffect(() => {
    // Don't write cookie until we've read the initial value
    if (!cookieInitialized) return;

    if (selectedCurrency === 'euro' || selectedCurrency === 'usd' || selectedCurrency === 'gbp') {
      // Add path: '/' to ensure the cookie is accessible to all routes including server-side
      Cookies.set('currency', selectedCurrency, { expires: 365, sameSite: 'Lax', path: '/' });

      // Also set WCML cookie for WooCommerce Multilingual multi-currency support
      const wcmlCurrency = selectedCurrency === 'euro' ? 'EUR' : selectedCurrency === 'gbp' ? 'GBP' : 'USD';
      Cookies.set('wcml_client_currency', wcmlCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
    }

    if (selectedLocation === '2682' || selectedLocation === '2683') {
      Cookies.set('location', selectedLocation, { expires: 365, sameSite: 'Lax', path: '/' });
    }

  }, [selectedCurrency, selectedLocation, cookieInitialized]);





  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [notification, setNotification] = useState(null);
  const [showPopUp, setPopUp] = useState(false);
  const totalQty = cart?.items_count;

  // Effet pour gérer la redirection après la soumission du formulaire
  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      // Utiliser window.location pour une redirection complète qui recharge l'application
      window.location.href = redirectPath;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRedirect]);


  // Auto-hide notification after 5 seconds (only when modal is open)
  useEffect(() => {
    if (notification && showPopUp) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, showPopUp]);

  // Reset notification when modal closes
  useEffect(() => {
    if (!showPopUp) {
      setNotification(null);
    }
  }, [showPopUp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedValues = {
      language: selectedLanguage, // "en" ou "fr"
      currency: selectedCurrency, // "usd" ou "euro"
      location: selectedLocation, // "2682" ou "2683"
    };

    // Clear cart if language or currency changes
    const languageChanged = selectedLanguage !== locale;

    // Get current currency from cart or cookie (handle all 3 currencies: EUR, USD, GBP)
    const currentCurrencySymbol = cart?.totals?.currency_symbol || '€';
    let currentCurrency = 'euro'; // Default
    if (currentCurrencySymbol === '€' || currentCurrencySymbol === 'EUR') {
      currentCurrency = 'euro';
    } else if (currentCurrencySymbol === '£' || currentCurrencySymbol === 'GBP') {
      currentCurrency = 'gbp';
    } else if (currentCurrencySymbol === '$' || currentCurrencySymbol === 'USD') {
      currentCurrency = 'usd';
    }
    const currencyChanged = selectedCurrency !== currentCurrency;

    // Get current location from cookie
    const cookieLocation = Cookies.get('location') || '2682';
    const locationChanged = selectedLocation !== cookieLocation;

    // Clear the cart if language, currency, or location changes
    if (languageChanged || currencyChanged || locationChanged) {
      try {
        // Check if cart has items before clearing (check localStorage directly)
        const hasItems = cart && cart.items && cart.items.length > 0;

        if (hasItems) {
          const result = await handleClearCart();

          // Show notification if cart was cleared successfully
          if (result && result.success) {
            if (languageChanged) {
              setNotification(t("cartClearedLanguage"));
            } else if (currencyChanged) {
              setNotification(tCart("clearedOnCurrencyChange"));
            } else if (locationChanged) {
              setNotification(tCart("clearedOnLocationChange"));
            }
          } else {
            console.error('Failed to clear cart:', result?.error);
          }
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }

    // Convert to WCML format
    const wcmlCurrency = selectedCurrency === 'euro' ? 'EUR' : selectedCurrency === 'gbp' ? 'GBP' : 'USD';

    if (languageChanged) {
      // Set cookies first
      Cookies.set('currency', selectedCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
      Cookies.set('wcml_client_currency', wcmlCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
      Cookies.set('location', selectedLocation, { expires: 365, sameSite: 'Lax', path: '/' });

      // Get the actual full pathname from window.location (includes locale prefix)
      const fullPathname = typeof window !== 'undefined' ? window.location.pathname : pathname;

      // Handle product pages with slug translation
      const productMatch = fullPathname?.match(/\/(?:product|produit)\/([^\/]+)/) || pathname?.match(/\/(?:product|produit)\/([^\/]+)/);

      if (productMatch) {
        const currentSlug = productMatch[1];
        // For product pages, use ?lang= parameter to let middleware handle the translation
        // Use the full pathname from window.location to preserve locale prefix
        const currentPath = fullPathname || pathname || '/';
        const basePath = currentPath.split('?')[0]; // Remove existing query params
        const newPath = `${basePath}?lang=${selectedLanguage}`;
        // Use window.location for immediate redirect
        // The middleware will handle the translation and remove ?lang= from final URL
        window.location.href = newPath;
        return selectedValues;
      } else {
        // For non-product pages, use ?lang= parameter to let middleware handle the locale change
        // Use the full pathname from window.location to preserve locale prefix
        const currentPath = fullPathname || pathname || '/';
        const basePath = currentPath.split('?')[0]; // Remove existing query params
        const newPath = `${basePath}?lang=${selectedLanguage}`;
        // Use window.location for immediate redirect
        // The middleware will handle the locale change and remove ?lang= from final URL
        window.location.href = newPath;
        return selectedValues;
      }
    } else {
      // If currency or location changed, reload page to get updated values
      if (currencyChanged || locationChanged) {
        // Set the cookies synchronously before reload to ensure they're available on next page load
        Cookies.set('currency', selectedCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
        Cookies.set('wcml_client_currency', wcmlCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
        if (locationChanged) {
          Cookies.set('location', selectedLocation, { expires: 365, sameSite: 'Lax', path: '/' });
        }
        // Small delay to ensure cookies are written before reload
        setTimeout(() => {
          // Reload the current page to ensure currency and location are updated
          const currentPath = pathname || '/';
          const reloadPath = `/${locale}${currentPath === '/' ? '' : currentPath}`;
          window.location.href = reloadPath;
        }, 100);
      } else {
        setPopUp(false);
      }
    }
    return selectedValues;
  }

  // Handler for the new LocationLanguageModal
  const handleLocationModalSubmit = useCallback(async ({ country, language, currency, location }) => {
    // Close the modal immediately
    setPopUp(false);

    // Update local state
    setSelectedLanguage(language);
    setSelectedCurrency(currency);
    setSelectedLocation(location);
    setSelectedCountryCode(country.code);

    // Check what changed
    const languageChanged = language !== locale;

    const currentCurrencyFromCart = cart?.totals?.currency_symbol || '€';
    let currentCurrencyKey = 'euro';
    if (currentCurrencyFromCart === '€' || currentCurrencyFromCart === 'EUR') {
      currentCurrencyKey = 'euro';
    } else if (currentCurrencyFromCart === '£' || currentCurrencyFromCart === 'GBP') {
      currentCurrencyKey = 'gbp';
    } else if (currentCurrencyFromCart === '$' || currentCurrencyFromCart === 'USD') {
      currentCurrencyKey = 'usd';
    }
    const currencyChanged = currency !== currentCurrencyKey;
    const locationChanged = location !== (Cookies.get('location') || '2682');
    const countryChanged = country.code !== (Cookies.get('selected_country') || 'FR');

    // Set all cookies
    const wcmlCurrency = currency === 'euro' ? 'EUR' : currency === 'gbp' ? 'GBP' : 'USD';
    Cookies.set('currency', currency, { expires: 365, sameSite: 'Lax', path: '/' });
    Cookies.set('wcml_client_currency', wcmlCurrency, { expires: 365, sameSite: 'Lax', path: '/' });
    Cookies.set('location', location, { expires: 365, sameSite: 'Lax', path: '/' });
    Cookies.set('selected_country', country.code, { expires: 365, sameSite: 'Lax', path: '/' });

    // Determine if we need a full page reload (country/currency/location changes need fresh server data)
    const needsFullReload = countryChanged || currencyChanged || locationChanged;

    if (languageChanged || needsFullReload) {
      const hasItems = cart && cart.items && cart.items.length > 0;

      // Clear cart if it has items (currency/location/language changes invalidate cart)
      if (hasItems) {
        try {
          const localResult = await handleClearCart();
          if (localResult?.success) {
            if (currencyChanged) {
              setNotification(tCart("clearedOnCurrencyChange"));
            } else if (locationChanged) {
              setNotification(tCart("clearedOnLocationChange"));
            } else {
              setNotification(t("cartClearedLanguage"));
            }
          }
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      }

      const currentPath = pathname || '/';

      if (needsFullReload) {
        // Full page reload for country/currency/location changes
        const localePrefix = language === 'en' ? '' : `/${language}`;

        // Translate localized route paths
        let targetPath = currentPath;
        if (locale === 'fr' && language === 'en' && currentPath.startsWith('/produit/')) {
          targetPath = currentPath.replace('/produit/', '/product/');
        } else if (locale === 'en' && language === 'fr' && currentPath.startsWith('/product/')) {
          targetPath = currentPath.replace('/product/', '/produit/');
        }

        const reloadPath = targetPath === '/' ? (localePrefix || '/') : `${localePrefix}${targetPath}`;
        const cacheBuster = `_refresh=${Date.now()}`;
        const separator = reloadPath.includes('?') ? '&' : '?';
        window.location.href = `${reloadPath}${separator}${cacheBuster}`;
      } else {
        // Only language changed - use client-side navigation
        router.replace(currentPath, { locale: language });
      }
    }
  }, [locale, pathname, cart, handleClearCart, t, tCart]);

  // Hover Id [First Nav];
  const [hoverId, setHoverId] = useState(null);
  // Show Secondary white div and add Clicked Item Name [2nd Nav]
  const [detailsDiv, setDetailsDiv] = useState(null);
  // Mobile On Off State
  const [isOpen, setIsOpen] = useState(false);
  // Nav Ref for Mobile
  const navRef = useRef(null);
  // 2nd Ref
  const secondRef = useRef(null);
  // 3rd ref
  const thirdRef = useRef(null);

  // Show the white hover Items
  const handleShow = (name) => {
    setHoverId(name);
    setDetailsDiv(null);
  }

  // Close mobile menu and reset states
  const handleCloseMenu = () => {
    setIsOpen(false);
    setHoverId(null);
    setDetailsDiv(null);
  }

  // Close desktop menu and reset states
  const handleCloseDesktopMenu = () => {
    setHoverId(null);
    setDetailsDiv(null);
  }

  // GSAP animation for navbar (slide from right)
  useGSAP(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      x: isOpen ? "0%" : "-100%",
      opacity: isOpen ? 1 : 0,
      duration: 0.45,
      ease: "power2.inOut",
    });
  }, [isOpen]);

  useGSAP(() => {
    if (!secondRef.current && !hoverId) return;
    gsap.to(secondRef.current, {
      x: hoverId ? "0%" : "100%",
      opacity: hoverId ? 1 : 0,
      duration: 0.45,
      ease: "power2.inOut",
    });
  }, [hoverId]);

  useGSAP(() => {
    if (!thirdRef.current && !detailsDiv) return;
    gsap.to(thirdRef.current, {
      x: detailsDiv ? "0%" : "-100%",
      opacity: detailsDiv ? 1 : 0,
      duration: 0.45,
      ease: "power2.inOut",
    });
  }, [detailsDiv]);

  const subLinks = NAV_LINKS?.find((Nav) => Nav?.name == hoverId);
  const allProducts = subLinks?.sublinks?.find((sub) => sub.name === detailsDiv);

  const productList = allProducts?.products;

  const [hoverImageLink, setHoverImageLink] = useState(`https://staging.afs-foiling.com/wp-content/uploads/2024/06/Ultra750UHM75_0006.png`);

  return (
    <>
      <nav className='sticky left-0 right-0 top-0 z-[140] text-white w-full navbar'>
        {/* Logo and Search Part */}
        <div
          className="py-4 bg-[#000000] global-padding border-b border-gray-600 w-full flex items-center justify-between relative z-[140]"
          onMouseEnter={() => handleShow(null)}
        >
          <div className="flex items-center gap-2 relative z-[140]">
            {/* Menu */}
            <Menu isOpen={isOpen} setIsOpen={setIsOpen} />

            {/* Logo */}
            <Link href="/" className="flex items-center cursor-pointer">
              <Image
                src="/logo.svg"
                alt="Alpago Properties Clone"
                width={150}
                height={45}
                priority
                className="lg:w-[146px] md:w-[120px] w-[100px] h-auto"
              />
            </Link>
          </div>

          {/* 2nd Part */}

          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Search onClick={() => setIsSearchOpen(true)} className="w-6 h-6 md:hidden block" />
            <div className="relative mr-4 hidden md:block">
              <input
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center bg-[#3d3d3d] rounded-full h-9 w-64 pl-10 pr-3 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
                placeholder={t("search")}
              />
              <Search className="w-6 h-6 mr-2 text-white opacity-90 absolute -translate-y-1/2 left-3 top-1/2" />
            </div>

            {/* Profile */}

            <Link href={`/login`}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 20.5714V17.1429C4 16.2335 4.42143 15.3615 5.17157 14.7185C5.92172 14.0755 6.93913 13.7143 8 13.7143H12H16C17.0609 13.7143 18.0783 14.0755 18.8284 14.7185C19.5786 15.3615 20 16.2335 20 17.1429V20.5714M16 6.85714C16.1205 9.14337 14.2894 11.1429 12 11.1429C9.7106 11.1429 7.82 9.14337 8 6.85714C8.1142 4.6901 9.82 3 12 3C14.17 3 15.8858 4.6901 16 6.85714Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </Link>
            {/* Cart */}
            <button
              onClick={openSideCart}
              className="flex items-center justify-center relative p-1 md:p-2 rounded-full cursor-pointer transition-colors duration-200"
            >
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none">

                <path
                  d="M2.88725 18.6807C1.76607 18.6807 0.857178 19.5836 0.857178 20.6975C0.857178 21.8113 1.76607 22.7143 2.88725 22.7143C4.00843 22.7143 4.91733 21.8113 4.91733 20.6975C4.91733 19.5836 4.00843 18.6807 2.88725 18.6807ZM2.88725 18.6807H14.0527M2.88725 18.6807V8.28571C2.88725 7.73343 2.44 7.28571 1.88725 7.28571H0.857178M14.0527 18.6807C12.9315 18.6807 12.0226 19.5836 12.0226 20.6975C12.0226 21.8113 12.9315 22.7143 14.0527 22.7143C15.1738 22.7143 16.0827 21.8113 16.0827 20.6975C16.0827 19.5836 15.1738 18.6807 14.0527 18.6807ZM14.0527 18.6807H18"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />

                <rect
                  x="5.14282"
                  y="0.857143"
                  width="19.7143"
                  height="15.4286"
                  rx="2"
                  fill="#1D98FF"
                />


                {/* Dynamic number */}
                <text
                  x="15"
                  y="10"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {totalQty || 0}
                </text>
              </svg>
            </button>

            {/* Language */}
            <div onClick={() => setPopUp(true)} className="flex items-center">
              <button className="flex items-center justify-center text-sm font-extrabold p-2 rounded-full cursor-pointer transition-colors duration-200">
                <span className={`fi fi-${getCountryByCode(selectedCountryCode)?.flag || 'fr'} md:mr-2 mr-0 md:scale-125 scale-100`}></span>
                <span className="text-white font-extrabold tracking-wide md:block hidden">
                  {locale === 'fr' ? 'FR' : 'EN'}
                </span>
              </button>
              <span>/</span>
              {/* Currency */}
              <div>
                {
                  selectedCurrency === 'euro' ? <div className="flex items-center gap-1"><Euro className="" size={16} /><span className="text-white font-extrabold tracking-wide text-sm md:block hidden">EUR</span></div> : selectedCurrency === 'usd' ? <div className="flex items-center gap-1"><DollarSign className="" size={16} /><span className="text-white font-extrabold tracking-wide text-sm md:block hidden">USD</span></div> : <div className="flex items-center gap-1"><PoundSterling className="" size={16} /><span className="text-white font-extrabold tracking-wide text-sm md:block hidden">GBP</span></div>
                }
              </div>
            </div>
          </div>
        </div>

        {/* NAV LINKS  Desktop*/}
        <div className="max-[1280px]:hidden flex flex-col relative">
          <div className="flex justify-center items-center whitespace-nowrap px-4 h-full bg-[#000000]">
            {NAV_LINKS?.map((link, idx) => (
              <div
                key={idx}
                className="relative group h-full"
                onMouseEnter={() => handleShow(link.name)}
              >
                <Link
                  href={normalizeUrl(link.href) || ""}
                  onClick={() => {
                    // Si le lien n'a pas de sous-menus, fermer le menu desktop
                    if (!link.sublinks || link.sublinks.length === 0) {
                      handleCloseDesktopMenu();
                    }
                  }}
                  className="text-[16px] font-semibold tracking-wide flex items-center justify-center relative"
                  style={{ padding: "22px 12px 24px" }}
                >

                  <span
                    className={`absolute top-0 bottom-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-100 transition-all duration-200 ${hoverId === link.name &&
                      "bg-white opacity-100 text-black"
                      }`}
                  ></span>
                  <span
                    className={`relative z-10 ${hoverId === link.name ? "text-black" : "text-white"
                      }`}
                  >

                    {link.name}
                  </span>
                </Link>
              </div>
            ))}
          </div>
          {/* Show the White Part of the  NavLink */}

          <div className="absolute top-full left-0 right-0 w-full bg-transparent">
            {hoverId !== "Service" ? (
              <div className="" onMouseLeave={() => handleShow(null)}>
                {subLinks?.sublinks?.length > 0 && (
                  <div className="text-black bg-transparent h-fit md:block hidden">
                    <ul className="flex items-center justify-center bg-white">
                      {subLinks?.sublinks?.map((children, i) => {
                        const url = normalizeUrl(children?.url) ?? "#";
                        return (
                          <li
                            onClick={() => {
                              // Si le lien n'a pas de produits, fermer le menu desktop
                              if (!children?.products || children.products.length === 0) {
                                handleCloseDesktopMenu();
                              } else {
                                setDetailsDiv(children.name);
                              }
                            }}
                            className={`text-[16px] font-semibold tracking-wide cursor-pointer ${detailsDiv === children.name
                              ? "border-b border-b-black"
                              : ""
                              }`}
                            style={{ padding: "24px 12px 24px" }}
                            key={i}
                          >
                            <Link
                              href={url}
                              onClick={() => {
                                // Si le lien n'a pas de produits, fermer le menu desktop
                                if (!children?.products || children.products.length === 0) {
                                  handleCloseDesktopMenu();
                                }
                              }}
                            >
                              {children.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {detailsDiv && productList?.length > 0 && (
                      <div className="h-[calc(100vh-230px)] max-h-[500px] overflow-y-auto scroll-smooth hide-scrollbar-y overscroll-contain bg-transparent">
                        <div
                          className="h-fit bg-white border-b border-b-[#111]"
                        >
                          <div className="text-black/75 global-padding flex items-start justify-center gap-10 pb-6">
                            <div className="space-y-5">
                              <div className="mt-[22px] space-y-1">
                                <h4 className="font-semibold text-base leading-[110%]">
                                  {hoverId}
                                </h4>
                                <h3 className="font-semibold text-[28px] leading-[100%]">
                                  {detailsDiv}
                                </h3>
                              </div>
                              <div className="flex items-start justify-center pb-[22px]">
                                <div className="grid [grid-auto-flow:column] [grid-template-rows:repeat(4,1fr)] gap-5 grid-cols-[max-content_max-content_max-content] flex-1 xl:h-[160px] 2xl:h-full xl:overflow-y-auto 2xl:overflow-y-hidden scroll-smooth scroll-bar pr-10">
                                  {productList?.map((product, i) => {
                                    return (
                                      <div
                                        key={i}
                                        className="max-w-[270px] w-fit"
                                      >
                                        <Link
                                          href={normalizeUrl(product.url)}
                                          onClick={handleCloseDesktopMenu}
                                        >
                                          <h5
                                            onMouseEnter={() =>
                                              setHoverImageLink(product.image)
                                            }
                                            className="text-lg leading-[130%] text-black font-semibold cursor-pointer hover:text-[#1D98FF] hover:underline"
                                          >
                                            {product.name}
                                          </h5>
                                        </Link>
                                        <p
                                          className="font-semibold text-xs leading-[100%] price-wrapper mt-1"
                                          dangerouslySetInnerHTML={{
                                            __html: product.price,
                                          }}
                                        ></p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            {/* Product Image */}
                            <div className="mt-[22px] max-w-[380px] w-full min-h-[100px]">
                              {hoverImageLink && (
                                <img
                                  src={hoverImageLink}
                                  className="max-w-[380px] max-h-[380px] aspect-[1] object-cover"
                                  alt=""
                                />
                              )}
                            </div>
                          </div>
                          {(allProducts?.button_one?.label ||
                            allProducts?.button_two?.label) && (
                              <div className="flex items-center justify-center gap-10 py-6 border-t border-gray-500">
                                {allProducts?.button_one?.label && (
                                  <button>
                                    <Link
                                      href={normalizeUrl(allProducts?.button_one?.url)}
                                      onClick={handleCloseDesktopMenu}
                                      className="text-black/75 font-semibold flex items-center gap-1"
                                    >
                                      <span className="inline-block">
                                        {allProducts?.button_one.label}
                                      </span>
                                      <svg
                                        width="16"
                                        height="16"
                                        className="font-semibold"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                      >
                                        <path
                                          d="M19 5L5 19M19 5H6.4M19 5V17.6"
                                          stroke="#000000BF"
                                          strokeWidth="3"
                                        />
                                      </svg>
                                    </Link>
                                  </button>
                                )}
                                {allProducts?.button_two?.label && (
                                  <button>
                                    <Link
                                      href={normalizeUrl(allProducts?.button_two?.url)}
                                      onClick={handleCloseDesktopMenu}
                                      className="text-black/75 font-semibold flex items-center gap-1"
                                    >
                                      <span className="inline-block">
                                        {allProducts?.button_two.label}
                                      </span>
                                      <svg
                                        width="16"
                                        height="16"
                                        className="font-semibold"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                      >
                                        <path
                                          d="M19 5L5 19M19 5H6.4M19 5V17.6"
                                          stroke="#000000BF"
                                          strokeWidth="3"
                                        />
                                      </svg>
                                    </Link>
                                  </button>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div onMouseLeave={() => handleShow(null)}>
                {/* Service Section */}
                <div onMouseLeave={() => handleShow(null)}>
                  {/* Service Section */}
                  <div className="bg-white w-full h-fit md:block hidden">
                    <div className="grid grid-cols-4 items-start justify-center gap-6 text-black/75 global-padding pt-[22px]">
                      <div className="">
                        <div className="w-fit mx-auto">
                          <p className="text-[16px] font-semibold tracking-wide">
                            {t("Choose")}
                          </p>
                          <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                            <li className="cursor-pointer">
                              <Link
                                href={locale === 'fr' ? "/blog/mat-comparatif-afs" : "/blog/mast-comparison-afs"}>
                                {t("Mast comparison (Coming Soon)")}
                              </Link>
                            </li>
                            <li className="cursor-pointer">
                              <Link href={locale === 'fr' ? "/blog/afs-et-afs-advanced-board-construction" : "/blog/afs-and-afs-advanced-board-construction"}>
                                {t("Board construction (Coming Soon)")}
                              </Link>
                            </li>
                            <li className="cursor-pointer"><Link href={locale === 'fr' ? "/reprise-materiel" : "/equipment-recovery"}>{t("Equipment trade-in")}</Link></li>
                            <li className="cursor-pointer"><Link href={locale === 'fr' ? "" : ""}>{t("Foil specifications")}</Link></li>
                            <li className="cursor-pointer"><Link href={locale === 'fr' ? "" : ""}>{t("Screw size")}</Link></li>
                          </ul>
                        </div>
                      </div>
                      <div>
                        <div className="w-fit mx-auto">
                          <p className="text-[16px] font-semibold tracking-wide">
                            {t("Repair & Maintenance")}
                          </p>
                          <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                            <li className="cursor-pointer">
                              <a target="_blank" onClick={handleCloseDesktopMenu} href="https://afs-foiling.crisp.help/fr/">{t("Support")}</a>
                            </li>
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} href="/service-request">{t("Customer Service Request")}</Link>
                            </li>
                            <li className="cursor-pointer">
                              <a onClick={handleCloseDesktopMenu} href="https://afs-foiling.crisp.help/fr/article/garantie-afs-duree-et-conditions-fnhfqg/?bust=1738253018543">{t("Warranty")}</a>
                            </li>
                            <li className="cursor-pointer">
                              <a target="_blank" onClick={handleCloseDesktopMenu} href="https://foilandco.sharepoint.com/sites/Market/Documents%20partages/Forms/AllItems.aspx?id=%2Fsites%2FMarket%2FDocuments%20partages%2FGeneral%2FContent%2FBrochure%2F2025%2FNOTICE%20AFS%5FFR%202%2Epdf&parent=%2Fsites%2FMarket%2FDocuments%20partages%2FGeneral%2FContent%2FBrochure%2F2025&p=true&ga=1">
                                {t("User manual")}
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div>
                        <div className="w-fit mx-auto">
                          <p className="text-[16px] font-semibold tracking-wide">
                            {t("Contact")}
                          </p>
                          <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                            <li className="cursor-pointer">
                              <button className="cursor-pointer" onclick="$crisp.push(['do', 'chat:open'])">Chat</button>
                            </li>
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} target="_blank" href="mailto:support@afs-foiling.com">Email</Link>
                            </li>
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} target="_blank" href="https://wa.me/33782296241">WhatsApp</Link>
                            </li>
                            <li className="cursor-pointer">
                              {t("Book a call with an AFS expert")}
                            </li>
                            <li className="cursor-pointer">
                              {t("Come visit us")}
                            </li>
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} href="/afs-events">{t("Events")}</Link>
                            </li>
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} href="/blog">Blog</Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div>
                        <div className="w-fit mx-auto">
                          <p className="text-[16px] font-semibold tracking-wide">
                            Team
                          </p>
                          <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} href="/afs-team">{t("Work team")}</Link>
                            </li>
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} href="/afs-ambassadors">{t("Ambassadors")}</Link>
                            </li>
                            <li className="cursor-pointer">
                              <Link onClick={handleCloseDesktopMenu} href="/map">{t("Dealer map")}</Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row-reverse items-center justify-center gap-2 text-black/75 py-4 border-t mt-6">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 5L5 19M19 5H6.4M19 5V17.6"
                          stroke="black"
                          strokeWidth="2"
                        />
                      </svg>
                      <span className="text-[#111] font-semibold cursor-pointer">
                        <Link onClick={handleCloseDesktopMenu} href="/visit-the-factory">{t("Factory tour")}</Link>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links Mobile */}
      </nav>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 1st slide */}

      <div
        id="mobile-navigation"
        ref={navRef}
        className="fixed top-[80px] left-0 right-0 bottom-0 transform -translate-x-full opacity-0 text-black/75 overflow-y-scroll z-[130] bg-white md:hidden block pb-[60px]"
      >
        <div className="pt-4 px-6">
          <p className="text-[12px] leading-[100%] font-bold uppercase text-[#999999]">
            Products
          </p>
          <ul className="mt-5 space-y-4 pb-10">
            {NAV_LINKS?.map((link, idx) => (
              <li
                onClick={() => {
                  // Si le lien n'a pas de sous-menus, fermer le menu
                  if (!link.sublinks || link.sublinks.length === 0) {
                    if (link.name == 'Service') {
                      handleShow('Service');
                    } else {
                      handleCloseMenu();
                    }
                  } else {
                    handleShow(link.name);
                  }
                }}
                key={idx}
                className="text-[22px] font-semibold leading-[100%] tracking-[-0.01em] flex items-center justify-between pb-[10px] border-b border-b-[#E6E6E6]"
              >
                <span className="w-fit">
                  <Link href={normalizeUrl(link.href)} onClick={(e) => {
                    // Si le lien n'a pas de sous-menus, fermer le menu
                    if (!link.sublinks || link.sublinks.length === 0) {
                      handleCloseMenu();
                    }
                  }}>{link.name}</Link>
                </span>
                {(link.sublinks?.length > 0 || link.name == 'Service') && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 5L12.5 10L7.5 15"
                      stroke="#111111"
                      strokeOpacity="0.75"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            ))}

          </ul>
          <div>
            <p className="text-[12px] leading-[100%] font-bold uppercase text-[#999999]">
              Others
            </p>
            <div className="space-y-4">
              <button onClick={() => setPopUp(true)} className="mt-4 flex items-center justify-center text-sm font-extrabold p-2 rounded-full cursor-pointer transition-colors duration-200">
                <span className={`fi fi-${getCountryByCode(selectedCountryCode)?.flag || 'fr'} h-[10.29px] mt-[2px] w-[13.71px] mr-2 scale-125`}></span>
                <span className="text-black font-extrabold tracking-wide">
                  {locale === 'fr' ? 'FR' : 'EN'}
                </span>
                <span className="mx-[2px]">/</span>
                <span className="flex items-center gap-[2px] text-black font-extrabold tracking-wide">
                  {selectedCurrency === 'euro' ? <Euro className="inline mr-1 w-4 h-4" /> : <DollarSign className="inline mr-1 mt-[2px] w-4 h-4" />}
                  {selectedCurrency === 'euro' ? 'EUR' : 'USD'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2nd slide */}
      {(subLinks?.sublinks?.length > 0 || hoverId == 'Service') && (
        <div
          ref={secondRef}
          className="fixed top-[80px] left-0 right-0 bottom-0 transform translate-x-full opacity-0 text-black/75 z-[110] bg-white px-6 pb-6 pt-4 block md:hidden overflow-y-scroll"
        >
          <p
            onClick={() => handleShow(null)}
            className="text-[12px] leading-[100%] font-bold uppercase text-[#999999] flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4 mt-[2px]" />
            <span className="block">{hoverId}</span>
          </p>
          {hoverId !== "Service" ? (
            <>
              <ul className="mt-5 space-y-4">
                {subLinks?.sublinks?.map((children, i) => {
                  return (
                    <li
                      onClick={() => {
                        // Si le lien n'a pas de produits, fermer le menu
                        if (!children?.products || children.products.length === 0) {
                          handleCloseMenu();
                        } else {
                          setDetailsDiv(children.name);
                        }
                      }}
                      key={i}
                      className="text-[22px] font-semibold leading-[100%] tracking-[-0.01em] flex items-center justify-between pb-[10px] border-b border-b-[#E6E6E6]"
                    >
                      {
                        children?.products.length === 0 && children?.url ? <span className="w-fit">
                          <Link href={normalizeUrl(children?.url)} onClick={handleCloseMenu}>{children.name}</Link>
                        </span> : <span className="w-fit">{children.name}</span>
                      }
                      {
                        children?.products.length > 0 && <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 5L12.5 10L7.5 15"
                            stroke="#111111"
                            strokeOpacity="0.75"
                            strokeWidth="1.5"
                            strokeLinecap="square"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 text-black/75 pt-[22px]">
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    {t("Choose")}
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer"><Link href="/" onClick={handleCloseDesktopMenu}>
                      {t("Mast comparison (Coming Soon)")}
                    </Link></li>
                    <li className="cursor-pointer"><Link href="/" onClick={handleCloseDesktopMenu}>
                      {t("Board construction (Coming Soon)")}
                    </Link></li>
                    <li className="cursor-pointer"><Link href="/" onClick={handleCloseDesktopMenu}>
                      {t("Equipment trade-in")}
                    </Link></li>
                    <li className="cursor-pointer"><Link href="/" onClick={handleCloseDesktopMenu}>
                      {t("Foil specifications")}
                    </Link></li>
                    <li className="cursor-pointer"><Link href="/" onClick={handleCloseDesktopMenu}>
                      {t("Screw size")}
                    </Link></li>
                  </ul>
                </div>
                {/* <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    {t("Shipping & Delivery")}
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">Suivi de commande</li>
                    <li className="cursor-pointer">Envoi et livraison</li>
                    <li className="cursor-pointer">Retours</li>
                  </ul>
                </div> */}
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    {t("Repair & Maintenance")}
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">
                      <a target="_blank" onClick={handleCloseDesktopMenu} href="https://afs-foiling.crisp.help/fr/">{t("Support")}</a>
                    </li>
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} href="/service-request">{t("Customer Service Request")}</Link>
                    </li>
                    <li className="cursor-pointer">
                      <a onClick={handleCloseDesktopMenu} href="https://afs-foiling.crisp.help/fr/article/garantie-afs-duree-et-conditions-fnhfqg/?bust=1738253018543">{t("Warranty")}</a>
                    </li>
                    <li className="cursor-pointer">
                      <a target="_blank" onClick={handleCloseDesktopMenu}
                        href="https://foilandco.sharepoint.com/sites/Market/Documents%20partages/Forms/AllItems.aspx?id=%2Fsites%2FMarket%2FDocuments%20partages%2FGeneral%2FContent%2FBrochure%2F2025%2FNOTICE%20AFS%5FFR%202%2Epdf&parent=%2Fsites%2FMarket%2FDocuments%20partages%2FGeneral%2FContent%2FBrochure%2F2025&p=true&ga=1">
                        {t("User manual")}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    {t("Contact")}
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} target="_blank" href="mailto:support@afs-foiling.com">Email</Link>
                    </li>
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} target="_blank" href="https://wa.me/33782296241">WhatsApp</Link>
                    </li>
                    <li className="cursor-pointer">
                      {t("Book a call with an AFS expert")}
                    </li>
                    <li className="cursor-pointer">
                      {t("Come visit us")}
                    </li>
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} href="/afs-events">{t("Events")}</Link>
                    </li>
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} href="/blog">Blog</Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    {t("Team")}
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} href="/afs-team">{t("Work team")}</Link>
                    </li>
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} href="/afs-ambassadors">{t("Ambassadors")}</Link>
                    </li>
                    <li className="cursor-pointer">
                      <Link onClick={handleCloseDesktopMenu} href="/map">{t("Dealer map")}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-row-reverse items-center justify-center gap-2 text-black/75 py-4 border-t mt-6">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 5L5 19M19 5H6.4M19 5V17.6"
                    stroke="black"
                    strokeWidth="2"
                  />
                </svg>
                <span className="text-[#111] font-semibold cursor-pointer">
                  <Link onClick={handleCloseDesktopMenu} href="/visit-the-factory">{t("Factory tour")}</Link>
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3rd Part */}
      {productList?.length > 0 && (
        <div
          ref={thirdRef}
          className="fixed top-[80px] left-0 right-0 bottom-0 transform -translate-x-full opacity-0 text-black/75 z-[110] bg-white block md:hidden pt-4 overflow-y-scroll"
        >
          <div className="p-6">
            <p
              onClick={() => setDetailsDiv(null)}
              className="text-[12px] leading-[100%] font-bold uppercase text-[#999999] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4 mt-[2px]" />
              <span className="block">{detailsDiv}</span>
            </p>
            <div className="mt-5">
              <h4 className="font-semibold text-base leading-[110%]">
                {hoverId}
              </h4>
              <h3 className="font-semibold text-[28px] leading-[100%] mt-[6px] text-[#1D98FF]">
                {detailsDiv}
              </h3>
            </div>
            <ul className="mt-5 flex flex-col gap-4">
              {productList?.map((product, i) => (
                <Link href={normalizeUrl(product.url)} key={i} onClick={handleCloseMenu}>
                  <li>
                    <div className="text-[22px] font-semibold leading-[100%] tracking-[-0.01em] flex items-center justify-between">
                      <span>{product.name}</span>
                    </div>
                    <p
                      className="font-semibold text-xs leading-[100%] price-wrapper mt-1"
                      dangerouslySetInnerHTML={{ __html: product.price }}
                    ></p>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
          {(allProducts?.button_one?.label ||
            allProducts?.button_two?.label) && (
              <div className="flex flex-col items-start justify-start bg-[#f0f0f0] mt-6 gap-2 p-6">
                {allProducts?.button_one?.label && (
                  <button>
                    <Link
                      href={normalizeUrl(allProducts?.button_one?.url)}
                      className="text-black/75 font-semibold flex items-center gap-1"
                    >
                      <span className="inline-block">
                        {allProducts?.button_one.label}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        className="font-semibold"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M19 5L5 19M19 5H6.4M19 5V17.6"
                          stroke="#000000BF"
                          strokeWidth="3"
                        />
                      </svg>
                    </Link>
                  </button>
                )}
                {allProducts?.button_two?.label && (
                  <button>
                    <Link
                      href={normalizeUrl(allProducts?.button_two?.url)}
                      className="text-black/75 font-semibold flex items-center gap-1"
                    >
                      <span className="inline-block">
                        {allProducts?.button_two.label}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        className="font-semibold"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M19 5L5 19M19 5H6.4M19 5V17.6"
                          stroke="#000000BF"
                          strokeWidth="3"
                        />
                      </svg>
                    </Link>
                  </button>
                )}
              </div>
            )}
        </div>
      )}
      {/* show sideCart */}
      <SideCart isOpen={sideCartOpen} onClose={closeSideCart} />

      {hoverId && (
        <div
          className="absolute inset-0 z-30 backdrop-blur-[10px] bg-black/40 md:block hidden"
          onMouseEnter={() => handleShow(null)}
        ></div>
      )}


      {/* Location and Language Modal */}
      <LocationLanguageModal
        isOpen={showPopUp}
        onClose={() => {
          setPopUp(false);
          setNotification(null);
        }}
        currentLocale={locale}
        currentCurrency={selectedCurrency}
        currentLocation={selectedLocation}
        currentCountryCode={selectedCountryCode}
        onSubmit={handleLocationModalSubmit}
      />
    </>
  );
};

export default Navbar;
