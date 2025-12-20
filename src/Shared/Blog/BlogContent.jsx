"use client"
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const BlogContent = ({ blog }) => {

    const contentRef = useRef(null);
    const [heading, setHeadings] = useState([]);
    const blogRef = useRef(null);
    const prevHeadingsRef = useRef([]);
    const [activeId, setActiveId] = useState(null);
    const [clickedId, setClickedId] = useState(null);
    // Added Id to all h2
    useEffect(() => {
        if (!contentRef.current) return;
        // Assign IDs from h2 text and update headings state only when changed.
        const assignHeadingIds = () => {
            const headingElements = Array.from(contentRef.current.querySelectorAll("h2"));
            const newHeadings = headingElements.map((h) => ({
                // Use the raw heading text as the id (trimmed)
                id: h.textContent.trim(),
                text: h.textContent,
            }));
            // Assign IDs to all h2 elements (idempotent)
            headingElements.forEach((h, i) => {
                const newId = newHeadings[i].id;
                if (h.id !== newId) h.id = newId;
            });

            // Compare with previous headings to avoid unnecessary state updates and re-renders
            const prev = prevHeadingsRef.current;
            const isSame =
                prev.length === newHeadings.length &&
                prev.every((p, i) => p.id === newHeadings[i].id && p.text === newHeadings[i].text);

            if (!isSame) {
                prevHeadingsRef.current = newHeadings;
                setHeadings(newHeadings);
            }
        };

        // Try once immediately (content may already be present)
        assignHeadingIds();

        // Observe for DOM insertion (e.g. HTML inserted by dangerouslySetInnerHTML)
        const mutObserver = new MutationObserver(() => {
            assignHeadingIds();
        });
        mutObserver.observe(contentRef.current, { childList: true, subtree: true });

        return () => mutObserver.disconnect();
    }, [blog]);

    // Track active heading and read aloud using GSAP
    useEffect(() => {
        if (!contentRef.current || heading.length === 0 || clickedId) return;
        const headingElements = Array.from(contentRef.current.querySelectorAll("h2"));
        setActiveId(headingElements[0].id);
        const ctx = gsap.context(() => {
            headingElements.forEach((h) => {
                if (!h.id) return;
                // Create ScrollTrigger for each h2 to detect when it reaches middle of viewport
                ScrollTrigger.create({
                    trigger: h,
                    start: "top center", // When h2 center reaches viewport center
                    end: "top bottom",
                    onEnter: () => {
                        setActiveId(h.id);
                        setClickedId(null);
                    },
                    onEnterBack: () => {
                        setActiveId(h.id);
                        setClickedId(null);
                    },
                    markers: false
                });
            });
        }, contentRef);

        return () => ctx.revert();
    }, [heading, clickedId]);

    // Handle navigation click - only change clicked state, don't affect scroll tracking
    const handleNavClick = (id) => {
        setClickedId(id);
        setActiveId(null);
    };

    // When a user manually scrolls/uses touch/keyboard, clear the clicked state
    useEffect(() => {
        if (!clickedId) return;

        const clearClicked = () => {
            setClickedId(null);
        };

        const onKeyDown = (e) => {
            // common navigation keys that indicate user scroll intent
            const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
            if (keys.includes(e.key)) clearClicked();
        };

        window.addEventListener('wheel', clearClicked, { passive: true });
        window.addEventListener('touchstart', clearClicked, { passive: true });
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('wheel', clearClicked);
            window.removeEventListener('touchstart', clearClicked);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [clickedId]);

    // console.log(activeId);

    //  Content
    const content = blog?.content?.rendered;

    const [showTableOfContents, setShowTableOfContents] = useState(false);
    const tableOfContentsRef = useRef(null);


    useGSAP(() => {
        if (!tableOfContentsRef.current) return;

        const ctx = gsap.context(() => {
            const element = tableOfContentsRef.current;
            const targetHeight = showTableOfContents ? element.scrollHeight : 0;

            gsap.to(element, {
                height: targetHeight,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    // Set to auto after opening so content can grow if needed
                    if (showTableOfContents) {
                        element.style.height = "auto";
                    }
                }
            });
        }, tableOfContentsRef);

        return () => ctx.revert();
    }, { dependencies: [showTableOfContents]});


    return (
        <section ref={blogRef} className='max-w-[1920px] mx-auto global-margin'>
            {/* Navigation */}
            <div className='relative flex lg:flex-row flex-col gap-10'>
                <div className='lg:w-72 w-full lg:block hidden h-fit lg:sticky lg:top-[170px]'>
                    <ul className="space-y-6">
                        {
                            heading.map((h, i) => {
                                // If something is clicked, show only clicked item as active
                                // Otherwise show scroll-based activeId
                                const isActive = clickedId ? h.id === clickedId : h.id === activeId;
                                return (
                                    <li key={h.id} className={`${isActive ? 'text-black' : 'text-black/40'} menu-items transition-colors`}>
                                        <a
                                            href={`#${encodeURIComponent(h.id)}`}
                                            onClick={() => handleNavClick(h.id)}
                                            className={`uppercase  hover:text-black leading-[100%] text-base font-bold`}
                                        >
                                            {isActive ? <ArrowRight className='inline mb-1 mr-2' size={'1.2rem'} /> : <></>}
                                            {h.text}
                                        </a>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                <div className='block lg:hidden'>
                    <div className='flex items-center justify-between cursor-pointer border-b border-b-silver pb-4' onClick={() => setShowTableOfContents(!showTableOfContents)}>
                        <p className='font-semibold text-black text-lg leading-[100%]'>Table of contents</p>
                        <ChevronDown className={`${showTableOfContents ? 'rotate-180' : ''} transition-transform duration-300 text-black`} />
                    </div>
                    <div ref={tableOfContentsRef} className='h-0 overflow-hidden'>
                        <div className='pt-4'>
                            <ul className="space-y-6">
                                {
                                    heading.map((h, i) => {
                                        // If something is clicked, show only clicked item as active
                                        // Otherwise show scroll-based activeId
                                        const isActive = clickedId ? h.id === clickedId : h.id === activeId;
                                        return (
                                            <li key={h.id} className={`${isActive ? 'text-black' : 'text-black/40'} menu-items transition-colors`}>
                                                <a
                                                    href={`#${encodeURIComponent(h.id)}`}
                                                    onClick={() => handleNavClick(h.id)}
                                                    className={`uppercase  hover:text-black leading-[100%] text-base font-bold`}
                                                >
                                                    {isActive ? <ArrowRight className='inline mb-1 mr-2' size={'1.2rem'} /> : <></>}
                                                    {h.text}
                                                </a>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Blog */}
                <div className='flex-1'>
                    <article ref={contentRef}>
                        <div
                            className='prose lg:text-[22px] text-[19px] font-semibold leading-[120%] prose-h1:text-4xl prose-headings:scroll-mt-2 prose-img:my-8 
                prose-table:border prose-table:rounded-lg prose-table:shadow-lg prose-th:font-extrabold prose-th:bg-blue-50 prose-td:p-3 [&_h2]:mt-10  prose-table:w-full 
                prose-a:font-bold
                prose-a:text-blue-600 hover:prose-a:text-blue-800
                prose-headings:text-gray-900 [&_img]:my-8 [&_iframe]:my-8 [&_iframe]:w-full'
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </article>
                </div>
            </div>
        </section>
    );
};

export default BlogContent;