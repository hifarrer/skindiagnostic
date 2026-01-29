# Fix OAuth Redirect URI Mismatch on Vercel

## Problem
Getting `Error 400: redirect_uri_mismatch` in production (Vercel) but works locally.

## Root Cause
Passport.js constructs the callback URL from the request, but on Vercel (serverless), the URL construction might not match what's registered in Google Console.

## Solution

### Step 1: Add Environment Variable in Vercel

1. Go to your Vercel backend project dashboard
2. Go to **Settings** > **Environment Variables**
3. Add a new environment variable:
   - **Key:** `OAUTH_CALLBACK_URL`
   - **Value:** `https://skindiagnosticbackend.vercel.app/api/auth/oauth/google/callback`
   - **Environment:** Production (and Preview if needed)
4. Click **Save**

### Step 2: Verify Other Environment Variables

Make sure these are also set in Vercel:
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
- `FRONTEND_URL` - Your frontend Vercel URL (e.g., `https://your-frontend.vercel.app`)
- `BACKEND_URL` - `https://skindiagnosticbackend.vercel.app` (optional, but helpful)

### Step 3: Redeploy Backend

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Verify Google Console

Make sure this exact URL is in Google Cloud Console:
```
https://skindiagnosticbackend.vercel.app/api/auth/oauth/google/callback
```

**Important:** 
- No trailing slash
- Must be `https://` (not `http://`)
- Must match exactly (case-sensitive)

### Step 5: Test

1. Wait 2-3 minutes after redeploying
2. Clear browser cache or use incognito mode
3. Try logging in with Google
4. Should work now!

## Alternative: Use BACKEND_URL

If you prefer, you can set `BACKEND_URL` instead:
- **Key:** `BACKEND_URL`
- **Value:** `https://skindiagnosticbackend.vercel.app`

The code will automatically construct the callback URL from this.

## Troubleshooting

### Still getting redirect_uri_mismatch?

1. **Check the exact URL in Google Console:**
   - Go to Google Cloud Console > Credentials
   - Open your OAuth Client ID
   - Check the redirect URI matches exactly: `https://skindiagnosticbackend.vercel.app/api/auth/oauth/google/callback`

2. **Check Vercel environment variables:**
   - Make sure `OAUTH_CALLBACK_URL` is set correctly
   - Make sure it's set for the right environment (Production)

3. **Check backend logs:**
   - Go to Vercel Dashboard > Your Project > Deployments
   - Click on the latest deployment
   - Check "Functions" tab for any errors

4. **Try with explicit URL:**
   - In Google Console, try adding both:
     - `https://skindiagnosticbackend.vercel.app/api/auth/oauth/google/callback`
     - `https://skindiagnostic-backend.vercel.app/api/auth/oauth/google/callback` (if different)

### Route Warning (Non-Critical)

The warning about "No route named 'auth'" is a non-critical Expo Router warning. The route `auth/callback.tsx` should still work. This is a known issue with Expo Router's route discovery and doesn't affect functionality.
