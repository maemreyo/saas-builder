import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BillingService } from '@/lib/billing/service'
import { z } from 'zod'

const createPortalSchema = z.object({
  returnUrl: z.string().url(),
})

export async function POST(request: Request) {
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
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
    }

    const body = await request.json()
    const { returnUrl } = createPortalSchema.parse(body)

    const session = await BillingService.createPortalSession({
      customerId: userData.stripe_customer_id,
      returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}