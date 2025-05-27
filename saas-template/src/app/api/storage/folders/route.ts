import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StorageService } from '@/lib/storage/service'
import { z } from 'zod'

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
  organizationId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || undefined
    const parentId = searchParams.get('parentId') || undefined

    const folders = await StorageService.listFolders({
      userId: user.id,
      organizationId,
      parentId,
    })

    return NextResponse.json(folders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createFolderSchema.parse(body)

    const folder = await StorageService.createFolder({
      ...data,
      userId: user.id,
    })

    return NextResponse.json(folder)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}