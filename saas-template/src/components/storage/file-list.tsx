'use client'

import { formatDistanceToNow } from 'date-fns'
import { FileIcon } from './file-icon'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FileListProps {
  files: any[]
  folders: any[]
  onFolderClick: (folderId: string) => void
  onDelete: (fileId: string) => void
}

export function FileList({ files, folders, onFolderClick, onDelete }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const items = [
    ...folders.map(f => ({ ...f, isFolder: true })),
    ...files.map(f => ({ ...f, isFolder: false })),
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Modified</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => item.isFolder && onFolderClick(item.id)}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox />
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-3">
                {item.isFolder ? (
                  <Icons.folder className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileIcon type={item.type} className="h-5 w-5" />
                )}
                <span className="font-medium">{item.name}</span>
              </div>
            </TableCell>
            <TableCell>
              {item.isFolder ? '—' : formatFileSize(item.size)}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Icons.moreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!item.isFolder && (
                    <>
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem>Move</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => !item.isFolder && onDelete(item.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}