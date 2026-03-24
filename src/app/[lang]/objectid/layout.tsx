import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  
  if (lang === 'zh') {
    return {
      title: '免费 MongoDB ObjectID 生成器 - 在线创建唯一数据库标识符 | Mofei 工具',
      description: '使用我们的免费在线工具即时生成 MongoDB ObjectID。创建唯一的 24 字符十六进制标识符，提取时间戳，分析结构，并使用自定义时间戳。适合 MongoDB 开发者、数据库管理员和后端工程师。',
      keywords: [
        'MongoDB ObjectID 生成器',
        'ObjectID 创建器',
        'MongoDB 唯一标识符',
        'BSON ObjectID',
        '数据库 ID 生成器',
        'MongoDB 主键',
        'ObjectID 时间戳提取器',
        'MongoDB 文档 ID',
        'NoSQL 数据库工具',
        'MongoDB 开发工具',
        'ObjectID 解码器',
        'MongoDB 实用工具',
        '数据库标识符工具',
        'MongoDB ObjectID 分析器',
        '免费 MongoDB 工具'
      ].join(', '),
      authors: [{ name: 'Mofei Dev Tools' }],
      category: '开发工具',
      classification: '数据库开发工具',
      openGraph: {
        title: '免费 MongoDB ObjectID 生成器 - 创建唯一数据库标识符',
        description: '即时生成 MongoDB ObjectID，支持时间戳提取和结构分析。为开发者提供的免费在线工具。',
        type: 'website',
        url: 'https://tools.mofei.life/zh/objectid',
        siteName: 'Mofei Dev Tools',
        locale: 'zh_CN',
        alternateLocale: 'en_US',
        images: [
          {
            url: 'https://tools.mofei.life/api/og?title=MongoDB%20ObjectID%20%E7%94%9F%E6%88%90%E5%99%A8&description=%E7%94%9F%E6%88%90%E5%94%AF%E4%B8%80%E7%9A%84%20MongoDB%20%E6%A0%87%E8%AF%86%E7%AC%A6',
            width: 1200,
            height: 630,
            alt: 'MongoDB ObjectID 生成器工具'
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        site: '@mofei_tools',
        title: '免费 MongoDB ObjectID 生成器 - 创建唯一数据库标识符',
        description: '即时生成 MongoDB ObjectID，支持时间戳提取和结构分析。为开发者提供的免费在线工具。',
        images: ['https://tools.mofei.life/api/og?title=MongoDB%20ObjectID%20%E7%94%9F%E6%88%90%E5%99%A8&description=%E7%94%9F%E6%88%90%E5%94%AF%E4%B8%80%E7%9A%84%20MongoDB%20%E6%A0%87%E8%AF%86%E7%AC%A6']
      },
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
      alternates: {
        canonical: 'https://tools.mofei.life/zh/objectid',
        languages: {
          'en': 'https://tools.mofei.life/en/objectid',
          'zh': 'https://tools.mofei.life/zh/objectid',
          'x-default': 'https://tools.mofei.life/objectid'
        }
      },
      other: {
        'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'format-detection': 'telephone=no'
      }
    }
  }
  
  // English version (default)
  return {
    title: 'Free MongoDB ObjectID Generator - Create Unique Database IDs Online | Mofei Tools',
    description: 'Generate MongoDB ObjectIDs instantly with our free online tool. Create unique 24-character hex identifiers, extract timestamps, analyze structure, and use custom timestamps. Perfect for MongoDB developers, database administrators, and backend engineers.',
    keywords: [
      'MongoDB ObjectID generator',
      'ObjectID creator',
      'MongoDB unique identifier',
      'BSON ObjectID',
      'database ID generator',
      'MongoDB primary key',
      'ObjectID timestamp extractor',
      'MongoDB document ID',
      'NoSQL database tools',
      'MongoDB development tools',
      'ObjectID decoder',
      'MongoDB utilities',
      'database identifier tools',
      'MongoDB ObjectID analyzer',
      'free MongoDB tools'
    ].join(', '),
    authors: [{ name: 'Mofei Dev Tools' }],
    category: 'Developer Tools',
    classification: 'Database Development Tool',
    openGraph: {
      title: 'Free MongoDB ObjectID Generator - Create Unique Database IDs',
      description: 'Generate MongoDB ObjectIDs instantly with timestamp extraction and structure analysis. Free online tool for developers.',
      type: 'website',
      url: 'https://tools.mofei.life/en/objectid',
      siteName: 'Mofei Dev Tools',
      locale: 'en_US',
      alternateLocale: 'zh_CN',
      images: [
        {
          url: 'https://tools.mofei.life/api/og?title=MongoDB%20ObjectID%20Generator&description=Generate%20unique%20MongoDB%20identifiers',
          width: 1200,
          height: 630,
          alt: 'MongoDB ObjectID Generator Tool'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@mofei_tools',
      title: 'Free MongoDB ObjectID Generator - Create Unique Database IDs',
      description: 'Generate MongoDB ObjectIDs instantly with timestamp extraction and structure analysis. Free online tool for developers.',
      images: ['https://tools.mofei.life/api/og?title=MongoDB%20ObjectID%20Generator&description=Generate%20unique%20MongoDB%20identifiers']
    },
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
    alternates: {
      canonical: 'https://tools.mofei.life/en/objectid',
      languages: {
        'en': 'https://tools.mofei.life/en/objectid',
        'zh': 'https://tools.mofei.life/zh/objectid',
        'x-default': 'https://tools.mofei.life/objectid'
      }
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no'
    }
  }
}

export default function ObjectIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}