import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// File metadata schema
export const fileMetadataSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  folder_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
})

export interface StorageFile {
  id: string
  name: string
  size: number
  type: string
  path: string
  url?: string
  folder_id?: string
  user_id: string
  organization_id?: string
  tags?: string[]
  description?: string
  created_at: string
  updated_at: string
}

export interface StorageFolder {
  id: string
  name: string
  parent_id?: string
  user_id: string
  organization_id?: string
  created_at: string
  updated_at: string
}

export interface StorageQuota {
  used: number
  limit: number
  percentage: number
}

export class StorageService {
  static readonly BUCKET_NAME = 'user-files'
  static readonly PUBLIC_BUCKET_NAME = 'public-files'
  
  // File size limits by plan
  static readonly FILE_SIZE_LIMITS = {
    free: 10 * 1024 * 1024, // 10MB
    pro: 100 * 1024 * 1024, // 100MB
    enterprise: 1024 * 1024 * 1024, // 1GB
  }

  // Storage limits by plan
  static readonly STORAGE_LIMITS = {
    free: 100 * 1024 * 1024, // 100MB
    pro: 10 * 1024 * 1024 * 1024, // 10GB
    enterprise: -1, // Unlimited
  }

  // Upload file
  static async uploadFile(
    file: File,
    options: {
      userId: string
      organizationId?: string
      folderId?: string
      isPublic?: boolean
      metadata?: Partial<z.infer<typeof fileMetadataSchema>>
    }
  ) {
    const supabase = createClient()
    
    // Check file size limit
    const userTier = await this.getUserTier(options.userId)
    const sizeLimit = this.FILE_SIZE_LIMITS[userTier]
    
    if (file.size > sizeLimit) {
      throw new Error(`File size exceeds limit of ${this.formatBytes(sizeLimit)}`)
    }

    // Check storage quota
    const quota = await this.getStorageQuota(options.userId, options.organizationId)
    if (quota.limit !== -1 && quota.used + file.size > quota.limit) {
      throw new Error('Storage quota exceeded')
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = options.organizationId
      ? `organizations/${options.organizationId}/${fileName}`
      : `users/${options.userId}/${fileName}`

    // Upload to Supabase Storage
    const bucket = options.isPublic ? this.PUBLIC_BUCKET_NAME : this.BUCKET_NAME
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL if needed
    let publicUrl: string | undefined
    if (options.isPublic) {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)
      publicUrl = data.publicUrl
    }

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        url: publicUrl,
        folder_id: options.folderId,
        user_id: options.userId,
        organization_id: options.organizationId,
        tags: options.metadata?.tags,
        description: options.metadata?.description,
        is_public: options.isPublic || false,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback storage upload
      await supabase.storage.from(bucket).remove([filePath])
      throw new Error(`Failed to save file metadata: ${dbError.message}`)
    }

    return fileRecord
  }

  // Get file by ID
  static async getFile(fileId: string, userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (error) {
      throw new Error(`File not found: ${error.message}`)
    }

    // Check permissions
    if (!await this.canAccessFile(data, userId)) {
      throw new Error('Access denied')
    }

    return data
  }

  // List files
  static async listFiles(options: {
    userId: string
    organizationId?: string
    folderId?: string
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
  }) {
    const supabase = createClient()
    
    let query = supabase
      .from('files')
      .select('*', { count: 'exact' })

    // Filter by ownership
    if (options.organizationId) {
      query = query.eq('organization_id', options.organizationId)
    } else {
      query = query.eq('user_id', options.userId)
    }

    // Filter by folder
    if (options.folderId !== undefined) {
      query = query.eq('folder_id', options.folderId)
    }

    // Search
    if (options.search) {
      query = query.ilike('name', `%${options.search}%`)
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags)
    }

    // Pagination
    const limit = options.limit || 50
    const offset = options.offset || 0
    query = query.range(offset, offset + limit - 1)

    // Order by created date
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`)
    }

    return {
      files: data || [],
      total: count || 0,
      limit,
      offset,
    }
  }

  // Download file
  static async downloadFile(fileId: string, userId: string) {
    const file = await this.getFile(fileId, userId)
    const supabase = createClient()
    
    // Generate signed URL for private files
    if (!file.is_public) {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(file.path, 3600) // 1 hour expiry

      if (error) {
        throw new Error(`Failed to generate download URL: ${error.message}`)
      }

      return { url: data.signedUrl, filename: file.name }
    }

    // Return public URL
    return { url: file.url, filename: file.name }
  }

  // Delete file
  static async deleteFile(fileId: string, userId: string) {
    const supabase = createClient()
    const file = await this.getFile(fileId, userId)

    // Check permissions
    if (!await this.canDeleteFile(file, userId)) {
      throw new Error('Access denied')
    }

    // Delete from storage
    const bucket = file.is_public ? this.PUBLIC_BUCKET_NAME : this.BUCKET_NAME
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([file.path])

    if (storageError) {
      throw new Error(`Failed to delete file: ${storageError.message}`)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      throw new Error(`Failed to delete file record: ${dbError.message}`)
    }

    return { success: true }
  }

  // Create folder
  static async createFolder(data: {
    name: string
    parentId?: string
    userId: string
    organizationId?: string
  }) {
    const supabase = createClient()
    
    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        name: data.name,
        parent_id: data.parentId,
        user_id: data.userId,
        organization_id: data.organizationId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create folder: ${error.message}`)
    }

    return folder
  }

  // List folders
  static async listFolders(options: {
    userId: string
    organizationId?: string
    parentId?: string
  }) {
    const supabase = createClient()
    
    let query = supabase
      .from('folders')
      .select('*')

    // Filter by ownership
    if (options.organizationId) {
      query = query.eq('organization_id', options.organizationId)
    } else {
      query = query.eq('user_id', options.userId)
    }

    // Filter by parent
    if (options.parentId !== undefined) {
      query = query.eq('parent_id', options.parentId)
    }

    const { data, error } = await query.order('name')

    if (error) {
      throw new Error(`Failed to list folders: ${error.message}`)
    }

    return data || []
  }

  // Move file to folder
  static async moveFile(fileId: string, folderId: string | null, userId: string) {
    const supabase = createClient()
    const file = await this.getFile(fileId, userId)

    // Check permissions
    if (!await this.canAccessFile(file, userId)) {
      throw new Error('Access denied')
    }

    const { error } = await supabase
      .from('files')
      .update({ folder_id: folderId })
      .eq('id', fileId)

    if (error) {
      throw new Error(`Failed to move file: ${error.message}`)
    }

    return { success: true }
  }

  // Get storage quota
  static async getStorageQuota(userId: string, organizationId?: string): Promise<StorageQuota> {
    const supabase = createClient()
    
    // Get user tier
    const tier = await this.getUserTier(userId)
    const limit = this.STORAGE_LIMITS[tier]

    // Calculate used storage
    let query = supabase
      .from('files')
      .select('size')

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else {
      query = query.eq('user_id', userId)
    }

    const { data } = await query
    const used = data?.reduce((total, file) => total + file.size, 0) || 0

    return {
      used,
      limit,
      percentage: limit === -1 ? 0 : Math.round((used / limit) * 100),
    }
  }

  // Share file
  static async shareFile(fileId: string, options: {
    userId: string
    expiresIn?: number // hours
    password?: string
  }) {
    const supabase = createClient()
    const file = await this.getFile(fileId, options.userId)

    // Generate share token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (options.expiresIn || 24))

    const { data, error } = await supabase
      .from('file_shares')
      .insert({
        file_id: fileId,
        token,
        expires_at: expiresAt.toISOString(),
        password_hash: options.password ? await this.hashPassword(options.password) : null,
        created_by: options.userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create share link: ${error.message}`)
    }

    return {
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shared/${token}`,
      token,
      expiresAt: data.expires_at,
    }
  }

  // Access shared file
  static async accessSharedFile(token: string, password?: string) {
    const supabase = createClient()
    
    const { data: share, error } = await supabase
      .from('file_shares')
      .select('*, file:files(*)')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error || !share) {
      throw new Error('Invalid or expired share link')
    }

    // Check password if required
    if (share.password_hash && !password) {
      throw new Error('Password required')
    }

    if (share.password_hash && password) {
      const isValid = await this.verifyPassword(password, share.password_hash)
      if (!isValid) {
        throw new Error('Invalid password')
      }
    }

    // Increment access count
    await supabase
      .from('file_shares')
      .update({ access_count: share.access_count + 1 })
      .eq('id', share.id)

    return share.file
  }

  // Helper methods
  private static async getUserTier(userId: string): Promise<'free' | 'pro' | 'enterprise'> {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('subscriptions')
      .select('stripe_price_id')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .single()

    if (!data) return 'free'

    // Map price IDs to tiers
    if (data.stripe_price_id === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
      return 'pro'
    }
    
    // Add more tier mappings as needed
    return 'free'
  }

  private static async canAccessFile(file: any, userId: string): Promise<boolean> {
    // User owns the file
    if (file.user_id === userId) return true

    // Check organization membership
    if (file.organization_id) {
      const supabase = createClient()
      const { data } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', file.organization_id)
        .eq('user_id', userId)
        .single()

      return !!data
    }

    return false
  }

  private static async canDeleteFile(file: any, userId: string): Promise<boolean> {
    // For now, same as access permissions
    // Could add more complex logic here
    return this.canAccessFile(file, userId)
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private static async hashPassword(password: string): Promise<string> {
    // In a real app, use bcrypt or similar
    // This is a placeholder
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
  }

  private static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }
}