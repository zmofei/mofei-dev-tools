"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StickyTopNav } from "@mofei-dev/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BBOX_LANGUAGE_LABELS,
  BBOX_LANGUAGES,
  bboxLanguageFromPath,
  bboxLanguageLinks,
} from "@/lib/bbox-i18n";

const toolsIcon = "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z";
const blogIcon = "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z";
const githubIcon =
  "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z";

type SiteLang = "zh" | "en";

function Brand({ lang, compact = false }: { lang: SiteLang; compact?: boolean }) {
  return (
    <Link className="flex items-center gap-2 text-white" href={lang === "zh" ? "/zh" : "/"}>
      <svg className={compact ? "h-5 w-5" : "h-8 w-8"} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
      </svg>
      <span className={compact ? "text-sm font-semibold" : "text-lg font-bold"}>Mofei Dev Tools</span>
    </Link>
  );
}

function isActivePath(itemHref: string | undefined, pathname: string) {
  if (!itemHref) return false;
  if (itemHref === "/" || itemHref === "/zh") {
    return pathname === "/" || pathname === "/zh" || pathname === "/en";
  }
  const withoutLocale = pathname.replace(/^\/(zh|en)(?=\/)/, "");
  return pathname === itemHref || withoutLocale === itemHref;
}

function getLanguageHref(pathname: string, nextLang: SiteLang) {
  const segments = pathname.split("/");
  const currentLang = segments[1];

  if (currentLang === "zh" || currentLang === "en") {
    const restPath = segments.slice(2).join("/");
    if (nextLang === "en") {
      return restPath ? `/${restPath}` : "/";
    }
    return restPath ? `/zh/${restPath}` : "/zh";
  }

  if (nextLang === "zh") {
    return pathname === "/" ? "/zh" : `/zh${pathname}`;
  }

  return pathname;
}

export default function Nav() {
  const pathname = usePathname() ?? "/";
  const { language } = useLanguage();
  const [, setBboxUrlVersion] = useState(0);
  const isMiniNav = /^\/(?:(?:zh|en|de|es|fr)\/)?bbox(?:\/|$)/.test(pathname);
  const bboxLanguage = bboxLanguageFromPath(pathname);

  const items = useMemo(
    () => [
      {
        id: "tools",
        href: language === "zh" ? "/zh" : "/",
        zh: "工具箱",
        en: "Tools",
        iconPath: toolsIcon,
        isActive: isActivePath(language === "zh" ? "/zh" : "/", pathname),
      },
      {
        id: "blog",
        href: "https://www.mofei.life/",
        zh: "Mofei 的博客",
        en: "Mofei Blog",
        iconPath: blogIcon,
        external: true,
      },
      {
        id: "github",
        href: "https://github.com/zmofei/mofei-dev-tools/",
        zh: "Star & Fork",
        en: "Star & Fork",
        iconPath: githubIcon,
        external: true,
      },
    ],
    [language, pathname],
  );

  const languageLinks = useMemo(
    () => ({
      zh: getLanguageHref(pathname, "zh"),
      en: getLanguageHref(pathname, "en"),
    }),
    [pathname],
  );
  useEffect(() => {
    const refreshBboxLinks = () => setBboxUrlVersion((version) => version + 1);

    window.addEventListener("bbox-url-change", refreshBboxLinks);
    window.addEventListener("popstate", refreshBboxLinks);
    window.addEventListener("hashchange", refreshBboxLinks);

    return () => {
      window.removeEventListener("bbox-url-change", refreshBboxLinks);
      window.removeEventListener("popstate", refreshBboxLinks);
      window.removeEventListener("hashchange", refreshBboxLinks);
    };
  }, []);

  const bboxLinks = bboxLanguageLinks();

  if (isMiniNav) {
    return (
      <header className="absolute left-0 right-0 top-0 z-50 px-2 pt-2 sm:px-3">
        <div className="mx-auto flex h-10 max-w-[calc(100vw-1rem)] items-center justify-between gap-3 rounded-full border border-white/[0.1] bg-slate-950/78 px-2.5 shadow-2xl backdrop-blur-xl sm:max-w-none sm:px-3">
          <Brand lang={language} compact />
          <nav className="flex min-w-0 items-center gap-1 text-xs text-white/70">
            <Link
              href={language === "zh" ? "/zh" : "/"}
              className="inline-flex h-7 items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 font-medium transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
            >
              {language === "zh" ? "工具箱" : "Tools"}
            </Link>
            <a
              href="https://github.com/zmofei/mofei-dev-tools/"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden h-7 items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 font-medium transition-colors duration-200 hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            >
              GitHub
            </a>
            <div className="inline-flex h-7 items-center rounded-full border border-white/[0.08] bg-white/[0.035] p-0.5">
              {BBOX_LANGUAGES.map((nextLanguage) => (
                <Link
                  key={nextLanguage}
                  href={bboxLinks[nextLanguage]}
                  className={`inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 font-medium transition-colors duration-200 ${
                    bboxLanguage === nextLanguage ? "bg-white/[0.14] text-white" : "hover:bg-white/[0.06] hover:text-white"
                  }`}
                  aria-current={bboxLanguage === nextLanguage ? "page" : undefined}
                  hrefLang={nextLanguage === "zh" ? "zh-CN" : nextLanguage}
                >
                  {BBOX_LANGUAGE_LABELS[nextLanguage]}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <StickyTopNav
      lang={language}
      items={items}
      brand={<Brand lang={language} />}
      LinkComponent={Link}
      languageLinks={languageLinks}
      innerClassName="border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-xl"
    />
  );
}
