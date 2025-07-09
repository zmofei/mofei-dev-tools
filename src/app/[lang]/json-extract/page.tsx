import type { Metadata } from 'next';
import JSONExtractPage from '../../json-extract/page';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (lang === 'zh') {
    return {
      title: 'JSON路径提取工具 - 免费在线JSON数据提取器',
      description: '强大的JSON路径提取工具，支持JSONPath语法提取JSON数据中的特定值。支持多列提取、数组遍历、导出CSV等功能。',
      keywords: ['JSON提取', 'JSONPath', '数据提取', 'JSON工具', '路径查询', '数据分析', '免费工具'],
      openGraph: {
        title: 'JSON路径提取工具 - 免费在线JSON数据提取器',
        description: '强大的JSON路径提取工具，支持JSONPath语法提取JSON数据中的特定值。',
        locale: 'zh_CN',
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/json-extract',
        languages: {
          'en-US': 'https://tools.mofei.life/en/json-extract',
        },
      },
    };
  }
  
  return {
    title: 'JSON Path Extractor - Free Online JSON Data Extraction Tool',
    description: 'Powerful JSON path extraction tool with JSONPath syntax support. Extract specific values from JSON data with multi-column support, array traversal, and CSV export.',
    keywords: ['JSON extractor', 'JSONPath', 'data extraction', 'JSON tool', 'path query', 'data analysis', 'free tool'],
    openGraph: {
      title: 'JSON Path Extractor - Free Online JSON Data Extraction Tool',
      description: 'Powerful JSON path extraction tool with JSONPath syntax support. Extract specific values from JSON data.',
      locale: 'en_US',
    },
    alternates: {
      canonical: 'https://tools.mofei.life/en/json-extract',
      languages: {
        'zh-CN': 'https://tools.mofei.life/zh/json-extract',
      },
    },
  };
}

export default function LangJSONExtractPage() {
  return <JSONExtractPage />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}