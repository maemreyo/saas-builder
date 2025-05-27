import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth/service'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Check if user is admin
    const adminCheck = await AuthService.requireAdmin()
    
    // Get all users with their subscription status
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions(
          status,
          stripe_price_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    // Get stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => {
        const lastSignIn = u.last_sign_in ? new Date(u.last_sign_in) : null
        return lastSignIn && (now.getTime() - lastSignIn.getTime()) < 30 * 24 * 60 * 60 * 1000
      }).length,
      paidUsers: users.filter(u => 
        u.subscriptions?.some((s: any) => s.status === 'ACTIVE')
      ).length,
      adminUsers: users.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.role)).length,
      newUsersThisMonth: users.filter(u => 
        new Date(u.created_at) >= startOfMonth
      ).length,
    }

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      role: user.role,
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at,
      subscription: user.subscriptions?.[0] ? {
        status: user.subscriptions[0].status.toLowerCase(),
        plan: getPlanName(user.subscriptions[0].stripe_price_id),
      } : null,
    }))

    return NextResponse.json({
      users: formattedUsers,
      stats,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getPlanName(priceId: string | null): string {
  if (!priceId) return 'free'
  
  // Map price IDs to plan names
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    return 'pro'
  }
  
  return 'custom'
}