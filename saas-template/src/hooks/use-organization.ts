'use client'

import { useEffect, useState, useCallback, createContext, useContext } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from './use-auth'
import { createClient } from '@/lib/supabase/client'
import type { Organization, OrganizationMember } from '@/lib/organizations/service'

interface OrganizationContextValue {
  organization: Organization | null
  members: OrganizationMember[]
  currentMember: OrganizationMember | null
  loading: boolean
  error: string | null
  isOwner: boolean
  isAdmin: boolean
  canManageMembers: boolean
  canManageBilling: boolean
  refreshOrganization: () => Promise<void>
  switchOrganization: (orgId: string) => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [currentMember, setCurrentMember] = useState<OrganizationMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const orgId = params?.orgId as string

  useEffect(() => {
    if (user && orgId) {
      fetchOrganization()
    } else {
      setOrganization(null)
      setMembers([])
      setCurrentMember(null)
      setLoading(false)
    }
  }, [user, orgId])

  const fetchOrganization = async () => {
    if (!orgId || !user) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Fetch organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (orgError) throw orgError

      // Fetch members
      const { data: membersList, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:users(id, email, name, avatar_url)
        `)
        .eq('organization_id', orgId)

      if (membersError) throw membersError

      // Find current user's membership
      const currentUserMember = membersList?.find(m => m.user_id === user.id)
      
      if (!currentUserMember) {
        throw new Error('You are not a member of this organization')
      }

      setOrganization(org)
      setMembers(membersList || [])
      setCurrentMember(currentUserMember)
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch organization:', err)
    } finally {
      setLoading(false)
    }
  }

  const switchOrganization = useCallback((newOrgId: string) => {
    router.push(`/org/${newOrgId}`)
  }, [router])

  const isOwner = currentMember?.role === 'OWNER'
  const isAdmin = currentMember?.role === 'ADMIN' || isOwner
  const canManageMembers = isAdmin
  const canManageBilling = isOwner

  const value: OrganizationContextValue = {
    organization,
    members,
    currentMember,
    loading,
    error,
    isOwner,
    isAdmin,
    canManageMembers,
    canManageBilling,
    refreshOrganization: fetchOrganization,
    switchOrganization,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}