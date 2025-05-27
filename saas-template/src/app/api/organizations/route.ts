import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OrganizationService, createOrganizationSchema } from '@/lib/organizations/service'
import { z } from 'zod'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizations = await OrganizationService.getUserOrganizations(user.id)
    return NextResponse.json(organizations)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createOrganizationSchema.parse(body)

    const organization = await OrganizationService.createOrganization(data, user.id)
    return NextResponse.json(organization)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}