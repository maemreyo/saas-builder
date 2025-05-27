import { NextRequest, NextResponse } from 'next/server'
import { StorageService } from '@/lib/storage/service'
import { z } from 'zod'

interface Params {
  params: { token: string }
}

const accessSchema = z.object({
  password: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { password } = accessSchema.parse(body)

    const file = await StorageService.accessSharedFile(params.token, password)
    return NextResponse.json(file)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}