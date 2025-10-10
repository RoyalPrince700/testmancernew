import PostUtmeProgress from '../models/PostUtmeProgress.js';
import PostUtmeBadge from '../models/PostUtmeBadge.js';
import PostUtmeLeaderboard from '../models/PostUtmeLeaderboard.js';
import User from '../models/User.js';

// Get user's Post-UTME progress and stats
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get progress summary by subject
    const progressSummary = await PostUtmeProgress.getUserProgressSummary(userId);

    // Get badge summary
    const badgeSummary = await PostUtmeBadge.getUserBadgeSummary(userId);

    // Get user streak (simplified - last 7 days of activity)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await PostUtmeProgress.find({
      user: userId,
      lastAttempted: { $gte: sevenDaysAgo }
    }).sort({ lastAttempted: -1 });

    // Calculate streak (simplified logic)
    const streak = calculateStreak(recentActivity);

    // Get total badges count
    const totalBadges = await PostUtmeBadge.countDocuments({ user: userId });

    // Format response
    const subjects = ['english', 'mathematics', 'current-affairs'];
    const subjectProgress = {};

    subjects.forEach(subject => {
      const progress = progressSummary.find(p => p.subject === subject);
      const badges = badgeSummary.find(b => b.subject === subject);

      subjectProgress[subject] = {
        progress: progress ? progress.progressPercentage : 0,
        completedTopics: progress ? progress.completedTopics : 0,
        totalTopics: progress ? progress.totalTopics : getTotalTopicsForSubject(subject),
        badges: badges ? badges.totalBadges : 0,
        badgePoints: badges ? badges.totalPoints : 0
      };
    });

    res.json({
      success: true,
      data: {
        subjects: subjectProgress,
        achievements: {
          totalBadges,
          currentStreak: streak,
          totalScore: progressSummary.reduce((sum, p) => sum + p.totalScore, 0),
          totalTopicsCompleted: progressSummary.reduce((sum, p) => sum + p.completedTopics, 0),
          totalTopics: subjects.reduce((sum, subject) => sum + getTotalTopicsForSubject(subject), 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress',
      error: error.message
    });
  }
};

// Get progress for specific subject
export const getSubjectProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject } = req.params;

    if (!['english', 'mathematics', 'current-affairs'].includes(subject.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject'
      });
    }

    const progress = await PostUtmeProgress.getSubjectProgress(userId, subject);

    // Get completed topics count
    const completedCount = progress.filter(p => p.completed).length;

    res.json({
      success: true,
      data: {
        subject: subject.toLowerCase(),
        progress: progress,
        completedCount,
        totalCount: getTotalTopicsForSubject(subject.toLowerCase()),
        progressPercentage: Math.round((completedCount / getTotalTopicsForSubject(subject.toLowerCase())) * 100)
      }
    });

  } catch (error) {
    console.error('Error fetching subject progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject progress',
      error: error.message
    });
  }
};

// Complete a topic
export const completeTopic = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject, topic, subtopic } = req.params;
    const { score, timeSpent } = req.body;

    if (!['english', 'mathematics', 'current-affairs'].includes(subject.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject'
      });
    }

    // Complete the topic
    const progress = await PostUtmeProgress.completeTopic(
      userId,
      subject,
      topic,
      subtopic,
      score || 0,
      timeSpent || 0
    );

    // Award gems to user
    const user = await User.findById(userId);
    if (user) {
      await user.awardGems(1); // 1 gem per topic completion
    }

    // Check for badges
    await checkAndAwardBadges(userId, subject, topic, score);

    // Update leaderboard
    await PostUtmeLeaderboard.updateUserEntry(userId, subject);
    await PostUtmeLeaderboard.updateUserEntry(userId, 'General');

    res.json({
      success: true,
      data: {
        progress,
        gemsAwarded: 1,
        message: 'Topic completed successfully!'
      }
    });

  } catch (error) {
    console.error('Error completing topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete topic',
      error: error.message
    });
  }
};

// Get user's badges
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.user._id;

    const badges = await PostUtmeBadge.find({ user: userId })
      .sort({ earnedAt: -1 });

    res.json({
      success: true,
      data: badges
    });

  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user badges',
      error: error.message
    });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { subject = 'General', timeframe = 'all-time', limit = 50 } = req.query;

    const leaderboard = await PostUtmeLeaderboard.getLeaderboard(
      subject,
      timeframe,
      parseInt(limit)
    );

    // Get current user's rank
    const userRank = await PostUtmeLeaderboard.getUserRank(req.user._id, subject, timeframe);

    res.json({
      success: true,
      data: {
        leaderboard,
        userRank: userRank ? userRank.rank : null,
        subject,
        timeframe,
        totalEntries: leaderboard.length
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

// Get top performers
export const getTopPerformers = async (req, res) => {
  try {
    const { subject = 'General', timeframe = 'all-time' } = req.query;

    const topPerformers = await PostUtmeLeaderboard.getTopPerformers(subject, timeframe, 10);

    res.json({
      success: true,
      data: topPerformers
    });

  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top performers',
      error: error.message
    });
  }
};

// Get subject statistics
export const getSubjectStats = async (req, res) => {
  try {
    const { subject } = req.params;

    if (!['english', 'mathematics', 'current-affairs'].includes(subject.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject'
      });
    }

    // Get overall stats for the subject
    const stats = await PostUtmeProgress.aggregate([
      { $match: { subject: subject.toLowerCase() } },
      {
        $group: {
          _id: null,
          totalUsers: { $addToSet: '$user' },
          totalCompletions: { $sum: { $cond: ['$completed', 1, 0] } },
          averageScore: { $avg: '$score' },
          totalAttempts: { $sum: '$attempts' }
        }
      },
      {
        $project: {
          totalUsers: { $size: '$totalUsers' },
          totalCompletions: 1,
          averageScore: { $round: '$averageScore' },
          totalAttempts: 1
        }
      }
    ]);

    const subjectStats = stats[0] || {
      totalUsers: 0,
      totalCompletions: 0,
      averageScore: 0,
      totalAttempts: 0
    };

    res.json({
      success: true,
      data: {
        subject: subject.toLowerCase(),
        ...subjectStats,
        totalTopics: getTotalTopicsForSubject(subject.toLowerCase())
      }
    });

  } catch (error) {
    console.error('Error fetching subject stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject statistics',
      error: error.message
    });
  }
};

// Helper functions
function getTotalTopicsForSubject(subject) {
  const topicsCount = {
    'english': 21,
    'mathematics': 10,
    'current-affairs': 11
  };
  return topicsCount[subject.toLowerCase()] || 0;
}

function calculateStreak(activities) {
  if (!activities.length) return 0;

  // Group activities by date
  const activityDates = activities
    .map(activity => activity.lastAttempted.toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if user was active today or yesterday
  if (activityDates.includes(today) || activityDates.includes(yesterday)) {
    streak = 1;

    // Count consecutive days
    for (let i = 1; i < activityDates.length; i++) {
      const currentDate = new Date(activityDates[i - 1]);
      const prevDate = new Date(activityDates[i]);
      const diffTime = Math.abs(currentDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
}

async function checkAndAwardBadges(userId, subject, topic, score) {
  try {
    // Check for first completion badge
    const firstCompletionBadge = await PostUtmeBadge.hasBadge(userId, 'first-completion', subject);
    if (!firstCompletionBadge) {
      await PostUtmeBadge.awardBadge(
        userId,
        subject,
        'first-completion',
        'First Steps',
        `Completed your first ${subject} topic!`,
        '🎯',
        'common',
        10
      );
    }

    // Check for perfect score badge
    if (score === 100) {
      const perfectScoreBadge = await PostUtmeBadge.hasBadge(userId, 'perfect-score', subject);
      if (!perfectScoreBadge) {
        await PostUtmeBadge.awardBadge(
          userId,
          subject,
          'perfect-score',
          'Perfectionist',
          'Achieved a perfect score!',
          '💯',
          'rare',
          25
        );
      }
    }

    // Check for subject master badge (complete all topics)
    const PostUtmeProgress = (await import('../models/PostUtmeProgress.js')).default;
    const subjectProgress = await PostUtmeProgress.getSubjectProgress(userId, subject);
    const totalTopics = getTotalTopicsForSubject(subject);
    const completedTopics = subjectProgress.filter(p => p.completed).length;

    if (completedTopics === totalTopics) {
      const subjectMasterBadge = await PostUtmeBadge.hasBadge(userId, 'subject-master', subject);
      if (!subjectMasterBadge) {
        await PostUtmeBadge.awardBadge(
          userId,
          subject,
          'subject-master',
          `${subject.charAt(0).toUpperCase() + subject.slice(1)} Master`,
          `Completed all ${subject} topics!`,
          '🏆',
          'epic',
          50
        );
      }
    }

  } catch (error) {
    console.error('Error checking badges:', error);
  }
}
