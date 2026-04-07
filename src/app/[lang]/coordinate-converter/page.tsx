import StructuredData from '@/components/StructuredData';
import CoordinateConverterPage from '../../coordinate-converter/PageComponent';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangCoordinateConverterPage({ params }: Props) {
  const { lang } = await params;
  const language = lang === 'zh' ? 'zh' : 'en';

  return (
    <>
      <StructuredData type="tool" language={language} slug="coordinate-converter" />
      <CoordinateConverterPage />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}
