import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get global leaderboard
router.get('/global', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('name avatar gems completedModules quizHistory learningGoals')
      .sort({ gems: -1 })
      .skip(skip)
      .limit(limit);

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
      gems: user.gems,
      completedModules: user.completedModules.length,
      totalQuizzes: user.quizHistory.length,
      learningGoals: user.learningGoals
    }));

    // Get current user's rank
    const currentUser = await User.findById(req.user.userId);
    const userRank = await User.countDocuments({ gems: { $gt: currentUser.gems } }) + 1;

    res.json({
      leaderboard,
      currentUser: {
        rank: userRank,
        gems: currentUser.gems,
        name: currentUser.name
      },
      pagination: {
        page,
        limit,
        total: await User.countDocuments()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard by learning goal
router.get('/goal/:goal', authenticateToken, async (req, res) => {
  try {
    const { goal } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const users = await User.find({ learningGoals: goal })
      .select('name avatar gems completedModules quizHistory learningGoals')
      .sort({ gems: -1 })
      .limit(limit);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
      gems: user.gems,
      completedModules: user.completedModules.length,
      totalQuizzes: user.quizHistory.length,
      learningGoals: user.learningGoals
    }));

    // Get current user's rank in this category
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser.learningGoals.includes(goal)) {
      return res.status(400).json({ message: 'User does not have this learning goal' });
    }

    const userRank = await User.countDocuments({
      learningGoals: goal,
      gems: { $gt: currentUser.gems }
    }) + 1;

    res.json({
      leaderboard,
      currentUser: {
        rank: userRank,
        gems: currentUser.gems,
        name: currentUser.name
      },
      learningGoal: goal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top performers this week
router.get('/weekly', authenticateToken, async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await User.find()
      .select('name avatar gems completedModules quizHistory learningGoals')
      .sort({ gems: -1 })
      .limit(20);

    // Filter users who had activity this week
    const activeUsers = users.filter(user => {
      const recentQuizzes = user.quizHistory.filter(
        quiz => new Date(quiz.completedAt) >= weekAgo
      );
      return recentQuizzes.length > 0;
    });

    const leaderboard = activeUsers.map((user, index) => {
      const weeklyQuizzes = user.quizHistory.filter(
        quiz => new Date(quiz.completedAt) >= weekAgo
      );

      return {
        rank: index + 1,
        userId: user._id,
        name: user.name,
        avatar: user.avatar,
        gems: user.gems,
        weeklyQuizzes: weeklyQuizzes.length,
        weeklyCorrectAnswers: weeklyQuizzes.reduce((sum, quiz) => sum + quiz.correctAnswers, 0)
      };
    });

    res.json({
      leaderboard,
      period: 'weekly'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's ranking comparison
router.get('/compare', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);

    // Global ranking
    const globalRank = await User.countDocuments({ gems: { $gt: currentUser.gems } }) + 1;
    const totalUsers = await User.countDocuments();

    // Rankings by learning goals
    const goalRankings = {};
    for (const goal of currentUser.learningGoals) {
      const goalRank = await User.countDocuments({
        learningGoals: goal,
        gems: { $gt: currentUser.gems }
      }) + 1;

      const totalInGoal = await User.countDocuments({ learningGoals: goal });

      goalRankings[goal] = {
        rank: goalRank,
        total: totalInGoal,
        percentage: Math.round((goalRank / totalInGoal) * 100)
      };
    }

    res.json({
      globalRanking: {
        rank: globalRank,
        total: totalUsers,
        percentage: Math.round((globalRank / totalUsers) * 100)
      },
      goalRankings,
      userGems: currentUser.gems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
