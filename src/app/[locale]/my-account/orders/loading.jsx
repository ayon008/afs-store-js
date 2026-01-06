"use client";
import React from "react";

const OrdersShimmer = () => {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="min-h-screen global-margin py-8">
                <div className="space-y-6">
                    {/* Title shimmer */}
                    <div className="w-1/4 h-10 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>
                    
                    {/* Orders list shimmer */}
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full p-6 border border-gray-200 rounded-lg"
                            >
                                <div className="space-y-3">
                                    <div className="w-1/3 h-6 bg-gray-200 rounded relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                            style={{ animation: "shimmer 1.5s infinite" }}
                                        />
                                    </div>
                                    <div className="w-1/4 h-4 bg-gray-200 rounded relative overflow-hidden">
                                        <div
                                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                            style={{ animation: "shimmer 1.5s infinite" }}
                                        />
                                    </div>
                                    <div className="w-1/5 h-4 bg-gray-200 rounded relative overflow-hidden">
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

export default OrdersShimmer;


