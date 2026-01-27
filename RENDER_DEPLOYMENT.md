# Render Deployment Guide for AiMakeup

This guide provides step-by-step instructions for deploying the AiMakeup web application to Render.

## Prerequisites

- ✅ GitHub repository with your code pushed
- ✅ Render account (sign up at [render.com](https://render.com))
- ✅ PostgreSQL database already configured on Render
- ✅ All API keys and secrets ready (Perfect Corp, Cloudinary, Stripe, OAuth)

## Architecture

You'll deploy **2 services** on Render:

1. **Backend Web Service** - Node.js/Express API server
2. **Frontend Static Site** - React Native Expo web build

## Step 1: Deploy Backend API Service

### 1.1 Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (if not already connected)
4. Select your repository: `AiMakeup`

### 1.2 Configure Backend Service

Fill in the following settings:

- **Name**: `aimakeup-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users (e.g., `Oregon`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (or upgrade for better performance)

### 1.3 Configure Environment Variables

Click **"Environment"** tab and add the following variables:

**Required Variables:**

```
NODE_ENV=production
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<generate-with-openssl-rand-base64-32>
FRONTEND_URL=https://aimakeup-frontend.onrender.com
PERFECT_CORP_API_KEY=<your-perfect-corp-key>
PERFECT_CORP_BASE_URL=<your-perfect-corp-base-url>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
```

**Optional Variables:**

```
GOOGLE_PLACES_API_KEY=<your-google-places-api-key>
```

**Note**: 
- `DATABASE_URL` can be auto-linked if your PostgreSQL database is in the same Render account
- `PORT` is automatically set by Render (don't add it manually)
- `FRONTEND_URL` should be updated after you deploy the frontend service

### 1.4 Advanced Settings

- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes` (deploys on every git push)

### 1.5 Create Service

Click **"Create Web Service"** and wait for the first deployment (5-10 minutes).

### 1.6 Run Database Migrations

After the first deployment completes:

1. Go to your service dashboard
2. Click **"Shell"** tab (or use **"SSH"** if available)
3. Run the migration command:
   ```bash
   npm run migrate
   ```
4. Verify tables were created successfully

### 1.7 Get Backend URL

Note your backend service URL (e.g., `https://aimakeup-backend.onrender.com`). You'll need this for:
- Frontend environment variables
- OAuth callback URLs

## Step 2: Deploy Frontend Static Site

### 2.1 Create New Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Select your repository: `AiMakeup`

### 2.2 Configure Frontend Service

Fill in the following settings:

- **Name**: `aimakeup-frontend` (or your preferred name)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `mobile`
- **Build Command**: `npm install && npx expo export:web`
- **Publish Directory**: `web-build`
- **Plan**: `Free`

### 2.3 Configure Environment Variables

Click **"Environment Variables"** and add:

```
EXPO_PUBLIC_API_URL=https://aimakeup-backend.onrender.com/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
EXPO_PUBLIC_FACEBOOK_APP_ID=<your-facebook-app-id>
```

**Important**: 
- Replace `aimakeup-backend.onrender.com` with your actual backend URL
- These are build-time variables (embedded in the static build)

### 2.4 Create Service

Click **"Create Static Site"** and wait for the build to complete (5-10 minutes for first build).

### 2.5 Get Frontend URL

Note your frontend service URL (e.g., `https://aimakeup-frontend.onrender.com`).

## Step 3: Update Backend CORS Configuration

After both services are deployed:

1. Go to your **Backend Service** dashboard
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` to match your frontend Render URL:
   ```
   FRONTEND_URL=https://aimakeup-frontend.onrender.com
   ```
4. Click **"Save Changes"** - this will trigger a redeploy

## Step 4: Update OAuth Callback URLs

### 4.1 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   https://aimakeup-backend.onrender.com/api/auth/oauth/google/callback
   ```
5. Replace `aimakeup-backend.onrender.com` with your actual backend URL
6. Click **"Save"**

### 4.2 Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Select your app
3. Go to **Settings** → **Basic**
4. Add **Valid OAuth Redirect URIs**:
   ```
   https://aimakeup-backend.onrender.com/api/auth/oauth/facebook/callback
   ```
5. Replace `aimakeup-backend.onrender.com` with your actual backend URL
6. Click **"Save Changes"**

## Step 5: Testing Your Deployment

### 5.1 Test Backend

1. Open your backend health check URL:
   ```
   https://aimakeup-backend.onrender.com/health
   ```
2. Should return: `{"status":"ok","timestamp":"..."}`

### 5.2 Test Frontend

1. Open your frontend URL:
   ```
   https://aimakeup-frontend.onrender.com
   ```
2. Verify the app loads without errors
3. Check browser console for any API connection errors

### 5.3 Test API Connection

1. In the frontend app, try to make an API call (e.g., login)
2. Check browser Network tab to verify requests go to your backend
3. Verify CORS headers are correct (no CORS errors)

### 5.4 Test OAuth Login

1. Try logging in with Google
2. Try logging in with Facebook
3. Verify redirects work correctly

## Troubleshooting

### Backend Issues

**Service won't start:**
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `DATABASE_URL` is correct
- Check that migrations ran successfully

**Database connection errors:**
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Check PostgreSQL service is running
- Ensure database exists

**CORS errors:**
- Verify `FRONTEND_URL` matches your frontend Render URL exactly (including `https://`)
- Restart backend service after updating `FRONTEND_URL`

### Frontend Issues

**Build fails:**
- Check build logs in Render dashboard
- Verify all `EXPO_PUBLIC_*` environment variables are set
- Ensure `EXPO_PUBLIC_API_URL` points to correct backend URL

**API calls fail:**
- Verify `EXPO_PUBLIC_API_URL` is correct
- Check browser console for CORS errors
- Ensure backend service is running (not sleeping)

**App doesn't load:**
- Check browser console for errors
- Verify static files were built correctly
- Check Render build logs

### OAuth Issues

**Redirect URI mismatch:**
- Verify callback URLs in Google/Facebook match exactly
- Include `https://` protocol
- Check for trailing slashes

**OAuth not working:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Verify `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are correct
- Check backend logs for OAuth errors

## Render Free Tier Limitations

- **Spin-down**: Services sleep after 15 minutes of inactivity
- **Wake time**: Takes ~30 seconds to wake up after first request
- **Build time**: Limited to 90 minutes
- **Bandwidth**: 100 GB/month

**For production/client demos**, consider upgrading to a paid plan for:
- Always-on services (no spin-down)
- Faster builds
- More bandwidth
- Better performance

## Using render.yaml (Alternative Method)

If you prefer automated configuration, you can use the `render.yaml` files:

1. **Backend**: `backend/render.yaml` is already configured
2. **Frontend**: `mobile/render.yaml` is already configured

To use them:
1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your repository
3. Render will detect `render.yaml` files and create services automatically
4. You'll still need to set environment variables manually

## Next Steps

After successful deployment:

1. ✅ Test all features (login, skin analysis, makeup VTO, etc.)
2. ✅ Set up custom domains (optional, requires paid plan)
3. ✅ Configure monitoring and alerts
4. ✅ Set up automated backups for database
5. ✅ Update any hardcoded URLs in documentation

## Support

- Render Documentation: [https://render.com/docs](https://render.com/docs)
- Render Community: [https://community.render.com](https://community.render.com)
- Project Issues: Check your repository's issue tracker
