"use client";

import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-black">Gliss Up</span>
      </div>
    </div>
  );
};

export default function wing() {
  return (
    <>
      {/* HERO */}
      <div className="global-margin flex min-h-[calc(100vh-120px)] flex-col gap-[20px] lg:flex-row max-w-[1920px] mx-auto">
        {/* LEFT */}
        <div className="global-padding flex flex-1 flex-col justify-between gap-[40px] pt-[20px]">
          <div className="flex flex-col gap-[20px]">
            <BreadCums />

            <div className="flex flex-col gap-[20px]">
              <h1 className="global-h1">
                AFS products are available at the{" "}
                <span className="text-[#1e98ff]">Gliss Up</span> store
              </h1>

              <p className="max-w-[360px] text-[18px] font-semibold text-[#111111B2] max-[1024px]:text-[16px]">
                Gliss Up offers a wide choice of technical equipment from all
                brands, including AFS since 2016.
              </p>
            </div>
          </div>

          {/* HERO FOOTER */}
          <div className="flex flex-col gap-[20px] border-b border-black/40 pb-[20px] leading-[1.2] md:flex-row md:flex-wrap md:justify-between">
            <div className="flex flex-col gap-[4px]">
              <h4 className="font-bold text-[#111111]">Store</h4>
              <a
                href="https://www.glissup.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[4px] font-semibold text-[#111111B2]"
              >
                glissup.fr
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M11 1L1 11M11 1H2M11 1V10"
                    stroke="#111111B2"
                    strokeWidth="2"
                  />
                </svg>
              </a>
            </div>

            <div className="flex flex-col gap-[4px]">
              <h4 className="font-bold text-[#111111]">AFS Expert</h4>
              <p className="font-semibold text-[#111111B2]">Jean-Louis</p>
            </div>

            <div className="flex flex-col gap-[4px] md:basis-[210px] md:shrink-0">
              <h4 className="font-bold text-[#111111]">Address</h4>
              <p className="font-semibold text-[#111111B2]">
                101 Rue François de Sourdis, 33000 Bordeaux, France
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT MAP */}
        <div className="relative min-h-[400px] w-full flex-1 overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1497546.1944009948!2d0.5966271!3d42.8539521!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b05e67bf958611%3A0x662967bf94a72e09!2sSurfone%20Shop%20Port%20Leucate!5e0!3m2!1sen!2sbd!4v1766126563869!5m2!1sen!2sbd"
            className="h-full min-h-[400px] w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <a
            href="https://maps.app.goo.gl/b1eB4P5n7rKjZgFQ8"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-[20px] left-[20px] z-[2] flex items-center justify-center gap-[4px] rounded-[4px] bg-[#1f1f1f] p-[12px] text-[14px] font-bold uppercase text-white"
          >
            Store access map
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M11 1L1 11M11 1H2M11 1V10"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* HISTOIRE */}
      <div className="global-margin global-padding flex flex-col gap-[40px] max-w-[1920px] mx-auto">
        <h2 className="global-h2">History</h2>

        <div className="flex flex-col gap-[40px] md:flex-row">
          <div className="flex basis-[25%] flex-col space-y-[12px] pt-[120px] max-[1024px]:pt-0">
            <img
              loading="lazy"
              decoding="async"
              src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-4-1.png"
              className="w-full"
            />
            <span>Store in Bordeaux</span>
          </div>

          <div className="flex-1">
            <p className="max-w-[1024px] pb-[40px] text-[18px] font-semibold leading-[130%] text-[#111]/75">
              Originally, this store specialized in windsurfing, but the team
              has managed to follow trends to diversify and offer products that
              meet everyone's practices. From surfing to foiling, including
              electric mountain biking, there's something for everyone!
            </p>

            <h2 className="mb-[40px] text-[32px] font-semibold uppercase leading-[105%] text-[#111]/70">
              <span className="text-[#1D98FF]">"</span>Everyone has their own
              discipline, but we try to practice as many sports as possible to
              best advise customers, practicing this or that sport each weekend
              depending on conditions.
              <span className="text-[#1D98FF]">"</span>
            </h2>

            <div className="flex flex-col gap-[20px] max-[1024px]:flex-col lg:flex-row lg:justify-between">
              <div className="max-w-[385px] space-y-[40px] pb-[20px] text-[18px] font-medium leading-[130%] text-[#111]/75">
                <p className="text-[#111111B2] text-4 leading-[1.3] font-semibold">
                  A young and dynamic team of multi-sport practitioners. Two
                  managers and their collaborators, all athletes to best advise
                  you in your equipment choices in the store.
                </p>
              </div>

              <div className="flex basis-[50%] flex-col space-y-[12px]">
                <img
                  loading="lazy"
                  decoding="async"
                  src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-1-5.png"
                  className="w-full"
                />
                <span>Gliss Up Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
