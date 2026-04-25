"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { privacyPath } from "@/lib/site";
import LogoMark from "./LogoMark";

type FooterLink = {
  label: string;
  href: string;
  target?: string;
  rel?: string;
};

const footerClassName = "border-t border-white/[0.10] bg-white/[0.035] backdrop-blur-xl";
const footerInnerClassName =
  "mx-auto flex max-w-[2000px] flex-col gap-2 px-3 py-3 text-xs leading-5 text-white/56 sm:px-5 md:h-11 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0 2xl:px-6";
const footerLinkClassName =
  "rounded-full px-1.5 py-0.5 font-medium transition-colors duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";
const footerPillLinkClassName =
  "inline-flex h-7 items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 font-medium text-white/76 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

function Foot() {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const homeHref = isZh ? "/zh" : "/";
  const currentYear = new Date().getFullYear();
  const copyrightYear = currentYear <= 2025 ? "2025" : `2025-${currentYear}`;

  const footerLinks: FooterLink[] = [
    {
      label: isZh ? "工具合集" : "Tools",
      href: homeHref,
    },
    {
      label: isZh ? "作者博客" : "Author Blog",
      href: "https://www.mofei.life/",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      label: "GitHub",
      href: "https://github.com/zmofei/mofei-dev-tools",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      label: isZh ? "反馈" : "Feedback",
      href: "https://github.com/zmofei/mofei-dev-tools/issues/new?template=bug_report.yml",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      label: isZh ? "隐私说明" : "Privacy",
      href: privacyPath(language),
    },
  ];

  return (
    <div className={footerClassName}>
      <div className={footerInnerClassName}>
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            className="flex min-w-0 items-center gap-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            href={homeHref}
            aria-label="Mofei Dev Tools"
          >
            <LogoMark compact />
            <span className="truncate text-sm font-semibold">Mofei Dev Tools</span>
          </Link>
          <span className="hidden h-4 w-px shrink-0 bg-white/12 sm:block" aria-hidden="true" />
          <span className="hidden truncate text-white/46 sm:block">Made with care in Helsinki ❤️</span>
        </div>

        <nav
          className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-white/58 md:justify-end"
          aria-label={isZh ? "页脚链接" : "Footer links"}
        >
          <span className="mr-1 whitespace-nowrap text-white/42">© {copyrightYear} Mofei</span>
          {footerLinks.map((item) => (
            <Link key={item.label} className={footerLinkClassName} href={item.href} target={item.target} rel={item.rel}>
              {item.label}
            </Link>
          ))}
          <Link
            className={footerPillLinkClassName}
            href="https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas"
            target="_blank"
            rel="noopener noreferrer"
          >
            {isZh ? "提交想法" : "Submit idea"}
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Foot;
