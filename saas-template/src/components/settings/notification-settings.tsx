'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'

interface NotificationPreferences {
  email_marketing: boolean
  email_updates: boolean
  email_security: boolean
  push_enabled: boolean
  push_comments: boolean
  push_mentions: boolean
  push_updates: boolean
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_marketing: false,
    email_updates: true,
    email_security: true,
    push_enabled: false,
    push_comments: true,
    push_mentions: true,
    push_updates: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/users/notification-preferences')
      const data = await response.json()
      if (response.ok) {
        setPreferences(data)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/users/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value })
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert>
          <Icons.check className="h-4 w-4" />
          <AlertDescription>Notification preferences updated successfully</AlertDescription>
        </Alert>
      )}

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-marketing">Marketing emails</Label>
              <p className="text-sm text-gray-500">
                News, product updates, and promotional content
              </p>
            </div>
            <Switch
              id="email-marketing"
              checked={preferences.email_marketing}
              onCheckedChange={(checked) => updatePreference('email_marketing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">Product updates</Label>
              <p className="text-sm text-gray-500">
                Important updates about our service
              </p>
            </div>
            <Switch
              id="email-updates"
              checked={preferences.email_updates}
              onCheckedChange={(checked) => updatePreference('email_updates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-security">Security alerts</Label>
              <p className="text-sm text-gray-500">
                Important notifications about your account security
              </p>
            </div>
            <Switch
              id="email-security"
              checked={preferences.email_security}
              onCheckedChange={(checked) => updatePreference('email_security', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Manage your in-app notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Enable push notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => updatePreference('push_enabled', checked)}
            />
          </div>

          {preferences.push_enabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-comments">Comments</Label>
                  <p className="text-sm text-gray-500">
                    When someone comments on your content
                  </p>
                </div>
                <Switch
                  id="push-comments"
                  checked={preferences.push_comments}
                  onCheckedChange={(checked) => updatePreference('push_comments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-mentions">Mentions</Label>
                  <p className="text-sm text-gray-500">
                    When someone mentions you
                  </p>
                </div>
                <Switch
                  id="push-mentions"
                  checked={preferences.push_mentions}
                  onCheckedChange={(checked) => updatePreference('push_mentions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-updates">Updates</Label>
                  <p className="text-sm text-gray-500">
                    Product updates and announcements
                  </p>
                </div>
                <Switch
                  id="push-updates"
                  checked={preferences.push_updates}
                  onCheckedChange={(checked) => updatePreference('push_updates', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  )
}