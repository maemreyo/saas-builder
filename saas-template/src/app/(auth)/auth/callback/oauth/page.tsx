'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Icons } from '@/components/ui/icons'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // Get the error from URL if any
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          setError(errorDescription || 'Authentication failed')
          setLoading(false)
          return
        }

        // Get the code from URL
        const code = searchParams.get('code')
        
        if (!code) {
          setError('No authorization code received')
          setLoading(false)
          return
        }

        // Exchange code for session
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (authError) {
          setError(authError.message)
          setLoading(false)
          return
        }

        // Check if this is a new user
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single()

          // If no profile exists, create one with OAuth data
          if (!profile) {
            await supabase.from('profiles').insert({
              user_id: data.user.id,
              // Add any additional profile fields from OAuth provider
            })
          }

          // Update user metadata if needed
          const userMetadata = data.user.user_metadata
          if (userMetadata.name || userMetadata.full_name || userMetadata.avatar_url) {
            await supabase.from('users').update({
              name: userMetadata.name || userMetadata.full_name,
              avatar_url: userMetadata.avatar_url,
            }).eq('id', data.user.id)
          }
        }

        // Redirect to dashboard or intended destination
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        router.push(redirectTo)
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
        setLoading(false)
      }
    }

    handleOAuthCallback()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">Completing sign in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <a
              href="/login"
              className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
            >
              Back to Login
            </a>
            
            <p className="text-center text-xs text-gray-500">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}