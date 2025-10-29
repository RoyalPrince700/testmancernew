import User from '../models/User.js';
import Course from '../models/Course.js';

/**
 * ProgressService centralizes course progress and gem-award logic
 * to keep routes thin and ensure consistent behavior across endpoints.
 */
export async function markUnitComplete({ userId, courseId, unitId }) {
  // Load course and validate existence
  const course = await Course.findById(courseId);
  if (!course) {
    return { ok: false, status: 404, error: 'Course not found' };
  }

  // Validate unit exists in course
  const unit = course.modules.id(unitId);
  if (!unit) {
    return { ok: false, status: 404, error: 'Unit not found in course' };
  }

  // Load user
  const user = await User.findById(userId);
  if (!user) {
    return { ok: false, status: 404, error: 'User not found' };
  }

  // If already completed, return idempotent response without awarding again
  const alreadyCompleted = user.hasEarnedCompletionGemForUnit(courseId, unitId);
  if (alreadyCompleted) {
    const isAdminUser = user.role === 'admin' || user.role === 'subadmin' || user.role === 'waec_admin' || user.role === 'jamb_admin';
    const visibleModules = isAdminUser ? course.modules : course.modules.filter(m => m.isPublished === true);
    const progress = course.getDetailedProgress(user.completionGems || [], { visibleModules });
    return {
      ok: true,
      status: 200,
      message: 'Module already completed',
      gemsAwarded: 0,
      totalGems: user.gems,
      progress
    };
  }

  // Record completion using the proven method
  await user.recordCompletionGemForUnit(courseId, unitId);

  // Fetch fresh user data for progress calculation to ensure accuracy
  const freshUser = await User.findById(userId);
  const isAdminUser2 = freshUser.role === 'admin' || freshUser.role === 'subadmin' || freshUser.role === 'waec_admin' || freshUser.role === 'jamb_admin';
  const visibleModules2 = isAdminUser2 ? course.modules : course.modules.filter(m => m.isPublished === true);
  const progress = course.getDetailedProgress(freshUser.completionGems || [], { visibleModules: visibleModules2 });

  return {
    ok: true,
    status: 200,
    message: 'Module completed successfully',
    gemsAwarded: 3,
    totalGems: freshUser.gems,
    progress
  };
}

export async function getDetailedCourseProgress({ userId, courseId }) {
  const course = await Course.findById(courseId);
  if (!course) {
    return { ok: false, status: 404, error: 'Course not found' };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { ok: false, status: 404, error: 'User not found' };
  }

  const isAdminUser = user.role === 'admin' || user.role === 'subadmin' || user.role === 'waec_admin' || user.role === 'jamb_admin';
  const visibleModules = isAdminUser ? course.modules : course.modules.filter(m => m.isPublished === true);
  const progress = course.getDetailedProgress(user.completionGems || [], { visibleModules });
  return { ok: true, status: 200, progress };
}


