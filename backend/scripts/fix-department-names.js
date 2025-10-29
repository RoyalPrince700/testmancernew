import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { config } from 'dotenv';

config();

const fixDepartmentNames = async () => {
  try {
    console.log('🔧 Fixing department name mismatches...\n');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer');
    console.log('✅ Connected to MongoDB\n');

    // Update the course to use simplified department names
    const course = await Course.findOne({ courseCode: 'GNS 101' });
    
    if (course) {
      console.log(`📚 Course: ${course.title}`);
      console.log(`   Current departments: ${JSON.stringify(course.audience.departments)}`);
      
      // Update to simplified names matching user profiles
      course.audience.departments = ['Agronomy'];
      await course.save();
      
      console.log(`   ✅ Updated departments to: ${JSON.stringify(course.audience.departments)}\n`);
    }

    // Also update subadmin's assignedDepartments to match
    const subadmin = await User.findOne({ 
      role: 'subadmin',
      email: 'royalprincecube@gmail.com'
    });

    if (subadmin) {
      console.log(`👤 Subadmin: ${subadmin.name}`);
      console.log(`   Current assignedDepartments: ${JSON.stringify(subadmin.assignedDepartments)}`);
      
      subadmin.assignedDepartments = ['Agronomy'];
      await subadmin.save();
      
      console.log(`   ✅ Updated assignedDepartments to: ${JSON.stringify(subadmin.assignedDepartments)}\n`);
    }

    console.log('✅ Department names standardized!');
    console.log('\nℹ️  Recommendation: Use consistent naming across the system.');
    console.log('   Either use full names like "Department of Agronomy"');
    console.log('   OR simplified names like "Agronomy" everywhere.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fixDepartmentNames().catch(console.error);

