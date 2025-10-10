import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

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

// Submit quiz answers
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;
    const userId = req.user.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
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
    const gemsEarned = correctAnswers; // 1 gem per correct answer

    // Update user
    const user = await User.findById(userId);
    user.gems += gemsEarned;

    // Add to quiz history
    user.quizHistory.push({
      quizId,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      completedAt: new Date()
    });

    await user.save();

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
    const { courseId, title, questions, trigger, moduleId, pageOrder, timeLimit } = req.body;

    // Validate that the course is within admin's scope
    const course = await Course.findById(courseId);
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
      courseId,
      title,
      questions,
      trigger: trigger || 'endOfCourse',
      moduleId,
      pageOrder,
      timeLimit
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
  const { role, assignedUniversities, assignedFaculties } = user;
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
    if (!assignedUniversities?.length && !assignedFaculties?.length) {
      return false;
    }

    // Check if course audience matches assignments
    const courseUniversities = audience?.universities || [];
    const courseFaculties = audience?.faculties || [];

    const universityMatch = assignedUniversities?.some(univ =>
      courseUniversities.includes(univ)
    );

    const facultyMatch = assignedFaculties?.some(fac =>
      courseFaculties.includes(fac)
    );

    return universityMatch || facultyMatch;
  }

  return false;
}

export default router;
