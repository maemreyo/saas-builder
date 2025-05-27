'use client'

import { useState } from 'react'
import { useFiles } from '@/hooks/use-files'
import { useStorage } from '@/hooks/use-storage'
import { FileGrid } from './file-grid'
import { FileList } from './file-list'
import { FolderBreadcrumb } from './folder-breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileManagerProps {
  currentFolder?: string
  onFolderChange: (folderId: string | undefined) => void
  sortBy?: 'recent' | 'name' | 'size'
}

export function FileManager({ currentFolder, onFolderChange, sortBy }: FileManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const { files, folders, loading, error, refresh } = useFiles({
    folderId: currentFolder,
    search,
  })
  const { deleteFile } = useStorage()

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      await deleteFile(fileId)
      refresh()
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
            icon={<Icons.search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-gray-100' : ''}
          >
            <Icons.grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-gray-100' : ''}
          >
            <Icons.list className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Icons.sort className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Name</DropdownMenuItem>
              <DropdownMenuItem>Date modified</DropdownMenuItem>
              <DropdownMenuItem>Size</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Breadcrumb */}
      <FolderBreadcrumb
        currentFolder={currentFolder}
        onNavigate={onFolderChange}
      />

      {/* Files and folders */}
      {viewMode === 'grid' ? (
        <FileGrid
          files={files}
          folders={folders}
          onFolderClick={onFolderChange}
          onDelete={handleDelete}
        />
      ) : (
        <FileList
          files={files}
          folders={folders}
          onFolderClick={onFolderChange}
          onDelete={handleDelete}
        />
      )}

      {files.length === 0 && folders.length === 0 && (
        <div className="text-center py-16">
          <Icons.folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No files or folders</p>
        </div>
      )}
    </div>
  )
}