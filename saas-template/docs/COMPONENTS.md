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
