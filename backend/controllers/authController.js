import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const googleCallback = (req, res) => {
  try {
    const { user } = req;
    if (!user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth?error=auth_failed`);
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth?error=auth_failed`);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Check if req.user exists and has the right structure
    if (!req.user) {
      console.error('No user in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Handle both userId (from JWT) and _id (from passport)
    const userId = req.user.userId || req.user._id;

    const user = await User.findById(userId).select('-__v');
    if (!user) {
      console.error('User not found in database:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getMe = getCurrentUser; // Alias for backward compatibility
