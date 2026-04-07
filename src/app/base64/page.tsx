import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import Base64Page from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'base64',
  ...getToolSeo('base64', 'en'),
});

export default function Base64Root() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="base64" />
      <Base64Page />
    </>
  );
}
