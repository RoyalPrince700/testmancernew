import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { markUnitComplete } from '../services/progressService.js';
import { config } from 'dotenv';

// Load environment variables
config();

const testCompletionFix = async () => {
  try {
    console.log('Testing completion fix...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create test user
    const timestamp = Date.now();
    const testUser = await User.create({
      googleId: 'test-completion-' + timestamp,
      email: `test-completion-${timestamp}@example.com`,
      name: 'Test Completion User',
      gems: 0,
      completedModules: [],
      completionGems: []
    });

    // Create test course with a module
    const testCourse = await Course.create({
      title: 'Test Completion Course',
      courseCode: `TC${timestamp.toString().slice(-6)}`,
      description: 'A test course for completion fix',
      units: 1,
      structure: {
        unitType: 'chapter',
        unitLabel: 'Chapter',
        unitCount: 1
      },
      modules: [{
        title: 'Test Chapter 1',
        description: 'Test chapter for completion',
        order: 1,
        estimatedTime: 30,
        pages: [{
          title: 'Page 1',
          order: 1,
          html: '<p>Test page content</p>'
        }],
        isPublished: true
      }],
      audience: {
        universities: [],
        faculties: [],
        departments: [],
        levels: []
      },
      createdBy: testUser._id
    });

    console.log('Created test user and course');

    const moduleId = testCourse.modules[0]._id;
    console.log(`Testing completion for module: ${moduleId}`);

    // First completion attempt
    console.log('First completion attempt...');
    const result1 = await markUnitComplete({
      userId: testUser._id,
      courseId: testCourse._id,
      unitId: moduleId
    });

    console.log('First attempt result:', {
      ok: result1.ok,
      status: result1.status,
      message: result1.message,
      gemsAwarded: result1.gemsAwarded,
      totalGems: result1.totalGems
    });

    // Check if completion was saved
    const updatedUser = await User.findById(testUser._id);
    console.log('User after first attempt:', {
      gems: updatedUser.gems,
      completedModulesCount: updatedUser.completedModules.length,
      completionGemsCount: updatedUser.completionGems.length,
      completionGems: updatedUser.completionGems,
      hasCompletion: updatedUser.hasEarnedCompletionGemForUnit(testCourse._id, moduleId)
    });

    // Second completion attempt (should be idempotent)
    console.log('Second completion attempt...');
    const result2 = await markUnitComplete({
      userId: testUser._id,
      courseId: testCourse._id,
      unitId: moduleId
    });

    console.log('Second attempt result:', {
      ok: result2.ok,
      status: result2.status,
      message: result2.message,
      gemsAwarded: result2.gemsAwarded,
      totalGems: result2.totalGems
    });

    // Final check
    const finalUser = await User.findById(testUser._id);
    console.log('Final user state:', {
      gems: finalUser.gems,
      completedModulesCount: finalUser.completedModules.length,
      completionGemsCount: finalUser.completionGems.length,
      completionGems: finalUser.completionGems,
      hasCompletion: finalUser.hasEarnedCompletionGemForUnit(testCourse._id, moduleId)
    });

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    await Course.findByIdAndDelete(testCourse._id);

    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
testCompletionFix().catch(console.error);
