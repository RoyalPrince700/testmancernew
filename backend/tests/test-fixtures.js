// Test fixtures and mocks for comprehensive testing

const testUsers = {
  subadmin: {
    googleId: 'subadmin-test-id',
    email: 'subadmin@test.com',
    name: 'Test Subadmin',
    role: 'subadmin',
    assignedUniversities: ['Test University'],
    gems: 0
  },
  student: {
    googleId: 'student-test-id',
    email: 'student@test.com',
    name: 'Test Student',
    role: 'user',
    university: 'Test University',
    gems: 0
  },
  admin: {
    googleId: 'admin-test-id',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    gems: 0
  }
};

export const testCourses = {
  basic: {
    title: 'Basic Test Course',
    courseCode: 'BAS101',
    description: 'A basic course for testing',
    audience: {
      universities: ['Test University'],
      faculties: ['Computer Science'],
      levels: ['100 Level']
    },
    structure: {
      unitType: 'module',
      unitLabel: 'Module',
      unitCount: 3
    }
  },
  chapterBased: {
    title: 'Chapter-Based Course',
    courseCode: 'CHP101',
    description: 'A course organized by chapters',
    audience: {
      universities: ['Test University'],
      faculties: ['Mathematics'],
      levels: ['200 Level']
    },
    structure: {
      unitType: 'chapter',
      unitLabel: 'Chapter',
      unitCount: 5
    }
  },
  topicBased: {
    title: 'Topic-Based Course',
    courseCode: 'TOP101',
    description: 'A course organized by topics',
    audience: {
      universities: ['Test University'],
      faculties: ['Physics'],
      levels: ['300 Level']
    },
    structure: {
      unitType: 'topic',
      unitLabel: 'Topic',
      unitCount: 8
    }
  }
};

export const testModules = {
  intro: {
    title: 'Introduction Module',
    description: 'Basic introduction to the subject',
    order: 1,
    estimatedTime: 45,
    pages: [
      {
        title: 'Welcome',
        order: 1,
        html: '<h1>Welcome!</h1><p>This is the introduction page.</p>'
      },
      {
        title: 'Objectives',
        order: 2,
        html: '<h2>Learning Objectives</h2><ul><li>Understand basics</li><li>Learn concepts</li></ul>',
        audioUrl: 'https://example.com/audio/objectives.mp3'
      }
    ]
  },
  advanced: {
    title: 'Advanced Concepts',
    description: 'Deep dive into advanced topics',
    order: 2,
    estimatedTime: 90,
    pages: [
      {
        title: 'Complex Topics',
        order: 1,
        html: '<h1>Advanced Concepts</h1><p>This covers complex material.</p>',
        videoUrl: 'https://example.com/video/advanced.mp4',
        attachments: [
          {
            title: 'Reference Document',
            url: 'https://example.com/docs/reference.pdf',
            type: 'document'
          }
        ]
      }
    ]
  }
};

export const testQuizzes = {
  unitQuiz: {
    title: 'Unit Knowledge Check',
    description: 'Test your understanding of this unit',
    trigger: 'unit',
    questions: [
      {
        question: 'What is the primary concept covered in this unit?',
        options: ['Basic concept', 'Advanced concept', 'Wrong answer', 'Another wrong answer'],
        correctAnswer: 0,
        points: 1,
        explanation: 'The unit focuses on basic concepts as the foundation.'
      },
      {
        question: 'Which of these is NOT covered in this unit?',
        options: ['Key concept 1', 'Key concept 2', 'Unrelated topic', 'Key concept 3'],
        correctAnswer: 2,
        points: 1,
        explanation: 'The unrelated topic is covered in a different unit.'
      },
      {
        question: 'What is the expected outcome after completing this unit?',
        options: ['No understanding', 'Basic understanding', 'Complete confusion', 'Expert level'],
        correctAnswer: 1,
        points: 1
      }
    ],
    timeLimit: 20,
    passingScore: 70
  },
  pageQuiz: {
    title: 'Page Check',
    description: 'Quick quiz to reinforce page content',
    trigger: 'page',
    pageOrder: 1,
    questions: [
      {
        question: 'What was the main point of this page?',
        options: ['Introduction', 'Main content', 'Conclusion', 'References'],
        correctAnswer: 1,
        points: 1
      }
    ]
  },
  mixedAnswersQuiz: {
    title: 'Mixed Answers Quiz',
    description: 'Quiz for testing partial correct answers',
    trigger: 'unit',
    questions: [
      {
        question: 'Question 1?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        points: 1
      },
      {
        question: 'Question 2?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 1,
        points: 1
      },
      {
        question: 'Question 3?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 2,
        points: 1
      }
    ]
  }
};

export const testAnswers = {
  allCorrect: [0, 1, 2],
  partialCorrect: [0, 3, 2], // First and third correct, second wrong
  firstCorrectOnly: [0, 1, 3], // Only first correct
  secondCorrectOnly: [1, 1, 1], // Only second correct
  noneCorrect: [1, 0, 3], // All wrong
  singleCorrect: [1], // For single-question quizzes
  singleWrong: [0] // For single-question quizzes
};

// Mock functions for common test setup
export const mockAuth = {
  authenticateToken: (req, res, next) => {
    req.user = { userId: 'test-user-id' };
    next();
  },
  requirePermission: (permission) => (req, res, next) => next()
};

export const mockSubadminAuth = (userId) => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId };
    next();
  },
  requirePermission: (permission) => (req, res, next) => next()
});

// Helper function to create a test app with routes
export const createTestApp = (routes = []) => {
  const express = require('express');
  const app = express();
  app.use(express.json());

  routes.forEach(route => {
    app.use(route.path, route.router);
  });

  return app;
};

// Helper to clean up test data
export const cleanupCollections = async (collections = []) => {
  const mongoose = require('mongoose');
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

// Helper to setup test database connection
export const setupTestDB = async () => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer-test');
  }
};

// Helper to create course with modules and pages
export const createTestCourseWithContent = async (courseData, modules = []) => {
  const Course = require('../models/Course.js').default;

  const fullCourseData = {
    ...courseData,
    modules: modules.map(module => ({
      ...module,
      isActive: true,
      createdAt: new Date()
    }))
  };

  const course = new Course(fullCourseData);
  await course.save();
  return course;
};

// Helper to create quiz with proper associations
const createTestQuiz = async (quizData, courseId, moduleId) => {
  const Quiz = require('../models/Quiz.js');

  const fullQuizData = {
    ...quizData,
    courseId,
    moduleId,
    isActive: true,
    createdAt: new Date()
  };

  const quiz = new Quiz(fullQuizData);
  await quiz.save();
  return quiz;
};

module.exports = {
  testUsers,
  testCourses,
  testModules,
  testQuizzes,
  testAnswers,
  mockAuth,
  mockSubadminAuth,
  createTestApp,
  cleanupCollections,
  setupTestDB,
  createTestCourseWithContent,
  createTestQuiz
};
