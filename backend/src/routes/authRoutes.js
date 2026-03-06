import express from 'express';
import passport, { getGoogleCallbackURL } from '../config/passport.js';
import { oauthCallback, getMe, logout, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Debug: see exact redirect_uri sent to Google (must match Google Console exactly)
router.get('/oauth/callback-url', (req, res) => {
  res.json({
    redirect_uri: getGoogleCallbackURL(),
    hint: 'Add this exact redirect_uri to Google Cloud Console > Credentials > OAuth 2.0 Client > Authorized redirect URIs',
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

