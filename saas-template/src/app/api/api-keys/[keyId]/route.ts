import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiKeyService } from '@/lib/api-keys/service'

interface Params {
  params: { keyId: string }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ApiKeyService.deleteApiKey(params.keyId, user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}