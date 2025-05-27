#!/bin/bash

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
}

const invoiceDetails = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
}

const label = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '4px',
}

const value = {
  fontSize: '16px',
  color: '#333',
  fontWeight: 'bold',
}

const itemsTable = {
  margin: '30px 0',
}

const tableHeader = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '16px',
}

const itemRow = {
  borderBottom: '1px solid #eee',
  padding: '12px 0',
}

const itemDescription = { width: '50%' }
const itemQuantity = { width: '15%', textAlign: 'center' as const }
const itemPrice = { width: '15%', textAlign: 'right' as const }
const itemTotal = { width: '20%', textAlign: 'right' as const }

const totalSection = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '2px solid #333',
}

const totalLabel = { width: '80%', textAlign: 'right' as const }
const totalAmount = { width: '20%', textAlign: 'right' as const }

const totalText = {
  fontSize: '20px',
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
  marginTop: '64px',
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
  Text,
} from '@react-email/components'
import * as React from 'react'

interface TeamInvitationEmailProps {
  inviterName: string
  inviterEmail: string
  teamName: string
  inviteLink: string
  recipientEmail: string
}

export const TeamInvitationEmail = ({
  inviterName,
  inviterEmail,
  teamName,
  inviteLink,
  recipientEmail,
}: TeamInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to join {teamName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're invited to join {teamName}!</Heading>
        
        <Text style={text}>
          Hi there,
        </Text>
        
        <Text style={text}>
          {inviterName} ({inviterEmail}) has invited you to join their team
          on our platform.
        </Text>

        <Button href={inviteLink} style={button}>
          Accept Invitation
        </Button>
        
        <Text style={text}>
          By accepting this invitation, you'll be able to collaborate with
          the {teamName} team and access shared resources.
        </Text>
        
        <Text style={text}>
          If you don't have an account yet, you'll be prompted to create one
          using this email address ({recipientEmail}).
        </Text>
        
        <Text style={footer}>
          This invitation will expire in 7 days. If you have any questions,
          please contact our support team.
        </Text>
      </Container>
    </Body>
  </Html>
)

// Styles remain the same as other templates
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

export default TeamInvitationEmail
EOL

    print_success "Additional email templates installed!"
}

install_advanced_ui_components() {
    print_info "Installing Advanced UI Components..."
    
    # Create DataTable component
    cat > src/components/ui/data-table.tsx << 'EOL'
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
EOL

    # Create Table components
    cat > src/components/ui/table.tsx << 'EOL'
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRefconst TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
EOL

    # Create Charts component
    cat > src/components/ui/charts.tsx << 'EOL'
'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { cn } from '@/lib/utils'

interface ChartProps {
  data: any[]
  className?: string
  height?: number
}

interface LineChartProps extends ChartProps {
  lines: {
    dataKey: string
    stroke?: string
    name?: string
  }[]
}

export function LineChart({ data, lines, className, height = 300 }: LineChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke || `hsl(var(--chart-${index + 1}))`}
              name={line.name || line.dataKey}
              strokeWidth={2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AreaChartProps extends ChartProps {
  areas: {
    dataKey: string
    fill?: string
    stroke?: string
    name?: string
  }[]
}

export function AreaChart({ data, areas, className, height = 300 }: AreaChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stroke={area.stroke || `hsl(var(--chart-${index + 1}))`}
              fill={area.fill || `hsl(var(--chart-${index + 1}))`}
              name={area.name || area.dataKey}
              fillOpacity={0.6}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BarChartProps extends ChartProps {
  bars: {
    dataKey: string
    fill?: string
    name?: string
  }[]
}

export function BarChart({ data, bars, className, height = 300 }: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill || `hsl(var(--chart-${index + 1}))`}
              name={bar.name || bar.dataKey}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PieChartProps extends ChartProps {
  dataKey: string
  nameKey: string
  colors?: string[]
}

export function PieChart({ 
  data, 
  dataKey, 
  nameKey, 
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'],
  className, 
  height = 300 
}: PieChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
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

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
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
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
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
  DialogPortal,
  DialogOverlay,
  DialogClose,
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

install_i18n() {
    print_info "Installing Internationalization (i18n)..."
    
    # Create i18n configuration
    mkdir -p src/lib/i18n
    cat > src/lib/i18n/config.ts << 'EOL'
export const languages = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'] as const
export type Language = typeof languages[number]

export const defaultLanguage: Language = 'en'

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
}
EOL

    # Create translations
    mkdir -p src/lib/i18n/translations
    cat > src/lib/i18n/translations/en.json << 'EOL'
{
  "common": {
    "appName": "SaaS Template",
    "welcome": "Welcome",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "signOut": "Sign Out",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "profile": "Profile",
    "billing": "Billing",
    "team": "Team",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "auth": {
    "emailLabel": "Email address",
    "passwordLabel": "Password",
    "forgotPassword": "Forgot your password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "verifyEmail": "Please verify your email",
    "resetPassword": "Reset Password"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalUsers": "Total Users",
    "revenue": "Revenue",
    "activeSubscriptions": "Active Subscriptions",
    "recentActivity": "Recent Activity"
  },
  "billing": {
    "title": "Billing",
    "currentPlan": "Current Plan",
    "upgradePlan": "Upgrade Plan",
    "cancelSubscription": "Cancel Subscription",
    "invoices": "Invoices",
    "paymentMethod": "Payment Method",
    "updatePaymentMethod": "Update Payment Method"
  },
  "settings": {
    "title": "Settings",
    "accountSettings": "Account Settings",
    "notificationSettings": "Notification Settings",
    "privacySettings": "Privacy Settings",
    "language": "Language",
    "timezone": "Timezone",
    "deleteAccount": "Delete Account"
  }
}
EOL

    # Create i18n hook
    cat > src/hooks/use-i18n.ts << 'EOL'
'use client'

import { useEffect, useState } from 'react'
import { Language, defaultLanguage } from '@/lib/i18n/config'
import en from '@/lib/i18n/translations/en.json'

type Translations = typeof en

const translations: Record<Language, Translations> = {
  en,
  es: en, // Placeholder - would load actual translations
  fr: en,
  de: en,
  pt: en,
  ja: en,
  zh: en,
}

export function useI18n() {
  const [language, setLanguage] = useState<Language>(defaultLanguage)
  const [t, setT] = useState<Translations>(translations[defaultLanguage])

  useEffect(() => {
    // Load language from localStorage or user preference
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
      setT(translations[savedLanguage])
    }
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setT(translations[newLanguage])
    localStorage.setItem('language', newLanguage)
  }

  return { t, language, changeLanguage }
}
EOL

    # Create language selector component
    cat > src/components/ui/language-selector.tsx << 'EOL'
'use client'

import { useI18n } from '@/hooks/use-i18n'
import { Language, languages, languageNames } from '@/lib/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LanguageSelector() {
  const { language, changeLanguage } = useI18n()

  return (
    <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
      <SelectTrigger className="w-[150px]">
        <SelectValue />
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

install_pwa() {
    print_info "Installing Progressive Web App (PWA) configuration..."
    
    # Create manifest.json
    cat > public/manifest.json << 'EOL'
{
  "name": "SaaS Template",
  "short_name": "SaaS",
  "description": "Production-ready SaaS template",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
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
const CACHE_NAME = 'saas-template-v1'
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request).catch(() => {
        return caches.match('/offline')
      })
    })
  )
})

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
EOL

    # Create offline page
    mkdir -p "src/app/offline"
    cat > "src/app/offline/page.tsx" << 'EOL'
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">You're Offline</h1>
        <p className="text-gray-600 mb-8">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
EOL

    # Update layout to include PWA meta tags
    cat > src/components/pwa-meta.tsx << 'EOL'
export function PWAMeta() {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="SaaS Template" />
      <meta name="apple-mobile-web-app-title" content="SaaS Template" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-navbutton-color" content="#000000" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="msapplication-starturl" content="/" />
      
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
      <link rel="apple-touch-icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
    </>
  )
}
EOL

    print_success "PWA configuration installed!"
}

# Updated menu with new features
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
    echo "11. 📁 Storage System"
    echo "12. 👥 Organization Management"
    echo "13. 📊 Advanced Analytics"
    echo "14. 🔔 Monitoring & Error Tracking"
    echo "15. 🚀 CI/CD Pipeline"
    echo "16. 📚 Documentation System"
    echo "17. 📧 More Email Templates"
    echo "18. 🎯 Advanced UI Components"
    echo "19. 🌍 Internationalization (i18n)"
    echo "20. 📱 Progressive Web App (PWA)"
    echo "21. 📦 Install All Features"
    echo "22. ❌ Exit"
    echo ""
    read -p "Enter your choice (1-22): " choice

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
        11) install_storage_system ;;
        12) install_organization_management ;;
        13) install_advanced_analytics ;;
        14) install_monitoring ;;
        15) install_cicd_pipeline ;;
        16) install_documentation ;;
        17) install_more_email_templates ;;
        18) install_advanced_ui_components ;;
        19) install_i18n ;;
        20) install_pwa ;;
        21) 
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
            install_storage_system
            install_organization_management
            install_advanced_analytics
            install_monitoring
            install_cicd_pipeline
            install_documentation
            install_more_email_templates
            install_advanced_ui_components
            install_i18n
            install_pwa
            ;;
        22) 
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
        print_info "2. Run 'npm run dev' to start development"
        print_info "3. Check the docs folder for detailed documentation"
    fi
}

# Start the menu
show_menu .github/workflows/test.yml << 'EOL'
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
}

const invoiceDetails = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
}

const label = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '4px',
}

const value = {
  fontSize: '16px',
  color: '#333',
  fontWeight: 'bold',
}

const itemsTable = {
  margin: '30px 0',
}

const tableHeader = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '16px',
}

const itemRow = {
  borderBottom: '1px solid #eee',
  padding: '12px 0',
}

const itemDescription = { width: '50%' }
const itemQuantity = { width: '15%', textAlign: 'center' as const }
const itemPrice = { width: '15%', textAlign: 'right' as const }
const itemTotal = { width: '20%', textAlign: 'right' as const }

const totalSection = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '2px solid #333',
}

const totalLabel = { width: '80%', textAlign: 'right' as const }
const totalAmount = { width: '20%', textAlign: 'right' as const }

const totalText = {
  fontSize: '20px',
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
  marginTop: '64px',
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
  Text,
} from '@react-email/components'
import * as React from 'react'

interface TeamInvitationEmailProps {
  inviterName: string
  inviterEmail: string
  teamName: string
  inviteLink: string
  recipientEmail: string
}

export const TeamInvitationEmail = ({
  inviterName,
  inviterEmail,
  teamName,
  inviteLink,
  recipientEmail,
}: TeamInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to join {teamName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're invited to join {teamName}!</Heading>
        
        <Text style={text}>
          Hi there,
        </Text>
        
        <Text style={text}>
          {inviterName} ({inviterEmail}) has invited you to join their team
          on our platform.
        </Text>

        <Button href={inviteLink} style={button}>
          Accept Invitation
        </Button>
        
        <Text style={text}>
          By accepting this invitation, you'll be able to collaborate with
          the {teamName} team and access shared resources.
        </Text>
        
        <Text style={text}>
          If you don't have an account yet, you'll be prompted to create one
          using this email address ({recipientEmail}).
        </Text>
        
        <Text style={footer}>
          This invitation will expire in 7 days. If you have any questions,
          please contact our support team.
        </Text>
      </Container>
    </Body>
  </Html>
)

// Styles remain the same as other templates
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

export default TeamInvitationEmail
EOL

    print_success "Additional email templates installed!"
}

install_advanced_ui_components() {
    print_info "Installing Advanced UI Components..."
    
    # Create DataTable component
    cat > src/components/ui/data-table.tsx << 'EOL'
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
EOL

    # Create Table components
    cat > src/components/ui/table.tsx << 'EOL'
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,install_storage_system() {
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
    return#!/bin/bash

# 🚀 SaaS Template Update Script - Modular Installation
# This script allows you to install specific features to complete the template

set -e

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
║    🚀 SAAS TEMPLATE UPDATER - Feature Installer                  ║
║                                                                  ║
║    Complete your template with additional features               ║
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

# Feature installation functions
install_auth_system() {
    print_info "Installing Complete Authentication System..."
    
    # Create auth components
    cat > src/components/auth/auth-form.tsx << 'EOL'
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type AuthFormData = z.infer<typeof authSchema>

interface AuthFormProps {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword(data)
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({
          ...data,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        router.push('/verify-email')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              {...register('password')}
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <Button disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid gap-2">
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin('google')}
          disabled={isLoading}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin('github')}
          disabled={isLoading}
        >
          <Icons.github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  )
}
EOL

    # Create auth hooks
    cat > src/hooks/use-auth.ts << 'EOL'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}
EOL

    # Create auth pages
    mkdir -p src/app/auth/callback
    cat > src/app/auth/callback/route.ts << 'EOL'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
EOL

    print_success "Authentication system installed!"
}

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