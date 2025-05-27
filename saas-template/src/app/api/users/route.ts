import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional(),
})

export async function GET() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ user, profile })
}

export async function PATCH(request: Request) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = updateUserSchema.parse(body)

  const { data, error } = await supabase
    .from('profiles')
    .update(validatedData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
