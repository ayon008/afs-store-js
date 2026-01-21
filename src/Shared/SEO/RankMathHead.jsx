/**
 * Rank Math Head Component
 * 
 * Injects Rank Math JSON-LD schemas and additional meta tags
 * that cannot be handled via Next.js metadata API.
 * 
 * Usage in page.js:
 * import RankMathHead from '@/Shared/SEO/RankMathHead';
 * 
 * export default async function Page() {
 *   const rankMathData = await getRankMathHead(permalink);
 *   return (
 *     <>
 *       <RankMathHead data={rankMathData} />
 *     </>
 *   );
 * }
 */

'use client';

import { useEffect } from 'react';

export default function RankMathHead({ data }) {
  useEffect(() => {
    if (!data || !data.jsonLd || data.jsonLd.length === 0) {
      return;
    }

    // Remove existing Rank Math JSON-LD scripts to avoid duplicates
    const existingScripts = document.querySelectorAll(
      'script[type="application/ld+json"][data-rankmath]'
    );
    existingScripts.forEach(script => script.remove());

    // Inject new JSON-LD scripts
    data.jsonLd.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-rankmath', 'true');
      script.setAttribute('data-index', index.toString());
      script.textContent = JSON.stringify(schema, null, 0);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rankmath]'
      );
      scripts.forEach(script => script.remove());
    };
  }, [data]);

  // This component doesn't render anything visible
  return null;
}
