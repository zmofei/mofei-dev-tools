import StructuredData from '@/components/StructuredData';
import Base64Page from '../../base64/PageComponent';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangBase64Page({ params }: Props) {
  const { lang } = await params;
  const language = lang === 'zh' ? 'zh' : 'en';

  return (
    <>
      <StructuredData type="tool" language={language} slug="base64" />
      <Base64Page />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}
