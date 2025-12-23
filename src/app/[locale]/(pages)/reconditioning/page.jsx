"use client";
import { ArrowUpRight } from "lucide-react";

import { useState, useRef } from "react";
import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#ccc]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-white"> reconditioning</span>
      </div>
    </div>
  );
};

export default function Reconditioning() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <div className="pt-[20px] bg-black">
        <div className="mb-20 max-w-[1920px] mx-auto global-padding">
          <BreadCums />

          <div className="mt-10 flex gap-10 justify-between flex-col md:flex-row">
            <h1 className="text-white global-h1 flex-[0] md:flex-[55%_0_0]">
              Our range of reconditioned foils
            </h1>

            <p className="flex-[0] text-white font-semibold md:flex-[30%_0_0]">
              We are proud to present our refurbished products, an initiative
              that reflects our commitment to the environment and our desire to
              provide you with products that are close to new condition, at a
              more affordable price and with the same high level of service.
            </p>
          </div>
        </div>

        <div className="block relative flex flex-col gap-10">
          {/* VIDEO */}
          <div className="w-full mx-auto mt-10 sticky top-20">
            <video
              ref={videoRef}
              className="w-full h-auto cursor-pointer"
              preload="metadata"
              playsInline
              poster="https://afs-foiling.com/wp-content/uploads/2023/08/image-7243-4.png"
              onClick={toggleVideo}
            >
              <source
                src="https://afs-foiling.com/wp-content/uploads/2023/08/AFS_lance_son_offre_de_materiel_reconditionne___1080_X_1920_1.mp4"
                type="video/mp4"
              />
            </video>

            {/* Play/Pause Icon */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={toggleVideo}
            >
              {!isPlaying ? (
                <div className="w-0 h-0 border-l-[40px] border-l-white border-t-[25px] border-t-transparent border-b-[25px] border-b-transparent" />
              ) : (
                <div></div>
              )}
            </div>
          </div>

          <div className="z-[1] mb-5 global-padding flex flex-col gap-5">
            <h2 className="text-white global-h2">
              With this conviction in mind, we have set up a reconditioning line
              in our Brittany factory to repair and refurbish all our products
              that can be reconditioned by our experts, whether it's a returned
              product, damaged packaging or purchased equipment.
            </h2>
            <Link
              href="/product-category/reconditioned-used/"
              className="text-[#1d98ff] font-bold text-[18px]"
            >
              Discover refurbished products
              <arrow-up-right className="w-4 h-4 text-[#1d98ff]" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
