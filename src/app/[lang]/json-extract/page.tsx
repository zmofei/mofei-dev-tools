import StructuredData from '@/components/StructuredData';
import JSONExtractPage from '../../json-extract/PageComponent';
import { notFound } from 'next/navigation';
import { isSiteLanguage, SITE_LANGUAGES } from '@/lib/site';

export const dynamicParams = false;

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangJSONExtractPage({ params }: Props) {
  const { lang } = await params;
  if (!isSiteLanguage(lang)) {
    notFound();
  }

  return (
    <>
      <StructuredData type="tool" language={lang} slug="json-extract" />
      <JSONExtractPage />
    </>
  );
}

export async function generateStaticParams() {
  return SITE_LANGUAGES.map((lang) => ({ lang }));
}
