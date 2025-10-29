import express from 'express';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();
// helper: strip sensitive fields for student consumption
function sanitizeAssessmentForStudent(assessDoc) {
  if (!assessDoc) return null;
  const a = assessDoc;
  return {
    _id: a._id,
    title: a.title,
    description: a.description,
    type: a.type,
    courseId: a.courseId,
    moduleId: a.moduleId,
    trigger: a.trigger,
    pageOrder: a.pageOrder,
    timeLimit: a.timeLimit,
    passingScore: a.passingScore,
    totalMarks: a.totalMarks,
    instructions: a.instructions,
    totalQuestions: Array.isArray(a.questions) ? a.questions.length : 0,
    questions: (a.questions || []).map(q => ({
      _id: q._id,
      question: q.question,
      questionType: q.questionType,
      options: q.options,
      marks: q.marks
      // omit correctAnswer and explanation prior to submission
    }))
  };
}


// Validation schemas
const createAssessmentSchema = Joi.object({
  courseId: Joi.string().hex().length(24).required(),
  type: Joi.string().valid('ca', 'exam').required(),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  questions: Joi.array().items(Joi.object({
    question: Joi.string().trim().min(10).max(500).required(),
    questionType: Joi.string().valid('multiple_choice', 'true_false', 'short_answer').required(),
    options: Joi.when('questionType', {
      is: 'multiple_choice',
      then: Joi.array().items(Joi.string().trim().min(1).max(200)).length(4).required(),
      otherwise: Joi.array().items(Joi.string().trim()).optional()
    }),
    correctAnswer: Joi.when('questionType', {
      is: 'short_answer',
      then: Joi.string().trim().optional(),
      otherwise: Joi.when('questionType', {
        is: 'true_false',
        then: Joi.number().integer().min(0).max(1).required(),
        otherwise: Joi.number().integer().min(0).max(3).required() // for multiple choice
      })
    }),
    explanation: Joi.string().trim().allow('').min(0).max(500).optional(),
    marks: Joi.number().integer().min(1).optional()
  })).min(1).max(50).required(),
  trigger: Joi.string().valid('unit', 'page').required(),
  moduleId: Joi.string().hex().length(24).optional(),
  pageOrder: Joi.when('trigger', {
    is: 'page',
    then: Joi.number().integer().min(1).required(),
    otherwise: Joi.forbidden()
  }),
  timeLimit: Joi.number().integer().min(15).max(480).optional(), // 15 minutes to 8 hours
  passingScore: Joi.number().integer().min(0).max(100).optional(),
  totalMarks: Joi.number().integer().min(1).optional(),
  instructions: Joi.string().trim().allow('').max(1000).optional(),
  isActive: Joi.boolean().optional(),
  audience: Joi.object({
    universities: Joi.array().items(Joi.string().trim()).optional(),
    faculties: Joi.array().items(Joi.string().trim()).optional(),
    departments: Joi.array().items(Joi.string().trim()).optional(),
    levels: Joi.array().items(Joi.string().trim()).optional()
  }).optional()
});

const updateAssessmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().min(10).max(1000).optional(),
  questions: Joi.array().items(Joi.object({
    _id: Joi.string().hex().length(24).optional(), // allow subdocument id during updates
    question: Joi.string().trim().min(10).max(500).required(),
    questionType: Joi.string().valid('multiple_choice', 'true_false', 'short_answer').required(),
    options: Joi.when('questionType', {
      is: 'multiple_choice',
      then: Joi.array().items(Joi.string().trim().min(1).max(200)).length(4).required(),
      otherwise: Joi.array().items(Joi.string().trim()).optional()
    }),
    correctAnswer: Joi.when('questionType', {
      is: 'short_answer',
      then: Joi.string().trim().optional(),
      otherwise: Joi.when('questionType', {
        is: 'true_false',
        then: Joi.number().integer().min(0).max(1).required(),
        otherwise: Joi.number().integer().min(0).max(3).required()
      })
    }),
    explanation: Joi.string().trim().allow('').min(0).max(500).optional(),
    marks: Joi.number().integer().min(1).optional()
  })).min(1).max(50).optional(),
  trigger: Joi.string().valid('unit', 'page').optional(),
  moduleId: Joi.string().hex().length(24).optional(),
  pageOrder: Joi.when('trigger', {
    is: 'page',
    then: Joi.number().integer().min(1).optional(),
    otherwise: Joi.forbidden()
  }),
  timeLimit: Joi.number().integer().min(15).max(480).optional(),
  passingScore: Joi.number().integer().min(0).max(100).optional(),
  totalMarks: Joi.number().integer().min(1).optional(),
  instructions: Joi.string().trim().allow('').max(1000).optional(),
  isActive: Joi.boolean().optional()
});

// Admin routes for managing assessments

// Get all assessments (admin) - scoped for subadmins
router.get('/admin/assessments', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { type, courseId, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (courseId) filter.courseId = courseId;
    if (typeof isActive !== 'undefined') {
      // accept both boolean and string
      const flag = (isActive === true || isActive === 'true');
      filter.isActive = flag;
    }

    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all assessments matching base filters
    const allAssessments = await Assessment.find(filter)
      .populate('courseId', 'title courseCode')
      .sort({ createdAt: -1 });

    // For subadmins, filter to only show assessments within their scope
    let assessments = allAssessments;
    if (user.role === 'subadmin') {
      assessments = allAssessments.filter(assessment => assessment.isAccessibleBy(user));
    }

    res.json({ assessments });
  } catch (error) {
    console.error('[Assessments][GET /admin/assessments] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assessment by ID (admin)
router.get('/admin/assessments/:id', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('courseId', 'title courseCode');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json({ assessment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new assessment (admin)
router.post('/admin/assessments', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    // Debug: log incoming payload minimally (avoid huge logs for options)
    const debugPayload = {
      ...req.body,
      questions: Array.isArray(req.body?.questions)
        ? req.body.questions.map((q, i) => ({
            idx: i,
            question: q?.question?.slice(0, 60),
            questionType: q?.questionType,
            optionsCount: Array.isArray(q?.options) ? q.options.length : undefined,
            correctAnswer: q?.correctAnswer,
            marks: q?.marks
          }))
        : req.body?.questions
    };
    console.log('[Assessments][POST /admin/assessments] Incoming payload:', debugPayload);

    const { error, value } = createAssessmentSchema.validate(req.body);
    if (error) {
      console.error('[Assessments][POST] Validation error:', error.details?.[0]?.message, 'at', error.details?.[0]?.path);
      return res.status(400).json({ message: 'Validation error', error: error.details[0].message, path: error.details?.[0]?.path });
    }

    // Verify course exists and user has access
    const course = await Course.findById(value.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has permission for this course (based on audience)
    const user = req.user;
    if (user.role === 'subadmin') {
      const hasAccess = (
        (!course.audience?.universities?.length || course.audience.universities.some(u => user.assignedUniversities?.includes(u))) &&
        (!course.audience?.faculties?.length || course.audience.faculties.some(f => user.assignedFaculties?.includes(f))) &&
        (!course.audience?.levels?.length || course.audience.levels.some(l => user.assignedLevels?.includes(l)))
      );

      if (!hasAccess) {
        return res.status(403).json({ message: 'You do not have permission to create assessments for this course' });
      }
    }

    // Auto-populate audience from course if not explicitly provided
    // This ensures assessments inherit the same strict filtering as courses
    const assessmentAudience = value.audience || {
      universities: course.audience?.universities || [],
      faculties: course.audience?.faculties || [],
      departments: course.audience?.departments || [],
      levels: course.audience?.levels || []
    };

    const assessment = new Assessment({
      ...value,
      audience: assessmentAudience,
      createdBy: user._id || user.email || 'admin'
    });

    await assessment.save();

    const populatedAssessment = await Assessment.findById(assessment._id).populate('courseId', 'title courseCode');

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment: populatedAssessment
    });
  } catch (error) {
    console.error('[Assessments][POST] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update assessment (admin)
router.put('/admin/assessments/:id', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    console.log('[Assessments][PUT /admin/assessments/:id] Incoming update payload:', req.params.id, req.body);
    const { error, value } = updateAssessmentSchema.validate(req.body);
    if (error) {
      console.error('[Assessments][PUT] Validation error:', error.details?.[0]?.message, 'at', error.details?.[0]?.path);
      return res.status(400).json({ message: 'Validation error', error: error.details[0].message, path: error.details?.[0]?.path });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check permissions
    const user = req.user;
    if (user.role === 'subadmin') {
      const course = await Course.findById(assessment.courseId);
      const hasAccess = (
        (!course.audience?.universities?.length || course.audience.universities.some(u => user.assignedUniversities?.includes(u))) &&
        (!course.audience?.faculties?.length || course.audience.faculties.some(f => user.assignedFaculties?.includes(f))) &&
        (!course.audience?.levels?.length || course.audience.levels.some(l => user.assignedLevels?.includes(l)))
      );

      if (!hasAccess) {
        return res.status(403).json({ message: 'You do not have permission to update this assessment' });
      }
    }

    Object.assign(assessment, value);
    await assessment.save();

    const updatedAssessment = await Assessment.findById(assessment._id).populate('courseId', 'title courseCode');

    res.json({
      message: 'Assessment updated successfully',
      assessment: updatedAssessment
    });
  } catch (error) {
    console.error('[Assessments][PUT] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete assessment (admin)
router.delete('/admin/assessments/:id', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check permissions
    const user = req.user;
    if (user.role === 'subadmin') {
      const course = await Course.findById(assessment.courseId);
      const hasAccess = (
        (!course.audience?.universities?.length || course.audience.universities.some(u => user.assignedUniversities?.includes(u))) &&
        (!course.audience?.faculties?.length || course.audience.faculties.some(f => user.assignedFaculties?.includes(f))) &&
        (!course.audience?.levels?.length || course.audience.levels.some(l => user.assignedLevels?.includes(l)))
      );

      if (!hasAccess) {
        return res.status(403).json({ message: 'You do not have permission to delete this assessment' });
      }
    }

    await Assessment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student routes for taking assessments

// Get available assessments for student (STRICT filtering like courses/resources)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active assessments
    const allAssessments = await Assessment.find({ isActive: true })
      .populate('courseId', 'title courseCode');

    // Filter using strict matching (like courses/resources)
    const accessibleAssessments = allAssessments.filter(assessment => 
      assessment.isAccessibleBy(user)
    );

    res.json({ assessments: accessibleAssessments.map(sanitizeAssessmentForStudent) });
  } catch (error) {
    console.error('[Assessments][GET /] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assessment by ID (student)
// IMPORTANT: Register static routes before dynamic ones (e.g. '/results' before '/:id')

// Get current user's assessment results (student)
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId)
      .populate({ path: 'assessmentResults.assessmentId', select: 'title type courseId' })
      .populate({ path: 'assessmentResults.courseId', select: 'title courseCode' });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ results: user.assessmentResults || [] });
  } catch (error) {
    console.error('[Assessments][GET results] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('courseId', 'title courseCode');
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if user has access using STRICT matching
    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!assessment.isAccessibleBy(user)) {
      return res.status(403).json({ message: 'You do not have access to this assessment' });
    }

    const sanitized = sanitizeAssessmentForStudent(assessment);
    res.json({ assessment: sanitized });
  } catch (error) {
    console.error('[Assessments][GET /:id] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assessments by course (STRICT filtering)
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active assessments for the course
    const allAssessments = await Assessment.find({
      courseId: req.params.courseId,
      isActive: true
    }).populate('courseId', 'title courseCode');

    // Filter using strict matching
    const accessibleAssessments = allAssessments.filter(assessment => 
      assessment.isAccessibleBy(user)
    );

    res.json({ assessments: accessibleAssessments.map(sanitizeAssessmentForStudent) });
  } catch (error) {
    console.error('[Assessments][GET /course/:courseId] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assessments by type (STRICT filtering)
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;

    if (!['ca', 'exam'].includes(type)) {
      return res.status(400).json({ message: 'Invalid assessment type' });
    }

    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active assessments of the specified type
    const allAssessments = await Assessment.find({
      type,
      isActive: true
    }).populate('courseId', 'title courseCode');

    // Filter using strict matching
    const accessibleAssessments = allAssessments.filter(assessment => 
      assessment.isAccessibleBy(user)
    );

    res.json({ assessments: accessibleAssessments.map(sanitizeAssessmentForStudent) });
  } catch (error) {
    console.error('[Assessments][GET /type/:type] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit assessment attempt (student) - record first attempt only
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid payload: answers must be an array' });
    }

    const AssessmentModel = Assessment; // alias
    const assessment = await AssessmentModel.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Ensure correct length
    if (answers.length !== assessment.questions.length) {
      return res.status(400).json({ message: 'Invalid answers length' });
    }

    // Compute score using model method
    let result;
    try {
      result = assessment.calculateScore(answers);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid answers format', error: err.message });
    }

    // Load user and record first attempt only
    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyRecorded = user.assessmentResults?.some(r => r.assessmentId.toString() === assessment._id.toString());
    if (!alreadyRecorded) {
      user.assessmentResults = user.assessmentResults || [];
      user.assessmentResults.push({
        assessmentId: assessment._id,
        courseId: assessment.courseId,
        type: assessment.type,
        percentage: result.score,
        earnedMarks: result.earnedMarks,
        totalMarks: result.totalMarks,
        attemptedAt: new Date()
      });
      await user.save();
    }

    return res.json({
      message: alreadyRecorded ? 'Attempt already recorded (first attempt only)' : 'Submission recorded',
      score: result.score,
      earnedMarks: result.earnedMarks,
      totalMarks: result.totalMarks,
      passed: result.passed,
      questionResults: result.questionResults
    });
  } catch (error) {
    console.error('[Assessments][POST submit] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user's assessment results (student)
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const UserModel = (await import('../models/User.js')).default;
    const user = await UserModel.findById(req.user.userId)
      .populate({ path: 'assessmentResults.assessmentId', select: 'title type courseId' })
      .populate({ path: 'assessmentResults.courseId', select: 'title courseCode' });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ results: user.assessmentResults || [] });
  } catch (error) {
    console.error('[Assessments][GET results] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
