"use client";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import Link from "next/link";

const BreadCums = () => {
  const b = useTranslations("breadcum");
  const c = useTranslations("reconditioning");
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#ccc]">
        <Link className="inline" href="/">
          {b("home")}
        </Link>
        / <span className="text-white"> {c("title")}</span>
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
  const t = useTranslations("reconditioning");

  return (
    <>
      {/* HERO */}
      <div className="pt-[20px] bg-black">
        <div className="mb-20 max-w-[1920px] mx-auto global-padding">
          <BreadCums />

          <div className="mt-10 flex gap-10 justify-between flex-col md:flex-row">
            <h1 className="text-white global-h1 flex-[0] md:flex-[55%_0_0]">
              {t("heading")}
            </h1>

            <p className="flex-[0] text-white font-semibold md:flex-[30%_0_0]">
              {t("heading_2")}
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
            <h2 className="text-white global-h2">{t("sub")}</h2>
            <Link
              href="/product-category/reconditioned-used/"
              className="text-[#1d98ff] font-bold text-[18px]"
            >
              {t("sub_sub")}
              <arrow-up-right className="w-4 h-4 text-[#1d98ff]" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}