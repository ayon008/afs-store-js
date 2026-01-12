"use client"
import React, { useState } from 'react';

import Sec1 from './Sec1';
import Map from './Map';
import { allAmbassadors } from '@/app/actions/WC/getAllAmbessador';
import AmbassadorsCard from '../Card/AmbassedurCard';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

const Ambassedor = ({ categories, countries }) => {
    const t = useTranslations("ambassadors");
    const [country, setCountry] = useState(null);
    const [countryName, setCountryName] = useState(t("country"));
    const [activeTab, setActiveTab] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['ambassadors', activeTab, country],
        queryFn: async () => await allAmbassadors(activeTab, country),
    })



    if (isLoading) {
        return (
            <div className='max-w-[1920px] mx-auto global-padding'>
                <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
                <div className='h-[578px] w-full'>

                </div>
                <div className='grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 global-margin'>

                </div>
            </div>
        )
    }

    return (
        <div className='max-w-[1920px] mx-auto'>
            <Map setCountry={setCountry} setCountryName={setCountryName} country={country} />
            <div className='my-[40px]'>
                <Sec1 activeTab={activeTab} setCountry={setCountry} countryName={countryName} setCountryName={setCountryName} country={country} setActiveTab={setActiveTab} categories={categories} countries={countries} />
            </div>
            {
                data?.length > 0 ?
                    <div className='grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 global-margin'>
                        {
                            data?.map((data, i) => {
                                return (
                                    <div key={i}>
                                        <AmbassadorsCard data={data} />
                                    </div>
                                )
                            })
                        }
                    </div>
                    : <div>
                        <h3 className='text-center font-2xl font-semibold'>No data found</h3>
                    </div>
            }
        </div>
    );
};

export default Ambassedor;