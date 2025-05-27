'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

interface SessionData {
  id: string
  user_id: string
  token: string
  expires_at: string
  user_agent?: string
  ip_address?: string
  created_at: string
}

export function useSession() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setSessions([])
      setCurrentSession(null)
      setLoading(false)
      return
    }

    fetchSessions()
  }, [user])

  const fetchSessions = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSessions(data)
      // Assume the most recent session is current
      setCurrentSession(data[0] || null)
    }
    setLoading(false)
  }

  const revokeSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (!error) {
      setSessions(sessions.filter(s => s.id !== sessionId))
    }

    return { error }
  }

  const revokeAllSessions = async (exceptCurrent = true) => {
    if (!user) return { error: 'Not authenticated' }

    const sessionsToRevoke = exceptCurrent && currentSession
      ? sessions.filter(s => s.id !== currentSession.id)
      : sessions

    const { error } = await supabase
      .from('sessions')
      .delete()
      .in('id', sessionsToRevoke.map(s => s.id))

    if (!error) {
      setSessions(exceptCurrent && currentSession ? [currentSession] : [])
    }

    return { error }
  }

  return {
    sessions,
    currentSession,
    loading,
    revokeSession,
    revokeAllSessions,
    refreshSessions: fetchSessions,
  }
}