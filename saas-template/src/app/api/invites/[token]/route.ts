import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrganizationService } from '@/lib/organizations/service'

interface Params {
  params: { token: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    
    // Get invite details
    const { data: invite, error } = await supabase
      .from('organization_invites')
      .select(`
        *,
        organization:organizations(name, slug)
      `)
      .eq('token', params.token)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    return NextResponse.json(invite)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await OrganizationService.acceptInvite(params.token, user.id)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}