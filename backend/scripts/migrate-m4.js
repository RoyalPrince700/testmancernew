import mongoose from 'mongoose';
import User from '../models/User.js';
import { config } from 'dotenv';

// Load environment variables
config();

const migrateUsersToCompletionGems = async () => {
  try {
    console.log('Starting M4 migration: Adding completionGems field for tracking completion-specific gems');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all users that don't have the completionGems field
    const usersToMigrate = await User.find({
      completionGems: { $exists: false }
    });

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    // Update each user to add the completionGems field with default empty array
    for (const user of usersToMigrate) {
      user.completionGems = [];

      await user.save();
      console.log(`Migrated user: ${user.name} (${user.email}) - added completionGems field`);
    }

    console.log('Migration completed successfully - all users now have completionGems field');

    // Get some statistics
    const totalUsers = await User.countDocuments();
    const usersWithCompletionGems = await User.countDocuments({
      completionGems: { $exists: true }
    });

    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with completionGems field: ${usersWithCompletionGems}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateUsersToCompletionGems().catch(console.error);
