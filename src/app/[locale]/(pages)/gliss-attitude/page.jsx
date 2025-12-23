"use client";

import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-black">Gliss Attitude</span>
      </div>
    </div>
  );
};

export default function Gliss() {
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
                AFS products are available at the
                <span className="text-[#1e98ff]"> Gliss Attitude</span>
                store
              </h1>

              <p className="max-w-[360px] text-[18px] font-semibold text-[#111111B2] max-[1024px]:text-[16px]">
                One of France's oldest marine equipment stores with AFS
                equipment
              </p>
            </div>
          </div>

          {/* HERO FOOTER */}
          <div className="flex flex-col gap-[20px] border-b border-black/40 pb-[20px] leading-[1.2] md:flex-row md:flex-wrap md:justify-between">
            <div className="flex flex-col gap-[4px]">
              <h4 className="font-bold text-[#111111]">Magasin</h4>
              <a
                href="https://www.glissattitude.com/en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[4px] font-semibold text-[#111111B2]"
              >
                glissattitude.com
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
              <h4 className="font-bold text-[#111111]">Expert AFS</h4>
              <p className="font-semibold text-[#111111B2]">Eric</p>
            </div>

            <div className="flex flex-col gap-[4px] md:basis-[210px] md:shrink-0">
              <h4 className="font-bold text-[#111111]">Adresse</h4>
              <p className="font-semibold text-[#111111B2]">
                17 Mnt Commandant de Robien, 13011 Marseille, France
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT MAP */}
        <div className="relative min-h-[400px] w-full flex-1 overflow-hidden">
          <iframe
            src="https://www.google.com/maps?q=Gliss%20Attitude%20Marseille&output=embed"
            className="h-full min-h-[400px] w-full border-0"
            allowFullScreen
            loading="lazy"
          />

          <a
            href="https://maps.app.goo.gl/qu6SbUChxxkQ6Kem6"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-[20px] left-[20px] z-[2] flex items-center justify-center gap-[4px] rounded-[4px] bg-[#1f1f1f] p-[12px] text-[14px] font-bold uppercase text-white"
          >
            Plan d’accès à la boutique
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
        <h2 className="global-h2">Histoire</h2>

        <div className="flex flex-col gap-[40px] md:flex-row">
          <div className="flex basis-[25%] flex-col space-y-[12px] pt-[120px] max-[1024px]:pt-0">
            <img
              loading="lazy"
              decoding="async"
              src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-4-5.png"
              className="w-full"
            />
            <span>Boutique à Marseille</span>
          </div>

          <div className="flex-1">
            <p className="pb-[20px] text-[18px] font-semibold leading-[130%] text-[#111]/75 max-w-[720px]">
              GlissAttitude has two stores steeped in history. One is located in
              Marseille city center and the other is in La Fos-Sur-Mer, on the
              beachfront. Run by enthusiasts, the company is a benchmark in
              terms of advice and water sports equipment.
            </p>

            <h2 className="mb-[40px] text-[32px] font-semibold uppercase leading-[105%] text-[#111]/70">
              <span className="text-[#1D98FF]">"</span>Always searching To
              guarantee the best for our customers, we do not hesitate to test
              our equipment in the water and on test benches. We record our
              comments on the equipment in our blog.
              <span className="text-[#1D98FF]">"</span>
            </h2>

            <div className="flex flex-col gap-[20px] max-[1024px]:flex-col lg:flex-row lg:justify-end items-start">
              <img
                loading="lazy"
                decoding="async"
                src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-2-10.png"
                className="w-[220px]"
              />
              <div className="flex basis-[50%] flex-col space-y-[12px]">
                <img
                  loading="lazy"
                  decoding="async"
                  src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-1-9.png"
                  className="w-full"
                />
                <span>Gliss Attitude Team</span>
              </div>
            </div>
            <div className="mt-[40px] flex flex-col gap-[24px]">
              <p className="max-w-[520px] text-[18px] font-semibold leading-[130%] text-[#111]/75">
                At GlissAttitude, our passionate and experienced staff will be
                delighted to welcome you and offer advice.
              </p>
              <div className="text-[18px] font-semibold leading-[130%] text-[#111]/75 flex flex-wrap gap-[30px]">
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Eric</h3>
                  <p>manager, windfoiler, and engineer by training</p>
                </span>
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Bastien</h3>
                  <p>
                    manager in Marseille - surfer originally from the Île de Ré.
                  </p>
                </span>
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Paul</h3>
                  <p>advisor - snowboarder</p>
                </span>
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Christopher</h3>
                  <p>manager in La Fos-Sur-Mer</p>
                </span>

                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Baptist</h3>
                  <p>
                    advisor - experienced snowboarder and very good slalom skier
                  </p>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
