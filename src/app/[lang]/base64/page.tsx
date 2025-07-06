import Base64Page from '../../base64/page';

interface PageProps {
  params: {
    lang: string;
  };
}

export default function LangBase64Page({ params }: PageProps) {
  return <Base64Page />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}