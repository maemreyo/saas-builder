import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth/service'

interface Params {
  params: { userId: string }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    
    // Check if user is admin
    await AuthService.requireAdmin()
    
    // Don't allow deleting self
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id === params.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user (cascade will handle related records)
    const { error } = await supabase.auth.admin.deleteUser(params.userId)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}