'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { createClient } from '@/lib/supabase/client'

interface UserOrganization {
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joined_at: string
  organization: {
    id: string
    name: string
    slug: string
    logo_url?: string
  }
}

export function useOrganizations() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<UserOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchOrganizations()
    } else {
      setOrganizations([])
      setLoading(false)
    }
  }, [user])

  const fetchOrganizations = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          joined_at,
          organization:organizations(id, name, slug, logo_url)
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

      if (error) throw error

      setOrganizations(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createOrganization = async (data: {
    name: string
    slug: string
    description?: string
  }) => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create organization')
      }

      await fetchOrganizations()
      return result
    } catch (err: any) {
      throw err
    }
  }

  return {
    organizations,
    loading,
    error,
    refreshOrganizations: fetchOrganizations,
    createOrganization,
  }
}