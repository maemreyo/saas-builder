import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <nav className="flex space-x-4">
              <a href="/admin" className="text-gray-700 hover:text-gray-900">
                Overview
              </a>
              <a href="/admin/users" className="text-gray-700 hover:text-gray-900">
                Users
              </a>
              <a href="/admin/analytics" className="text-gray-700 hover:text-gray-900">
                Analytics
              </a>
              <a href="/admin/settings" className="text-gray-700 hover:text-gray-900">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
