'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  paidUsers: number
  adminUsers: number
  newUsersThisMonth: number
}

export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    paidUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUsersAndStats()
  }, [])

  const fetchUsersAndStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      throw new Error('Failed to update user role')
    }

    await fetchUsersAndStats()
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }

    await fetchUsersAndStats()
  }, [])

  const impersonateUser = useCallback(async (userId: string) => {
    const response = await fetch(`/api/admin/users/${userId}/impersonate`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to impersonate user')
    }

    router.push('/dashboard')
  }, [router])

  return {
    users,
    stats,
    loading,
    updateUserRole,
    deleteUser,
    impersonateUser,
    refresh: fetchUsersAndStats,
  }
}