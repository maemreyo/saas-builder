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

    const invoices = await BillingService.getInvoices(userData.stripe_customer_id)

    // Format invoices for frontend
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
    }))

    return NextResponse.json(formattedInvoices)
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json({ error: 'Failed to get invoices' }, { status: 500 })
  }
}