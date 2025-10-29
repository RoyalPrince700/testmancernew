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

  // If no audience restrictions, accessible to all
  const audience = this.audience || {};
  if (!audience.universities?.length && !audience.faculties?.length &&
      !audience.departments?.length && !audience.levels?.length) {
    return true;
  }

  // For subadmins, check their assigned scope (matching courses logic)
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

  // If user doesn't have complete profile, they can't access restricted resources
  if (!userUniversity || !userFaculty || !userDepartment || !userLevel) {
    return false;
  }

  // STRICT matching: ALL audience fields must match user's profile
  const hasUniversityMatch = audience.universities?.includes(userUniversity);
  const hasFacultyMatch = audience.faculties?.includes(userFaculty);
  const hasDepartmentMatch = audience.departments?.includes(userDepartment);
  const hasLevelMatch = audience.levels?.includes(userLevel);

  return hasUniversityMatch && hasFacultyMatch && hasDepartmentMatch && hasLevelMatch;
};

// Method to get scoped folders for a subadmin
resourceFolderSchema.statics.getScopedFolders = function(user) {
  if (!user || user.role !== 'subadmin') {
    return this.find({ isActive: true });
  }

  // Build filter based on subadmin's assignments, matching courses filtering logic
  const orConditions = [];

  // Include public/global folders (empty audience)
  orConditions.push({
    $and: [
      { $or: [{ 'audience.universities': { $size: 0 } }, { 'audience.universities': { $exists: false } }] },
      { $or: [{ 'audience.faculties': { $size: 0 } }, { 'audience.faculties': { $exists: false } }] },
      { $or: [{ 'audience.departments': { $size: 0 } }, { 'audience.departments': { $exists: false } }] },
      { $or: [{ 'audience.levels': { $size: 0 } }, { 'audience.levels': { $exists: false } }] }
    ]
  });

  // Include folders matching their assignments
  const matchConditions = [];
  if (user.assignedUniversities?.length) {
    matchConditions.push({ 'audience.universities': { $in: user.assignedUniversities } });
  }
  if (user.assignedFaculties?.length) {
    matchConditions.push({ 'audience.faculties': { $in: user.assignedFaculties } });
  }
  if (user.assignedDepartments?.length) {
    matchConditions.push({ 'audience.departments': { $in: user.assignedDepartments } });
  }
  if (user.assignedLevels?.length) {
    matchConditions.push({ 'audience.levels': { $in: user.assignedLevels } });
  }

  if (matchConditions.length > 0) {
    orConditions.push({ $and: matchConditions });
  }

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
