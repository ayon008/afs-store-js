import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/actions/getBlogs";
import BlogCard from "@/Shared/Card/BlogCard";

export const metadata = {
    title: "Blog - Foiling Tips & Gear Reviews",
    description:
        "Discover foiling tips, industry information, tutorials, and expert gear reviews for riders of all experience levels.",
    openGraph: {
        title: "Blog - Foiling Tips & Gear Reviews",
        description:
            "Explore foiling tips, tutorials, and expert gear reviews for all riders.",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/blog`,
        siteName: "AFS Foiling",
        images: [
            {
                url: "/images/blogs/paraglider.png",
                width: 1200,
                height: 630,
                alt: "Foiling Tips & Blog Header",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog - Foiling Tips & Gear Reviews",
        description:
            "Discover foiling tips, tutorials, and expert gear reviews for riders of all levels.",
        images: ["/images/blogs/paraglider.png"],
    },
};



const BreadCums = () => {
    return (
        <div className='absolute top-6 z-20 global-padding uppercase'>
            <div className='font-semibold text-sm text-white/50'>
                <Link className='inline' href={'/'}>Accueil</Link> / <Link className='inline text-white' href={'/blog'}>Blog</Link>
            </div>
        </div>
    )
}


export default async function BlogPage() {
    let blogs = [];
    let error = null;

    try {
        // Fetch all posts from WordPress
        blogs = await getPosts({
            fetchAll: true, // This will fetch all posts using pagination
            orderby: 'date',
            order: 'desc'
        });
    } catch (err) {
        console.error('Error fetching blog posts:', err);
        error = err.message;
        // Fallback to empty array if WordPress is not available
        blogs = [];
    }


    return (
        <div className="min-h-screen">
            <div className="w-full global-margin relative h-[calc(100vh-139px)] max-h-[450px]">
                <Image
                    src="/images/blogs/paraglider.png"
                    alt="Paraglider"
                    fill
                    className="object-cover brightness-100"
                    quality={100}
                    priority
                />
                <BreadCums />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                    <h1 className="global-h1">Blog</h1>
                    <p className="mt-2 text-[18px] text-white font-semibold max-w-md px-6">
                        Découvrez des conseils sur le foiling, des informations sur l’industrie et des revues de matériel pour les riders de tous niveaux.
                    </p>
                </div>
            </div>

            <main className="w-full global-padding global-margin max-w-[1920px] mx-auto">
                {error && (
                    <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        <p>Error loading blog posts: {error}</p>
                        <p className="text-sm mt-2">Please check your WordPress configuration.</p>
                    </div>
                )}

                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-600 mb-4">No blog posts found</h2>
                        <p className="text-gray-500">
                            {error ? 'There was an error loading the blog posts.' : 'Check back soon for new content!'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
