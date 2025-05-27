import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrganizationService, updateOrganizationSchema } from '@/lib/organizations/service'
import { z } from 'zod'

interface Params {
  params: { orgId: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organization = await OrganizationService.getOrganization(params.orgId)
    
    // Check if user is a member
    const role = await OrganizationService.getUserRole(organization.id, user.id)
    if (!role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(organization)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const canManage = await OrganizationService.canUserPerformAction(
      params.orgId,
      user.id,
      'manage_members' // Admins can update org details
    )

    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateOrganizationSchema.parse(body)

    const organization = await OrganizationService.updateOrganization(params.orgId, data)
    return NextResponse.json(organization)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const canDelete = await OrganizationService.canUserPerformAction(
      params.orgId,
      user.id,
      'delete_organization'
    )

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await OrganizationService.deleteOrganization(params.orgId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}