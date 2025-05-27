'use client'

import { formatDistanceToNow } from 'date-fns'
import { FileIcon } from './file-icon'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FileGridProps {
  files: any[]
  folders: any[]
  onFolderClick: (folderId: string) => void
  onDelete: (fileId: string) => void
}

export function FileGrid({ files, folders, onFolderClick, onDelete }: FileGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* Folders */}
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="group relative flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
          onClick={() => onFolderClick(folder.id)}
        >
          <Icons.folder className="h-12 w-12 text-blue-500 mb-2" />
          <span className="text-sm font-medium text-center truncate w-full">
            {folder.name}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icons.moreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Move</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {/* Files */}
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative flex flex-col items-center p-4 rounded-lg hover:bg-gray-50"
        >
          <FileIcon type={file.type} className="h-12 w-12 mb-2" />
          <span className="text-sm font-medium text-center truncate w-full">
            {file.name}
          </span>
          <span className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icons.moreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Move</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(file.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}