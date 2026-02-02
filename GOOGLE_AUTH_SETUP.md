# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for the AiMakeup application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)
- Your backend server running (for callback URL)

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account

### 1.2 Create or Select a Project

1. Click on the project dropdown at the top
2. Click **"New Project"** or select an existing project
3. Enter a project name (e.g., "AiMakeup")
4. Click **"Create"**

### 1.3 Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on it and click **"Enable"**

> **Note:** Google+ API is deprecated, but we can use **"People API"** instead. However, for OAuth, we mainly need the OAuth consent screen.
    
### 1.4 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name:** AiMakeup (or your app name)
   - **User support email:** Your email
   - **Developer contact information:** Your email
5. Click **"Save and Continue"**
6. On **"Scopes"** page, click **"Add or Remove Scopes"**
   - Add: `email`, `profile`, `openid`
7. Click **"Save and Continue"**
8. On **"Test users"** (if in testing mode), add test users if needed
9. Click **"Save and Continue"**
10. Review and click **"Back to Dashboard"**

### 1.5 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name (e.g., "AiMakeup Web Client")
5. **Authorized JavaScript origins:**
   - Add: `http://localhost:3000` (for development)
   - Add your production URL if you have one
6. **Authorized redirect URIs:**
   - Add: `http://localhost:3000/api/auth/oauth/google/callback` (for development)
   - Add your production callback URL: `https://your-domain.com/api/auth/oauth/google/callback`
7. Click **"Create"**
8. **IMPORTANT:** Copy the **Client ID** and **Client Secret** - you'll need these!

## Step 2: Configure Backend Environment Variables

1. Open `backend/.env` file
2. Add or update these variables:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

3. Make sure your backend server URL is correct:
   - Development: `http://localhost:3000`
   - Production: Your actual domain

## Step 3: Configure Frontend Environment Variables

1. Open `mobile/.env` file (or create it from `.env.example`)
2. Add or update:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

> **Note:** The frontend only needs the Client ID (not the secret). The secret should NEVER be exposed in frontend code.

## Step 4: Verify Backend Configuration

### 4.1 Check Passport Configuration

The backend should already have Google OAuth configured in `backend/src/config/passport.js`. Verify it looks like this:

```javascript
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/oauth/google/callback',
      },
      // ... rest of the configuration
    )
  );
}
```

### 4.2 Check Routes

Verify that `backend/src/routes/authRoutes.js` has:

```javascript
router.get('/oauth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/oauth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback
);
```

### 4.3 Check Server Configuration

Make sure `backend/src/server.js` includes:

```javascript
app.use('/api/auth', authRoutes);
```

## Step 5: Test the Setup

### 5.1 Start Backend Server

```bash
cd backend
npm run dev
```

The server should start without errors. If you see "Google Strategy not configured", check your `.env` file.

### 5.2 Test OAuth Flow

1. Start your frontend:
   ```bash
   cd mobile
   npm run web
   ```

2. Navigate to the login page
3. Click **"Continue with Google"**
4. You should be redirected to Google's login page
5. After logging in, you should be redirected back to your app

## Step 6: Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Solution:**
- Make sure the callback URL in Google Cloud Console exactly matches:
  - Development: `http://localhost:3000/api/auth/oauth/google/callback`
  - Production: `https://your-domain.com/api/auth/oauth/google/callback`
- Check for trailing slashes or typos
- Wait a few minutes after updating - Google may cache the configuration

### Issue: "invalid_client" Error

**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` are correct
- Make sure there are no extra spaces or quotes
- Restart the backend server after updating `.env`

### Issue: OAuth Strategy Not Loading

**Solution:**
- Check that both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Verify the `.env` file is in the `backend/` directory
- Check server logs for any error messages

### Issue: Frontend Not Redirecting

**Solution:**
- Verify `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is set in `mobile/.env`
- Check that `EXPO_PUBLIC_API_URL` points to your backend
- For web, the redirect should work automatically
- For mobile, ensure you're using the correct OAuth flow

## Step 7: Production Setup

When deploying to production:

1. **Update Google Cloud Console:**
   - Add your production domain to **Authorized JavaScript origins**
   - Add your production callback URL to **Authorized redirect URIs**

2. **Update Environment Variables:**
   - Backend: Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (can be the same or create new credentials)
   - Frontend: Update `EXPO_PUBLIC_API_URL` to your production API URL

3. **OAuth Consent Screen:**
   - Submit your app for verification if you want to make it public
   - For testing, you can keep it in "Testing" mode and add test users

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different credentials** for development and production
3. **Rotate secrets** periodically
4. **Keep Client Secret secure** - never expose it in frontend code
5. **Use HTTPS** in production for all OAuth callbacks

## Quick Reference

### Backend `.env` Variables:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Frontend `.env` Variables:
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Callback URLs:
- Development: `http://localhost:3000/api/auth/oauth/google/callback`
- Production: `https://your-domain.com/api/auth/oauth/google/callback`

## Next Steps

After setting up Google OAuth:
1. Test the login flow
2. Verify user data is being saved correctly
3. Set up Facebook OAuth (optional, similar process)
4. Configure subscription plans
5. Test protected routes

If you encounter any issues, check the server logs and browser console for detailed error messages.
