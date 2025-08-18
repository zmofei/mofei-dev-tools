import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  
  if (lang === 'zh') {
    return {
      title: '免费 Base64 编码解码器 - 在线文本转换工具 | Mofei 工具',
      description: '使用我们的免费在线 Base64 编码解码工具快速转换文本。支持批量处理、历史记录、分享功能，完美适合开发者、网页设计师和数据分析师使用。',
      keywords: [
        'Base64 编码',
        'Base64 解码',
        'Base64 转换器',
        '在线 Base64',
        'Base64 编码器',
        'Base64 解码器',
        '文本编码',
        '数据编码',
        'Base64 工具',
        'URL 编码',
        '免费 Base64',
        '在线编码工具',
        'Base64 转换',
        '编码解码器',
        'Base64 在线工具'
      ].join(', '),
      authors: [{ name: 'Mofei Dev Tools' }],
      category: '开发工具',
      classification: '文本处理工具',
      openGraph: {
        title: '免费 Base64 编码解码器 - 在线文本转换工具',
        description: '快速转换 Base64 编码，支持批量处理和历史记录。为开发者提供的免费在线工具。',
        type: 'website',
        url: 'https://tools.mofei.life/zh/base64',
        siteName: 'Mofei Dev Tools',
        locale: 'zh_CN',
        alternateLocale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        site: '@mofei_tools',
        title: '免费 Base64 编码解码器 - 在线文本转换工具',
        description: '快速转换 Base64 编码，支持批量处理和历史记录。为开发者提供的免费在线工具。'
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/base64',
        languages: {
          'en': 'https://tools.mofei.life/en/base64',
          'zh': 'https://tools.mofei.life/zh/base64',
          'x-default': 'https://tools.mofei.life/base64'
        }
      }
    }
  }
  
  // English version (default)
  return {
    title: 'Free Base64 Encoder Decoder - Online Text Conversion Tool | Mofei Tools',
    description: 'Convert text to Base64 encoding and decode Base64 strings with our free online tool. Features batch processing, history, and sharing capabilities for developers and designers.',
    keywords: [
      'Base64 encoder',
      'Base64 decoder',
      'Base64 converter',
      'online Base64',
      'text encoding',
      'data encoding',
      'Base64 tool',
      'URL encoding',
      'free Base64',
      'encoding tool',
      'Base64 conversion',
      'encode decode',
      'Base64 online'
    ].join(', '),
    authors: [{ name: 'Mofei Dev Tools' }],
    category: 'Developer Tools',
    classification: 'Text Processing Tool',
    alternates: {
      canonical: 'https://tools.mofei.life/en/base64',
      languages: {
        'en': 'https://tools.mofei.life/en/base64',
        'zh': 'https://tools.mofei.life/zh/base64',
        'x-default': 'https://tools.mofei.life/base64'
      }
    }
  }
}

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}