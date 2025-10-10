import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find().populate('modules');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get courses by learning goal
router.get('/goal/:goal', authenticateToken, async (req, res) => {
  try {
    const { goal } = req.params;
    const courses = await Course.find({ learningGoals: goal }).populate('modules');
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get personalized courses for user based on their learning categories
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const { category } = req.query;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter by specific category if provided, otherwise use all user's learning categories
    const filterCategories = category ? [category] : user.learningCategories;

    // Build filter based on user's learning categories and profile
    let filter = {
      isActive: true,
      learningGoals: { $in: filterCategories }
    };

    // For undergraduate users, also filter by audience (university/faculty/level)
    if (user.isUndergraduate && (user.university || user.faculty || user.level)) {
      // Build audience matching conditions
      const audienceConditions = [];

      // Always include courses with no audience restriction (general courses)
      audienceConditions.push({ 'audience': { $exists: false } });
      audienceConditions.push({ 'audience': {} });

      // Add specific university/faculty/level matching
      if (user.university || user.faculty || user.level) {
        const specificMatch = {};
        if (user.university) {
          specificMatch['audience.universities'] = user.university;
        }
        if (user.faculty) {
          specificMatch['audience.faculties'] = user.faculty;
        }
        if (user.level) {
          specificMatch['audience.levels'] = user.level;
        }
        audienceConditions.push(specificMatch);
      }

      // Combine with existing learningGoals filter
      filter.$and = [
        { learningGoals: { $in: filterCategories } },
        { $or: audienceConditions }
      ];
      delete filter.learningGoals; // Remove from root level since it's now in $and
    }

    // Get courses that match the filters
    const courses = await Course.find(filter).populate('modules');

    // Add progress information for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progressResponse = await fetch(`${req.protocol}://${req.get('host')}/api/courses/progress/${course._id}`, {
          method: 'GET',
          headers: {
            'Authorization': req.headers.authorization,
            'Content-Type': 'application/json'
          }
        });

        let progress = null;
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          progress = progressData.progress;
        }

        return {
          ...course.toObject(),
          progress: progress
        };
      })
    );

    res.json({ courses: coursesWithProgress });
  } catch (error) {
    console.error('Error fetching personalized courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get course by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('modules');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark module as completed
router.post('/:courseId/module/:moduleId/complete', authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const userId = req.user.userId;

    // Check if user already completed this module
    const user = await User.findById(userId);
    const alreadyCompleted = user.completedModules.includes(moduleId);

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Module already completed' });
    }

    // Add module to completed modules and award gems
    user.completedModules.push(moduleId);
    user.gems += 3; // Award 3 gems for module completion
    await user.save();

    res.json({
      message: 'Module completed successfully',
      gemsAwarded: 3,
      totalGems: user.gems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's course progress
router.get('/progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate('modules');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const completedModules = user.completedModules.filter(moduleId =>
      course.modules.some(module => module._id.toString() === moduleId.toString())
    );

    const progress = {
      courseId,
      courseName: course.title,
      totalModules: course.modules.length,
      completedModules: completedModules.length,
      progressPercentage: Math.round((completedModules.length / course.modules.length) * 100),
      completedModuleIds: completedModules
    };

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes for course management (scoped by role)
// Get courses for admin/subadmin (scoped to their permissions)
router.get('/admin/courses', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;
    let filter = {};

    // Apply role-based filtering
    if (user.role === 'subadmin') {
      // Subadmins can only see courses for their assigned universities/faculties/levels
      if (user.assignedUniversities?.length || user.assignedFaculties?.length || user.assignedLevels?.length) {
        filter.$or = [];

        if (user.assignedUniversities?.length) {
          filter.$or.push({ 'audience.universities': { $in: user.assignedUniversities } });
        }
        if (user.assignedFaculties?.length) {
          filter.$or.push({ 'audience.faculties': { $in: user.assignedFaculties } });
        }
        if (user.assignedLevels?.length) {
          filter.$or.push({ 'audience.levels': { $in: user.assignedLevels } });
        }
      } else {
        // No assignments - return empty
        return res.json({ courses: [] });
      }
    } else if (user.role === 'waec_admin') {
      // WAEC admins only see WAEC courses
      filter.learningGoals = 'waec';
    } else if (user.role === 'jamb_admin') {
      // JAMB admins only see JAMB courses
      filter.learningGoals = 'jamb';
    }
    // Full admin sees all courses (no additional filter)

    const courses = await Course.find(filter).populate('modules');
    res.json({ courses });
  } catch (error) {
    console.error('Error fetching admin courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create course (admin/subadmin scoped)
router.post('/admin/courses', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;
    const { title, description, learningGoals, category, audience } = req.body;

    // Validate that the course fits within the admin's scope
    if (!validateCourseScope(user, { learningGoals, audience })) {
      return res.status(403).json({
        message: 'Cannot create course outside your assigned scope'
      });
    }

    const course = new Course({
      title,
      description,
      learningGoals,
      category,
      audience: audience || {}
    });

    await course.save();
    await course.populate('modules');

    res.status(201).json({
      course,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update course (admin/subadmin scoped)
router.put('/admin/courses/:id', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;
    const courseId = req.params.id;
    const updates = req.body;

    // First check if the course exists and belongs to admin's scope
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate that the updated course still fits within scope
    if (!validateCourseScope(user, {
      learningGoals: updates.learningGoals || existingCourse.learningGoals,
      audience: updates.audience || existingCourse.audience
    })) {
      return res.status(403).json({
        message: 'Cannot modify course to be outside your assigned scope'
      });
    }

    const course = await Course.findByIdAndUpdate(courseId, updates, {
      new: true,
      runValidators: true
    }).populate('modules');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      course,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete course (admin/subadmin scoped)
router.delete('/admin/courses/:id', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;
    const courseId = req.params.id;

    // First check if the course exists and belongs to admin's scope
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot delete course outside your assigned scope'
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to validate if a course is within an admin's scope
function validateCourseScope(user, course) {
  const { role, assignedUniversities, assignedFaculties, assignedLevels } = user;
  const { learningGoals, audience } = course;

  // Full admin can manage all courses
  if (role === 'admin') {
    return true;
  }

  // WAEC admin can only manage WAEC courses
  if (role === 'waec_admin') {
    return learningGoals?.includes('waec');
  }

  // JAMB admin can only manage JAMB courses
  if (role === 'jamb_admin') {
    return learningGoals?.includes('jamb');
  }

  // Subadmin validation
  if (role === 'subadmin') {
    // Must have assignments
    if (!assignedUniversities?.length && !assignedFaculties?.length && !assignedLevels?.length) {
      return false;
    }

    // Check if course audience matches assignments
    const courseUniversities = audience?.universities || [];
    const courseFaculties = audience?.faculties || [];
    const courseLevels = audience?.levels || [];

    const universityMatch = assignedUniversities?.some(univ =>
      courseUniversities.includes(univ)
    );

    const facultyMatch = assignedFaculties?.some(fac =>
      courseFaculties.includes(fac)
    );

    const levelMatch = assignedLevels?.some(level =>
      courseLevels.includes(level)
    );

    return universityMatch || facultyMatch || levelMatch;
  }

  return false;
}

export default router;
