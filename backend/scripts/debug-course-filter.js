import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { config } from 'dotenv';

// Load environment variables
config();

const debugCourseFilter = async () => {
  try {
    console.log('🔍 Debugging Course Filtering...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer');
    console.log('✅ Connected to MongoDB\n');

    // Get all courses
    const allCourses = await Course.find();
    console.log(`📚 Total courses in database: ${allCourses.length}\n`);

    if (allCourses.length > 0) {
      console.log('Course details:');
      allCourses.forEach(course => {
        console.log(`\n- ${course.title} (${course.courseCode})`);
        console.log(`  Active: ${course.isActive}`);
        console.log(`  Audience:`, JSON.stringify(course.audience, null, 2));
      });
    }

    // Get all undergraduate users
    const undergraduates = await User.find({
      $or: [
        { isUndergraduate: true },
        { learningCategories: 'undergraduate' },
        { learningCategories: 'postutme' }
      ]
    });

    console.log(`\n\n👥 Found ${undergraduates.length} undergraduate user(s)\n`);

    for (const user of undergraduates) {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  University: ${user.university}`);
      console.log(`  Faculty: ${user.faculty}`);
      console.log(`  Department: ${user.department}`);
      console.log(`  Level: ${user.level}`);
      console.log(`  Learning Categories: ${user.learningCategories?.join(', ')}`);

      // Test the current filter logic
      const filter = { isActive: true };
      const shouldApplyAudienceScope = Boolean(user.isUndergraduate || user.learningCategories?.includes('undergraduate') || user.learningCategories?.includes('postutme'));
      
      console.log(`  Should apply audience scope: ${shouldApplyAudienceScope}`);

      if (shouldApplyAudienceScope) {
        const orConditions = [];

        // Public courses
        orConditions.push({ 
          $and: [
            { 'audience.universities': { $size: 0 } },
            { 'audience.faculties': { $size: 0 } },
            { 'audience.departments': { $size: 0 } },
            { 'audience.levels': { $size: 0 } }
          ]
        });

        // WRONG way (current bug)
        const wrongFilter = {
          $and: [
            { 'audience.universities': user.university },
            { 'audience.faculties': user.faculty },
            { 'audience.departments': user.department },
            { 'audience.levels': user.level }
          ]
        };

        // RIGHT way (fixed)
        const rightFilter = {
          $and: [
            { 'audience.universities': { $in: [user.university] } },
            { 'audience.faculties': { $in: [user.faculty] } },
            { 'audience.departments': { $in: [user.department] } },
            { 'audience.levels': { $in: [user.level] } }
          ]
        };

        console.log('\n  ❌ Wrong filter (current):');
        const wrongResults = await Course.find({ ...filter, $or: [wrongFilter] });
        console.log(`     Found ${wrongResults.length} courses`);

        console.log('\n  ✅ Right filter (fixed):');
        const rightResults = await Course.find({ ...filter, $or: [orConditions[0], rightFilter] });
        console.log(`     Found ${rightResults.length} courses`);
        
        if (rightResults.length > 0) {
          rightResults.forEach(course => {
            console.log(`     - ${course.title}`);
          });
        }
      }

      console.log('\n' + '='.repeat(80) + '\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
debugCourseFilter().catch(console.error);

