"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const BreadCums = () => {
  const b = useTranslations("breadcum");
  const t = useTranslations("madeInFrance");

  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          {b("home")}
        </Link>
        / <span className="text-black">Made in france</span>
      </div>
    </div>
  );
};

export default function madeFr() {
  const t = useTranslations("madeInFrance");
  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />

          <h1 className="global-h1 text-center py-[80px]">{t("title")}</h1>
          <div className="flex flex-col gap-[20] md:gap-[28px] global-margin">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/DSC07778.png"
              alt="AFS Foiling visual"
              width={1200}
              height={800}
              className="max-w-[960px] mx-auto h-auto mb-5 w-[100%]"
            />
            <p className="text-[20px] font-bold text-center max-w-[780px] mx-auto leading-[1.3]">
              {t("Foil and Co")}
            </p>

            <p className="text-[20px] font-bold text-center max-w-[780px] mx-auto leading-[1.3]">
              {t("It is through")}
            </p>
            <p className="text-[20px] font-bold text-center max-w-[780px] mx-auto leading-[1.3]">
              {t("Sustainable")}
            </p>
          </div>
        </div>
        {/*content */}
        <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 gap-4 global-margin max-w-[1080px] mx-auto">
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/carbon-nanotube.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              {t("Choice of carbon")}
            </h3>
            <p className="text-white text-[16px]">{t("We have")}</p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/circuit.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              {t("Short circuit")}
            </h3>
            <p className="text-white text-[16px]">{t("We have established")}</p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/factory.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              {t("Responsible production")}
            </h3>
            <p className="text-white text-[16px]">{t("At Foil & Co there")}</p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/Trace-1946.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">{t("Low")}</h3>
            <p className="text-white text-[16px]">{t("We manufacture")}</p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/money-structure.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              {t("Circular economy")}
            </h3>
            <p className="text-white text-[16px]">{t("Since this year")}</p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/path7.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              {t("The human")}
            </h3>
            <p className="text-white text-[16px]">{t("The well-being")}</p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/Trace-1947.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">{t("Living")}</h3>
            <p className="text-white text-[16px]">{t("Our activity")}</p>
          </span>
        </div>
        {/*content */}
        <div className="global-margin flex flex-col gap-10 max-w-[1080px] mx-auto">
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              {t("The choice")}
            </p>
            <div className="flex flex-col gap-5">
              <p>{t("From the start")}</p>
              <p>
                <p>{t("In addition")}</p>
              </p>
              <p>{t("This material")}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">{t("Working")}</p>
            <div className="flex flex-col gap-5">
              <p>{t("choice made France")}</p>
              <p>{t("But we decided to")}</p>
              <p>{t("Indeed")}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              {t("Implement")}
            </p>
            <div className="flex flex-col gap-5">
              <p>{t("Designing")}</p>
              <p>{t("At foil and Co")}</p>
              <p>{t("Indeed our product")}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">{t("Low tech")}</p>
            <div className="flex flex-col gap-5">
              <p>{t("In our approach")}</p>
              <p>{t("We also promote")}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              {t("Putting people")}
            </p>
            <div className="flex flex-col gap-5">
              <p>{t("The well-being")}</p>
              <p>{t("We make the")}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              {t("Living in")}
            </p>
            <div className="flex flex-col gap-5">
              <p>{t("We settled in")}</p>
              <p>{t("For us")}</p>
            </div>
          </div>
          <div>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/C0073.MP4.02_16-1.png"
              alt="AFS Foiling visual"
              width={1200}
              height={800}
              className="max-w-[960px] mx-auto h-auto w-[100%]"
            />
            <h2 className="global-h2 text-center pt-[80px]">
              {t("Foil & Co")}
            </h2>
          </div>
        </div>
      </div>
    </>
  );
}