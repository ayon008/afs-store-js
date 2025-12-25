import Link from "next/link";
import { useTranslations } from "next-intl";

const BreadCums = () => {
    const b = useTranslations("breadcum");

    return (
        <div className="mb-[20px] uppercase">
            <div className="text-sm font-bold text-[#999]">
                <Link href="/" className="inline">
                    {b("home")}
                </Link>
                <span className="mx-1">/</span>
                <span className="text-black">Downwind guide</span>
            </div>
        </div>
    );
};

export default function Direct() {
    const t = useTranslations("DirectSailing");

    return (
        <>
            {/* HERO */}
            <div className="global-margin flex min-h-[calc(100vh-120px)] flex-col gap-[20px] lg:flex-row max-w-[1920px] mx-auto">
                {/* LEFT */}
                <div className="global-padding flex flex-1 flex-col justify-between gap-[40px] pt-[20px]">
                    <div className="flex flex-col gap-[20px]">
                        <BreadCums />

                        <div className="flex flex-col gap-[20px]">
                            <h1 className="global-h1">
                                {t("title")}
                                <span className="text-[#1e98ff]"> Direct Sailing</span>{" "}
                                {t("store")}
                            </h1>

                            <p className="max-w-[360px] text-[18px] font-semibold text-[#111111B2] max-[1024px]:text-[16px]">
                                {t("A wide")}
                            </p>
                        </div>
                    </div>

                    {/* HERO FOOTER */}
                    <div className="flex flex-col gap-[20px] border-b border-black/40 pb-[20px] leading-[1.2] md:flex-row md:flex-wrap md:justify-between">
                        <div className="flex flex-col gap-[4px]">
                            <h4 className="font-bold text-[#111111]">{t("store")}</h4>
                            <a
                                href="https://labaule.direct-sailing.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-[4px] font-semibold text-[#111111B2]"
                            >
                                labaule.direct-sailing.com
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                >
                                    <path
                                        d="M11 1L1 11M11 1H2M11 1V10"
                                        stroke="#111111B2"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </a>
                        </div>

                        <div className="flex flex-col gap-[4px]">
                            <h4 className="font-bold text-[#111111]">AFS Expert</h4>
                            <p className="font-semibold text-[#111111B2]">Lucas</p>
                        </div>

                        <div className="flex flex-col gap-[4px] md:basis-[210px] md:shrink-0">
                            <h4 className="font-bold text-[#111111]">{t("Address")}</h4>
                            <p className="font-semibold text-[#111111B2]">
                                ZA Pornichet Atlantique Chemin de la Monnerie 44380 Pornichet,
                                France
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT MAP */}
                <div className="relative min-h-[400px] w-full flex-1 overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2707.8224677829844!2d-2.3041085232169696!3d47.25917471190378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48056812b2ae1dc3%3A0x92f17054b549c85c!2sDIRECT%20SAILING!5e0!3m2!1sen!2sbd!4v1766124495062!5m2!1sen!2sbd"
                        className="h-full min-h-[400px] w-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />

                    <a
                        href="https://maps.app.goo.gl/Ab9vXGnzzgCytxTJA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-[20px] left-[20px] z-[2] flex items-center justify-center gap-[4px] rounded-[4px] bg-[#1f1f1f] p-[12px] text-[14px] font-bold uppercase text-white"
                    >
                        {t("Store access map")}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                        >
                            <path
                                d="M11 1L1 11M11 1H2M11 1V10"
                                stroke="white"
                                strokeWidth="2"
                            />
                        </svg>
                    </a>
                </div>
            </div>

            {/* HISTOIRE */}
            <div className="global-margin global-padding flex flex-col gap-[40px] max-w-[1920px] mx-auto">
                <h2 className="global-h2">{t("History")}</h2>

                <div className="flex flex-col gap-[40px] md:flex-row">
                    <div className="flex basis-[25%] flex-col space-y-[12px] pt-[120px] max-[1024px]:pt-0">
                        <img
                            loading="lazy"
                            decoding="async"
                            src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-4-4.png"
                            className="w-full"
                        />
                        <span className="uppercase text-[#111111B2] text-4 leading-[1.3] font-semibold">
                            {t("Store in Pornichet")}
                        </span>
                    </div>

                    <div className="flex-1">
                        <p className="pb-[40px] text-[18px] font-semibold leading-[130%] text-[#111]/75 max-w-[790px]">
                            {t("The Direct Sailing ")}
                        </p>

                        <div className="flex flex-col gap-[20px] max-[1024px]:flex-col lg:flex-row lg:justify-between">
                            <div className="max-w-[385px] space-y-[40px] pb-[20px] text-[18px] font-medium leading-[130%] text-[#111]/75">
                                <p className="text-[#111111B2] text-4 leading-[1.3] font-semibold">
                                    {t("As an")}
                                </p>
                                <p className="text-[#111111B2] text-4 leading-[1.3] font-semibold">
                                    "{t("Local and")}
                                </p>
                            </div>

                            <div className="flex basis-[50%] flex-col space-y-[12px]">
                                <img
                                    loading="lazy"
                                    decoding="async"
                                    src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-1-8.png"
                                    className="w-full"
                                />
                                <span className="uppercase text-[#111111B2] text-4 leading-[1.3] font-semibold">
                                    {t("Direct Sailing Team")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}