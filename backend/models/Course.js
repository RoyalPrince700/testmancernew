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
  isPublished: {
    type: Boolean,
    default: false
  },
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
  theme: {
    type: String,
    default: 'ocean-blue',
    enum: ['ocean-blue', 'sunset-orange', 'forest-green', 'royal-purple', 'fire-red', 'cosmic-purple', 'mint-fresh', 'golden-sunset', 'arctic-blue', 'rose-pink']
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
    departments: [{
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
courseSchema.index({ 'audience.departments': 1 });
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
// NOTE: Pages are NOT tracked - only module completion is tracked
// options.visibleModules: optional array of modules to use instead of this.modules (e.g., published only)
courseSchema.methods.getDetailedProgress = function(userCompletionGems, options = {}) {
  const { visibleModules } = options;

  const courseCompletionGems = userCompletionGems.find(completion =>
    completion.courseId.toString() === this._id.toString()
  );

  const completedUnits = courseCompletionGems?.completedUnits || [];

  const modulesForProgress = Array.isArray(visibleModules) ? visibleModules : (this.modules || []);

  // Get unit details with completion status (based ONLY on module completion, not pages)
  const unitDetails = modulesForProgress.map(module => {
    const unitPages = module.pages || [];
    
    // Unit is completed ONLY if explicitly in completedUnits array
    // This happens when user clicks "End Module" and receives 3 gems
    const isCompleted = completedUnits.some(unitId =>
      unitId.toString() === module._id.toString()
    );

    return {
      unitId: module._id,
      title: module.title,
      isCompleted,
      totalPages: unitPages.length,
      // Pages are not tracked - show total only, not completion
      progressPercentage: isCompleted ? 100 : 0
    };
  }) || [];

  // Calculate unit progress based on module completion only
  const totalUnits = modulesForProgress.length;
  const completedUnitCount = unitDetails.filter(unit => unit.isCompleted).length;

  return {
    courseId: this._id,
    courseTitle: this.title,
    totalUnits,
    completedUnits: completedUnitCount,
    unitProgressPercentage: totalUnits > 0 ? Math.round((completedUnitCount / totalUnits) * 100) : 0,
    overallProgressPercentage: totalUnits > 0 ? Math.round((completedUnitCount / totalUnits) * 100) : 0,
    isCompleted: completedUnitCount === totalUnits && totalUnits > 0,
    unitDetails,
    unitLabel: this.structure?.unitLabel || 'Module'
  };
};

// Method to get page info for a specific unit (NO tracking - just shows total pages)
courseSchema.methods.getUnitPageProgress = function(unitId, userCompletionGems) {
  const module = this.modules.find(m => m._id.toString() === unitId.toString());
  if (!module) return null;

  const courseCompletionGems = userCompletionGems.find(completion =>
    completion.courseId.toString() === this._id.toString()
  );

  const completedUnits = courseCompletionGems?.completedUnits || [];
  
  // Check if the unit itself is completed (not individual pages)
  const isUnitCompleted = completedUnits.some(unitIdObj =>
    unitIdObj.toString() === module._id.toString()
  );

  const pageDetails = module.pages?.map(page => ({
    pageId: page._id,
    title: page.title,
    order: page.order,
    // Pages are not tracked individually - only show if whole unit is complete
    isCompleted: false // Pages are not tracked
  })) || [];

  return {
    unitId: module._id,
    unitTitle: module.title,
    totalPages: pageDetails.length,
    isUnitCompleted, // Only track unit completion, not individual pages
    progressPercentage: isUnitCompleted ? 100 : 0,
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

// Pre-save middleware to update timestamps and set unitLabel based on unitType
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Always ensure unitLabel matches unitType
  if (this.structure && this.structure.unitType) {
    const expectedLabel = this.structure.unitType.charAt(0).toUpperCase() + this.structure.unitType.slice(1);
    this.structure.unitLabel = expectedLabel;
  }

  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
