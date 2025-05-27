#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Print functions
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Banner
echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🚀 SaaS Template Update Script - Modular Installation          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if we're in a SaaS template project
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "This doesn't appear to be a SaaS template project"
    print_info "Please run this script from the root of your project"
    exit 1
fi

# Create necessary directories
mkdir -p .github/workflows
mkdir -p docs
mkdir -p emails
mkdir -p src/components/ui
mkdir -p src/lib/i18n
mkdir -p src/lib/storage
mkdir -p src/lib/organizations
mkdir -p src/lib/analytics
mkdir -p src/lib/monitoring
mkdir -p public

# Install CI/CD pipeline
install_cicd() {
    print_info "Installing CI/CD Pipeline..."
    
    # Create test workflow
    cat > .github/workflows/test.yml << 'EOL'
name: Test

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
EOL

    # Create security scan workflow
    cat > .github/workflows/security.yml << 'EOL'
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
EOL

    print_success "CI/CD pipeline installed!"
}

# Install documentation
install_documentation() {
    print_info "Installing Documentation System..."
    
    # Create API documentation
    cat > docs/API.md << 'EOL'
# API Documentation

## Authentication

All API endpoints require authentication unless specified otherwise.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Users

#### Get Current User
```
GET /api/users
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "profile": {
    "bio": "...",
    "website": "https://example.com"
  }
}
```

#### Update User Profile
```
PATCH /api/users
```

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Software Developer",
  "website": "https://johndoe.com"
}
```

### Organizations

#### Create Organization
```
POST /api/organizations
```

**Request Body:**
```json
{
  "name": "My Company",
  "slug": "my-company",
  "description": "We build awesome products"
}
```

#### Invite Member
```
POST /api/organizations/:id/members
```

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "MEMBER"
}
```

### Billing

#### Create Checkout Session
```
POST /api/billing/create-checkout
```

**Request Body:**
```json
{
  "priceId": "price_xxx",
  "successUrl": "/billing/success",
  "cancelUrl": "/billing"
}
```

#### Cancel Subscription
```
POST /api/billing/cancel-subscription
```

### Storage

#### Upload File
```
POST /api/storage/upload
```

**Request:** Multipart form data with file

**Response:**
```json
{
  "path": "avatars/user-123.jpg",
  "url": "https://..."
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMITED` - Too many requests
EOL

    # Create component documentation
    cat > docs/COMPONENTS.md << 'EOL'
# Component Documentation

## UI Components

### Button

```tsx
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

### FileUpload

```tsx
import { FileUpload } from '@/components/ui/file-upload'

<FileUpload
  accept="image/*"
  maxSize={5} // MB
  multiple={false}
  onUpload={async (files) => {
    // Handle file upload
  }}
/>
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Hooks

### useAuth

```tsx
import { useAuth } from '@/hooks/use-auth'

const { user, loading, signOut } = useAuth()

if (loading) return <div>Loading...</div>
if (!user) return <div>Not authenticated</div>

return (
  <div>
    Welcome {user.email}
    <button onClick={signOut}>Sign Out</button>
  </div>
)
```

### useStorage

```tsx
import { useStorage } from '@/hooks/use-storage'

const { upload, remove, uploading, error } = useStorage()

const handleUpload = async (file: File) => {
  try {
    const result = await upload(file, 'avatars')
    console.log('Uploaded to:', result.url)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### useRealtime

```tsx
import { useRealtime } from '@/hooks/use-realtime'

const { isSubscribed, error } = useRealtime(
  'notifications',
  {
    event: 'new_notification',
  },
  (payload) => {
    console.log('New notification:', payload)
  }
)
```

### useOrganization

```tsx
import { useOrganization } from '@/hooks/use-organization'

const { organization, members, loading, error } = useOrganization()

if (!organization) {
  return <CreateOrganization />
}

return <TeamDashboard organization={organization} members={members} />
```
EOL

    print_success "Documentation system installed!"
}

# Install email templates
install_more_email_templates() {
    print_info "Installing Additional Email Templates..."
    
    # Create password reset email
    cat > emails/reset-password.tsx << 'EOL'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ResetPasswordEmailProps {
  resetLink: string
  userName?: string
}

export const ResetPasswordEmail = ({
  resetLink,
  userName = 'there',
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Password Reset Request</Heading>
        <Text style={text}>
          Hi {userName},
        </Text>
        <Text style={text}>
          We received a request to reset your password. Click the button below
          to create a new password:
        </Text>
        <Button href={resetLink} style={button}>
          Reset Password
        </Button>
        <Text style={text}>
          If you didn't request this, you can safely ignore this email.
          The link will expire in 1 hour.
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
  textAlign: 'left' as const,
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
  textAlign: 'left' as const,
  marginTop: '64px',
}

export default ResetPasswordEmail
EOL

    # Create invoice email
    cat > emails/invoice.tsx << 'EOL'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components'
import * as React from 'react'

interface InvoiceEmailProps {
  invoiceNumber: string
  customerName: string
  amount: string
  dueDate: string
  items: Array<{
    description: string
    quantity: number
    price: string
    total: string
  }>
  downloadLink: string
}

export const InvoiceEmail = ({
  invoiceNumber,
  customerName,
  amount,
  dueDate,
  items,
  downloadLink,
}: InvoiceEmailProps) => (
  <Html>
    <Head />
    <Preview>Invoice #{invoiceNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Invoice #{invoiceNumber}</Heading>
        
        <Text style={text}>
          Hi {customerName},
        </Text>
        
        <Text style={text}>
          Thank you for your business. Please find your invoice details below:
        </Text>

        <Section style={invoiceDetails}>
          <Row>
            <Column>
              <Text style={label}>Invoice Number:</Text>
              <Text style={value}>{invoiceNumber}</Text>
            </Column>
            <Column>
              <Text style={label}>Due Date:</Text>
              <Text style={value}>{dueDate}</Text>
            </Column>
          </Row>
        </Section>

        <Section style={itemsTable}>
          <Text style={tableHeader}>Items</Text>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={itemDescription}>
                <Text>{item.description}</Text>
              </Column>
              <Column style={itemQuantity}>
                <Text>{item.quantity}</Text>
              </Column>
              <Column style={itemPrice}>
                <Text>{item.price}</Text>
              </Column>
              <Column style={itemTotal}>
                <Text>{item.total}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Section style={totalSection}>
          <Row>
            <Column style={totalLabel}>
              <Text style={totalText}>Total Due:</Text>
            </Column>
            <Column style={totalAmount}>
              <Text style={totalText}>{amount}</Text>
            </Column>
          </Row>
        </Section>

        <Link href={downloadLink} style={button}>
          Download Invoice
        </Link>

        <Text style={footer}>
          If you have any questions about this invoice, please contact our
          support team.
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
  textAlign: 'left' as const,
}

const invoiceDetails = {
  margin: '30px 0',
}

const label = {
  color: '#666',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  marginBottom: '5px',
}

const value = {
  fontSize: '16px',
  color: '#333',
}

const itemsTable = {
  width: '100%',
  margin: '30px 0',
}

const tableHeader = {
  fontSize: '14px',
  color: '#666',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  borderBottom: '1px solid #eee',
  paddingBottom: '5px',
  marginBottom: '10px',
}

const itemRow = {
  borderBottom: '1px solid #eee',
  padding: '10px 0',
}

const itemDescription = {
  width: '50%',
}

const itemQuantity = {
  width: '15%',
}

const itemPrice = {
  width: '15%',
}

const itemTotal = {
  width: '20%',
}

const totalSection = {
  margin: '30px 0',
  borderTop: '1px solid #eee',
  paddingTop: '15px',
}

const totalLabel = {
  width: '80%',
  textAlign: 'right' as const,
}

const totalAmount = {
  width: '20%',
}

const totalText = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
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
  marginTop: '60px',
}

export default InvoiceEmail
EOL

    # Create team invitation email
    cat > emails/team-invitation.tsx << 'EOL'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface TeamInvitationEmailProps {
  inviteLink: string
  inviterName: string
  teamName: string
  recipientEmail: string
  inviteExpiry?: string
}

export const TeamInvitationEmail = ({
  inviteLink,
  inviterName,
  teamName,
  recipientEmail,
  inviteExpiry = '7 days',
}: TeamInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Join {teamName} on our platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Team Invitation</Heading>
        
        <Text style={text}>
          Hi there,
        </Text>
        
        <Text style={text}>
          <strong>{inviterName}</strong> has invited you to join <strong>{teamName}</strong> on our platform.
        </Text>
        
        <Section style={details}>
          <Text style={detailsText}>
            <strong>Team:</strong> {teamName}
          </Text>
          <Text style={detailsText}>
            <strong>Invited by:</strong> {inviterName}
          </Text>
          <Text style={detailsText}>
            <strong>Email:</strong> {recipientEmail}
          </Text>
        </Section>

        <Button href={inviteLink} style={button}>
          Accept Invitation
        </Button>

        <Text style={text}>
          This invitation will expire in {inviteExpiry}. If you have any questions, 
          you can reply directly to this email.
        </Text>
        
        <Text style={text}>
          If you weren't expecting this invitation, you can safely ignore this email.
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
  textAlign: 'left' as const,
  marginBottom: '20px',
}

const details = {
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
  padding: '20px',
  marginBottom: '20px',
}

const detailsText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '5px 0',
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
  textAlign: 'left' as const,
  marginTop: '64px',
}

export default TeamInvitationEmail
EOL

    print_success "Additional email templates installed!"
}

# Install advanced UI components
install_advanced_ui_components() {
    print_info "Installing Advanced UI Components..."
    
    # Create DataTable component
    cat > src/components/ui/data-table.tsx << 'EOL'
'use client'

import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  return (
    <div>
      {searchColumn && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
EOL

    # Create FileUpload component
    cat > src/components/ui/file-upload.tsx << 'EOL'
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
EOL

    # Create Dialog component
    cat > src/components/ui/dialog.tsx << 'EOL'
'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={cn(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 grid w-full gap-4 rounded-b-lg border bg-background p-6 shadow-lg animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:max-w-lg sm:rounded-lg sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
EOL

    print_success "Advanced UI components installed!"
}

# Install internationalization (i18n)
install_i18n() {
    print_info "Installing Internationalization (i18n)..."
    
    # Create i18n configuration
    mkdir -p src/lib/i18n
    cat > src/lib/i18n/config.ts << 'EOL'
export const languages = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'] as const
export type Language = typeof languages[number]

export const defaultLanguage = 'en' as const

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
}

export type TranslationKey = 
  | 'common.welcome'
  | 'common.signIn'
  | 'common.signUp'
  | 'common.signOut'
  | 'common.settings'
  | 'common.profile'
  | 'common.dashboard'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'auth.emailPlaceholder'
  | 'auth.passwordPlaceholder'
  | 'auth.forgotPassword'
  | 'auth.resetPassword'
  | 'auth.createAccount'
  | 'auth.alreadyHaveAccount'
  | 'auth.dontHaveAccount'
  | 'dashboard.welcome'
  | 'dashboard.stats'
  | 'dashboard.recentActivity'
  | 'settings.account'
  | 'settings.appearance'
  | 'settings.billing'
  | 'settings.notifications'
  | 'settings.security'
  | 'billing.currentPlan'
  | 'billing.upgrade'
  | 'billing.downgrade'
  | 'billing.invoices'
  | 'billing.paymentMethods'
  | 'errors.somethingWentWrong'
  | 'errors.pageNotFound'
  | 'errors.unauthorized'
  | 'errors.forbidden'

export type Translations = Record<TranslationKey, string>
EOL

    # Create English translations
    cat > src/lib/i18n/locales/en.ts << 'EOL'
import { Translations } from '../config'

const translations: Translations = {
  'common.welcome': 'Welcome',
  'common.signIn': 'Sign In',
  'common.signUp': 'Sign Up',
  'common.signOut': 'Sign Out',
  'common.settings': 'Settings',
  'common.profile': 'Profile',
  'common.dashboard': 'Dashboard',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'auth.emailPlaceholder': 'Email address',
  'auth.passwordPlaceholder': 'Password',
  'auth.forgotPassword': 'Forgot password?',
  'auth.resetPassword': 'Reset Password',
  'auth.createAccount': 'Create Account',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.dontHaveAccount': 'Don\'t have an account?',
  'dashboard.welcome': 'Welcome to your dashboard',
  'dashboard.stats': 'Stats',
  'dashboard.recentActivity': 'Recent Activity',
  'settings.account': 'Account',
  'settings.appearance': 'Appearance',
  'settings.billing': 'Billing',
  'settings.notifications': 'Notifications',
  'settings.security': 'Security',
  'billing.currentPlan': 'Current Plan',
  'billing.upgrade': 'Upgrade',
  'billing.downgrade': 'Downgrade',
  'billing.invoices': 'Invoices',
  'billing.paymentMethods': 'Payment Methods',
  'errors.somethingWentWrong': 'Something went wrong',
  'errors.pageNotFound': 'Page not found',
  'errors.unauthorized': 'Unauthorized',
  'errors.forbidden': 'Forbidden',
}

export default translations
EOL

    # Create Spanish translations
    cat > src/lib/i18n/locales/es.ts << 'EOL'
import { Translations } from '../config'

const translations: Translations = {
  'common.welcome': 'Bienvenido',
  'common.signIn': 'Iniciar Sesión',
  'common.signUp': 'Registrarse',
  'common.signOut': 'Cerrar Sesión',
  'common.settings': 'Configuración',
  'common.profile': 'Perfil',
  'common.dashboard': 'Panel',
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.loading': 'Cargando...',
  'common.error': 'Error',
  'common.success': 'Éxito',
  'auth.emailPlaceholder': 'Correo electrónico',
  'auth.passwordPlaceholder': 'Contraseña',
  'auth.forgotPassword': '¿Olvidó su contraseña?',
  'auth.resetPassword': 'Restablecer Contraseña',
  'auth.createAccount': 'Crear Cuenta',
  'auth.alreadyHaveAccount': '¿Ya tiene una cuenta?',
  'auth.dontHaveAccount': '¿No tiene una cuenta?',
  'dashboard.welcome': 'Bienvenido a su panel',
  'dashboard.stats': 'Estadísticas',
  'dashboard.recentActivity': 'Actividad Reciente',
  'settings.account': 'Cuenta',
  'settings.appearance': 'Apariencia',
  'settings.billing': 'Facturación',
  'settings.notifications': 'Notificaciones',
  'settings.security': 'Seguridad',
  'billing.currentPlan': 'Plan Actual',
  'billing.upgrade': 'Mejorar',
  'billing.downgrade': 'Reducir',
  'billing.invoices': 'Facturas',
  'billing.paymentMethods': 'Métodos de Pago',
  'errors.somethingWentWrong': 'Algo salió mal',
  'errors.pageNotFound': 'Página no encontrada',
  'errors.unauthorized': 'No autorizado',
  'errors.forbidden': 'Prohibido',
}

export default translations
EOL

    # Create translation hook
    cat > src/lib/i18n/use-translations.ts << 'EOL'
'use client'

import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Language, TranslationKey, defaultLanguage } from './config'

// Dynamic imports for translations
const importTranslation = async (lang: Language) => {
  try {
    return (await import(`./locales/${lang}`)).default
  } catch (error) {
    console.error(`Failed to load translations for ${lang}`, error)
    return (await import(`./locales/${defaultLanguage}`)).default
  }
}

export function useTranslations() {
  const params = useParams()
  const lang = (params?.lang as Language) || defaultLanguage
  
  const t = useCallback(
    async (key: TranslationKey): Promise<string> => {
      const translations = await importTranslation(lang)
      return translations[key] || key
    },
    [lang]
  )
  
  return { t, lang }
}
EOL

    # Create language selector component
    cat > src/components/ui/language-selector.tsx << 'EOL'
'use client'

import { useRouter, useParams } from 'next/navigation'
import { languages, languageNames, Language } from '@/lib/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSelector() {
  const router = useRouter()
  const params = useParams()
  const currentLang = (params?.lang as Language) || 'en'
  
  const handleLanguageChange = (newLang: string) => {
    // Replace the language segment in the URL
    const newPath = window.location.pathname.replace(
      `/${currentLang}`,
      `/${newLang}`
    )
    router.push(newPath)
  }
  
  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageNames[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
EOL

    print_success "Internationalization installed!"
}

# Install Progressive Web App (PWA) configuration
install_pwa() {
    print_info "Installing Progressive Web App (PWA) configuration..."
    
    # Create manifest.json
    cat > public/manifest.json << 'EOL'
{
  "name": "SaaS Template",
  "short_name": "SaaS",
  "description": "A modern SaaS application template",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#5469d4",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOL

    # Create service worker
    cat > public/sw.js << 'EOL'
// Service Worker for SaaS Template
const CACHE_NAME = 'saas-template-v1';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-first strategy for API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
EOL

    # Create PWA registration component
    cat > src/components/pwa-register.tsx << 'EOL'
'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration)
          })
          .catch((error) => {
            console.log('SW registration failed: ', error)
          })
      })
    }

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e)
      
      // Show install prompt after 30 seconds if the user hasn't installed the app
      // and hasn't dismissed the prompt
      const hasPromptBeenShown = localStorage.getItem('pwaPromptShown')
      if (!hasPromptBeenShown) {
        const timer = setTimeout(() => {
          setShowInstallPrompt(true)
          localStorage.setItem('pwaPromptShown', 'true')
        }, 30000)
        
        return () => clearTimeout(timer)
      }
    })
    
    // Handle installed event
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null)
      setShowInstallPrompt(false)
      console.log('PWA was installed')
    })
  }, [])

  const handleInstall = () => {
    if (!installPrompt) return
    
    // Show the install prompt
    installPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      setInstallPrompt(null)
      setShowInstallPrompt(false)
    })
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for a week
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)
    localStorage.setItem('pwaPromptShown', expiryDate.toISOString())
  }

  if (!showInstallPrompt) return null

  return (
    <>
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install our app</DialogTitle>
            <DialogDescription>
              Install our app on your home screen for a better experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-start space-x-3 py-4">
            <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div className="text-sm">
              <p>Benefits of installing the app:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Faster access</li>
                <li>Works offline</li>
                <li>Full-screen experience</li>
                <li>Get push notifications</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDismiss}>
              Not now
            </Button>
            <Button onClick={handleInstall}>
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
EOL

    print_success "PWA configuration installed!"
}

# Main menu function
show_menu() {
    echo ""
    echo "Select a feature to install:"
    echo "1) CI/CD Pipeline"
    echo "2) Documentation System"
    echo "3) Email Templates"
    echo "4) Advanced UI Components"
    echo "5) Internationalization (i18n)"
    echo "6) Progressive Web App (PWA)"
    echo "7) Install All Features"
    echo "8) Exit"
    
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1)
            install_cicd
            ;;
        2)
            install_documentation
            ;;
        3)
            install_more_email_templates
            ;;
        4)
            install_advanced_ui_components
            ;;
        5)
            install_i18n
            ;;
        6)
            install_pwa
            ;;
        7)
            install_cicd
            install_documentation
            install_more_email_templates
            install_advanced_ui_components
            install_i18n
            install_pwa
            ;;
        8)
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
        print_success "All done! Your SaaS template is ready! 🚀"
        print_info "Next steps:"
        print_info "1. Configure your environment variables in .env"
        print_info "2. Run 'pnpm run dev' to start development"
        print_info "3. Check the docs folder for detailed documentation"
    fi
}

# Start the menu
show_menu