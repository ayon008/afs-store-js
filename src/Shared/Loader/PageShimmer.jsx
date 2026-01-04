"use client";
import React from "react";

const PageShimmer = () => {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="min-h-screen w-full global-margin py-8">
                <div className="space-y-8">
                    {/* Header shimmer */}
                    <div className="w-3/4 h-12 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>
                    
                    {/* Content shimmer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full bg-gray-100 rounded-lg overflow-hidden"
                            >
                                <div className="w-full aspect-square bg-gray-200 relative overflow-hidden">
                                    <div
                                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                        style={{ animation: "shimmer 1.5s infinite" }}
                                    />
                                </div>
                                <div className="p-4 space-y-3">
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

export default PageShimmer;

