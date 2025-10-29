import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables FIRST
dotenv.config();

console.log('Environment variables loaded:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? `SET (${process.env.CLOUDINARY_API_KEY.length} chars)` : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? `SET (${process.env.CLOUDINARY_API_SECRET.length} chars)` : 'NOT SET');

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary configuration...');

// Test Cloudinary connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Cloudinary connection test FAILED:', error.message);
    console.error('Full error:', error);
  } else {
    console.log('Cloudinary connection test SUCCESSFUL:', result);
  }
  process.exit(error ? 1 : 0);
});
