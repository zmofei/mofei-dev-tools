import Base64Page from '../../base64/page';


export default function LangBase64Page() {
  return <Base64Page />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}