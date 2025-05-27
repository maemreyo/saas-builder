import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth/service'
import { z } from 'zod'

interface Params {
  params: { userId: string }
}

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
})

export async function PATCH(request: Request, { params }: Params) {
  try {
    const supabase = createClient()
    
    // Check if user is admin
    const { role: adminRole } = await AuthService.requireAdmin()
    
    // Only super admins can create other super admins
    const body = await request.json()
    const { role } = updateRoleSchema.parse(body)
    
    if (role === 'SUPER_ADMIN' && adminRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admins can create other super admins' },
        { status: 403 }
      )
    }

    // Update user role
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', params.userId)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}