import { GlassPanel, PrimaryPillLink, SectionLabel } from '@mofei-dev/ui';
import type { SiteLanguage } from '@/lib/site';
import { homePath } from '@/lib/site';

const privacyCopy = {
  en: {
    label: 'PRIVACY',
    title: 'Privacy',
    updated: 'Last updated: April 24, 2026',
    intro:
      'Mofei Dev Tools is a free collection of small development tools. This page explains what data may be processed when you use the site.',
    back: 'Back to tools',
    sections: [
      {
        title: 'Google Analytics',
        body:
          'This site uses Google Analytics to understand aggregate usage, such as which tools are opened and which pages are useful. Analytics helps decide what to maintain and improve for this free project.',
      },
      {
        title: 'Tool input data',
        body:
          'Most tool input is processed in your browser. For example, text Base64 conversion does not intentionally upload your input to this site server.',
      },
      {
        title: 'Share links',
        body:
          'If you use a share feature, the content needed to reproduce the result may be encoded into the URL. Anyone with that URL may be able to see the shared content.',
      },
      {
        title: 'GitHub features',
        body:
          'Some tools may offer GitHub-based features, such as creating a Gist or using GitHub authentication. If you choose to use those features, the relevant data is handled by GitHub according to GitHub policies.',
      },
      {
        title: 'What is not sold',
        body:
          'This project does not sell personal data. It does not use advertising tracking or paid user profiling.',
      },
    ],
  },
  zh: {
    label: '隐私说明',
    title: '隐私说明',
    updated: '最后更新：2026 年 4 月 24 日',
    intro:
      'Mofei Dev Tools 是一个免费的开发小工具集合。这里说明你使用本站时，哪些数据可能会被处理。',
    back: '返回工具集',
    sections: [
      {
        title: 'Google Analytics',
        body:
          '本站使用 Google Analytics 了解整体访问情况，例如哪些工具被打开、哪些页面更有用。这些统计用于判断这个免费项目应该维护和改进哪些部分。',
      },
      {
        title: '工具输入内容',
        body:
          '大多数工具输入都在你的浏览器本地处理。例如，文本 Base64 转换不会主动把你的输入上传到本站服务器。',
      },
      {
        title: '分享链接',
        body:
          '如果你使用分享功能，为了复现结果，相关内容可能会被编码到 URL 中。任何拿到该链接的人都可能看到被分享的内容。',
      },
      {
        title: 'GitHub 相关功能',
        body:
          '部分工具可能提供 GitHub 相关功能，例如创建 Gist 或使用 GitHub 登录。如果你选择使用这些功能，相关数据会按 GitHub 的机制和政策处理。',
      },
      {
        title: '不会出售个人数据',
        body:
          '本站不会出售个人数据，也不使用广告追踪或付费用户画像。',
      },
    ],
  },
} as const;

export default function PrivacyPageContent({ lang }: { lang: SiteLanguage }) {
  const copy = privacyCopy[lang];

  return (
    <main className="flex-1 pt-20">
      <section className="mx-auto max-w-[2000px] px-5 pb-10 pt-12 md:px-10 md:pb-14 md:pt-16 lg:px-16 lg:pb-16 lg:pt-24">
        <div className="max-w-5xl">
          <PrimaryPillLink href={homePath(lang)} className="min-h-10 transform-none px-4 text-sm hover:translate-x-0 hover:translate-y-0">
            <span aria-hidden="true">←</span>
            {copy.back}
          </PrimaryPillLink>

          <SectionLabel className="mt-8">{copy.label}</SectionLabel>
          <h1 className="mt-5 max-w-4xl text-[40px] font-semibold leading-[0.98] tracking-[-0.02em] text-white md:text-[58px] lg:text-[68px]">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg md:leading-9">
            {copy.intro}
          </p>
          <p className="mt-4 text-sm text-white/42">{copy.updated}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[2000px] px-5 pb-14 md:px-10 lg:px-16 lg:pb-20">
        <GlassPanel className="max-w-5xl transform-none p-5 hover:translate-y-0 md:p-7">
          <div className="space-y-7">
            {copy.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-semibold text-white">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-white/62 md:text-base md:leading-8">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </GlassPanel>
      </section>
    </main>
  );
}
