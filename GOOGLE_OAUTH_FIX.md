# Fix Google OAuth Redirect URI Mismatch

## Problem
Error: `redirect_uri_mismatch` when trying to login with Google

## Solution

### Step 1: Find Your Backend URL
Your backend is deployed on Render. Find the URL:
- Go to your Render dashboard
- Find your backend service (aimakeup-backend)
- Copy the URL (e.g., `https://aimakeup-backend-xxxx.onrender.com`)

### Step 2: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add your backend callback URL:
   ```
   https://your-backend-url.onrender.com/api/auth/oauth/google/callback
   ```
   Replace `your-backend-url.onrender.com` with your actual Render backend URL
7. Click **SAVE**

### Step 3: Verify Environment Variables

Make sure these are set in your **Render backend service** environment variables:
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

Make sure these are set in your **Vercel frontend** environment variables:
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID (same as backend)
- `EXPO_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-backend.onrender.com/api`)

### Step 4: Wait and Test

- Google may take a few minutes to update the configuration
- Try logging in again after 2-3 minutes

## Example URLs

If your backend is at: `https://aimakeup-backend-abc123.onrender.com`
Then add this redirect URI:
```
https://aimakeup-backend-abc123.onrender.com/api/auth/oauth/google/callback
```

If your frontend is at: `https://aimakeup.vercel.app`
Then set in Vercel:
```
EXPO_PUBLIC_API_URL=https://aimakeup-backend-abc123.onrender.com/api
```

## Troubleshooting

- **Still getting error?** Make sure there are no trailing slashes in the redirect URI
- **Different error?** Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match in both backend and Google Console
- **Not redirecting back?** Check that `FRONTEND_URL` in backend matches your Vercel URL
