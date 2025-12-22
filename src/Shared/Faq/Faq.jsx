"use client";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useRef, useState } from 'react';

const Faq = ({ data, headline }) => {
    const [isOpen, setOpen] = useState(false);

    const faq = useRef(null);
    const contentRef = useRef(null);
    const iconRef = useRef(null);

    useGSAP(() => {
        if (!faq.current) return;

        const fullHeight = contentRef.current.scrollHeight;

        gsap.to(iconRef.current, {
            rotate: isOpen ? 180 : 0,
            duration: 0.4,
            ease: "power1.inOut"
        });

        gsap.to(contentRef.current, {
            height: isOpen ? fullHeight : 0,
            duration: 0.4,
            ease: "power2.out"
        });
    }, [isOpen]);

    return (
        <div ref={faq} className='faq'>
            <div
                className='pb-4 cursor-pointer border-b-2 border-[#D9D9D9] flex items-start justify-between'
                onClick={() => setOpen(!isOpen)}
            >
                <h3 className='uppercase text-base leading-[20px] text-[#111111b2] font-bold'>
                    {headline}
                </h3>

                <span ref={iconRef}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M6 6H12C12.7956 6 13.5587 6.31607 14.1213 6.87868C14.6839 7.44129 15 8.20435 15 9V19M15 19L11 15M15 19L19 15"
                            stroke="#333333"
                            strokeWidth="2"
                            strokeLinecap="square"
                        ></path>
                    </svg>
                </span>
            </div>
            <div className={`${isOpen ? "py-5" : "pb-5"}`}>
                <div
                    ref={contentRef}
                    className='overflow-hidden'
                    dangerouslySetInnerHTML={{ __html: data }}
                />
            </div>
        </div>
    );
};

export default Faq;
