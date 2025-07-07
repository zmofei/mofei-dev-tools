"use client"
import { useLanguage } from '@/contexts/LanguageContext';

interface StructuredDataProps {
  type: 'website' | 'tool';
  toolName?: string;
  toolDescription?: string;
  url?: string;
}

export default function StructuredData({ type, toolName, toolDescription, url }: StructuredDataProps) {
  const { language } = useLanguage();
  
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'website' ? "WebSite" : "WebApplication",
      "name": type === 'website' 
        ? (language === 'zh' ? "Mofei开发工具集合" : "Mofei Dev Tools")
        : toolName,
      "description": type === 'website'
        ? (language === 'zh' 
          ? "Mofei开发工具集合：Base64编解码、GeoJSON预览、JSON格式化等实用开发工具。免费在线使用，支持中英文界面。"
          : "Collection of useful development tools: Base64 encoder/decoder, GeoJSON preview, JSON formatter and more. Free online tools, bilingual interface.")
        : toolDescription,
      "url": url || "https://tools.mofei.life",
      "author": {
        "@type": "Person",
        "name": "Mofei",
        "url": "https://mofei.life"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mofei",
        "url": "https://mofei.life"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://tools.mofei.life/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    if (type === 'tool') {
      return {
        ...baseData,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          language === 'zh' ? "免费使用" : "Free to use",
          language === 'zh' ? "无需注册" : "No registration required", 
          language === 'zh' ? "支持中英文" : "Bilingual support",
          language === 'zh' ? "在线处理" : "Online processing"
        ]
      };
    }

    return {
      ...baseData,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "WebApplication",
              "name": "Base64 Encoder Decoder",
              "url": "https://tools.mofei.life/base64"
            }
          },
          {
            "@type": "ListItem", 
            "position": 2,
            "item": {
              "@type": "WebApplication",
              "name": "GeoJSON Preview Tool",
              "url": "https://tools.mofei.life/geojson"
            }
          }
        ]
      }
    };
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
}