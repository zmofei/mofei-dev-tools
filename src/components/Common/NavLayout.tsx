"use client";

import { type MouseEventHandler, type ReactNode } from "react";
import Link from "next/link";
import LogoMark from "./LogoMark";

export type SiteLang = "zh" | "en";

export type NavItem = {
  id: string;
  href?: string;
  zh: string;
  en: string;
  iconPath: string;
  external?: boolean;
  isActive?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};

type LanguageLinks = Record<SiteLang, string>;
type BBoxLanguageLink = {
  key: string;
  href: string;
  label: string;
  hrefLang: string;
  active: boolean;
};

const navBarClassName = "sticky top-0 z-50 w-full border-b border-white/[0.10] bg-white/[0.035] backdrop-blur-xl";
const navInnerClassName = "mx-auto flex h-11 max-w-[2000px] items-center justify-between gap-4 px-3 sm:px-5 2xl:px-6";
const desktopNavClassName =
  "hidden items-center gap-1.5 text-xs text-white/76 lg:flex";
const navItemBaseClassName =
  "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 font-medium transition-colors duration-200";
const mobileToggleClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.07] text-white transition-colors duration-200 hover:bg-white/[0.11] lg:hidden";

function Brand({ lang, compact = false }: { lang: SiteLang; compact?: boolean }) {
  return (
    <Link className="flex min-w-0 items-center gap-2 text-white" href={lang === "zh" ? "/zh" : "/"}>
      <LogoMark compact={compact} />
      <span className="truncate text-sm font-semibold">Mofei Dev Tools</span>
    </Link>
  );
}

function resolveRel(item: Pick<NavItem, "external">) {
  return item.external ? "noreferrer noopener" : undefined;
}

function ExternalIcon() {
  return (
    <svg className="h-3 w-3 opacity-60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  );
}

function NavItemContent({ item, label }: { item: NavItem; label: string }) {
  return (
    <>
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d={item.iconPath} />
      </svg>
      <span className={item.external ? "flex items-center gap-1" : undefined}>
        {label}
        {item.external ? <ExternalIcon /> : null}
      </span>
    </>
  );
}

function getNavItemClassName(active?: boolean) {
  return `${navItemBaseClassName} ${
    active
      ? "border-white/[0.14] bg-white/[0.11] text-white"
      : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white"
  }`;
}

function LanguageSwitch({ lang, languageLinks }: { lang: SiteLang; languageLinks: LanguageLinks }) {
  return (
    <div className="inline-flex h-7 items-center rounded-full border border-white/[0.10] bg-white/[0.055] p-0.5 text-xs font-medium text-white/76">
      {(["zh", "en"] as const).map((nextLang) => {
        const active = lang === nextLang;
        return (
          <Link
            key={nextLang}
            href={languageLinks[nextLang]}
            className={`inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 transition-colors duration-200 ${
              active ? "bg-white/[0.14] text-white" : "hover:bg-white/[0.06] hover:text-white"
            }`}
            aria-current={active ? "page" : undefined}
            hrefLang={nextLang === "zh" ? "zh-CN" : "en"}
          >
            {nextLang === "zh" ? "中" : "EN"}
          </Link>
        );
      })}
    </div>
  );
}

function MobileDrawer({
  children,
  lang,
  isOpen,
  items,
  languageLinks,
  onClose,
}: {
  children: ReactNode;
  lang: SiteLang;
  isOpen: boolean;
  items: NavItem[];
  languageLinks: LanguageLinks;
  onClose: () => void;
}) {
  return (
    <>
      {children}
      {isOpen ? (
        <>
          <div className="fixed inset-0 z-[55] bg-black/56 lg:hidden" onClick={onClose} aria-hidden="true" />
          <div
            className="fixed right-0 top-0 z-[60] flex h-full w-72 max-w-[82vw] flex-col border-l border-white/[0.10] bg-slate-950/92 px-5 pb-6 pt-16 text-white shadow-[-24px_0_64px_rgba(2,6,23,0.26)] backdrop-blur-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={lang === "zh" ? "导航菜单" : "Navigation menu"}
          >
            <button
              type="button"
              className="absolute right-4 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.07] text-white transition-colors duration-200 hover:bg-white/[0.11]"
              onClick={onClose}
              aria-label={lang === "zh" ? "关闭导航菜单" : "Close navigation menu"}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <ul className="flex flex-1 flex-col gap-2">
              {items.map((item) => {
                const label = lang === "zh" ? item.zh : item.en;
                const active = item.isActive;
                const className = `flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-base font-medium transition-colors duration-200 ${
                  active
                    ? "border-white/[0.12] bg-white/[0.12] text-white"
                    : "border-transparent text-white/88 hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-white"
                }`;
                const handleClick: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = (event) => {
                  item.onClick?.(event);
                  if (!item.external) onClose();
                };

                if (item.href) {
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={className}
                        target={item.external ? "_blank" : undefined}
                        rel={resolveRel(item)}
                        aria-current={active ? "page" : undefined}
                        onClick={handleClick}
                      >
                        <span>{label}</span>
                        <svg className={`h-5 w-5 ${active ? "opacity-100" : "opacity-60"}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d={item.iconPath} />
                        </svg>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button type="button" className={className} aria-pressed={active} onClick={handleClick}>
                      <span>{label}</span>
                      <svg className={`h-5 w-5 ${active ? "opacity-100" : "opacity-60"}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={item.iconPath} />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-white/10 pt-4">
              <LanguageSwitch lang={lang} languageLinks={languageLinks} />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export function MiniNavLayout({
  lang,
  isOpen,
  items,
  languageLinks,
  onToggle,
  onClose,
}: {
  lang: SiteLang;
  isOpen: boolean;
  items: NavItem[];
  languageLinks: LanguageLinks;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <MobileDrawer lang={lang} isOpen={isOpen} items={items} languageLinks={languageLinks} onClose={onClose}>
      <header className={navBarClassName}>
        <div className={navInnerClassName}>
          <div className="min-w-0 shrink-0">
            <Brand lang={lang} />
          </div>
          <nav className={desktopNavClassName} aria-label={lang === "zh" ? "主导航" : "Primary navigation"}>
            {items.map((item) => {
              const label = lang === "zh" ? item.zh : item.en;
              const className = getNavItemClassName(item.isActive);

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={className}
                    target={item.external ? "_blank" : undefined}
                    rel={resolveRel(item)}
                    aria-current={item.isActive ? "page" : undefined}
                  >
                    <NavItemContent item={item} label={label} />
                  </Link>
                );
              }

              return (
                <button key={item.id} type="button" className={className} aria-pressed={item.isActive} onClick={item.onClick}>
                  <NavItemContent item={item} label={label} />
                </button>
              );
            })}
            <div className="mx-1 h-4 w-px bg-white/14" />
            <LanguageSwitch lang={lang} languageLinks={languageLinks} />
          </nav>
          <button
            type="button"
            className={mobileToggleClassName}
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={lang === "zh" ? "导航菜单" : "Navigation menu"}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {isOpen ? (
                <>
                  <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M4 6H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4 14H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>
    </MobileDrawer>
  );
}

export function BBoxMiniNavLayout({
  lang,
  bboxLinks,
}: {
  lang: SiteLang;
  bboxLinks: BBoxLanguageLink[];
}) {
  return (
    <header className="absolute left-0 right-0 top-0 z-50 px-2 pt-2 sm:px-3">
      <div className="mx-auto flex h-10 max-w-[calc(100vw-1rem)] items-center justify-between gap-3 rounded-full border border-white/[0.10] bg-slate-950/78 px-2.5 shadow-2xl backdrop-blur-xl sm:max-w-none sm:px-3">
        <Brand lang={lang} compact />
        <nav className="flex min-w-0 items-center gap-1 text-xs text-white/70">
          <Link
            href={lang === "zh" ? "/zh" : "/"}
            className="inline-flex h-7 items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 font-medium transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
          >
            {lang === "zh" ? "工具箱" : "Tools"}
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
            {bboxLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 font-medium transition-colors duration-200 ${
                  item.active ? "bg-white/[0.14] text-white" : "hover:bg-white/[0.06] hover:text-white"
                }`}
                aria-current={item.active ? "page" : undefined}
                hrefLang={item.hrefLang}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
