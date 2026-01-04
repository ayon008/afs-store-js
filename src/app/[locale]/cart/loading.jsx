"use client";
import React from "react";

const CartShimmer = () => {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="min-h-[400px] global-margin py-8">
                <div className="space-y-6">
                    {/* Title shimmer */}
                    <div className="w-1/4 h-10 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>
                    
                    {/* Cart items shimmer */}
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                            >
                                <div className="w-24 h-24 bg-gray-200 rounded relative overflow-hidden">
                                    <div
                                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                        style={{ animation: "shimmer 1.5s infinite" }}
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="w-3/4 h-5 bg-gray-200 rounded relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                            style={{ animation: "shimmer 1.5s infinite" }}
                                        />
                                    </div>
                                    <div className="w-1/2 h-4 bg-gray-200 rounded relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                            style={{ animation: "shimmer 1.5s infinite" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartShimmer;

