'use client';

import { ArrowDown } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Hero() {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;

        const playVideo = async () => {
            if (video) {
                try {
                    await video.play();
                } catch (err) {
                    console.log(err);

                }
            }
        };

        playVideo();
    }, []);

    return (
        <div className="relative w-full h-[calc(100vh-139px)] min-h-[calc(100vh-139px)] max-h-[calc(100vh-139px)] overflow-hidden">
            <video
                ref={videoRef}
                loop
                muted
                playsInline
                preload="auto"
                poster="https://afs-foiling.com/fr/wp-content/uploads/2025/08/Rectangle-1-2.png"
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source
                    src="https://afs-foiling.com/fr/wp-content/uploads/2025/08/ADS_USINE_V2.mp4"
                    type="video/mp4"
                />
            </video>
            <div className='flex items-center gap-2 global-padding left-0 bottom-10 absolute'>
                <ArrowDown className='w-4 h-4 text-white mix-blend-difference' strokeWidth={2} /> <span className='mix-blend-difference text-white text-base leading-[100%] font-semibold uppercase'>
                    Scroll for the full visit
                </span>
            </div>
        </div>
    );
}