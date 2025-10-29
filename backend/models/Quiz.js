import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number, // Index of correct option (0-based)
    required: true,
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  timeLimit: {
    type: Number, // in seconds, optional
    min: 10
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
});

const quizSchema = new mongoose.Schema({
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
  learningGoals: [{
    type: String,
    enum: ['waec', 'postutme', 'jamb', 'toefl', 'ielts', 'undergraduate'],
    lowercase: true
  }],
  questions: [questionSchema],
  timeLimit: {
    type: Number, // total quiz time in minutes
    min: 5
  },
  passingScore: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: ['secondary', 'tertiary', 'language', 'professional']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
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
  createdBy: {
    type: String,
    default: 'admin'
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
quizSchema.index({ courseId: 1 });
quizSchema.index({ moduleId: 1 });
quizSchema.index({ learningGoals: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ totalAttempts: -1 });

// Virtual for total questions count (safe when questions not selected)
quizSchema.virtual('totalQuestions').get(function() {
  const questionsArray = this.questions;
  return Array.isArray(questionsArray) ? questionsArray.length : 0;
});

// Virtual for total possible points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Method to calculate score from answers
quizSchema.methods.calculateScore = function(userAnswers) {
  if (!Array.isArray(userAnswers) || userAnswers.length !== this.questions.length) {
    throw new Error('Invalid answers format');
  }

  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  const questionResults = this.questions.map((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;

    if (isCorrect) {
      correctAnswers++;
      earnedPoints += question.points;
    }
    totalPoints += question.points;

    return {
      questionId: question._id,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      explanation: question.explanation
    };
  });

  const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = percentageScore >= this.passingScore;

  return {
    score: percentageScore,
    correctAnswers,
    totalQuestions: Array.isArray(this.questions) ? this.questions.length : 0,
    earnedPoints,
    totalPoints,
    passed,
    questionResults
  };
};

// Method to check if user can attempt quiz
quizSchema.methods.canAttempt = function(userAttempts) {
  return userAttempts < this.maxAttempts;
};

// Method to update statistics after quiz completion
quizSchema.methods.updateStats = function(score) {
  this.totalAttempts += 1;
  // Simple moving average for score
  this.averageScore = Math.round(((this.averageScore * (this.totalAttempts - 1)) + score) / this.totalAttempts);
  return this.save();
};

// Static method to get quizzes by learning goal
quizSchema.statics.getByLearningGoal = function(learningGoal) {
  return this.find({ learningGoals: learningGoal, isActive: true });
};

// Static method to get popular quizzes
quizSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalAttempts: -1 })
    .limit(limit);
};

// Pre-save middleware
quizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Validation middleware
quizSchema.pre('save', function(next) {
  if (this.questions.length === 0) {
    next(new Error('Quiz must have at least one question'));
  } else {
    next();
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
