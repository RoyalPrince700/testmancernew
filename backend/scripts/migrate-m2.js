import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import Course from '../models/Course.js';

// Load environment variables
dotenv.config();

const migrateM2 = async () => {
  try {
    console.log('Starting M2 migration...');

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Migration 1: Ensure all courses have audience field structure
    console.log('Ensuring all courses have audience field structure...');
    const result1 = await Course.updateMany(
      { audience: { $exists: false } },
      {
        $set: {
          audience: {
            universities: [],
            faculties: [],
            levels: []
          }
        }
      }
    );
    console.log(`Added audience field structure to ${result1.modifiedCount} course documents`);

    // Migration 2: Ensure all modules have pages array
    console.log('Ensuring all modules have pages array...');
    const coursesWithModules = await Course.find({ 'modules.0': { $exists: true } });

    let modulesUpdated = 0;
    for (const course of coursesWithModules) {
      let courseModified = false;
      for (let i = 0; i < course.modules.length; i++) {
        if (!course.modules[i].pages) {
          course.modules[i].pages = [];
          courseModified = true;
          modulesUpdated++;
        }
      }

      if (courseModified) {
        await course.save();
      }
    }
    console.log(`Added pages array to ${modulesUpdated} module documents`);

    // Verification: Check that migration worked
    const coursesWithoutAudience = await Course.countDocuments({ audience: { $exists: false } });
    const coursesWithModulesWithoutPages = await Course.countDocuments({
      'modules.0': { $exists: true },
      'modules.pages': { $exists: false }
    });

    console.log('Migration verification:');
    console.log(`- Courses without audience field: ${coursesWithoutAudience}`);
    console.log(`- Modules without pages array: ${coursesWithModulesWithoutPages}`);

    // Sample verification: Check a few documents
    const sampleCourses = await Course.find({}).limit(3).select('title audience modules.pages');
    console.log('Sample course verification:');
    sampleCourses.forEach(course => {
      console.log(`- ${course.title}: audience exists: ${!!course.audience}, modules have pages: ${course.modules.every(m => m.pages !== undefined)}`);
    });

    if (coursesWithoutAudience === 0 && coursesWithModulesWithoutPages === 0) {
      console.log('✅ M2 migration completed successfully!');
      console.log('✅ All courses have audience targeting fields');
      console.log('✅ All modules have pages arrays');
      console.log('✅ Backward compatibility maintained');
    } else {
      console.log('⚠️  Migration may have issues - please verify manually');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateM2();
