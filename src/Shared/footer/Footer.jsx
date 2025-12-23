'use client'
import { useGSAP } from '@gsap/react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useState, useEffect } from 'react';
import gsap from "gsap"

const Footer = () => {
    const [first, setFirst] = useState(false);
    const [second, setSecond] = useState(false);
    const [third, setThird] = useState(false);
    const [fourth, setFourth] = useState(false);
    const contentRef = useRef(null);
    const contentRef2 = useRef(null);
    const contentRef3 = useRef(null);
    const contentRef4 = useRef(null);

    // Initialize accordions: closed on mobile, open on desktop
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                if (window.innerWidth >= 1024) {
                    // On desktop, reset all states and ensure content is visible
                    setFirst(false);
                    setSecond(false);
                    setThird(false);
                    setFourth(false);

                    // Ensure content is visible on desktop
                    if (contentRef.current) contentRef.current.style.height = 'auto';
                    if (contentRef2.current) contentRef2.current.style.height = 'auto';
                    if (contentRef3.current) contentRef3.current.style.height = 'auto';
                    if (contentRef4.current) contentRef4.current.style.height = 'auto';
                } else {
                    // On mobile, ensure all accordions are closed (height: 0)
                    if (contentRef.current) contentRef.current.style.height = '0px';
                    if (contentRef2.current) contentRef2.current.style.height = '0px';
                    if (contentRef3.current) contentRef3.current.style.height = '0px';
                    if (contentRef4.current) contentRef4.current.style.height = '0px';
                }
            }
        };

        // Check on mount
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helper function to check if mobile
    const isMobile = () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 1024; // lg breakpoint
    };

    useGSAP(() => {
        if (!contentRef.current || !isMobile()) return;
        const ctx = gsap.context(() => {
            const element = contentRef.current;
            // On mobile, start with height 0 if closed
            if (!first && element.style.height !== '0px') {
                element.style.height = '0px';
                return;
            }
            const targetHeight = first ? element.scrollHeight : 0;

            gsap.to(element, {
                height: targetHeight,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    // Set to auto after opening so content can grow if needed
                    if (first) {
                        element.style.height = "auto";
                    } else {
                        element.style.height = "0px";
                    }
                }
            });
        }, contentRef);

        return () => ctx.revert();
    }, { dependencies: [first] });

    useGSAP(() => {
        if (!contentRef2.current || !isMobile()) return;
        const ctx = gsap.context(() => {
            const element = contentRef2.current;
            // On mobile, start with height 0 if closed
            if (!second && element.style.height !== '0px') {
                element.style.height = '0px';
                return;
            }
            const targetHeight = second ? element.scrollHeight : 0;

            gsap.to(element, {
                height: targetHeight,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    if (second) {
                        element.style.height = "auto";
                    } else {
                        element.style.height = "0px";
                    }
                }
            });
        }, contentRef2);

        return () => ctx.revert();
    }, { dependencies: [second] });

    useGSAP(() => {
        if (!contentRef3.current || !isMobile()) return;
        const ctx = gsap.context(() => {
            const element = contentRef3.current;
            // On mobile, start with height 0 if closed
            if (!third && element.style.height !== '0px') {
                element.style.height = '0px';
                return;
            }
            const targetHeight = third ? element.scrollHeight : 0;

            gsap.to(element, {
                height: targetHeight,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    if (third) {
                        element.style.height = "auto";
                    } else {
                        element.style.height = "0px";
                    }
                }
            });
        }, contentRef3);

        return () => ctx.revert();
    }, { dependencies: [third] });

    useGSAP(() => {
        if (!contentRef4.current || !isMobile()) return;
        const ctx = gsap.context(() => {
            const element = contentRef4.current;
            // On mobile, start with height 0 if closed
            if (!fourth && element.style.height !== '0px') {
                element.style.height = '0px';
                return;
            }
            const targetHeight = fourth ? element.scrollHeight : 0;

            gsap.to(element, {
                height: targetHeight,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    if (fourth) {
                        element.style.height = "auto";
                    } else {
                        element.style.height = "0px";
                    }
                }
            });
        }, contentRef4);

        return () => ctx.revert();
    }, { dependencies: [fourth] });

    return (
        <footer className='bg-[#f0f0f0]'>
            {/* TOP ICON ROW */}
            <div className="bg-[#111] flex lg:flex-row flex-col items-start lg:items-center justify-center global-padding">
                <div
                    className="bg-[#111] max-w-[1920px] flex-1 py-[32px] 
          text-[#c7c7c7] text-[clamp(0.875rem,0.6528rem+0.3472vw,1rem)] font-semibold
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[20px] text-center uppercase leading-[1.1]"
                >
                    {/* ICON BOX */}
                    <div className="footer-box p-[clamp(1rem,_0.5556rem+0.6944vw,_1.25rem)] flex flex-col items-center justify-start gap-[4px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 41 40"
                            fill="none"
                        >
                            <path
                                d="M10.75 28.3333C8.90906 28.3333 7.41667 29.8257 7.41667 31.6667C7.41667 33.5076 8.90906 35 10.75 35C12.591 35 14.0833 33.5076 14.0833 31.6667C14.0833 29.8257 12.591 28.3333 10.75 28.3333ZM10.75 28.3333V5H7.41667M10.75 28.3333H24.0833M32.4167 31.6667C32.4167 33.5076 30.9243 35 29.0833 35C27.2424 35 25.75 33.5076 25.75 31.6667M10.75 8.33333L34.0833 10L33.25 15.8333M10.75 21.6667H22.4167M25.75 18.3333L37.4167 21.6667L31.5833 24.1667L29.0833 30L25.75 18.3333Z"
                                stroke="#C7C7C7"
                                stroke-width="2"
                                stroke-linecap="square"
                                stroke-linejoin="round"
                            ></path>
                        </svg>
                        <p>Click & Collect</p>
                    </div>
                    <div className="footer-box p-[clamp(1rem,_0.5556rem+0.6944vw,_1.25rem)] flex flex-col items-center justify-start gap-[4px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 41 40"
                            fill="none"
                        >
                            <path
                                d="M4.08331 16.6666H34.0833M9.08331 24.9999H7.41665M12.4166 24.9999H14.0833M20.75 31.6666H9.08331C6.32189 31.6666 4.08331 29.428 4.08331 26.6666V13.3333C4.08331 10.5718 6.32189 8.33325 9.08331 8.33325H29.0833C31.8447 8.33325 34.0833 10.5718 34.0833 13.3333V18.3333M28.25 28.3333L30.75 30.8333L34.0833 25.8333M30.75 36.6666C30.75 36.6666 37.4166 33.3333 37.4166 28.3333V22.4999L30.75 19.9999L24.0833 22.4999V28.3333C24.0833 33.3333 30.75 36.6666 30.75 36.6666Z"
                                stroke="#C7C7C7"
                                stroke-width="2"
                                stroke-linecap="square"
                                stroke-linejoin="round"
                            ></path>
                        </svg>
                        <p>Paiements sécurisés en 3 ou 4 fois</p>
                    </div>
                    <div className="footer-box p-[clamp(1rem,_0.5556rem+0.6944vw,_1.25rem)] flex flex-col items-center justify-start gap-[4px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 41 40"
                            fill="none"
                        >
                            <path
                                d="M5.25 33.3334V30.0001C5.25 28.232 5.95238 26.5363 7.20262 25.286C8.45286 24.0358 10.1486 23.3334 11.9167 23.3334H18.5833C20.3514 23.3334 22.0471 24.0358 23.2974 25.286C24.5476 26.5363 25.25 28.232 25.25 30.0001V33.3334M26.9167 6.88342C28.3507 7.25059 29.6217 8.08459 30.5294 9.25394C31.4371 10.4233 31.9297 11.8615 31.9297 13.3418C31.9297 14.822 31.4371 16.2602 30.5294 17.4296C29.6217 18.5989 28.3507 19.4329 26.9167 19.8001M35.25 33.3335V30.0001C35.2415 28.5287 34.7465 27.1015 33.8421 25.9408C32.9377 24.7801 31.6747 23.9513 30.25 23.5835M21.0833 30.0001L17.75 30.0001M31.0833 30.0001H29.4167M21.9167 13.3334C21.9167 17.0153 18.9319 20.0001 15.25 20.0001C11.5681 20.0001 8.58333 17.0153 8.58333 13.3334C8.58333 9.65152 11.5681 6.66675 15.25 6.66675C18.9319 6.66675 21.9167 9.65152 21.9167 13.3334Z"
                                stroke="#C7C7C7"
                                stroke-width="2"
                                stroke-linecap="square"
                                stroke-linejoin="round"
                            ></path>
                        </svg>
                        <p>Conseils de passionnés</p>
                    </div>
                    <div className="footer-box p-[clamp(1rem,_0.5556rem+0.6944vw,_1.25rem)] flex flex-col items-center justify-start gap-[4px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 41 40"
                            fill="none"
                        >
                            <path
                                d="M34.0833 18.3332C33.6757 15.4002 32.3151 12.6826 30.211 10.599C28.107 8.51539 25.3762 7.18137 22.4394 6.80242C19.5026 6.42348 16.5227 7.02064 13.9586 8.50191C11.3946 9.98318 9.38871 12.2664 8.24996 14.9998M7.41663 9.99992V14.9998L12.4166 14.9999M7.41663 21.6666C7.82422 24.5996 9.18484 27.3172 11.2889 29.4008C13.3929 31.4844 16.1237 32.8184 19.0605 33.1973C21.9973 33.5763 24.9773 32.9791 27.5413 31.4978C30.1053 30.0166 32.1112 27.7334 33.25 24.9999M34.0833 29.9999V24.9999H29.0833M24.0833 14.9999H19.9166C19.2536 14.9999 18.6177 15.2633 18.1489 15.7322C17.68 16.201 17.4166 16.8369 17.4166 17.4999C17.4166 18.163 17.68 18.7988 18.1489 19.2677C18.6177 19.7365 19.2536 19.9999 19.9166 19.9999H21.5833C22.2463 19.9999 22.8822 20.2633 23.3511 20.7322C23.8199 21.201 24.0833 21.8369 24.0833 22.4999C24.0833 23.163 23.8199 23.7988 23.3511 24.2677C22.8822 24.7365 22.2463 24.9999 21.5833 24.9999H17.4166M20.75 24.9999V26.6666M20.75 13.3333V14.9999"
                                stroke="#C7C7C7"
                                stroke-width="2"
                                stroke-linecap="square"
                                stroke-linejoin="round"
                            ></path>
                        </svg>
                        <p>Satisfait ou remboursé</p>
                    </div>
                    <div className="footer-box p-[clamp(1rem,_0.5556rem+0.6944vw,_1.25rem)] flex flex-col items-center justify-start gap-[4px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 41 40"
                            fill="none"
                        >
                            <path
                                d="M15.6059 19.9999L18.7019 22.9715L24.8939 17.0283M14.1593 6.2309L12.2969 5.97806C10.6434 5.75359 9.10236 6.82821 8.81383 8.40696L8.48885 10.1852C8.32386 11.088 7.73404 11.8672 6.89047 12.2968L5.22891 13.1429C3.75374 13.8941 3.16512 15.6329 3.89851 17.0729L4.72456 18.6949C5.14394 19.5184 5.14394 20.4815 4.72456 21.3049L3.89851 22.9269C3.16512 24.3669 3.75374 26.1057 5.22891 26.8569L6.89047 27.7031C7.73404 28.1327 8.32386 28.9119 8.48885 29.8147L8.81383 31.5929C9.10236 33.1716 10.6434 34.2463 12.2969 34.0218L14.1593 33.7689C15.1048 33.6406 16.0592 33.9382 16.7455 34.5755L18.0974 35.8307C19.2976 36.9452 21.2024 36.9452 22.4027 35.8307L23.7546 34.5755C24.4409 33.9382 25.3953 33.6406 26.3408 33.7689L28.2032 34.0218C29.8567 34.2463 31.3977 33.1716 31.6863 31.5929L32.0112 29.8147C32.1762 28.9119 32.766 28.1327 33.6096 27.7031L35.2712 26.8569C36.7463 26.1057 37.335 24.3669 36.6016 22.9269L35.7755 21.3049C35.3561 20.4815 35.3561 19.5184 35.7755 18.6949L36.6016 17.0729C37.335 15.6329 36.7463 13.8941 35.2712 13.1429L33.6096 12.2968C32.766 11.8672 32.1762 11.088 32.0112 10.1852L31.6863 8.40696C31.3977 6.82821 29.8567 5.75358 28.2032 5.97806L26.3408 6.2309C25.3953 6.35927 24.4409 6.06165 23.7546 5.42435L22.4027 4.16909C21.2024 3.05464 19.2976 3.05464 18.0974 4.16909L16.7455 5.42435C16.0592 6.06165 15.1048 6.35927 14.1593 6.2309ZM31.0858 19.9999C31.0858 25.744 26.2343 30.4005 20.2497 30.4005C14.2652 30.4005 9.41371 25.744 9.41371 19.9999C9.41371 14.2558 14.2652 9.5993 20.2497 9.5993C26.2343 9.5993 31.0858 14.2558 31.0858 19.9999Z"
                                stroke="#C7C7C7"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                        </svg>
                        <p>2 à 3 ans de garantie</p>
                    </div>
                    <div className="footer-box p-[clamp(1rem,_0.5556rem+0.6944vw,_1.25rem)] flex flex-col items-center justify-start gap-[4px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 41 40"
                            fill="none"
                        >
                            <path
                                d="M37.1667 17.8338C36.6376 13.8145 34.6556 10.125 31.5917 7.45593C28.5277 4.78686 24.5919 3.32121 20.521 3.33333C16.4501 3.34545 12.5231 4.83451 9.47529 7.52178C6.42743 10.2091 4.4676 13.9103 3.96266 17.9327C3.45773 21.955 4.4423 26.0228 6.73208 29.3744C9.02186 32.7261 12.4599 35.1318 16.4025 36.1414C20.3452 37.151 24.5222 36.6951 28.1517 34.8592C31.7811 33.0232 34.6142 29.9331 36.1206 26.1671M37.1667 34.5003V26.1671H28.9025M11.1667 16.6666H29.8334M11.1667 23.3333L27.1667 23.3333M19.9445 9.99992C18.0726 12.9995 17.0802 16.4642 17.0802 19.9999C17.0802 23.5356 18.0726 27.0004 19.9445 29.9999M21.0556 9.99992C22.9274 12.9995 23.9198 16.4642 23.9198 19.9999C23.9198 23.5356 22.9274 27.0004 21.0556 29.9999M30.2699 22.1428C30.2699 22.1428 30.5 20.7355 30.5 19.9999C30.5 14.4771 26.0229 9.99992 20.5 9.99992C14.9772 9.99992 10.5 14.4771 10.5 19.9999C10.5 25.5228 14.9772 29.9999 20.5 29.9999C22.6247 29.9999 24.5946 29.3373 26.2143 28.2075"
                                stroke="#C7C7C7"
                                stroke-width="2"
                            ></path>
                        </svg>
                        <p>Livraison dans le monde entier</p>
                        <p className="text-[#999999]">Détaxe disponible</p>
                    </div>
                    {/* Keep other icons same */}
                </div>
            </div>
            {/* lower Section */}
            <div className='max-w-[1440px] mx-auto global-padding py-20 flex lg:flex-row flex-col justify-between items-start lg:gap-20 gap-10'>
                <div className='max-w-[360px]'>
                    <Image src={'https://afs-foiling.com/fr/wp-content/uploads/2025/12/svgviewer-output-36.svg'} width={172} height={144} alt='Logo-Afs' className='mb-10' />
                    <div className="news-letter max-w-[360px] w-full flex flex-col gap-4">
                        <h3 className="text-[16px] font-bold leading-[1.1] text-[#404040]">
                            Enter your email address to subscribe to our newsletters
                        </h3>

                        <form className="flex flex-col gap-3 text-black">
                            <div className="flex border border-[#111] rounded-[4px] relative">
                                <label className="absolute text-[14px] bg-[#f0f0f0] text-[#999999] top-[-8.4px] left-[16px] font-semibold">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    placeholder="person@gmail.com"
                                    className="w-full px-4 py-3 placeholder-[#999999] font-semibold outline-none rounded-[4px]"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full text-black font-semibold rounded-md flex-[50px_0_0] flex items-center justify-center cursor-pointer"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="23"
                                        height="20"
                                        viewBox="0 0 23 20"
                                        fill="none"
                                    >
                                        <path
                                            d="M21.3286 9.9999L1.27141 9.9999M21.3286 9.9999L12.7326 18.5713M21.3286 9.9999L12.7326 1.42847"
                                            stroke="#808080"
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                            <span className='flex items-start gap-1 text-[#999] text-lg font-lg leading-[100%]'>
                                <input type='checkbox' className='' />
                                <label htmlFor="">I accept the privacy policy and terms of use</label>
                            </span>
                        </form>
                    </div>
                </div>
                <div className='lg:flex-1 w-full grid lg:grid-cols-4 grid-cols-1 lg:gap-5 lg:border-none border rounded-sm overflow-hidden'>
                    <div className='w-full lg:p-0 p-4 lg:border-none border-b'>
                        <h3 onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) setFirst(!first); }} className='flex items-center lg:cursor-default cursor-pointer font-bold text-base text-[#111] leading-[100%]'>Universe
                            <ChevronDown className={`inline ml-auto duration-300 transition-all ease-out lg:hidden block ${first ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul ref={contentRef} className='text-base text-[#111] leading-[120%] flex flex-col gap-3 lg:h-auto h-0 overflow-hidden'>
                            <li className='pt-5'>
                                <Link href={''} className=''>Wingfoil</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Downwind</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Prone Foil</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Sup Foil</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Dockstart</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Parawing</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Wakefoil</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Windfoil</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Sup</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Windsurf</Link>
                            </li>
                        </ul>
                    </div>
                    <div className='w-full lg:p-0 p-4 lg:border-none border-b'>
                        <h3 onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) setSecond(!second); }} className='flex items-center lg:cursor-default cursor-pointer font-bold text-base text-[#111] leading-[100%]'>Service Client
                            <ChevronDown className={`inline ml-auto duration-300 transition-all ease-out lg:hidden block ${second ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul ref={contentRef2} className='text-base text-[#111] leading-[120%] flex flex-col gap-3 lg:h-auto h-0 overflow-hidden'>
                            <li className='pt-5'>
                                <Link href={''} className=''>Foil Configurator</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Best match stab</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Comparator 3 stabs / front wing</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Mast comparison</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Board Construction</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Equipment</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Recovery</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Foil Characteristics</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Screw Size</Link>
                            </li>
                        </ul>
                    </div>
                    <div className='w-full lg:p-0 p-4 lg:border-none border-b'>
                        <h3 onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) setThird(!third); }} className='flex items-center lg:cursor-default cursor-pointer font-bold text-base text-[#111] leading-[100%]'>About Us
                            <ChevronDown className={`inline ml-auto duration-300 transition-all ease-out lg:hidden block ${third ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul ref={contentRef3} className='text-base text-[#111] leading-[120%] flex flex-col gap-3 lg:h-auto h-0 overflow-hidden'>
                            <li className='pt-5'>
                                <Link href={''} className=''>Afs advance</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Made in france</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Notice</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Team</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Join Us</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Legal Notices</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>General terms and conditions of sale</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>
                    <div className='w-full lg:p-0 p-4'>
                        <h3 onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) setFourth(!fourth); }} className='flex items-center lg:cursor-default cursor-pointer font-bold text-base text-[#111] leading-[100%]'>Purchasing tools
                            <ChevronDown className={`inline ml-auto duration-300 transition-all ease-out lg:hidden block ${fourth ? 'rotate-180' : ''}`} />
                        </h3>
                        <ul ref={contentRef4} className='text-base text-[#111] leading-[120%] flex flex-col gap-3 lg:h-auto h-0 overflow-hidden'>
                            <li className='pt-5'>
                                <Link href={''} className=''>Afs advance</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Made in france</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Notice</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Team</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Join Us</Link>
                            </li>
                            <li>
                                <Link href={''} className=''>Legal Notices</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='global-padding'>
                <p className='text-base font-semibold pt-4 pb-5 global-border-top text-[#111111bf] leading-[100%]'>Foil and Co., All rights are reserved. ©2025</p>
            </div>
        </footer>
    );
};

export default Footer;

