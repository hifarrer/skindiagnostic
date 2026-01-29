# Deploy Backend to Vercel

This guide will help you deploy your Express.js backend to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your backend code pushed to GitHub
- All environment variables ready

## Step 1: Prepare Your Repository

The following files have been created for Vercel deployment:
- `backend/vercel.json` - Vercel configuration
- `backend/api/index.js` - Serverless function wrapper
- `backend/src/server.js` - Updated to export the app

Make sure these files are committed to your repository.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click **"Add New..."** > **"Project"**

2. **Import Your Repository**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset:** Other
   - **Root Directory:** `backend` (IMPORTANT!)
   - **Build Command:** Leave empty (Vercel will auto-detect)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   Click **"Environment Variables"** and add all your backend environment variables:
   
   ```
   DATABASE_URL=your-postgresql-connection-string
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=your-jwt-secret
   FRONTEND_URL=https://your-frontend.vercel.app
   PERFECT_CORP_API_KEY=your-perfect-corp-key
   PERFECT_CORP_BASE_URL=your-perfect-corp-url
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   STRIPE_SECRET_KEY=your-stripe-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   GOOGLE_PLACES_API_KEY=your-google-places-key
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the deployment to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (first time) or **Yes** (subsequent)
   - Project name? `aimakeup-backend` or your preferred name
   - Directory? `./` (current directory)
   - Override settings? **No**

5. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   # ... add all other environment variables
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Update Google OAuth Redirect URI

After deployment, you'll get a Vercel URL like: `https://your-backend.vercel.app`

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Go to **APIs & Services** > **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Add New Redirect URI**
   - Under **Authorized redirect URIs**, add:
     ```
     https://your-backend.vercel.app/api/auth/oauth/google/callback
     ```
   - Replace `your-backend.vercel.app` with your actual Vercel backend URL
   - Click **SAVE**

## Step 4: Update Frontend Configuration

Update your frontend (Vercel) environment variables:

1. **Go to Vercel Dashboard** > Your Frontend Project
2. **Go to Settings** > **Environment Variables**
3. **Update `EXPO_PUBLIC_API_URL`** to:
   ```
   https://your-backend.vercel.app/api
   ```
   Replace `your-backend.vercel.app` with your actual Vercel backend URL

4. **Redeploy Frontend** (if needed)

## Step 5: Test the Deployment

1. **Check Health Endpoint**
   Visit: `https://your-backend.vercel.app/health`
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test API Endpoint**
   Visit: `https://your-backend.vercel.app/api/auth/me`
   Should return appropriate response (may require authentication)

3. **Test OAuth Flow**
   - Go to your frontend
   - Try logging in with Google
   - Should redirect properly

## Important Notes

### Root Directory
- **CRITICAL:** Make sure the **Root Directory** is set to `backend` in Vercel project settings
- This tells Vercel where your backend code is located

### Environment Variables
- All environment variables must be set in Vercel
- They are NOT read from `.env` files in production
- Set them in Vercel Dashboard > Project Settings > Environment Variables

### Database Connection
- Make sure your `DATABASE_URL` is accessible from Vercel's servers
- If using Render PostgreSQL, it should work fine
- If using a local database, you'll need to use a cloud database

### CORS Configuration
- The `FRONTEND_URL` environment variable controls CORS
- Make sure it matches your frontend Vercel URL exactly
- Example: `https://your-frontend.vercel.app`

### Custom Domain (Optional)
1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `FRONTEND_URL` and Google OAuth redirect URIs accordingly

## Troubleshooting

### Error: "Cannot find module"
- Make sure `Root Directory` is set to `backend`
- Check that `package.json` is in the backend directory
- Verify all dependencies are listed in `package.json`

### Error: "Database connection failed"
- Check `DATABASE_URL` is correct
- Verify database allows connections from Vercel IPs
- Check database firewall settings

### Error: "CORS error"
- Verify `FRONTEND_URL` matches your frontend URL exactly
- Check for trailing slashes
- Make sure CORS is enabled in your Express app

### OAuth redirect_uri_mismatch
- Make sure redirect URI in Google Console matches: `https://your-backend.vercel.app/api/auth/oauth/google/callback`
- Wait a few minutes after updating Google Console
- Clear browser cache and try again

## Vercel vs Render

### Vercel Advantages:
- ✅ Same platform as frontend (easier management)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless (scales automatically)
- ✅ Free tier available

### Render Advantages:
- ✅ Traditional server (better for long-running processes)
- ✅ Persistent connections
- ✅ Better for WebSocket connections

**Recommendation:** Vercel is great for API endpoints. If you need WebSockets or long-running processes, stick with Render.

## Next Steps

After successful deployment:
1. Update all OAuth redirect URIs
2. Update frontend API URL
3. Test all API endpoints
4. Monitor Vercel dashboard for any errors
5. Set up custom domain (optional)
