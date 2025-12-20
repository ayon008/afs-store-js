// app/components/FeatureBar.js
"use client";

import { Truck, CreditCard, Users, RotateCcw, ShieldCheck, Globe } from "lucide-react";

// Feature data
const features = [
    {
        icon: Truck,
        title: "CLICK & COLLECT",
        detail: "",
    },
    {
        icon: CreditCard,
        title: "SECURE PAYMENT IN",
        detail: "3 OR 4 INSTALMENTS",
    },
    {
        icon: Users,
        title: "ADVICE FROM",
        detail: "ENTHUSIASTS",
    },
    {
        icon: RotateCcw,
        title: "SATISFIED OR",
        detail: "YOUR MONEY BACK",
    },
    {
        icon: ShieldCheck,
        title: "2 TO 3 YEARS",
        detail: "WARRANTY",
    },
    {
        icon: Globe,
        title: "WORLDWIDE DELIVERY",
        detail: "Detax available",
    },
];

// Individual feature item
const FeatureItem = ({ icon: Icon, title, detail, isLast }) => {
    const dividerClass = isLast ? "" : "lg:border-r-2";
    return (
        <div
            className={`flex flex-col items-center justify-center px-3 lg:px-4 py-4 w-full h-full min-h-[140px] ${dividerClass}`}
            style={{ borderColor: "#333", borderStyle: "dashed" }}
        >
            <Icon className="w-10 h-10 text-white mb-3" strokeWidth={1.5} />
            <div className="text-center">
                <p className="text-white text-sm lg:text-base font-bold tracking-wider leading-snug">
                    {title}
                </p>
                <p className="text-gray-300 text-xs lg:text-sm font-semibold tracking-wide leading-snug">
                    {detail}
                </p>
            </div>
        </div>
    );
};
// Main FeatureBar component
// Main FeatureBar component
const FeatureBar = () => {
    return (
        <div className="bg-black flex justify-center p-4 sm:p-8">
            <div
                className="bg-black text-white w-full rounded-2xl shadow-2xl overflow-hidden"
                style={{ border: "2px dashed #333", padding: "0.5rem" }}
            >
                <div className="grid grid-cols-2 lg:grid-cols-6 divide-y-2 lg:divide-y-0 divide-[#333] divide-dashed min-h-[150px] gap-0">
                    {features.map((feature, index) => (
                        <FeatureItem
                            key={index}
                            {...feature}
                            isLast={index === features.length - 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};



export default FeatureBar;
