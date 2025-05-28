import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SaaS Template - Build Your SaaS Faster',
  description: 'Production-ready SaaS template with authentication, billing, and more. Save months of development time.',
  keywords: ['SaaS', 'template', 'Next.js', 'React', 'authentication', 'billing', 'Stripe'],
  authors: [{ name: 'SaaS Template Team' }],
  creator: 'SaaS Template',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'SaaS Template',
    title: 'SaaS Template - Build Your SaaS Faster',
    description: 'Production-ready SaaS template with authentication, billing, and more. Save months of development time.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SaaS Template',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaS Template - Build Your SaaS Faster',
    description: 'Production-ready SaaS template with authentication, billing, and more. Save months of development time.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`],
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </>
  )
}