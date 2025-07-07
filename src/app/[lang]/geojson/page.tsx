import GeoJSONPage from '../../geojson/page';


export default function LangGeoJSONPage() {
  return <GeoJSONPage />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}