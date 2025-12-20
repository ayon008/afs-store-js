<<<<<<< HEAD
"use client"

import { Play, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import PopUp from "../PopUp/PopUp";

export default function AboutVideoSection() {


    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="bg-black global-padding global-margin flex lg:flex-row flex-col justify-between gap-5">
            <div className="max-w-[1920px] mx-auto space-y-5 flex lg:gap-20 gap-10 lg:flex-row flex-col justify-between items-end py-10">
                <div className="lg:max-w-1/2 max-w-full w-full space-y-5">
                    <h2 className="global-h2 text-white">The foiling spirit since 2009</h2>
                    <p className="text-white/80 leading-[120%] text-[clamp(0.875rem,0.6448rem+0.4802vw,1.125rem)] font-semibold">
                        AFS’s mission is to offer the best-performing foils, boards and wings, while guaranteeing first-rate accessibility and stability. To ensure that all riders can practice their sport in complete safety, whatever the conditions and whatever their riding style (freeride, carving, downwind, surf foil, etc.). These products are designed and manufactured in Brittany, France, by Foil And Co. French manufacturing using the most advanced techniques to offer you the best quality!
                    </p>
                </div>
                <div className="relative overflow-hidden rounded-sm">
                    <Image src="https://afs-foiling.com/fr/wp-content/uploads/2025/12/image-3-2.png" className="rounded-sm bg-white" alt="Tour" width={1000} height={1000} />

                    <div className="absolute inset-0 justify-center items-center bg-black/20 hidden lg:flex">
                        <button onClick={() => setIsOpen(true)} className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-white rounded-full text-white cursor-pointer transition-all duration-200">
                            <Play className="h-5 w-5 text-white fill-white" />
                            <span className="text-white text-base font-semibold tracking-wider">
                                PLAY VIDEO
                            </span>
                        </button>
                    </div>

                    {/* Mobile Play Button */}
                    <div className="absolute inset-0 flex justify-center items-center bg-black/20 lg:hidden">
                        <button onClick={() => setIsOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white rounded-full text-white cursor-pointer transition-all duration-200">
                            <Play className="h-4 w-4 text-white fill-white" />
                            <span className="text-white text-sm font-semibold tracking-wider">
                                PLAY VIDEO
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            <PopUp isOpen={isOpen}>
                <div className="w-full h-full bg-black/50 flex items-center justify-center relative">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-white rounded-full p-2 cursor-pointer">
                        <X className="w-4 h-4 text-black" />
                    </button>
                    <div
                        className="mx-auto flex items-center justify-center max-w-[800px]"
                        style={{
                            width: "80%",
                            aspectRatio: "16 / 9",
                        }}
                    >
                        <iframe
                            src="https://www.youtube.com/embed/Du02h7xfe8s?si=QxG1YTe8dBxcvrgN"
                            title="YouTube video player"
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "0",
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>
            </PopUp>

        </section>
    );
}
=======
"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import PopUp from "../PopUp/PopUp";

export default function AboutVideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  // Disable body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  return (
    <section className="bg-black global-padding global-margin flex lg:flex-row flex-col justify-between gap-5">
      <div className="max-w-[1920px] mx-auto space-y-5 flex lg:gap-20 gap-10 lg:flex-row flex-col justify-between items-end py-10">
        <div className="lg:max-w-1/2 max-w-full w-full space-y-5">
          <h2 className="global-h2 text-white">
            The foiling spirit since 2009
          </h2>
          <p className="text-white/80 leading-[120%] text-[clamp(0.875rem,0.6448rem+0.4802vw,1.125rem)] font-semibold max-w-[520px]">
            AFS’s mission is to offer the best-performing foils, boards and
            wings, while guaranteeing first-rate accessibility and stability. To
            ensure that all riders can practice their sport in complete safety,
            whatever the conditions and whatever their riding style (freeride,
            carving, downwind, surf foil, etc.). These products are designed and
            manufactured in Brittany, France, by Foil And Co. French
            manufacturing using the most advanced techniques to offer you the
            best quality!
          </p>
        </div>

        <div className="relative overflow-hidden rounded-sm">
          <Image
            src="https://afs-foiling.com/fr/wp-content/uploads/2025/12/image-3-2.png"
            className="rounded-sm bg-white"
            alt="Tour"
            width={1000}
            height={1000}
          />

          {/* Desktop Play Button */}
          <div className="absolute inset-0 justify-center items-center bg-black/20 hidden lg:flex">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-white rounded-full text-white cursor-pointer transition-all duration-200"
            >
              <Play className="h-5 w-5 text-white fill-white" />
              <span className="text-white text-base font-semibold tracking-wider">
                PLAY VIDEO
              </span>
            </button>
          </div>

          {/* Mobile Play Button */}
          <div className="absolute inset-0 flex justify-center items-center bg-black/20 lg:hidden">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white rounded-full text-white cursor-pointer transition-all duration-200"
            >
              <Play className="h-4 w-4 text-white fill-white" />
              <span className="text-white text-sm font-semibold tracking-wider">
                PLAY VIDEO
              </span>
            </button>
          </div>
        </div>
      </div>

      <PopUp isOpen={isOpen}>
        <div className="w-full h-full bg-black/50 flex items-center justify-center relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 cursor-pointer"
          >
            <X className="w-4 h-4 text-black" />
          </button>
          <div className="mx-auto flex items-center justify-center max-w-[90vw] w-[90%] sm:w-[80%] aspect-video">
            <iframe
              src="https://www.youtube.com/embed/Du02h7xfe8s?si=QxG1YTe8dBxcvrgN"
              title="YouTube video player"
              style={{
                width: "100%",
                height: "100%",
                border: "0",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </PopUp>
    </section>
  );
}
>>>>>>> origin/main
