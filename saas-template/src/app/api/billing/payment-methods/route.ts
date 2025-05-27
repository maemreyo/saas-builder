import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BillingService } from '@/lib/billing/service'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json([])
    }

    const paymentMethods = await BillingService.getPaymentMethods(userData.stripe_customer_id)

    // Get default payment method
    const { stripe } = await import('@/lib/payments/stripe')
    const customer = await stripe.customers.retrieve(userData.stripe_customer_id)
    const defaultPaymentMethodId = (customer as any).invoice_settings?.default_payment_method

    // Format payment methods for frontend
    const formattedMethods = paymentMethods.map(method => ({
      id: method.id,
      brand: method.card?.brand || 'unknown',
      last4: method.card?.last4 || '****',
      exp_month: method.card?.exp_month || 0,
      exp_year: method.card?.exp_year || 0,
      is_default: method.id === defaultPaymentMethodId,
    }))

    return NextResponse.json(formattedMethods)
  } catch (error) {
    console.error('Get payment methods error:', error)
    return NextResponse.json({ error: 'Failed to get payment methods' }, { status: 500 })
  }
}