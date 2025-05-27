import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StorageService } from '@/lib/storage/service'
import { z } from 'zod'

interface Params {
  params: { fileId: string }
}

const moveSchema = z.object({
  folderId: z.string().nullable(),
})

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { folderId } = moveSchema.parse(body)

    const result = await StorageService.moveFile(params.fileId, folderId, user.id)
    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}