'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  BarChart,
  FileText,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Team', href: '/organization', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">SaaS Template</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
