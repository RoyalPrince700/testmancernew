const mongoose = require('mongoose');
const Course = require('./backend/models/Course.js');

async function checkCourse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer');

    // Check if course exists
    const course = await Course.findById('68e97e4d69a94fb7cc22dd49');
    console.log('Course exists:', !!course);
    if (course) {
      console.log('Course title:', course.title);
      console.log('Course ID:', course._id);
      console.log('Is Active:', course.isActive);
    } else {
      console.log('Course not found in database');
    }

    // Also check all courses
    const allCourses = await Course.find({}).limit(5);
    console.log('Total courses in DB:', allCourses.length);
    if (allCourses.length > 0) {
      console.log('Sample courses:');
      allCourses.forEach(c => console.log(`- ${c._id}: ${c.title}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCourse();