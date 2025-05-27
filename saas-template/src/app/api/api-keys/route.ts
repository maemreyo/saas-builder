import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiKeyService } from '@/lib/api-keys/service'
import { z } from 'zod'

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expiresIn: z.number().optional(),
})

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await ApiKeyService.listApiKeys(user.id)
    return NextResponse.json(apiKeys)
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
    const { name, expiresIn } = createApiKeySchema.parse(body)

    const apiKey = await ApiKeyService.createApiKey(user.id, name, expiresIn)
    return NextResponse.json(apiKey)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}