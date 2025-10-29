import axios from 'axios';

export const getGlobalLeaderboard = async (limit = 50, page = 1) => {
  const res = await axios.get('/api/leaderboard/global', {
    params: { limit, page }
  });
  return res.data;
};

export const getLeaderboardByGoal = async (goal, limit = 50) => {
  const res = await axios.get(`/api/leaderboard/goal/${goal}`, {
    params: { limit }
  });
  return res.data;
};

export const getWeeklyLeaderboard = async () => {
  const res = await axios.get('/api/leaderboard/weekly');
  return res.data;
};

export const getUserRankingComparison = async () => {
  const res = await axios.get('/api/leaderboard/compare');
  return res.data;
};

// Helper function to calculate timeframe-based data
export const calculateTimeframeData = (timeframe, quizHistory) => {
  const now = new Date();
  let startDate;

  switch (timeframe) {
    case 'daily':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'all-time':
    default:
      return quizHistory; // Return all history
  }

  return quizHistory.filter(quiz =>
    new Date(quiz.completedAt) >= startDate
  );
};

// Helper function to calculate user stats from quiz history
export const calculateUserStats = (quizHistory) => {
  if (!quizHistory || quizHistory.length === 0) {
    return {
      totalScore: 0,
      quizzesCompleted: 0,
      averageScore: 0,
      totalQuestions: 0,
      correctAnswers: 0
    };
  }

  const totalScore = quizHistory.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
  const totalQuestions = quizHistory.reduce((sum, quiz) => sum + (quiz.totalQuestions || 0), 0);
  const correctAnswers = quizHistory.reduce((sum, quiz) => sum + (quiz.correctAnswers || 0), 0);

  return {
    totalScore,
    quizzesCompleted: quizHistory.length,
    averageScore: quizHistory.length > 0 ? Math.round(totalScore / quizHistory.length) : 0,
    totalQuestions,
    correctAnswers
  };
};

// Helper function to get badges based on performance
export const getBadgesForUser = (user, stats) => {
  const badges = [];

  // Champion badges based on ranking
  if (user.rank === 1) badges.push('🏆');
  else if (user.rank === 2) badges.push('🥈');
  else if (user.rank === 3) badges.push('🥉');

  // Performance badges based on average score
  if (stats.averageScore >= 90) badges.push('⭐');
  if (stats.averageScore >= 85) badges.push('🔥');
  if (stats.quizzesCompleted >= 50) badges.push('🎯');

  return badges;
};
