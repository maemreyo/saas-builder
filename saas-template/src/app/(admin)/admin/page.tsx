import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminOverviewPage() {
  const supabase = createClient()

  // Get stats
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: subscriptionCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Admin Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{subscriptionCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
