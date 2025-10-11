import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
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

    // Calculate recent gem earnings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentGemEarnings = user.quizHistory
      .filter(quiz => new Date(quiz.completedAt) >= sevenDaysAgo)
      .reduce((total, quiz) => {
        // Calculate gems earned in this quiz (approximate)
        // Since we don't store gems per quiz, we'll estimate based on score
        const estimatedGems = Math.floor((quiz.correctAnswers / quiz.totalQuestions) * quiz.totalQuestions);
        return total + estimatedGems;
      }, 0);

    // Get course progress data
    const courses = await Course.find().select('title modules structure');
    const courseProgress = courses.map(course => {
      const totalUnits = course.structure?.unitCount || course.modules?.length || 0;
      const completedUnits = user.completedModules.filter(moduleId =>
        course.modules.some(module => module._id.toString() === moduleId.toString())
      ).length;

      return {
        courseId: course._id,
        courseTitle: course.title,
        totalUnits,
        completedUnits,
        progressPercentage: totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0,
        unitLabel: course.structure?.unitLabel || 'Module'
      };
    }).filter(progress => progress.totalUnits > 0); // Only include courses with units

    const stats = {
      totalQuizzes,
      completedQuizzes,
      totalScore,
      averageScore,
      rank: userRank || 1,
      totalGems: user.gems,
      recentGems: recentGemEarnings,
      completedModules: user.completedModules.length,
      learningCategories: user.learningCategories,
      recentQuizzes,
      courseProgress
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark unit as completed and award gems if first attempt
router.post('/complete-unit', authenticateToken, async (req, res) => {
  try {
    const { courseId, unitId } = req.body;

    // Validate required fields
    if (!courseId || !unitId) {
      return res.status(400).json({
        message: 'Course ID and Unit ID are required'
      });
    }

    // Verify course exists and unit belongs to course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const unitExists = course.modules.some(module => module._id.toString() === unitId);
    if (!unitExists) {
      return res.status(404).json({ message: 'Unit not found in course' });
    }

    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Record completion gem (only awards if first attempt)
    const wasAwarded = await user.recordCompletionGemForUnit(courseId, unitId);
    const gemsAwarded = wasAwarded ? 3 : 0;

    res.json({
      message: 'Unit completion recorded successfully',
      gemsAwarded,
      totalGems: user.gems,
      firstAttempt: wasAwarded
    });

  } catch (error) {
    console.error('Error recording unit completion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark page as completed and award gems if first attempt
router.post('/complete-page', authenticateToken, async (req, res) => {
  try {
    const { courseId, pageId } = req.body;

    // Validate required fields
    if (!courseId || !pageId) {
      return res.status(400).json({
        message: 'Course ID and Page ID are required'
      });
    }

    // Verify course exists and page belongs to course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let pageFound = false;
    for (const module of course.modules) {
      if (module.pages && module.pages.some(page => page._id.toString() === pageId)) {
        pageFound = true;
        break;
      }
    }

    if (!pageFound) {
      return res.status(404).json({ message: 'Page not found in course' });
    }

    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Record completion gem (only awards if first attempt)
    const wasAwarded = await user.recordCompletionGemForPage(courseId, pageId);
    const gemsAwarded = wasAwarded ? 3 : 0;

    res.json({
      message: 'Page completion recorded successfully',
      gemsAwarded,
      totalGems: user.gems,
      firstAttempt: wasAwarded
    });

  } catch (error) {
    console.error('Error recording page completion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed course progress with unit/page status
router.get('/course-progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get course with full details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get detailed progress using the new method
    const progress = course.getDetailedProgress(user.completionGems);

    res.json({
      course: {
        id: course._id,
        title: course.title,
        courseCode: course.courseCode,
        description: course.description,
        unitLabel: course.structure?.unitLabel || 'Module'
      },
      progress
    });

  } catch (error) {
    console.error('Error fetching course progress:', error);
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
router.put('/admin/:userId([0-9a-fA-F]{24})/role', protect, requirePermission('manage_users'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'subadmin', 'waec_admin', 'jamb_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role',
        validRoles
      });
    }

    // Normalize and validate assignments based on role
    const toArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return [value];
      return [];
    };

    const sanitizeList = (list) => {
      const unique = new Set(
        toArray(list)
          .map((v) => (v == null ? '' : String(v)))
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
      );
      return Array.from(unique);
    };

    const inputUniversities = sanitizeList(req.body.assignedUniversities);
    const inputFaculties = sanitizeList(req.body.assignedFaculties);
    const inputLevels = sanitizeList(req.body.assignedLevels);

    const updateData = { role };

    if (role === 'subadmin') {
      const hasAnyAssignment =
        inputUniversities.length > 0 || inputFaculties.length > 0 || inputLevels.length > 0;
      if (!hasAnyAssignment) {
        return res.status(400).json({
          message: 'Subadmin must have at least one assigned university, faculty, or level'
        });
      }
      updateData.assignedUniversities = inputUniversities;
      updateData.assignedFaculties = inputFaculties;
      updateData.assignedLevels = inputLevels;
    } else if (['waec_admin', 'jamb_admin'].includes(role)) {
      // Category admins don't require scoped assignments; clear them
      updateData.assignedUniversities = [];
      updateData.assignedFaculties = [];
      updateData.assignedLevels = [];
    } else {
      // For user/admin, clear assignments
      updateData.assignedUniversities = [];
      updateData.assignedFaculties = [];
      updateData.assignedLevels = [];
    }

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
router.get('/admin/:userId([0-9a-fA-F]{24})', protect, requirePermission('manage_users'), async (req, res) => {
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

// Get admin dashboard statistics
router.get('/admin/stats', protect, requirePermission('manage_users'), async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const subAdminUsers = await User.countDocuments({ role: 'subadmin' });
    const categoryAdminUsers = await User.countDocuments({
      role: { $in: ['waec_admin', 'jamb_admin'] }
    });

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const coursesByCategory = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get media files count (placeholder - would need to integrate with Cloudinary or file storage)
    const mediaFiles = 0; // TODO: Implement actual media count

    // Get total gems earned
    const totalGemsResult = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$gems' }
        }
      }
    ]);
    const totalGems = totalGemsResult.length > 0 ? totalGemsResult[0].total : 0;

    res.json({
      users: {
        total: totalUsers,
        admin: adminUsers,
        subadmin: subAdminUsers,
        categoryAdmins: categoryAdminUsers
      },
      courses: {
        total: totalCourses,
        byCategory: coursesByCategory
      },
      media: {
        total: mediaFiles
      },
      gems: {
        total: totalGems
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
