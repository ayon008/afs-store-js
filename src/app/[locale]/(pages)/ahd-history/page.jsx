
import { getTranslations } from "next-intl/server";
import Link from "next/link";
const BreadCums = async ({ locale }) => {
  const b = await getTranslations("breadcum", locale);
  return (
    <div className="mb-5 uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          {b("home")}
        </Link>
        / <span className="text-white">AHD history</span>
      </div>
    </div>
  );
};

export default async function ahd({ locale }) {
  const t = await getTranslations("AHDhistory", locale);
  const e = await getTranslations("Board", locale);
  return (
    <>
      <div
        className="bg-fixed bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://afs-foiling.com/wp-content/uploads/2023/04/Group-23.png')",
          backgroundColor: "black",
        }}
      >
        {/* HERO */}
        <div className="mb-20 lg:mb-30">
          <div
            className="bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://afs-foiling.com/wp-content/uploads/2023/02/CleanShot-2023-.png')",
            }}
          >
            <div className="max-w-[1920px] mx-auto flex flex-col global-padding h-[calc(100vh-120px)] justify-end pb-10">
              <BreadCums />
              <h1 className="global-h1 text-left text-white">{t("title")}</h1>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding global-margin">
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("AHD was")}
          </p>
          <div className="relative block">
            <img
              src="https://afs-foiling.com/wp-content/uploads/2023/02/MicrosoftTeams-.png"
              alt="AHD visual"
              className="max-w-full h-auto"
              loading="lazy"
            />
            <h2 className="text-white text-[clamp(7.5rem,-1.7077rem+19.2077vw,17.5rem)] font-bold mt-[-40px] lg:mt-[-80px] leading-[1]">
              1990
            </h2>
          </div>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Christophe")}
          </p>
        </div>

        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding global-margin">
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("The Raceboard")}
          </p>
          <div className="relative block">
            <img
              src="https://afs-foiling.com/wp-content/uploads/2023/02/MicrosoftTeams-1.png"
              alt="AHD visual"
              className="max-w-full h-auto"
              loading="lazy"
            />
            <h2 className="text-white text-[clamp(7.5rem,-1.7077rem+19.2077vw,17.5rem)] font-bold mt-[-40px] lg:mt-[-80px] leading-[1]">
              1993
            </h2>
          </div>

          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("In 1993")}
          </p>
        </div>

        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding global-margin">
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("1996")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("It was")}
          </p>
          <div className="relative block">
            <img
              src="https://afs-foiling.com/wp-content/uploads/2023/02/CleanShot-2023-1.png"
              alt="AHD visual"
              className="max-w-full h-auto"
              loading="lazy"
            />
            <h2 className="text-white text-[clamp(7.5rem,-1.7077rem+19.2077vw,17.5rem)] font-bold mt-[-40px] lg:mt-[-80px] leading-[1]">
              1997
            </h2>
          </div>

          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("1997")}
          </p>
        </div>

        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding global-margin">
          <div className="relative block">
            <img
              src="https://afs-foiling.com/wp-content/uploads/2023/02/CleanShot-2023-2.png"
              alt="AHD visual"
              className="max-w-full h-auto"
              loading="lazy"
            />
            <h2 className="text-white text-[clamp(7.5rem,-1.7077rem+19.2077vw,17.5rem)] font-bold mt-[-40px] lg:mt-[-80px] leading-[1]">
              1998
            </h2>
          </div>

          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Bruno")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Swiss")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Maxxride")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("AHD")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("The best")}
          </p>
        </div>

        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding global-margin">
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("In")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Change")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Brazilian")}
          </p>
          <div className="relative block">
            <img
              src="https://afs-foiling.com/wp-content/uploads/2023/02/CleanShot-2023-3.png"
              alt="AHD visual"
              className="max-w-full h-auto"
              loading="lazy"
            />
            <h2 className="text-white text-[clamp(7.5rem,-1.7077rem+19.2077vw,17.5rem)] font-bold mt-[-40px] lg:mt-[-80px] leading-[1]">
              2006
            </h2>
          </div>

          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Waveboards")}
          </p>
        </div>

        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding global-margin">
          <div className="relative block">
            <img
              src="https://afs-foiling.com/wp-content/uploads/2023/02/CleanShot-2023-4.png"
              alt="AHD visual"
              className="max-w-full h-auto"
              loading="lazy"
            />
            <h2 className="text-white text-[clamp(7.5rem,-1.7077rem+19.2077vw,17.5rem)] font-bold mt-[-40px] lg:mt-[-80px] leading-[1]">
              2007
            </h2>
          </div>

          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("In 2007")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Development")}
          </p>
          <p className="text-[16px] md:text-[20px] text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("In this")}
          </p>
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("The first")}
          </p>
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Its shape")}
          </p>
        </div>

        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding global-margin">
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("In 2009")}
          </p>
          <div className="relative block">
            <img
              src="https://afs-foiling.com/wp-content/uploads/2023/02/CleanShot-2023-5.png"
              alt="AHD visual"
              className="max-w-full h-auto"
              loading="lazy"
            />
            <h2 className="text-white text-[clamp(7.5rem,-1.7077rem+19.2077vw,17.5rem)] font-bold mt-[-40px] lg:mt-[-80px] leading-[1]">
              2010
            </h2>
          </div>

          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("In 2010")}
          </p>
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("For the")}
          </p>
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-20 mx-auto">
            {t("The Venezuelan")}
          </p>
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Forever")}
          </p>
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Like")}
          </p>
          <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
            {t("Thank you")}
          </p>
        </div>
        {/* content */}
        <div className="max-w-[1370px] mx-auto global-padding ">
          <div className="mb-20 relative block">
            <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mb-10 mx-auto">
              {t("With Foil becoming")}
            </p>
            <p className="text-4 md:text-5 text-white font-semibold leading-[130%] max-w-[1220px] global-padding mx-auto">
              {t("Foil&co")}
            </p>
          </div>
          <div className="mb-10 relative block">
            <h2 className="global-h1 text-white text-center max-w-[900px] mx-auto">
              {t("AHD is")}
            </h2>
          </div>
          {/* board wrapper */}
          <div className="">
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">1993</span> - AHD 288
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      {t("RACING")}
                    </p>
                  </div>

                  <p className="text-4 md:text-5 text-white font-semibold leading-[130%]">
                    {t("Sébastien")}
                  </p>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/CleanShot-2023-6-e1681943534610-1024x946.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">1996</span> - AHD 267
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      {t("Wave/slalom")}
                    </p>
                  </div>

                  <p className="text-4 md:text-5 text-white font-semibold leading-[130%]">
                    {t("It’s the")}
                  </p>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/CleanShot-2023-7-e1681944467616-1024x955.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">1998</span> - AHD Diamond
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      Freerace
                    </p>
                  </div>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/59699574_IMG452-e1681944514324-1024x863.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">1993</span> - AHD 288
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      {t("RACING")}
                    </p>
                  </div>

                  <p className="text-4 md:text-5 text-white font-semibold leading-[130%]"></p>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/CleanShot-2023-6-e1681943534610-1024x946.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">1993</span> - AHD 288
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      RACING
                    </p>
                  </div>

                  <p className="text-4 md:text-5 text-white font-semibold leading-[130%]">
                    {t("Sébastien")}
                  </p>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/CleanShot-2023-6-e1681943534610-1024x946.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">1998</span> - AHD Diamond
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      Freerace
                    </p>
                  </div>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/59699574_IMG452-e1681944514324-1024x863.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">2001</span> - AHD (t
                      {"Maxxride2"})
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      {t("Allride")}
                    </p>
                  </div>
                  <p className="text-4 md:text-5 text-white font-semibold leading-[130%]">
                    {t("Maxxride dominates")}
                  </p>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/index-e1681944560221-1024x811.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">2006</span> - AHD Seal
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      {t("Wave riding lightwind")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/CleanShot-2023-8-e1681944633883-1024x901.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            {/* board */}
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">2008</span> - SEALION
                      {t("Concept")}
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      {t("Fish, Wind-Sup")}
                    </p>
                  </div>
                  <p className="text-4 md:text-5 text-white font-semibold leading-[130%]">
                    (t{"An all"})
                  </p>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/CleanShot-2023-10-e1681944687867-1024x873.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-5 mt-20">
              {/* Text block */}
              <div className="flex gap-5 w-full">
                <div className="flex-[0_0_3%]">
                  <img
                    src="https://afs-foiling.com/wp-content/uploads/2023/04/CompositeLayer.png"
                    alt="AHD visual"
                    className="shrink-0"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[clamp(1.625rem,0.2438rem+2.8812vw,3.125rem)] leading-[1]">
                      <span className="text-[#0389b6]">2009</span> - AFS ONE
                      {e("Board")} & foil
                    </h3>
                    <p className="text-[20px] text-white font-semibold leading-[130%]">
                      Windfoil, SUP foil
                    </p>
                  </div>
                </div>
              </div>

              {/* Image block */}
              <div className="md:flex-[0_0_40%] flex items-center">
                <img
                  src="https://afs-foiling.com/wp-content/uploads/2023/04/apiv9kzzu__2910-1024x1024.png"
                  alt="AHD visual"
                  className="w-full  h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}