# Deployment Guide

## Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Configure domains**
   - Add custom domain in Vercel
   - Update DNS records
   - Enable SSL

## Environment Variables

Required for production:
- All variables from .env.example
- Set NEXT_PUBLIC_APP_URL to your production URL
- Use production API keys for all services

## Database Migration

```bash
# Run migrations in production
npx prisma migrate deploy
```

## Post-Deployment

1. Set up Stripe webhooks for production URL
2. Configure Supabase auth redirect URLs
3. Set up monitoring and analytics
4. Configure backup strategy

## Monitoring

- Use Sentry for error tracking
- Set up PostHog for analytics
- Monitor Stripe webhook events
- Set up uptime monitoring
