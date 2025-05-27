import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const verify2FASchema = z.object({
  code: z.string().length(6),
  factorId: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, factorId } = verify2FASchema.parse(body)
    
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      code,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}