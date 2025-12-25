import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import React from 'react';

const page = async ({ locale }) => {

    const t = await getTranslations('payment', locale);

    return (
        <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]'>
            <div className='space-y-[clamp(0.875rem,0.5297rem+0.7203vw,1.25rem)]'>
                {t.rich("heading", {
                    title: (chunks) => <h2 className="global-h2">{chunks}</h2>,
                    desc: (chunks) => <p className="profile-p">{chunks}</p>,
                    strong: (chunks) => <strong>{chunks}</strong>,
                })}

            </div>
            <div className='space-y-[clamp(2.5rem,1.349rem+2.401vw,3.75rem)]'>
                <div className='space-y-[clamp(0.875rem,0.5297rem+0.7203vw,1.25rem)]'>
                    {t.rich("p", {
                        title: (chunks) => (
                            <div className="flex items-center justify-between pb-1 global-b-bottom">
                                <h3 className="text-[28px] leading-[100%] font-semibold text-[#111]">
                                    {chunks}
                                </h3>
                            </div>
                        ),
                        desc: (chunks) => <p>{chunks}</p>,
                        link: (chunks) => (
                            <Link href="/sav" className="inline text-[#1D98FF]">
                                {chunks}
                            </Link>
                        ),
                    })}
                </div>
            </div>
        </div>
    );
};

export default page;