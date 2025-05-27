'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const isPasswordReset = searchParams.get('type') === 'recovery'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { resetPassword, updatePassword } = useAuth()
  const router = useRouter()

  // If user came from email link, show password update form
  if (isPasswordReset) {
    const handlePasswordUpdate = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }

      setLoading(true)
      const { error } = await updatePassword(password)

      if (error) {
        setError(error)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }

    if (success) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <Icons.check className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="text-2xl font-bold">Password updated successfully!</h2>
            <p className="text-sm text-gray-600">
              Redirecting you to the dashboard...
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Set new password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your new password below
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handlePasswordUpdate}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Otherwise show password reset request form
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Icons.check className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Forgot your password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries, we'll send you reset instructions
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetRequest}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}