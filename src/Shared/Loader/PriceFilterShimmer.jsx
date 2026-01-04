"use client";
import React from "react";

const PriceFilterShimmer = () => {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="space-y-4">
                <div className="w-1/2 h-5 bg-gray-200 rounded relative overflow-hidden">
                    <div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        style={{ animation: "shimmer 1.5s infinite" }}
                    />
                </div>
                <div className="w-full h-2 bg-gray-200 rounded relative overflow-hidden">
                    <div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        style={{ animation: "shimmer 1.5s infinite" }}
                    />
                </div>
                <div className="w-2/3 h-4 bg-gray-200 rounded relative overflow-hidden">
                    <div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        style={{ animation: "shimmer 1.5s infinite" }}
                    />
                </div>
            </div>
        </>
    );
};

export default PriceFilterShimmer;

