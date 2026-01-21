/** @type {import('next').NextConfig} */


import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'afs-foiling.com',
      },
      {
        protocol: 'https',
        hostname: 'staging.afs-foiling.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'fast.afs-foiling.fr',
      },
      {
        protocol: 'https',
        hostname: 'symphonious-entremet-0885e2.netlify.app',
      },
    ],
  },
  async rewrites() {
    return [
      // Rediriger /en/wc-api/wc_gateway_monetico vers /fr/wc-api/wc_gateway_monetico
      {
        source: '/en/wc-api/wc_gateway_monetico',
        destination: '/fr/wc-api/wc_gateway_monetico',
      },
      // Rediriger /wc-api/wc_gateway_monetico (sans préfixe) vers /fr/wc-api/wc_gateway_monetico
      {
        source: '/wc-api/wc_gateway_monetico',
        destination: '/fr/wc-api/wc_gateway_monetico',
      },
    ];
  },
  async redirects() {
    return [
      // Rediriger /fr/product-category/* vers /fr/categorie-produit/*
      {
        source: '/fr/product-category/:path*',
        destination: '/fr/categorie-produit/:path*',
        permanent: true,
      },
    ];
  },
};


export default withNextIntl(nextConfig);
