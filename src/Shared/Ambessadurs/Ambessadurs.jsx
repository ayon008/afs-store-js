"use client"
import React, { useEffect, useState } from 'react';

import Sec1 from './Sec1';
import Map from './Map';
import AmbassadorsCard from '../Card/AmbassedurCard';
import { useTranslations } from 'next-intl';

const Ambassedor = ({ categories, countries, data }) => {
    const t = useTranslations("ambassadors");
    const [country, setCountry] = useState(null);
    const [countryName, setCountryName] = useState(t("country"));
    const [activeTab, setActiveTab] = useState(null);
    const [filterData, setFilterData] = useState(data || []);

    useEffect(() => {
        if (activeTab && countryName && countryName !== t("country")) {
            // Both filters active
            const filterData = data?.filter((singleData) =>
                singleData?.discipline?.find((s) => s?.id === activeTab) &&
                singleData?.nationalite?.find((s) => s?.name === countryName)
            );
            setFilterData(filterData);
        } else if (activeTab) {
            // Only discipline filter
            const filterData = data?.filter((singleData) =>
                singleData?.discipline?.find((s) => s?.id === activeTab)
            );
            setFilterData(filterData);
        } else if (countryName && countryName !== t("country")) {
            // Only country filter
            const filterData = data?.filter((singleData) =>
                singleData?.nationalite?.find((s) => s?.name === countryName)
            );
            setFilterData(filterData);
        } else {
            // No filters - show all data
            setFilterData(data);
        }
    }, [country, countryName, activeTab, data, t])


    return (
        <div className='max-w-[1920px] mx-auto'>
            <Map setCountry={setCountry} setCountryName={setCountryName} country={country} />
            <div className='my-[40px]'>
                <Sec1 activeTab={activeTab} setCountry={setCountry} countryName={countryName} setCountryName={setCountryName} country={country} setActiveTab={setActiveTab} categories={categories} countries={countries} />
            </div>
            {
                filterData?.length > 0 ?
                    <div className='grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 global-margin'>
                        {
                            filterData?.map((data, i) => {
                                return (
                                    <div key={i}>
                                        <AmbassadorsCard data={data} />
                                    </div>
                                )
                            })
                        }
                    </div>
                    : <div className='global-margin'>
                        <h3 className='text-center font-2xl font-semibold'>No data found</h3>
                    </div>
            }
        </div>
    );
};

export default Ambassedor;