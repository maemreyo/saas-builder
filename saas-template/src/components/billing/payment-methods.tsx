'use client'

import { useState } from 'react'
import { useBilling } from '@/hooks/use-billing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

export function PaymentMethods() {
  const { paymentMethods, removePaymentMethod, addPaymentMethod } = useBilling()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return
    }

    setRemovingId(methodId)
    try {
      await removePaymentMethod(methodId)
    } catch (error) {
      console.error('Failed to remove payment method:', error)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </div>
          <Button onClick={addPaymentMethod} size="sm">
            <Icons.add className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No payment methods on file
          </p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">
                    {method.brand.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">•••• {method.last4}</p>
                    <p className="text-xs text-gray-500">
                      Expires {method.exp_month}/{method.exp_year}
                    </p>
                  </div>
                  {method.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(method.id)}
                  disabled={removingId === method.id || method.is_default}
                >
                  {removingId === method.id ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.delete className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}