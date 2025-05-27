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
