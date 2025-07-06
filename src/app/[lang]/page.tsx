import HomePage from '../page';

interface PageProps {
  params: {
    lang: string;
  };
}

export default function LangPage({ params }: PageProps) {
  return <HomePage />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}