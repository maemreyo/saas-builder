import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

interface OAuthProfile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  provider: 'google' | 'github' | 'discord'
}

export class OAuthService {
  // Extract profile data from OAuth user metadata
  static extractProfileData(user: User): OAuthProfile | null {
    const metadata = user.user_metadata
    const identities = user.identities || []
    
    if (!metadata || identities.length === 0) {
      return null
    }

    const provider = identities[0].provider as 'google' | 'github' | 'discord'
    
    switch (provider) {
      case 'google':
        return {
          id: user.id,
          email: user.email || metadata.email,
          name: metadata.full_name || metadata.name,
          avatar_url: metadata.avatar_url || metadata.picture,
          provider,
        }
      
      case 'github':
        return {
          id: user.id,
          email: user.email || metadata.email,
          name: metadata.full_name || metadata.name || metadata.user_name,
          avatar_url: metadata.avatar_url,
          provider,
        }
      
      case 'discord':
        return {
          id: user.id,
          email: user.email || metadata.email,
          name: metadata.full_name || metadata.global_name || metadata.username,
          avatar_url: metadata.avatar_url,
          provider,
        }
      
      default:
        return null
    }
  }

  // Sync OAuth profile data to database
  static async syncOAuthProfile(user: User) {
    const supabase = createClient()
    const profileData = this.extractProfileData(user)
    
    if (!profileData) {
      return { error: 'Unable to extract profile data' }
    }

    try {
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        // Create user record with OAuth data
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: profileData.email,
            name: profileData.name,
            avatar_url: profileData.avatar_url,
            email_verified: new Date().toISOString(), // OAuth users are pre-verified
          })

        if (userError && userError.code !== '23505') { // Ignore duplicate key error
          throw userError
        }
      } else {
        // Update existing user with OAuth data if missing
        const updates: any = {}
        
        if (!existingUser.name && profileData.name) {
          updates.name = profileData.name
        }
        
        if (!existingUser.avatar_url && profileData.avatar_url) {
          updates.avatar_url = profileData.avatar_url
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
        }
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!existingProfile) {
        // Create profile
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            // Additional profile fields can be added here
          })
      }

      // Store OAuth provider info
      await this.storeOAuthProvider(user.id, profileData.provider)

      return { success: true }
    } catch (error: any) {
      console.error('OAuth profile sync error:', error)
      return { error: error.message }
    }
  }

  // Store OAuth provider information
  static async storeOAuthProvider(userId: string, provider: string) {
    const supabase = createClient()
    
    // You might want to create a separate table for this
    // For now, we can store it in user metadata or a JSON field
    try {
      await supabase
        .from('users')
        .update({
          auth_providers: [provider], // Store as array for multiple providers
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Failed to store OAuth provider:', error)
    }
  }

  // Link OAuth account to existing user
  static async linkOAuthAccount(userId: string, provider: 'google' | 'github' | 'discord') {
    const supabase = createClient()
    
    // This would require additional Supabase configuration
    // For now, return a placeholder
    return {
      error: 'Account linking not yet implemented',
    }
  }

  // Unlink OAuth account
  static async unlinkOAuthAccount(userId: string, provider: 'google' | 'github' | 'discord') {
    const supabase = createClient()
    
    // This would require additional Supabase configuration
    // For now, return a placeholder
    return {
      error: 'Account unlinking not yet implemented',
    }
  }
}