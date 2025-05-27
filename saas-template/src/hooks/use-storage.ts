'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import { useOrganization } from './use-organization'

interface UploadOptions {
  folderId?: string
  isPublic?: boolean
  metadata?: {
    tags?: string[]
    description?: string
  }
  onProgress?: (progress: number) => void
}

interface StorageFile {
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

export function useStorage() {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const upload = useCallback(
    async (file: File, options: UploadOptions = {}) => {
      if (!user) throw new Error('Not authenticated')

      setUploading(true)
      setError(null)

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', user.id)
        if (organization?.id) {
          formData.append('organizationId', organization.id)
        }
        if (options.folderId) {
          formData.append('folderId', options.folderId)
        }
        if (options.isPublic) {
          formData.append('isPublic', 'true')
        }
        if (options.metadata) {
          formData.append('metadata', JSON.stringify(options.metadata))
        }

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setUploading(false)
      }
    },
    [user, organization]
  )

  const deleteFile = useCallback(
    async (fileId: string) => {
      if (!user) throw new Error('Not authenticated')

      setError(null)

      try {
        const response = await fetch(`/api/storage/files/${fileId}`, {
          method: 'DELETE',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Delete failed')
        }

        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  const downloadFile = useCallback(
    async (fileId: string) => {
      if (!user) throw new Error('Not authenticated')

      setError(null)

      try {
        const response = await fetch(`/api/storage/files/${fileId}/download`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Download failed')
        }

        // Open download URL
        window.open(data.url, '_blank')
        
        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  const shareFile = useCallback(
    async (fileId: string, options?: { expiresIn?: number; password?: string }) => {
      if (!user) throw new Error('Not authenticated')

      setError(null)

      try {
        const response = await fetch(`/api/storage/files/${fileId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options || {}),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Share failed')
        }

        return data
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  return {
    upload,
    deleteFile,
    downloadFile,
    shareFile,
    uploading,
    error,
  }
}