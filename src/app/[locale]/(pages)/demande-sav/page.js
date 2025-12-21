"use client";

import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Accueil
        </Link>
        / <span className="text-black">demande-sav</span>
      </div>
    </div>
  );
};

export default function Clinique() {
  return (
    <>
      {/* HERO */}
      <div className="global-margin flex min-h-[calc(100vh-120px)] flex-col gap-[20px] lg:flex-row max-w-[1920px] mx-auto">
        {/* LEFT */}
        <div className="global-padding flex flex-1 flex-col justify-between gap-[40px] pt-[20px]">
          <div className="flex flex-col gap-[20px]">
            <BreadCums />

            <iframe
              src="https://n8n.foilandco.com/form/e9b3a3d4-4b77-47af-b9cb-b7bfa436f8b8"
              className="w-[100%] h-[2420px]"
              allowFullScreen
              title="Formulaire de demande SAV"
            ></iframe>

            <style jsx global>{`
              body {
                background: #fbfcfe;
              }

              iframe .container {
                width: 100%;
                min-height: 100vh;
                padding: 24px;
                border: 0px solid var(--color-input-border);
                border-radius: 0px;
                box-shadow: 0px 0px 0px 0px #ffffff;
              }
            `}</style>
          </div>
        </div>
      </div>
    </>
  );
}
