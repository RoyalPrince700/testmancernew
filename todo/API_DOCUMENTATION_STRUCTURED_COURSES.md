# API Documentation: Structured Courses

## Overview

The structured courses feature introduces hierarchical course organization with flexible units (chapters, modules, sections, or topics), page-based content delivery, and context-aware quizzes with first-attempt gem rewards.

## Core Concepts

### Course Structure
Courses now include a `structure` object defining the organizational approach:
```json
{
  "unitType": "chapter|module|section|topic",
  "unitLabel": "Chapter|Module|Section|Topic",
  "unitCount": 1-100
}
```

### Units vs Modules
- **Units**: New flexible organizational containers (chapters/modules/sections/topics)
- **Modules**: Legacy term, now aliased as units for backward compatibility
- All existing `/modules` endpoints have `/units` equivalents

### Quiz Triggers
Quizzes can now be triggered at different points:
- **Unit Trigger**: Fires when student completes all pages in a unit
- **Page Trigger**: Fires after viewing a specific page

### First-Attempt Gem Logic
- Students earn 1 gem per correct answer only on their first attempt
- Gems are tracked per question across all quiz attempts
- Prevents gaming while rewarding genuine learning

## API Endpoints

## Courses

### GET /api/courses
List all courses with structure metadata.

**Response:**
```json
{
  "courses": [
    {
      "id": "course_id",
      "title": "Course Title",
      "courseCode": "CODE101",
      "description": "Course description",
      "structure": {
        "unitType": "chapter",
        "unitLabel": "Chapter",
        "unitCount": 5
      },
      "audience": {
        "universities": ["University A"],
        "faculties": ["Computer Science"],
        "levels": ["100 Level"]
      },
      "thumbnail": "thumbnail_url",
      "enrollmentCount": 150,
      "completionRate": 75
    }
  ]
}
```

### GET /api/courses/:id
Get detailed course information with units and pages.

**Response:**
```json
{
  "course": {
    "id": "course_id",
    "title": "Course Title",
    "structure": {
      "unitType": "module",
      "unitLabel": "Module",
      "unitCount": 3
    },
    "units": [
      {
        "id": "unit_id",
        "title": "Module 1: Introduction",
        "description": "Introduction module",
        "order": 1,
        "estimatedTime": 60,
        "pages": [
          {
            "id": "page_id",
            "title": "Welcome Page",
            "order": 1,
            "html": "<p>Welcome content</p>",
            "audioUrl": "https://cloudinary.com/audio.mp3",
            "videoUrl": "https://cloudinary.com/video.mp4",
            "attachments": [
              {
                "title": "Reference PDF",
                "url": "https://cloudinary.com/doc.pdf",
                "type": "document"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### POST /api/courses (Admin)
Create a new course with structure.

**Request:**
```json
{
  "title": "New Course",
  "courseCode": "NEW101",
  "description": "Course description",
  "structure": {
    "unitType": "chapter",
    "unitLabel": "Chapter",
    "unitCount": 4
  },
  "audience": {
    "universities": ["University A"],
    "faculties": ["Engineering"],
    "levels": ["200 Level"]
  },
  "difficulty": "intermediate",
  "category": "tertiary"
}
```

**Response:**
```json
{
  "course": {
    "id": "new_course_id",
    "title": "New Course",
    "structure": {
      "unitType": "chapter",
      "unitLabel": "Chapter",
      "unitCount": 4
    }
  }
}
```

## Units (Modules Alias)

### GET /api/courses/:courseId/units
Get all units for a course (equivalent to GET /api/courses/:courseId/modules).

**Response:**
```json
{
  "units": [
    {
      "id": "unit_id",
      "title": "Chapter 1: Basics",
      "description": "Basic concepts",
      "order": 1,
      "estimatedTime": 45,
      "pages": [
        {
          "id": "page_id",
          "title": "Introduction",
          "order": 1
        }
      ]
    }
  ]
}
```

### POST /api/courses/:courseId/units (Admin)
Add a unit to a course.

**Request:**
```json
{
  "title": "New Unit",
  "description": "Unit description",
  "order": 2,
  "estimatedTime": 90
}
```

**Response:**
```json
{
  "unit": {
    "id": "new_unit_id",
    "title": "New Unit",
    "order": 2,
    "estimatedTime": 90
  }
}
```

## Pages

### GET /api/courses/:courseId/units/:unitId/pages
Get all pages for a unit.

**Response:**
```json
{
  "pages": [
    {
      "id": "page_id",
      "title": "Page Title",
      "order": 1,
      "html": "<h1>Content</h1><p>Rich HTML content</p>",
      "audioUrl": "https://cloudinary.com/audio.mp3",
      "videoUrl": "https://cloudinary.com/video.mp4",
      "attachments": [
        {
          "title": "Worksheet",
          "url": "https://cloudinary.com/worksheet.pdf",
          "type": "document"
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/courses/:courseId/units/:unitId/pages (Admin)
Add a page to a unit.

**Request:**
```json
{
  "title": "New Page",
  "order": 3,
  "html": "<h2>Page Content</h2><p>Detailed content here</p>",
  "audioUrl": "https://cloudinary.com/narration.mp3",
  "videoUrl": "https://cloudinary.com/demonstration.mp4",
  "attachments": [
    {
      "title": "Code Example",
      "url": "https://cloudinary.com/code.zip",
      "type": "document"
    }
  ]
}
```

**Response:**
```json
{
  "page": {
    "id": "new_page_id",
    "title": "New Page",
    "order": 3
  }
}
```

## Quizzes

### GET /api/quizzes/unit/:unitId
Get unit-triggered quiz for a specific unit.

**Response:**
```json
{
  "quiz": {
    "id": "quiz_id",
    "title": "Unit Assessment",
    "description": "Test your knowledge",
    "trigger": "unit",
    "moduleId": "unit_id",
    "questions": [
      {
        "id": "question_id",
        "question": "What is the answer?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "points": 1,
        "explanation": "Explanation of correct answer"
      }
    ],
    "timeLimit": 20,
    "passingScore": 70
  }
}
```

### GET /api/quizzes/page/:courseId/:unitId/:pageOrder
Get page-triggered quiz for a specific page.

**Response:**
```json
{
  "quiz": {
    "id": "page_quiz_id",
    "title": "Quick Check",
    "trigger": "page",
    "moduleId": "unit_id",
    "pageOrder": 2,
    "questions": [
      {
        "id": "q_id",
        "question": "Quick question?",
        "options": ["Yes", "No"],
        "correctAnswer": 0,
        "points": 1
      }
    ]
  }
}
```

### GET /api/quizzes/course/:courseId/detailed
Get all quizzes for a course with trigger information.

**Response:**
```json
{
  "unitQuizzes": [
    {
      "id": "unit_quiz_id",
      "title": "Unit Quiz",
      "trigger": "unit",
      "moduleId": "unit_id"
    }
  ],
  "pageQuizzes": [
    {
      "id": "page_quiz_id",
      "title": "Page Quiz",
      "trigger": "page",
      "pageOrder": 1
    }
  ]
}
```

### POST /api/quizzes (Admin)
Create a new quiz with trigger configuration.

**Request (Unit Trigger):**
```json
{
  "title": "Unit Assessment",
  "description": "Comprehensive unit test",
  "courseId": "course_id",
  "trigger": "unit",
  "moduleId": "unit_id",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "points": 1,
      "explanation": "Why this is correct"
    }
  ],
  "timeLimit": 30,
  "passingScore": 70
}
```

**Request (Page Trigger):**
```json
{
  "title": "Page Check",
  "description": "Quick reinforcement quiz",
  "courseId": "course_id",
  "trigger": "page",
  "moduleId": "unit_id",
  "pageOrder": 2,
  "questions": [
    {
      "question": "Key point from this page?",
      "options": ["Point A", "Point B"],
      "correctAnswer": 1,
      "points": 1
    }
  ]
}
```

### POST /api/quizzes/:id/submit
Submit quiz answers with first-attempt gem logic.

**Request:**
```json
{
  "answers": [0, 1, 2]  // Array of selected option indices
}
```

**Response:**
```json
{
  "score": 67,
  "correctAnswers": 2,
  "totalQuestions": 3,
  "gemsEarned": 1,  // Only new correct answers this attempt
  "totalGems": 5,   // Lifetime total for user
  "passed": false,
  "questionResults": [
    {
      "questionId": "q1_id",
      "userAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "points": 1,
      "explanation": "Correct explanation"
    },
    {
      "questionId": "q2_id",
      "userAnswer": 2,
      "correctAnswer": 1,
      "isCorrect": false,
      "points": 0,
      "explanation": "Incorrect explanation"
    }
  ]
}
```

## Backward Compatibility

### Module Endpoints (Deprecated but Supported)
All existing `/modules` endpoints are still functional but log deprecation warnings:

- `GET /api/courses/:courseId/modules` → Use `/api/courses/:courseId/units`
- `POST /api/courses/:courseId/modules` → Use `/api/courses/:courseId/units`
- `PUT /api/courses/:courseId/modules/:moduleId` → Use `/api/courses/:courseId/units/:unitId`
- `DELETE /api/courses/:courseId/modules/:moduleId` → Use `/api/courses/:courseId/units/:unitId`

### Migration Path
Existing courses automatically get default structure:
```json
{
  "structure": {
    "unitType": "module",
    "unitLabel": "Module",
    "unitCount": <existing_module_count>
  }
}
```

## Error Responses

### Validation Errors
```json
{
  "message": "Validation failed",
  "errors": {
    "structure.unitType": "Must be one of: chapter, module, section, topic",
    "structure.unitCount": "Must be between 1 and 100"
  }
}
```

### Permission Errors
```json
{
  "message": "Insufficient permissions",
  "code": "PERMISSION_DENIED",
  "details": "Subadmin scope limited to assigned universities"
}
```

### Quiz Trigger Errors
```json
{
  "message": "Invalid quiz configuration",
  "code": "INVALID_TRIGGER",
  "details": "Page-triggered quiz requires pageOrder"
}
```

## Rate Limiting

- **Course Creation**: 10 requests per hour per admin
- **Quiz Submission**: 5 submissions per minute per user
- **Media Upload**: 20 uploads per hour per admin
- **API Queries**: 100 requests per minute per user

## Authentication & Authorization

### Required Permissions
- **Course Management**: `manage_courses` scope
- **Quiz Creation**: `manage_courses` scope
- **Media Upload**: `manage_courses` scope
- **User Management**: `admin` role only

### Subadmin Restrictions
Subadmins can only:
- Create courses for their assigned universities
- Manage content within their faculty/level scope
- Upload media for their approved courses

## Data Models

### Course Schema
```javascript
{
  title: String (required),
  courseCode: String (required, unique),
  description: String (required),
  structure: {
    unitType: String (enum: ['chapter', 'module', 'section', 'topic'], default: 'module'),
    unitLabel: String (default: 'Module'),
    unitCount: Number (min: 1, max: 100, default: 1)
  },
  audience: {
    universities: [String],
    faculties: [String],
    levels: [String]
  },
  modules: [ModuleSchema], // Now aliased as units
  // ... other fields
}
```

### Quiz Schema
```javascript
{
  title: String (required),
  description: String (required),
  courseId: ObjectId (ref: 'Course', required),
  trigger: String (enum: ['unit', 'page'], default: 'unit'),
  moduleId: ObjectId (ref: 'Module'), // Unit reference
  pageOrder: Number (min: 1), // Required if trigger === 'page'
  questions: [QuestionSchema],
  // ... other fields
}
```

### User Gem Tracking
```javascript
{
  earnedGems: [{
    quizId: ObjectId (ref: 'Quiz'),
    questionIds: [ObjectId] // Questions for which gems were earned
  }],
  gems: Number (default: 0, min: 0)
}
```

## Webhooks & Integrations

### Quiz Completion Events
```json
{
  "event": "quiz.completed",
  "data": {
    "userId": "user_id",
    "quizId": "quiz_id",
    "score": 85,
    "gemsEarned": 2,
    "totalGems": 15,
    "attemptNumber": 1
  }
}
```

### Course Progress Events
```json
{
  "event": "course.progress",
  "data": {
    "userId": "user_id",
    "courseId": "course_id",
    "completedUnits": 3,
    "totalUnits": 5,
    "progressPercentage": 60
  }
}
```

## Testing

### Unit Tests
- Model validation for structure fields
- Quiz trigger logic and constraints
- First-attempt gem calculation
- Permission scope validation

### Integration Tests
- Complete course creation workflow
- Unit and page management
- Quiz creation and submission
- Gem earning and tracking

### API Tests
- Endpoint response formats
- Error handling and validation
- Authentication and authorization
- Rate limiting behavior

## Migration Scripts

### Structured Courses Migration
```bash
# Dry run
npm run migrate:structured-courses -- --dry-run

# Production run
npm run migrate:structured-courses -- --environment production

# Rollback
npm run migrate:rollback-structured-courses
```

### Data Transformations
- Adds `structure` object to all existing courses
- Sets default `unitType` to 'module' for existing content
- Updates quiz `trigger` fields (defaults to 'unit')
- Initializes `earnedGems` arrays for existing users

## Performance Considerations

### Database Indexes
```javascript
// New indexes for structured queries
db.courses.createIndex({ "structure.unitType": 1 });
db.courses.createIndex({ "structure.unitCount": 1 });
db.quizzes.createIndex({ "trigger": 1, "pageOrder": 1 });
db.users.createIndex({ "earnedGems.quizId": 1 });
```

### Query Optimization
- Use covered queries for course listings
- Implement pagination for large unit/page lists
- Cache frequently accessed course structures
- Optimize media asset delivery with CDN

### Monitoring
- Track API response times for new endpoints
- Monitor database query performance
- Alert on quiz submission processing delays
- Track gem earning patterns for abuse detection

## Support & Troubleshooting

### Common Issues
1. **Structure validation errors**: Ensure unitType is valid enum value
2. **Quiz trigger conflicts**: Unit quizzes need moduleId, page quizzes need pageOrder
3. **Permission scope violations**: Check subadmin assignments
4. **Gem calculation issues**: Verify question IDs and attempt history

### Debug Endpoints
```bash
# Course structure validation
GET /api/debug/courses/:id/structure

# Quiz trigger verification
GET /api/debug/quizzes/:id/trigger

# User gem history
GET /api/debug/users/:id/gems
```

---

*This API documentation covers all changes introduced by the structured courses feature. For legacy API documentation, see the previous version.*
