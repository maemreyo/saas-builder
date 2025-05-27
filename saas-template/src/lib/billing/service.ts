import { stripe } from '@/lib/payments/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export class BillingService {
  // Create or get Stripe customer
  static async createOrGetCustomer(userId: string, email: string) {
    const supabase = createClient()
    
    // Check if user already has a Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (user?.stripe_customer_id) {
      return user.stripe_customer_id
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    // Update user with Stripe customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)

    return customer.id
  }

  // Create checkout session
  static async createCheckoutSession({
    userId,
    email,
    priceId,
    successUrl,
    cancelUrl,
    metadata = {},
  }: {
    userId: string
    email: string
    priceId: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }) {
    const customerId = await this.createOrGetCustomer(userId, email)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        ...metadata,
      },
      subscription_data: {
        metadata: {
          userId,
          ...metadata,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
    })

    return session
  }

  // Create billing portal session
  static async createPortalSession({
    customerId,
    returnUrl,
  }: {
    customerId: string
    returnUrl: string
  }) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  }

  // Get user's subscription
  static async getSubscription(userId: string) {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .or(`user_id.eq.${userId}`)
      .eq('status', 'active')
      .single()

    return data
  }

  // Get user's subscriptions (including inactive)
  static async getSubscriptions(userId: string) {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .or(`user_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    return data || []
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return subscription
  }

  // Resume subscription
  static async resumeSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return subscription
  }

  // Update subscription
  static async updateSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    return updatedSubscription
  }

  // Get invoices
  static async getInvoices(customerId: string, limit = 10) {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    })

    return invoices.data
  }

  // Get upcoming invoice
  static async getUpcomingInvoice(customerId: string) {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
      })
      return invoice
    } catch (error) {
      // No upcoming invoice
      return null
    }
  }

  // Add payment method
  static async addPaymentMethod(customerId: string, paymentMethodId: string) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  // Get payment methods
  static async getPaymentMethods(customerId: string) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    return paymentMethods.data
  }

  // Remove payment method
  static async removePaymentMethod(paymentMethodId: string) {
    await stripe.paymentMethods.detach(paymentMethodId)
  }

  // Create setup intent for adding payment methods
  static async createSetupIntent(customerId: string) {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    })

    return setupIntent
  }

  // Handle webhook events
  static async handleWebhookEvent(event: Stripe.Event) {
    const supabase = createClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await supabase.from('subscriptions').insert({
            user_id: session.metadata?.userId,
            organization_id: session.metadata?.organizationId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            stripe_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            status: subscription.status.toUpperCase() as any,
            metadata: subscription.metadata,
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('subscriptions')
          .update({
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status.toUpperCase() as any,
            stripe_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            metadata: subscription.metadata,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'CANCELED',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        // You can log successful payments or send receipts here
        console.log(`Payment succeeded for invoice ${invoice.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Handle failed payments - send emails, update UI, etc.
        console.log(`Payment failed for invoice ${invoice.id}`)
        
        // Update subscription status
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'PAST_DUE' })
            .eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }
    }
  }

  // Get subscription price details
  static async getPriceDetails(priceId: string) {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    })

    return {
      id: price.id,
      amount: price.unit_amount || 0,
      currency: price.currency,
      interval: price.recurring?.interval,
      intervalCount: price.recurring?.interval_count,
      product: price.product as Stripe.Product,
    }
  }

  // Check if user has active subscription
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId)
    return !!subscription && subscription.status === 'ACTIVE'
  }

  // Get subscription limits
  static async getSubscriptionLimits(userId: string) {
    const subscription = await this.getSubscription(userId)
    
    if (!subscription) {
      // Return free tier limits
      return {
        tier: 'free',
        limits: {
          users: 1,
          projects: 10,
          storage: 1024 * 1024 * 100, // 100MB
          apiCalls: 1000,
        },
      }
    }

    // Get price details to determine tier
    const priceDetails = await this.getPriceDetails(subscription.stripe_price_id)
    
    // Map price IDs to tiers (you'll need to configure these)
    const tierMap: Record<string, any> = {
      [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!]: {
        tier: 'pro',
        limits: {
          users: -1, // unlimited
          projects: -1,
          storage: 1024 * 1024 * 1024 * 10, // 10GB
          apiCalls: -1,
        },
      },
      // Add more tiers as needed
    }

    return tierMap[subscription.stripe_price_id] || {
      tier: 'unknown',
      limits: {},
    }
  }
}