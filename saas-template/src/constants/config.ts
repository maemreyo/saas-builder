export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Build your SaaS faster',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  features: {
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    emails: process.env.ENABLE_EMAILS === 'true',
    billing: process.env.ENABLE_BILLING === 'true',
  },
}

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out our service',
    price: 0,
    features: [
      '1 user',
      '10 projects',
      'Basic support',
      'Limited API calls',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    price: 29,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited users',
      'Unlimited projects',
      'Priority support',
      'Unlimited API calls',
      'Advanced analytics',
      'Custom integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom contracts',
      'SLA guarantee',
      'On-premise deployment',
      'Advanced security',
    ],
  },
]
