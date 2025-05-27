# Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase account)
- Stripe account
- Resend account

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd <project-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the following in `.env`:
   - Supabase credentials
   - Stripe API keys
   - Resend API key
   - Other service credentials

4. **Set up the database**
   ```bash
   npm run setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Detailed Configuration

### Supabase Setup

1. Create a new Supabase project
2. Copy the project URL and anon key
3. Enable authentication providers in Supabase dashboard
4. Set up storage buckets for user files

### Stripe Setup

1. Create a Stripe account
2. Copy publishable and secret keys
3. Create products and prices in Stripe dashboard
4. Set up webhook endpoint

### Email Setup

1. Create a Resend account
2. Verify your domain
3. Copy API key
4. Update email templates as needed

## Troubleshooting

### Common Issues

- **Database connection errors**: Check DATABASE_URL in .env
- **Authentication errors**: Verify Supabase keys
- **Payment errors**: Check Stripe configuration
- **Email errors**: Verify Resend API key and domain

For more help, see our [troubleshooting guide](./TROUBLESHOOTING.md).
