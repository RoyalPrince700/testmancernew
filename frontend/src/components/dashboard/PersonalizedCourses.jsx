import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdExpandMore, MdCheckCircle, MdRadioButtonUnchecked, MdQuiz, MdPlayArrow } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { CourseOverviewCard } from './index';
import Card from '../ui/Card';

// Gradient themes for course covers
const GRADIENT_THEMES = {
  'ocean-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'sunset-orange': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'forest-green': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'royal-purple': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'fire-red': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'cosmic-purple': 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
  'mint-fresh': 'linear-gradient(135deg, #00F260 0%, #0575E6 100%)',
  'golden-sunset': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'arctic-blue': 'linear-gradient(135deg, #74c0fc 0%, #339af0 100%)',
  'rose-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)'
};

const PersonalizedCourses = ({ personalizedCourses = [], courseProgress = [] }) => {
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate overview statistics
  const totalCourses = personalizedCourses.length;
  const totalUnits = personalizedCourses.reduce((sum, course) => sum + (course.units || 0), 0);
  const userGems = user?.gems || 0;

  const toggleExpand = (courseId) => {
    setExpandedCourseId(prev => (prev === courseId ? null : courseId));
  };

  return (
    <div className="space-y-6">
      <CourseOverviewCard
        totalCourses={totalCourses}
        totalUnits={totalUnits}
        userGems={userGems}
      />

      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6">Your Courses</h2>
        {personalizedCourses.length > 0 ? (
          <>
            {/* Beautiful Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {personalizedCourses.map((course) => {
                const progressDetail = courseProgress.find(cp => cp.courseId === course._id);
                const percentage = (
                  progressDetail?.progressPercentage ??
                  course.progress?.overallProgressPercentage ??
                  course.progress?.unitProgressPercentage ??
                  course.progress?.progressPercentage ??
                  0
                );
                const statusLabel = percentage === 100 ? 'Completed' : percentage > 0 ? 'In Progress' : 'Not Started';
                const statusClass = percentage === 100
                  ? 'bg-green-100 text-green-800'
                  : percentage > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800';

                const gradientStyle = {
                  background: GRADIENT_THEMES[course.theme] || GRADIENT_THEMES['ocean-blue']
                };

                return (
                  <div
                    key={course._id}
                    className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {/* Gradient Header */}
                    <div
                      className="h-24 relative overflow-hidden"
                      style={gradientStyle}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1">
                          <span className={`text-xs font-medium ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 mb-1">
                          {course.courseCode && (
                            <span className="inline-block bg-white bg-opacity-90 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {course.courseCode?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                          {course.title?.charAt(0).toUpperCase() + course.title?.slice(1)}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Progress and Stats */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Progress:</span>
                            <span className="font-medium text-gray-900">{percentage}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Units:</span>
                            <span className="font-medium text-gray-900">
                              {progressDetail?.totalUnits ?? course.progress?.totalUnits ?? course.units ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (percentage === 100) {
                              toast.success('Course completed! 🎉');
                            } else {
                              navigate(`/courses/${course._id}`);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md"
                        >
                          <MdPlayArrow className="w-4 h-4" />
                          {percentage === 100 ? 'Review Course' : percentage > 0 ? 'Continue Learning' : 'Start Course'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
      </Card>
    </div>
  );
};

export default PersonalizedCourses;

