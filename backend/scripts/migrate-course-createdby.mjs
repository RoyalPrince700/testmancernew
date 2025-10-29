import mongoose from 'mongoose';
import { config } from 'dotenv';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Load environment variables
config();

async function migrateCreatedBy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer');

    console.log('Starting migration of createdBy field...');

    // Get all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to migrate`);

    // Find admin user (or create default admin if doesn't exist)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // Try to find any admin user
      adminUser = await User.findOne({ role: 'admin' });
    }

    if (!adminUser) {
      console.log('No admin user found. Creating default admin user...');
      // Create a default admin user
      adminUser = new User({
        googleId: 'admin-default',
        email: 'admin@testmancer.com',
        name: 'Admin',
        username: 'admin',
        role: 'admin',
        university: 'System',
        faculty: 'Administration',
        department: 'System',
        level: 'Admin'
      });
      await adminUser.save();
      console.log('Default admin user created');
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const course of courses) {
      try {
        // If createdBy is already an ObjectId, skip
        if (course.createdBy && typeof course.createdBy === 'object' && course.createdBy._id) {
          continue;
        }

        // If createdBy is a string that looks like an ObjectId, try to use it
        if (course.createdBy && mongoose.Types.ObjectId.isValid(course.createdBy)) {
          course.createdBy = mongoose.Types.ObjectId(course.createdBy);
        } else {
          // Otherwise, set to admin user
          course.createdBy = adminUser._id;
        }

        await course.save();
        updatedCount++;
      } catch (error) {
        console.error(`Error updating course ${course._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Updated: ${updatedCount} courses`);
    console.log(`- Errors: ${errorCount} courses`);
    console.log(`- Total processed: ${courses.length} courses`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrateCreatedBy();
