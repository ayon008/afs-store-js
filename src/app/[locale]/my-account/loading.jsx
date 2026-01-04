"use client";
import React from "react";

const AccountShimmer = () => {
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
                    <div className="w-1/3 h-10 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>
                    
                    {/* Content shimmer */}
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-16 bg-gray-200 rounded relative overflow-hidden"
                            >
                                <div
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                    style={{ animation: "shimmer 1.5s infinite" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountShimmer;

