import mongoose from 'mongoose';
import User from '../models/User.js';
import { config } from 'dotenv';

// Load environment variables
config();

const updateSubadminDepartments = async () => {
  try {
    console.log('Checking subadmin users for assignedDepartments field...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testmancer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Find all subadmin users
    const subadmins = await User.find({ role: 'subadmin' });

    console.log(`Found ${subadmins.length} subadmin user(s)\n`);

    if (subadmins.length === 0) {
      console.log('No subadmin users found in the database.');
      return;
    }

    // Check and update each subadmin
    for (const subadmin of subadmins) {
      console.log(`Subadmin: ${subadmin.name} (${subadmin.email})`);
      console.log(`  - Universities: ${subadmin.assignedUniversities?.join(', ') || 'None'}`);
      console.log(`  - Faculties: ${subadmin.assignedFaculties?.join(', ') || 'None'}`);
      console.log(`  - Departments: ${subadmin.assignedDepartments?.join(', ') || 'None'}`);
      console.log(`  - Levels: ${subadmin.assignedLevels?.join(', ') || 'None'}`);

      if (!subadmin.assignedDepartments) {
        console.log('  ⚠️  Missing assignedDepartments field - adding empty array...');
        subadmin.assignedDepartments = [];
        await subadmin.save();
        console.log('  ✅ Added assignedDepartments field\n');
      } else {
        console.log('  ✅ assignedDepartments field already exists\n');
      }
    }

    console.log('Update completed!\n');
    console.log('⚠️  IMPORTANT: You need to manually assign departments to subadmins.');
    console.log('   Run this command in MongoDB shell or Compass:\n');
    console.log('   db.users.updateOne(');
    console.log('     { email: "subadmin@example.com" },');
    console.log('     { $set: { assignedDepartments: ["Animal Science"] } }');
    console.log('   )\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
updateSubadminDepartments().catch(console.error);

