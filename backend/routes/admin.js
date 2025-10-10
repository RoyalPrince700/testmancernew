import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import PostUtmeProgress from '../models/PostUtmeProgress.js';

const router = express.Router();

// All admin routes require authentication and appropriate permissions
router.use(protect);

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;

    let courseQuery = {};
    let quizQuery = {};
    let userQuery = {};

    // Apply role-based filtering
    if (user.role === 'subadmin') {
      // Subadmins can only see courses/quizzes within their scope
      courseQuery = buildScopedQuery(user);
      quizQuery = buildScopedQuery(user);
      // For users, we might want to show users from their assigned scope
      userQuery = buildUserScopedQuery(user);
    } else if (user.role === 'waec_admin') {
      // TODO: Re-implement category filtering based on new course structure
      courseQuery = {};
      quizQuery = {};
      userQuery = { learningCategories: { $in: ['waec'] } };
    } else if (user.role === 'jamb_admin') {
      // TODO: Re-implement category filtering based on new course structure
      courseQuery = {};
      quizQuery = {};
      userQuery = { learningCategories: { $in: ['jamb'] } };
    }
    // Full admins see everything (no additional filtering)

    // Get course count
    const courseCount = await Course.countDocuments(courseQuery);

    // Get quiz count
    const quizCount = await Quiz.countDocuments(quizQuery);

    // Get user count (students served)
    const userCount = await User.countDocuments({
      ...userQuery,
      role: { $ne: 'admin' } // Exclude admins from student count
    });

    res.json({
      success: true,
      courses: courseCount,
      quizzes: quizCount,
      students: userCount
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
});

// Helper function to build scoped query for subadmins
function buildScopedQuery(user) {
  const { assignedUniversities, assignedFaculties, assignedLevels } = user;
  const query = {};

  // Build audience filter
  const audienceConditions = [];

  if (assignedUniversities?.length > 0) {
    audienceConditions.push({ 'audience.universities': { $in: assignedUniversities } });
  }

  if (assignedFaculties?.length > 0) {
    audienceConditions.push({ 'audience.faculties': { $in: assignedFaculties } });
  }

  if (assignedLevels?.length > 0) {
    audienceConditions.push({ 'audience.levels': { $in: assignedLevels } });
  }

  // If no assignments, return a query that matches nothing
  if (audienceConditions.length === 0) {
    return { _id: null };
  }

  // Match courses that either have no audience restrictions OR match the user's assignments
  query.$or = [
    { audience: { $exists: false } },
    { audience: null },
    { audience: {} },
    {
      $and: audienceConditions.length === 1 ? audienceConditions : [{ $or: audienceConditions }]
    }
  ];

  return query;
}

// Helper function to build user scoped query for subadmins
function buildUserScopedQuery(user) {
  // For now, return all users - this could be refined to show only users
  // from assigned universities/faculties/levels based on user profile
  return {};
}

export default router;
