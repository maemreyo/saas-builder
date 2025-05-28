import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EmailService } from '@/lib/email/service'
import { z } from 'zod'

const resendVerificationSchema = z.object({
  email: z.string().email().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = resendVerificationSchema.parse(body)
    
    // Use provided email or user's email
    const targetEmail = email || user.email
    
    if (!targetEmail) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 })
    }

    // Check if already verified
    const { data: userData } = await supabase
      .from('users')
      .select('email_verified')
      .eq('id', user.id)
      .single()

    if (userData?.email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    // Generate verification token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    // Store verification token
    const { error: tokenError } = await supabase
      .from('email_verifications')
      .insert({
        user_id: user.id,
        email: targetEmail,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      throw new Error('Failed to create verification token')
    }

    // Send verification email
    await EmailService.sendVerificationEmail({
      to: targetEmail,
      verificationLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`,
      userName: userData?.name,
    })

    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}