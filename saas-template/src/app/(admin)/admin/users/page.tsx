'use client'

import { useState } from 'react'
import { useAdminUsers } from '@/hooks/use-admin'
import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  created_at: string
  last_sign_in?: string
  subscription?: {
    status: string
    plan: string
  }
}

export default function AdminUsersPage() {
  const { users, loading, stats, updateUserRole, deleteUser, impersonateUser } = useAdminUsers()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name || 'No name'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as string
        return (
          <Badge variant={role === 'SUPER_ADMIN' ? 'default' : role === 'ADMIN' ? 'secondary' : 'outline'}>
            {role.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'subscription',
      header: 'Subscription',
      cell: ({ row }) => {
        const sub = row.original.subscription
        if (!sub) return <span className="text-gray-500">Free</span>
        
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
              {sub.plan}
            </Badge>
            <span className="text-xs text-gray-500">{sub.status}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => {
        return (
          <span className="text-sm text-gray-500">
            {format(new Date(row.getValue('created_at')), 'MMM d, yyyy')}
          </span>
        )
      },
    },
    {
      accessorKey: 'last_sign_in',
      header: 'Last Active',
      cell: ({ row }) => {
        const lastSignIn = row.getValue('last_sign_in') as string | undefined
        if (!lastSignIn) return <span className="text-gray-500">Never</span>
        
        return (
          <span className="text-sm text-gray-500">
            {format(new Date(lastSignIn), 'MMM d, yyyy')}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Icons.moreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user)
                setShowEditDialog(true)
              }}>
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => impersonateUser(user.id)}>
                <Icons.user className="mr-2 h-4 w-4" />
                Impersonate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setSelectedUser(user)
                  setShowDeleteDialog(true)
                }}
              >
                <Icons.delete className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedUser) return
    
    try {
      await updateUserRole(selectedUser.id, newRole as any)
      setShowEditDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      await deleteUser(selectedUser.id)
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-600 mt-2">
          Manage all users in your application
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Icons.user className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Icons.userCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
            <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.paidUsers / stats.totalUsers) * 100)}% conversion
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Icons.shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              With elevated permissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users including their role, subscription status, and activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchColumn="email"
            searchPlaceholder="Search by email..."
          />
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select defaultValue={selectedUser?.role} onValueChange={handleUpdateRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}