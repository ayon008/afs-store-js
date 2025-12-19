import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function More() {
    return (
        <section className="global-padding global-margin">
            <h2 className="global-h2 mb-8">More about AFS</h2>
            <div
                className='flex md:flex-row flex-col gap-5 items-stretch justify-between max-w-[1920px] mx-auto h-[clamp(30rem,15.406rem+17.094vw,32.5rem)] w-full'>

                <div style={{ backgroundImage: `url(${`https://afs-foiling.com/fr/wp-content/uploads/2025/06/1A4A82C8-D73A-4826-B627-E39C082F1173.jpg`})` }} className='bg-cover bg-no-repeat bg-center w-full rounded-[4px] py-10 px-5 relative team-box group'>
                    <h3 className='text-white text-[36px] leading-[120%] font-bold relative team-text w-fit'>The team</h3>
                    <button className="left-1/2 absolute -translate-x-1/2 bottom-10 afs_anim_btn group-hover:bottom-20 bg-white uppercase flex items-center gap-1 px-4 py-3 rounded-sm text-sm font-semibold text-[#111] leading-[100%] cursor-pointer">
                        <span>See More</span>
                        <ArrowUpRight className='w-4 h-4' strokeWidth={2} />
                    </button>
                </div>
                <div style={{ backgroundImage: `url(${`https://afs-foiling.com/fr/wp-content/uploads/2025/06/MicrosoftTeams-.png`})` }} className='bg-cover bg-no-repeat bg-center w-full rounded-[4px]'>

                </div>
            </div>
        </section>
    )
}