import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  image?: string
  noIndex?: boolean
}

export function generateSEO({
  title,
  description,
  image = '/og-image.png',
  noIndex = false,
}: SEOProps): Metadata {
  const siteName = process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template'
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: `${url}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${url}${image}`],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  }
}
