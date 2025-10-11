import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import quizRoutes from '../routes/quizzes.js';
import { authenticateToken } from '../middleware/auth.js';

// Mock auth middleware for testing
jest.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 'test-user-id' };
    next();
  },
  requirePermission: () => (req, res, next) => next()
}));

describe('Quiz Submission with Gem Logic', () => {
  let app;
  let testUser;
  let testQuiz;
  let testCourse;

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
      courseCode: 'TEST101',
      description: 'Test course description',
      audience: { universities: ['Test University'] }
    });
    await testCourse.save();

    testUser = new User({
      googleId: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User',
      gems: 0
    });
    await testUser.save();

    testQuiz = new Quiz({
      title: 'Test Quiz',
      description: 'Test quiz description',
      courseId: testCourse._id,
      questions: [
        {
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1, // Index 1 = '4'
          points: 1
        },
        {
          question: 'What is 3+3?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 1, // Index 1 = '6'
          points: 1
        },
        {
          question: 'What is 4+4?',
          options: ['7', '8', '9', '10'],
          correctAnswer: 1, // Index 1 = '8'
          points: 1
        }
      ],
      trigger: 'unit',
      moduleId: new mongoose.Types.ObjectId()
    });
    await testQuiz.save();

    // Mock the authenticateToken to set the correct user
    authenticateToken.mockImplementation((req, res, next) => {
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

  describe('First quiz attempt', () => {
    it('should award gems for all correct answers on first attempt', async () => {
      const answers = [1, 1, 1]; // All correct

      const response = await request(app)
        .post(`/api/quizzes/${testQuiz._id}/submit`)
        .send({ answers })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.correctAnswers).toBe(3);
      expect(response.body.gemsEarned).toBe(3); // 3 gems for 3 correct answers
      expect(response.body.totalGems).toBe(3);

      // Verify user was updated in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.gems).toBe(3);
      expect(updatedUser.earnedGems).toHaveLength(1);
      expect(updatedUser.earnedGems[0].questionIds).toHaveLength(3);
      expect(updatedUser.quizHistory).toHaveLength(1);
    });

    it('should award gems only for correct answers', async () => {
      const answers = [1, 0, 1]; // First and third correct, second wrong

      const response = await request(app)
        .post(`/api/quizzes/${testQuiz._id}/submit`)
        .send({ answers })
        .expect(200);

      expect(response.body.score).toBe(67); // Math.round((2/3)*100)
      expect(response.body.correctAnswers).toBe(2);
      expect(response.body.gemsEarned).toBe(2); // 2 gems for 2 correct answers
      expect(response.body.totalGems).toBe(2);
    });
  });

  describe('Repeat quiz attempts', () => {
    beforeEach(async () => {
      // First attempt - get all correct
      await request(app)
        .post(`/api/quizzes/${testQuiz._id}/submit`)
        .send({ answers: [1, 1, 1] });
    });

    it('should not award additional gems for previously correct questions', async () => {
      // Second attempt - all correct again, but should get 0 gems
      const response = await request(app)
        .post(`/api/quizzes/${testQuiz._id}/submit`)
        .send({ answers: [1, 1, 1] })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.correctAnswers).toBe(3);
      expect(response.body.gemsEarned).toBe(0); // No new gems
      expect(response.body.totalGems).toBe(3); // Still 3 total gems
    });

    it('should award gems only for newly correct questions', async () => {
      // Add a new question to the quiz
      const newQuestionId = new mongoose.Types.ObjectId();
      testQuiz.questions.push({
        question: 'What is 5+5?',
        options: ['9', '10', '11', '12'],
        correctAnswer: 1,
        points: 1,
        _id: newQuestionId
      });
      await testQuiz.save();

      // Second attempt with new correct answer
      const answers = [1, 1, 1, 1]; // All correct including new question

      const response = await request(app)
        .post(`/api/quizzes/${testQuiz._id}/submit`)
        .send({ answers })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.correctAnswers).toBe(4);
      expect(response.body.gemsEarned).toBe(1); // Only 1 gem for the new question
      expect(response.body.totalGems).toBe(4); // 3 + 1 = 4 total gems

      // Verify earnedGems was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.earnedGems[0].questionIds).toHaveLength(4);
    });
  });

  describe('Mixed attempts', () => {
    it('should handle partial correct answers across attempts', async () => {
      // First attempt: only first question correct
      await request(app)
        .post(`/api/quizzes/${testQuiz._id}/submit`)
        .send({ answers: [1, 0, 0] }); // Only first correct

      let updatedUser = await User.findById(testUser._id);
      expect(updatedUser.gems).toBe(1);
      expect(updatedUser.earnedGems[0].questionIds).toHaveLength(1);

      // Second attempt: first and second correct
      const response = await request(app)
        .post(`/api/quizzes/${testQuiz._id}/submit`)
        .send({ answers: [1, 1, 0] }) // First and second correct
        .expect(200);

      expect(response.body.gemsEarned).toBe(1); // Only second question is new
      expect(response.body.totalGems).toBe(2); // 1 + 1 = 2

      updatedUser = await User.findById(testUser._id);
      expect(updatedUser.gems).toBe(2);
      expect(updatedUser.earnedGems[0].questionIds).toHaveLength(2);
      expect(updatedUser.quizHistory).toHaveLength(2);
    });
  });
});
