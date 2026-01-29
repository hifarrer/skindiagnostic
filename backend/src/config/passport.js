import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Construct full callback URL for OAuth
  // Use environment variable if set, otherwise construct from request
  const getCallbackURL = (req) => {
    if (process.env.OAUTH_CALLBACK_URL) {
      return process.env.OAUTH_CALLBACK_URL;
    }
    // For Vercel, use the full URL
    const protocol = req?.protocol || (req?.secure ? 'https' : 'http') || 'https';
    const host = req?.get?.('host') || process.env.VERCEL_URL || process.env.BACKEND_URL || 'localhost:3000';
    return `${protocol}://${host}/api/auth/oauth/google/callback`;
  };

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.OAUTH_CALLBACK_URL || process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/auth/oauth/google/callback` : '/api/auth/oauth/google/callback',
        passReqToCallback: true, // Allow access to request object
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findByOAuth('google', profile.id);
          
          if (!user) {
            if (profile.emails && profile.emails[0]) {
              user = await User.findByEmail(profile.emails[0].value);
            }
            
            if (!user) {
              user = await User.create({
                email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
                name: profile.displayName,
                avatar_url: profile.photos?.[0]?.value,
                oauth_provider: 'google',
                oauth_id: profile.id,
              });
            } else {
              user = await User.update(user.id, {
                oauth_provider: 'google',
                oauth_id: profile.id,
                avatar_url: profile.photos?.[0]?.value || user.avatar_url,
              });
            }
          }
          
          return done(null, { provider: 'google', profile, user });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/api/auth/oauth/facebook/callback',
        profileFields: ['id', 'displayName', 'photos', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findByOAuth('facebook', profile.id);
          
          if (!user) {
            if (profile.emails && profile.emails[0]) {
              user = await User.findByEmail(profile.emails[0].value);
            }
            
            if (!user) {
              user = await User.create({
                email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
                name: profile.displayName,
                avatar_url: profile.photos?.[0]?.value,
                oauth_provider: 'facebook',
                oauth_id: profile.id,
              });
            } else {
              user = await User.update(user.id, {
                oauth_provider: 'facebook',
                oauth_id: profile.id,
                avatar_url: profile.photos?.[0]?.value || user.avatar_url,
              });
            }
          }
          
          return done(null, { provider: 'facebook', profile, user });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

export default passport;

