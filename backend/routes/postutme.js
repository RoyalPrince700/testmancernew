import express from 'express';
import {
  getUserProgress,
  getSubjectProgress,
  completeTopic,
  getUserBadges,
  getLeaderboard,
  getTopPerformers,
  getSubjectStats
} from '../controllers/postUtmeController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// All Post-UTME routes require authentication
router.use(ensureAuthenticated);

// Get user's overall progress
router.get('/progress', getUserProgress);

// Get progress for specific subject
router.get('/progress/:subject', getSubjectProgress);

// Get subject statistics
router.get('/stats/:subject', getSubjectStats);

// Complete a topic
router.post('/complete/:subject/:topic/:subtopic', completeTopic);

// Get user's badges
router.get('/badges', getUserBadges);

// Leaderboard routes
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/top', getTopPerformers);

export default router;
