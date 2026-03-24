import type { Metadata } from 'next'

export const metadata: Metadata = {
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
    url: 'https://tools.mofei.life/objectid',
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
    canonical: 'https://tools.mofei.life/objectid',
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

export default function ObjectIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}