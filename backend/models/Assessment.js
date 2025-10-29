import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    default: 'multiple_choice'
  },
  options: [{
    type: String,
    trim: true,
    // Only required for multiple choice questions
    required: function() {
      return this.questionType === 'multiple_choice';
    }
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be number (index) or string (for short answer)
    required: function() {
      return this.questionType !== 'short_answer'; // Short answer might not have a single correct answer
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  marks: {
    type: Number,
    default: 1,
    min: 1
  }
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['ca', 'exam'],
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  trigger: {
    type: String,
    enum: ['unit', 'page'],
    default: 'unit'
  },
  pageOrder: {
    type: Number,
    min: 1,
    required: false
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // total assessment time in minutes
    min: 15,
    default: function() {
      return this.type === 'exam' ? 120 : 60; // 2 hours for exams, 1 hour for CA
    }
  },
  passingScore: {
    type: Number,
    default: 40,
    min: 0,
    max: 100
  },
  totalMarks: {
    type: Number,
    default: 100,
    min: 1
  },
  instructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxAttempts: {
    type: Number,
    default: function() {
      return this.type === 'exam' ? 1 : 3; // Exams typically allow only 1 attempt, CA allows multiple
    },
    min: 1
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  audience: {
    universities: [{
      type: String,
      trim: true
    }],
    faculties: [{
      type: String,
      trim: true
    }],
    departments: [{
      type: String,
      trim: true
    }],
    levels: [{
      type: String,
      trim: true
    }]
  },
  totalAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
assessmentSchema.index({ courseId: 1 });
assessmentSchema.index({ moduleId: 1 });
assessmentSchema.index({ type: 1 });
assessmentSchema.index({ isActive: 1 });
assessmentSchema.index({ 'audience.universities': 1 });
assessmentSchema.index({ 'audience.faculties': 1 });
assessmentSchema.index({ 'audience.levels': 1 });
assessmentSchema.index({ totalAttempts: -1 });

// Virtual for total questions count
assessmentSchema.virtual('totalQuestions').get(function() {
  const questionsArray = this.questions;
  return Array.isArray(questionsArray) ? questionsArray.length : 0;
});

// Virtual for total possible marks
assessmentSchema.virtual('totalPossibleMarks').get(function() {
  return this.questions.reduce((total, question) => total + question.marks, 0);
});

// Method to calculate score from answers
assessmentSchema.methods.calculateScore = function(userAnswers) {
  if (!Array.isArray(userAnswers) || userAnswers.length !== this.questions.length) {
    throw new Error('Invalid answers format');
  }

  let earnedMarks = 0;
  let totalPossibleMarks = 0;

  const questionResults = this.questions.map((question, index) => {
    const userAnswer = userAnswers[index];
    totalPossibleMarks += question.marks;

    let isCorrect = false;
    let marksEarned = 0;

    if (question.questionType === 'multiple_choice') {
      isCorrect = userAnswer === question.correctAnswer;
      marksEarned = isCorrect ? question.marks : 0;
    } else if (question.questionType === 'true_false') {
      isCorrect = userAnswer === question.correctAnswer;
      marksEarned = isCorrect ? question.marks : 0;
    } else if (question.questionType === 'short_answer') {
      // For short answer, we'll assume manual grading for now
      // In a real implementation, this would be graded by instructors
      isCorrect = false; // Manual grading required
      marksEarned = 0; // To be set by instructor
    }

    if (marksEarned > 0) {
      earnedMarks += marksEarned;
    }

    return {
      questionId: question._id,
      questionType: question.questionType,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      marksEarned,
      totalMarks: question.marks,
      explanation: question.explanation
    };
  });

  const percentageScore = totalPossibleMarks > 0 ? Math.round((earnedMarks / totalPossibleMarks) * 100) : 0;
  const passed = percentageScore >= this.passingScore;

  return {
    score: percentageScore,
    earnedMarks,
    totalMarks: totalPossibleMarks,
    passed,
    questionResults
  };
};

// Method to check if user can attempt assessment
assessmentSchema.methods.canAttempt = function(userAttempts) {
  return userAttempts < this.maxAttempts;
};

// Method to update statistics after assessment completion
assessmentSchema.methods.updateStats = function(score) {
  this.totalAttempts += 1;
  // Simple moving average for score
  this.averageScore = Math.round(((this.averageScore * (this.totalAttempts - 1)) + score) / this.totalAttempts);
  return this.save();
};

// Static method to get assessments by type
assessmentSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to get assessments by course
assessmentSchema.statics.getByCourse = function(courseId) {
  return this.find({ courseId, isActive: true });
};

// Static method to get popular assessments
assessmentSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalAttempts: -1 })
    .limit(limit);
};

// Pre-save middleware
assessmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if assessment is accessible by user (STRICT matching like courses/resources)
assessmentSchema.methods.isAccessibleBy = function(user) {
  // Admin has access to everything
  if (user?.role === 'admin') {
    return true;
  }

  // If no audience restrictions, accessible to all
  const audience = this.audience || {};
  if (!audience.universities?.length && !audience.faculties?.length &&
      !audience.departments?.length && !audience.levels?.length) {
    return true;
  }

  // For subadmins, check their assigned scope
  if (user?.role === 'subadmin') {
    const hasUniversityMatch = !user.assignedUniversities?.length ||
      audience.universities.some(uni => user.assignedUniversities.includes(uni));
    const hasFacultyMatch = !user.assignedFaculties?.length ||
      audience.faculties.some(fac => user.assignedFaculties.includes(fac));
    const hasDepartmentMatch = !user.assignedDepartments?.length ||
      audience.departments.some(dept => user.assignedDepartments.includes(dept));
    const hasLevelMatch = !user.assignedLevels?.length ||
      audience.levels.some(lvl => user.assignedLevels.includes(lvl));

    return hasUniversityMatch && hasFacultyMatch && hasDepartmentMatch && hasLevelMatch;
  }

  // For regular users, check STRICT matching like courses
  // User must have ALL profile fields populated and they must ALL match
  const userUniversity = user?.university;
  const userFaculty = user?.faculty;
  const userDepartment = user?.department;
  const userLevel = user?.level;

  // If user doesn't have complete profile, they can't access restricted assessments
  if (!userUniversity || !userFaculty || !userDepartment || !userLevel) {
    return false;
  }

  // STRICT matching: ALL populated audience fields must match user's profile
  let hasMatch = true;

  if (audience.universities?.length > 0) {
    hasMatch = hasMatch && audience.universities.includes(userUniversity);
  }
  if (audience.faculties?.length > 0) {
    hasMatch = hasMatch && audience.faculties.includes(userFaculty);
  }
  if (audience.departments?.length > 0) {
    hasMatch = hasMatch && audience.departments.includes(userDepartment);
  }
  if (audience.levels?.length > 0) {
    hasMatch = hasMatch && audience.levels.includes(userLevel);
  }

  return hasMatch;
};

// Validation middleware
assessmentSchema.pre('save', function(next) {
  if (this.questions.length === 0) {
    next(new Error('Assessment must have at least one question'));
  } else {
    next();
  }
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
