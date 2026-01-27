# Google Authentication Setup - Quick Start

## ✅ Step-by-Step Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Go to **APIs & Services** > **OAuth consent screen**
   - Select "External"
   - Fill in app name and email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue
4. Go to **APIs & Services** > **Credentials**
5. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
6. Select **Web application**
7. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/oauth/google/callback
   ```
8. Click **Create** and copy the **Client ID** and **Client Secret**

### 2. Configure Backend

Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:8081
```

### 3. Configure Frontend

Add to `mobile/.env`:
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Test

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd mobile && npm run web`
3. Click "Continue with Google" on login page
4. Complete Google login
5. You should be redirected back and logged in!

## 🔧 Troubleshooting

- **redirect_uri_mismatch**: Check callback URL matches exactly in Google Console
- **invalid_client**: Verify Client ID and Secret in `.env` are correct
- **Not redirecting**: Check `FRONTEND_URL` matches your frontend URL

See `GOOGLE_AUTH_SETUP.md` for detailed instructions.
