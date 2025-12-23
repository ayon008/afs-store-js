"use client";
import Head from "next/head";
import Link from "next/link";

export default function TicketsPage() {
  return (
    <>
      <div className="bg-black">
        <Head>
          <title>Need advice</title>
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
              You want to contact us — write to us, we will help you.
            </h1>

            <p className="text-[#BFBFBF] max-w-[520px] global-p font-bold">
              For this, we have several ways to talk to each other, choose the
              one that suits you.
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
            Contact form
          </Link>

          <Link
            href="/demande-sav/"
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            After-sales service request
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
              Book a call with an advisor
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
              Book a time slot to pick up your e-commerce order
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
              Chat online with an advisor
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
            <span className="block max-w-[1440px]">Meet us at an event</span>
          </Link>
        </div>
        <div className=" global-padding flex flex-col items-center justify-center gap-[20px] text-[clamp(1rem,_0.8548rem_+_0.6452vw,_1.5rem)]">
          <p className="font-semibold text-[#BFBFBF] text-center">
            While you wait for our reply, feel free to read our various guides:
          </p>
          <ul className="text-white flex gap-[20px] flex-wrap justify-center global-margin">
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
