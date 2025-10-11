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
    required: false
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
  courseCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  units: {
    type: Number,
    required: true,
    min: 1,
    max: 5
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
  structure: {
    unitType: {
      type: String,
      enum: ['chapter', 'module', 'section', 'topic'],
      default: 'module'
    },
    unitLabel: {
      type: String,
      default: 'Module',
      trim: true
    },
    unitCount: {
      type: Number,
      min: 1,
      max: 100,
      default: 1
    }
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
courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ units: 1 });
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

// Virtual getter for units (alias for modules) - note: 'units' field already exists in schema
courseSchema.virtual('getUnits').get(function() {
  return this.modules;
});

// Virtual setter for units (alias for modules)
courseSchema.virtual('setUnits').set(function(value) {
  this.modules = value;
});

// Method to get course progress for a user (legacy - uses completedModules)
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

// Method to get detailed course progress using completion gems tracking
courseSchema.methods.getDetailedProgress = function(userCompletionGems) {
  const courseCompletionGems = userCompletionGems.find(completion =>
    completion.courseId.toString() === this._id.toString()
  );

  const completedUnits = courseCompletionGems?.completedUnits || [];
  const completedPages = courseCompletionGems?.completedPages || [];

  // Calculate unit progress
  const totalUnits = this.modules?.length || 0;
  const completedUnitCount = this.modules?.filter(module =>
    completedUnits.some(unitId => unitId.toString() === module._id.toString())
  ).length || 0;

  // Calculate page progress
  const allPages = this.modules?.flatMap(module => module.pages || []) || [];
  const totalPages = allPages.length;
  const completedPageCount = allPages.filter(page =>
    completedPages.some(pageId => pageId.toString() === page._id.toString())
  ).length;

  // Get unit details with completion status
  const unitDetails = this.modules?.map(module => {
    const isCompleted = completedUnits.some(unitId =>
      unitId.toString() === module._id.toString()
    );

    // Count completed pages in this unit
    const unitPages = module.pages || [];
    const completedUnitPages = unitPages.filter(page =>
      completedPages.some(pageId => pageId.toString() === page._id.toString())
    ).length;

    return {
      unitId: module._id,
      title: module.title,
      isCompleted,
      totalPages: unitPages.length,
      completedPages: completedUnitPages,
      progressPercentage: unitPages.length > 0 ? Math.round((completedUnitPages / unitPages.length) * 100) : 0
    };
  }) || [];

  return {
    courseId: this._id,
    courseTitle: this.title,
    totalUnits,
    completedUnits: completedUnitCount,
    totalPages,
    completedPages: completedPageCount,
    unitProgressPercentage: totalUnits > 0 ? Math.round((completedUnitCount / totalUnits) * 100) : 0,
    pageProgressPercentage: totalPages > 0 ? Math.round((completedPageCount / totalPages) * 100) : 0,
    overallProgressPercentage: totalPages > 0 ? Math.round((completedPageCount / totalPages) * 100) : 0,
    isCompleted: completedPageCount === totalPages && totalPages > 0,
    unitDetails,
    unitLabel: this.structure?.unitLabel || 'Module'
  };
};

// Method to get page progress for a specific unit
courseSchema.methods.getUnitPageProgress = function(unitId, userCompletionGems) {
  const module = this.modules.find(m => m._id.toString() === unitId.toString());
  if (!module) return null;

  const courseCompletionGems = userCompletionGems.find(completion =>
    completion.courseId.toString() === this._id.toString()
  );

  const completedPages = courseCompletionGems?.completedPages || [];

  const pageDetails = module.pages?.map(page => ({
    pageId: page._id,
    title: page.title,
    order: page.order,
    isCompleted: completedPages.some(pageId => pageId.toString() === page._id.toString())
  })) || [];

  const completedPageCount = pageDetails.filter(page => page.isCompleted).length;

  return {
    unitId: module._id,
    unitTitle: module.title,
    totalPages: pageDetails.length,
    completedPages: completedPageCount,
    progressPercentage: pageDetails.length > 0 ? Math.round((completedPageCount / pageDetails.length) * 100) : 0,
    pageDetails
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
