import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import GeoJSONPage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'geojson',
  ...getToolSeo('geojson', 'en'),
});

export default function GeoJSONRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="geojson" />
      <GeoJSONPage />
    </>
  );
}
