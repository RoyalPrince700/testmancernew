import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdExpandMore, MdCheckCircle, MdRadioButtonUnchecked, MdQuiz } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { CourseOverviewCard } from './index';
import Card from '../ui/Card';

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
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Your Courses</h2>
        {personalizedCourses.length > 0 ? (
          <>
            {/* Mobile: Card list */}
            <div className="block sm:hidden space-y-3">
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
                const isExpanded = expandedCourseId === course._id;
                return (
                  <div
                    key={course._id}
                    className={`border border-gray-200 rounded-lg p-4 ${isExpanded ? 'bg-gray-50' : 'bg-white'} hover:border-gray-300 transition-colors`}
                    onClick={() => toggleExpand(course._id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {course.courseCode && (
                            <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {course.courseCode?.toUpperCase()}
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900 truncate">{course.title?.charAt(0).toUpperCase() + course.title?.slice(1)}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{course.description}</p>
                      </div>
                      <div className={`p-1 rounded-full bg-white shadow-sm ${isExpanded ? 'opacity-100' : 'opacity-80'}`}>
                        <MdExpandMore className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Number.isInteger(progressDetail?.totalUnits ?? course.progress?.totalUnits ?? course.units) && (progressDetail?.totalUnits ?? course.progress?.totalUnits ?? course.units) > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[12px]">
                            {progressDetail?.totalUnits ?? course.progress?.totalUnits ?? course.units}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No units</span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusClass}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[11px] text-gray-500">{percentage}%</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📚</span>
                          {progressDetail?.unitLabel || 'Modules'}
                        </h4>
                        {progressDetail?.units?.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {progressDetail.units.map((unit, index) => (
                              <div
                                key={unit.unitId || index}
                                onClick={() => {
                                  const visible = course.modules?.find(m => m._id?.toString() === (unit.unitId || unit._id)?.toString());
                                  if (visible) {
                                    navigate(`/courses/${course._id}?moduleId=${visible._id}`);
                                  } else {
                                    toast.error('This chapter is not available yet.');
                                  }
                                }}
                                className={`
                                  p-3 rounded-lg border transition-all duration-200 cursor-pointer
                                  ${unit.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
                                `}
                              >
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="mr-3">
                                    {unit.isCompleted ? (
                                      <MdCheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <MdRadioButtonUnchecked className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-900 truncate">
                                        {(progressDetail.unitLabel || 'Module')} {index + 1}: {unit.title}
                                      </span>
                                      {unit.hasQuizzes && (
                                        <div className="ml-2 flex items-center">
                                          <MdQuiz className={`w-4 h-4 ${unit.quizzesCompleted === unit.totalQuizzes ? 'text-green-600' : 'text-gray-400'}`} />
                                          <span className={`text-xs ml-1 ${unit.quizzesCompleted === unit.totalQuizzes ? 'text-green-600' : 'text-gray-400'}`}>
                                            {unit.quizzesCompleted}/{unit.totalQuizzes}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {unit.totalPages} {unit.totalPages === 1 ? 'page' : 'pages'}
                                    </div>
                                  </div>
                                </div>
                                {/* No per-module progress bar; only show completed state */}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No unit details available</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <div className="overflow-x-auto hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">NO</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {personalizedCourses.map((course, index) => {
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
                  return (
                    <React.Fragment key={course._id}>
                      <tr
                        key={course._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpand(course._id)}
                        aria-expanded={expandedCourseId === course._id}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs sm:max-w-sm">
                            <div className="flex items-center gap-2">
                              {course.courseCode && (
                                <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {course.courseCode?.toUpperCase()}
                                </span>
                              )}
                              <span className="text-sm font-medium text-gray-900 truncate">{course.title?.charAt(0).toUpperCase() + course.title?.slice(1)}</span>
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2 mt-1">{course.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {Number.isInteger(progressDetail?.totalUnits ?? course.progress?.totalUnits ?? course.units) && (progressDetail?.totalUnits ?? course.progress?.totalUnits ?? course.units) > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[12px]">
                              {progressDetail?.totalUnits ?? course.progress?.totalUnits ?? course.units}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No units</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                              {statusLabel}
                            </span>
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(course._id);
                            }}
                            className="inline-flex items-center px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700"
                            aria-label="Toggle course modules"
                            aria-expanded={expandedCourseId === course._id}
                          >
                            <MdExpandMore className={`w-5 h-5 transition-transform ${expandedCourseId === course._id ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {expandedCourseId === course._id && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50">
                            <div className="px-6 py-4">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="mr-2">📚</span>
                                {progressDetail?.unitLabel || 'Modules'}
                              </h4>
                              {progressDetail?.units?.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {progressDetail.units.map((unit, index) => (
                                    <div
                                      key={unit.unitId || index}
                                      onClick={() => {
                                        const visible = course.modules?.find(m => m._id?.toString() === (unit.unitId || unit._id)?.toString());
                                        if (visible) {
                                          navigate(`/courses/${course._id}?moduleId=${visible._id}`);
                                        } else {
                                          toast.error('This chapter is not available yet.');
                                        }
                                      }}
                                      className={`
                                        flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                                        ${unit.isCompleted
                                          ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-default'
                                          : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'}
                                      `}
                                    >
                                      <div className="flex items-center flex-1 min-w-0">
                                        <div className="mr-3">
                                          {unit.isCompleted ? (
                                            <MdCheckCircle className="w-5 h-5 text-green-600" />
                                          ) : (
                                            <MdRadioButtonUnchecked className="w-5 h-5 text-gray-400" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                              {(progressDetail.unitLabel || 'Module')} {index + 1}: {unit.title}
                                            </span>
                                            {unit.hasQuizzes && (
                                              <div className="ml-2 flex items-center">
                                                <MdQuiz className={`w-4 h-4 ${unit.quizzesCompleted === unit.totalQuizzes ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className={`text-xs ml-1 ${unit.quizzesCompleted === unit.totalQuizzes ? 'text-green-600' : 'text-gray-400'}`}>
                                                  {unit.quizzesCompleted}/{unit.totalQuizzes}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-600 mt-1">
                                            {unit.totalPages} {unit.totalPages === 1 ? 'page' : 'pages'}
                                          </div>
                                        </div>
                                      </div>
                                      {/* No per-module progress bar; only show completed state */}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No unit details available</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
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

      {/* Interactive Course Cards removed; logic integrated into expandable rows above */}
    </div>
  );
};

export default PersonalizedCourses;

