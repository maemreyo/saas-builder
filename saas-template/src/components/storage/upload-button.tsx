'use client'

import { useState, useRef } from 'react'
import { useStorage } from '@/hooks/use-storage'
import { useFiles } from '@/hooks/use-files'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

interface UploadButtonProps {
  folderId?: string
}

export function UploadButton({ folderId }: UploadButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading } = useStorage()
  const { refresh } = useFiles({ folderId })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setShowDialog(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentFile(file.name)
      setUploadProgress((i / files.length) * 100)

      try {
        await upload(file, {
          folderId,
          onProgress: (progress) => {
            setUploadProgress(((i + progress / 100) / files.length) * 100)
          },
        })
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }

    setUploadProgress(100)
    refresh()
    
    setTimeout(() => {
      setShowDialog(false)
      setCurrentFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }, 1000)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Icons.upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploading Files</DialogTitle>
            <DialogDescription>
              {currentFile ? `Uploading ${currentFile}...` : 'Preparing upload...'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center text-gray-500">
              {Math.round(uploadProgress)}% complete
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}