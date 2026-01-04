"use client";
import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';

const RouteTransition = ({ children }) => {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        // Détecter uniquement les changements de route réels
        if (prevPathnameRef.current !== pathname) {
            setIsLoading(true);
            prevPathnameRef.current = pathname;
            
            // Délai minimal pour permettre au DOM de se mettre à jour
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Chargement...</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RouteTransition;

