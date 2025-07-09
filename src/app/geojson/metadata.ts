import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GeoJSON Preview Tool - Free Online Geographic Data Visualization',
  description: 'Free GeoJSON preview tool to generate geojson.io preview links instantly. Supports GitHub login and Gist storage for large files. Visualize geographic data online, no download required.',
  keywords: [
    'GeoJSON preview',
    'GeoJSON tool',
    'geographic data visualization',
    'geojson.io',
    'GitHub Gist',
    'map data',
    'GIS tool',
    'free tool',
    'geojson viewer',
    'geojson validator',
    'map visualization',
    'geographic data',
    'spatial data',
    'mapping tool',
    'geospatial',
    'JSON to map',
    'coordinate data',
    'location data'
  ],
  authors: [{ name: 'Mofei', url: 'https://www.mofei.life' }],
  creator: 'Mofei',
  publisher: 'Mofei',
  robots: 'index, follow',
  openGraph: {
    title: 'GeoJSON Preview Tool - Free Online Geographic Data Visualization',
    description: 'Free GeoJSON preview tool to generate geojson.io preview links instantly. Supports GitHub login and Gist storage for large files.',
    url: 'https://tools.mofei.life/geojson',
    siteName: 'Mofei Dev Tools',
    images: [
      {
        url: 'https://tools.mofei.life/og-geojson.png',
        width: 1200,
        height: 630,
        alt: 'GeoJSON Preview Tool'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoJSON Preview Tool - Free Online Geographic Data Visualization',
    description: 'Free GeoJSON preview tool to generate geojson.io preview links instantly. Supports GitHub login and Gist storage.',
    images: ['https://tools.mofei.life/og-geojson.png'],
    creator: '@mofei',
  },
  alternates: {
    canonical: 'https://tools.mofei.life/geojson',
    languages: {
      'en-US': 'https://tools.mofei.life/en/geojson',
      'zh-CN': 'https://tools.mofei.life/zh/geojson',
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  category: 'technology',
  classification: 'Developer Tool',
};