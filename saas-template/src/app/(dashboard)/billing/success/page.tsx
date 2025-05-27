// Note: Install canvas-confetti: npm install canvas-confetti @types/canvas-confetti
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import confetti from 'canvas-confetti'

export default function BillingSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icons.check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to Pro!</CardTitle>
          <CardDescription>
            Your subscription has been activated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-600">
              You now have access to all Pro features:
            </p>
            <ul className="space-y-1 text-sm">
              <li>✓ Unlimited users and projects</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Custom integrations</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <p className="text-center text-xs text-gray-500">
              Redirecting in {countdown} seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}