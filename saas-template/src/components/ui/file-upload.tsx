'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
  onUpload: (files: File[]) => Promise<void>
  className?: string
}

export function FileUpload({
  accept = 'image/*',
  maxSize = 5, // 5MB default
  multiple = false,
  onUpload,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)
      
      // Check file size
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > maxSize * 1024 * 1024
      )
      
      if (oversizedFiles.length > 0) {
        setError(`File(s) too large. Maximum size is ${maxSize}MB.`)
        return
      }
      
      if (multiple) {
        setFiles((prev) => [...prev, ...acceptedFiles])
      } else {
        setFiles(acceptedFiles.slice(0, 1))
      }
    },
    [maxSize, multiple]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept.split('/')[0]]: [accept] } : undefined,
    multiple,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setUploading(true)
    setProgress(0)
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 100)
      
      await onUpload(files)
      
      clearInterval(interval)
      setProgress(100)
      
      // Reset after successful upload
      setTimeout(() => {
        setFiles([])
        setUploading(false)
        setProgress(0)
      }, 1000)
    } catch (err) {
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {multiple ? 'Upload multiple files' : 'Upload a single file'} (max: {maxSize}MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center text-sm text-red-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-500"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {uploading ? (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center mt-1">
                Uploading... {progress}%
              </p>
            </div>
          ) : (
            <Button
              onClick={handleUpload}
              className="mt-4 w-full"
              disabled={files.length === 0}
            >
              Upload {files.length} file{files.length !== 1 && 's'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
