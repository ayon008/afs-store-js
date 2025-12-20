"use client";

import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Accueil
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
                Les produits AFS sont disponibles dans le magasin
                <span className="text-[#1e98ff]"> Gliss Attitude</span>
              </h1>

              <p className="max-w-[360px] text-[18px] font-semibold text-[#111111B2] max-[1024px]:text-[16px]">
                L’un des plus anciens magasins français d’équipements marins
                avec du matériel AFS
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
              GlissAttitude possède deux magasins remplis d’histoire. L’un à
              Marseille intramuros et l’autre à La Fos-Sur-Mer, en bord de
              plage. Gérée par des passionnés, l’entreprise est une référence en
              termes de conseils et d’équipements nautiques.
            </p>

            <h2 className="mb-[40px] text-[32px] font-semibold uppercase leading-[105%] text-[#111]/70">
              <span className="text-[#1D98FF]">"</span>Toujours à la recherche
              du meilleur pour nos clients, nous n'hésitons pas à tester nos
              équipements dans l'eau et sur des bancs d'essai. Nous consignons
              nos commentaires sur le matériel dans notre blog.
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
                <span>Equipe Gliss Attitude</span>
              </div>
            </div>
            <div className="mt-[40px] flex flex-col gap-[24px]">
              <p className="max-w-[520px] text-[18px] font-semibold leading-[130%] text-[#111]/75">
                Chez GlissAttitude, les collaborateurs passionnés et pratiquants
                seront ravis de vous accueillir et de vous conseiller.
              </p>
              <div className="text-[18px] font-semibold leading-[130%] text-[#111]/75 flex flex-wrap gap-[30px]">
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Eric</h3>
                  <p>gérant, windfoiler et ingénieur de formation</p>
                </span>
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Bastien</h3>
                  <p>
                    responsable à Marseille - surfeur originaire de l'Ile de Ré.
                  </p>
                </span>
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Paul</h3>
                  <p>conseiller - planchiste</p>
                </span>
                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Christopher</h3>
                  <p>responsable à La Fos-Sur-Mer</p>
                </span>

                <span className="space-y-[12px] flex-[250px_0_0]">
                  <h3 className="font-bold">Baptiste</h3>
                  <p>conseiller - planchiste aguerri et très bon slalomer</p>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
