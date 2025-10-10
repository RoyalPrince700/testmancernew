import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const migrateM0 = async () => {
  try {
    console.log('Starting M0 migration...');

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Migration 1: Update learningCategories from 'post-utme' to 'postutme'
    console.log('Updating learningCategories from "post-utme" to "postutme"...');
    const result1 = await User.updateMany(
      { learningCategories: 'post-utme' },
      { $set: { 'learningCategories.$': 'postutme' } }
    );
    console.log(`Updated ${result1.modifiedCount} user documents for category normalization`);

    // Migration 2: Add role field to existing users (will use default 'user')
    console.log('Ensuring all users have role field...');
    const result2 = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    console.log(`Added role field to ${result2.modifiedCount} user documents`);

    // Verification: Check that migration worked
    const usersWithOldCategory = await User.countDocuments({ learningCategories: 'post-utme' });
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });

    console.log('Migration verification:');
    console.log(`- Users with old 'post-utme' category: ${usersWithOldCategory}`);
    console.log(`- Users without role field: ${usersWithoutRole}`);

    if (usersWithOldCategory === 0 && usersWithoutRole === 0) {
      console.log('✅ M0 migration completed successfully!');
    } else {
      console.log('⚠️  Migration may have issues - please verify manually');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateM0();
