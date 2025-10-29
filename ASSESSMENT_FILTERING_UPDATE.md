# Assessment (CA/EXAM) Strict Filtering Implementation

## Overview
Updated CA and EXAM assessments to use **strict filtering** that matches the filtering logic used for courses and resources. This ensures that assessments only appear for users whose profile details match the assessment's audience.

## Changes Made

### 1. Backend Model Update (`backend/models/Assessment.js`)

Added `isAccessibleBy()` method to the Assessment model that implements strict filtering:

- **Public Assessments**: If an assessment has no audience restrictions (all audience fields empty), it's accessible to all users
- **Regular Users**: Must have ALL profile fields populated (university, faculty, department, level) and ALL populated audience fields must match the user's profile
- **Subadmins**: Can see assessments within their assigned scope
- **Admins**: Can see all assessments

This matches the exact filtering logic used in `ResourceFolder` and `Course` models.

### 2. Backend Routes Update (`backend/routes/assessments.js`)

Updated all student-facing routes to use strict filtering:

#### Student Routes:
- `GET /api/assessments/` - Get all available assessments (strict filtering)
- `GET /api/assessments/:id` - Get specific assessment (strict filtering)
- `GET /api/assessments/course/:courseId` - Get assessments by course (strict filtering)
- `GET /api/assessments/type/:type` - Get assessments by type (CA/EXAM) (strict filtering)

#### Admin Routes:
- `POST /api/admin/assessments` - Auto-populate `audience` from course's audience when creating assessments
- `GET /api/admin/assessments` - Scoped filtering for subadmins

### 3. Frontend (No Changes Required)

The frontend components already use the correct API endpoints and will automatically benefit from the backend changes:

- `RecentAssessments.jsx` - Fetches CA and EXAM assessments by type
- `Assessment.jsx` - Fetches individual assessment details
- `Results.jsx` - Fetches user's assessment results

## How It Works

### Before (Loose Filtering):
```javascript
// Old logic - too permissive
$or: [
  { 'audience.universities': { $in: user.universities || [] } },
  { 'audience.faculties': { $in: user.faculties || [] } },
  { 'audience.departments': { $in: user.departments || [] } },
  { 'audience.levels': { $in: user.levels || [] } }
]
```
❌ Problem: Assessment would appear if ANY field matched, even partial matches

### After (Strict Filtering):
```javascript
// New logic - strict matching like courses/resources
if (audience.universities?.length > 0) {
  hasMatch = hasMatch && audience.universities.includes(userUniversity);
}
if (audience.faculties?.length > 0) {
  hasMatch = hasMatch && audience.faculties.includes(userFaculty);
}
if (audience.departments?.length > 0) {
  hasMatch = hasMatch && audience.departments.includes(userDepartment);
}
if (audience.levels?.length > 0) {
  hasMatch = hasMatch && audience.levels.includes(userLevel);
}
```
✅ Solution: ALL populated audience fields must match the user's profile

## Example Scenarios

### Scenario 1: Public Assessment
```javascript
audience: {
  universities: [],
  faculties: [],
  departments: [],
  levels: []
}
```
✅ Visible to ALL users (no restrictions)

### Scenario 2: Department-Specific Assessment
```javascript
audience: {
  universities: ["University of Lagos"],
  faculties: ["Engineering"],
  departments: ["Computer Science"],
  levels: ["100", "200"]
}
```

**User Profile Requirements:**
- ✅ `university: "University of Lagos"` AND
- ✅ `faculty: "Engineering"` AND
- ✅ `department: "Computer Science"` AND
- ✅ `level: "100"` OR `"200"`

**User Profile Example 1 (Access Granted):**
```javascript
{
  university: "University of Lagos",
  faculty: "Engineering",
  department: "Computer Science",
  level: "100"
}
```
✅ ALL fields match → Assessment is visible

**User Profile Example 2 (Access Denied):**
```javascript
{
  university: "University of Lagos",
  faculty: "Engineering",
  department: "Electrical Engineering",  // ❌ Wrong department
  level: "100"
}
```
❌ Department doesn't match → Assessment is NOT visible

## Auto-Population from Course

When creating an assessment, if no `audience` is provided, it automatically inherits from the course:

```javascript
const assessmentAudience = value.audience || {
  universities: course.audience?.universities || [],
  faculties: course.audience?.faculties || [],
  departments: course.audience?.departments || [],
  levels: course.audience?.levels || []
};
```

This ensures that assessments for a course are scoped the same way as the course itself.

## Migration Considerations

### Existing Assessments
If you have existing assessments in the database that were created before this update:

1. **Assessments with no audience field**: Will be treated as public (visible to all)
2. **Assessments with partial audience data**: Will use strict matching on populated fields only

### Recommended Migration Script
For production, you may want to run a migration to populate audience fields from their associated courses:

```javascript
// Example migration (to be run manually if needed)
const assessments = await Assessment.find({});
for (const assessment of assessments) {
  if (!assessment.audience || 
      (!assessment.audience.universities?.length && 
       !assessment.audience.faculties?.length && 
       !assessment.audience.departments?.length && 
       !assessment.audience.levels?.length)) {
    const course = await Course.findById(assessment.courseId);
    if (course && course.audience) {
      assessment.audience = {
        universities: course.audience.universities || [],
        faculties: course.audience.faculties || [],
        departments: course.audience.departments || [],
        levels: course.audience.levels || []
      };
      await assessment.save();
      console.log(`Updated assessment ${assessment._id} with course audience`);
    }
  }
}
```

## Testing Checklist

- [ ] Create a course with specific audience (e.g., University X, Faculty Y, Department Z, Level 100)
- [ ] Create a CA assessment for that course
- [ ] Verify assessment auto-inherits course's audience
- [ ] Login as user with matching profile → Should see assessment
- [ ] Login as user with partial match → Should NOT see assessment
- [ ] Login as user with no profile data → Should NOT see assessment
- [ ] Create public assessment (no audience) → Should be visible to all
- [ ] Verify subadmin can only see assessments within their scope
- [ ] Verify admin can see all assessments

## Summary

The CA/EXAM filtering now works **exactly like courses and resources**:
- ✅ Strict matching on ALL populated audience fields
- ✅ Users must have complete profiles to access restricted content
- ✅ Public content (empty audience) is accessible to all
- ✅ Subadmins only see content within their scope
- ✅ Auto-population from course ensures consistency

This provides a consistent, secure, and predictable content filtering system across the entire platform.

