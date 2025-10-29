const mongoose = require('mongoose');
const Course = require('./backend/models/Course');
const User = require('./backend/models/User');
require('dotenv').config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer');

    const courses = await Course.find().select('title description structure');
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`- ${course.title} (desc: ${course.description || 'none'})`);
    });

    const users = await User.find().select('name completedModules');
    console.log(`\nFound ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name}: ${user.completedModules.length} completed modules`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDB();
