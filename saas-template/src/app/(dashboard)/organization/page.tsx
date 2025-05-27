'use client'

import { useState } from 'react'
import { useOrganization } from '@/hooks/use-organization'
import { OrganizationSettings } from '@/components/organization/organization-settings'
import { MembersList } from '@/components/organization/members-list'
import { InvitesList } from '@/components/organization/invites-list'
import { CreateOrganization } from '@/components/organization/create-organization'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'

export default function OrganizationPage() {
  const { organization, loading, error, canManageMembers } = useOrganization()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!organization) {
    return <CreateOrganization />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{organization.name}</h1>
        <p className="text-gray-600 mt-2">
          Manage your organization settings and team members
        </p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          {canManageMembers && <TabsTrigger value="invites">Invites</TabsTrigger>}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <MembersList />
        </TabsContent>

        {canManageMembers && (
          <TabsContent value="invites" className="mt-6">
            <InvitesList />
          </TabsContent>
        )}

        <TabsContent value="settings" className="mt-6">
          <OrganizationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}