'use client'

import { format } from 'date-fns'
import { useBilling } from '@/hooks/use-billing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

export function CurrentPlan() {
  const {
    subscription,
    isSubscribed,
    isCanceled,
    subscriptionEndDate,
    cancelSubscription,
    resumeSubscription,
    openBillingPortal,
    loading,
  } = useBilling()

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    try {
      await cancelSubscription()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    }
  }

  const handleResumeSubscription = async () => {
    try {
      await resumeSubscription()
    } catch (error) {
      console.error('Failed to resume subscription:', error)
    }
  }

  if (!isSubscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the free plan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Upgrade to a paid plan to unlock more features and remove limitations.
          </p>
          <Button>View Plans</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {isCanceled
                ? `Your subscription will end on ${format(subscriptionEndDate!, 'MMMM d, yyyy')}`
                : 'Manage your subscription and billing'}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={openBillingPortal}>
            <Icons.settings className="h-4 w-4 mr-2" />
            Manage Billing
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">Pro Plan</p>
              <p className="text-sm text-gray-600">$29/month</p>
            </div>
            <Badge variant={isCanceled ? 'destructive' : 'default'}>
              {isCanceled ? 'Canceling' : 'Active'}
            </Badge>
          </div>

          {isCanceled && (
            <Alert>
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription is set to cancel at the end of the current billing period.
                You'll still have access to Pro features until {format(subscriptionEndDate!, 'MMMM d, yyyy')}.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            {isCanceled ? (
              <Button onClick={handleResumeSubscription} disabled={loading}>
                Resume Subscription
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}