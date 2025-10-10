import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategory } from '../contexts/CategoryContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import CategoryToggle from '../components/CategoryToggle';

const Dashboard = () => {
  const { user, canAccessCourse, isSubAdmin } = useAuth();
  const { selectedCategory } = useCategory();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    totalScore: 0,
    averageScore: 0,
    rank: 0,
    totalGems: 0,
    completedModules: 0,
    learningCategories: []
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [personalizedCourses, setPersonalizedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, selectedCategory]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user stats
      const statsResponse = await axios.get('/api/users/stats');
      if (statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
        setRecentQuizzes(statsResponse.data.stats.recentQuizzes || []);
      }

      // Fetch personalized courses
      const coursesResponse = await axios.get(`/api/courses/personalized?category=${selectedCategory}`);
      if (coursesResponse.data.courses) {
        // Filter courses based on role permissions
        const filteredCourses = isSubAdmin
          ? coursesResponse.data.courses.filter(canAccessCourse)
          : coursesResponse.data.courses;
        setPersonalizedCourses(filteredCourses);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'TestMancer'}!
        </h1>
        <p className="text-gray-600">Ready to conquer some quizzes today?</p>
      </div>

      {/* Category Toggle */}
      <CategoryToggle />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rank</p>
              <p className="text-2xl font-bold text-gray-900">#{stats.rank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Quizzes */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Quizzes</h2>
          {recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-500">Completed {quiz.completedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{quiz.score}%</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent quizzes found.</p>
          )}
          <div className="mt-4">
            <Link to="/courses" className="btn-primary">
              Browse All Courses
            </Link>
          </div>
        </div>

        {/* Personalized Courses */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Courses</h2>
          {personalizedCourses.length > 0 ? (
            <div className="space-y-4">
              {personalizedCourses.slice(0, 3).map((course) => (
                <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{course.modules?.length || 0} modules</span>
                        <span>{course.category}</span>
                        <span className="capitalize">{course.difficulty}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {course.progress && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {course.progress.progressPercentage}% Complete
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.progress.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <Link
                        to={`/courses/${course._id}`}
                        className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {course.progress?.progressPercentage > 0 ? 'Continue' : 'Start'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {personalizedCourses.length > 3 && (
                <div className="text-center mt-4">
                  <Link to="/courses" className="text-blue-600 hover:text-blue-800 font-medium">
                    View all {personalizedCourses.length} courses →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No courses available based on your learning preferences.</p>
              <Link to="/courses" className="btn-primary">
                Browse All Courses
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {/* Category-specific Quick Actions */}
            {selectedCategory === 'postutme' && (
              <>
                <Link to="/post-utme" className="block w-full btn-primary">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Post-UTME Practice
                  </div>
                </Link>

                <div className="grid grid-cols-1 gap-2">
                  <Link to="/post-utme/english" className="block w-full btn-secondary text-sm">
                    <div className="flex items-center justify-center">
                      📚 English Practice
                    </div>
                  </Link>
                  <Link to="/post-utme/mathematics" className="block w-full btn-secondary text-sm">
                    <div className="flex items-center justify-center">
                      🔢 Mathematics Practice
                    </div>
                  </Link>
                  <Link to="/post-utme/current-affairs" className="block w-full btn-secondary text-sm">
                    <div className="flex items-center justify-center">
                      🌍 Current Affairs Practice
                    </div>
                  </Link>
                </div>
              </>
            )}

            {/* WAEC Actions */}
            {selectedCategory === 'waec' && (
              <>
                <Link to="/courses?category=secondary&learningGoal=waec" className="block w-full btn-primary">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    WAEC Practice Courses
                  </div>
                </Link>
              </>
            )}

            {/* JAMB Actions */}
            {selectedCategory === 'jamb' && (
              <>
                <Link to="/courses?category=tertiary&learningGoal=jamb" className="block w-full btn-primary">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    JAMB Practice Courses
                  </div>
                </Link>
              </>
            )}

            {/* TOEFL Actions */}
            {selectedCategory === 'toefl' && (
              <>
                <Link to="/courses?category=language&learningGoal=toefl" className="block w-full btn-primary">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0H8l.5 16h7L16 4z" />
                    </svg>
                    TOEFL Practice Courses
                  </div>
                </Link>
              </>
            )}

            {/* IELTS Actions */}
            {selectedCategory === 'ielts' && (
              <>
                <Link to="/courses?category=language&learningGoal=ielts" className="block w-full btn-primary">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0H8l.5 16h7L16 4z" />
                    </svg>
                    IELTS Practice Courses
                  </div>
                </Link>
              </>
            )}

            {/* Undergraduate Actions */}
            {selectedCategory === 'undergraduate' && (
              <>
                <Link to="/courses?category=tertiary&learningGoal=undergraduate" className="block w-full btn-primary">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Undergraduate Courses
                  </div>
                </Link>
              </>
            )}

            {/* General Actions */}
            <Link to="/courses" className="block w-full btn-primary">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Browse All Courses
              </div>
            </Link>

            <Link to="/leaderboard" className="block w-full btn-secondary">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Leaderboard
              </div>
            </Link>

            <Link to="/profile" className="block w-full btn-secondary">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
