"use client";

import Link from "next/link";
import { FooterPreview, type LinkGroupItem } from "@mofei-dev/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { privacyPath } from "@/lib/site";
import ContributeButton from "./ContributeButton";

function Foot() {
  const { language } = useLanguage();
  const isZh = language === "zh";

  const navigationLinks: LinkGroupItem[] = [
    {
      label: isZh ? "工具合集" : "Tools",
      href: isZh ? "/zh" : "/",
    },
  ];

  const externalLinks: LinkGroupItem[] = [
    {
      label: isZh ? "作者博客" : "Author Blog",
      href: "https://www.mofei.life/",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      label: isZh ? "Star 项目" : "Star Project",
      href: "https://github.com/zmofei/mofei-dev-tools",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      label: isZh ? "问题反馈" : "Report Issue",
      href: "https://github.com/zmofei/mofei-dev-tools/issues/new?template=bug_report.yml",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      label: isZh ? "功能建议" : "Feature Request",
      href: "https://github.com/zmofei/mofei-dev-tools/issues/new?template=feature_request.yml",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  ];

  const metaLinks: LinkGroupItem[] = [
    {
      label: isZh ? "隐私说明" : "Privacy",
      href: privacyPath(language),
    },
    {
      label: isZh ? "提交工具想法" : "Submit Tool Idea",
      href: "https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  ];

  return (
    <FooterPreview
      lang={language}
      brand={
        <span className="text-[26px] font-semibold tracking-[-0.02em] text-white md:text-[30px]">
          Mofei Dev Tools
        </span>
      }
      tagline={{
        zh: "Mofei 日常开发中常用的小工具集合。",
        en: "Small practical tools Mofei uses in everyday development.",
      }}
      subscribeSection={<ContributeButton variant="ghost" size="sm" />}
      navigationLinks={navigationLinks}
      externalLinks={externalLinks}
      metaLinks={metaLinks}
      bottomNote={{
        zh: "免费在线使用",
        en: "Free online tools",
      }}
      copyright="© 2026 Mofei"
      LinkComponent={Link}
    />
  );
}

export default Foot;
