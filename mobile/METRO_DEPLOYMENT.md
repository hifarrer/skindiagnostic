# Metro Bundler Deployment Guide

This guide explains how to deploy your Expo web app using Metro bundler to various hosting platforms.

## Quick Deploy Options

### Option 1: Netlify (Recommended - Easiest)

1. **Sign up** at [netlify.com](https://netlify.com) and connect your GitHub repository

2. **Configure Site Settings:**
   - **Base directory**: Leave EMPTY (or set to root `/`)
   - **Build command**: `cd mobile && npm install && npx expo export --platform web`
   - **Publish directory**: `mobile/web-build`
   - **Node version**: `20` (set in Environment Variables)
   
   **Note**: Since Netlify requires `mobile/web-build` in the publish directory field, we set the base directory to root and use `cd mobile` in the build command.

3. **Add Environment Variables:**
   Go to Site settings → Environment variables and add:
   ```
   EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy
   - You'll get a URL like: `https://your-app-name.netlify.app`

5. **Share with Client:**
   - Copy the Netlify URL
   - The app is fully functional - all API calls work
   - No server needed - it's a static site

---

### Option 2: Render (Static Site)

1. **Log in** to [render.com](https://render.com)

2. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

3. **Configure Settings:**
   - **Name**: `aimakeup-frontend`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `mobile`
   - **Build Command**: `npm install && npx expo export --platform web`
   - **Publish Directory**: `web-build`

4. **Add Environment Variables:**
   ```
   EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
   ```

5. **Deploy:**
   - Click "Create Static Site"
   - Wait for build to complete (~2-5 minutes)
   - You'll get a URL like: `https://aimakeup-frontend.onrender.com`

---

### Option 3: Vercel

1. **Sign up** at [vercel.com](https://vercel.com) and connect GitHub

2. **Import Project:**
   - Select your repository
   - **Root Directory**: `mobile`
   - **Framework Preset**: Other
   - **Build Command**: `npm install && npx expo export --platform web`
   - **Output Directory**: `web-build`

3. **Add Environment Variables** (same as above)

4. **Deploy:**
   - Click "Deploy"
   - You'll get a URL like: `https://your-app.vercel.app`

---

## Local Testing

Before deploying, test the build locally:

```bash
cd mobile
npm install
npx expo export --platform web
```

This creates a `web-build` folder with static files. You can test it locally:

```bash
# Using Python
cd web-build
python -m http.server 8000

# Or using Node.js
npx serve web-build
```

Then visit `http://localhost:8000` in your browser.

---

## What Changed from Webpack

✅ **Simpler build process** - No webpack config needed
✅ **Faster builds** - Metro is optimized for React Native/Expo
✅ **Fewer errors** - Metro handles Expo Router better
✅ **Same functionality** - All API calls, auth, features work identically

---

## Troubleshooting

### Build fails with "Module not found"
- Make sure you're in the `mobile` directory
- Run `npm install` first
- Check that all dependencies are in `package.json`

### Environment variables not working
- Make sure they start with `EXPO_PUBLIC_` for client-side access
- Rebuild after adding new variables
- Check the hosting platform's environment variable settings

### API calls failing
- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Check CORS settings on your backend
- Make sure backend is deployed and accessible

---

## After Deployment

1. ✅ **Test all features:**
   - Login/Logout
   - Skin analysis upload
   - API calls
   - OAuth (Google/Facebook)

2. ✅ **Update OAuth Callback URLs:**
   - Google: Add your frontend URL to authorized redirect URIs
   - Facebook: Add your frontend URL to Valid OAuth Redirect URIs

3. ✅ **Share URL with client:**
   - The app is fully functional
   - All features work the same as webpack version
   - No server maintenance needed

---

## Support

- Expo Metro Docs: https://docs.expo.dev/guides/customizing-metro/
- Netlify Docs: https://docs.netlify.com/
- Render Docs: https://render.com/docs
