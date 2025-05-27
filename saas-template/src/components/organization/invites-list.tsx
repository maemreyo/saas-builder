'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useOrganization } from '@/hooks/use-organization'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { createClient } from '@/lib/supabase/client'

interface PendingInvite {
  id: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  created_at: string
  expires_at: string
  inviter?: {
    name?: string
    email: string
  }
}

export function InvitesList() {
  const { organization } = useOrganization()
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (organization) {
      fetchInvites()
    }
  }, [organization])

  const fetchInvites = async () => {
    if (!organization) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organization_invites')
        .select(`
          *,
          inviter:users!organization_invites_created_by_fkey(name, email)
        `)
        .eq('organization_id', organization.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvites(data || [])
    } catch (error) {
      console.error('Failed to fetch invites:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelInvite = async (inviteId: string) => {
    setCancellingId(inviteId)
    try {
      const response = await fetch(`/api/organizations/${organization?.id}/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel invite')
      }

      setInvites(invites.filter((i) => i.id !== inviteId))
    } catch (error) {
      console.error('Failed to cancel invite:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default'
      case 'ADMIN':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Icons.spinner className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Manage pending invitations to your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invites.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            No pending invitations
          </p>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getRoleBadgeVariant(invite.role)}>
                      {invite.role}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Invited by {invite.inviter?.name || invite.inviter?.email}{' '}
                      {formatDistanceToNow(new Date(invite.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Expires{' '}
                    {formatDistanceToNow(new Date(invite.expires_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelInvite(invite.id)}
                  disabled={cancellingId === invite.id}
                >
                  {cancellingId === invite.id ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    'Cancel'
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