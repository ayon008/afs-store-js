"use client"
import React, { useEffect, useState } from 'react';

import Sec1 from './Sec1';
import Map from './Map';
import { allAmbassadors } from '@/actions/WC/getAllAmbessador';
import AmbassadorsCard from '../Card/AmbassedurCard';

const Ambassedor = ({ categories, countries }) => {
    const [country, setCountry] = useState(null);
    const [data, setData] = useState([]);
    const [countryName, setCountryName] = useState("COUNTRY");
    // Discipline
    const [activeTab, setActiveTab] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const allData = await allAmbassadors(activeTab, country);
            setData(allData);
            setLoading(false);
        };
        load();
    }, [activeTab, country]);



    if (loading) {
        return <div className='h-[400px] w-full flex items-center justify-center'>
            <p className='text-3xl text-center'>Loading....</p>
        </div>
    }

    return (
        <div className='max-w-[1920px] mx-auto'>
            <Map setCountry={setCountry} setCountryName={setCountryName} country={country} />
            <div className='lg:mt-[80px] mt-[40px] global-margin bg-red-400'>
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