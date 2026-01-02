"use client"
import React from 'react';
import Faq from '../Faq/Faq';
import { useTranslations } from 'next-intl';

const FaqSection = ({ acf }) => {
    const caracteristiques = acf?.caracteristiques;
    const compatibilite = acf?.compatibilite;
    const programme = acf?.programme;
    const t = useTranslations("product")
    return (
        <div>
            {
                acf && <div className='md:my-[60px] my-10'>
                    <h3 className='text-[28px] leading-[28px] font-bold'>{t("features")}</h3>
                    <div className='mt-10 space-y-'>
                        {
                            caracteristiques && <Faq data={caracteristiques} headline={t("Dimensions")} />
                        }
                        {
                            compatibilite && <Faq data={compatibilite} headline={t("size")} />
                        }
                        {
                            programme && <Faq data={programme} headline={"Programme"} />
                        }
                    </div>
                </div>
            }
        </div>
    );
};

export default FaqSection;