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

    // Get subscription limits
    const limits = await BillingService.getSubscriptionLimits(user.id)

    // Get current usage (implement based on your needs)
    const usage = {
      users: 1, // Get from database
      projects: 0, // Get from database
      storage: 0, // Get from storage service
      apiCalls: 0, // Get from analytics/logs
    }

    return NextResponse.json({ limits, usage })
  } catch (error) {
    console.error('Get limits error:', error)
    return NextResponse.json({ error: 'Failed to get limits' }, { status: 500 })
  }
}