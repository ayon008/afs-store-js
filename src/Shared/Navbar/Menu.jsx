"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function Menu({ isOpen, setIsOpen }) {
    const top = useRef(null);
    const middle = useRef(null);
    const bottom = useRef(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useGSAP(() => {
        gsap.to(top.current, {
            rotate: isOpen ? 45 : 0,
            duration: 0.5,
            transformOrigin: "left center",
        });
        gsap.to(middle.current, {
            opacity: isOpen ? 0 : 1,
            duration: 0.5,
        });
        gsap.to(bottom.current, {
            rotate: isOpen ? -45 : 0,
            duration: 0.5,
            transformOrigin: "left center",
        });
    }, [isOpen]);

    return (
        <div className="max-[1280px]:block hidden cursor-pointer">
            <button
                className="w-8 flex flex-col justify-between h-5 cursor-pointer"
                type="button"
                aria-label="Toggle navigation menu"
                aria-controls="mobile-navigation"
                aria-expanded={isOpen}
                onClick={toggleMenu}
            >
                <div ref={top} className="h-[2px] w-6 bg-white"></div>
                <div ref={middle} className="h-[2px] w-6 bg-white"></div>
                <div ref={bottom} className="h-[2px] w-6 bg-white"></div>
            </button>
        </div>
    );
}
