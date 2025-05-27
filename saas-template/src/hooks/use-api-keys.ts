'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

interface ApiKey {
  id: string
  name: string
  key: string
  last_used_at?: string
  expires_at?: string
  created_at: string
}

export function useApiKeys() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchApiKeys()
    }
  }, [user])

  const fetchApiKeys = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/api-keys')
      const data = await response.json()

      if (response.ok) {
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = useCallback(async (name: string, expiresIn?: number) => {
    const response = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, expiresIn }),
    })

    if (!response.ok) {
      throw new Error('Failed to create API key')
    }

    const newKey = await response.json()
    await fetchApiKeys()
    
    return newKey
  }, [])

  const deleteApiKey = useCallback(async (keyId: string) => {
    const response = await fetch(`/api/api-keys/${keyId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete API key')
    }

    await fetchApiKeys()
  }, [])

  return {
    apiKeys,
    loading,
    createApiKey,
    deleteApiKey,
    refresh: fetchApiKeys,
  }
}