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

install() {
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

    print_success "Documentation system installed!"
}

# Main menu function
show_menu() {
    echo ""
    echo "Select a feature to install:"
    echo "1) CI/CD Pipeline"
    echo "2) Documentation System"
    echo "3) Exit"
    
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            install
            ;;
        2)
            install_documentation
            ;;
        3)
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
show_menu