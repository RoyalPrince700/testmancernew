import mongoose from 'mongoose';
import User from '../models/User.js';
import { config } from 'dotenv';

// Load environment variables
config();

const migrateUsersToGranularRoles = async () => {
  try {
    console.log('Starting M2.5 migration: Adding granular roles and assignment fields');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all users that don't have the new fields
    const usersToMigrate = await User.find({
      $or: [
        { assignedUniversities: { $exists: false } },
        { assignedFaculties: { $exists: false } }
      ]
    });

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    // Update each user to add the new fields with default values
    for (const user of usersToMigrate) {
      user.assignedUniversities = user.assignedUniversities || [];
      user.assignedFaculties = user.assignedFaculties || [];
      user.assignedLevels = user.assignedLevels || [];

      // Ensure role is valid (should already be from enum, but double-check)
      const validRoles = ['user', 'admin', 'subadmin', 'waec_admin', 'jamb_admin'];
      if (!validRoles.includes(user.role)) {
        console.warn(`User ${user._id} has invalid role '${user.role}', setting to 'user'`);
        user.role = 'user';
      }

      await user.save();
      console.log(`Migrated user: ${user.name} (${user.email})`);
    }

    console.log('Migration completed successfully');

    // Optional: Add some sample admin users for testing
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      console.log('No admin user found. You may want to manually set a user as admin using:');
      console.log('db.users.updateOne({email: "your-admin-email@example.com"}, {$set: {role: "admin"}})');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateUsersToGranularRoles().catch(console.error);
