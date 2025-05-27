'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApiKeys } from '@/hooks/use-api-keys'

export function ApiKeys() {
  const { apiKeys, loading, createApiKey, deleteApiKey } = useApiKeys()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyValue, setNewKeyValue] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return

    setCreating(true)
    try {
      const { key } = await createApiKey(newKeyName)
      setNewKeyValue(key)
      setShowCreateDialog(false)
      setShowKeyDialog(true)
      setNewKeyName('')
    } catch (error) {
      console.error('Failed to create API key:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      await deleteApiKey(keyId)
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newKeyValue)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Icons.add className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : apiKeys.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                        {apiKey.key.slice(0, 7)}...{apiKey.key.slice(-4)}
                      </code>
                    </TableCell>
                    <TableCell>
                      {apiKey.last_used_at ? (
                        formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true })
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(apiKey.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.id)}
                      >
                        <Icons.delete className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give your API key a name to help you remember its purpose
            </DialogDescription>
          </DialogHeader>
          
          <div>
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Production API Key"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={creating || !newKeyName.trim()}>
              {creating ? 'Creating...' : 'Create Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show New API Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your New API Key</DialogTitle>
            <DialogDescription>
              Make sure to copy your API key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <code className="text-sm break-all">{newKeyValue}</code>
            </div>
            
            <Button onClick={copyToClipboard} className="w-full">
              <Icons.copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowKeyDialog(false)}>
              I've Saved My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}