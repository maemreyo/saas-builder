'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'

interface SubscriptionLimits {
  tier: string
  limits: {
    users?: number
    projects?: number
    storage?: number
    apiCalls?: number
    [key: string]: any
  }
}

interface Usage {
  users: number
  projects: number
  storage: number
  apiCalls: number
}

export function useSubscriptionLimits() {
  const { user } = useAuth()
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLimitsAndUsage()
    } else {
      setLimits(null)
      setUsage(null)
      setLoading(false)
    }
  }, [user])

  const fetchLimitsAndUsage = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/billing/limits')
      const data = await response.json()

      if (response.ok) {
        setLimits(data.limits)
        setUsage(data.usage)
      }
    } catch (error) {
      console.error('Failed to fetch limits:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkLimit = (resource: keyof Usage): boolean => {
    if (!limits || !usage) return true
    
    const limit = limits.limits[resource]
    if (limit === -1) return true // Unlimited
    
    return usage[resource] < limit
  }

  const getUsagePercentage = (resource: keyof Usage): number => {
    if (!limits || !usage) return 0
    
    const limit = limits.limits[resource]
    if (!limit || limit === -1) return 0
    
    return Math.round((usage[resource] / limit) * 100)
  }

  return {
    limits,
    usage,
    loading,
    checkLimit,
    getUsagePercentage,
    isFreeTier: limits?.tier === 'free',
    isPro: limits?.tier === 'pro',
    isEnterprise: limits?.tier === 'enterprise',
  }
}