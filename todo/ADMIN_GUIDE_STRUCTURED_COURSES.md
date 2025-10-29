# Admin Guide: Structured Courses in TestMancer

## Overview

TestMancer's structured courses feature enables admins and subadmins to create hierarchical, organized learning content using flexible units (chapters, modules, sections, or topics) with rich page-based content and context-aware quizzes.

## Key Concepts

### Course Structure Types
- **Chapter**: Traditional book-like organization (e.g., "Chapter 1: Introduction")
- **Module**: Self-contained learning units (e.g., "Module 1: Basic Concepts")
- **Section**: Subdivisions within larger units (e.g., "Section 1.1: Overview")
- **Topic**: Thematic organization (e.g., "Topic 1: Variables")

### Unit vs Page Organization
- **Units**: Organizational containers (chapters/modules/sections/topics)
- **Pages**: Actual content delivery units with rich text and media
- **Quizzes**: Can be triggered at unit completion or specific page locations

### First-Attempt Gem Logic
- Students earn 1 gem per correct answer on their **first attempt only**
- Prevents gaming the system while rewarding genuine learning
- Gems are tracked per question across all quiz attempts

## Quick Start: Creating Your First Structured Course

### Step 1: Define Course Structure
1. Navigate to Admin Dashboard → Courses Management
2. Click "Create New Course"
3. Fill in basic course information:
   - **Title**: "Introduction to Computer Science"
   - **Course Code**: "CS101"
   - **Description**: Comprehensive overview of CS fundamentals
4. Configure **Structure Settings**:
   - **Structure Type**: "Module" (for modular learning)
   - **Unit Count**: 5 (five main modules)
5. Set **Audience Targeting** (for undergraduate courses):
   - Universities: Select relevant institutions
   - Faculties: Choose applicable departments
   - Levels: Specify academic levels (100-400L)

### Step 2: Create Units
1. After course creation, click "Manage Units" for your new course
2. Click "Add Unit" for each module:
   - **Title**: "Module 1: Programming Fundamentals"
   - **Description**: "Learn basic programming concepts and syntax"
   - **Order**: 1
   - **Estimated Time**: 120 (minutes)

### Step 3: Add Content Pages
1. For each unit, click "Add Page"
2. Create engaging content:
   - **Title**: "What is Programming?"
   - **Content**: Rich HTML with explanations, code examples, diagrams
   - **Media**: Add audio/video explanations or demonstrations
   - **Attachments**: Include downloadable resources (PDFs, code files)
   - **Order**: Sequential numbering within the unit

### Step 4: Create Quizzes
Choose between **Unit Quizzes** (end-of-module) or **Page Quizzes** (inline assessment):

#### Unit Quiz (Recommended for most cases):
- Triggered when student completes all pages in a unit
- Comprehensive assessment of unit learning objectives
- Higher point values, more questions

#### Page Quiz (For reinforcement):
- Triggered after reading specific content pages
- Quick checks (3-5 questions) to reinforce key concepts
- Immediate feedback and gem rewards

### Quiz Creation Steps:
1. Navigate to unit/page where you want to add assessment
2. Click "Add Quiz"
3. Configure quiz settings:
   - **Title**: "Module 1 Knowledge Check"
   - **Trigger**: Unit (for end-of-unit) or Page (for inline)
   - **Questions**: Add multiple choice questions with explanations
   - **Time Limit**: Optional (15-30 minutes for unit quizzes)
   - **Passing Score**: 70% (recommended)

## Advanced Course Design Patterns

### Pattern 1: Traditional Textbook Structure
```
Course: "Calculus I"
├── Chapter 1: Limits and Continuity
│   ├── Page 1.1: Introduction to Limits
│   ├── Page 1.2: Limit Laws
│   ├── Page 1.3: Continuity
│   └── Quiz: Chapter 1 Assessment
├── Chapter 2: Derivatives
│   ├── Page 2.1: Definition of Derivative
│   ├── Page 2.2: Basic Rules
│   └── Quiz: Chapter 2 Assessment
```

### Pattern 2: Modular Skill-Based Learning
```
Course: "Web Development Bootcamp"
├── Module 1: HTML Fundamentals
│   ├── Page 1.1: HTML Structure
│   ├── Page 1.2: Forms and Input
│   ├── Quiz: HTML Basics Check
│   └── Page 1.3: Best Practices
├── Module 2: CSS Styling
│   ├── Page 2.1: Selectors and Properties
│   └── Quiz: CSS Fundamentals Quiz
```

### Pattern 3: Micro-Learning with Frequent Assessment
```
Course: "Language Learning: Spanish"
├── Topic 1: Greetings
│   ├── Page 1.1: Basic Greetings
│   ├── Quiz: Greetings Practice
│   ├── Page 1.2: Formal vs Informal
│   └── Quiz: Politeness Quiz
├── Topic 2: Numbers
│   ├── Page 2.1: 1-10
│   ├── Quiz: Numbers 1-10
│   └── Page 2.2: 11-20
```

## Content Authoring Best Practices

### Page Content Guidelines
- **Keep pages focused**: 5-10 minutes of reading per page
- **Use rich formatting**: Headings, lists, code blocks, images
- **Include examples**: Real-world applications of concepts
- **Add interactive elements**: Links, embedded videos, diagrams
- **Provide context**: Explain why concepts matter

### Quiz Design Principles
- **Align with learning objectives**: Questions should test key concepts
- **Progressive difficulty**: Start easy, increase complexity
- **Clear explanations**: Provide reasoning for correct/incorrect answers
- **Variety**: Mix concept application, problem-solving, and recall questions

### Media Integration
- **Audio**: Narration for complex explanations or foreign language content
- **Video**: Demonstrations, lectures, or visual explanations
- **Documents**: Downloadable worksheets, cheat sheets, or reference materials
- **Images**: Diagrams, flowcharts, screenshots, or illustrations

## Subadmin Permissions and Scope

### Permission Levels
- **Full Admin**: Can create courses for any audience, manage all content
- **Subadmin**: Limited to assigned universities, faculties, and levels
- **Category Admin**: Restricted to specific exam types (WAEC/JAMB)

### Scope Validation
When creating courses, subadmins can only:
- Select from their assigned universities
- Choose faculties within their scope
- Target levels they are authorized to manage

### Best Practices for Scoped Admins
1. **Know your audience**: Understand the needs of your assigned institutions
2. **Collaborate**: Work with other subadmins for cross-institutional content
3. **Quality control**: Ensure content meets institutional standards
4. **Feedback loop**: Gather student feedback for content improvement

## Troubleshooting Common Issues

### Course Not Appearing for Students
**Problem**: Course created but students can't see it
**Solutions**:
- Check audience targeting matches student profile
- Verify course is marked as active
- Ensure student's university/faculty/level is included

### Quiz Gems Not Awarding
**Problem**: Students not earning gems for correct answers
**Solutions**:
- Check quiz trigger configuration (unit vs page)
- Verify questions have correct answers set
- Ensure student hasn't already earned gems for those questions

### Unit Order Issues
**Problem**: Units/pages displaying in wrong order
**Solutions**:
- Verify order field is set correctly (1, 2, 3...)
- Check for duplicate order numbers
- Refresh course cache if needed

### Media Upload Failures
**Problem**: Audio/video files not uploading
**Solutions**:
- Check file format (mp3/m4a/wav for audio, mp4 for video)
- Verify file size is under limits
- Ensure Cloudinary credentials are configured

## Performance Optimization

### Content Organization
- **Logical flow**: Ensure units build upon each other progressively
- **Prerequisites**: Clearly state what students should know before starting
- **Cross-references**: Link related content across units

### Student Engagement
- **Gamification**: Use quizzes strategically to maintain engagement
- **Progress indicators**: Clear visual progress through course
- **Achievement milestones**: Break long courses into achievable segments

### Technical Performance
- **Page size**: Keep individual pages under 10 minutes reading time
- **Media optimization**: Compress audio/video files appropriately
- **Loading optimization**: Use lazy loading for media content

## Analytics and Monitoring

### Course Performance Metrics
- **Completion rates**: Track how many students finish each unit
- **Quiz performance**: Monitor average scores and common problem areas
- **Engagement patterns**: Identify which content keeps students engaged

### Student Feedback Integration
- **Regular reviews**: Periodically assess course effectiveness
- **Update content**: Refresh outdated materials and examples
- **A/B testing**: Experiment with different content structures

## Migration from Legacy Courses

### Converting Existing Content
1. **Analyze current structure**: Review existing modules and content
2. **Choose appropriate unit type**: Chapter for sequential, Module for flexible
3. **Map content to pages**: Break large content blocks into digestible pages
4. **Add assessments**: Insert quizzes at logical break points
5. **Test thoroughly**: Ensure all content displays correctly

### Data Migration Checklist
- [ ] Course structure metadata added
- [ ] Existing modules converted to units
- [ ] Content preserved in page format
- [ ] Quizzes updated to new trigger system
- [ ] Media attachments migrated
- [ ] Student progress data maintained

## API Reference for Power Users

### Course Structure APIs
```javascript
// Create course with structure
POST /api/courses
{
  "title": "Course Title",
  "courseCode": "CODE101",
  "structure": {
    "unitType": "chapter",
    "unitLabel": "Chapter",
    "unitCount": 5
  }
}

// Add unit to course
POST /api/courses/:courseId/units
{
  "title": "Unit Title",
  "description": "Unit description",
  "order": 1,
  "estimatedTime": 60
}

// Add page to unit
POST /api/courses/:courseId/units/:unitId/pages
{
  "title": "Page Title",
  "html": "<p>Rich content</p>",
  "order": 1
}
```

### Quiz APIs
```javascript
// Create unit-triggered quiz
POST /api/quizzes
{
  "title": "Unit Quiz",
  "trigger": "unit",
  "moduleId": "unit_id",
  "questions": [...]
}

// Create page-triggered quiz
POST /api/quizzes
{
  "title": "Page Quiz",
  "trigger": "page",
  "moduleId": "unit_id",
  "pageOrder": 2,
  "questions": [...]
}
```

## Support and Resources

### Getting Help
- **Documentation**: This guide and API documentation
- **Community**: GitHub issues and discussions
- **Training**: Admin training sessions and webinars
- **Support**: Direct support through admin dashboard

### Best Practice Resources
- **Content Design Guide**: Templates for effective course creation
- **Assessment Guidelines**: Standards for quiz design and difficulty
- **Accessibility Checklist**: Ensuring content works for all students
- **Performance Benchmarks**: Industry standards for course metrics

---

*This guide will be updated as new features are added to the structured courses system. Check back regularly for the latest best practices and troubleshooting tips.*
