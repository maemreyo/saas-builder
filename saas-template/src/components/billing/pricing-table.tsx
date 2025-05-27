'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/constants/config'
import { useRouter } from 'next/navigation'

export function PricingTable() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {SUBSCRIPTION_PLANS.map((plan) => (
        <div
          key={plan.id}
          className="relative rounded-lg border bg-card p-8 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan.description}
            </p>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold">
              {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
            </span>
            {typeof plan.price === 'number' && (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>

          <ul className="mb-6 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            variant={plan.id === 'pro' ? 'default' : 'outline'}
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading === plan.id}
          >
            {loading === plan.id ? 'Processing...' : 'Get Started'}
          </Button>
        </div>
      ))}
    </div>
  )
}
