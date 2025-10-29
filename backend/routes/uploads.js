import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect, requirePermission } from '../middleware/auth.js';
import { uploadAudioFile, uploadVideoFile, uploadPdfFile, uploadDocumentFile } from '../controllers/uploadController.js';

const router = express.Router();

// Rate limiting for uploads (10 uploads per hour per user)
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 uploads per windowMs
  message: {
    error: 'Upload rate limit exceeded',
    message: 'Too many uploads. Please try again in an hour.',
    retryAfter: '3600' // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.userId // Rate limit by user ID
});

// All upload routes require authentication and upload_media permission
router.use(protect);
router.use(requirePermission('upload_media'));
router.use(uploadRateLimit);

// Upload audio file
router.post('/audio', uploadAudioFile);

// Upload video file
router.post('/video', uploadVideoFile);

// Upload PDF file
router.post('/pdf', uploadPdfFile);

// Upload document file
router.post('/document', uploadDocumentFile);

export default router;
