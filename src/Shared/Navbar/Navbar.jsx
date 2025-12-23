
"use client";
import { ArrowLeft, DollarSign, Euro, Search, X, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import SearchOverlay from "../../components/search";
import React, { useRef, useState, useEffect } from "react";
import "flag-icons/css/flag-icons.min.css";
import gsap from "gsap";
import Menu from "./Menu";
import { useGSAP } from "@gsap/react";
import PopUp from "../PopUp/PopUp";
import useCart from "../Hooks/useCart";
import SideCart from "../Cart/SideCart";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import SearchOverlay from "./search";
import Notification from "../Notification/Notification";

const Navbar = ({ NAV_LINKS }) => {
  const t = useTranslations("common");

  // Search Open
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const locale = useLocale();
  const { cart, sideCartOpen, openSideCart, closeSideCart, handleClearCart } = useCart();

  // États pour la langue et la devise sélectionnées
  const [selectedLanguage, setSelectedLanguage] = useState(locale || 'fr');
  
  // Get current currency from cart or default to 'euro'
  const currentCurrencySymbol = cart?.totals?.currency_symbol || '€';
  const currentCurrency = currentCurrencySymbol === '€' || currentCurrencySymbol === 'EUR' ? 'euro' : 'usd';
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [notification, setNotification] = useState(null);

  const totalQty = cart?.items_count;
  const pathName = usePathname();

  // Effet pour gérer la redirection après la soumission du formulaire
  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      // Utiliser window.location pour une redirection complète qui recharge l'application
      window.location.href = redirectPath;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRedirect]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedValues = {
      language: selectedLanguage, // "en" ou "fr"
      currency: selectedCurrency, // "usd" ou "euro"
    };
    
    // Clear cart if language or currency changes
    const languageChanged = selectedLanguage !== locale;
    
    // Get current currency from cart or default to 'euro'
    const currentCurrencySymbol = cart?.totals?.currency_symbol || '€';
    const currentCurrency = currentCurrencySymbol === '€' || currentCurrencySymbol === 'EUR' ? 'euro' : 'usd';
    const currencyChanged = selectedCurrency !== currentCurrency;
    
    // Clear the cart if language or currency changes
    if (languageChanged || currencyChanged) {
      try {
        // Check if cart has items before clearing
        const hasItems = cart && cart.items && cart.items.length > 0;
        
        if (hasItems) {
          const result = await handleClearCart();
          
          // Show notification if cart was cleared successfully
          if (result && result.success) {
            if (languageChanged) {
              setNotification(t("cartClearedLanguage"));
            } else if (currencyChanged) {
              setNotification(t("cartClearedCurrency"));
            }
          } else {
            console.error('Failed to clear cart:', result?.error);
          }
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
    
    if (languageChanged) {
      const currentPath = pathName || '/';
      const newPath = `/${selectedLanguage}${currentPath === '/' ? '' : currentPath}`;
      setRedirectPath(newPath);
      setShouldRedirect(true);
    } else {
      setPopUp(false);
    }
    return selectedValues;
  }

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

  const [showPopUp, setPopUp] = useState(false);


  return (
    <>
      {/* Notification Banner */}
      {notification && (
        <Notification
          message={notification}
          type="info"
          onClose={() => setNotification(null)}
          duration={5000}
        />
      )}
      
      <nav className={notification ? 'sticky left-0 right-0 top-0 z-[99] text-white w-full mt-[73px]' : 'sticky left-0 right-0 top-0 z-[99] text-white w-full'}>
        {/* Logo and Search Part */}
        <div
          className="py-4 bg-[#000000] global-padding border-b border-gray-600 w-full flex items-center justify-between"
          onMouseEnter={() => handleShow(null)}
        >
          <div className="flex items-center gap-2">
            {/* Menu */}
            <Menu isOpen={isOpen} setIsOpen={setIsOpen} />

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Alpago Properties Clone"
                width={150}
                height={45}
                priority
                className=""
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
                className="hidden md:flex items-center bg-[#3d3d3d] rounded-full h-9 w-64 px-3 placeholder:text-white placeholder:text-sm placeholder:pl-8 placeholder:font-semibold"
                placeholder="Rechercher..."
              />
              <Search className="w-6 h-6 mr-2 text-white opacity-90 absolute -translate-y-1/2 left-3 top-1/2" />
            </div>

            {/* Profile */}

            <Link href={"/login"}>
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
              className="flex items-center justify-center relative p-1 md:p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
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
            <button onClick={() => setPopUp(true)} className="hidden md:flex items-center justify-center text-sm font-extrabold p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <span className={`fi fi-${locale === 'fr' ? 'fr' : 'us'} fis mr-2 scale-125`}></span>
              <span className="text-white text-[0rem] font-extrabold tracking-wide">
                {locale === 'fr' ? 'FR' : 'EN'}
              </span>
            </button>
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
                  href={link.href || ""}
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
                        const url = children?.url ?? "#";
                        return (
                          <li
                            onClick={() => setDetailsDiv(children.name)}
                            className={`text-[16px] font-semibold tracking-wide cursor-pointer ${detailsDiv === children.name
                              ? "border-b border-b-black"
                              : ""
                              }`}
                            style={{ padding: "24px 12px 24px" }}
                            key={i}
                          >
                            <Link href={url}>{children.name}</Link>
                          </li>
                        );
                      })}
                    </ul>
                    {detailsDiv && productList?.length > 0 && (
                      <div className="h-[calc(100vh-230px)] max-h-[500px] overflow-y-auto scroll-smooth hide-scrollbar-y overscroll-contain bg-transparent">
                        <div
                          className="h-fit bg-white"
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
                                        <Link href={`${product.url}`}>
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
                                      href={`${allProducts?.button_one?.url}`}
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
                                      href={allProducts?.button_two?.url}
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
                    <div className="grid grid-cols-6 gap-6 text-black/75 global-padding pt-[22px]">
                      <div>
                        <p className="text-[16px] font-semibold tracking-wide">
                          Choose
                        </p>
                        <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                          <li className="cursor-pointer"><Link href="/">Foil configurator</Link></li>
                          <li className="cursor-pointer"><Link href="/">Best match stabilizer</Link></li>
                          <li className="cursor-pointer">
                            <Link href="/">3 stabilizers / front wing comparator</Link>
                          </li>
                          <li className="cursor-pointer"><Link href="/">Mast comparison</Link></li>
                          <li className="cursor-pointer"><Link href="/">Board construction</Link></li>
                          <li className="cursor-pointer"><Link href="/">Equipment buyback</Link></li>
                          <li className="cursor-pointer">
                            <Link href="/">Foil characteristics</Link>
                          </li>
                          <li className="cursor-pointer"><Link href="/">Screw sizes</Link></li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold tracking-wide">
                          Pay
                        </p>
                        <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                          <li className="cursor-pointer">Payment options</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold tracking-wide">
                          Shipping & Delivery
                        </p>
                        <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                          <li className="cursor-pointer">Order tracking</li>
                          <li className="cursor-pointer">Shipping & delivery</li>
                          <li className="cursor-pointer">Returns</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold tracking-wide">
                          Repair & Maintenance
                        </p>
                        <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                          <li className="cursor-pointer">Support</li>
                          <li className="cursor-pointer">After-sales service request</li>
                          <li className="cursor-pointer">Warranty</li>
                          <li className="cursor-pointer">User manual</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold tracking-wide">
                          Contact
                        </p>
                        <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                          <li className="cursor-pointer">Email</li>
                          <li className="cursor-pointer">WhatsApp</li>
                          <li className="cursor-pointer">
                            Book a call with an AFS expert
                          </li>
                          <li className="cursor-pointer">
                            Come visit us
                          </li>
                          <li className="cursor-pointer">Events</li>
                          <li className="cursor-pointer">Blog</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold tracking-wide">
                          Team
                        </p>
                        <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                          <li className="cursor-pointer">Work team</li>
                          <li className="cursor-pointer">Ambassadors</li>
                          <li className="cursor-pointer">Dealer map</li>
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
                        Factory tour
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
        className="fixed inset-0 transform translate-x-full opacity-0 h-screen text-black/75 overflow-y-scroll z-[60] bg-white md:hidden block pb-[60px]"
      >
        <div className="pt-[90px] px-6">
          <p className="text-[12px] leading-[100%] font-bold uppercase text-[#999999]">
            Products
          </p>
          <ul className="mt-5 space-y-4">
            {NAV_LINKS?.map((link, idx) => (
              <li
                onClick={() => handleShow(link.name)}
                key={idx}
                className="text-[22px] font-semibold leading-[100%] tracking-[-0.01em] flex items-center justify-between pb-[10px] border-b border-b-[#E6E6E6]"
              >
                <span className="w-fit">
                  <Link href={`${link.href}`}>{link.name}</Link>
                </span>
                {link.sublinks?.length > 0 && (
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
        </div>
      </div>
      {/* 2nd slide */}
      {subLinks?.sublinks?.length > 0 && (
        <div
          ref={secondRef}
          className="fixed inset-0 transform translate-x-full opacity-0 h-screen text-black/75 z-[70] bg-white px-6 pb-6 pt-[90px] block md:hidden overflow-y-scroll"
        >
          <p
            onClick={() => handleShow(null)}
            className="text-[12px] leading-[100%] font-bold uppercase text-[#999999]"
          >
            <ArrowLeft className="inline mr-1" />
            {hoverId}
          </p>
          {hoverId !== "Service" ? (
            <>
              <ul className="mt-5 space-y-4">
                {subLinks?.sublinks?.map((children, i) => {
                  return (
                    <li
                      onClick={() => setDetailsDiv(children.name)}
                      key={i}
                      className="text-[22px] font-semibold leading-[100%] tracking-[-0.01em] flex items-center justify-between pb-[10px] border-b border-b-[#E6E6E6]"
                    >
                      {
                        children?.products.length === 0 && children?.url ? <span className="w-fit">
                          <Link href={children?.url}>{children.name}</Link>
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
                    Choisir
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">Configurateur foil</li>
                    <li className="cursor-pointer">Best match stab</li>
                    <li className="cursor-pointer">
                      Comparateur 3 stabs / aile avant
                    </li>
                    <li className="cursor-pointer">Comparatif mât</li>
                    <li className="cursor-pointer">Construction planche</li>
                    <li className="cursor-pointer">Reprise matériel</li>
                    <li className="cursor-pointer">
                      Caractéristiques des foils
                    </li>
                    <li className="cursor-pointer">Taille des vis</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    Payer
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">Options paiement</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    Expédition et livraison
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">Suivi de commande</li>
                    <li className="cursor-pointer">Envoi et livraison</li>
                    <li className="cursor-pointer">Retours</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    Réparation et maintenance
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">Support</li>
                    <li className="cursor-pointer">Demande de SAV</li>
                    <li className="cursor-pointer">Garantie</li>
                    <li className="cursor-pointer">Notice d&apos;utilisation</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    Contact
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">Mail</li>
                    <li className="cursor-pointer">Whatsapp</li>
                    <li className="cursor-pointer">
                      Réserver un appel avec un expert AFS
                    </li>
                    <li className="cursor-pointer">Venir nous rendre visite</li>
                    <li className="cursor-pointer">Evenements</li>
                    <li className="cursor-pointer">Blog</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[16px] font-semibold tracking-wide">
                    Equipe
                  </p>
                  <ul className="mt-4 text-[16px] font-semibold tracking-wide text-[#111]">
                    <li className="cursor-pointer">Equipe de travail</li>
                    <li className="cursor-pointer">Ambassadeurs</li>
                    <li className="cursor-pointer">Map revendeurs</li>
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
                  {" "}
                  Visite de l’usine
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
          className="fixed inset-0 transform -translate-x-full opacity-0 h-screen text-black/75 z-[70] bg-white block md:hidden pt-[90px] overflow-y-scroll"
        >
          <div className="p-6">
            <p
              onClick={() => setDetailsDiv(null)}
              className="text-[12px] leading-[100%] font-bold uppercase text-[#999999]"
            >
              <ArrowLeft className="inline mr-1" />
              {detailsDiv}
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
                <Link href={`${product.url}`} key={i}>
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
                      href={`${allProducts?.button_one?.url}`}
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
                      href={`${allProducts?.button_two?.url}`}
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
          className="absolute inset-0 z-30 backdrop-blur-[10px] md:block hidden"
          onMouseEnter={() => handleShow(null)}
        ></div>
      )}


      <PopUp isOpen={showPopUp}>
        {/* Parent Div */}
        <div className="flex flex-col rounded-sm overflow-hidden bg-[#f0f0f0] max-w-[540px] w-full">
          {/* 1st div */}
          <div className="py-4 lg:px-10 px-5 shadow-[0_6px_8px_rgba(91,104,113,0.1)]">
            <div className="flex items-center gap-5">
              <h2 className="text-[#111] text-2xl leading-[100%] font-semibold">{t("chooseLocationLanguage")}</h2>
              <div className="w-fit p-[5px] rounded-full border border-[#111]">
                <X onClick={() => setPopUp(!showPopUp)} className="cursor-pointer" />
              </div>
            </div>
          </div>
          {/* 2nd div */}
          <div className="py-4 lg:px-10 px-5 max-h-[calc(100vh-140px)] overflow-y-scroll popup-scroll-bar">
            <div className="flex flex-col gap-[30px]">
              <div className="flex flex-col gap-4 mb-[30px]">
                <p className="text-[#111111bf] text-base leading-[100%] font-semibold">{t("currentLanguageCurrency")}</p>
                <ul className="flex flex-col gap-3">
                  <li className="min-h-[48px] font-bold px-3 py-2 bg-[#e2e2e2] flex items-center flex-wrap rounded-[10px] leading-[120%] text-[#111] text-sm uppercase">
                    <span className="flex gap-2 flex-1 items-center flex-wrap">
                      <span className={`fi fi-${locale === 'fr' ? 'fr' : 'us'} mr-2 scale-125`}></span>
                      {locale === 'fr' ? t("french") : t("english")}
                    </span>
                    <span className="font-bold">{locale === 'fr' ? t("french") : t("english")}</span>
                  </li>
                  <li className="min-h-[48px] font-bold px-3 py-2 bg-[#e2e2e2] flex items-center flex-wrap rounded-[10px] leading-[120%] text-[#111] text-sm uppercase">
                    <span className="flex gap-2 flex-1 items-center flex-wrap">
                      {currentCurrency === 'euro' ? <Euro className="" size={24} /> : <DollarSign className="" size={24} />}
                      {currentCurrency === 'euro' ? t("euro") : t("usDollar")}
                    </span>
                    <span className="font-bold">{currentCurrency === 'euro' ? 'EUR' : 'USD'}</span>
                  </li>
                </ul>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-[30px] font-bold">
              {/* Language Switcher */}
              <div className="flex flex-col items-stretch gap-4">
                <h4 className="mb-2 text-[22px] font-semibold leading-[120%] py-4 border-t-[#111] border-t">Available Languages</h4>
                <ul className="flex flex-col gap-3">
                  <li
                    onClick={() => setSelectedLanguage('en')}
                    className={`min-h-[48px] font-bold px-3 py-2 flex items-center flex-wrap rounded-[10px] leading-[120%] text-[#111] text-sm uppercase cursor-pointer transition-colors ${selectedLanguage === 'en' ? 'bg-white' : 'bg-[#e2e2e2] hover:bg-[#d2d2d2]'
                      }`}
                  >
                    <label className="flex items-center w-full cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value="en"
                        className="hidden"
                        checked={selectedLanguage === 'en'}
                        onChange={() => setSelectedLanguage('en')}
                      />
                      <span className="flex gap-2 flex-1 items-center flex-wrap">
                        <span className="fi fi-us mr-2 scale-125"></span>
                        {t("english")}
                      </span>
                      <span className="font-bold">{t("english")}</span>
                    </label>
                  </li>
                  <li
                    onClick={() => setSelectedLanguage('fr')}
                    className={`min-h-[48px] font-bold px-3 py-2 flex items-center flex-wrap rounded-[10px] leading-[120%] text-[#111] text-sm uppercase cursor-pointer transition-colors ${selectedLanguage === 'fr' ? 'bg-white' : 'bg-[#e2e2e2] hover:bg-[#d2d2d2]'
                      }`}
                  >
                    <label className="flex items-center w-full cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value="fr"
                        className="hidden"
                        checked={selectedLanguage === 'fr'}
                        onChange={() => setSelectedLanguage('fr')}
                      />
                      <span className="flex gap-2 flex-1 items-center flex-wrap">
                        <span className="fi fi-fr mr-2 scale-125"></span>
                        {t("french")}
                      </span>
                      <span className="font-bold">{t("french")}</span>
                    </label>
                  </li>
                </ul>
              </div>
              {/* Currency Switcher */}
              <div className="flex flex-col items-stretch gap-4">
                <h4 className="mb-2 text-[22px] font-semibold leading-[120%] py-4 border-t-[#111] border-t">Available Currencies</h4>
                <ul className="flex flex-col gap-3">
                  <li
                    onClick={() => setSelectedCurrency('euro')}
                    className={`min-h-[48px] font-bold px-3 py-2 flex items-center flex-wrap rounded-[10px] leading-[120%] text-[#111] text-sm uppercase cursor-pointer transition-colors ${selectedCurrency === 'euro' ? 'bg-white' : 'bg-[#e2e2e2] hover:bg-[#d2d2d2]'
                      }`}
                  >
                    <label className="flex items-center w-full cursor-pointer">
                      <input
                        type="radio"
                        name="currency"
                        value="euro"
                        className="hidden"
                        checked={selectedCurrency === 'euro'}
                        onChange={() => setSelectedCurrency('euro')}
                      />
                      <span className="flex gap-2 flex-1 items-center flex-wrap">
                        <Euro className="" size={24} />
                        {t("euro")}
                      </span>
                      <span className="font-bold">EUR</span>
                    </label>
                  </li>
                  <li
                    onClick={() => setSelectedCurrency('usd')}
                    className={`min-h-[48px] font-bold px-3 py-2 flex items-center flex-wrap rounded-[10px] leading-[120%] text-[#111] text-sm uppercase cursor-pointer transition-colors ${selectedCurrency === 'usd' ? 'bg-white' : 'bg-[#e2e2e2] hover:bg-[#d2d2d2]'
                      }`}
                  >
                    <label className="flex items-center w-full cursor-pointer">
                      <input
                        type="radio"
                        name="currency"
                        value="usd"
                        className="hidden"
                        checked={selectedCurrency === 'usd'}
                        onChange={() => setSelectedCurrency('usd')}
                      />
                      <span className="flex gap-2 flex-1 items-center flex-wrap">
                        <DollarSign className="" size={24} />
                        {t("usDollar")}
                      </span>
                      <span className="font-bold">USD</span>
                    </label>
                  </li>
                </ul>
              </div>
              {/* Submit Button */}
              <button type="submit" className="bg-[#000] text-white font-semibold rounded-[10px] py-[10px] px-2 w-full cursor-pointer">Change</button>
            </form>
          </div>
        </div >
      </PopUp >


    </>
  );
};

export default Navbar;
