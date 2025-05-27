'use client'

import { Icons } from '@/components/ui/icons'

interface FileIconProps {
  type: string
  className?: string
}

export function FileIcon({ type, className }: FileIconProps) {
  const getIcon = () => {
    if (type.startsWith('image/')) {
      return <Icons.image className={className} />
    }
    if (type.startsWith('video/')) {
      return <Icons.video className={className} />
    }
    if (type.startsWith('audio/')) {
      return <Icons.music className={className} />
    }
    if (type === 'application/pdf') {
      return <Icons.fileText className={className} />
    }
    if (
      type === 'application/zip' ||
      type === 'application/x-zip-compressed' ||
      type === 'application/x-rar-compressed'
    ) {
      return <Icons.archive className={className} />
    }
    if (
      type.includes('spreadsheet') ||
      type.includes('excel') ||
      type === 'text/csv'
    ) {
      return <Icons.sheet className={className} />
    }
    if (
      type.includes('document') ||
      type.includes('word') ||
      type === 'text/plain'
    ) {
      return <Icons.fileText className={className} />
    }
    if (type.includes('presentation') || type.includes('powerpoint')) {
      return <Icons.presentation className={className} />
    }
    
    return <Icons.file className={className} />
  }

  return getIcon()
}