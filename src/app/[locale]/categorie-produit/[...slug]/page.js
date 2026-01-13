import CategoryPage, { generateCategoryMetadata } from '../../(product-cat)/[...slug]/CategoryPage';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    return generateCategoryMetadata(slug);
}

export default async function page({ params }) {
    const { slug } = await params;
    return <CategoryPage slug={slug} />;
}
