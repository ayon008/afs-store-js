import Image from 'next/image';
import React from 'react';

const TeamImage = ({ src, text, hoverSrc }) => {
    return (
        <div className="relative w-full h-full group">

            {/* Base Image */}
            <Image
                src={src}
                alt={text}
                placeholder='blur'
                loading="lazy"
                className="
                    rounded-md 
                    transition-opacity duration-500
                    [transition-timing-function:cubic-bezier(.23,1,.32,1)]
                    opacity-100 w-full group-hover:opacity-0
                "
            />

            {/* Hover Image */}
            <Image
                src={hoverSrc}
                alt={text}
                placeholder='blur'
                loading="lazy"
                className="
                    rounded-md absolute inset-0 
                    transition-opacity duration-500
                    [transition-timing-function:cubic-bezier(.23,1,.32,1)]
                    opacity-0 w-full group-hover:opacity-100
                "
            />

            {/* Text */}
            <p className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 lg:top-[40%] lg:-translate-y-[40%]
                group-hover:top-[70%] group-hover:-translate-y-[70%]
                group-hover:mix-blend-difference
                transition-all duration-500
                [transition-timing-function:cubic-bezier(.23,1,.32,1)]
                text-center text-white lg:text-[50px] text-[28px] font-semibold lg:leading-[110%] leading-[100%] z-20 mix-blend-normal'>
                {text}
            </p>
        </div>
    );
};

export default TeamImage;
