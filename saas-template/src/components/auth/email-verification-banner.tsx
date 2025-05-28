'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { X } from 'lucide-react'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const { userData } = useUser()
  const [show, setShow] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Don't show if no user or email is verified
  if (!user || !show || userData?.email_verified) {
    return null
  }

  const handleResendVerification = async () => {
    setSending(true)
    setError(null)
    setSent(false)

    try {
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email')
      }

      setSent(true)
      setTimeout(() => setSent(false), 5000) // Reset after 5 seconds
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <Icons.alertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm text-amber-900">
              <span className="font-medium">Verify your email address</span>
              <span className="ml-1">
                to access all features. Check your inbox for a verification link.
              </span>
              {error && (
                <span className="ml-1 text-red-600">Error: {error}</span>
              )}
              {sent && (
                <span className="ml-1 text-green-600">
                  Verification email sent! Check your inbox.
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendVerification}
              disabled={sending || sent}
              className="text-amber-900 hover:text-amber-700 hover:bg-amber-100"
            >
              {sending ? (
                <>
                  <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <Icons.check className="mr-2 h-3 w-3" />
                  Sent!
                </>
              ) : (
                'Resend email'
              )}
            </Button>
            
            <button
              onClick={() => setShow(false)}
              className="text-amber-600 hover:text-amber-700"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to check if user needs to verify email
export function useEmailVerification() {
  const { user } = useAuth()
  const { userData, loading } = useUser()
  const [needsVerification, setNeedsVerification] = useState(false)

  useEffect(() => {
    if (!loading && user && userData) {
      setNeedsVerification(!userData.email_verified)
    }
  }, [user, userData, loading])

  return {
    needsVerification,
    isLoading: loading,
  }
}