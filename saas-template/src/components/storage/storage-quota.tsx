'use client'

import { useStorageQuota } from '@/hooks/use-storage-quota'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'

export function StorageQuota() {
  const { quota, loading, formatBytes, isUnlimited, isNearLimit, isAtLimit } = useStorageQuota()

  if (loading || !quota) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Storage Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{formatBytes(quota.used)} used</span>
            <span>
              {isUnlimited ? 'Unlimited' : formatBytes(quota.limit)}
            </span>
          </div>
          
          {!isUnlimited && (
            <Progress 
              value={quota.percentage} 
              className={
                isAtLimit ? 'bg-red-100' : 
                isNearLimit ? 'bg-orange-100' : 
                ''
              }
            />
          )}

          {isAtLimit && (
            <Alert variant="destructive" className="mt-2">
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your storage limit. Delete files or upgrade your plan.
              </AlertDescription>
            </Alert>
          )}

          {isNearLimit && !isAtLimit && (
            <Alert className="mt-2">
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription>
                You're running low on storage. Consider upgrading your plan.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}