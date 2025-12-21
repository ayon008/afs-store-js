"use client";

import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999]">
        <Link className="inline" href="/">
          Accueil
        </Link>
        / <span className="text-black">Direct Sailing</span>
      </div>
    </div>
  );
};

export default function Clinique() {
  return (
    <>
      {/* HERO */}
      <div
        className="global-margin flex min-h-[calc(100vh-120px)] flex-col gap-[20px] justify-between global-padding py-[40px] flex-col"
        style={{
          backgroundImage:
            "url('https://afs-foiling.com/fr/wp-content/uploads/2024/02/bg_image-4.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <BreadCums />
        <div className="flex gap-[20px] justify-between flex-wrap">
          <h1 className="global-h1 text-[#fff] max-w-[85%] items-center">
            Tout savoir sur le downwind : des moments de glide infinis
          </h1>
          <p className="text-[#fff]">#DOWNWIND</p>
        </div>
      </div>
    </>
  );
}
