'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './use-auth'
import { useOrganization } from './use-organization'
import { createClient } from '@/lib/supabase/client'

interface UseFilesOptions {
  folderId?: string
  search?: string
  tags?: string[]
  limit?: number
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

interface StorageFolder {
  id: string
  name: string
  parent_id?: string
  user_id: string
  organization_id?: string
  created_at: string
  updated_at: string
}

export function useFiles(options: UseFilesOptions = {}) {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const [files, setFiles] = useState<StorageFile[]>([])
  const [folders, setFolders] = useState<StorageFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)

  const fetchFiles = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        ...(organization?.id && { organizationId: organization.id }),
        ...(options.folderId && { folderId: options.folderId }),
        ...(options.search && { search: options.search }),
        ...(options.tags && { tags: options.tags.join(',') }),
        limit: String(options.limit || 50),
        offset: String(offset),
      })

      const response = await fetch(`/api/storage/files?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files')
      }

      setFiles(data.files)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, organization, options, offset])

  const fetchFolders = useCallback(async () => {
    if (!user) return

    try {
      const params = new URLSearchParams({
        ...(organization?.id && { organizationId: organization.id }),
        ...(options.folderId && { parentId: options.folderId }),
      })

      const response = await fetch(`/api/storage/folders?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch folders')
      }

      setFolders(data)
    } catch (err: any) {
      console.error('Failed to fetch folders:', err)
    }
  }, [user, organization, options.folderId])

  useEffect(() => {
    if (user) {
      fetchFiles()
      fetchFolders()
    }
  }, [user, fetchFiles, fetchFolders])

  const createFolder = async (name: string) => {
    if (!user) throw new Error('Not authenticated')

    try {
      const response = await fetch('/api/storage/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: options.folderId,
          organizationId: organization?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create folder')
      }

      await fetchFolders()
      return data
    } catch (err: any) {
      throw err
    }
  }

  const moveFile = async (fileId: string, targetFolderId: string | null) => {
    if (!user) throw new Error('Not authenticated')

    try {
      const response = await fetch(`/api/storage/files/${fileId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: targetFolderId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to move file')
      }

      await fetchFiles()
      return data
    } catch (err: any) {
      throw err
    }
  }

  const refresh = () => {
    fetchFiles()
    fetchFolders()
  }

  const loadMore = () => {
    if (files.length < total) {
      setOffset(offset + (options.limit || 50))
    }
  }

  return {
    files,
    folders,
    loading,
    error,
    total,
    hasMore: files.length < total,
    createFolder,
    moveFile,
    refresh,
    loadMore,
  }
}