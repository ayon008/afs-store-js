"use client"
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const PopUp = ({ isOpen, children }) => {
    useEffect(() => {
        if (typeof document === 'undefined') return;

        let prevOverflow = document.body.style.overflow;
        let prevPosition = document.body.style.position;
        let prevTop = document.body.style.top;
        let prevLeft = document.body.style.left;
        let prevWidth = document.body.style.width;
        const scrollY = typeof window !== 'undefined' ? window.scrollY || window.pageYOffset : 0;

        if (isOpen) {
            // Lock scroll on body by fixing it in place and hiding overflow
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.width = '100%';
        }

        return () => {
            // Restore previous values
            document.body.style.overflow = prevOverflow;
            document.body.style.position = prevPosition;
            document.body.style.top = prevTop;
            document.body.style.left = prevLeft;
            document.body.style.width = prevWidth;

            // Restore original scroll position
            if (typeof window !== 'undefined') window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    if (typeof document === 'undefined') return null;
    if (!isOpen) return null;


    // CreatePortal render the jsx outside the normal React Tree

    return createPortal(
        <div className='fixed z-[9999] inset-0 flex items-center justify-center backdrop-blur-[10px] pointer-events-auto bg-black/40'>
            <div className='z-[10000] relative w-full h-screen flex items-center justify-center overflow-hidden'>
                {children}
            </div>
        </div>,
        document.body
    )
};

export default PopUp;