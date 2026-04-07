import StructuredData from '@/components/StructuredData';
import GeoJSONWithRedirect from './GeoJSONWithRedirect';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangGeoJSONPage({ params }: Props) {
  const { lang } = await params;
  const language = lang === 'zh' ? 'zh' : 'en';

  return (
    <>
      <StructuredData type="tool" language={language} slug="geojson" />
      <GeoJSONWithRedirect />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}
