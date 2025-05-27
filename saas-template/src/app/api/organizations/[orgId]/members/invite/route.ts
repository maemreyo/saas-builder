import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrganizationService, inviteMemberSchema } from '@/lib/organizations/service'
import { z } from 'zod'

interface Params {
  params: { orgId: string }
}

export async function POST(request: Request, { params }: Params) {
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
      'manage_members'
    )

    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = inviteMemberSchema.parse(body)

    const invite = await OrganizationService.inviteMember(params.orgId, data, user.id)
    return NextResponse.json(invite)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}