export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Get verification record
    const { data: verification, error: verifyError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (verifyError || !verification) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: new Date().toISOString(),
        email: verification.email, // Update email if it was changed
      })
      .eq('id', verification.user_id)

    if (updateError) {
      throw new Error('Failed to update user')
    }

    // Delete verification token
    await supabase
      .from('email_verifications')
      .delete()
      .eq('id', verification.id)

    // Log the verification
    await supabase
      .from('activity_logs')
      .insert({
        user_id: verification.user_id,
        action: 'email_verified',
        resource_type: 'user',
        resource_id: verification.user_id,
      })

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error: any) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}