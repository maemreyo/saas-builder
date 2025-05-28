'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setVerified(true)
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  const resendVerification = async () => {
    setError(null)
    setVerifying(true)

    try {
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification')
      }

      setError(null)
      alert('Verification email sent! Please check your inbox.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  // If no token, show resend form
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We need to verify your email address before you can continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Icons.mail className="h-4 w-4" />
              <AlertDescription>
                Check your email for a verification link. If you didn't receive it,
                you can request a new one.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={resendVerification} 
              disabled={verifying}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already verified? </span>
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verifying state
  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icons.check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Email Verified!</h2>
          <p className="text-gray-600">
            Your email has been successfully verified.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Verification Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription>
                The verification link may be expired or invalid.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={resendVerification} 
              disabled={verifying}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Request New Verification Email'
              )}
            </Button>

            <div className="text-center text-sm">
              <a href="/login" className="text-primary hover:underline">
                Back to login
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}