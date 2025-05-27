import { createClient } from '@/lib/supabase/server'
import { createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Auth service class
export class AuthService {
  // Sign up with email/password
  static async signUp(data: z.infer<typeof signUpSchema>) {
    const supabase = createClient()
    
    const { error, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Create user profile
    if (authData.user) {
      await supabase.from('profiles').insert({
        user_id: authData.user.id,
        // Additional profile fields can be added here
      })
    }

    return { data: authData }
  }

  // Sign in with email/password
  static async signIn(data: z.infer<typeof signInSchema>) {
    const supabase = createClient()
    
    const { error, data: authData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return { error: error.message }
    }

    return { data: authData }
  }

  // Sign in with OAuth provider
  static async signInWithProvider(provider: 'google' | 'github') {
    const supabase = createClient()
    
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  }

  // Sign in with magic link
  static async signInWithMagicLink(email: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  // Send password reset email
  static async resetPassword(email: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  // Update password
  static async updatePassword(password: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  // Sign out
  static async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  // Get current user
  static async getUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return { user, profile }
  }

  // Get session
  static async getSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    return { session, error }
  }

  // Refresh session
  static async refreshSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    return { session, error }
  }

  // Verify email with OTP
  static async verifyOtp(email: string, token: string, type: 'signup' | 'magiclink' = 'signup') {
    const supabase = createClient()
    
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  }

  // Enable 2FA
  static async enable2FA() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  }

  // Verify 2FA
  static async verify2FA(code: string, factorId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      code,
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  }

  // Check if user needs 2FA
  static async check2FARequired() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { required: false }
    }

    const { data: factors } = await supabase.auth.mfa.listFactors()
    
    return {
      required: factors && factors.length > 0,
      factors,
    }
  }

  // Session management
  static async createSession(userId: string, metadata?: any) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        user_agent: metadata?.userAgent,
        ip_address: metadata?.ipAddress,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data }
  }

  // List user sessions
  static async listSessions(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { data }
  }

  // Revoke session
  static async revokeSession(sessionId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  // Check user permissions
  static async checkPermission(permission: string): Promise<boolean> {
    const { user } = await this.getUser()
    
    if (!user) {
      return false
    }

    // Add your permission logic here
    // For now, just check if user exists
    return true
  }

  // Protected route helper
  static async requireAuth(redirectTo: string = '/login') {
    const { user } = await this.getUser()
    
    if (!user) {
      redirect(redirectTo)
    }

    return user
  }

  // Admin route helper
  static async requireAdmin(redirectTo: string = '/dashboard') {
    const { user, profile } = await this.getUser()
    
    if (!user || !profile) {
      redirect('/login')
    }

    const { data: userData } = await createClient()
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN')) {
      redirect(redirectTo)
    }

    return { user, profile, role: userData.role }
  }
}