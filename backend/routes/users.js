import express from 'express';
import User from '../models/User.js';
import { authenticateToken, protect, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Basic validation
    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({
        available: false,
        message: 'Username must be between 3 and 20 characters'
      });
    }

    // Check if username contains only allowed characters
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        available: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({
      username: username.toLowerCase()
    });

    if (existingUser) {
      return res.json({
        available: false,
        message: 'Username is already taken'
      });
    }

    res.json({
      available: true,
      message: 'Username is available'
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({
      available: false,
      message: 'Server error checking username'
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user learning goals
router.put('/learning-goals', authenticateToken, async (req, res) => {
  try {
    const { learningGoals } = req.body;

    if (!Array.isArray(learningGoals)) {
      return res.status(400).json({ message: 'Learning goals must be an array' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { learningGoals },
      { new: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'Learning goals updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      avatar,
      username,
      learningCategories,
      university,
      studyPreferences,
      onboardingCompleted
    } = req.body;

    // Prepare update object
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (username !== undefined) updateData.username = username;
    if (learningCategories !== undefined) updateData.learningCategories = learningCategories;
    if (university !== undefined) updateData.university = university;
    if (studyPreferences !== undefined) updateData.studyPreferences = studyPreferences;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);

    // Handle duplicate username error
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(400).json({
        message: 'Username is already taken',
        error: 'DUPLICATE_USERNAME'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics for dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate quiz statistics
    const totalQuizzes = user.quizHistory.length;
    const completedQuizzes = user.quizHistory.length;
    const totalScore = user.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Calculate rank (simplified - in a real app you'd compare with all users)
    const allUsers = await User.find({ quizHistory: { $exists: true, $ne: [] } })
      .sort({ gems: -1 });
    const userRank = allUsers.findIndex(u => u._id.toString() === user._id.toString()) + 1;

    // Get recent quizzes (last 5)
    const recentQuizzes = user.quizHistory
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map(quiz => ({
        id: quiz.quizId,
        title: `Quiz ${quiz.quizId}`, // You might want to fetch actual quiz titles
        score: quiz.score,
        completedAt: quiz.completedAt.toISOString().split('T')[0],
        totalQuestions: quiz.totalQuestions,
        correctAnswers: quiz.correctAnswers
      }));

    const stats = {
      totalQuizzes,
      completedQuizzes,
      totalScore,
      averageScore,
      rank: userRank || 1,
      totalGems: user.gems,
      completedModules: user.completedModules.length,
      learningCategories: user.learningCategories,
      recentQuizzes
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes for user management
// Get all users (admin only)
router.get('/admin/all', protect, requirePermission('manage_users'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-__v -quizHistory -completedModules')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role (admin only)
router.put('/admin/:userId/role', protect, requirePermission('manage_users'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, assignedUniversities, assignedFaculties, assignedLevels } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'subadmin', 'waec_admin', 'jamb_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role',
        validRoles
      });
    }

    // Validate assignments based on role
    if (role === 'subadmin') {
      if (!assignedUniversities?.length && !assignedFaculties?.length && !assignedLevels?.length) {
        return res.status(400).json({
          message: 'Subadmin must have at least one assigned university, faculty, or level'
        });
      }
    } else if (['waec_admin', 'jamb_admin'].includes(role)) {
      // Category admins don't need university/faculty/level assignments
      // But we should clear any existing ones
    } else {
      // For user/admin, clear assignments
      assignedUniversities = [];
      assignedFaculties = [];
      assignedLevels = [];
    }

    const updateData = { role };
    if (assignedUniversities !== undefined) updateData.assignedUniversities = assignedUniversities;
    if (assignedFaculties !== undefined) updateData.assignedFaculties = assignedFaculties;
    if (assignedLevels !== undefined) updateData.assignedLevels = assignedLevels;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v -quizHistory -completedModules');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user details for admin (admin only)
router.get('/admin/:userId', protect, requirePermission('manage_users'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-__v -quizHistory -completedModules')
      .populate('completedModules', 'title');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
