'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { useOrganization } from './use-organization'

interface StorageQuota {
  used: number
  limit: number
  percentage: number
}

export function useStorageQuota() {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchQuota()
    }
  }, [user, organization])

  const fetchQuota = async () => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(organization?.id && { organizationId: organization.id }),
      })

      const response = await fetch(`/api/storage/quota?${params}`)
      const data = await response.json()

      if (response.ok) {
        setQuota(data)
      }
    } catch (error) {
      console.error('Failed to fetch quota:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    quota,
    loading,
    refreshQuota: fetchQuota,
    formatBytes,
    isUnlimited: quota?.limit === -1,
    isNearLimit: quota ? quota.percentage >= 80 : false,
    isAtLimit: quota ? quota.percentage >= 100 : false,
  }
}