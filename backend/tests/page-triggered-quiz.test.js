const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const Quiz = require('../models/Quiz.js');
const User = require('../models/User.js');
const Course = require('../models/Course.js');
const quizRoutes = require('../routes/quizzes.js');

// Mock auth middleware for testing
jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 'test-user-id' };
    next();
  },
  requirePermission: () => (req, res, next) => next()
}));

describe('Page-Triggered Quiz Tests', () => {
  let app;
  let testUser;
  let testCourse;
  let testModule;

  beforeEach(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer-test');
    }

    // Create test app
    app = express();
    app.use(express.json());
    app.use('/api/quizzes', quizRoutes);

    // Create test data
    testCourse = new Course({
      title: 'Test Course',
      courseCode: 'TEST301',
      description: 'Test course description',
      audience: { universities: ['Test University'] },
      structure: {
        unitType: 'chapter',
        unitLabel: 'Chapter',
        unitCount: 3
      },
      modules: [{
        title: 'Chapter 1',
        description: 'First chapter',
        order: 1,
        estimatedTime: 45,
        pages: [
          {
            title: 'Page 1',
            order: 1,
            html: '<p>Page 1 content</p>'
          },
          {
            title: 'Page 2',
            order: 2,
            html: '<p>Page 2 content</p>'
          }
        ]
      }]
    });
    await testCourse.save();
    testModule = testCourse.modules[0];

    testUser = new User({
      googleId: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User',
      gems: 0
    });
    await testUser.save();

    // Mock the authenticateToken to set the correct user
    const mockAuth = require('../middleware/auth.js');
    mockAuth.authenticateToken.mockImplementation((req, res, next) => {
      req.user = { userId: testUser._id.toString() };
      next();
    });
  });

  afterEach(async () => {
    await Quiz.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Creating page-triggered quizzes', () => {
    it('should create quiz triggered by page', async () => {
      const quizData = {
        title: 'Page 2 Quiz',
        description: 'Quiz for page 2',
        courseId: testCourse._id,
        trigger: 'page',
        moduleId: testModule._id,
        pageOrder: 2,
        questions: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1,
            points: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/quizzes')
        .send(quizData)
        .expect(201);

      expect(response.body.quiz.trigger).toBe('page');
      expect(response.body.quiz.pageOrder).toBe(2);
      expect(response.body.quiz.moduleId).toBe(testModule._id.toString());
    });

    it('should reject page quiz without pageOrder', async () => {
      const quizData = {
        title: 'Invalid Page Quiz',
        description: 'Quiz missing pageOrder',
        courseId: testCourse._id,
        trigger: 'page',
        moduleId: testModule._id,
        questions: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1,
            points: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/quizzes')
        .send(quizData)
        .expect(400);

      expect(response.body.message).toContain('pageOrder');
    });
  });

  describe('Retrieving page-triggered quizzes', () => {
    let pageQuiz;

    beforeEach(async () => {
      pageQuiz = new Quiz({
        title: 'Page Quiz',
        description: 'Quiz for page',
        courseId: testCourse._id,
        trigger: 'page',
        moduleId: testModule._id,
        pageOrder: 1,
        questions: [
          {
            question: 'Page question?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            points: 1
          }
        ]
      });
      await pageQuiz.save();
    });

    it('should retrieve quiz by page parameters', async () => {
      const response = await request(app)
        .get(`/api/quizzes/page/${testCourse._id}/${testModule._id}/1`)
        .expect(200);

      expect(response.body.quiz.trigger).toBe('page');
      expect(response.body.quiz.pageOrder).toBe(1);
      expect(response.body.quiz.title).toBe('Page Quiz');
    });

    it('should return null for non-existent page quiz', async () => {
      const response = await request(app)
        .get(`/api/quizzes/page/${testCourse._id}/${testModule._id}/999`)
        .expect(200);

      expect(response.body.quiz).toBeNull();
    });
  });

  describe('Page quiz submission with gem logic', () => {
    let pageQuiz;

    beforeEach(async () => {
      pageQuiz = new Quiz({
        title: 'Page Quiz',
        description: 'Quiz for page',
        courseId: testCourse._id,
        trigger: 'page',
        moduleId: testModule._id,
        pageOrder: 1,
        questions: [
          {
            question: 'Page question 1?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            points: 1
          },
          {
            question: 'Page question 2?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 1,
            points: 1
          }
        ]
      });
      await pageQuiz.save();
    });

    it('should award gems on first correct page quiz attempt', async () => {
      const answers = [0, 1]; // Both correct

      const response = await request(app)
        .post(`/api/quizzes/${pageQuiz._id}/submit`)
        .send({ answers })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.gemsEarned).toBe(2);
      expect(response.body.totalGems).toBe(2);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.gems).toBe(2);
      expect(updatedUser.earnedGems).toHaveLength(1);
      expect(updatedUser.earnedGems[0].questionIds).toHaveLength(2);
    });

    it('should not award gems on repeat page quiz attempts', async () => {
      // First attempt
      await request(app)
        .post(`/api/quizzes/${pageQuiz._id}/submit`)
        .send({ answers: [0, 1] });

      // Second attempt - all correct but no new gems
      const response = await request(app)
        .post(`/api/quizzes/${pageQuiz._id}/submit`)
        .send({ answers: [0, 1] })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.gemsEarned).toBe(0);
      expect(response.body.totalGems).toBe(2); // Still 2 total

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.gems).toBe(2);
      expect(updatedUser.earnedGems[0].questionIds).toHaveLength(2);
    });

    it('should award gems only for newly correct questions on repeat attempts', async () => {
      // First attempt - only first question correct
      await request(app)
        .post(`/api/quizzes/${pageQuiz._id}/submit`)
        .send({ answers: [0, 1] }); // First wrong, second correct

      let updatedUser = await User.findById(testUser._id);
      expect(updatedUser.gems).toBe(1); // Only second question was correct

      // Second attempt - first question now correct
      const response = await request(app)
        .post(`/api/quizzes/${pageQuiz._id}/submit`)
        .send({ answers: [0, 1] }) // Both correct
        .expect(200);

      expect(response.body.gemsEarned).toBe(1); // Only first question is new
      expect(response.body.totalGems).toBe(2);

      updatedUser = await User.findById(testUser._id);
      expect(updatedUser.gems).toBe(2);
      expect(updatedUser.earnedGems[0].questionIds).toHaveLength(2);
    });
  });
});
