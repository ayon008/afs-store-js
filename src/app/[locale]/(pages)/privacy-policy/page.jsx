import Link from "next/link";
import { useTranslations } from "next-intl";

const BreadCums = () => {
  const b = useTranslations("breadcum");

  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          {b("home")}
        </Link>
        / <span className="text-black">PRIVACY POLICY</span>
      </div>
    </div>
  );
};

export default function privacyPolicy() {
  const t = useTranslations("PRIVACY POLICY");

  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />

          <h1 className="global-h2 text-center py-[80px]">{t("title")}</h1>
        </div>
        {/*content */}
        <div className="text-[14px] font-semibold leading-[130%] space-y-[80px] max-w-[1320px] mx-auto">
          {/*sec-1 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("privacyCharter", {
              p: (chunks) => <p>{chunks}</p>,
            })}
          </div>

          {/*sec-2 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection1", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-3 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection2", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              h3: (chunks) => (
                <h3 className="text-[20px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h3>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-4*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection3", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              h3: (chunks) => (
                <h3 className="text-[20px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h3>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-4*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection4", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              h3: (chunks) => (
                <h3 className="text-[20px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h3>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-5*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection5", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-6*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection6", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-7*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection7", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-8*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection8", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              h3: (chunks) => (
                <h3 className="text-[20px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h3>
              ),
              p: (chunks) => <p>{chunks}</p>,
              ul: (chunks) => <ul className="mb-2 list-disc pl-5">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            })}
          </div>

          {/*sec-9*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection9", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
            })}
          </div>

          {/*sec-10*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection10", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
            })}
          </div>

          {/*sec-11*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection11", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
            })}
          </div>

          {/*sec-12*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("charterSection12", {
              h2: (chunks) => (
                <h2 className="text-[28px] text-[#111] font-bold leading-[1]">
                  {chunks}
                </h2>
              ),
              p: (chunks) => <p>{chunks}</p>,
            })}
          </div>

          {/*sec-13*/}
          {/* <div className="flex flex-col gap-[20] md:gap-[28px]">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: t("charterSection13") }}
            />
          </div> */}
        </div>
      </div>
    </>
  );
}