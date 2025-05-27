import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StorageService } from '@/lib/storage/service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || undefined

    const quota = await StorageService.getStorageQuota(user.id, organizationId)
    return NextResponse.json(quota)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}