"use client";
import React from "react";

const ShimmerLoader = () => {
    return (
        <>
            {/* Inject keyframes locally */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

            <div className="flex lg:flex-row flex-col items-start justify-between gap-10 global-margin">
                {/* LEFT SIDE */}
                <div className="lg:w-[60%] w-full">
                    <div className="grid-cols-2 gap-2.5 relative lg:grid hidden">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full aspect-square rounded-sm bg-gray-200 relative overflow-hidden"
                            >
                                <div
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                    style={{ animation: "shimmer 1.5s infinite" }}
                                />
                            </div>
                        ))}

                        {/* Button shimmer */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-24 h-8 bg-gray-200 rounded-full overflow-hidden">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                    style={{ animation: "shimmer 1.5s infinite" }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="block lg:hidden">
                        <div
                            className="w-full aspect-square rounded-sm bg-gray-200 relative overflow-hidden"
                        >
                            <div
                                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                style={{ animation: "shimmer 1.5s infinite" }}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="lg:w-[40%] w-full space-y-4">
                    <div className="w-3/4 h-8 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>

                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="w-full h-6 bg-gray-200 rounded relative overflow-hidden"
                        >
                            <div
                                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                style={{ animation: "shimmer 1.5s infinite" }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ShimmerLoader;
