'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for side projects and small applications',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Complete source code',
      'Authentication system',
      'Basic billing integration',
      'Email notifications',
      'Documentation',
      '6 months of updates',
      'Community support'
    ],
    cta: 'Get Started',
    href: '/register?plan=starter',
    popular: false
  },
  {
    name: 'Professional',
    description: 'Best for growing businesses and teams',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      'Everything in Starter',
      'Advanced team features',
      'Multi-tenant architecture',
      'Admin dashboard',
      'Priority support',
      '12 months of updates',
      'Custom integrations guide',
      'Deployment assistance'
    ],
    cta: 'Start Free Trial',
    href: '/register?plan=professional',
    popular: true
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Everything in Professional',
      'Custom development',
      'White-label solution',
      'Dedicated support',
      'SLA guarantee',
      'Unlimited updates',
      'Source code ownership',
      'On-premise deployment'
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false
  }
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Simple,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transparent
            </span>{' '}
            Pricing
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Choose the perfect plan for your needs. All plans include lifetime access to the template.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className={`h-full ${plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border shadow-md'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    {plan.monthlyPrice ? (
                      <div className="flex items-center justify-center">
                        <span className="text-4xl font-bold">
                          ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {isYearly ? '/year' : '/month'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold">Custom</div>
                    )}
                    
                    {plan.monthlyPrice && isYearly && (
                      <div className="text-sm text-gray-500 mt-1">
                        ${Math.round(plan.yearlyPrice / 12)}/month billed annually
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Icons.check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    asChild
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <Icons.arrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
          <p className="text-gray-600 mb-8">
            Have questions? We have answers.{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact us
            </Link>{' '}
            for more information.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold mb-2">What's included in the template?</h4>
              <p className="text-gray-600 text-sm">
                Complete source code, documentation, and everything you need to build and deploy your SaaS.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do I get updates?</h4>
              <p className="text-gray-600 text-sm">
                Yes! You'll receive updates for the duration specified in your plan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I use this for client projects?</h4>
              <p className="text-gray-600 text-sm">
                Absolutely! You can use the template for unlimited client projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a refund policy?</h4>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}