import React from 'react';
import { Link } from 'react-router-dom';
import { useCategory } from '../../contexts/CategoryContext';

const QuickActions = () => {
  const { selectedCategory } = useCategory();

  return (
    <div className="card">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {/* Category-specific Quick Actions */}
        {selectedCategory === 'postutme' && (
          <>
            <Link to="/post-utme" className="block w-full btn-primary touch-manipulation">
              <div className="flex items-center justify-center py-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm sm:text-base">Post-UTME Practice</span>
              </div>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link to="/post-utme/english" className="block w-full btn-secondary text-xs sm:text-sm touch-manipulation">
                <div className="flex items-center justify-center py-2">
                  <span className="mr-1">📚</span>
                  <span className="text-center">English</span>
                </div>
              </Link>
              <Link to="/post-utme/mathematics" className="block w-full btn-secondary text-xs sm:text-sm touch-manipulation">
                <div className="flex items-center justify-center py-2">
                  <span className="mr-1">🔢</span>
                  <span className="text-center">Mathematics</span>
                </div>
              </Link>
              <Link to="/post-utme/current-affairs" className="block w-full btn-secondary text-xs sm:text-sm touch-manipulation">
                <div className="flex items-center justify-center py-2">
                  <span className="mr-1">🌍</span>
                  <span className="text-center">Current Affairs</span>
                </div>
              </Link>
            </div>
          </>
        )}

        {/* WAEC Actions */}
        {selectedCategory === 'waec' && (
          <>
            <Link to="/courses?category=secondary&learningGoal=waec" className="block w-full btn-primary touch-manipulation">
              <div className="flex items-center justify-center py-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm sm:text-base">WAEC Practice Courses</span>
              </div>
            </Link>
          </>
        )}

        {/* JAMB Actions */}
        {selectedCategory === 'jamb' && (
          <>
            <Link to="/courses?category=tertiary&learningGoal=jamb" className="block w-full btn-primary touch-manipulation">
              <div className="flex items-center justify-center py-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm sm:text-base">JAMB Practice Courses</span>
              </div>
            </Link>
          </>
        )}

        {/* TOEFL Actions */}
        {selectedCategory === 'toefl' && (
          <>
            <Link to="/courses?category=language&learningGoal=toefl" className="block w-full btn-primary touch-manipulation">
              <div className="flex items-center justify-center py-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0H8l.5 16h7L16 4z" />
                </svg>
                <span className="text-sm sm:text-base">TOEFL Practice Courses</span>
              </div>
            </Link>
          </>
        )}

        {/* IELTS Actions */}
        {selectedCategory === 'ielts' && (
          <>
            <Link to="/courses?category=language&learningGoal=ielts" className="block w-full btn-primary touch-manipulation">
              <div className="flex items-center justify-center py-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0H8l.5 16h7L16 4z" />
                </svg>
                <span className="text-sm sm:text-base">IELTS Practice Courses</span>
              </div>
            </Link>
          </>
        )}

        {/* Undergraduate Actions */}
        {selectedCategory === 'undergraduate' && (
          <>
            <Link to="/courses?category=tertiary&learningGoal=undergraduate" className="block w-full btn-primary touch-manipulation">
              <div className="flex items-center justify-center py-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span className="text-sm sm:text-base">Undergraduate Courses</span>
              </div>
            </Link>
          </>
        )}

        {/* General Actions */}
        <Link to="/courses" className="block w-full btn-primary touch-manipulation">
          <div className="flex items-center justify-center py-1">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm sm:text-base">Browse All Courses</span>
          </div>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/leaderboard" className="block w-full btn-secondary touch-manipulation">
            <div className="flex items-center justify-center py-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm sm:text-base">Leaderboard</span>
            </div>
          </Link>

          <Link to="/profile" className="block w-full btn-secondary touch-manipulation">
            <div className="flex items-center justify-center py-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm sm:text-base">Profile</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
