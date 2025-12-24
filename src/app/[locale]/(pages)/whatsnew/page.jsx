import Link from "next/link";
import { getTranslations } from "next-intl/server";

const BreadCums = async ({ locale }) => {
    const b = await getTranslations("breadcum", locale);
    return (
        <div className="mb-[20px] uppercase">
            <div className="text-sm font-bold text-[#999999]">
                <Link className="inline" href="/">
                    {b("home")}
                </Link>
                / <span className="text-black">whatsnew</span>
            </div>
        </div>
    );
};

export default async function Whatsnew({ locale }) {
    const t = await getTranslations("whatsnew", locale);
    return (
        <>
            {/* HERO */}
            <div className="flex flex-col gap-[20px] lg:flex-row max-w-[1920px] mx-auto">
                {/* LEFT */}
                <div className="global-padding flex flex-1 flex-col justify-between gap-[40px] pt-[20px]">
                    <div className="flex flex-col gap-[20px]">
                        <BreadCums />
                        <div className="flex flex-col gap-4 justify-center items-center pt-10 pb-20 border-b-[2px] border-[#111]">
                            <h1 className="global-h1 text-center">{t("title")}</h1>

                            <p className="max-w-[360px] text-[18px] font-semibold text-[#111111] max-[1024px]:text-[16px] text-center leading-[120%]">
                                {t("Stay")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="global-margin py-[60px] max-w-[1920px] mx-auto global-padding">
                <div className="flex flex-col lg:flex-row gap-5 text-black pb-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("description", {
                                p: (chunks) => (
                                    <p className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </p>
                                ),
                            })}
                        </div>

                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://afs-foiling.com/fr/wp-content/uploads/2025/09/Capture-decran-2025-09-05-a-11.13.37.png"
                            className="attachment-full size-full wp-image-297053"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside2", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            <p className="text-[18px] lg:text-[24px] leading-[1.3]">
                                {t("we've")}
                            </p>
                        </div>
                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/Ar1iIIUS3zQ?si=uI2lo1WQpQlQy_tY"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}

                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside3", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("content3", {
                                p: (chunks) => (
                                    <p className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </p>
                                ),
                            })}
                        </div>

                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/KspaMELzFk8?si=WdGZGcnJ_1MGbNho"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside4", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            <p className="text-[18px] lg:text-[24px] leading-[1.3]">
                                {t("What")}
                            </p>
                        </div>
                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/m81RX14f0v8?si=UfgRHgnVVYpv-_1T"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}

                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside5", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="space-y-3 text-[18px] lg:text-[24px] leading-[1.3]">
                            {t.rich("recap", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                                li: (chunks) => (
                                    <li>
                                        <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                            {chunks}
                                        </h4>
                                    </li>
                                ),
                                em: (chunks) => <em>{chunks}</em>,
                                ul: (chunks) => <ul className="list-disc pl-5">{chunks}</ul>,
                            })}
                        </div>

                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://afs-foiling.com/fr/wp-content/uploads/2025/08/Capture-decran-2025-08-13-a-10.16.15.png"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside6", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                {t("glide")}
                            </h4>
                        </div>
                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/07/Capture-decran-2025-07-30-a-10.01.36.png"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}

                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside7", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("techTalk", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                            })}
                        </div>

                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/cXzehMRLp7I?si=tBxKTAQAuzyYzaTO"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}

                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside8", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("techTalk2", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                            })}
                        </div>

                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/07/Capture-decran-2025-07-21-a-10.09.45.png"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}

                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside9", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/07/Capture-decran-2025-07-21-a-10.03.44.png"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside10", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("axelCongrats", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                            })}
                        </div>

                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/07/Capture-decran-2025-07-21-a-09.56.12.png"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside11", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("detachableBoard", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                            })}
                        </div>

                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/07/Capture-decran-2025-07-21-a-09.35.07.png"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside12", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/1jLZNpJYb7A?si=mn_vTDw6tvTthkfv"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside13", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/vxrfHq5y2oY?si=BgSWrx3jBJDKuC0v"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside14", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("dockStarInfo", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                            })}
                        </div>

                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/06/cat-dockstar.jpg"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside15", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("summerOffers", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                                br: () => <br />,
                            })}
                        </div>

                        <img
                            loading="lazy"
                            decoding="async"
                            width={933}
                            height={935}
                            src="https://staging.afs-foiling.com/wp-content/uploads/2025/06/2dd4325b-351b-44ba-8b53-375e367727cd.png"
                            alt=""
                            sizes="(max-width: 933px) 100vw, 933px"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside16", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("pulseVideo", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                            })}
                        </div>

                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/tL5HLZALiU8?si=5CoREPPYjAriU4E7"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 text-black py-[60px] border-b">
                    {/* Aside */}
                    <aside className="uppercase space-y-3 w-full lg:w-[35%] lg:sticky lg:top-[180px] self-start">
                        {t.rich("aside17", {
                            p: (chunks) => (
                                <p className="text-[#999999] font-bold">{chunks}</p>
                            ),
                            h2: (chunks) => (
                                <h2 className="text-black text-[32px] lg:text-[38px] font-bold leading-[110%]">
                                    {chunks}
                                </h2>
                            ),
                        })}
                    </aside>

                    {/* Content */}
                    <div className="w-full lg:flex-1 flex flex-col gap-5">
                        <div className="text-[#333] font-semibold space-y-3">
                            {t.rich("wingChallenge", {
                                h4: (chunks) => (
                                    <h4 className="text-[18px] lg:text-[24px] leading-[1.3]">
                                        {chunks}
                                    </h4>
                                ),
                            })}
                        </div>

                        <div className="relative w-full h-full aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/ZwgMin0AfNg?si=CTNmzlrWfVuGr0vZ"
                                title="YouTube video player"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}