import Image from "next/image";
import Link from "next/link";


const decodeEntities = (str = "") =>
    str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

export default function BlogCard({ blog }) {
    return (
        <div className="w-full">
            {/* Image */}
            <div className="relative w-full aspect-[16/9]">
                <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content */}
            <div className="mt-5">
                {/* BLOG Label */}
                <span
                    className="inline-block border border-[#1D98FF] text-[#1D98FF] rounded-full w-fit tracking-wide"
                    style={{
                        fontFamily: '"alliance no.2", sans-serif',
                        fontSize: "12px", // Slightly adjusted size for better fit
                        fontWeight: 700,
                        lineHeight: "16px", // Increased line-height for vertical spacing
                        padding: "4px 12px", // Increased vertical padding (4px)
                    }}
                >
                    BLOG
                </span>
                {/* Title */}
                <h2
                    className="mt-2"
                    style={{
                        fontFamily: '"alliance no.2", sans-serif',
                        fontSize: "18px",
                        fontWeight: 700,
                        lineHeight: "19.6px",
                        color: "rgba(17, 17, 17, 0.75)",
                    }}
                >
                    {decodeEntities(blog.title)}
                </h2>

                {/* Description (limited to 3 lines with ellipsis) */}
                <p
                    className="mt-2 line-clamp-3 overflow-hidden text-ellipsis"
                    style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: '"alliance no.2", sans-serif',
                        fontSize: "18px",
                        fontWeight: 600,
                        lineHeight: "19.6px",
                        color: "rgba(17, 17, 17, 0.75)",
                    }}
                >
                    {blog.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                    <p
                        style={{
                            fontFamily: '"alliance no.2", sans-serif',
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "15.4px",
                            color: "rgba(17, 17, 17, 0.4)",
                        }}
                    >
                        {blog.date}
                    </p>

                    <Link
                        href={`/blog/${blog.slug}`}
                        className="flex items-center gap-1"
                        style={{
                            fontFamily: '"alliance no.2", sans-serif',
                            fontSize: "16px",
                            fontWeight: 600,
                            lineHeight: "16px",
                            color: "rgb(29, 152, 255)",
                        }}
                    >
                        Read more
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 12 12"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2 10L10 2M10 2H3M10 2V9"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
