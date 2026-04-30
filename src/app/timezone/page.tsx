import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import TimezonePage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'timezone',
  ...getToolSeo('timezone', 'en'),
});

export default function TimezoneRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="timezone" />
      <TimezonePage />
    </>
  );
}
