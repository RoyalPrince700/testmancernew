import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { config } from 'dotenv';

// Load environment variables
config();

const MIGRATION_NAME = 'm1-structure-and-gems';

async function migrate() {
  try {
    console.log(`Starting migration: ${MIGRATION_NAME}`);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Migration 1: Add structure field to existing courses
    console.log('Phase 1: Updating course structure fields...');

    const coursesWithoutStructure = await Course.find({ structure: { $exists: false } });
    let updatedCoursesCount = 0;

    for (const course of coursesWithoutStructure) {
      const unitCount = course.modules ? course.modules.length : 0;
      course.structure = {
        unitType: 'module',
        unitLabel: 'Module',
        unitCount: Math.max(unitCount, 1) // Ensure at least 1
      };
      await course.save();
      updatedCoursesCount++;
    }

    console.log(`Updated ${updatedCoursesCount} courses with structure metadata`);

    // Migration 2: Remove/null module content fields (optional, but clean up)
    console.log('Phase 2: Cleaning up module content fields...');

    const moduleContentUpdateResult = await Course.updateMany(
      { 'modules.content': { $exists: true } },
      {
        $unset: {
          'modules.$[].content': ''
        }
      }
    );

    console.log(`Cleaned up module content in ${moduleContentUpdateResult.modifiedCount} courses`);

    // Migration 3: Add trigger field to existing quizzes
    console.log('Phase 3: Updating quiz trigger fields...');

    const quizUpdateResult = await Quiz.updateMany(
      { trigger: { $exists: false } },
      {
        $set: {
          trigger: 'unit'
        }
      }
    );

    console.log(`Updated ${quizUpdateResult.modifiedCount} quizzes with trigger field`);

    // Migration 4: Add earnedGems array to existing users (if not exists)
    console.log('Phase 4: Adding earnedGems tracking to users...');

    const userUpdateResult = await User.updateMany(
      { earnedGems: { $exists: false } },
      {
        $set: {
          earnedGems: []
        }
      }
    );

    console.log(`Updated ${userUpdateResult.modifiedCount} users with earnedGems array`);

    // Verification
    console.log('\nMigration verification:');

    const coursesWithStructure = await Course.countDocuments({
      structure: { $exists: true }
    });
    console.log(`Courses with structure field: ${coursesWithStructure}`);

    const quizzesWithTrigger = await Quiz.countDocuments({
      trigger: { $exists: true }
    });
    console.log(`Quizzes with trigger field: ${quizzesWithTrigger}`);

    const usersWithEarnedGems = await User.countDocuments({
      earnedGems: { $exists: true }
    });
    console.log(`Users with earnedGems field: ${usersWithEarnedGems}`);

    console.log(`\nMigration ${MIGRATION_NAME} completed successfully!`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration if called directly
if (process.argv[1].endsWith('migrate-m1.js')) {
  migrate();
}

export default migrate;
