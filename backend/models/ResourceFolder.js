import mongoose from 'mongoose';

const resourceFolderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
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
resourceFolderSchema.index({ createdBy: 1 });
resourceFolderSchema.index({ isActive: 1 });

// Audience filtering indexes
resourceFolderSchema.index({ 'audience.universities': 1 });
resourceFolderSchema.index({ 'audience.faculties': 1 });
resourceFolderSchema.index({ 'audience.departments': 1 });
resourceFolderSchema.index({ 'audience.levels': 1 });

// Virtual for resource count
resourceFolderSchema.virtual('resourceCount', {
  ref: 'Resource',
  localField: '_id',
  foreignField: 'folderId',
  count: true
});

// Method to check if folder is accessible by user
resourceFolderSchema.methods.isAccessibleBy = function(user) {
  // Admin has access to everything
  if (user?.role === 'admin') {
    return true;
  }

  // Subadmins can access folders they created
  if (user?.role === 'subadmin' && this.createdBy.toString() === user._id.toString()) {
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
    const hasUniversityMatch = !audience.universities?.length ||
      audience.universities.some(uni => user.assignedUniversities?.includes(uni));
    const hasFacultyMatch = !audience.faculties?.length ||
      audience.faculties.some(fac => user.assignedFaculties?.includes(fac));
    const hasDepartmentMatch = !audience.departments?.length ||
      audience.departments.some(dept => user.assignedDepartments?.includes(dept));
    const hasLevelMatch = !audience.levels?.length ||
      audience.levels.some(lvl => user.assignedLevels?.includes(lvl));

    return hasUniversityMatch && hasFacultyMatch && hasDepartmentMatch && hasLevelMatch;
  }

  // For regular users, check their profile matches any audience criteria
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

// Method to get scoped folders for a subadmin
resourceFolderSchema.statics.getScopedFolders = function(user) {
  if (!user || user.role !== 'subadmin') {
    return this.find({ isActive: true });
  }

  const { assignedUniversities, assignedFaculties, assignedDepartments, assignedLevels } = user;

  // Build $or conditions array
  const orConditions = [];

  // 1. Folders created by this subadmin
  orConditions.push({ createdBy: user._id });

  // 2. Folders with no audience restrictions (global folders)
  orConditions.push({
    $and: [
      { $or: [
        { 'audience.universities': { $exists: false } },
        { 'audience.universities': { $size: 0 } }
      ]},
      { $or: [
        { 'audience.faculties': { $exists: false } },
        { 'audience.faculties': { $size: 0 } }
      ]},
      { $or: [
        { 'audience.departments': { $exists: false } },
        { 'audience.departments': { $size: 0 } }
      ]},
      { $or: [
        { 'audience.levels': { $exists: false } },
        { 'audience.levels': { $size: 0 } }
      ]}
    ]
  });

  // 3. Folders that match subadmin's assigned scope
  const scopeConditions = [];
  
  if (assignedUniversities?.length > 0) {
    scopeConditions.push({ 'audience.universities': { $in: assignedUniversities } });
  }
  if (assignedFaculties?.length > 0) {
    scopeConditions.push({ 'audience.faculties': { $in: assignedFaculties } });
  }
  if (assignedDepartments?.length > 0) {
    scopeConditions.push({ 'audience.departments': { $in: assignedDepartments } });
  }
  if (assignedLevels?.length > 0) {
    scopeConditions.push({ 'audience.levels': { $in: assignedLevels } });
  }

  // Add scope conditions to OR if any exist
  if (scopeConditions.length > 0) {
    orConditions.push({ $or: scopeConditions });
  }

  // Find folders that match any of the conditions
  return this.find({
    isActive: true,
    $or: orConditions
  });
};

// Pre-save middleware to update timestamps
resourceFolderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ResourceFolder = mongoose.model('ResourceFolder', resourceFolderSchema);

export default ResourceFolder;
