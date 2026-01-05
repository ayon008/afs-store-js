"use client"
import React, { Suspense, lazy } from 'react';

const MapSVG = lazy(() => import('./MapSVG'));

const Map = ({ setCountry, setCountryName, country }) => {
    const handleSet = (id, name) => {
        setCountryName(name);
        setCountry(id);
    }

    return (
        <div className='lg:overflow-x-hidden overflow-x-scroll'>
            <Suspense fallback={<div className="min-w-[920px] h-[578px] bg-white animate-pulse" />}>
                <MapSVG handleSet={handleSet} />
            </Suspense>
        </div>
    );
};



export default Map;
