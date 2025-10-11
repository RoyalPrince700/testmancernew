import React from 'react';
import { Link } from 'react-router-dom';

const PersonalizedCourses = ({ personalizedCourses = [] }) => {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Courses</h2>
      {personalizedCourses.length > 0 ? (
        <div className="space-y-4">
          {personalizedCourses.slice(0, 3).map((course) => (
            <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              {/* Mobile-first layout: Stack on small screens, side-by-side on larger */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{course.modules?.length || 0} modules</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{course.category}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md capitalize">{course.difficulty}</span>
                  </div>
                </div>

                {/* Progress and Action Button */}
                <div className="flex flex-col sm:items-end gap-3 min-w-0 sm:w-32">
                  {course.progress && (
                    <div className="w-full sm:w-auto">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {course.progress.progressPercentage}% Complete
                      </div>
                      <div className="w-full sm:w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <Link
                    to={`/courses/${course._id}`}
                    className="w-full sm:w-auto bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center font-medium touch-manipulation"
                    onClick={(e) => {
                      // Optional: Add a quick existence check here if needed
                      // For now, let the navigation proceed and handle errors in CourseDetail
                    }}
                  >
                    {course.progress?.progressPercentage > 0 ? 'Continue' : 'Start'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {personalizedCourses.length > 3 && (
            <div className="text-center mt-6">
              <Link to="/courses" className="inline-block text-blue-600 hover:text-blue-800 font-medium text-base py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                View all {personalizedCourses.length} courses →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4 text-base">No courses available based on your learning preferences.</p>
          <Link to="/courses" className="btn-primary inline-block w-full sm:w-auto">
            Browse All Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default PersonalizedCourses;
