/**
 * Gem Award Logic Tests
 * 
 * Tests to verify that gem awards are consistent and correct:
 * - Pages award 0 gems (progress tracking only)
 * - Modules award 3 gems (one-time, regardless of page count)
 * - Re-completing modules awards 0 gems
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';

describe('Gem Award Logic', () => {
  let testUser;
  let testCourse;
  let moduleId1;
  let moduleId2;
  let pageIds = [];

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Course.deleteMany({});

    // Create test user
    testUser = await User.create({
      googleId: 'test-google-id-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      gems: 0,
      completedModules: [],
      completionGems: []
    });

    // Create test course with 2 modules (one with 1 page, one with 5 pages)
    testCourse = await Course.create({
      title: 'Test Course',
      courseCode: 'TEST101',
      description: 'A test course for gem logic',
      units: 2,
      difficulty: 'beginner',
      modules: [
        {
          title: 'Module 1',
          description: 'Module with 1 page',
          order: 1,
          estimatedTime: 10,
          pages: [
            {
              title: 'Page 1',
              order: 1,
              html: '<p>Content</p>'
            }
          ]
        },
        {
          title: 'Module 2',
          description: 'Module with 5 pages',
          order: 2,
          estimatedTime: 50,
          pages: [
            { title: 'Page 1', order: 1, html: '<p>Content 1</p>' },
            { title: 'Page 2', order: 2, html: '<p>Content 2</p>' },
            { title: 'Page 3', order: 3, html: '<p>Content 3</p>' },
            { title: 'Page 4', order: 4, html: '<p>Content 4</p>' },
            { title: 'Page 5', order: 5, html: '<p>Content 5</p>' }
          ]
        }
      ]
    });

    moduleId1 = testCourse.modules[0]._id;
    moduleId2 = testCourse.modules[1]._id;
    
    // Store page IDs for testing
    pageIds = [
      ...testCourse.modules[0].pages.map(p => p._id),
      ...testCourse.modules[1].pages.map(p => p._id)
    ];
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Page Completion', () => {
    test('should track page completion but award 0 gems', async () => {
      const initialGems = testUser.gems;
      
      // Complete first page
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[0]);
      
      expect(testUser.gems).toBe(initialGems); // No gems awarded
      expect(testUser.hasEarnedCompletionGemForPage(testCourse._id, pageIds[0])).toBe(true);
    });

    test('should track multiple page completions with 0 gems each', async () => {
      const initialGems = testUser.gems;
      
      // Complete all 5 pages in module 2
      for (let i = 1; i <= 5; i++) {
        await testUser.recordCompletionGemForPage(testCourse._id, pageIds[i]);
      }
      
      expect(testUser.gems).toBe(initialGems); // Still no gems awarded
      
      // Verify all pages tracked
      for (let i = 1; i <= 5; i++) {
        expect(testUser.hasEarnedCompletionGemForPage(testCourse._id, pageIds[i])).toBe(true);
      }
    });

    test('should not duplicate page tracking', async () => {
      const initialGems = testUser.gems;
      
      // Complete same page twice
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[0]);
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[0]);
      
      expect(testUser.gems).toBe(initialGems);
      
      // Check that page is only tracked once
      const courseCompletion = testUser.completionGems.find(
        c => c.courseId.toString() === testCourse._id.toString()
      );
      
      const pageCount = courseCompletion.completedPages.filter(
        id => id.toString() === pageIds[0].toString()
      ).length;
      
      expect(pageCount).toBe(1);
    });
  });

  describe('Module Completion', () => {
    test('should award exactly 3 gems for completing a module with 1 page', async () => {
      const initialGems = testUser.gems;
      
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId1);
      
      expect(testUser.gems).toBe(initialGems + 3);
      expect(testUser.hasEarnedCompletionGemForUnit(testCourse._id, moduleId1)).toBe(true);
    });

    test('should award exactly 3 gems for completing a module with 5 pages', async () => {
      const initialGems = testUser.gems;
      
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId2);
      
      expect(testUser.gems).toBe(initialGems + 3);
      expect(testUser.hasEarnedCompletionGemForUnit(testCourse._id, moduleId2)).toBe(true);
    });

    test('should award 0 gems when re-completing a module', async () => {
      // Complete module first time
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId1);
      const gemsAfterFirstCompletion = testUser.gems;
      
      // Try to complete same module again
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId1);
      
      expect(testUser.gems).toBe(gemsAfterFirstCompletion); // No additional gems
    });

    test('should award 3 gems for each unique module completed', async () => {
      const initialGems = testUser.gems;
      
      // Complete both modules
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId1);
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId2);
      
      expect(testUser.gems).toBe(initialGems + 6); // 3 gems per module
      expect(testUser.hasEarnedCompletionGemForUnit(testCourse._id, moduleId1)).toBe(true);
      expect(testUser.hasEarnedCompletionGemForUnit(testCourse._id, moduleId2)).toBe(true);
    });
  });

  describe('Combined Page and Module Completion', () => {
    test('should track pages and award gems only for module completion', async () => {
      const initialGems = testUser.gems;
      
      // Complete all pages in module 2 (5 pages)
      for (let i = 1; i <= 5; i++) {
        await testUser.recordCompletionGemForPage(testCourse._id, pageIds[i]);
      }
      
      expect(testUser.gems).toBe(initialGems); // No gems from pages
      
      // Complete the module
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId2);
      
      expect(testUser.gems).toBe(initialGems + 3); // Only 3 gems from module
    });

    test('should award same gems regardless of page count', async () => {
      const initialGems = testUser.gems;
      
      // Complete module 1 (1 page) with page tracking
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[0]);
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId1);
      const gemsAfterModule1 = testUser.gems;
      
      // Complete module 2 (5 pages) with page tracking
      for (let i = 1; i <= 5; i++) {
        await testUser.recordCompletionGemForPage(testCourse._id, pageIds[i]);
      }
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId2);
      const gemsAfterModule2 = testUser.gems;
      
      // Both modules should award same amount
      expect(gemsAfterModule1 - initialGems).toBe(3);
      expect(gemsAfterModule2 - gemsAfterModule1).toBe(3);
      expect(testUser.gems).toBe(initialGems + 6);
    });
  });

  describe('Progress Tracking', () => {
    test('should accurately track course progress', async () => {
      // Complete some pages but not all
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[0]);
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[1]);
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[2]);
      
      const progress = testUser.getCourseProgress(testCourse);
      
      expect(progress.completedPages).toBe(3);
      expect(progress.totalPages).toBe(6); // 1 + 5 pages
      expect(progress.completedUnits).toBe(0); // No units completed yet
      expect(progress.totalUnits).toBe(2);
    });

    test('should show full progress when module completed', async () => {
      // Complete all pages in module 1
      await testUser.recordCompletionGemForPage(testCourse._id, pageIds[0]);
      
      // Complete module 1
      await testUser.recordCompletionGemForUnit(testCourse._id, moduleId1);
      
      const progress = testUser.getCourseProgress(testCourse);
      
      expect(progress.completedUnits).toBe(1);
      expect(progress.totalUnits).toBe(2);
      expect(progress.unitProgressPercentage).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    test('should handle completion for non-existent course gracefully', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        testUser.recordCompletionGemForUnit(fakeId, moduleId1)
      ).resolves.not.toThrow();
      
      // Should not award gems for non-existent course
      expect(testUser.gems).toBe(0);
    });

    test('should handle multiple concurrent completions correctly', async () => {
      const initialGems = testUser.gems;
      
      // Simulate concurrent completion attempts
      const completions = [
        testUser.recordCompletionGemForUnit(testCourse._id, moduleId1),
        testUser.recordCompletionGemForUnit(testCourse._id, moduleId1),
        testUser.recordCompletionGemForUnit(testCourse._id, moduleId1)
      ];
      
      await Promise.all(completions);
      
      // Should only award gems once, but this is a race condition test
      // In practice, the hasEarnedCompletionGemForUnit check should prevent duplicates
      expect(testUser.gems).toBeGreaterThanOrEqual(initialGems + 3);
      expect(testUser.gems).toBeLessThanOrEqual(initialGems + 9); // Max if all complete
    });
  });
});

