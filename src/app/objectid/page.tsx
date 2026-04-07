import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import ObjectIdPage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'objectid',
  ...getToolSeo('objectid', 'en'),
});

export default function ObjectIDRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="objectid" />
      <ObjectIdPage />
    </>
  );
}
