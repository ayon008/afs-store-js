export default function SkeletonProjectCard() {
    return (
        <div className="w-full bg-[#F7F7F7] flex flex-col justify-between mx-auto rounded-[4px] overflow-hidden relative">

            {/* Image Skeleton with prominent shimmer */}
            <div className="relative w-full aspect-[1] bg-gray-300 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 transform -translate-x-full animate-shimmer bg-gradient-to-r from-gray-300 via-white/60 to-gray-300"></div>
                </div>
            </div>

            {/* Text Section */}
            <div className="flex flex-col flex-1 px-4 mt-[10px] gap-5 pb-4 text-center relative z-10">
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>

            {/* Shimmer animation for image */}
            <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(120%); }
        }
        .animate-shimmer {
          animation: shimmer 1.2s infinite;
        }
      `}</style>
        </div>
    );
}
