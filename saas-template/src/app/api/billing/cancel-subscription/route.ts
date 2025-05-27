import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BillingService } from '@/lib/billing/service'
import { z } from 'zod'

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionId } = cancelSubscriptionSchema.parse(body)

    // Verify user owns this subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const updatedSubscription = await BillingService.cancelSubscription(subscriptionId)

    // Update local database
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('stripe_subscription_id', subscriptionId)

    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}