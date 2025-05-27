import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth/service'
import { cookies } from 'next/headers'

interface Params {
  params: { userId: string }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    
    // Check if user is admin
    const adminUser = await AuthService.requireAdmin()
    
    // Get target user
    const { data: targetUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.userId)
      .single()

    if (error || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Store original user ID for reverting
    cookies().set('impersonating_from', adminUser.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    })

    // Create impersonation session
    // Note: This is a simplified version. In production, you'd want to
    // create a proper impersonation token system
    cookies().set('impersonating_as', targetUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}