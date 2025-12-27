import Link from "next/link";
import { useTranslations } from "next-intl";

const BreadCums = () => {
  const t = useTranslations("breadcum")
  const a = useTranslations("legal")
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          {t("home")}
        </Link>
        / <span className="text-black"> {a("notice")}</span>
      </div>
    </div>
  );
};

export default function LegalNotice() {
  const t = useTranslations("legal")
  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />

          <h1 className="global-h2 text-center py-[80px]">
            {t("heading")}
          </h1>
        </div>
        {/*content */}
        <div className="text-[14px] font-semibold leading-[130%] space-y-[80px] max-w-[1320px] mx-auto">
          {/*sec-1 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            {t.rich("body", {
              p: (children) => <p>{children}</p>
            })}

            <ul className="list-disc pl-5">
              {t.rich("li", {
                li: (children) => <li>{children}</li>
              })}
            </ul>
            {t.rich("last", {
              p: (children) => <p className="py-2 text-[#404040]">{children}</p>
            })}
          </div>
        </div>
      </div>
    </>
  );
}
