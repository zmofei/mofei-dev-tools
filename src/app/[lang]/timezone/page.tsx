import { permanentRedirect, notFound } from 'next/navigation';
import { isSiteLanguage } from '@/lib/site';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangTimezoneRedirect({ params }: Props) {
  const { lang } = await params;
  if (!isSiteLanguage(lang)) {
    notFound();
  }

  permanentRedirect(lang === 'zh' ? '/zh/time' : '/time');
}
