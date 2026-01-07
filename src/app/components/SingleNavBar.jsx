"use client"
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const SingleNavBar = ({ setIsLanding, data, isLanding }) => {
    const title = data?.name;
    const acf = data?.acf;
    const caracteristiques = acf?.caracteristiques;
    const compatibilite = acf?.compatibilite;
    const programme = acf?.programme;
    const thumbnail_one = acf?.thumbnail_one;
    const [visible, setVisible] = useState(false);

    console.log(visible, 'visible');



    useGSAP(() => {
        const ctx = gsap.context(() => {
            gsap.to('.navbar', {
                position: 'relative',
                duration: 0.5,
                ease: 'power2.inOut',
            })
        })
        return () => ctx.revert();
    }, [])

    useGSAP(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: '#stream-landing',
                start: 'top top',
                end: 'bottom top',
                onEnter: () => setVisible(true),
                onLeave: () => setVisible(false),
            })
        })
        return () => ctx.revert();
    }, []);


    return (
        <div className='bg-black sticky top-0 z-30'>
            <div className='max-w-[1920px] mx-auto global-padding flex items-center justify-between py-[10px]'>
                <h2 className='lg:text-[28px] text-lg leading-[100%] font-bold text-white '>{title}</h2>
                <div className='flex items-center gap-4'>
                    {
                        !!acf && !!thumbnail_one && <Link onClick={() => setIsLanding(false)} href={'#reviews'} className='text-white md:block hidden'>Reviews</Link>
                    }
                    {
                        !!caracteristiques && <Link onClick={() => setIsLanding(false)} href={'#characteristics'} className='text-white md:block hidden'>Characteristics</Link>
                    }
                    <button onClick={() => {
                        setIsLanding(!isLanding)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }} className='text-white bg-[#1D98FF] uppercase p-3 text-sm flex items-center gap-1 font-bold rounded-sm cursor-pointer'>
                        {visible ? 'Learn More' : 'Buy Now'} <ArrowUpRight strokeWidth={3} className='w-4 h-4' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SingleNavBar;