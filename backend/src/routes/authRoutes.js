import express from 'express';
import passport, { getGoogleCallbackURL } from '../config/passport.js';
import { oauthCallback, getMe, logout, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Debug: see exact redirect_uri sent to Google (must match Google Console exactly)
router.get('/oauth/callback-url', (req, res) => {
  const configured = getGoogleCallbackURL();
  const isAbsolute = /^https?:\/\//i.test(configured);
  const fullRedirectUri = isAbsolute
    ? configured
    : `${req.protocol}://${req.get('host')}${configured}`;
  res.json({
    redirect_uri: fullRedirectUri,
    configured_value: configured,
    backend_url_set: !!process.env.BACKEND_URL,
    oauth_callback_url_set: !!process.env.OAUTH_CALLBACK_URL,
    hint: isAbsolute
      ? 'Add redirect_uri above to Google Cloud Console > Credentials > OAuth 2.0 Client > Authorized redirect URIs'
      : 'BACKEND_URL (or OAUTH_CALLBACK_URL) is not set on this server. Set BACKEND_URL in Railway (backend service) to e.g. https://skindiagnostic-backend-production.up.railway.app and redeploy. Use redirect_uri above in Google Console until then.',
  });
});

// OAuth routes
router.get('/oauth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/oauth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

router.get('/oauth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/oauth/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  oauthCallback
);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

export default router;

