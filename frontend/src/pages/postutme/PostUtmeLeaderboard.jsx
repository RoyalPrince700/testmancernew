import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiArrowLeft,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import TestMancerLoader from "../../components/TestMancer";

const PostUtmeLeaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const timeframes = [
    { value: 'all-time', label: 'All Time' },
    { value: 'monthly', label: 'This Month' },
    { value: 'weekly', label: 'This Week' },
    { value: 'daily', label: 'Today' }
  ];

  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'English', label: 'English' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Current-Affairs', label: 'Current Affairs' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, subjectFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Fetch leaderboard data from API
      const params = new URLSearchParams({
        subject: subjectFilter === 'all' ? 'General' : subjectFilter,
        timeframe,
        limit: '50'
      });

      const response = await fetch(`/api/post-utme/leaderboard?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching leaderboard:', response.statusText);
        // Fallback to mock data
        setMockLeaderboard();
        return;
      }

      const result = await response.json();

      if (result.success) {
        const { leaderboard, userRank } = result.data;

        // Process the data
        const processedData = leaderboard.map((entry) => ({
          id: entry.user._id,
          name: entry.user?.name || 'Anonymous User',
          avatar: entry.user?.avatar || '👤',
          totalScore: entry.totalScore,
          quizzesCompleted: entry.quizzesCompleted,
          averageScore: entry.averageScore,
          rank: entry.rank,
          subject: entry.subject,
          badges: getBadgesForScore(entry.totalScore)
        }));

        setLeaderboard(processedData);
        setUserRank(userRank);
      } else {
        // Fallback to mock data
        setMockLeaderboard();
      }

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setMockLeaderboard();
    } finally {
      setLoading(false);
    }
  };

  const setMockLeaderboard = () => {
    const mockData = [
      {
        id: 1,
        name: 'Adebayo Johnson',
        avatar: '👨‍🎓',
        totalScore: 15420,
        quizzesCompleted: 45,
        averageScore: 92.5,
        rank: 1,
        subject: 'All',
        badges: ['🏆', '⭐', '🔥']
      },
      {
        id: 2,
        name: 'Ngozi Okon',
        avatar: '👩‍🎓',
        totalScore: 14850,
        quizzesCompleted: 42,
        averageScore: 90.2,
        rank: 2,
        subject: 'English',
        badges: ['🥈', '⭐']
      },
      {
        id: 3,
        name: 'Chinedu Eze',
        avatar: '👨‍💼',
        totalScore: 14200,
        quizzesCompleted: 38,
        averageScore: 88.7,
        rank: 3,
        subject: 'Mathematics',
        badges: ['🥉', '⭐']
      },
      {
        id: 4,
        name: 'Amara Nwosu',
        avatar: '👩‍🔬',
        totalScore: 13950,
        quizzesCompleted: 41,
        averageScore: 87.3,
        rank: 4,
        subject: 'Current-Affairs',
        badges: ['⭐']
      },
      {
        id: 5,
        name: 'Ifeanyi Okoro',
        avatar: '👨‍🏫',
        totalScore: 13500,
        quizzesCompleted: 35,
        averageScore: 85.9,
        rank: 5,
        subject: 'All',
        badges: ['⭐']
      }
    ];

    setLeaderboard(mockData);
    if (user) {
      setUserRank(24); // Mock user rank
    }
  };

  const getBadgesForScore = (score) => {
    const badges = [];
    if (score >= 15000) badges.push('🏆');
    else if (score >= 12000) badges.push('🥈');
    else if (score >= 10000) badges.push('🥉');

    if (score >= 8000) badges.push('⭐');
    if (score >= 5000) badges.push('🔥');

    return badges;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <span className="text-yellow-500 text-2xl">👑</span>;
      case 2: return <span className="text-gray-400 text-2xl">🥈</span>;
      case 3: return <span className="text-amber-600 text-2xl">🥉</span>;
      default: return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  if (loading) {
    return <TestMancerLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/post-utme')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <FiArrowLeft />
            <span>Back to Post-UTME</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Post-UTME Leaderboard</h1>
            <p className="text-gray-600 text-lg">See how you rank among other Post-UTME aspirants</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeframes.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject.value} value={subject.value}>{subject.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User's Rank Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Your Rank</h2>
                <div className="flex items-center gap-2">
                  {getRankIcon(userRank)}
                  <span className="text-2xl font-bold">{userRank}</span>
                  <span className="text-blue-100">out of {leaderboard.length} students</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Keep climbing!</div>
                <div className="text-2xl">🚀</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-yellow-500 text-xl">🏆</span>
              Top Performers
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  entry.id === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar and Info */}
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{entry.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{entry.name}</div>
                        <div className="text-sm text-gray-500">
                          {entry.quizzesCompleted} quizzes • {entry.averageScore}% avg
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-1">
                      {entry.badges.map((badge, idx) => (
                        <span key={idx} className="text-lg">{badge}</span>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">{entry.totalScore.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Ready to climb the ranks? 🎯</h3>
            <p className="mb-4">Keep practicing and you'll see your name at the top!</p>
            <button
              onClick={() => navigate('/post-utme')}
              className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Continue Studying
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostUtmeLeaderboard;
