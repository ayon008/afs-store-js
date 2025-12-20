"use client";
import Head from "next/head";
import Link from "next/link";

export default function TicketsPage() {
  return (
    <>
      <div className="bg-black">
        <Head>
          <title>Besoin de conseils</title>
        </Head>

        <div
          className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-[20px] global-padding global-margin bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://afs-foiling.com/fr/wp-content/uploads/2025/07/image-7244.png')",
          }}
        >
          <div className="flex flex-col items-end justify-center min-h-[calc(100vh-150px)] gap-[20px] max-w-[1440px]">
            <h1 className="global-h1 text-white">
              <span className="text-[#bfbfbf]">AFS Support. </span>
              Vous souhaitez nous contacter — écrivez-nous, nous vous aiderons.
            </h1>

            <p className="text-[#BFBFBF] max-w-[520px] global-p font-bold">
              Pour cela, nous avons plusieurs moyens pour nous parler,
              choisissez celui qui vous convient.
            </p>
          </div>
        </div>

        <div className="mb-[80px]">
          <Link
            href="/formulaire"
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            Formulaire de contact
          </Link>

          <Link
            href="/demande-sav/"
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            Demande SAV
          </Link>

          <Link
            href=""
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">
              Réserver un appel avec un conseiller
            </span>
          </Link>

          <Link
            href=""
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">
              Réserver un créneau pour récupérer votre commande ecommerce
            </span>
          </Link>

          <Link
            href=""
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">
              Chatter en ligne avec un conseiller
            </span>
          </Link>

          <Link
            href="/afs-events"
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">
              Retrouver nous sur un événement
            </span>
          </Link>
        </div>
        <div className=" global-padding flex flex-col items-center justify-center gap-[20px] text-[clamp(1rem,_0.8548rem_+_0.6452vw,_1.5rem)]">
          <p className="font-semibold text-[#BFBFBF] text-center">
            While you wait for our reply, feel free to read our various guides:
          </p>
          <ul className="text-white flex gap-[20px] flex-wrap justify-center">
            <li>
              <a
                className="hover:underline"
                href="https://afs-foiling.com/fr/categorie-produit/foiling/wing-foil/#guide"
              >
                WING FOIL
              </a>
            </li>

            <li>
              <a
                className="hover:underline"
                href="https://afs-foiling.com/fr/les-etapes-cles-pour-se-lancer-en-dockstart/"
              >
                DOCKSTART
              </a>
            </li>

            <li>
              <a
                className="hover:underline"
                href="https://afs-foiling.com/fr/guide-downwind/"
              >
                DOWNWIND
              </a>
            </li>

            <li>
              <a
                className="hover:underline"
                href="https://afs-foiling.com/fr/categorie-produit/foiling/surf-foil/"
              >
                SURF FOIL
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
