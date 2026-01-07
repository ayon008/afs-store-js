"use client"
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useRef } from 'react'

const SingleNavBar = ({ setIsLanding, data }) => {
    const title = data?.name;
    const acf = data?.acf;
    const caracteristiques = acf?.caracteristiques;
    const compatibilite = acf?.compatibilite;
    const programme = acf?.programme;
    const thumbnail_one = acf?.thumbnail_one;

    return (
        <div className='bg-black sticky top-0 z-[1000]'>
            <div className='max-w-[1920px] mx-auto global-padding flex items-center justify-between py-[10px]'>
                <h2 className='lg:text-[28px] text-lg leading-[100%] font-bold text-white '>{title}</h2>
                <div className='flex items-center gap-4'>
                    {
                        !!acf && !!thumbnail_one && <Link onClick={() => setIsLanding(false)} href={'#reviews'} className='text-white md:block hidden'>Reviews</Link>
                    }
                    {
                        !!acf && !!caracteristiques || !!compatibilite || !!programme && <Link onClick={() => setIsLanding(false)} href={'#characteristics'} className='text-white md:block hidden'>Characteristics</Link>
                    }
                    <button onClick={() => setIsLanding(false)} className='text-white bg-[#1D98FF] uppercase p-3 text-sm flex items-center gap-1 font-bold rounded-sm cursor-pointer'>
                        Buy Now <ArrowUpRight strokeWidth={3} className='w-4 h-4' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SingleNavBar;