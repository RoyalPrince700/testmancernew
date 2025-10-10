import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  html: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  attachments: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'image', 'link']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const moduleSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'document', 'link', 'image']
    }
  }],
  pages: [pageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const courseSchema = new mongoose.Schema({
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
  learningGoals: [{
    type: String,
    enum: ['waec', 'postutme', 'jamb', 'toefl', 'ielts', 'undergraduate'],
    required: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['secondary', 'tertiary', 'language', 'professional']
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
    levels: [{
      type: String,
      trim: true
    }]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  modules: [moduleSchema],
  thumbnail: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
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
courseSchema.index({ learningGoals: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ enrollmentCount: -1 });

// Audience filtering indexes
courseSchema.index({ 'audience.universities': 1 });
courseSchema.index({ 'audience.faculties': 1 });
courseSchema.index({ 'audience.levels': 1 });

// Virtual for total modules count
courseSchema.virtual('totalModules').get(function() {
  return this.modules.length;
});

// Virtual for total estimated time
courseSchema.virtual('totalEstimatedTime').get(function() {
  return this.modules.reduce((total, module) => total + module.estimatedTime, 0);
});

// Method to get course progress for a user
courseSchema.methods.getProgress = function(userCompletedModules) {
  const totalModules = this.modules.length;
  const completedCount = this.modules.filter(module =>
    userCompletedModules.includes(module._id.toString())
  ).length;

  return {
    completedModules: completedCount,
    totalModules,
    progressPercentage: totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0,
    isCompleted: completedCount === totalModules
  };
};

// Method to get module by order
courseSchema.methods.getModuleByOrder = function(order) {
  return this.modules.find(module => module.order === order);
};

// Method to get next module for user
courseSchema.methods.getNextModule = function(userCompletedModules) {
  for (const module of this.modules.sort((a, b) => a.order - b.order)) {
    if (!userCompletedModules.includes(module._id.toString())) {
      return module;
    }
  }
  return null; // All modules completed
};

// Pre-save middleware to update timestamps
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
