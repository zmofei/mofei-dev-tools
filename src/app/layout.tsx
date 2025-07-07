import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Nav from "@/components/Common/Nav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";
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
  title: {
    template: '%s | Mofei Dev Tools',
    default: 'Mofei Dev Tools - Free Online Development Tools',
  },
  description: "Collection of useful development tools including Base64 encoder/decoder, GeoJSON preview, JSON formatter and more. Free online tools, no registration required, bilingual interface (English/Chinese). Mofei开发工具集合：Base64编解码、GeoJSON预览、JSON格式化等实用开发工具。",
  keywords: ["开发工具", "development tools", "base64", "geojson", "json formatter", "在线工具", "online tools", "mofei", "前端工具", "web tools"],
  authors: [{ name: "Mofei", url: "https://mofei.life" }],
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
    description: 'Collection of useful development tools including Base64 encoder/decoder, GeoJSON preview, JSON formatter and more. Free online tools, no registration required.',
    siteName: 'Mofei Dev Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mofei Dev Tools - Free Online Development Tools',
    description: 'Collection of useful development tools: Base64 encoder/decoder, GeoJSON preview, JSON formatter and more.',
    creator: '@mofei',
  },
  verification: {
    google: 'google-site-verification-code-here',
  },
  alternates: {
    canonical: 'https://tools.mofei.life',
    languages: {
      'en-US': 'https://tools.mofei.life/',
      'zh-CN': 'https://tools.mofei.life/zh',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <GoogleAnalytics />
        </Suspense>
        <LanguageProvider>
          <Nav />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
