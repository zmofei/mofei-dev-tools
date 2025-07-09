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
        "url": "https://www.mofei.life"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Mofei",
        "url": "https://www.mofei.life"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://tools.mofei.life/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    if (type === 'tool') {
      const toolFeatures = toolName === 'JSON Path Extractor' ? [
        language === 'zh' ? "免费使用" : "Free to use",
        language === 'zh' ? "无需注册" : "No registration required", 
        language === 'zh' ? "支持中英文" : "Bilingual support",
        language === 'zh' ? "在线处理" : "Online processing",
        language === 'zh' ? "JSONPath语法支持" : "JSONPath syntax support",
        language === 'zh' ? "多列提取" : "Multi-column extraction",
        language === 'zh' ? "数组遍历" : "Array traversal",
        language === 'zh' ? "CSV导出" : "CSV export",
        language === 'zh' ? "对比模式" : "Comparison mode",
        language === 'zh' ? "实时预览" : "Real-time preview"
      ] : toolName === 'GIS Coordinate Converter' ? [
        language === 'zh' ? "免费使用" : "Free to use",
        language === 'zh' ? "无需注册" : "No registration required", 
        language === 'zh' ? "支持中英文" : "Bilingual support",
        language === 'zh' ? "在线处理" : "Online processing",
        language === 'zh' ? "多坐标系支持" : "Multiple coordinate systems support",
        language === 'zh' ? "WGS84坐标转换" : "WGS84 coordinate conversion",
        language === 'zh' ? "GCJ-02火星坐标转换" : "GCJ-02 Mars coordinate conversion",
        language === 'zh' ? "BD-09百度坐标转换" : "BD-09 Baidu coordinate conversion",
        language === 'zh' ? "UTM投影转换" : "UTM projection conversion",
        language === 'zh' ? "Web墨卡托转换" : "Web Mercator conversion",
        language === 'zh' ? "十进制度格式" : "Decimal degrees format",
        language === 'zh' ? "度分秒格式" : "Degrees minutes seconds format",
        language === 'zh' ? "批量转换" : "Batch conversion",
        language === 'zh' ? "结果分享" : "Result sharing",
        language === 'zh' ? "数据导出" : "Data export"
      ] : [
        language === 'zh' ? "免费使用" : "Free to use",
        language === 'zh' ? "无需注册" : "No registration required", 
        language === 'zh' ? "支持中英文" : "Bilingual support",
        language === 'zh' ? "在线处理" : "Online processing"
      ];

      return {
        ...baseData,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": toolFeatures,
        "softwareRequirements": "Web Browser",
        "permissions": "No special permissions required",
        "applicationSubCategory": toolName === 'GIS Coordinate Converter' ? "GIS Tool" : "JSON Tool",
        "downloadUrl": url,
        "screenshot": toolName === 'JSON Path Extractor' ? 
          `https://tools.mofei.life/screenshots/json-extract-${language}.png` : 
          `https://tools.mofei.life/screenshots/${toolName?.toLowerCase().replace(/\s+/g, '-')}-${language}.png`
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
          },
          {
            "@type": "ListItem", 
            "position": 3,
            "item": {
              "@type": "WebApplication",
              "name": "JSON Path Extractor",
              "url": "https://tools.mofei.life/json-extract"
            }
          },
          {
            "@type": "ListItem", 
            "position": 4,
            "item": {
              "@type": "WebApplication",
              "name": "GIS Coordinate Converter",
              "url": "https://tools.mofei.life/coordinate-converter"
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