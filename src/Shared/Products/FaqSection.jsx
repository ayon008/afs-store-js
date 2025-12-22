import React from 'react';
import Faq from '../Faq/Faq';

const FaqSection = ({ acf }) => {
    const caracteristiques = acf?.caracteristiques;
    const compatibilite = acf?.compatibilite;
    const programme = acf?.programme
    return (
        <div>
            <div className='global-margin lg:mt-20 mt-10'>
                <h3 className='text-[28px] leading-[28px] font-bold'>Caractéristiques</h3>
                <div className='mt-10 space-y-'>
                    {
                        caracteristiques && <Faq data={caracteristiques} headline={"Dimentions"} />
                    }
                    {
                        compatibilite && <Faq data={compatibilite} headline={"Guide taille"} />
                    }
                    {
                        programme && <Faq data={programme} headline={"Programme"} />
                    }
                </div>
            </div>
        </div>
    );
};

export default FaqSection;