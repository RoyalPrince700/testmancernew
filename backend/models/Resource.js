import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'document', 'link', 'audio', 'video'],
    lowercase: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number, // in bytes, for uploaded files
    min: 0
  },
  duration: {
    type: Number, // in seconds, for audio/video files
    min: 0
  },
  format: {
    type: String, // file extension or format
    trim: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceFolder',
    required: true
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
  isActive: {
    type: Boolean,
    default: true
  },
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
resourceSchema.index({ folderId: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ isActive: 1 });
resourceSchema.index({ createdBy: 1 });

// Audience filtering indexes
resourceSchema.index({ 'audience.universities': 1 });
resourceSchema.index({ 'audience.faculties': 1 });
resourceSchema.index({ 'audience.departments': 1 });
resourceSchema.index({ 'audience.levels': 1 });

// Virtual for formatted file size
resourceSchema.virtual('formattedFileSize').get(function() {
  if (!this.fileSize) return null;

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.fileSize === 0) return '0 Bytes';

  const i = parseInt(Math.floor(Math.log(this.fileSize) / Math.log(1024)));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for formatted duration
resourceSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;

  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = Math.floor(this.duration % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
});

// Method to check if resource is accessible by user
resourceSchema.methods.isAccessibleBy = function(user) {
  // If no audience restrictions, accessible to all
  const audience = this.audience || {};
  if (!audience.universities?.length && !audience.faculties?.length &&
      !audience.departments?.length && !audience.levels?.length) {
    return true;
  }

  // Check if user's profile matches any audience criteria
  const userUniversity = user?.university;
  const userFaculty = user?.faculty;
  const userDepartment = user?.department;
  const userLevel = user?.level;

  const hasUniversityMatch = !audience.universities?.length ||
    audience.universities.includes(userUniversity);
  const hasFacultyMatch = !audience.faculties?.length ||
    audience.faculties.includes(userFaculty);
  const hasDepartmentMatch = !audience.departments?.length ||
    audience.departments.includes(userDepartment);
  const hasLevelMatch = !audience.levels?.length ||
    audience.levels.includes(userLevel);

  return hasUniversityMatch && hasFacultyMatch && hasDepartmentMatch && hasLevelMatch;
};

// Pre-save middleware to update timestamps
resourceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
