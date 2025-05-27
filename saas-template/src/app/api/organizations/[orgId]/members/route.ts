import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrganizationService } from '@/lib/organizations/service'

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

    // Check if user is a member
    const role = await OrganizationService.getUserRole(params.orgId, user.id)
    if (!role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const members = await OrganizationService.getMembers(params.orgId)
    return NextResponse.json(members)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}