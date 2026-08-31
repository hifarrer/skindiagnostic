import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { generateToken } from '../middleware/auth.js';
import pool from '../config/database.js';
import { getFrontendUrl } from '../config/urls.js';

export const oauthCallback = async (req, res) => {
  try {
    const { provider, profile } = req.user; // Set by passport strategy
    
    let user = await User.findByOAuth(provider, profile.id);
    
    if (!user) {
      // Check if user exists with this email
      if (profile.emails && profile.emails[0]) {
        user = await User.findByEmail(profile.emails[0].value);
      }
      
      if (!user) {
        // Create new user
        user = await User.create({
          email: profile.emails?.[0]?.value || `${profile.id}@${provider}.com`,
          name: profile.displayName || profile.name?.givenName || 'User',
          avatar_url: profile.photos?.[0]?.value || null,
          oauth_provider: provider,
          oauth_id: profile.id,
        });
      } else {
        // Update existing user with OAuth info
        user = await User.update(user.id, {
          oauth_provider: provider,
          oauth_id: profile.id,
          avatar_url: profile.photos?.[0]?.value || user.avatar_url,
        });
      }
    }

    const token = generateToken(user.id);
    
    // For web, redirect to frontend with token in URL hash (must be full URL or browser treats as relative)
    const frontendUrl = getFrontendUrl();
    const userData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        subscription_status: user.subscription_status,
      },
    };
    
    // Check if request is from web browser (has Accept: text/html header)
    const isWebRequest = req.headers.accept && req.headers.accept.includes('text/html');
    
    if (isWebRequest) {
      // Redirect to frontend with token in URL hash
      const tokenData = encodeURIComponent(JSON.stringify(userData));
      res.redirect(`${frontendUrl}/auth/callback?data=${tokenData}`);
    } else {
      // Return JSON for API clients
      res.json(userData);
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = getFrontendUrl();
    const isWebRequest = req.headers.accept && req.headers.accept.includes('text/html');
    
    if (isWebRequest) {
      res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    } else {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const analysesCount = await pool.query(
      'SELECT COUNT(*) FROM skin_analysis_results WHERE user_id = $1',
      [req.user.id]
    );
    
    const looksTriedCount = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND task_type = $2 AND status = $3',
      [req.user.id, 'look_vto', 'completed']
    );

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      avatar_url: user.avatar_url,
      subscription_status: user.subscription_status,
      subscription_plan_id: user.subscription_plan_id,
      statistics: {
        analyses: parseInt(analysesCount.rows[0].count) || 0,
        looksTried: parseInt(looksTriedCount.rows[0].count) || 0,
        favorites: 0, // Can be implemented later if needed
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, age } = req.body;
    const userId = req.user.id;

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate age
    if (age !== undefined && age !== null) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        return res.status(400).json({ error: 'Age must be a number between 0 and 150' });
      }
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // Update user
    const updates = {};
    if (email !== undefined) updates.email = email;
    if (age !== undefined) updates.age = age !== null && age !== '' ? parseInt(age) : null;

    const updatedUser = await User.update(userId, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      age: updatedUser.age,
      avatar_url: updatedUser.avatar_url,
      subscription_status: updatedUser.subscription_status,
      subscription_plan_id: updatedUser.subscription_plan_id,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const logout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // But we can add token blacklisting here if needed
  res.json({ message: 'Logged out successfully' });
};

