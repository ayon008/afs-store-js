"use client"
import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import EventDropDown from './EventDropDown';
import { getAllEvents } from '@/app/actions/WC/getAllEvents';

const Events = () => {

    const mapRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);
    const [data, setData] = useState([]);
    const [shop_name, setShopName] = useState("");
    const [selectedShop, setSelectedShop] = useState(null);

    const center = {
        lat: 43.2902432365116,
        lng: 5.48532171164206
    }

    const mapStyle = [
        {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{ color: "#444444" }]
        },
        {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#f2f2f2" }]
        },
        {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "road",
            elementType: "all",
            stylers: [{ saturation: -100 }, { lightness: 45 }]
        },
        {
            featureType: "road.highway",
            elementType: "all",
            stylers: [{ visibility: "simplified" }]
        },
        {
            featureType: "road.arterial",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "transit",
            elementType: "all",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#46bcec" }, { visibility: "on" }]
        }
    ];

    useEffect(() => {
        const load = async () => {
            const data = await getAllEvents(selectedId);
            setData(data);
        }
        load();
    }, [selectedId]);


    const containerStyle = {
        width: '100%',
        height: '100%'
    };

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    });

    if (!isLoaded) return <p>Loading map...</p>;

    const locations = data?.map((singleData, i) => ({
        id: singleData?.id ?? i,
        lat: parseFloat(singleData?.acf?.latitude),
        lng: parseFloat(singleData?.acf?.longitude),
        event_name: singleData?.acf?.event_name,
    }));

    const getSVG = (isActive) => {

        const fillColor = isActive ? '#000000' : '#1D98FF';

        if (!isActive) {
            return ` <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <path d="M36 20C36 33 18 49 18 49C18 49 0 33 0 20.5C0 8 7.50659 0 18 0C28.4934 0 36 7 36 20Z" fill="${fillColor}" />
                <mask id="mask0_10081_11572" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="3" y="16" width="30" height="7">
                    <rect x="3" y="16" width="30" height="6.25" fill="url(#pattern0_10081_11572)" />
                </mask>
                <g mask="url(#mask0_10081_11572)">
                    <rect x="3" y="16" width="30.3358" height="7.20744" fill="white" />
                </g>
                <defs>
                    <pattern id="pattern0_10081_11572" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlink:href="#image0_10081_11572" transform="scale(0.00358579 0.0172118)" />
                    </pattern>
                    <image id="image0_10081_11572" width="282" height="67" preserveAspectRatio="none" xlink:href="data:image/png;base64,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" />
                </defs>
            </svg>`
        } else {
            return `
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path d="M36 20C36 33 18 49 18 49C18 49 0 33 0 20.5C0 8 7.50659 0 18 0C28.4934 0 36 7 36 20Z" fill="${fillColor}"/>
<mask id="mask0_10081_11572" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="3" y="16" width="30" height="7">
<rect x="3" y="16" width="30" height="6.25" fill="url(#pattern0_10081_11572)"/>
</mask>
<g mask="url(#mask0_10081_11572)">
<rect x="3" y="16" width="30.3358" height="7.20744" fill="white"/>
</g>
<defs>
<pattern id="pattern0_10081_11572" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_10081_11572" transform="scale(0.00358579 0.0172118)"/>
</pattern>
<image id="image0_10081_11572" width="282" height="67" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARoAAABDCAYAAABDRcoxAAAMPUlEQVR4nO2d4XUiORLH/7q3388ZjC+C5SI4JoJlIzgcweAIxo5gcQSHI1gcweIIFjKADCCC/32QGktqNS01Urca9HuPN89Mi1aX1KVSqVQSuANITgA8AHhUn1zZAjgCOAohtkNXpoJkJbcHAJOBqzMkGyHEJqSAJjtAyu4heq3yZ//L0DWIjVIqU/WZAPg2bI26QRIADpDKZwPZyZMrH/Vi6PL7NfU9R4ZT0ZCslHAlt9H2vQR8vwlFQ3IKYA5gBuCfA1cnJt/U5zcAIHkAsAawFELsY91EvSRz9SmKxRM1qM3Up8jNzZMQYiOGrkVXtJdjgfscOd4BLIQQx64/oF6UBYD/RqvVbfMMYIX77nchvAsh5gAwOkWjFMxCfW7JeunCCcA0dEqlpkdLKEup4MUJ0posStmPTyHEtPpjVIqG5AzyBSkjyRdByobkC4CfaatUuHN2kH3ybG2PQtEoK2aFMgI3YYweLtQ0aYXiSyikxTnwZa9o1AuyRrFi2vhXk4NYOcvXKFPNQnq+u0IA/jFETXwhOYdcTixKph1nfJCS4V8oSqaQnqemOKNsl7eVP+Z/Q9djzBQZFnrkXQixavrPLKdOarq0QRmFQzCmTkWGhR5p9RFmp2iU43eLMl0K4SCEOE+dlAw3KI7fQnpqK0wucvTRrFCUTCi2ybpEUTKF9JwAzH2CRrOyaEguAPzRw61OkFZTH/wn8e8bZqvyy/yZ+J59yq9PHtHPIHcr8nsJ3WQ6OCQnJI9Mx5bkXE0r+nqmZcLnIaW89CnTI9PJ8EipxG4Skg8JZUeSK5Iz9tj/ChaqkbcJG3nfdwOrTpWamXXPlDK86fQQJDeJ5LahNhgUBoTpR/6LHvEEz5N6dCTJpXXPl4T3mvcpv74huUgkt/XQz5YLg/tomN6nMMR8OPVc3/D0UyrSvxLdK3d/wlV+AkpL7e+I9dHZQSYyGyMbAKtY6UgGVTSUJuUWJdYjBGMvCeWUcI/7lOGHEKKz34gllMKHNyHE4tofGXp5e4X7fEGuYWFtWLtXGR4g88JcQ8kE0M4Pyh3/VzGYolGVT730e2t86GHelOEA97qj3St+ownldyq5Zfy42qIZZOqUeF58qxwATDS/zD3L8FUI0XmULVP2cIQQV+mK3hVNmRd35t+WX+ZeZdi6r6YNkluUyOkQjC0uXRhi6lS2GITzavll7tW3cIJMBN4ZNWUvSiaMq6N/e7Vo1Ly4pC0Iw95icM8y/F0I0Tk25c5X6K7BmcwqhN4sGuVTWLZeWNAxRnB+JRW/R96uUTKKKYqSCeUzxn6mPqdO97oMew32ysq9puPcxYjlwH2fstmVKFHhvSgaynD5Mi8OwxjB71iGV/tlNHKOcM6R19FEBvewxeAW2QkhzqNv4i0GufN0KUVkKGXFyZurV/d0kiqa4nzrxAkyXmYP3L0MzycdxkLJc40SLHoJow/GIHVy8tg+hXfUs8kNSYql+oWlZFL5ZX5H/hv+ok91lM9rqhYn5pB+m6J0TOYxlQyQUNEk2GKww5VnTcdEPV9sJfMOYK2WsGdIt73gOcIKzqhRcUmGg1kpnzEkpnpAOndEjNW9fqDMlhebbFYMSE4TPB+ZLvmScY+h5Ve4DpLrRH1jy7FkAKRM+rSPLIAYS5tRYD9JrVJx5Fg6UsEJ0yXpOjKjwbwVxte2WZlxCZ6vT3rNNFiIC9PMFCrGk0WRMvl3THrP9XsJphtN+uBeI4pvAqaZKVRkNZhfhGky8GczAjPtaJKaEqg2cihPUUhBL4N5zMjg2Muwr7mcGcOvZeYxEjOytjAAJFdIl6Rr1sdKbpTlbcYPj/+8JrFRAsacliF6TESOUG44vaVjTR4gN4HOkK7v2elHknF1ZDDjh8efADxmFC8z5rQM0SNrc4TlrPEuRN1i0MZVioZpwuOvyjkSE8rlvg3GGf7vdfj6LUAZG1Sie/3pfTDv7KPRRpGYL2E2UYlMG/6fGu/D18eO8l8UJRNG733jGmdwbL9MrJwjsdhgvH6ZWV9z7yFhOcmgC4MM5p0UDWWkbswGzmplRI2SY53vP+WyWpcSyvQjY/WdDcVgg3mwolHO3z8i12ORy8pIAiXaJ+8xc7fkivKd3fxzRuaESNnyuhDkDGaa83CyWRnhuJN0GcmybhXe91EzXTlg4Om0t6JJtISYzcrIyFeYjMPlbhmWDHmhfCCDhYGQqVMKv8XgAgDOSnSsydNP6Cm6c2hG7jvrmwNkqEgWfcNL0VAmeYqdhOk5o5WRNcbbgecZyTEZqg+O1XfWJwfIBYHHXEJFAI+pUyK/xYcQIotVpsT7SFLzLIS4+V3ZI4/O7oMD5LR/meugc1HRJPJbZONPGHkHzsaJnpKR+85SsYOMyN8A2OSqXHTaFM0S8Q/deskhzmPkO7KPuViEqUnUB3PHfj/26nMcg1IpFAqFQqFQKBQKhUKhUCgUCoVCoVAoFNLQuLyt4hemaD8i9AhgLYTYq02XemzH0ideRt3rvFwrhHhRy89TBCxtqnILjzpXbHyX2gPkUbFSMpmqcm1sVX2OKkiyeu495DK8vr1/5bPbXclQL7dEmEz1OnVqD486hsp1AymT1n5m9YW1EGLb4X5VCERoOEFo+5/LQco4dEn/3FaB5YaD5DL0yAZVTj/S1TtGhfIozool5dEmoWfYvJCcBZYhPY50YfhRF1vKc3hCj7itnl0/tmZq3d87BonmYXdrdjsyZqHKbdsutGhN48DwfnakPNantZ/RPINrT/Ibww//q8qF9sUNZfuHymzD644tyimhv0HNoqEcBap8Mwe4c1jYh4w/q3/1cl7Rv0o4P9WfO0jtr+chfobU1m3sYaawaCr3gq/Uj62pFSgDxn5o9fNJHLSHHJmq+3xAWhM2U3w9+wlyFNP3Xb1BjuB/6td4WjN6O57Ub37iK73CG9wBi3rWuoN6Bp9yNttL7e/Zz2yOkDK72M8orZa/ta++w3yuT8h+0MZe3VPvI3bff0U9wG4LM9PBO/zy5zSVe4QZwV71bf2Zskrqb2Mct6IaSG+AJuHoneIDUjh6w3rtyqa0Jn5qX81h5undoVnJGB2ZcqSvyn249gCp+1Uvf2tWP3X9D+2rJnns9ZdfvUTVfQ5wyIP1yOQXyOevOtkO8oXaadd4JQijnMLq7TiD7JyVsnBmWlPtr+/7mkO+SFW5z6qcqr9LSbdGr6r76MnTmuRq/FZDuQlJu5ze9q+QykF/Lq921DgrEpoW1IdreqgGz6odT2hWzHYf1ssdINv7SPMAwDchxFK1sd5/s8iE4EUHU+/IuonotcmP9SM+X+h/5OzW+i3bTK7Nv9X9dJP0omXiqN8lZlo5e3rinJqxPq2ZWuUmjDcV1aeUR8pO2lbOnooa5dg8DfHxy4RORZcdy60cz+WDcwCi2c8qv5V9je/01JanXW6ivn/Rvjv3beuZss82eLZoaGrTHdxa+BH1Ec8oF5CTVD+U7VPdTzdB3yDNVhfnurE+yjVpdj3fjNPicVx/tgDQPCrtre34eqO/uZzNlJs5q7QbJ0ir6VO75BVyiqBbX14bKB3taFtFL65Rm+YhgDvI9tGvO1tT/MpyV5nvuqXkMyVZQLZ104Fvdj+rZKiXe4BpbX7gy/o9wtxsOIOUZ9P9JjDbo2aRsW4l+lipep1sNpY89XKvmuNat/hnysKpWT4N98gLOkbThuv0EXbpW87xO7WRkh2sIvVbreVIzq37XVxxcNTPa4WCpnPT2cFYd/bNaDl76XAIe96/NirSspwayunteKSnNeUq51NPj+cw+lnDNbqsO2/SpaelS79+1qlOdPQbOix+9b2XxZwbgvUcrM4cJzSdtgfIUUAvd0C7w6taqtWdvU+QI42uud9hjqYulpAjzNlR63Lssp7n+OIBdaHXa+XsEzs/UXcSAqYF4HT2wnQI+8j1qK7R2+NVfa87hGvOQlf7q3K687GpPfRnebqUGJ31pfYmdEvOmeqVZo4kp4OcVsjEBfRncJ7e6Or7LXUC/PrwGrLv156F1iKEEGLiaKvXzI6ObsZHC1OOwjoT9V3osp9zpGT4MueKHa0wD3no13vPfSktE99lyT3lfN8eTefqt4J9CrRGRTosp4Z615bOafoF2tg2/bZ1n5A2Pqp6+fjanFNKhsmwmo64fsfpO2lo/xCqEIiaNcUG3xg9LOZc+T/4Otj/dij9vgAAAABJRU5ErkJggg=="/>
</defs>
</svg>
            `
        }

    }

    const handleClick = (id, name, lat, lng) => {
        // Parse incoming coords to float and add guards.
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        console.log('handleClick:', name, latNum, lngNum, 'mapRef current:', !!mapRef.current);
        if (Number.isFinite(latNum) && Number.isFinite(lngNum) && mapRef.current) {
            // If clicked again on selected marker, toggle off
            // if (selectedShop === id) {
            //     setSelectedShop(null);
            //     return;
            // }
            setSelectedShop(id);
            // pan to location then increase zoom a bit after a small delay for smoother UX
            try {
                mapRef.current.panTo({ lat: latNum, lng: lngNum });
                // setTimeout ensures pan finishes before zooming in on some map setups
                setTimeout(() => mapRef.current.setZoom(Math.max(mapRef.current.getZoom() + 2, 8)), 120);
            } catch (e) {
                console.error('goToLocation error', e);
            }
        } else {
            console.warn('Invalid lat/lng for handleClick', lat, lng);
        }
    }
    // lg:h-[calc(500px-195px)] h-[calc(520px-150px)]

    return (
        <div className='max-w-[1920px] mx-auto'>
            <div className='flex items-center lg:flex-row flex-col lg:h-dvh h-[1020px] gap-4'>
                <div className='lg:w-1/3 lg:h-full w-full overflow-hidden'>
                    <EventDropDown selectedId={selectedId} setSelectedId={setSelectedId} />
                    <h3 className='lg:text-[50px] lg:leading-[55px] text-[32px] leading-[32px] text-white font-bold mt-4 mb-6'>Nombre de magasins:</h3>
                    <div className='overflow-y-scroll h-[calc(520px-150px)] lg:h-[calc(100%-195px)] 2xl:h-[calc(100%-140px)] popup-scroll-bar-1'>
                        {
                            data?.map((singleData, i) => {
                                const idKey = singleData?.id ?? i;
                                const event = singleData?.acf;
                                const event_name = event?.event_name;
                                const country = singleData?.destination_names[0];
                                const location = event?.location_;
                                const flag = event?.country_flag;
                                const starting_date = event?.starting_date;
                                const ending_date = event?.ending_date;
                                const latitude = event?.latitude;
                                const longitude = event?.longitude;

                                return (
                                    <div onClick={() => handleClick(idKey, event_name, latitude, longitude)} onMouseLeave={() => setShopName("")} onMouseEnter={() => setShopName(event_name)} className={`my-1 ${selectedShop === idKey ? "text-white bg-[#1D98FF]" : "bg-white text-black "}  p-5 h-fit lg:w-[99%] w-full rounded-[4px]`} key={i}>
                                        <p className='font-semibold text-[21px] leading-[29px]'>{event_name}</p>
                                        <div className={`flex items-center gap-2 text-lg py-1 px-2 ${selectedShop === idKey ? "bg-white text-black" : "bg-[#E6E6E6]"} w-fit rounded-2xl mt-3`}>
                                            <Image alt={country} className='w-[20px] h-[14px] object-cover' width={18} height={22} src={flag || "/public/images/map.svg"} />
                                            <p>{country}</p>
                                            <p>{location}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 text-lg py-1 px-2 ${selectedShop === idKey ? "bg-white text-black" : "bg-[#E6E6E6]"} w-fit rounded-2xl mt-3`}>
                                            <p>{starting_date}</p>
                                            <ArrowRight size={'1.1rem'} />
                                            <p>{ending_date}</p>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className='lg:w-2/3 lg:h-full h-[520px] w-full rounded-[4px] overflow-hidden'>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        zoom={5}
                        options={{
                            styles: mapStyle,
                            mapTypeControl: false,
                            minZoom: 4,
                            maxZoom: 8,
                            gestureHandling: "greedy"
                        }}
                        onLoad={(map) => {
                            mapRef.current = map;
                            try {
                                map.setCenter(center);
                                map.setZoom(5);
                            } catch (e) {
                                console.error('Failed to set center on load', e);
                            }
                        }}
                    >
                        {
                            locations?.map((loc, i) => {
                                const isActive = shop_name === loc?.event_name;
                                const marker = loc?.id === selectedShop;
                                const svg = getSVG(marker);

                                return (
                                    <Marker key={i}
                                        position={{ lat: loc.lat, lng: loc.lng }}
                                        icon={{
                                            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
                                            scaledSize: new window.google.maps.Size(52, 52),
                                        }}
                                        animation={marker || isActive ? window.google.maps.Animation.BOUNCE : undefined}
                                        zIndex={(marker || isActive) ? 9999 : undefined}
                                        onClick={() => handleClick(loc.id, loc?.event_name, loc.lat, loc.lng)}
                                    />
                                )
                            })
                        }
                    </GoogleMap>
                </div>
            </div>
        </div>
    );
};

export default Events;