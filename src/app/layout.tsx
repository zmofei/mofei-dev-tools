import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import { AppBackground } from "@mofei-dev/ui";
import Nav from "@/components/Common/Nav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SITE_URL, homeUrl } from "@/lib/site";
import { BBOX_HREFLANG, isBBoxLanguage } from "@/lib/bbox-i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Mofei Dev Tools',
    default: 'Mofei Dev Tools - Free Online Development Tools',
  },
  description: "Collection of useful development tools including text Base64 conversion, GeoJSON preview, JSON formatter and more. Free online tools, no registration required, bilingual interface (English/Chinese). Mofei开发工具集合：文本 Base64 转换、GeoJSON预览、JSON格式化等实用开发工具。",
  keywords: ["开发工具", "development tools", "base64", "geojson", "json formatter", "在线工具", "online tools", "mofei", "前端工具", "web tools"],
  authors: [{ name: "Mofei", url: "https://www.mofei.life" }],
  creator: "Mofei",
  publisher: "Mofei",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'zh_CN',
    title: 'Mofei Dev Tools - Free Online Development Tools',
    description: 'Collection of useful development tools including text Base64 conversion, GeoJSON preview, JSON formatter and more. Free online tools, no registration required.',
    siteName: 'Mofei Dev Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mofei Dev Tools - Free Online Development Tools',
    description: 'Collection of useful development tools: text Base64 conversion, GeoJSON preview, JSON formatter and more.',
    creator: '@mofei',
  },

  alternates: {
    canonical: homeUrl('en'),
    languages: {
      'en-US': homeUrl('en'),
      'zh-CN': homeUrl('zh'),
    },
  },
};

function htmlLangFromPath(pathname: string) {
  const [, first] = pathname.split("/");

  if (isBBoxLanguage(first)) {
    return BBOX_HREFLANG[first];
  }

  return first === "zh" ? "zh-CN" : "en-US";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "/";
  const htmlLang = htmlLangFromPath(pathname);

  return (
    <html lang={htmlLang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <GoogleAnalytics />
        </Suspense>
        <LanguageProvider>
          <div className="relative isolate min-h-screen overflow-x-clip">
            <AppBackground />
            <Nav />
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
