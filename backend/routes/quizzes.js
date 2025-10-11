import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createQuizSchema = Joi.object({
  courseId: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  questions: Joi.array().items(Joi.object({
    question: Joi.string().trim().min(10).max(500).required(),
    options: Joi.array().items(Joi.string().trim().min(1).max(200)).length(4).required(),
    correctAnswer: Joi.number().integer().min(0).max(3).required(),
    explanation: Joi.string().trim().min(10).max(500).optional()
  })).min(1).max(50).required(),
  trigger: Joi.string().valid('unit', 'page').required(),
  moduleId: Joi.when('trigger', {
    is: 'unit',
    then: Joi.string().hex().length(24).required(),
    otherwise: Joi.forbidden()
  }),
  pageOrder: Joi.when('trigger', {
    is: 'page',
    then: Joi.number().integer().min(1).required(),
    otherwise: Joi.forbidden()
  }),
  timeLimit: Joi.number().integer().min(1).max(3600).optional(), // 1 second to 1 hour
  passingScore: Joi.number().integer().min(0).max(100).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  category: Joi.string().trim().min(1).max(50).optional()
});

const updateQuizSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().min(10).max(1000).optional(),
  questions: Joi.array().items(Joi.object({
    question: Joi.string().trim().min(10).max(500).required(),
    options: Joi.array().items(Joi.string().trim().min(1).max(200)).length(4).required(),
    correctAnswer: Joi.number().integer().min(0).max(3).required(),
    explanation: Joi.string().trim().min(10).max(500).optional()
  })).min(1).max(50).optional(),
  trigger: Joi.string().valid('unit', 'page').optional(),
  moduleId: Joi.when('trigger', {
    is: 'unit',
    then: Joi.string().hex().length(24).required(),
    otherwise: Joi.forbidden()
  }),
  pageOrder: Joi.when('trigger', {
    is: 'page',
    then: Joi.number().integer().min(1).required(),
    otherwise: Joi.forbidden()
  }),
  timeLimit: Joi.number().integer().min(1).max(3600).optional(),
  passingScore: Joi.number().integer().min(0).max(100).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  category: Joi.string().trim().min(1).max(50).optional()
});

const submitQuizSchema = Joi.object({
  answers: Joi.array().items(Joi.number().integer().min(0).max(3)).required()
});

// Get all quizzes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('courseId', 'title');
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quizzes by course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('courseId', 'title');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quizzes by unit (module)
router.get('/unit/:moduleId', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      moduleId: req.params.moduleId,
      trigger: 'unit'
    }).populate('courseId', 'title');
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz by page (course/module/pageOrder)
router.get('/page/:courseId/:moduleId/:pageOrder', authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId, pageOrder } = req.params;
    const quiz = await Quiz.findOne({
      courseId,
      moduleId,
      pageOrder: parseInt(pageOrder),
      trigger: 'page'
    }).populate('courseId', 'title');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this page' });
    }

    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all quizzes for a course with trigger information
router.get('/course/:courseId/detailed', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId })
      .populate('courseId', 'title')
      .sort({ trigger: 1, moduleId: 1, pageOrder: 1 });

    // Group quizzes by trigger type
    const unitQuizzes = quizzes.filter(q => q.trigger === 'unit');
    const pageQuizzes = quizzes.filter(q => q.trigger === 'page');

    res.json({
      courseId: req.params.courseId,
      unitQuizzes,
      pageQuizzes,
      totalQuizzes: quizzes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz answers
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const submissionData = req.body;
    const quizId = req.params.id;
    const userId = req.user.userId;

    // Validate input using Joi schema
    const { error } = submitQuizSchema.validate(submissionData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { answers } = submissionData;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Validate answers array length matches questions count
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Number of answers must match number of questions' });
    }

    // Calculate score
    let correctAnswers = 0;
    let gemsEarned = 0;
    const questionResults = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      return {
        questionId: question._id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Update user with first-attempt gem logic
    const user = await User.findById(userId);

    // Track which questions earned gems this attempt (first-attempt only)
    const newlyEarnedQuestionIds = [];

    questionResults.forEach(result => {
      if (result.isCorrect && !user.hasEarnedGemForQuestion(quizId, result.questionId)) {
        gemsEarned++;
        newlyEarnedQuestionIds.push(result.questionId);
      }
    });

    user.gems += gemsEarned;

    // Record newly earned gems for future attempts
    if (newlyEarnedQuestionIds.length > 0) {
      await user.recordEarnedGems(quizId, newlyEarnedQuestionIds);
    }

    // Check if quiz completion should trigger unit/page completion gems
    // This happens when user passes the quiz (meets passing score)
    const passed = score >= quiz.passingScore;

    if (passed) {
      try {
        // If this is a unit-level quiz, award unit completion gem
        if (quiz.trigger === 'unit' && quiz.moduleId) {
          const unitAwarded = await user.recordCompletionGemForUnit(quiz.courseId, quiz.moduleId);
          if (unitAwarded) {
            gemsEarned += 3; // Add the unit completion gems to the total
          }
        }
        // If this is a page-level quiz, award page completion gem
        else if (quiz.trigger === 'page' && quiz.pageOrder) {
          // Find the specific page ID that corresponds to this pageOrder in the module
          const course = await Course.findById(quiz.courseId);
          if (course) {
            const module = course.modules.id(quiz.moduleId);
            if (module && module.pages) {
              const page = module.pages.find(p => p.order === quiz.pageOrder);
              if (page) {
                const pageAwarded = await user.recordCompletionGemForPage(quiz.courseId, page._id);
                if (pageAwarded) {
                  gemsEarned += 3; // Add the page completion gems to the total
                }
              }
            }
          }
        }
      } catch (completionError) {
        console.warn('Error awarding completion gems:', completionError);
        // Don't fail the quiz submission if completion gem awarding fails
      }
    }

    // Add to quiz history
    user.quizHistory.push({
      quizId,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      completedAt: new Date()
    });

    await user.save();

    // Update quiz statistics
    await quiz.updateStats(score);

    res.json({
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      gemsEarned,
      totalGems: user.gems,
      questionResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's quiz history
router.get('/history/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'quizHistory.quizId',
      select: 'title courseId',
      populate: {
        path: 'courseId',
        select: 'title'
      }
    });

    res.json({ quizHistory: user.quizHistory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get all users who took this quiz
    const users = await User.find({
      'quizHistory.quizId': req.params.id
    });

    const quizAttempts = users.map(user => {
      const attempt = user.quizHistory.find(
        history => history.quizId.toString() === req.params.id
      );
      return {
        userId: user._id,
        userName: user.name,
        score: attempt.score,
        completedAt: attempt.completedAt
      };
    });

    const averageScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length)
      : 0;

    res.json({
      quizTitle: quiz.title,
      totalAttempts: quizAttempts.length,
      averageScore,
      attempts: quizAttempts.sort((a, b) => b.score - a.score)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes for quiz management (scoped by role)
// Get quizzes for admin/subadmin (scoped to their course permissions)
router.get('/admin/quizzes', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;

    // First get courses that this admin can manage
    let courseFilter = {};

    if (user.role === 'subadmin') {
      if (user.assignedUniversities?.length || user.assignedFaculties?.length) {
        courseFilter.$or = [];

        if (user.assignedUniversities?.length) {
          courseFilter.$or.push({ 'audience.universities': { $in: user.assignedUniversities } });
        }
        if (user.assignedFaculties?.length) {
          courseFilter.$or.push({ 'audience.faculties': { $in: user.assignedFaculties } });
        }
      } else {
        return res.json({ quizzes: [] });
      }
    } else if (user.role === 'waec_admin') {
      // TODO: Re-implement category filtering based on new course structure
      courseFilter = {};
    } else if (user.role === 'jamb_admin') {
      // TODO: Re-implement category filtering based on new course structure
      courseFilter = {};
    }

    // Get courses this admin can manage
    const allowedCourses = await Course.find(courseFilter).select('_id');
    const courseIds = allowedCourses.map(course => course._id);

    // Get quizzes for these courses
    const quizzes = await Quiz.find({
      courseId: { $in: courseIds }
    }).populate('courseId', 'title courseCode');

    res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching admin quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create quiz (admin/subadmin scoped to their courses)
router.post('/admin/quizzes', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;
    const quizData = req.body;

    // Validate input using Joi schema
    const { error } = createQuizSchema.validate(quizData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Validate that the course is within admin's scope
    const course = await Course.findById(quizData.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isValidScope = validateCourseScope(user, course);
    if (!isValidScope) {
      return res.status(403).json({
        message: 'Cannot create quiz for course outside your assigned scope'
      });
    }

    const quiz = new Quiz({
      courseId: quizData.courseId,
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      trigger: quizData.trigger,
      moduleId: quizData.moduleId,
      pageOrder: quizData.pageOrder,
      timeLimit: quizData.timeLimit,
      passingScore: quizData.passingScore,
      difficulty: quizData.difficulty,
      category: quizData.category
    });

    await quiz.save();
    await quiz.populate('courseId', 'title');

    res.status(201).json({
      quiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update quiz (admin/subadmin scoped)
router.put('/admin/quizzes/:id', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;
    const quizId = req.params.id;
    const updates = req.body;

    // Validate input using Joi schema
    const { error } = updateQuizSchema.validate(updates);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // First check if quiz exists and course is in scope
    const quiz = await Quiz.findById(quizId).populate('courseId');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const isValidScope = validateCourseScope(user, quiz.courseId);
    if (!isValidScope) {
      return res.status(403).json({
        message: 'Cannot modify quiz for course outside your assigned scope'
      });
    }

    // If courseId is being changed, validate new course is also in scope
    if (updates.courseId && updates.courseId !== quiz.courseId._id.toString()) {
      const newCourse = await Course.findById(updates.courseId);
      if (!newCourse) {
        return res.status(404).json({ message: 'New course not found' });
      }

      const isNewCourseValid = validateCourseScope(user, newCourse);
      if (!isNewCourseValid) {
        return res.status(403).json({
          message: 'Cannot move quiz to course outside your assigned scope'
        });
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updates, {
      new: true,
      runValidators: true
    }).populate('courseId', 'title');

    res.json({
      quiz: updatedQuiz,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete quiz (admin/subadmin scoped)
router.delete('/admin/quizzes/:id', authenticateToken, requirePermission('manage_courses'), async (req, res) => {
  try {
    const user = req.user;
    const quizId = req.params.id;

    // Check if quiz exists and course is in scope
    const quiz = await Quiz.findById(quizId).populate('courseId');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const isValidScope = validateCourseScope(user, quiz.courseId);
    if (!isValidScope) {
      return res.status(403).json({
        message: 'Cannot delete quiz for course outside your assigned scope'
      });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.json({
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to validate course scope (same as in courses.js)
function validateCourseScope(user, course) {
  const { role, assignedUniversities, assignedFaculties, assignedLevels } = user;
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

    // If course has no audience restrictions (empty arrays), subadmins can create it
    // This allows subadmins to create general courses accessible to all students
    if (courseUniversities.length === 0 && courseFaculties.length === 0 && courseLevels.length === 0) {
      return true;
    }

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
