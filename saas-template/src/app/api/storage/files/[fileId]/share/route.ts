import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StorageService } from '@/lib/storage/service'
import { z } from 'zod'

interface Params {
  params: { fileId: string }
}

const shareSchema = z.object({
  expiresIn: z.number().optional(),
  password: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const options = shareSchema.parse(body)

    const result = await StorageService.shareFile(params.fileId, {
      userId: user.id,
      ...options,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}