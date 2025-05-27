'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Session {
  id: string
  user_agent?: string
  ip_address?: string
  created_at: string
  last_used_at?: string
}

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions')
      }

      setSessions(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    setDeletingId(sessionId)
    setError(null)

    try {
      const response = await fetch(`/api/auth/sessions?id=${sessionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke session')
      }

      setSessions(sessions.filter(s => s.id !== sessionId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const parseUserAgent = (userAgent?: string) => {
    if (!userAgent) return 'Unknown device'
    
    // Simple parser - in production, use a proper user agent parser
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown browser'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions and sign out from other devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : sessions.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            No active sessions found
          </p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Icons.laptop className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {parseUserAgent(session.user_agent)}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {session.ip_address || 'Unknown IP'} •{' '}
                    {formatDistanceToNow(new Date(session.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {index !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(session.id)}
                    disabled={deletingId === session.id}
                  >
                    {deletingId === session.id ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.logout className="h-4 w-4" />
                    )}
                    <span className="sr-only">Revoke session</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}