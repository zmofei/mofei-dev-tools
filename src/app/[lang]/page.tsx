import HomePage from '../page';


export default function LangPage() {
  return <HomePage />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}