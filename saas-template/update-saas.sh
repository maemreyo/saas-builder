#!/bin/bash

install_storage() {
    print_info "Installing Storage System..."
    
    # Create storage configuration
    mkdir -p src/lib/storage
    cat > src/lib/storage/client.ts << 'EOL'
import { createClient } from '@/lib/supabase/client'

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  PUBLIC: 'public',
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

interface UploadOptions {
  bucket: StorageBucket
  path: string
  file: File
  upsert?: boolean
}

export async function uploadFile({ bucket, path, file, upsert = false }: UploadOptions) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  return data
}

export async function deleteFile(bucket: StorageBucket, path: string) {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

export async function getPublicUrl(bucket: StorageBucket, path: string) {
  const supabase = createClient()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function downloadFile(bucket: StorageBucket, path: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`)
  }

  return data
}
EOL

    # Create file upload component
    cat > src/components/ui/file-upload.tsx << 'EOL'
'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Upload, X, FileIcon } from 'lucide-react'
import { Button } from './button'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onUpload: (files: File[]) => void | Promise<void>
  className?: string
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize = 10,
  onUpload,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    setError(null)
    
    // Validate file size
    const oversizedFiles = newFiles.filter(
      (file) => file.size > maxSize * 1024 * 1024
    )
    
    if (oversizedFiles.length > 0) {
      setError(`Files must be smaller than ${maxSize}MB`)
      return
    }

    if (multiple) {
      setFiles((prev) => [...prev, ...newFiles])
    } else {
      setFiles(newFiles.slice(0, 1))
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      await onUpload(files)
      setFiles([])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-500">
          {accept && `Accepts: ${accept}`}
          {maxSize && ` (Max ${maxSize}MB)`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md bg-gray-50 p-3"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}
    </div>
  )
}
EOL

    # Create storage hook
    cat > src/hooks/use-storage.ts << 'EOL'
import { useState } from 'react'
import { uploadFile, deleteFile, getPublicUrl, StorageBucket } from '@/lib/storage/client'

export function useStorage() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (
    file: File,
    bucket: StorageBucket,
    path?: string
  ) => {
    setUploading(true)
    setError(null)

    try {
      const fileName = path || `${Date.now()}-${file.name}`
      const result = await uploadFile({
        bucket,
        path: fileName,
        file,
      })

      const publicUrl = getPublicUrl(bucket, result.path)
      
      return { path: result.path, url: publicUrl }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const remove = async (bucket: StorageBucket, path: string) => {
    try {
      await deleteFile(bucket, path)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    upload,
    remove,
    uploading,
    error,
  }
}
EOL

    print_success "Storage system installed!"
}

install_organization_management() {
    print_info "Installing Organization Management..."
    
    # Create organization service
    mkdir -p src/lib/organizations
    cat > src/lib/organizations/service.ts << 'EOL'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
})

export async function createOrganization(userId: string, data: z.infer<typeof createOrganizationSchema>) {
  const supabase = createClient()
  
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert(data)
    .select()
    .single()

  if (orgError) throw orgError

  // Add user as owner
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      user_id: userId,
      organization_id: org.id,
      role: 'OWNER',
    })

  if (memberError) throw memberError

  return org
}

export async function inviteMember(
  organizationId: string,
  data: z.infer<typeof inviteMemberSchema>
) {
  const supabase = createClient()
  
  // Check if user exists
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.email)
    .single()

  if (!user) {
    // Send invitation email
    // TODO: Implement invitation system
    throw new Error('User not found. Invitation system not implemented yet.')
  }

  // Add member
  const { data: member, error } = await supabase
    .from('organization_members')
    .insert({
      user_id: user.id,
      organization_id: organizationId,
      role: data.role,
    })
    .select()
    .single()

  if (error) throw error

  return member
}

export async function removeMember(organizationId: string, userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function updateMemberRole(
  organizationId: string,
  userId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) throw error
}
EOL

    # Create organization hooks
    cat > src/hooks/use-organization.ts << 'EOL'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
}

interface OrganizationMember {
  id: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  user: {
    id: string
    email: string
    name?: string
    avatarUrl?: string
  }
}

export function useOrganization() {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setOrganization(null)
      setMembers([])
      setLoading(false)
      return
    }

    fetchOrganization()
  }, [user])

  const fetchOrganization = async () => {
    const supabase = createClient()
    
    try {
      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select(`
          organization:organizations(*)
        `)
        .eq('user_id', user!.id)
        .single()

      if (membership?.organization) {
        setOrganization(membership.organization as any)
        
        // Fetch members
        const { data: members } = await supabase
          .from('organization_members')
          .select(`
            *,
            user:users(id, email, name, avatar_url)
          `)
          .eq('organization_id', membership.organization.id)

        setMembers(members || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organization')
    } finally {
      setLoading(false)
    }
  }

  return {
    organization,
    members,
    loading,
    error,
    refetch: fetchOrganization,
  }
}
EOL

    # Create organization pages
    mkdir -p "src/app/(dashboard)/organization"
    cat > "src/app/(dashboard)/organization/page.tsx" << 'EOL'
'use client'

import { useOrganization } from '@/hooks/use-organization'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Settings } from 'lucide-react'

export default function OrganizationPage() {
  const { organization, members, loading } = useOrganization()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Organization</h2>
        <p className="text-gray-600 mb-6">You're not part of any organization yet.</p>
        <Button>Create Organization</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{organization.name}</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
EOL

    print_success "Organization management installed!"
}

install_advanced_analytics() {
    print_info "Installing Advanced Analytics..."
    
    # Create PostHog configuration
    mkdir -p src/lib/analytics
    cat > src/lib/analytics/posthog.ts << 'EOL'
import posthog from 'posthog-js'
import { PostHogConfig } from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    const config: Partial<PostHogConfig> = {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // We'll manually track page views
      capture_pageleave: true,
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, config)
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits)
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}

export function trackPageView(url?: string) {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      $current_url: url || window.location.href,
    })
  }
}

export function setUserProperty(property: string, value: any) {
  if (typeof window !== 'undefined') {
    posthog.people.set({ [property]: value })
  }
}

export function resetUser() {
  if (typeof window !== 'undefined') {
    posthog.reset()
  }
}
EOL

    # Create analytics provider
    cat > src/components/providers/analytics-provider.tsx << 'EOL'
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, trackPageView, identifyUser, resetUser } from '@/lib/analytics/posthog'
import { useAuth } from '@/hooks/use-auth'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Initialize PostHog
  useEffect(() => {
    initPostHog()
  }, [])

  // Track page views
  useEffect(() => {
    if (pathname) {
      trackPageView()
    }
  }, [pathname, searchParams])

  // Identify user
  useEffect(() => {
    if (user) {
      identifyUser(user.id, {
        email: user.email,
      })
    } else {
      resetUser()
    }
  }, [user])

  return <>{children}</>
}
EOL

    # Create analytics dashboard component
    cat > src/components/analytics/analytics-dashboard.tsx << 'EOL'
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface AnalyticsData {
  pageViews: { date: string; views: number }[]
  userSignups: { date: string; signups: number }[]
  revenue: { date: string; amount: number }[]
  topPages: { page: string; views: number }[]
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard')
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading analytics...</div>

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">123,456</p>
            <p className="text-sm text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,234</p>
            <p className="text-sm text-gray-500">+5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$12,345</p>
            <p className="text-sm text-gray-500">+18% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.pageViews || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.userSignups || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="signups" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.topPages.map((page, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm">{page.page}</span>
                  <span className="text-sm font-medium">{page.views} views</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
EOL

    print_success "Advanced analytics installed!"
}

install_monitoring() {
    print_info "Installing Monitoring & Error Tracking..."
    
    # Create Sentry configuration
    cat > src/lib/monitoring/sentry.ts << 'EOL'
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error)
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level)
  }
}

export function setUserContext(user: { id: string; email?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(user)
  }
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb(breadcrumb)
  }
}
EOL

    # Create error boundary
    cat > src/components/error-boundary.tsx << 'EOL'
'use client'

import { useEffect } from 'react'
import { captureException } from '@/lib/monitoring/sentry'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
        <p className="mb-8 text-gray-600">
          We've been notified and are working on a fix.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
EOL

    # Create monitoring dashboard
    cat > src/components/admin/system-health.tsx << 'EOL'
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface HealthCheck {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  lastChecked: Date
}

export function SystemHealth() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return
    
    

install_billing_system() {
    print_info "Installing Stripe Billing System..."
    
    # Create Stripe configuration
    cat > src/lib/payments/stripe.ts << 'EOL'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    customer_email: userId, // You might want to get the actual email
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  })

  return session
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}
EOL

    # Create webhook handler
    cat > src/app/api/billing/webhooks/stripe/route.ts << 'EOL'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/payments/stripe'
import { createClient } from '@/lib/supabase/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Create subscription record
      await supabase.from('subscriptions').insert({
        user_id: session.metadata?.userId,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        status: 'active',
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          stripe_current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
EOL

    # Create pricing component
    cat > src/components/billing/pricing-table.tsx << 'EOL'
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/constants/config'
import { useRouter } from 'next/navigation'

export function PricingTable() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {SUBSCRIPTION_PLANS.map((plan) => (
        <div
          key={plan.id}
          className="relative rounded-lg border bg-card p-8 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan.description}
            </p>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold">
              {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
            </span>
            {typeof plan.price === 'number' && (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>

          <ul className="mb-6 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            variant={plan.id === 'pro' ? 'default' : 'outline'}
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading === plan.id}
          >
            {loading === plan.id ? 'Processing...' : 'Get Started'}
          </Button>
        </div>
      ))}
    </div>
  )
}
EOL

    print_success "Billing system installed!"
}

install_ui_components() {
    print_info "Installing UI Components..."
    
    # Create Input component
    cat > src/components/ui/input.tsx << 'EOL'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
EOL

    # Create Label component
    cat > src/components/ui/label.tsx << 'EOL'
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
EOL

    # Create Icons component
    cat > src/components/ui/icons.tsx << 'EOL'
import {
  Loader2,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  Plus,
  Trash,
  Edit,
  Copy,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react'

export const Icons = {
  spinner: Loader2,
  close: X,
  check: Check,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  menu: Menu,
  search: Search,
  user: User,
  logout: LogOut,
  settings: Settings,
  add: Plus,
  delete: Trash,
  edit: Edit,
  copy: Copy,
  moreVertical: MoreVertical,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  google: (props: any) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  ),
  github: (props: any) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  ),
}
EOL

    # Create Card component
    cat > src/components/ui/card.tsx << 'EOL'
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
EOL

    print_success "UI components installed!"
}

install_email_system() {
    print_info "Installing Email System..."
    
    # Create email client
    cat > src/lib/email/client.ts << 'EOL'
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  react,
  text,
}: {
  to: string | string[]
  subject: string
  react?: React.ReactElement
  text?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to,
      subject,
      react,
      text,
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
EOL

    # Create welcome email template
    mkdir -p emails
    cat > emails/welcome.tsx << 'EOL'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  userFirstName: string
  loginLink: string
}

export const WelcomeEmail = ({
  userFirstName,
  loginLink,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to our SaaS platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome, {userFirstName}!</Heading>
        <Text style={text}>
          We're excited to have you on board. Your account has been successfully
          created and you're ready to start using our platform.
        </Text>
        <Link href={loginLink} style={button}>
          Get Started
        </Link>
        <Text style={text}>
          If you have any questions, feel free to reach out to our support team.
        </Text>
        <Text style={footer}>
          Best regards,
          <br />
          The Team
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  margin: '30px auto',
  padding: '12px',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  marginTop: '64px',
}

export default WelcomeEmail
EOL

    print_success "Email system installed!"
}

install_dashboard_layout() {
    print_info "Installing Dashboard Layout..."
    
    # Create sidebar component
    cat > src/components/dashboard/sidebar.tsx << 'EOL'
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  BarChart,
  FileText,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Team', href: '/organization', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">SaaS Template</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
EOL

    # Create dashboard layout
    cat > src/app/\(dashboard\)/layout.tsx << 'EOL'
import { Sidebar } from '@/components/dashboard/sidebar'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
EOL

    print_success "Dashboard layout installed!"
}

install_api_routes() {
    print_info "Installing API Routes..."
    
    # Create user API routes
    cat > src/app/api/users/route.ts << 'EOL'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional(),
})

export async function GET() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ user, profile })
}

export async function PATCH(request: Request) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = updateUserSchema.parse(body)

  const { data, error } = await supabase
    .from('profiles')
    .update(validatedData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
EOL

    # Create health check route
    cat > src/app/api/health/route.ts << 'EOL'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
EOL

    print_success "API routes installed!"
}

install_testing_setup() {
    print_info "Installing Testing Setup..."
    
    # Create Jest configuration
    cat > jest.config.js << 'EOL'
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*): '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
EOL

    # Create Jest setup file
    cat > jest.setup.js << 'EOL'
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}))
EOL

    # Create Playwright configuration
    cat > playwright.config.ts << 'EOL'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
EOL

    # Create sample unit test
    mkdir -p src/lib/__tests__
    cat > src/lib/__tests__/utils.test.ts << 'EOL'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', { 'text-red': true, 'text-blue': false })).toBe('base text-red')
    })
  })

  describe('formatCurrency', () => {
    it('should format cents to dollars', () => {
      expect(formatCurrency(1000)).toBe('$10.00')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€10.00')
    })
  })

  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2024-01-01'
      expect(formatDate(date)).toContain('January')
    })
  })
})
EOL

    print_success "Testing setup installed!"
}

install_realtime_features() {
    print_info "Installing Realtime Features..."

    # Create realtime hook
    cat > src/hooks/use-realtime.ts << 'EOL'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  event?: string
  schema?: string
  table?: string
  filter?: string
}

export function useRealtime<T = any>(
  channel: string,
  options: UseRealtimeOptions = {},
  callback: (payload: T) => void
) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let realtimeChannel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        realtimeChannel = supabase.channel(channel)

        if (options.table) {
          realtimeChannel = realtimeChannel.on(
            'postgres_changes' as any,
            {
              event: options.event || '*',
              schema: options.schema || 'public',
              table: options.table,
              filter: options.filter,
            },
            (payload) => {
              callback(payload as T)
            }
          )
        } else {
          realtimeChannel = realtimeChannel.on(
            'broadcast',
            { event: options.event || '*' },
            (payload) => {
              callback(payload as T)
            }
          )
        }

        await realtimeChannel.subscribe((status) => {
          setIsSubscribed(status === 'SUBSCRIBED')
        })
      } catch (err) {
        setError(err as Error)
      }
    }

    setupSubscription()

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [channel, options.event, options.schema, options.table, options.filter])

  return { isSubscribed, error }
}
EOL

    # Create notification store with realtime
    cat > src/stores/notification-store.ts << 'EOL'
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  subscribeToNotifications: (userId: string) => () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      read: false,
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? state.unreadCount - 1
          : state.unreadCount,
      }
    })
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  subscribeToNotifications: (userId: string) => {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        get().addNotification(payload.payload as any)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
EOL

    print_success "Realtime features installed!"
}

install_admin_dashboard() {
    print_info "Installing Admin Dashboard..."

    # Create admin layout
    cat > src/app/\(admin\)/layout.tsx << 'EOL'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <nav className="flex space-x-4">
              <a href="/admin" className="text-gray-700 hover:text-gray-900">
                Overview
              </a>
              <a href="/admin/users" className="text-gray-700 hover:text-gray-900">
                Users
              </a>
              <a href="/admin/analytics" className="text-gray-700 hover:text-gray-900">
                Analytics
              </a>
              <a href="/admin/settings" className="text-gray-700 hover:text-gray-900">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
EOL

    # Create admin overview page
    cat > src/app/\(admin\)/admin/page.tsx << 'EOL'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminOverviewPage() {
  const supabase = createClient()

  // Get stats
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: subscriptionCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Admin Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{subscriptionCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
EOL

    print_success "Admin dashboard installed!"
}

install_seo_meta() {
    print_info "Installing SEO & Meta Tags..."

    # Create SEO component
    cat > src/components/seo.tsx << 'EOL'
import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  image?: string
  noIndex?: boolean
}

export function generateSEO({
  title,
  description,
  image = '/og-image.png',
  noIndex = false,
}: SEOProps): Metadata {
  const siteName = process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template'
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: `${url}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${url}${image}`],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  }
}
EOL

    print_success "SEO & Meta tags installed!"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to install?"
    echo ""
    echo "1. 🔐 Complete Authentication System"
    echo "2. 💳 Stripe Billing System"
    echo "3. 🎨 UI Components Library"
    echo "4. 📧 Email System (Resend)"
    echo "5. 🏠 Dashboard Layout"
    echo "6. 🔌 API Routes"
    echo "7. 🧪 Testing Setup"
    echo "8. ⚡ Realtime Features"
    echo "9. 👮 Admin Dashboard"
    echo "10. 🔍 SEO & Meta Tags"
    echo "11. 📦 Install All Features"
    echo "12. ❌ Exit"
    echo ""
    read -p "Enter your choice (1-12): " choice

    case $choice in
        1) install_auth_system ;;
        2) install_billing_system ;;
        3) install_ui_components ;;
        4) install_email_system ;;
        5) install_dashboard_layout ;;
        6) install_api_routes ;;
        7) install_testing_setup ;;
        8) install_realtime_features ;;
        9) install_admin_dashboard ;;
        10) install_seo_meta ;;
        11) 
            install_auth_system
            install_billing_system
            install_ui_components
            install_email_system
            install_dashboard_layout
            install_api_routes
            install_testing_setup
            install_realtime_features
            install_admin_dashboard
            install_seo_meta
            ;;
        12) 
            print_info "Exiting..."
            exit 0
            ;;
        *) 
            print_error "Invalid choice"
            ;;
    esac

    # Ask if user wants to continue
    echo ""
    read -p "Would you like to install more features? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_menu
    else
        print_success "All done! Happy coding! 🚀"
    fi
}

# Start the menu
show_menu