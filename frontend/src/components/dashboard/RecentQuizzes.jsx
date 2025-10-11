import React from 'react';
import { Link } from 'react-router-dom';

const RecentQuizzes = ({ recentQuizzes = [] }) => {
  return (
    <div className="card">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Quizzes</h2>
      {recentQuizzes.length > 0 ? (
        <div className="space-y-3">
          {recentQuizzes.map((quiz) => (
            <div key={quiz.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{quiz.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">Completed {quiz.completedAt}</p>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full border-2 border-blue-100">
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{quiz.score}%</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="mb-3">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No recent quizzes found.</p>
        </div>
      )}
      <div className="mt-4 sm:mt-6">
        <Link to="/courses" className="btn-primary w-full sm:w-auto text-center block sm:inline-block">
          Browse All Courses
        </Link>
      </div>
    </div>
  );
};

export default RecentQuizzes;
