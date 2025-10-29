import React from 'react';
import { MdQuiz, MdCheckCircle, MdEmojiEvents, MdLeaderboard, MdDiamond } from 'react-icons/md';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useCategory } from '../../contexts/CategoryContext';
import CategoryToggle from '../CategoryToggle';
import CourseCard from './CourseCard';

const DashboardOverview = ({ stats = {} }) => {
  const { user } = useAuth();
  const { selectedCategory } = useCategory();

  const defaultStats = {
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    rank: 0,
    totalGems: 0,
    recentGems: 0,
    courseProgress: [],
    ...stats
  };

  const pieData = [
    { name: 'Completed', value: defaultStats.completedQuizzes },
    { name: 'Pending', value: Math.max(defaultStats.totalQuizzes - defaultStats.completedQuizzes, 0) }
  ];
  const COLORS = ['#10b981', '#e5e7eb'];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Welcome back, {user?.name || 'TestMancer'}!
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm">Ready to conquer some quizzes today?</p>
      </div>

      {/* Category Toggle */}
      <CategoryToggle />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
        <div className="card shadow-soft">
          <div className="flex items-center">
            <div className="p-1 sm:p-1.5 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
              <MdQuiz className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 whitespace-normal">Total Quizzes</p>
              <p className="text-base sm:text-xl font-semibold text-gray-900">{defaultStats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="card shadow-soft">
          <div className="flex items-center">
            <div className="p-1 sm:p-1.5 rounded-full bg-green-50 text-green-600 flex-shrink-0">
              <MdCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 whitespace-normal">Completed</p>
              <p className="text-base sm:text-xl font-semibold text-gray-900">{defaultStats.completedQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="card shadow-soft">
          <div className="flex items-center">
            <div className="p-1 sm:p-1.5 rounded-full bg-amber-50 text-amber-600 flex-shrink-0">
              <MdEmojiEvents className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 whitespace-normal">Avg Score</p>
              <p className="text-base sm:text-xl font-semibold text-gray-900">{defaultStats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="card shadow-soft">
          <div className="flex items-center">
            <div className="p-1 sm:p-1.5 rounded-full bg-purple-50 text-purple-600 flex-shrink-0">
              <MdLeaderboard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 whitespace-normal">Rank</p>
              <p className="text-base sm:text-xl font-semibold text-gray-900">#{defaultStats.rank}</p>
            </div>
          </div>
        </div>

        <div className="card shadow-soft">
          <div className="flex items-center">
            <div className="p-1 sm:p-1.5 rounded-full bg-pink-50 text-pink-600 flex-shrink-0">
              <MdDiamond className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 whitespace-normal">Total Gems</p>
              <p className="text-base sm:text-xl font-semibold text-gray-900">{defaultStats.totalGems}</p>
              {defaultStats.recentGems > 0 && (
                <p className="text-[11px] text-green-600 font-medium">+{defaultStats.recentGems} recently</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="card shadow-soft">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Quiz Progress</h2>
        <div className="h-44 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={72}
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-[11px] sm:text-xs text-gray-600 flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[0] }}></span>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[1] }}></span>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Courses content moved to Courses tab. */}
    </div>
  );
};

export default DashboardOverview;
