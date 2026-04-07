import StructuredData from '@/components/StructuredData';
import ObjectIdPage from '@/app/objectid/PageComponent';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangObjectIdPage({ params }: Props) {
  const { lang } = await params;
  const language = lang === 'zh' ? 'zh' : 'en';

  return (
    <>
      <StructuredData type="tool" language={language} slug="objectid" />
      <ObjectIdPage />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}
