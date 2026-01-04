"use client";
import React from "react";

const CheckoutShimmer = () => {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="min-h-screen global-margin py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left side - Form */}
                    <div className="space-y-6">
                        <div className="w-1/3 h-8 bg-gray-200 rounded relative overflow-hidden">
                            <div
                                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                style={{ animation: "shimmer 1.5s infinite" }}
                            />
                        </div>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-full h-12 bg-gray-200 rounded relative overflow-hidden">
                                <div
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                    style={{ animation: "shimmer 1.5s infinite" }}
                                />
                            </div>
                        ))}
                    </div>
                    
                    {/* Right side - Order summary */}
                    <div className="space-y-6">
                        <div className="w-1/3 h-8 bg-gray-200 rounded relative overflow-hidden">
                            <div
                                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                style={{ animation: "shimmer 1.5s infinite" }}
                            />
                        </div>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-full h-6 bg-gray-200 rounded relative overflow-hidden">
                                <div
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                    style={{ animation: "shimmer 1.5s infinite" }}
                                />
                            </div>
                        ))}
                        <div className="w-full h-12 bg-gray-200 rounded relative overflow-hidden mt-4">
                            <div
                                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                style={{ animation: "shimmer 1.5s infinite" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutShimmer;

