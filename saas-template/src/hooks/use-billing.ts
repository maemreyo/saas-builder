'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  user_id?: string
  organization_id?: string
  stripe_subscription_id: string
  stripe_price_id: string
  stripe_current_period_end: string
  status: string
  cancel_at_period_end: boolean
  metadata?: any
  created_at: string
  updated_at: string
}

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  exp_month: number
  exp_year: number
  is_default: boolean
}

interface Invoice {
  id: string
  amount_paid: number
  amount_due: number
  currency: string
  status: string
  created: number
  invoice_pdf?: string
  hosted_invoice_url?: string
}

export function useBilling() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchBillingData()
    } else {
      setSubscription(null)
      setPaymentMethods([])
      setInvoices([])
      setLoading(false)
    }
  }, [user])

  const fetchBillingData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'ACTIVE')
        .single()

      setSubscription(subData)

      // Fetch payment methods and invoices from API
      if (subData) {
        const [methodsRes, invoicesRes] = await Promise.all([
          fetch('/api/billing/payment-methods'),
          fetch('/api/billing/invoices'),
        ])

        if (methodsRes.ok) {
          const methodsData = await methodsRes.json()
          setPaymentMethods(methodsData)
        }

        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json()
          setInvoices(invoicesData)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const subscribe = useCallback(
    async (priceId: string) => {
      setError(null)

      try {
        const response = await fetch('/api/billing/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId,
            successUrl: `${window.location.origin}/billing/success`,
            cancelUrl: `${window.location.origin}/billing`,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session')
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    []
  )

  const updateSubscription = useCallback(
    async (newPriceId: string) => {
      if (!subscription) {
        throw new Error('No active subscription')
      }

      setError(null)

      try {
        const response = await fetch('/api/billing/update-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: subscription.stripe_subscription_id,
            priceId: newPriceId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update subscription')
        }

        await fetchBillingData()
        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [subscription]
  )

  const cancelSubscription = useCallback(async () => {
    if (!subscription) {
      throw new Error('No active subscription')
    }

    setError(null)

    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      await fetchBillingData()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [subscription])

  const resumeSubscription = useCallback(async () => {
    if (!subscription) {
      throw new Error('No subscription to resume')
    }

    setError(null)

    try {
      const response = await fetch('/api/billing/resume-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resume subscription')
      }

      await fetchBillingData()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [subscription])

  const openBillingPortal = useCallback(async () => {
    setError(null)

    try {
      const response = await fetch('/api/billing/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const addPaymentMethod = useCallback(async () => {
    setError(null)

    try {
      const response = await fetch('/api/billing/create-setup-intent', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create setup intent')
      }

      // You would typically use Stripe Elements here
      // For now, redirect to billing portal
      await openBillingPortal()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [openBillingPortal])

  const removePaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      setError(null)

      try {
        const response = await fetch('/api/billing/remove-payment-method', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethodId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove payment method')
        }

        await fetchBillingData()
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    []
  )

  const isSubscribed = subscription?.status === 'ACTIVE'
  const isCanceled = subscription?.cancel_at_period_end === true
  const subscriptionEndDate = subscription?.stripe_current_period_end
    ? new Date(subscription.stripe_current_period_end)
    : null

  return {
    subscription,
    paymentMethods,
    invoices,
    loading,
    error,
    isSubscribed,
    isCanceled,
    subscriptionEndDate,
    subscribe,
    updateSubscription,
    cancelSubscription,
    resumeSubscription,
    openBillingPortal,
    addPaymentMethod,
    removePaymentMethod,
    refreshBilling: fetchBillingData,
  }
}