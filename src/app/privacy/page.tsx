import type { Metadata } from 'next';
import Foot from '@/components/Common/Foot';
import PrivacyPageContent from '@/components/PrivacyPageContent';
import { privacyUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy | Mofei Dev Tools',
  description:
    'Privacy information for Mofei Dev Tools, including Google Analytics, local browser processing, share links, and GitHub features.',
  alternates: {
    canonical: privacyUrl('en'),
    languages: {
      'en-US': privacyUrl('en'),
      'zh-CN': privacyUrl('zh'),
      'x-default': privacyUrl('en'),
    },
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PrivacyPageContent lang="en" />
      <footer>
        <Foot />
      </footer>
    </div>
  );
}
