const mongoose = require('mongoose');
const Course = require('../models/Course.js');
const Quiz = require('../models/Quiz.js');
const User = require('../models/User.js');

describe('Model Structure Tests', () => {
  beforeEach(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer-test');
    }
  });

  afterEach(async () => {
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Course Model - Structure Field', () => {
    it('should create course with structure field', async () => {
      const courseData = {
        title: 'Test Course',
        courseCode: 'TEST101',
        description: 'Test course description',
        audience: { universities: ['Test University'] },
        structure: {
          unitType: 'chapter',
          unitLabel: 'Chapter',
          unitCount: 5
        }
      };

      const course = new Course(courseData);
      await course.save();

      const savedCourse = await Course.findById(course._id);
      expect(savedCourse.structure.unitType).toBe('chapter');
      expect(savedCourse.structure.unitLabel).toBe('Chapter');
      expect(savedCourse.structure.unitCount).toBe(5);
    });

    it('should use default structure values', async () => {
      const courseData = {
        title: 'Test Course',
        courseCode: 'TEST102',
        description: 'Test course description',
        audience: { universities: ['Test University'] }
      };

      const course = new Course(courseData);
      await course.save();

      const savedCourse = await Course.findById(course._id);
      expect(savedCourse.structure.unitType).toBe('module');
      expect(savedCourse.structure.unitLabel).toBe('Module');
      expect(savedCourse.structure.unitCount).toBe(1);
    });

    it('should validate unitType enum', async () => {
      const courseData = {
        title: 'Test Course',
        courseCode: 'TEST103',
        description: 'Test course description',
        structure: {
          unitType: 'invalid_type',
          unitLabel: 'Chapter',
          unitCount: 5
        }
      };

      const course = new Course(courseData);
      let error;
      try {
        await course.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors['structure.unitType']).toBeDefined();
    });

    it('should validate unitCount min/max', async () => {
      const courseData = {
        title: 'Test Course',
        courseCode: 'TEST104',
        description: 'Test course description',
        structure: {
          unitType: 'chapter',
          unitLabel: 'Chapter',
          unitCount: 150 // Exceeds max of 100
        }
      };

      const course = new Course(courseData);
      let error;
      try {
        await course.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors['structure.unitCount']).toBeDefined();
    });
  });

  describe('Quiz Model - Trigger and PageOrder', () => {
    let testCourse;
    let testModule;

    beforeEach(async () => {
      testCourse = new Course({
        title: 'Test Course',
        courseCode: 'TEST201',
        description: 'Test course description',
        modules: [{
          title: 'Test Module',
          description: 'Test module description',
          order: 1,
          estimatedTime: 30
        }]
      });
      await testCourse.save();
      testModule = testCourse.modules[0];
    });

    it('should create unit-triggered quiz', async () => {
      const quizData = {
        title: 'Unit Quiz',
        description: 'Test unit quiz',
        courseId: testCourse._id,
        trigger: 'unit',
        moduleId: testModule._id,
        questions: [{
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0
        }]
      };

      const quiz = new Quiz(quizData);
      await quiz.save();

      const savedQuiz = await Quiz.findById(quiz._id);
      expect(savedQuiz.trigger).toBe('unit');
      expect(savedQuiz.moduleId.toString()).toBe(testModule._id.toString());
      expect(savedQuiz.pageOrder).toBeUndefined();
    });

    it('should create page-triggered quiz', async () => {
      const quizData = {
        title: 'Page Quiz',
        description: 'Test page quiz',
        courseId: testCourse._id,
        trigger: 'page',
        moduleId: testModule._id,
        pageOrder: 2,
        questions: [{
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0
        }]
      };

      const quiz = new Quiz(quizData);
      await quiz.save();

      const savedQuiz = await Quiz.findById(quiz._id);
      expect(savedQuiz.trigger).toBe('page');
      expect(savedQuiz.moduleId.toString()).toBe(testModule._id.toString());
      expect(savedQuiz.pageOrder).toBe(2);
    });

    it('should validate trigger enum', async () => {
      const quizData = {
        title: 'Invalid Quiz',
        description: 'Test invalid quiz',
        courseId: testCourse._id,
        trigger: 'invalid_trigger',
        questions: [{
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0
        }]
      };

      const quiz = new Quiz(quizData);
      let error;
      try {
        await quiz.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.trigger).toBeDefined();
    });

    it('should require moduleId for unit trigger', async () => {
      const quizData = {
        title: 'Unit Quiz Without Module',
        description: 'Test unit quiz without moduleId',
        courseId: testCourse._id,
        trigger: 'unit',
        questions: [{
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0
        }]
      };

      const quiz = new Quiz(quizData);
      let error;
      try {
        await quiz.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.moduleId).toBeDefined();
    });

    it('should require pageOrder for page trigger', async () => {
      const quizData = {
        title: 'Page Quiz Without PageOrder',
        description: 'Test page quiz without pageOrder',
        courseId: testCourse._id,
        trigger: 'page',
        moduleId: testModule._id,
        questions: [{
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0
        }]
      };

      const quiz = new Quiz(quizData);
      let error;
      try {
        await quiz.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.pageOrder).toBeDefined();
    });
  });

  describe('User Model - EarnedGems Structure', () => {
    it('should track earned gems per quiz', async () => {
      const user = new User({
        googleId: 'test-google-id',
        email: 'test@example.com',
        name: 'Test User',
        gems: 0
      });
      await user.save();

      const quizId = new mongoose.Types.ObjectId();
      const questionIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ];

      await user.recordEarnedGems(quizId, questionIds);

      const savedUser = await User.findById(user._id);
      expect(savedUser.earnedGems).toHaveLength(1);
      expect(savedUser.earnedGems[0].quizId.toString()).toBe(quizId.toString());
      expect(savedUser.earnedGems[0].questionIds).toHaveLength(2);
    });

    it('should check if gem earned for specific question', async () => {
      const user = new User({
        googleId: 'test-google-id-2',
        email: 'test2@example.com',
        name: 'Test User 2',
        gems: 0
      });
      await user.save();

      const quizId = new mongoose.Types.ObjectId();
      const questionId = new mongoose.Types.ObjectId();

      // Initially not earned
      expect(user.hasEarnedGemForQuestion(quizId, questionId)).toBe(false);

      // After recording
      await user.recordEarnedGems(quizId, [questionId]);
      expect(user.hasEarnedGemForQuestion(quizId, questionId)).toBe(true);

      // Different quiz
      const differentQuizId = new mongoose.Types.ObjectId();
      expect(user.hasEarnedGemForQuestion(differentQuizId, questionId)).toBe(false);
    });

    it('should not duplicate question IDs in earnedGems', async () => {
      const user = new User({
        googleId: 'test-google-id-3',
        email: 'test3@example.com',
        name: 'Test User 3',
        gems: 0
      });
      await user.save();

      const quizId = new mongoose.Types.ObjectId();
      const questionId = new mongoose.Types.ObjectId();

      await user.recordEarnedGems(quizId, [questionId]);
      await user.recordEarnedGems(quizId, [questionId]); // Try to record again

      const savedUser = await User.findById(user._id);
      expect(savedUser.earnedGems[0].questionIds).toHaveLength(1);
    });
  });
});
