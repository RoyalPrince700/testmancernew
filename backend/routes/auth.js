import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { googleCallback, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Google OAuth route called');

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth credentials not found');
    return res.status(500).json({
      success: false,
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  }

  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=auth_failed`, session: false }),
  googleCallback
);

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
  console.log('GET /api/auth/test route hit');
  res.json({ message: 'Auth routes are working', timestamp: new Date().toISOString() });
});

// Get current user
router.get('/me', (req, res, next) => {
  console.log('GET /api/auth/me route hit');
  console.log('Headers:', req.headers);
  next();
}, protect, getMe);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Verify token middleware (for backward compatibility)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export default router;