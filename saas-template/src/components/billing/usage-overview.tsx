'use client'

import { useSubscriptionLimits } from '@/hooks/use-subscription-limits'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface UsageItemProps {
  label: string
  used: number
  limit: number
  unit?: string
}

function UsageItem({ label, used, limit, unit = '' }: UsageItemProps) {
  const percentage = limit === -1 ? 0 : Math.round((used / limit) * 100)
  const isUnlimited = limit === -1
  const isNearLimit = percentage >= 80 && !isUnlimited
  const isAtLimit = percentage >= 100 && !isUnlimited

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">
          {used.toLocaleString()}{unit}
          {!isUnlimited && ` / ${limit.toLocaleString()}${unit}`}
          {isUnlimited && ' / Unlimited'}
        </span>
      </div>
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isAtLimit && "bg-red-100",
            isNearLimit && !isAtLimit && "bg-orange-100"
          )}
        />
      )}
    </div>
  )
}

export function UsageOverview() {
  const { limits, usage, loading, isFreeTier } = useSubscriptionLimits()

  if (loading || !limits || !usage) {
    return null
  }

  const hasAnyLimitWarning = Object.keys(usage).some((key) => {
    const limit = limits.limits[key as keyof typeof usage]
    if (!limit || limit === -1) return false
    const percentage = (usage[key as keyof typeof usage] / limit) * 100
    return percentage >= 80
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
        <CardDescription>
          Track your usage against your plan limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasAnyLimitWarning && (
          <Alert>
            <Icons.alertCircle className="h-4 w-4" />
            <AlertDescription>
              You're approaching one or more of your plan limits. Consider upgrading to continue growing.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <UsageItem
            label="Team Members"
            used={usage.users}
            limit={limits.limits.users || 0}
          />
          <UsageItem
            label="Projects"
            used={usage.projects}
            limit={limits.limits.projects || 0}
          />
          <UsageItem
            label="Storage"
            used={Math.round(usage.storage / (1024 * 1024))} // Convert to MB
            limit={Math.round((limits.limits.storage || 0) / (1024 * 1024))}
            unit="MB"
          />
          <UsageItem
            label="API Calls (this month)"
            used={usage.apiCalls}
            limit={limits.limits.apiCalls || 0}
          />
        </div>

        {isFreeTier && (
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              Upgrade to Pro to unlock unlimited usage and advanced features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}