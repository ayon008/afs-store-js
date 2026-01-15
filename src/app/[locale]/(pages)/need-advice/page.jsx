import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const BreadCums = async () => {
  const b = await getTranslations("breadcum");
  const c = await getTranslations("Need-advice");
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#ccc]">
        <Link className="inline" href="/">
          {b("home")}
        </Link>
        / <span className="text-white"> {c("title")}</span>
      </div>
    </div>
  );
};

export default async function TicketsPage() {
  const t = await getTranslations("Need-advice");
  return (
    <>
      <div className="bg-black">
        <div
          className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-[20px] global-padding global-margin bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              `url(${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2025/07/image-7244.png)`,
          }}
        >
          <div className="min-h-[calc(100vh-150px)] flex flex-col">
            {/* Breadcrumb at top */}
            <BreadCums />

            {/* Centered content */}
            <div className="flex flex-1 items-center justify-end">
              <div className="flex flex-col items-end gap-[20px] max-w-[1440px] w-full">
                <h1 className="global-h1 text-white">
                  <span className="text-[#bfbfbf]">AFS Support. </span>
                  {t("You want")}
                </h1>

                <p className="text-[#BFBFBF] max-w-[360px] global-p font-bold">
                  {t("For this")}
                </p>
              </div>
            </div>
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
            {t("Contact form")}
          </Link>

          <Link
            href="/demande-sav/"
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            {t("After-sales")}
          </Link>

          <Link
            href=""
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">{t("Book a call")}</span>
          </Link>

          <Link
            href=""
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">{t("Book a")}</span>
          </Link>

          <Link
            href=""
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">{t("Chat online")}</span>
          </Link>

          <Link
            href="/afs-events"
            className="flex items-center justify-center px-[20px] py-[40px] text-white global-h1 font-thin hover:bg-[#fff] hover:text-[#111] w-full text-center transition-all duration-100"
            style={{
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              fontWeight: 400,
            }}
          >
            <span className="block max-w-[1440px]">{t("Meet us")}</span>
          </Link>
        </div>
        <div className=" global-padding flex flex-col items-center justify-center gap-[20px] text-[clamp(1rem,_0.8548rem_+_0.6452vw,_1.5rem)]">
          <p className="font-semibold text-[#BFBFBF] text-center">
            {t("While you")}
          </p>
          <ul className="text-white flex gap-[20px] flex-wrap justify-center global-margin">
            <li>
              <a
                className="hover:underline"
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/categorie-produit/foiling/wing-foil/#guide`}
              >
                WING FOIL
              </a>
            </li>

            <li>
              <a
                className="hover:underline"
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/les-etapes-cles-pour-se-lancer-en-dockstart/`}
              >
                DOCKSTART
              </a>
            </li>

            <li>
              <a
                className="hover:underline"
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/guide-downwind/`}
              >
                DOWNWIND
              </a>
            </li>

            <li>
              <a
                className="hover:underline"
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/categorie-produit/foiling/surf-foil/`}
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