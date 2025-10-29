import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production');

      const user = await User.findById(decoded.userId);
      if (!user) {
        console.error('User not found for decoded userId:', decoded.userId);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = { userId: decoded.userId, ...user.toObject() };
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Alias for protect function to maintain compatibility
export const ensureAuthenticated = protect;
export const authenticateToken = protect;

// Admin-only middleware
export const requireAdmin = authorize('admin');

// Advanced permission middleware for granular role-based access
export const requirePermission = (action, resource = null) => {
  return (req, res, next) => {
    const user = req.user;

    // Full admin has access to everything
    if (user.role === 'admin') {
      return next();
    }

    // Check permissions based on role and action
    switch (action) {
      case 'manage_courses':
        return checkCourseManagementPermission(user, req, res, next);
      case 'manage_users':
        return checkUserManagementPermission(user, req, res, next);
      case 'upload_media':
        return checkMediaUploadPermission(user, req, res, next);
      default:
        return res.status(403).json({
          success: false,
          message: `Unknown permission action: ${action}`
        });
    }
  };
};

// Check if user can manage courses based on their role and assignments
function checkCourseManagementPermission(user, req, res, next) {
  const { role, assignedUniversities, assignedFaculties, assignedLevels } = user;

  // Full admin can manage all courses
  if (role === 'admin') {
    return next();
  }

  // WAEC admin can manage WAEC courses
  if (role === 'waec_admin') {
    // For course operations, we might need to check the course's learning goals
    // This will be checked in the route handler where we have access to the course
    req.allowedCategories = ['waec'];
    return next();
  }

  // JAMB admin can manage JAMB courses
  if (role === 'jamb_admin') {
    req.allowedCategories = ['jamb'];
    return next();
  }

  // Subadmin can manage courses for their assigned universities/faculties/levels
  if (role === 'subadmin') {
    if (!assignedUniversities?.length && !assignedFaculties?.length && !assignedLevels?.length) {
      return res.status(403).json({
        success: false,
        message: 'Subadmin has no assigned universities, faculties, or levels'
      });
    }
    req.allowedUniversities = assignedUniversities || [];
    req.allowedFaculties = assignedFaculties || [];
    req.allowedLevels = assignedLevels || [];
    return next();
  }

  // Regular users cannot manage courses
  return res.status(403).json({
    success: false,
    message: 'Insufficient permissions to manage courses'
  });
}

// Check if user can manage users (only full admins)
function checkUserManagementPermission(user, req, res, next) {
  if (user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Only full admins can manage user roles'
  });
}

// Check if user can upload media (full admin, subadmins, and category admins)
function checkMediaUploadPermission(user, req, res, next) {
  const allowedRoles = ['admin', 'subadmin', 'waec_admin', 'jamb_admin'];

  if (allowedRoles.includes(user.role)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Insufficient permissions to upload media'
  });
}