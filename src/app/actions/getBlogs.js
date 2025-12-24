"use server"

import { getLocale } from "next-intl/server";

export async function getPosts(options = {}) {
    const WP_BASE_URL = process.env.WP_BASE_URL;

    if (!WP_BASE_URL) {
        throw new Error('WP_BASE_URL not configured');
    }

    const {
        per_page = 10,
        page = 1,
        orderby = 'date',
        order = 'desc',
        categories,
        search,
        fetchAll = false,
        locale: providedLocale,
        ...otherParams
    } = options;

    try {
        // Try to get locale value, but fallback to empty string if called outside request scope (e.g., during build)
        let localeValue = providedLocale;
        if (localeValue === undefined) {
            try {
                localeValue = await getLocale();
            } catch (error) {
                // If getLocale fails (e.g., during build), default to empty string (en locale)
                console.warn('[getPosts] Could not get locale, defaulting to empty string:', error.message);
                localeValue = '';
            }
        }
        const localePath = localeValue === 'en' ? '' : localeValue;
        const baseUrl = `${WP_BASE_URL.replace(/\/$/, '')}${localePath ? `/${localePath}` : ''}`;
        const apiUrl = `${baseUrl}/wp-json/wp/v2/posts`;

        // If fetchAll is true, we'll paginate through all posts
        if (fetchAll) {
            let allPosts = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const params = new URLSearchParams({
                    per_page: '100', // WordPress max per page
                    page: currentPage.toString(),
                    orderby,
                    order,
                    _embed: 'true',
                    ...otherParams
                });

                if (categories && categories.length > 0) {
                    params.append('categories', categories.join(','));
                }

                if (search) {
                    params.append('search', search);
                }

                const url = `${apiUrl}?${params.toString()}`;
                console.log(`[getPosts] Fetching page ${currentPage}: ${url}`);

                const response = await fetch(url, {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    console.error('[getPosts] WordPress API error', response.status, errorText);
                    throw new Error(`WordPress API error ${response.status}: ${errorText}`);
                }

                const posts = await response.json();
                allPosts = allPosts.concat(posts);

                // Check if there are more pages
                const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
                hasMorePages = currentPage < totalPages;
                currentPage++;

                console.log(`[getPosts] Page ${currentPage - 1}: ${posts.length} posts, Total pages: ${totalPages}`);
            }

            console.log(`[getPosts] Successfully fetched all ${allPosts.length} posts`);
            return transformPosts(allPosts);
        }

        // Single page fetch
        const params = new URLSearchParams({
            per_page: per_page.toString(),
            page: page.toString(),
            orderby,
            order,
            _embed: 'true',
            ...otherParams
        });

        if (categories && categories.length > 0) {
            params.append('categories', categories.join(','));
        }

        if (search) {
            params.append('search', search);
        }

        const url = `${apiUrl}?${params.toString()}`;

        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('[getPosts] WordPress API error', response.status, errorText);
            throw new Error(`WordPress API error ${response.status}: ${errorText}`);
        }

        const posts = await response.json();

        return transformPosts(posts);

    } catch (error) {
        console.error('[getPosts] Error fetching posts:', error);
        throw error;
    }
}

/**
 * Transform WordPress posts to the expected format
 * @param {Array} posts - Array of WordPress post objects
 * @returns {Array} Transformed posts
 */
function transformPosts(posts) {
    return posts.map(post => {
        // Extract featured image URL
        let imageUrl = '/images/blogs/paraglider.png'; // fallback image
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? imageUrl;
        } else if (post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url) {
            imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url ?? imageUrl;
        }

        // Clean and format excerpt (remove HTML tags)
        const cleanExcerpt = post.excerpt.rendered
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .trim();

        // Format date to match dummy blog format
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();

        return {
            id: post.id,
            title: post.title.rendered,
            description: cleanExcerpt,
            date: formattedDate,
            slug: post.slug,
            imageUrl: imageUrl,
            // Additional WordPress-specific fields
            excerpt: post.excerpt.rendered,
            content: post.content.rendered,
            fullDescription: post.content.rendered, // Map content to fullDescription for compatibility
            modified: post.modified,
            link: post.link,
            author: post._embedded?.author?.[0] || null,
            featuredMedia: post._embedded?.['wp:featuredmedia']?.[0] || null,
            categories: post._embedded?.['wp:term']?.[0] || [],
            tags: post._embedded?.['wp:term']?.[1] || [],
            status: post.status,
            commentStatus: post.comment_status,
            pingStatus: post.ping_status,
            sticky: post.sticky,
            template: post.template,
            format: post.format,
            meta: post.meta,
            // Original post object for any additional data needed
            _original: post
        };
    });
}

/**
 * Get a single WordPress post by ID or slug
 * @param {number|string} identifier - Post ID or slug
 * @param {boolean} bySlug - Whether the identifier is a slug (default: false)
 * @returns {Promise<Object>} Post object
 */
export async function getPost(identifier, bySlug = false) {
    const WP_BASE_URL = process.env.WP_BASE_URL;
    
    if (!WP_BASE_URL) {
        throw new Error('WP_BASE_URL not configured');
    }

    try {
        const baseUrl = WP_BASE_URL.replace(/\/$/, '');
        let apiUrl;

        if (bySlug) {
            apiUrl = `${baseUrl}/wp-json/wp/v2/posts?slug=${identifier}&_embed=true`;
        } else {
            apiUrl = `${baseUrl}/wp-json/wp/v2/posts/${identifier}?_embed=true`;
        }

        console.log(`[getPost] Fetching: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('[getPost] WordPress API error', response.status, errorText);
            throw new Error(`WordPress API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const post = bySlug ? data[0] : data;

        if (!post) {
            throw new Error(`Post not found: ${identifier}`);
        }

        // Transform the WordPress post data
        let imageUrl = '/images/blogs/paraglider.png'; // fallback image
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? imageUrl;
        } else if (post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url) {
            imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url ?? imageUrl;
        }

        // Clean and format excerpt (remove HTML tags)
        const cleanExcerpt = post.excerpt.rendered
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .trim();

        // Format date to match dummy blog format
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();

        return {
            id: post.id,
            title: post.title.rendered,
            description: cleanExcerpt,
            date: formattedDate,
            slug: post.slug,
            imageUrl: imageUrl,
            // Additional WordPress-specific fields
            excerpt: post.excerpt.rendered,
            content: post.content.rendered,
            fullDescription: post.content.rendered, // Map content to fullDescription for compatibility
            modified: post.modified,
            link: post.link,
            author: post._embedded?.author?.[0] || null,
            featuredMedia: post._embedded?.['wp:featuredmedia']?.[0] || null,
            categories: post._embedded?.['wp:term']?.[0] || [],
            tags: post._embedded?.['wp:term']?.[1] || [],
            status: post.status,
            commentStatus: post.comment_status,
            pingStatus: post.ping_status,
            sticky: post.sticky,
            template: post.template,
            format: post.format,
            meta: post.meta,
            _original: post
        };

    } catch (error) {
        console.error('[getPost] Error fetching post:', error);
        throw error;
    }
}

/**
 * Get WordPress categories
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategories(options = {}, fetchOpts = { next: { revalidate: 60 } }) {
    const WP_BASE_URL = process.env.WP_BASE_URL;
    
    if (!WP_BASE_URL) {
        throw new Error('WP_BASE_URL not configured');
    }

    try {
        const baseUrl = WP_BASE_URL.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/wp-json/wp/v2/categories`;

        const params = new URLSearchParams({
            per_page: '100', // Get all categories
            orderby: 'name',
            order: 'asc',
            ...options
        });

        const url = `${apiUrl}?${params.toString()}`;
        console.log(`[getCategories] Fetching: ${url}`);

        // Default to an ISR-friendly cache policy so this function is safe to use
        // during build-time/static prerendering (generateStaticParams).
        const response = await fetch(url, {
            // Allow callers to override by passing fetchOpts
            ...fetchOpts,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('[getCategories] WordPress API error', response.status, errorText);
            throw new Error(`WordPress API error ${response.status}: ${errorText}`);
        }

        const categories = await response.json();
        console.log(`[getCategories] Successfully fetched ${categories.length} categories`);

        return categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            link: category.link,
            count: category.count,
            parent: category.parent,
            _original: category
        }));

    } catch (error) {
        console.error('[getCategories] Error fetching categories:', error);
        throw error;
    }
}