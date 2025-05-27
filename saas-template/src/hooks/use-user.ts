'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

interface UserProfile {
  id: string
  user_id: string
  bio?: string
  website?: string
  location?: string
  timezone: string
  language: string
  created_at: string
  updated_at: string
}

interface UserData {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  created_at: string
}

export function useUser() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setUserData(null)
      setLoading(false)
      return
    }

    const fetchUserData = async () => {
      setLoading(true)

      // Fetch user data
      const { data: userRecord } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userRecord) {
        setUserData(userRecord)
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      setLoading(false)
    }

    fetchUserData()

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as UserProfile)
          }
        }
      )
      .subscribe()

    return () => {
      profileSubscription.unsubscribe()
    }
  }, [user, supabase])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    setProfile(data)
    return { data }
  }

  const updateUser = async (updates: Partial<UserData>) => {
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    setUserData(data)
    return { data }
  }

  return {
    user: userData,
    profile,
    loading,
    updateProfile,
    updateUser,
    isAdmin: userData?.role === 'ADMIN' || userData?.role === 'SUPER_ADMIN',
    isSuperAdmin: userData?.role === 'SUPER_ADMIN',
  }
}