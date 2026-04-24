import StructuredData from '@/components/StructuredData';
import BBoxToolPage from '@/app/bbox/PageComponent';
import { notFound } from 'next/navigation';
import { BBOX_LANGUAGES, isBBoxLanguage } from '@/lib/bbox-i18n';

export const dynamicParams = false;

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangBBoxPage({ params }: Props) {
  const { lang } = await params;
  if (!isBBoxLanguage(lang)) {
    notFound();
  }

  return (
    <>
      <StructuredData type="tool" language={lang} slug="bbox" />
      <BBoxToolPage language={lang} />
    </>
  );
}

export async function generateStaticParams() {
  return BBOX_LANGUAGES.map((lang) => ({ lang }));
}
