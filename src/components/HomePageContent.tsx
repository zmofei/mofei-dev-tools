import Link from 'next/link';
import { GlassPanel, PrimaryPillLink, SectionLabel } from '@mofei-dev/ui';
import { getHomeTools, HOME_COPY } from '@/lib/tool-content';
import type { SiteLanguage } from '@/lib/site';

export default function HomePageContent({ lang }: { lang: SiteLanguage }) {
  const content = HOME_COPY[lang];
  const tools = getHomeTools(lang);
  const categories = [
    { key: 'dev', title: content.categories.dev, tools: tools.filter((tool) => tool.category === 'dev') },
    { key: 'productivity', title: content.categories.productivity, tools: tools.filter((tool) => tool.category === 'productivity') },
    { key: 'gis', title: content.categories.gis, tools: tools.filter((tool) => tool.category === 'gis') },
  ];

  return (
    <main className="flex-1 pt-6">
      <section className="mx-auto max-w-[2000px] px-5 pb-10 pt-6 md:px-10 md:pb-14 md:pt-8 lg:px-16 lg:pb-16 lg:pt-10">
        <div className="max-w-5xl">
          <SectionLabel className="mb-5">MOFEI DEV TOOLS</SectionLabel>
          <h1 className="max-w-4xl text-[40px] font-semibold leading-[0.98] tracking-[-0.02em] text-white md:text-[64px] lg:text-[78px]">
            {content.title}
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg md:leading-9">
            {content.subtitle}
          </p>

        </div>
      </section>

      <div id="tools-list" className="max-w-[2000px] mx-auto scroll-mt-24 px-5 md:px-10 lg:px-16 pb-6 pt-2 md:pb-8 lg:pb-12">
        {categories.map((category) => (
          <section key={category.key} id={`${category.key}-tools`} className="mb-12 scroll-mt-24 md:mb-16">
            <div className="mb-6 flex items-center gap-3 md:mb-8">
              <SectionLabel>{category.title}</SectionLabel>
              <span className="h-px flex-1 bg-gradient-to-r from-white/12 to-transparent" />
              <h2 className="sr-only">
              {category.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:gap-6">
              {category.tools.map((tool) => (
                <Link key={tool.path} href={tool.path} className="block h-full">
                  <GlassPanel className="relative flex h-full transform-none flex-col p-5 hover:translate-y-0 md:p-6 xl:p-5">
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] flex items-center justify-center flex-shrink-0 text-2xl mb-3">
                        {tool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-white mb-1">{tool.name}</h3>
                        <p className="text-sm text-gray-400">{tool.categoryLabel}</p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed flex-1 text-center">
                      {tool.description}
                    </p>
                  </GlassPanel>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-16 md:mt-20">
          <GlassPanel className="transform-none p-6 hover:translate-y-0 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">{content.moreTools}</h2>
                <p className="text-gray-300">{content.moreToolsDesc}</p>
                <div className="mt-5">
                  <PrimaryPillLink
                    href="https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas"
                    className="transform-none hover:translate-x-0 hover:translate-y-0"
                  >
                    <span aria-hidden="true">💡</span>
                    {content.submitIdea}
                    <span aria-hidden="true">→</span>
                  </PrimaryPillLink>
                </div>
              </div>
            </div>
          </GlassPanel>
        </section>
      </div>
    </main>
  );
}
