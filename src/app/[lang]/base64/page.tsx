import type { Metadata } from 'next';
import Base64Page from '../../base64/page';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (lang === 'zh') {
    return {
      title: 'Base64编码解码工具 - 免费在线Base64编解码器',
      description: '免费的Base64编码解码工具，支持文本到Base64编码和Base64到文本解码。在线使用，无需下载，支持中文和Unicode字符，快速安全的Base64转换工具。',
      keywords: ['Base64编码', 'Base64解码', 'Base64转换', '在线编码', 'Base64工具', '文本编码', 'URL编码', '免费工具'],
      openGraph: {
        title: 'Base64编码解码工具 - 免费在线Base64编解码器',
        description: '免费的Base64编码解码工具，支持文本到Base64编码和Base64到文本解码。在线使用，无需下载。',
        locale: 'zh_CN',
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/base64',
        languages: {
          'en-US': 'https://tools.mofei.life/en/base64',
        },
      },
    };
  }
  
  // English version
  return {
    title: 'Base64 Encoder Decoder - Free Online Base64 Converter Tool',
    description: 'Free online Base64 encoder and decoder tool. Convert text to Base64 encoding and decode Base64 to text. Supports Unicode characters, no download required, secure and fast Base64 conversion.',
    keywords: ['Base64 encoder', 'Base64 decoder', 'Base64 converter', 'online encoder', 'Base64 tool', 'text encoding', 'URL encoding', 'free tool'],
    openGraph: {
      title: 'Base64 Encoder Decoder - Free Online Base64 Converter Tool',
      description: 'Free online Base64 encoder and decoder tool. Convert text to Base64 encoding and decode Base64 to text.',
      locale: 'en_US',
    },
    alternates: {
      canonical: 'https://tools.mofei.life/en/base64',
      languages: {
        'zh-CN': 'https://tools.mofei.life/zh/base64',
      },
    },
  };
}

export default function LangBase64Page() {
  return <Base64Page />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}