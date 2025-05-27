import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth/service'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Check if user is admin
    await AuthService.requireAdmin()
    
    // Get date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today)
    thisWeek.setDate(today.getDate() - 7)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get user growth data
    const { data: userGrowth } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', lastMonth.toISOString())
      .order('created_at')

    // Get revenue data
    const { data: revenueData } = await supabase
      .from('subscriptions')
      .select('created_at, stripe_price_id')
      .eq('status', 'ACTIVE')
      .gte('created_at', lastMonth.toISOString())
      .order('created_at')

    // Get activity data
    const { data: activityData } = await supabase
      .from('activity_logs')
      .select('created_at, action')
      .gte('created_at', thisWeek.toISOString())
      .order('created_at')

    // Process data for charts
    const analytics = {
      userGrowth: processGrowthData(userGrowth || []),
      revenue: processRevenueData(revenueData || []),
      activity: processActivityData(activityData || []),
      summary: {
        totalUsers: await getUserCount(supabase),
        activeUsers: await getActiveUserCount(supabase, thisMonth),
        totalRevenue: calculateTotalRevenue(revenueData || []),
        growthRate: calculateGrowthRate(userGrowth || []),
      },
    }

    return NextResponse.json(analytics)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function processGrowthData(data: any[]) {
  // Group by day and count
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return Object.entries(grouped).map(([date, count]) => ({
    date,
    users: count,
  }))
}

function processRevenueData(data: any[]) {
  // Calculate monthly recurring revenue
  const proPriceMonthly = 29 // $29/month
  
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + proPriceMonthly
    return acc
  }, {})

  return Object.entries(grouped).map(([date, revenue]) => ({
    date,
    revenue,
  }))
}

function processActivityData(data: any[]) {
  // Group by action type
  const grouped = data.reduce((acc, item) => {
    acc[item.action] = (acc[item.action] || 0) + 1
    return acc
  }, {})

  return Object.entries(grouped).map(([action, count]) => ({
    action,
    count,
  }))
}

async function getUserCount(supabase: any) {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  return count || 0
}

async function getActiveUserCount(supabase: any, since: Date) {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_sign_in_at', since.toISOString())
  
  return count || 0
}

function calculateTotalRevenue(subscriptions: any[]) {
  return subscriptions.length * 29 // $29/month per subscription
}

function calculateGrowthRate(users: any[]) {
  if (users.length < 2) return 0
  
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const recentUsers = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length
  const previousUsers = users.length - recentUsers
  
  if (previousUsers === 0) return 100
  
  return Math.round(((recentUsers - previousUsers) / previousUsers) * 100)
}