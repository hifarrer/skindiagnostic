# Environment Variables Setup Guide

This guide explains how to set up all required environment variables for the AiMakeup application.

## Quick Start

1. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Mobile App Setup:**
   ```bash
   cd mobile
   cp .env.example .env
   # Edit .env with your actual values
   ```

## Backend Environment Variables

### Required Variables

#### Server Configuration
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

#### Database
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database`
  - Example: `postgresql://postgres:password@localhost:5432/aimakeup`

#### Authentication
- `JWT_SECRET` - Secret key for JWT token signing
  - Generate with: `openssl rand -base64 32`
  - Must be at least 32 characters

#### Perfect Corp API
- `PERFECT_CORP_API_KEY` - Your Perfect Corp API key
- `PERFECT_CORP_BASE_URL` - API base URL (default provided)

#### Cloudinary
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

#### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_test_` or `sk_live_`)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (optional, for webhook verification)

#### OAuth - Google
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

#### OAuth - Facebook
- `FACEBOOK_APP_ID` - Facebook app ID
- `FACEBOOK_APP_SECRET` - Facebook app secret

#### CORS
- `FRONTEND_URL` - Frontend URL for CORS configuration
  - Development: `http://localhost:8081`
  - Production: Your actual domain

## Mobile App Environment Variables

### Required Variables

#### API Configuration
- `EXPO_PUBLIC_API_URL` - Backend API URL
  - Development: `http://localhost:3000/api`
  - Production: `https://your-api-domain.com/api`

#### Stripe
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
  - Starts with `pk_test_` or `pk_live_`

#### OAuth - Google
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
  - Same as backend, but only the Client ID (not secret)

#### OAuth - Facebook
- `EXPO_PUBLIC_FACEBOOK_APP_ID` - Facebook app ID
  - Same as backend, but only the App ID (not secret)

## How to Get API Keys

### Perfect Corp API
1. Sign up at [Perfect Corp](https://www.perfectcorp.com)
2. Navigate to API settings
3. Generate an API key

### Cloudinary
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret

### Stripe
1. Sign up at [Stripe](https://stripe.com)
2. Go to Developers > API keys
3. Copy your Secret Key and Publishable Key
4. For webhooks, set up a webhook endpoint and copy the webhook secret

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/oauth/google/callback` (development)
   - Your production callback URL
6. Copy Client ID and Client Secret

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Go to Settings > Basic
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/oauth/facebook/callback` (development)
   - Your production callback URL
6. Copy App ID and App Secret

## Security Notes

- **Never commit `.env` files to version control**
- Use different keys for development and production
- Rotate secrets regularly
- Use strong, random values for `JWT_SECRET`
- Keep API keys secure and don't share them

## Example .env Files

See `.env.example` files in:
- `backend/.env.example` - Backend configuration
- `mobile/.env.example` - Mobile app configuration

