"use client";

import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Accueil
        </Link>
        / <span className="text-black">formulaire</span>
      </div>
    </div>
  );
};

export default function Clinique() {
  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />
          <h1 className="global-h2 text-center py-[80px]">Formulaire</h1>
        </div>
        <div>
          {" "}
          <iframe
            title="Contact Form"
            src="https://plugins.crisp.chat/urn:crisp.im:contact-form:0/contact/96a25c9a-f728-482b-a5b7-058bee01cb67"
            referrerpolicy="origin"
            sandbox="allow-forms allow-popups allow-scripts allow-same-origin"
            width="100%"
            height="600px"
            frameborder="0"
          ></iframe>
        </div>
      </div>
    </>
  );
}
