'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc } from '@/components/ui/dialog'

interface TwoFactorSetupProps {
  isEnabled?: boolean
  onUpdate?: () => void
}

export function TwoFactorSetup({ isEnabled = false, onUpdate }: TwoFactorSetupProps) {
  const [showSetup, setShowSetup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [setupComplete, setSetupComplete] = useState(false)

  const enable2FA = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable 2FA')
      }

      setQrCode(data.qrCode)
      setSecret(data.secret)
      setFactorId(data.factorId)
      setShowSetup(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async () => {
    if (!factorId || !verificationCode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          factorId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      setSetupComplete(true)
      setTimeout(() => {
        setShowSetup(false)
        setSetupComplete(false)
        setQrCode(null)
        setSecret(null)
        setVerificationCode('')
        if (onUpdate) onUpdate()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real app, you'd need to get the factor ID from somewhere
      // For now, we'll assume it's stored or can be retrieved
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factorId: 'current-factor-id', // This should be the actual factor ID
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <Button
              onClick={isEnabled ? disable2FA : enable2FA}
              variant={isEnabled ? 'destructive' : 'default'}
              size="sm"
              disabled={loading}
            >
              {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {isEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDesc>
              Scan the QR code with your authenticator app
            </DialogDesc>
          </DialogHeader>

          {setupComplete ? (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Icons.check className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium">2FA Enabled Successfully!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {qrCode && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-lg border bg-white p-4">
                    <QRCodeSVG value={qrCode} size={200} />
                  </div>
                  
                  <div className="w-full space-y-2">
                    <p className="text-sm text-gray-600">
                      Can't scan? Enter this code manually:
                    </p>
                    <code className="block rounded bg-gray-100 p-2 text-xs">
                      {secret}
                    </code>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSetup(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={verify2FA}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}