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
            <MapSVG handleSet={handleSet} />
        </div>
    );
};



export default Map;
