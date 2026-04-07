import Link from 'next/link';
import ContributeButton from '@/components/Common/ContributeButton';
import { getHomeTools, HOME_COPY } from '@/lib/tool-content';
import type { SiteLanguage } from '@/lib/site';

export default function HomePageContent({ lang }: { lang: SiteLanguage }) {
  const content = HOME_COPY[lang];
  const tools = getHomeTools(lang);
  const categories = [
    { key: 'dev', title: content.categories.dev, tools: tools.filter((tool) => tool.category === 'dev') },
    { key: 'gis', title: content.categories.gis, tools: tools.filter((tool) => tool.category === 'gis') },
  ];

  return (
    <main className="flex-1 pt-20">
      <div className="max-w-[2000px] mx-auto">
        <div className="overflow-hidden font-extrabold px-5 md:px-10 lg:px-16">
          <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] leading-tight text-3xl mt-8 mb-4 md:text-5xl md:mt-12 md:mb-6 lg:text-6xl lg:mt-16 lg:mb-8 xl:text-7xl xl:mt-20 xl:mb-10">
            {content.title}
          </h1>

          <p className="text-gray-300/90 text-lg md:text-xl lg:text-2xl font-medium leading-relaxed tracking-wide mb-8">
            {content.subtitle}
          </p>

          <div className="flex justify-center pb-2">
            <ContributeButton variant="primary" size="lg" />
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12">
        {categories.map((category) => (
          <section key={category.key} className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-[#a1c4fd] to-[#c2e9fb] rounded-full"></div>
              {category.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {category.tools.map((tool) => (
                <Link key={tool.path} href={tool.path} className="block h-full">
                  <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-700 hover:border-[#a1c4fd]/50 h-full flex flex-col relative">
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
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-16 md:mt-20">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">{content.moreTools}</h2>
                <p className="text-gray-300">{content.moreToolsDesc}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
