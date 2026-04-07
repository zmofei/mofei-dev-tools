import StructuredData from '@/components/StructuredData';
import JSONExtractPage from '../../json-extract/PageComponent';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangJSONExtractPage({ params }: Props) {
  const { lang } = await params;
  const language = lang === 'zh' ? 'zh' : 'en';

  return (
    <>
      <StructuredData type="tool" language={language} slug="json-extract" />
      <JSONExtractPage />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}
