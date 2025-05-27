'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error: error.message }
      }

      router.push('/dashboard')
      return { error: null }
    },
    [supabase.auth, router]
  )

  const signUp = useCallback(
    async (email: string, password: string, metadata?: any) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error: error.message }
      }

      return { error: null, data }
    },
    [supabase.auth]
  )

  const signInWithProvider = useCallback(
    async (provider: 'google' | 'github') => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error: error.message }
      }

      return { error: null }
    },
    [supabase.auth]
  )

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return { error: error.message }
    }

    router.push('/login')
    return { error: null }
  }, [supabase.auth, router])

  const resetPassword = useCallback(
    async (email: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error: error.message }
      }

      setState((prev) => ({ ...prev, loading: false }))
      return { error: null }
    },
    [supabase.auth]
  )

  const updatePassword = useCallback(
    async (password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error: error.message }
      }

      setState((prev) => ({ ...prev, loading: false }))
      return { error: null }
    },
    [supabase.auth]
  )

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
  }
}