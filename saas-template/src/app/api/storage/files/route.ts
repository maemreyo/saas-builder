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
    const folderId = searchParams.get('folderId') || undefined
    const search = searchParams.get('search') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await StorageService.listFiles({
      userId: user.id,
      organizationId,
      folderId,
      search,
      tags,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('List files error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}