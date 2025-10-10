import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import { uploadAudioFile, uploadVideoFile } from '../controllers/uploadController.js';

const router = express.Router();

// All upload routes require authentication and upload_media permission
router.use(protect);
router.use(requirePermission('upload_media'));

// Upload audio file
router.post('/audio', uploadAudioFile);

// Upload video file
router.post('/video', uploadVideoFile);

export default router;
