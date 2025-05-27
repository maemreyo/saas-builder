'use client'

import { useState, useCallback } from 'react'
import { useOrganization } from './use-organization'

export function useOrganizationMembers() {
  const { organization, refreshOrganization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteMember = useCallback(
    async (email: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER') => {
      if (!organization) throw new Error('No organization selected')

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/organizations/${organization.id}/members/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to invite member')
        }

        await refreshOrganization()
        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [organization, refreshOrganization]
  )

  const updateMemberRole = useCallback(
    async (userId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
      if (!organization) throw new Error('No organization selected')

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/organizations/${organization.id}/members/${userId}/role`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update member role')
        }

        await refreshOrganization()
        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [organization, refreshOrganization]
  )

  const removeMember = useCallback(
    async (userId: string) => {
      if (!organization) throw new Error('No organization selected')

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/organizations/${organization.id}/members/${userId}`,
          {
            method: 'DELETE',
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove member')
        }

        await refreshOrganization()
        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [organization, refreshOrganization]
  )

  return {
    loading,
    error,
    inviteMember,
    updateMemberRole,
    removeMember,
  }
}