import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BillingService } from '@/lib/billing/service'
import { z } from 'zod'

const createCheckoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  organizationId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { priceId, successUrl, cancelUrl, organizationId } = createCheckoutSchema.parse(body)

    const session = await BillingService.createCheckoutSession({
      userId: user.id,
      email: user.email!,
      priceId,
      successUrl,
      cancelUrl,
      metadata: organizationId ? { organizationId } : {},
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}