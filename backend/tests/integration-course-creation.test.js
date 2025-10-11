const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const Course = require('../models/Course.js');
const Quiz = require('../models/Quiz.js');
const User = require('../models/User.js');
const courseRoutes = require('../routes/courses.js');
const quizRoutes = require('../routes/quizzes.js');

// Mock auth middleware for testing
jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 'test-subadmin-id' };
    next();
  },
  requirePermission: (permission) => (req, res, next) => {
    // Mock subadmin permissions
    if (permission === 'manage_courses') {
      next();
    } else {
      next();
    }
  }
}));

describe('Integration Tests: Subadmin Course Creation → Units/Pages → Quiz → Submission', () => {
  let app;
  let subadminUser;

  beforeEach(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer-test');
    }

    // Create test app with both course and quiz routes
    app = express();
    app.use(express.json());
    app.use('/api/courses', courseRoutes);
    app.use('/api/quizzes', quizRoutes);

    // Create subadmin user
    subadminUser = new User({
      googleId: 'subadmin-google-id',
      email: 'subadmin@example.com',
      name: 'Subadmin User',
      role: 'subadmin',
      gems: 0
    });
    await subadminUser.save();

    // Mock auth to use subadmin
    const mockAuth = require('../middleware/auth.js');
    mockAuth.authenticateToken.mockImplementation((req, res, next) => {
      req.user = { userId: subadminUser._id.toString() };
      next();
    });
  });

  afterEach(async () => {
    await Quiz.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Complete course creation and quiz flow', () => {
    let createdCourse;
    let createdModule;
    let studentUser;

    it('should complete full subadmin course creation flow', async () => {
      // Step 1: Subadmin creates course with structure
      const courseData = {
        title: 'Integration Test Course',
        courseCode: 'INT101',
        description: 'Complete integration test course',
        audience: {
          universities: ['Integration University'],
          faculties: ['Computer Science'],
          levels: ['100 Level']
        },
        structure: {
          unitType: 'chapter',
          unitLabel: 'Chapter',
          unitCount: 2
        }
      };

      const courseResponse = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(201);

      createdCourse = courseResponse.body.course;
      expect(createdCourse.title).toBe('Integration Test Course');
      expect(createdCourse.structure.unitType).toBe('chapter');
      expect(createdCourse.structure.unitLabel).toBe('Chapter');
      expect(createdCourse.structure.unitCount).toBe(2);
    });

    it('should create units (chapters) for the course', async () => {
      const unitData = {
        title: 'Chapter 1: Introduction',
        description: 'Introduction to the course',
        order: 1,
        estimatedTime: 60
      };

      const unitResponse = await request(app)
        .post(`/api/courses/${createdCourse._id}/modules`)
        .send(unitData)
        .expect(201);

      createdModule = unitResponse.body.module;
      expect(createdModule.title).toBe('Chapter 1: Introduction');
      expect(createdModule.order).toBe(1);
      expect(createdModule.estimatedTime).toBe(60);
    });

    it('should create pages within the unit', async () => {
      const pageData = {
        title: 'Welcome Page',
        order: 1,
        html: '<h1>Welcome to Chapter 1</h1><p>This is the introduction page.</p>',
        audioUrl: 'https://example.com/audio/welcome.mp3',
        attachments: [
          {
            title: 'Course Syllabus',
            url: 'https://example.com/docs/syllabus.pdf',
            type: 'document'
          }
        ]
      };

      const pageResponse = await request(app)
        .post(`/api/courses/${createdCourse._id}/modules/${createdModule._id}/pages`)
        .send(pageData)
        .expect(201);

      const createdPage = pageResponse.body.page;
      expect(createdPage.title).toBe('Welcome Page');
      expect(createdPage.html).toContain('Welcome to Chapter 1');
      expect(createdPage.audioUrl).toBe('https://example.com/audio/welcome.mp3');
      expect(createdPage.attachments).toHaveLength(1);
    });

    it('should create unit-level quiz', async () => {
      const quizData = {
        title: 'Chapter 1 Quiz',
        description: 'Test your knowledge of Chapter 1',
        trigger: 'unit',
        moduleId: createdModule._id,
        questions: [
          {
            question: 'What is the main topic of Chapter 1?',
            options: ['Introduction', 'Advanced Topics', 'Conclusion', 'References'],
            correctAnswer: 0,
            points: 1,
            explanation: 'Chapter 1 covers the introduction to the course.'
          },
          {
            question: 'Which of these is NOT covered in Chapter 1?',
            options: ['Basic concepts', 'Advanced algorithms', 'Course overview', 'Prerequisites'],
            correctAnswer: 1,
            points: 1
          }
        ],
        timeLimit: 15,
        passingScore: 70
      };

      const quizResponse = await request(app)
        .post('/api/quizzes')
        .send(quizData)
        .expect(201);

      const createdQuiz = quizResponse.body.quiz;
      expect(createdQuiz.title).toBe('Chapter 1 Quiz');
      expect(createdQuiz.trigger).toBe('unit');
      expect(createdQuiz.moduleId).toBe(createdModule._id.toString());
      expect(createdQuiz.questions).toHaveLength(2);
    });

    it('should create page-level quiz', async () => {
      const pageQuizData = {
        title: 'Welcome Page Quiz',
        description: 'Quick check after reading the welcome page',
        trigger: 'page',
        moduleId: createdModule._id,
        pageOrder: 1,
        questions: [
          {
            question: 'What is the title of the first page?',
            options: ['Introduction', 'Welcome Page', 'Conclusion', 'Summary'],
            correctAnswer: 1,
            points: 1
          }
        ]
      };

      const quizResponse = await request(app)
        .post('/api/quizzes')
        .send(pageQuizData)
        .expect(201);

      const createdPageQuiz = quizResponse.body.quiz;
      expect(createdPageQuiz.title).toBe('Welcome Page Quiz');
      expect(createdPageQuiz.trigger).toBe('page');
      expect(createdPageQuiz.pageOrder).toBe(1);
      expect(createdPageQuiz.questions).toHaveLength(1);
    });

    it('should retrieve all quizzes for the course', async () => {
      const response = await request(app)
        .get(`/api/quizzes/course/${createdCourse._id}/detailed`)
        .expect(200);

      expect(response.body.unitQuizzes).toBeDefined();
      expect(response.body.pageQuizzes).toBeDefined();
      expect(response.body.unitQuizzes.length).toBeGreaterThan(0);
      expect(response.body.pageQuizzes.length).toBeGreaterThan(0);

      // Verify unit quiz
      const unitQuiz = response.body.unitQuizzes[0];
      expect(unitQuiz.trigger).toBe('unit');
      expect(unitQuiz.moduleId).toBe(createdModule._id.toString());

      // Verify page quiz
      const pageQuiz = response.body.pageQuizzes[0];
      expect(pageQuiz.trigger).toBe('page');
      expect(pageQuiz.pageOrder).toBe(1);
    });

    it('should allow student to take unit quiz and earn gems', async () => {
      // Create a student user
      studentUser = new User({
        googleId: 'student-google-id',
        email: 'student@example.com',
        name: 'Student User',
        role: 'user',
        gems: 0
      });
      await studentUser.save();

      // Get unit quiz
      const quizzesResponse = await request(app)
        .get(`/api/quizzes/module/${createdModule._id}`)
        .expect(200);

      const unitQuiz = quizzesResponse.body.quizzes.find(q => q.trigger === 'unit');
      expect(unitQuiz).toBeDefined();

      // Mock auth as student
      const mockAuth = require('../middleware/auth.js');
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: studentUser._id.toString() };
        next();
      });

      // Student submits quiz answers
      const answers = [0, 1]; // Both correct
      const submitResponse = await request(app)
        .post(`/api/quizzes/${unitQuiz._id}/submit`)
        .send({ answers })
        .expect(200);

      expect(submitResponse.body.score).toBe(100);
      expect(submitResponse.body.correctAnswers).toBe(2);
      expect(submitResponse.body.gemsEarned).toBe(2);
      expect(submitResponse.body.totalGems).toBe(2);

      // Verify student earned gems
      const updatedStudent = await User.findById(studentUser._id);
      expect(updatedStudent.gems).toBe(2);
      expect(updatedStudent.earnedGems).toHaveLength(1);
      expect(updatedStudent.earnedGems[0].questionIds).toHaveLength(2);
      expect(updatedStudent.quizHistory).toHaveLength(1);
    });

    it('should allow student to take page quiz and earn additional gems', async () => {
      // Mock auth as student (continuing from previous test)
      const mockAuth = require('../middleware/auth.js');
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: studentUser._id.toString() };
        next();
      });

      // Get page quiz
      const pageQuizResponse = await request(app)
        .get(`/api/quizzes/page/${createdCourse._id}/${createdModule._id}/1`)
        .expect(200);

      const pageQuiz = pageQuizResponse.body.quiz;
      expect(pageQuiz).toBeDefined();
      expect(pageQuiz.trigger).toBe('page');

      // Student submits page quiz
      const answers = [1]; // Correct answer
      const submitResponse = await request(app)
        .post(`/api/quizzes/${pageQuiz._id}/submit`)
        .send({ answers })
        .expect(200);

      expect(submitResponse.body.score).toBe(100);
      expect(submitResponse.body.correctAnswers).toBe(1);
      expect(submitResponse.body.gemsEarned).toBe(1);
      expect(submitResponse.body.totalGems).toBe(3); // 2 from unit quiz + 1 from page quiz

      // Verify student has total of 3 gems
      const updatedStudent = await User.findById(studentUser._id);
      expect(updatedStudent.gems).toBe(3);
      expect(updatedStudent.earnedGems).toHaveLength(2); // Two quizzes
      expect(updatedStudent.quizHistory).toHaveLength(2);
    });
  });
});
