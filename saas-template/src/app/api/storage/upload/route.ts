import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StorageService } from '@/lib/storage/service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const organizationId = formData.get('organizationId') as string | undefined
    const folderId = formData.get('folderId') as string | undefined
    const isPublic = formData.get('isPublic') === 'true'
    const metadata = formData.get('metadata') as string | undefined

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Verify user ID matches
    if (userId !== user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 })
    }

    const fileRecord = await StorageService.uploadFile(file, {
      userId,
      organizationId,
      folderId,
      isPublic,
      metadata: metadata ? JSON.parse(metadata) : undefined,
    })

    return NextResponse.json(fileRecord)
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}