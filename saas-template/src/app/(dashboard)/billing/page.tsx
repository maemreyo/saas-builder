'use client'

import { useState } from 'react'
import { useBilling } from '@/hooks/use-billing'
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits'
import { PricingTable } from '@/components/billing/pricing-table'
import { CurrentPlan } from '@/components/billing/current-plan'
import { PaymentMethods } from '@/components/billing/payment-methods'
import { BillingHistory } from '@/components/billing/billing-history'
import { UsageOverview } from '@/components/billing/usage-overview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

export default function BillingPage() {
  const { subscription, loading, error, isSubscribed } = useBilling()
  const { limits, usage } = useSubscriptionLimits()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Current Plan Overview */}
      <CurrentPlan />

      {/* Usage Overview */}
      {isSubscribed && <UsageOverview />}

      <Tabs defaultValue={isSubscribed ? "billing" : "plans"} className="w-full">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          {isSubscribed && (
            <>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Plans</h2>
            <PricingTable currentPlanId={subscription?.stripe_price_id} />
          </div>
        </TabsContent>

        {isSubscribed && (
          <>
            <TabsContent value="billing" className="mt-6">
              <div className="space-y-6">
                <PaymentMethods />
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="mt-6">
              <BillingHistory />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}