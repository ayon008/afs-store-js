"use client";
import React from "react";

const BlogPostShimmer = () => {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="w-full relative global-margin py-8 global-padding">
                <div className="space-y-6">
                    {/* Breadcrumb shimmer */}
                    <div className="w-1/2 h-4 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>
                    
                    {/* Title shimmer */}
                    <div className="w-3/4 h-12 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>
                    
                    {/* Image shimmer */}
                    <div className="w-full h-96 bg-gray-200 rounded relative overflow-hidden">
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            style={{ animation: "shimmer 1.5s infinite" }}
                        />
                    </div>
                    
                    {/* Content shimmer */}
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-4 bg-gray-200 rounded relative overflow-hidden"
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

export default BlogPostShimmer;


