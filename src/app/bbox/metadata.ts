import { Metadata } from 'next';

export function getMetadata(): Metadata {
  const title = "BBox Drawing Tool - Interactive Map Bounding Box Generator";
  const description = "Free online tool to draw and generate bounding boxes on interactive maps. Create precise geographic boundaries, get WGS84 coordinates, and export to GeoJSON format. Perfect for GIS applications and mapping projects.";
  const url = "https://tools.mofei.life/bbox";
  const siteName = "Mofei Dev Tools";

  return {
    title,
    description,
    keywords: [
      'bounding box',
      'bbox',
      'bbox drawing tool',
      'interactive map',
      'geographic coordinates',
      'map bounding box',
      'GIS tools',
      'mapping tools',
      'spatial data',
      'draw bbox',
      'map drawing',
      'rectangle drawing',
      'GeoJSON bbox',
      'WGS84 bounds',
      'coordinate system',
      'geographic bounds',
      'map bounds',
      'geospatial tools',
      'free online tools',
      'bbox generator',
      'mapbox drawing',
      'coordinate extraction',
      'viewport bounds',
      'area selection'
    ],
    authors: [{ name: "Mofei Dev Tools" }],
    creator: "Mofei Dev Tools",
    publisher: "Mofei Dev Tools",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
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
    verification: {
      google: 'your-google-verification-code',
    },
  };
}