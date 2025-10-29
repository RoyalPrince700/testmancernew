import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategory } from '../contexts/CategoryContext';
import toast from 'react-hot-toast';
import {
  getGlobalLeaderboard,
  getLeaderboardByGoal,
  getWeeklyLeaderboard,
  calculateUserStats,
  getBadgesForUser
} from '../utils/leaderboardApi';

const Leaderboard = () => {
  const { user } = useAuth();
  const { selectedCategory, availableCategories } = useCategory();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState(selectedCategory || 'all');

  const timeframes = [
    { value: 'all-time', label: 'All Time' },
    { value: 'monthly', label: 'This Month' },
    { value: 'weekly', label: 'This Week' },
    { value: 'daily', label: 'Today' }
  ];

  // Generate categories from user's learning categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    ...availableCategories.map(cat => ({
      value: cat,
      label: cat.replace('-', ' ').toUpperCase()
    }))
  ];

  // Update category when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, category]);

  const fetchLeaderboard = async () => {
    try {
      let leaderboardData;
      let userRankData = null;

      // Fetch leaderboard based on category and timeframe
      if (category === 'all') {
        if (timeframe === 'weekly') {
          leaderboardData = await getWeeklyLeaderboard();
        } else {
          // For all-time, monthly, daily - use global leaderboard
          // Note: Backend doesn't currently support monthly/daily filtering
          leaderboardData = await getGlobalLeaderboard(50, 1);
        }
      } else {
        // Category-specific leaderboard
        leaderboardData = await getLeaderboardByGoal(category);
      }

      // Process leaderboard data
      const processedLeaderboard = leaderboardData.leaderboard.map((entry) => {
        // For weekly leaderboard, calculate average score from weekly data
        let averageScore = 0;
        if (timeframe === 'weekly' && entry.weeklyCorrectAnswers && entry.weeklyQuizzes) {
          // Estimate average score based on weekly performance
          const totalQuestions = entry.weeklyQuizzes * 10; // Assume 10 questions per quiz
          averageScore = totalQuestions > 0 ? Math.round((entry.weeklyCorrectAnswers / totalQuestions) * 100) : 0;
        } else {
          // For other timeframes, use a default or estimated score
          // Since backend doesn't provide detailed quiz history in leaderboard,
          // we'll use gems as a proxy for performance
          averageScore = Math.min(100, Math.max(50, 70 + (entry.gems / 100))); // Rough estimation
        }

        return {
          id: entry.userId || entry.user?._id,
          name: entry.username || entry.name || entry.user?.name || 'Anonymous',
          username: entry.username ? String(entry.username).toLowerCase() : null,
          avatar: entry.avatar || entry.user?.avatar || '👤',
          totalScore: entry.gems || 0,
          quizzesCompleted: entry.totalQuizzes || entry.weeklyQuizzes || entry.completedModules || 0,
          averageScore: averageScore,
          rank: entry.rank,
          badges: getBadgesForUser(entry, { averageScore, quizzesCompleted: entry.totalQuizzes || 0 }),
          learningCategories: entry.learningCategories || []
        };
      });

      // Process current user data
      if (leaderboardData.currentUser) {
        // Calculate user's actual stats if available
        const userStats = user ? calculateUserStats(user.quizHistory || []) : { quizzesCompleted: 0, averageScore: 0 };

        userRankData = {
          id: user?.id || leaderboardData.currentUser.userId,
          name: user?.username || user?.name || leaderboardData.currentUser.name,
          username: user?.username ? user.username.toLowerCase() : null,
          avatar: user?.avatar || '🎯',
          totalScore: leaderboardData.currentUser.gems || 0,
          quizzesCompleted: userStats.quizzesCompleted,
          averageScore: userStats.averageScore,
          rank: leaderboardData.currentUser.rank,
          badges: getBadgesForUser(leaderboardData.currentUser, userStats)
        };
      }

      setLeaderboard(processedLeaderboard);
      setUserRank(userRankData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast.error('Failed to load leaderboard');
      // Fallback to empty data
      setLeaderboard([]);
      setUserRank(null);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600';
      case 2: return 'text-gray-500';
      case 3: return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const formatUsername = (username) => {
    if (!username) return '';
    const s = String(username);
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other TestMancer users</p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input-field"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current User Rank */}
      {userRank && (
        <div className="card mb-8 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{userRank.username ? formatUsername(userRank.username) : userRank.name}</h3>
              <p className="text-gray-600">Your current ranking</p>
            </div>
          </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getRankColor(userRank.rank)}`}>
                {getRankIcon(userRank.rank)}
              </div>
              <div className="text-sm text-gray-600">Rank #{userRank.rank}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{userRank.totalScore.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{userRank.quizzesCompleted}</div>
              <div className="text-sm text-gray-600">Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{userRank.averageScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Total Score</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Quizzes</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Score</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Badges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{entry.username ? formatUsername(entry.username) : entry.name}</div>
                        {entry.rank <= 3 && (
                          <div className="text-sm text-gray-500">
                            {entry.rank === 1 ? 'Champion' : entry.rank === 2 ? 'Runner-up' : 'Third Place'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-gray-900">{entry.totalScore.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-gray-600">{entry.quizzesCompleted}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-gray-900">{entry.averageScore}%</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center space-x-1">
                      {entry.badges.map((badge, index) => (
                        <span key={index} className="text-lg" title={`Badge ${index + 1}`}>
                          {badge}
                        </span>
                      ))}
                      {entry.badges.length === 0 && (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges Legend */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <span className="text-xl mr-2">🏆</span>
            <span className="text-sm text-gray-600">Champion</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl mr-2">⭐</span>
            <span className="text-sm text-gray-600">High Scorer</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl mr-2">🔥</span>
            <span className="text-sm text-gray-600">Streak Master</span>
          </div>
          <div className="flex items-center">
            <span className="text-xl mr-2">🎯</span>
            <span className="text-sm text-gray-600">Accuracy King</span>
          </div>
        </div>
      </div>

      {/* Encouragement */}
      <div className="card mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep Climbing! 🚀</h3>
          <p className="text-gray-600">
            Complete more quizzes and improve your scores to climb the leaderboard.
            Every quiz you take brings you closer to the top!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
