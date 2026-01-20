/**
 * Sitemap Generator Core
 * 
 * Core functions to generate sitemap entries
 * Used by both the main sitemap and paginated sitemaps
 */

import { getAllProducts, getAllCategories, getAllBlogPosts, getProductUrl, getCategoryUrl, getBlogPostUrl } from '@/lib/sitemap-helpers';

// Use production URL for sitemap (always use production domain, not staging)
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.includes('staging.afs-foiling.com')) {
    return envUrl.replace('staging.afs-foiling.com', 'afs-foiling.com');
  }
  return envUrl || 'https://afs-foiling.com';
};

export const BASE_URL = getBaseUrl();

/**
 * Generate static pages entries
 */
export function generateStaticPages() {
  const staticPages = [
    // Homepage
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          en: BASE_URL,
          fr: `${BASE_URL}/fr`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          en: BASE_URL,
          fr: `${BASE_URL}/fr`,
        },
      },
    },
    // Blog list
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/blog`,
          fr: `${BASE_URL}/fr/blog`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}/blog`,
          fr: `${BASE_URL}/fr/blog`,
        },
      },
    },
    // Support
    {
      url: `${BASE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${BASE_URL}/support`,
          fr: `${BASE_URL}/fr/support`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${BASE_URL}/support`,
          fr: `${BASE_URL}/fr/support`,
        },
      },
    },
    // Privacy Policy
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${BASE_URL}/privacy-policy`,
          fr: `${BASE_URL}/fr/privacy-policy`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${BASE_URL}/privacy-policy`,
          fr: `${BASE_URL}/fr/privacy-policy`,
        },
      },
    },
    // Legal Notice
    {
      url: `${BASE_URL}/legal-notice`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${BASE_URL}/legal-notice`,
          fr: `${BASE_URL}/fr/legal-notice`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/legal-notice`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${BASE_URL}/legal-notice`,
          fr: `${BASE_URL}/fr/legal-notice`,
        },
      },
    },
    // Marketing pages
    {
      url: `${BASE_URL}/afs-team`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/afs-team`,
          fr: `${BASE_URL}/fr/afs-team`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/afs-team`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/afs-team`,
          fr: `${BASE_URL}/fr/afs-team`,
        },
      },
    },
    {
      url: `${BASE_URL}/afs-ambassadors`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/afs-ambassadors`,
          fr: `${BASE_URL}/fr/afs-ambassadors`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/afs-ambassadors`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/afs-ambassadors`,
          fr: `${BASE_URL}/fr/afs-ambassadors`,
        },
      },
    },
    {
      url: `${BASE_URL}/afs-events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/afs-events`,
          fr: `${BASE_URL}/fr/afs-events`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/afs-events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/afs-events`,
          fr: `${BASE_URL}/fr/afs-events`,
        },
      },
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${BASE_URL}/map`,
          fr: `${BASE_URL}/fr/map`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/map`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          en: `${BASE_URL}/map`,
          fr: `${BASE_URL}/fr/map`,
        },
      },
    },
  ];

  return staticPages;
}

/**
 * Generate product entries with translations
 * OPTIMIZED: Limit products processed and reduce API calls
 */
export async function generateProductEntries() {
  const entries = [];
  const MAX_PRODUCTS = 500;
  
  try {
    const fetchPromise = Promise.all([
      getAllProducts('en'),
      getAllProducts('fr'),
    ]);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Product fetch timeout')), 20000)
    );
    
    const [enProducts, frProducts] = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]).catch(() => {
      console.warn('[Sitemap] Product fetch timeout or error, skipping products');
      return [[], []];
    });

    const limitedEnProducts = enProducts.slice(0, MAX_PRODUCTS);
    const limitedFrProducts = frProducts.slice(0, MAX_PRODUCTS);

    const enProductMap = new Map(limitedEnProducts.map(p => [p.id, p]));
    const frProductMap = new Map(limitedFrProducts.map(p => [p.id, p]));

    const allProductIds = Array.from(new Set([
      ...limitedEnProducts.map(p => p.id), 
      ...limitedFrProducts.map(p => p.id)
    ])).slice(0, MAX_PRODUCTS);

    for (const productId of allProductIds) {
      const enProduct = enProductMap.get(productId);
      const frProduct = frProductMap.get(productId);

      if (enProduct && frProduct && enProduct.slug && frProduct.slug) {
        const enUrl = getProductUrl(enProduct.slug, 'en');
        const frUrl = getProductUrl(frProduct.slug, 'fr');

        entries.push({
          url: `${BASE_URL}${enUrl}`,
          lastModified: enProduct.date_modified ? new Date(enProduct.date_modified) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: {
              en: `${BASE_URL}${enUrl}`,
              fr: `${BASE_URL}${frUrl}`,
            },
          },
        });

        if (enProduct.slug !== frProduct.slug) {
          entries.push({
            url: `${BASE_URL}${frUrl}`,
            lastModified: frProduct.date_modified ? new Date(frProduct.date_modified) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
            alternates: {
              languages: {
                en: `${BASE_URL}${enUrl}`,
                fr: `${BASE_URL}${frUrl}`,
              },
            },
          });
        }
      } else if (enProduct && enProduct.slug) {
        const enUrl = getProductUrl(enProduct.slug, 'en');
        entries.push({
          url: `${BASE_URL}${enUrl}`,
          lastModified: enProduct.date_modified ? new Date(enProduct.date_modified) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: {
              en: `${BASE_URL}${enUrl}`,
            },
          },
        });
      } else if (frProduct && frProduct.slug) {
        const frUrl = getProductUrl(frProduct.slug, 'fr');
        entries.push({
          url: `${BASE_URL}${frUrl}`,
          lastModified: frProduct.date_modified ? new Date(frProduct.date_modified) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: {
              fr: `${BASE_URL}${frUrl}`,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('[Sitemap] Error generating product entries:', error);
  }

  return entries;
}

/**
 * Generate category entries with translations
 */
export async function generateCategoryEntries() {
  const entries = [];
  
  try {
    const fetchPromise = Promise.all([
      getAllCategories('en'),
      getAllCategories('fr'),
    ]);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Category fetch timeout')), 15000)
    );
    
    const [enCategories, frCategories] = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]).catch(() => {
      console.warn('[Sitemap] Category fetch timeout or error, skipping categories');
      return [[], []];
    });

    const enCategoryMap = new Map(enCategories.map(c => [c.id, c]));
    const frCategoryMap = new Map(frCategories.map(c => [c.id, c]));

    const allCategoryIds = new Set([...enCategories.map(c => c.id), ...frCategories.map(c => c.id)]);

    for (const categoryId of allCategoryIds) {
      const enCategory = enCategoryMap.get(categoryId);
      const frCategory = frCategoryMap.get(categoryId);

      if (enCategory && frCategory && enCategory.slug && frCategory.slug) {
        const enUrl = getCategoryUrl(enCategory.slug, 'en');
        const frUrl = getCategoryUrl(frCategory.slug, 'fr');

        entries.push({
          url: `${BASE_URL}${enUrl}`,
          lastModified: enCategory.date_modified ? new Date(enCategory.date_modified) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              en: `${BASE_URL}${enUrl}`,
              fr: `${BASE_URL}${frUrl}`,
            },
          },
        });

        if (enCategory.slug !== frCategory.slug) {
          entries.push({
            url: `${BASE_URL}${frUrl}`,
            lastModified: frCategory.date_modified ? new Date(frCategory.date_modified) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
              languages: {
                en: `${BASE_URL}${enUrl}`,
                fr: `${BASE_URL}${frUrl}`,
              },
            },
          });
        }
      } else if (enCategory && enCategory.slug) {
        const enUrl = getCategoryUrl(enCategory.slug, 'en');
        entries.push({
          url: `${BASE_URL}${enUrl}`,
          lastModified: enCategory.date_modified ? new Date(enCategory.date_modified) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              en: `${BASE_URL}${enUrl}`,
            },
          },
        });
      } else if (frCategory && frCategory.slug) {
        const frUrl = getCategoryUrl(frCategory.slug, 'fr');
        entries.push({
          url: `${BASE_URL}${frUrl}`,
          lastModified: frCategory.date_modified ? new Date(frCategory.date_modified) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              fr: `${BASE_URL}${frUrl}`,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('[Sitemap] Error generating category entries:', error);
  }

  return entries;
}

/**
 * Generate blog post entries
 */
export async function generateBlogPostEntries() {
  const entries = [];
  
  try {
    const fetchPromise = Promise.all([
      getAllBlogPosts('en'),
      getAllBlogPosts('fr'),
    ]);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Blog fetch timeout')), 15000)
    );
    
    const [enPosts, frPosts] = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]).catch(() => {
      console.warn('[Sitemap] Blog post fetch timeout or error, skipping blog posts');
      return [[], []];
    });

    for (const post of enPosts) {
      if (post.slug) {
        const enUrl = getBlogPostUrl(post.slug, 'en');
        entries.push({
          url: `${BASE_URL}${enUrl}`,
          lastModified: post.modified ? new Date(post.modified) : new Date(post.date),
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: {
            languages: {
              en: `${BASE_URL}${enUrl}`,
            },
          },
        });
      }
    }

    for (const post of frPosts) {
      if (post.slug) {
        const frUrl = getBlogPostUrl(post.slug, 'fr');
        entries.push({
          url: `${BASE_URL}${frUrl}`,
          lastModified: post.modified ? new Date(post.modified) : new Date(post.date),
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: {
            languages: {
              fr: `${BASE_URL}${frUrl}`,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('[Sitemap] Error generating blog post entries:', error);
  }

  return entries;
}

/**
 * Generate all URLs for sitemap
 */
export async function generateAllUrls() {
  try {
    const urls = [];

    // 1. Static pages (always include these)
    urls.push(...generateStaticPages());

    // Generate dynamic entries in parallel with overall timeout
    const dynamicEntriesPromise = Promise.all([
      generateProductEntries(),
      generateCategoryEntries(),
      generateBlogPostEntries(),
    ]);

    const overallTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sitemap generation timeout')), 30000)
    );

    try {
      const [productEntries, categoryEntries, blogEntries] = await Promise.race([
        dynamicEntriesPromise,
        overallTimeout,
      ]);

      // 2. Products (with translations)
      urls.push(...productEntries);

      // 3. Categories (with translations)
      urls.push(...categoryEntries);

      // 4. Blog posts
      urls.push(...blogEntries);
    } catch (timeoutError) {
      console.warn('[Sitemap] Timeout generating dynamic entries, using static pages only');
    }

    // Remove duplicates
    const uniqueUrls = Array.from(
      new Map(urls.map(item => [item.url, item])).values()
    );

    return uniqueUrls;
  } catch (error) {
    console.error('[Sitemap] Error generating all URLs:', error);
    // Return at least static pages if there's an error
    return generateStaticPages();
  }
}
