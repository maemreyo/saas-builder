'use client'

import { useState } from 'react'
import { FileManager } from '@/components/storage/file-manager'
import { StorageQuota } from '@/components/storage/storage-quota'
import { UploadButton } from '@/components/storage/upload-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FilesPage() {
  const [currentFolder, setCurrentFolder] = useState<string | undefined>()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-gray-600 mt-2">
            Manage your files and documents
          </p>
        </div>
        <UploadButton folderId={currentFolder} />
      </div>

      <StorageQuota />

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <FileManager 
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <FileManager 
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
            sortBy="recent"
          />
        </TabsContent>

        <TabsContent value="shared" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shared Files</CardTitle>
              <CardDescription>
                Files you've shared with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 text-center py-8">
                Shared files will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}