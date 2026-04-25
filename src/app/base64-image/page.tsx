import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import Base64ImagePage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'base64-image',
  ...getToolSeo('base64-image', 'en'),
});

export default function Base64ImageRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="base64-image" />
      <Base64ImagePage />
    </>
  );
}
