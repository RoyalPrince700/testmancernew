import mongoose from 'mongoose';

const quizHistorySchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  avatar: {
    type: String,
    trim: true
  },
  learningCategories: [{
    type: String,
    enum: ['waec', 'jamb', 'postutme', 'toefl', 'ielts', 'undergraduate'],
    lowercase: true
  }],
  role: {
    type: String,
    enum: ['user', 'admin', 'subadmin', 'waec_admin', 'jamb_admin'],
    default: 'user'
  },
  // Role assignments for restricted admins
  assignedUniversities: [{
    type: String,
    trim: true
  }],
  assignedFaculties: [{
    type: String,
    trim: true
  }],
  assignedLevels: [{
    type: String,
    trim: true
  }],
  assignedDepartments: [{
    type: String,
    trim: true
  }],
  isUndergraduate: {
    type: Boolean,
    default: false
  },
  university: {
    type: String,
    trim: true
  },
  faculty: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    trim: true
  },
  studyPreferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekends', 'flexible'],
      default: 'flexible'
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'flexible'],
      default: 'flexible'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  gems: {
    type: Number,
    default: 0,
    min: 0
  },
  completedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  earnedGems: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    questionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }]
  }],
  completionGems: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    completedUnits: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }],
    completedPages: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }]
  }],
  quizHistory: [quizHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ gems: -1 });
userSchema.index({ 'learningGoals': 1, 'gems': -1 });
// googleId and email indexes are already defined in the schema fields above

// Update lastLogin on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for user's rank (computed property)
userSchema.virtual('rank').get(function() {
  // This will be computed when needed
  return null;
});

// Method to get user's statistics
userSchema.methods.getStats = function() {
  const totalQuizzes = this.quizHistory.length;
  const correctAnswers = this.quizHistory.reduce((sum, quiz) => sum + quiz.correctAnswers, 0);
  const totalQuestions = this.quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
  const averageScore = totalQuizzes > 0
    ? Math.round(this.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes)
    : 0;

  return {
    totalGems: this.gems,
    completedModules: this.completedModules.length,
    totalQuizzes,
    correctAnswers,
    totalQuestions,
    averageScore,
    accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  };
};

// Method to award gems
userSchema.methods.awardGems = function(amount) {
  this.gems += amount;
  return this.save();
};

// Method to check if user has earned gem for a specific question in a quiz
userSchema.methods.hasEarnedGemForQuestion = function(quizId, questionId) {
  const quizEarnedGems = this.earnedGems.find(earned =>
    earned.quizId.toString() === quizId.toString()
  );

  if (!quizEarnedGems) {
    return false;
  }

  return quizEarnedGems.questionIds.some(id =>
    id.toString() === questionId.toString()
  );
};

// Method to record earned gems for questions (first-attempt tracking)
userSchema.methods.recordEarnedGems = function(quizId, questionIds) {
  let quizEarnedGems = this.earnedGems.find(earned =>
    earned.quizId.toString() === quizId.toString()
  );

  if (!quizEarnedGems) {
    quizEarnedGems = {
      quizId: quizId,
      questionIds: []
    };
    this.earnedGems.push(quizEarnedGems);
  }

  // Add new question IDs (avoiding duplicates)
  questionIds.forEach(questionId => {
    if (!quizEarnedGems.questionIds.some(id => id.toString() === questionId.toString())) {
      quizEarnedGems.questionIds.push(questionId);
    }
  });

  return this.save();
};

// Method to check if user has earned completion gem for a specific unit in a course
userSchema.methods.hasEarnedCompletionGemForUnit = function(courseId, unitId) {
  const courseCompletionGems = this.completionGems.find(completion =>
    completion.courseId.toString() === courseId.toString()
  );

  if (!courseCompletionGems) {
    return false;
  }

  return courseCompletionGems.completedUnits.some(id =>
    id.toString() === unitId.toString()
  );
};

// Method to check if user has earned completion gem for a specific page in a course
userSchema.methods.hasEarnedCompletionGemForPage = function(courseId, pageId) {
  const courseCompletionGems = this.completionGems.find(completion =>
    completion.courseId.toString() === courseId.toString()
  );

  if (!courseCompletionGems) {
    return false;
  }

  return courseCompletionGems.completedPages.some(id =>
    id.toString() === pageId.toString()
  );
};

// Method to record completion gem for a unit (first-attempt tracking)
userSchema.methods.recordCompletionGemForUnit = function(courseId, unitId) {
  // Check if already earned
  if (this.hasEarnedCompletionGemForUnit(courseId, unitId)) {
    return Promise.resolve(this); // Already earned, no change needed
  }

  let courseCompletionGems = this.completionGems.find(completion =>
    completion.courseId.toString() === courseId.toString()
  );

  if (!courseCompletionGems) {
    // Create new completion entry with the unit already completed
    courseCompletionGems = {
      courseId: courseId,
      completedUnits: [unitId],
      completedPages: []
    };
    this.completionGems.push(courseCompletionGems);
    this.gems += 3; // Award 3 gems for unit completion
  } else {
    // Add unit ID if not already present
    if (!courseCompletionGems.completedUnits.some(id => id.toString() === unitId.toString())) {
      courseCompletionGems.completedUnits.push(unitId);
      this.gems += 3; // Award 3 gems for unit completion

      // Ensure Mongoose knows the subdocument array has been modified
      this.markModified('completionGems');
    }
  }

  return this.save();
};

// Method to record completion gem for a page (first-attempt tracking)
// Note: Pages are tracked for progress but do NOT award gems
// Only module/unit completion awards gems (3 gems per module)
userSchema.methods.recordCompletionGemForPage = function(courseId, pageId) {
  // Check if already tracked
  if (this.hasEarnedCompletionGemForPage(courseId, pageId)) {
    return Promise.resolve(this); // Already tracked, no change needed
  }

  let courseCompletionGems = this.completionGems.find(completion =>
    completion.courseId.toString() === courseId.toString()
  );

  if (!courseCompletionGems) {
    courseCompletionGems = {
      courseId: courseId,
      completedUnits: [],
      completedPages: []
    };
    this.completionGems.push(courseCompletionGems);
  }

  // Add page ID if not already present (for progress tracking only, no gems awarded)
  if (!courseCompletionGems.completedPages.some(id => id.toString() === pageId.toString())) {
    courseCompletionGems.completedPages.push(pageId);
    // NO gems awarded for page completion - only for module completion
  }

  return this.save();
};

// Method to get detailed progress for a specific course
userSchema.methods.getCourseProgress = function(course) {
  const courseCompletionGems = this.completionGems.find(completion =>
    completion.courseId.toString() === course._id.toString()
  );

  const completedUnits = courseCompletionGems?.completedUnits || [];
  const completedPages = courseCompletionGems?.completedPages || [];

  // Calculate unit progress
  const totalUnits = course.modules?.length || 0;
  const completedUnitCount = course.modules?.filter(module =>
    completedUnits.some(unitId => unitId.toString() === module._id.toString())
  ).length || 0;

  // Calculate page progress
  const allPages = course.modules?.flatMap(module => module.pages || []) || [];
  const totalPages = allPages.length;
  const completedPageCount = allPages.filter(page =>
    completedPages.some(pageId => pageId.toString() === page._id.toString())
  ).length;

  return {
    courseId: course._id,
    totalUnits,
    completedUnits: completedUnitCount,
    totalPages,
    completedPages: completedPageCount,
    unitProgressPercentage: totalUnits > 0 ? Math.round((completedUnitCount / totalUnits) * 100) : 0,
    pageProgressPercentage: totalPages > 0 ? Math.round((completedPageCount / totalPages) * 100) : 0,
    overallProgressPercentage: totalPages > 0 ? Math.round((completedPageCount / totalPages) * 100) : 0
  };
};

const User = mongoose.model('User', userSchema);

export default User;
