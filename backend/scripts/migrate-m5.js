import mongoose from 'mongoose';
import Course from '../models/Course.js';
import { config } from 'dotenv';

// Load environment variables
config();

const migrateCoursesToIncludeDepartments = async () => {
  try {
    console.log('Starting M5 migration: Adding departments field to course audience');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all courses that don't have the departments field in audience
    const coursesToMigrate = await Course.find({
      'audience.departments': { $exists: false }
    });

    console.log(`Found ${coursesToMigrate.length} courses to migrate`);

    // Update each course to add the departments field with default empty array
    for (const course of coursesToMigrate) {
      if (!course.audience) {
        course.audience = {
          universities: [],
          faculties: [],
          departments: [],
          levels: []
        };
      } else {
        course.audience.departments = [];
      }

      await course.save();
      console.log(`Migrated course: ${course.title} (${course.courseCode}) - added departments field`);
    }

    console.log('Migration completed successfully - all courses now have departments field in audience');

    // Get some statistics
    const totalCourses = await Course.countDocuments();
    const coursesWithDepartments = await Course.countDocuments({
      'audience.departments': { $exists: true }
    });

    console.log(`Total courses: ${totalCourses}`);
    console.log(`Courses with departments field: ${coursesWithDepartments}`);

    // Show sample of courses
    const sampleCourses = await Course.find().limit(3);
    console.log('\nSample courses after migration:');
    sampleCourses.forEach(course => {
      console.log(`- ${course.title} (${course.courseCode})`);
      console.log(`  Audience:`, JSON.stringify(course.audience, null, 2));
    });

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the migration
migrateCoursesToIncludeDepartments().catch(console.error);

