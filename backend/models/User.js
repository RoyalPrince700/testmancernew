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

const User = mongoose.model('User', userSchema);

export default User;
