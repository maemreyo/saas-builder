import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/payments/stripe'
import { createClient } from '@/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Create subscription record
      await supabase.from('subscriptions').insert({
        user_id: session.metadata?.userId,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        status: 'active',
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          stripe_current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
