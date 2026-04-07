import StructuredData from '@/components/StructuredData';
import BBoxToolPage from '@/app/bbox/PageComponent';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangBBoxPage({ params }: Props) {
  const { lang } = await params;
  const language = lang === 'zh' ? 'zh' : 'en';

  return (
    <>
      <StructuredData type="tool" language={language} slug="bbox" />
      <BBoxToolPage />
    </>
  );
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'zh' }];
}
