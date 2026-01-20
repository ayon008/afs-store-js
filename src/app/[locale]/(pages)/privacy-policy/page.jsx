import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import RankMathHead from "@/Shared/SEO/RankMathHead";
import { generateStaticPageMetadata, getStaticPageRankMathData } from "@/lib/static-page-seo";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export async function generateMetadata() {
  const locale = await getLocale();
  return generateStaticPageMetadata({
    locale,
    pathname: '/privacy-policy',
    title: {
      en: 'Privacy Policy',
      fr: 'Politique de Confidentialité',
    },
    description: {
      en: 'AFS Privacy Policy - Learn how we collect, use, and protect your personal information.',
      fr: 'Politique de Confidentialité AFS - Découvrez comment nous collectons, utilisons et protégeons vos informations personnelles.',
    },
  });
}

export default async function PrivacyPolicy() {
  const locale = await getLocale();
  const t = await getTranslations("PRIVACY POLICY");
  
  // Fetch Rank Math data for JSON-LD injection
  const rankMathData = await getStaticPageRankMathData('/privacy-policy', locale);

  return (
    <>
      {rankMathData && <RankMathHead data={rankMathData} />}
      <PrivacyPolicyClient translations={t} />
    </>
  );
}