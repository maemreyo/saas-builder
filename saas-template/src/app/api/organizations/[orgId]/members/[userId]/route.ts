import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrganizationService } from '@/lib/organizations/service'

interface Params {
  params: { orgId: string; userId: string }
}

export async function DELETE(request: Request, { params }: Params) {
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

    // Users can remove themselves
    if (!canManage && params.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await OrganizationService.removeMember(params.orgId, params.userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}