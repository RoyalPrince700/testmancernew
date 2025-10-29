import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import { markUnitComplete, getDetailedCourseProgress } from '../services/progressService.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

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

// Note: /goal/:goal endpoint removed - learning goals no longer part of course structure

// Get personalized courses for user based on their academic profile
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build filter based on user's academic profile and allow public courses
    const filter = { isActive: true };

    // Only apply audience scoping when user is in undergraduate/post-UTME path
    const shouldApplyAudienceScope = Boolean(user.isUndergraduate || user.learningCategories?.includes('undergraduate') || user.learningCategories?.includes('postutme'));
    if (shouldApplyAudienceScope) {
      const orConditions = [];

      // Public/general courses: audience missing or all arrays empty
      orConditions.push({ 
        audience: { $exists: false } 
      });
      orConditions.push({ 
        audience: null 
      });
      orConditions.push({ 
        $and: [
          { 'audience.universities': { $size: 0 } },
          { 'audience.faculties': { $size: 0 } },
          { 'audience.departments': { $size: 0 } },
          { 'audience.levels': { $size: 0 } }
        ]
      });

      // Courses that STRICTLY match ALL of the user's profile
      // ALL fields must match: university, faculty, department, AND level
      if (user.university && user.faculty && user.department && user.level) {
        orConditions.push({
          $and: [
            { 'audience.universities': { $in: [user.university] } },
            { 'audience.faculties': { $in: [user.faculty] } },
            { 'audience.departments': { $in: [user.department] } },
            { 'audience.levels': { $in: [user.level] } }
          ]
        });
      }

      filter.$or = orConditions;
    }

    // Get courses that match the filters and have at least one published module
    const courses = await Course.find(filter).populate('modules');

    // Filter out courses with no published modules
    const coursesWithPublishedModules = courses.filter(course => {
      return course.modules.some(module => module.isPublished === true);
    });

    // Add progress information for each course
    const coursesWithProgress = await Promise.all(
      coursesWithPublishedModules.map(async (course) => {
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

        // Filter modules to only show published ones for regular users
        const publishedModules = course.modules.filter(module => module.isPublished === true);

        return {
          ...course.toObject(),
          modules: publishedModules,
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

// Get course by ID with quiz attachments and progress
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('modules');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get quizzes attached to this course
    const quizzes = await Quiz.find({
      courseId: req.params.id,
      isActive: true
    }).select('_id title description moduleId trigger pageOrder difficulty totalQuestions');

    // Get user for progress calculation
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine visible modules based on role (regular users see only published)
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'subadmin' || req.user.role === 'waec_admin' || req.user.role === 'jamb_admin';
    const visibleModules = isAdminUser ? course.modules : course.modules.filter(module => module.isPublished === true);

    // Calculate progress using visible modules only
    const progress = course.getDetailedProgress(user.completionGems, { visibleModules });

    // Enhance modules with quiz information
    const modulesWithQuizzes = visibleModules.map(module => {
      const moduleQuizzes = quizzes.filter(quiz =>
        quiz.moduleId?.toString() === module._id.toString()
      );

      return {
        ...module.toObject(),
        quizzes: moduleQuizzes.map(quiz => ({
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          trigger: quiz.trigger,
          pageOrder: quiz.pageOrder,
          difficulty: quiz.difficulty,
          totalQuestions: quiz.totalQuestions
        }))
      };
    });

    const courseWithProgress = {
      ...course.toObject(),
      modules: modulesWithQuizzes,
      quizzes: quizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        moduleId: quiz.moduleId,
        trigger: quiz.trigger,
        pageOrder: quiz.pageOrder,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.totalQuestions
      })),
      progress
    };

    res.json({ course: courseWithProgress });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark module as completed
router.post('/:courseId/module/:moduleId/complete', authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const userId = req.user.userId;

    const result = await markUnitComplete({ userId, courseId, unitId: moduleId });
    if (!result.ok) {
      return res.status(result.status).json({ message: result.error });
    }

    return res.status(result.status).json({
      message: result.message,
      gemsAwarded: result.gemsAwarded,
      totalGems: result.totalGems,
      progress: result.progress
    });
  } catch (error) {
    console.error('Error marking module complete:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's course progress
router.get('/progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;
    const result = await getDetailedCourseProgress({ userId, courseId });
    if (!result.ok) {
      return res.status(result.status).json({ message: result.error });
    }
    return res.json({ progress: result.progress });
  } catch (error) {
    console.error('Error fetching course progress:', error);
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
      // Subadmins can only see courses within their scope
      // Build filter based on their assignments
      const orConditions = [];
      
      // Include public courses (empty audience)
      orConditions.push({
        $and: [
          { $or: [{ 'audience.universities': { $size: 0 } }, { 'audience.universities': { $exists: false } }] },
          { $or: [{ 'audience.faculties': { $size: 0 } }, { 'audience.faculties': { $exists: false } }] },
          { $or: [{ 'audience.departments': { $size: 0 } }, { 'audience.departments': { $exists: false } }] },
          { $or: [{ 'audience.levels': { $size: 0 } }, { 'audience.levels': { $exists: false } }] }
        ]
      });
      
      // Include courses matching their assignments
      const matchConditions = [];
      if (user.assignedUniversities?.length) {
        matchConditions.push({ 'audience.universities': { $in: user.assignedUniversities } });
      }
      if (user.assignedFaculties?.length) {
        matchConditions.push({ 'audience.faculties': { $in: user.assignedFaculties } });
      }
      if (user.assignedDepartments?.length) {
        matchConditions.push({ 'audience.departments': { $in: user.assignedDepartments } });
      }
      if (user.assignedLevels?.length) {
        matchConditions.push({ 'audience.levels': { $in: user.assignedLevels } });
      }
      
      if (matchConditions.length > 0) {
        orConditions.push({ $and: matchConditions });
      }
      
      filter.$or = orConditions;
    } else if (user.role === 'waec_admin') {
      // TODO: Re-implement category filtering based on new course structure
      // For now, category admins see all courses
      filter = {};
    } else if (user.role === 'jamb_admin') {
      // TODO: Re-implement category filtering based on new course structure
      // For now, category admins see all courses
      filter = {};
    }
    // Full admin sees all courses (no additional filter)

    const courses = await Course.find(filter).populate('modules').populate('createdBy', 'name username role');
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
    const courseData = req.body;

    // Validate input based on user role
    const schema = user.role === 'subadmin' ? subadminCourseSchema : courseSchema;
    const { error } = schema.validate(courseData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Validate that the course fits within the admin's scope
    if (!validateCourseScope(user, courseData)) {
      return res.status(403).json({
        message: 'Cannot create course outside your assigned scope'
      });
    }

    const course = new Course({
      title: courseData.title,
      courseCode: courseData.courseCode,
      description: courseData.description,
      units: courseData.units,
      tags: courseData.tags || [],
      audience: courseData.audience || {},
      structure: courseData.structure || {},
      createdBy: user.userId
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

    // Validate input
    const { error } = courseSchema.validate(updates, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Validate that the updated course still fits within scope
    if (!validateCourseScope(user, {
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

// Validation schemas
const courseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  courseCode: Joi.string().trim().min(1).max(20).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  units: Joi.number().integer().min(1).max(5).required(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  audience: Joi.object({
    universities: Joi.array().items(Joi.string().trim()),
    faculties: Joi.array().items(Joi.string().trim()),
    departments: Joi.array().items(Joi.string().trim()),
    levels: Joi.array().items(Joi.string().trim())
  }).optional(),
  structure: Joi.object({
    unitType: Joi.string().valid('chapter', 'module', 'section', 'topic').required(),
    unitLabel: Joi.string().trim().min(1).max(50).pattern(/^[a-zA-Z\s]+$/).required(),
    unitCount: Joi.number().integer().min(1).max(100).required()
  }).optional()
});

// Schema for subadmin course creation (tags not required)
const subadminCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  courseCode: Joi.string().trim().min(1).max(20).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  units: Joi.number().integer().min(1).max(5).required(),
  audience: Joi.object({
    universities: Joi.array().items(Joi.string().trim()),
    faculties: Joi.array().items(Joi.string().trim()),
    departments: Joi.array().items(Joi.string().trim()),
    levels: Joi.array().items(Joi.string().trim())
  }).optional(),
  structure: Joi.object({
    unitType: Joi.string().valid('chapter', 'module', 'section', 'topic').required(),
    unitLabel: Joi.string().trim().min(1).max(50).pattern(/^[a-zA-Z\s]+$/).required(),
    unitCount: Joi.number().integer().min(1).max(100).required()
  }).optional()
});

const moduleSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  order: Joi.number().integer().min(1).required(),
  estimatedTime: Joi.number().integer().min(1).max(480).required() // Max 8 hours
});

const pageSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  order: Joi.number().integer().min(1).required(),
  html: Joi.string().trim().min(1).max(50000).custom((value, helpers) => {
    // Sanitize HTML content
    const sanitized = sanitizeHtml(value, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height']
      },
      allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
      selfClosing: ['img', 'br']
    });
    return sanitized;
  }).required(),
  audioUrl: Joi.string().uri().allow('').optional(),
  videoUrl: Joi.string().uri().allow('').optional(),
  attachments: Joi.array().items(Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    url: Joi.string().uri().required(),
    type: Joi.string().valid('document', 'image', 'link').required()
  })).optional()
});

// Module CRUD routes (DEPRECATED - use /units endpoints instead)
// Get all modules for a course
router.get('/admin/courses/:courseId/modules', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  console.warn(`DEPRECATED: /modules endpoint used by user ${req.user.userId}. Consider migrating to /units endpoint for enhanced course structure support.`);
  try {
    const { courseId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot access modules for course outside your assigned scope'
      });
    }

    res.json({ modules: course.modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create module for a course
router.post('/admin/courses/:courseId/modules', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  console.warn(`DEPRECATED: /modules endpoint used by user ${req.user.userId}. Consider migrating to /units endpoint for enhanced course structure support.`);
  try {
    const { courseId } = req.params;
    const user = req.user;
    const moduleData = req.body;

    // Validate input
    const { error } = moduleSchema.validate(moduleData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot create modules for course outside your assigned scope'
      });
    }

    // Check if order already exists
    const existingOrder = course.modules.some(mod => mod.order === moduleData.order);
    if (existingOrder) {
      return res.status(400).json({ message: 'Module order must be unique within the course' });
    }

    const newModule = {
      title: moduleData.title,
      description: moduleData.description,
      order: moduleData.order,
      estimatedTime: moduleData.estimatedTime,
      pages: []
    };

    course.modules.push(newModule);
    await course.save();

    const addedModule = course.modules[course.modules.length - 1];

    res.status(201).json({
      module: addedModule,
      message: 'Module created successfully'
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update module
router.put('/admin/courses/:courseId/modules/:moduleId', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  console.warn(`DEPRECATED: /modules endpoint used by user ${req.user.userId}. Consider migrating to /units endpoint for enhanced course structure support.`);
  try {
    const { courseId, moduleId } = req.params;
    const user = req.user;
    const updates = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot update modules for course outside your assigned scope'
      });
    }

    const moduleIndex = course.modules.findIndex(mod => mod._id.toString() === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Validate updates
    const { error } = moduleSchema.validate(updates, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if new order conflicts with existing modules
    if (updates.order && updates.order !== course.modules[moduleIndex].order) {
      const orderExists = course.modules.some((mod, index) =>
        index !== moduleIndex && mod.order === updates.order
      );
      if (orderExists) {
        return res.status(400).json({ message: 'Module order must be unique within the course' });
      }
    }

    // Update module
    Object.assign(course.modules[moduleIndex], updates);
    await course.save();

    res.json({
      module: course.modules[moduleIndex],
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete module
router.delete('/admin/courses/:courseId/modules/:moduleId', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  console.warn(`DEPRECATED: /modules endpoint used by user ${req.user.userId}. Consider migrating to /units endpoint for enhanced course structure support.`);
  try {
    const { courseId, moduleId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot delete modules for course outside your assigned scope'
      });
    }

    const moduleIndex = course.modules.findIndex(mod => mod._id.toString() === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Module not found' });
    }

    course.modules.splice(moduleIndex, 1);
    await course.save();

    res.json({
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Page CRUD routes
// Get all pages for a module
router.get('/admin/courses/:courseId/modules/:moduleId/pages', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot access pages for course outside your assigned scope'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json({ pages: module.pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create page for a module
router.post('/admin/courses/:courseId/modules/:moduleId/pages', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const user = req.user;
    const pageData = req.body;

    // Validate input
    const { error } = pageSchema.validate(pageData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot create pages for course outside your assigned scope'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Check if order already exists in this module
    const existingOrder = module.pages.some(page => page.order === pageData.order);
    if (existingOrder) {
      return res.status(400).json({ message: 'Page order must be unique within the module' });
    }

    const newPage = {
      title: pageData.title,
      order: pageData.order,
      html: pageData.html,
      audioUrl: pageData.audioUrl || '',
      videoUrl: pageData.videoUrl || '',
      attachments: pageData.attachments || [],
      isActive: true
    };

    module.pages.push(newPage);
    await course.save();

    const addedPage = module.pages[module.pages.length - 1];

    res.status(201).json({
      page: addedPage,
      message: 'Page created successfully'
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update page
router.put('/admin/courses/:courseId/modules/:moduleId/pages/:pageId', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, moduleId, pageId } = req.params;
    const user = req.user;
    const updates = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot update pages for course outside your assigned scope'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const pageIndex = module.pages.findIndex(page => page._id.toString() === pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Validate updates
    const { error } = pageSchema.validate(updates, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if new order conflicts with existing pages in this module
    if (updates.order && updates.order !== module.pages[pageIndex].order) {
      const orderExists = module.pages.some((page, index) =>
        index !== pageIndex && page.order === updates.order
      );
      if (orderExists) {
        return res.status(400).json({ message: 'Page order must be unique within the module' });
      }
    }

    // Update page
    Object.assign(module.pages[pageIndex], updates);
    await course.save();

    res.json({
      page: module.pages[pageIndex],
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete page
router.delete('/admin/courses/:courseId/modules/:moduleId/pages/:pageId', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, moduleId, pageId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot delete pages for course outside your assigned scope'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const pageIndex = module.pages.findIndex(page => page._id.toString() === pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ message: 'Page not found' });
    }

    module.pages.splice(pageIndex, 1);
    await course.save();

    res.json({
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Units CRUD routes (alias for modules with enhanced metadata)
// Get all units for a course
router.get('/admin/courses/:courseId/units', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot access units for course outside your assigned scope'
      });
    }

    // Return units with course structure metadata
    const units = course.modules.map(module => ({
      ...module.toObject(),
      unitType: course.structure?.unitType || 'module',
      unitLabel: course.structure?.unitLabel || 'Module'
    }));

    res.json({
      units,
      courseStructure: course.structure
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create unit for a course
router.post('/admin/courses/:courseId/units', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    const unitData = req.body;

    // Validate input
    const { error } = moduleSchema.validate(unitData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot create units for course outside your assigned scope'
      });
    }

    // Check if order already exists
    const existingOrder = course.modules.some(mod => mod.order === unitData.order);
    if (existingOrder) {
      return res.status(400).json({ message: 'Unit order must be unique within the course' });
    }

    const newUnit = {
      title: unitData.title,
      description: unitData.description,
      order: unitData.order,
      estimatedTime: unitData.estimatedTime,
      pages: []
    };

    course.modules.push(newUnit);
    await course.save();

    const addedUnit = course.modules[course.modules.length - 1];

    // Return unit with structure metadata
    const unitWithMetadata = {
      ...addedUnit.toObject(),
      unitType: course.structure?.unitType || 'module',
      unitLabel: course.structure?.unitLabel || 'Module'
    };

    res.status(201).json({
      unit: unitWithMetadata,
      message: 'Unit created successfully'
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update unit
router.put('/admin/courses/:courseId/units/:unitId', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, unitId } = req.params;
    const user = req.user;
    const updates = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot update units for course outside your assigned scope'
      });
    }

    const unitIndex = course.modules.findIndex(mod => mod._id.toString() === unitId);
    if (unitIndex === -1) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Validate updates
    const { error } = moduleSchema.validate(updates, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if new order conflicts with existing units
    if (updates.order && updates.order !== course.modules[unitIndex].order) {
      const orderExists = course.modules.some((mod, index) =>
        index !== unitIndex && mod.order === updates.order
      );
      if (orderExists) {
        return res.status(400).json({ message: 'Unit order must be unique within the course' });
      }
    }

    // Update unit
    Object.assign(course.modules[unitIndex], updates);
    await course.save();

    // Return unit with structure metadata
    const updatedUnit = {
      ...course.modules[unitIndex].toObject(),
      unitType: course.structure?.unitType || 'module',
      unitLabel: course.structure?.unitLabel || 'Module'
    };

    res.json({
      unit: updatedUnit,
      message: 'Unit updated successfully'
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete unit
router.delete('/admin/courses/:courseId/units/:unitId', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, unitId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot delete units for course outside your assigned scope'
      });
    }

    const unitIndex = course.modules.findIndex(mod => mod._id.toString() === unitId);
    if (unitIndex === -1) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    course.modules.splice(unitIndex, 1);
    await course.save();

    res.json({
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Publish unit
router.post('/admin/courses/:courseId/units/:unitId/publish', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, unitId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot publish units for course outside your assigned scope'
      });
    }

    const unit = course.modules.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Check if unit has pages before allowing publish
    if (!unit.pages || unit.pages.length === 0) {
      return res.status(400).json({ message: 'Cannot publish unit without pages. Add pages first.' });
    }

    unit.isPublished = true;
    await course.save();

    res.json({
      message: 'Unit published successfully',
      unit: {
        ...unit.toObject(),
        unitType: course.structure?.unitType || 'module',
        unitLabel: course.structure?.unitLabel || 'Module'
      }
    });
  } catch (error) {
    console.error('Error publishing unit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unpublish unit
router.post('/admin/courses/:courseId/units/:unitId/unpublish', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { courseId, unitId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate scope
    if (!validateCourseScope(user, course)) {
      return res.status(403).json({
        message: 'Cannot unpublish units for course outside your assigned scope'
      });
    }

    const unit = course.modules.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    unit.isPublished = false;
    await course.save();

    res.json({
      message: 'Unit unpublished successfully',
      unit: {
        ...unit.toObject(),
        unitType: course.structure?.unitType || 'module',
        unitLabel: course.structure?.unitLabel || 'Module'
      }
    });
  } catch (error) {
    console.error('Error unpublishing unit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to validate if a course is within an admin's scope
function validateCourseScope(user, course) {
  const { role, assignedUniversities, assignedFaculties, assignedDepartments, assignedLevels } = user;
  const { audience } = course;

  // Full admin can manage all courses
  if (role === 'admin') {
    return true;
  }

  // Category admins currently have full access (learningGoals removed)
  // TODO: Re-implement category restrictions based on new course structure
  if (role === 'waec_admin' || role === 'jamb_admin') {
    return true;
  }

  // Subadmin validation - STRICT MATCHING
  if (role === 'subadmin') {
    // Check if course audience matches assignments
    const courseUniversities = audience?.universities || [];
    const courseFaculties = audience?.faculties || [];
    const courseDepartments = audience?.departments || [];
    const courseLevels = audience?.levels || [];

    // If course has no audience restrictions (all arrays empty), allow it
    // This allows subadmins to create general/public courses
    if (courseUniversities.length === 0 && courseFaculties.length === 0 && 
        courseDepartments.length === 0 && courseLevels.length === 0) {
      return true;
    }

    // For scoped courses, validate based on what assignments the subadmin has
    // During transition period, departments might not be assigned yet
    const hasUniversityAssignment = assignedUniversities?.length > 0;
    const hasFacultyAssignment = assignedFaculties?.length > 0;
    const hasDepartmentAssignment = assignedDepartments?.length > 0;
    const hasLevelAssignment = assignedLevels?.length > 0;

    // If subadmin has no assignments at all, they can't create scoped courses
    if (!hasUniversityAssignment && !hasFacultyAssignment && 
        !hasDepartmentAssignment && !hasLevelAssignment) {
      return false;
    }

    // STRICT validation: ALL populated fields must match
    // Check each field only if the subadmin has that assignment AND the course has that requirement
    if (courseUniversities.length > 0) {
      if (!hasUniversityAssignment) return false;
      const match = assignedUniversities?.some(univ => courseUniversities.includes(univ));
      if (!match) return false;
    }

    if (courseFaculties.length > 0) {
      if (!hasFacultyAssignment) return false;
      const match = assignedFaculties?.some(fac => courseFaculties.includes(fac));
      if (!match) return false;
    }

    if (courseDepartments.length > 0) {
      if (!hasDepartmentAssignment) return false;
      const match = assignedDepartments?.some(dept => courseDepartments.includes(dept));
      if (!match) return false;
    }

    if (courseLevels.length > 0) {
      if (!hasLevelAssignment) return false;
      const match = assignedLevels?.some(level => courseLevels.includes(level));
      if (!match) return false;
    }

    return true;
  }

  return false;
}

export default router;
