import StructuredData from '@/components/StructuredData';
import CoordinateConverterPage from '../../coordinate-converter/PageComponent';
import { notFound } from 'next/navigation';
import { isSiteLanguage, SITE_LANGUAGES } from '@/lib/site';

export const dynamicParams = false;

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangCoordinateConverterPage({ params }: Props) {
  const { lang } = await params;
  if (!isSiteLanguage(lang)) {
    notFound();
  }

  return (
    <>
      <StructuredData type="tool" language={lang} slug="coordinate-converter" />
      <CoordinateConverterPage />
    </>
  );
}

export async function generateStaticParams() {
  return SITE_LANGUAGES.map((lang) => ({ lang }));
}
