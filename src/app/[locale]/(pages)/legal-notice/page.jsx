import { getTranslations, getLocale } from "next-intl/server";
import RankMathHead from "@/Shared/SEO/RankMathHead";
import { generateStaticPageMetadata, getStaticPageRankMathData } from "@/lib/static-page-seo";
import LegalNoticeClient from "./LegalNoticeClient";

export async function generateMetadata() {
  const locale = await getLocale();
  return generateStaticPageMetadata({
    locale,
    pathname: '/legal-notice',
    title: {
      en: 'Legal Notice',
      fr: 'Mentions Légales',
    },
    description: {
      en: 'AFS Legal Notice - Company information, terms of use, and legal details.',
      fr: 'Mentions Légales AFS - Informations sur l\'entreprise, conditions d\'utilisation et détails légaux.',
    },
  });
}

export default async function LegalNotice() {
  const locale = await getLocale();
  const t = await getTranslations("legal");
  
  // Fetch Rank Math data for JSON-LD injection
  const rankMathData = await getStaticPageRankMathData('/legal-notice', locale);

  return (
    <>
      {rankMathData && <RankMathHead data={rankMathData} />}
      <LegalNoticeClient translations={t} />
    </>
  );
}
