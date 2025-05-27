import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export interface ApiKey {
  id: string
  user_id: string
  name: string
  key: string
  last_used_at?: string
  expires_at?: string
  created_at: string
}

export class ApiKeyService {
  // Generate a secure API key
  static generateApiKey(): string {
    const prefix = 'sk_'
    const randomBytes = crypto.randomBytes(32)
    const key = randomBytes.toString('base64url')
    return `${prefix}${key}`
  }

  // Hash API key for storage
  static async hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  // Create new API key
  static async createApiKey(userId: string, name: string, expiresIn?: number) {
    const supabase = createClient()
    
    // Generate key
    const apiKey = this.generateApiKey()
    const hashedKey = await this.hashApiKey(apiKey)
    
    // Calculate expiry
    let expiresAt: string | null = null
    if (expiresIn) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + expiresIn)
      expiresAt = expiry.toISOString()
    }

    // Store in database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key: hashedKey,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Return the actual key (only shown once)
    return {
      ...data,
      key: apiKey, // Return unhashed key
    }
  }

  // List user's API keys
  static async listApiKeys(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    // Mask the keys for display
    return data.map(key => ({
      ...key,
      key: `${key.key.slice(0, 7)}...${key.key.slice(-4)}`,
    }))
  }

  // Delete API key
  static async deleteApiKey(keyId: string, userId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  // Validate API key
  static async validateApiKey(apiKey: string) {
    const supabase = createClient()
    const hashedKey = await this.hashApiKey(apiKey)
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('*, user:users(*)')
      .eq('key', hashedKey)
      .single()

    if (error || !data) {
      return { valid: false }
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false }
    }

    // Update last used
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)

    return {
      valid: true,
      user: data.user,
      keyId: data.id,
    }
  }
}