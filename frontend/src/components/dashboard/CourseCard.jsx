import React, { useState } from 'react';
import { MdPlayArrow, MdExpandMore, MdCheckCircle, MdQuiz, MdRadioButtonUnchecked, MdRadioButtonChecked } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, onCardClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const {
    courseId,
    courseCode,
    courseTitle,
    courseDescription,
    totalUnits,
    completedUnits,
    progressPercentage,
    unitLabel,
    units = []
  } = course;

  // Fun color palette - light and inviting
  const cardColors = {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    hover: 'hover:from-blue-100 hover:to-indigo-100',
    border: 'border-blue-200',
    progress: {
      bg: 'bg-blue-100',
      fill: 'bg-gradient-to-r from-blue-400 to-blue-600',
      glow: 'shadow-blue-200'
    }
  };

  // Handle unit click - navigate to first incomplete page or course detail
  const handleUnitClick = (unit) => {
    if (unit.isCompleted) {
      // If completed, navigate to course detail
      navigate(`/courses/${courseId}`);
    } else {
      // Navigate to course detail - the page will handle finding the first incomplete page
      navigate(`/courses/${courseId}`);
    }
  };

  // Get quiz status color
  const getQuizStatusColor = (isCompleted) => {
    return isCompleted ? 'text-green-600' : 'text-gray-400';
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 ${cardColors.border} ${cardColors.background} ${cardColors.hover}
        cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg
        ${isHovered ? 'shadow-xl' : 'shadow-md'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md mb-2">
              {courseCode?.toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
            {courseTitle?.charAt(0).toUpperCase() + courseTitle?.slice(1)}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {courseDescription || 'Start your learning journey with this comprehensive course'}
          </p>
        </div>

        {/* Expand Icon */}
        <div className={`
          p-1 rounded-full bg-white shadow-sm transition-all duration-300
          ${isHovered ? 'opacity-100 scale-110' : 'opacity-70 scale-100'}
        `}>
          <MdExpandMore className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        {/* Progress Text */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">
            {completedUnits} of {totalUnits} {unitLabel.toLowerCase()}s completed
          </span>
          <span className="text-gray-900 font-bold">
            {progressPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className={`w-full h-3 ${cardColors.progress.bg} rounded-full overflow-hidden shadow-inner`}>
            <div
              className={`
                h-full ${cardColors.progress.fill} rounded-full transition-all duration-700 ease-out
                ${isHovered ? `shadow-lg ${cardColors.progress.glow}` : ''}
                relative
              `}
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Shimmer effect on hover */}
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
              )}
            </div>
          </div>

          {/* Completion indicator */}
          {progressPercentage === 100 && (
            <div className="absolute -top-1 -right-1">
              <MdCheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full shadow-sm" />
            </div>
          )}
        </div>

        {/* Action Hint */}
        <div className={`
          flex items-center justify-center py-2 px-3 bg-white/50 rounded-lg transition-all duration-300
          ${isHovered ? 'bg-white/70' : ''}
        `}>
          <MdPlayArrow className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm text-blue-700 font-medium">
            {isExpanded ? 'Click to collapse units' : 'Click to expand and view units'}
          </span>
        </div>
      </div>

      {/* Expandable Unit Dropdown */}
      {isExpanded && units.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">📚</span>
            Course {unitLabel.toLowerCase()}s
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {units.map((unit, index) => (
              <div
                key={unit.unitId}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                  ${unit.isCompleted
                    ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                    : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
                  }
                `}
                onClick={() => handleUnitClick(unit)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  {/* Completion Status */}
                  <div className="mr-3">
                    {unit.isCompleted ? (
                      <MdCheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <MdRadioButtonUnchecked className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Unit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {unitLabel} {index + 1}: {unit.title}
                      </span>
                      {unit.hasQuizzes && (
                        <div className="ml-2 flex items-center">
                          <MdQuiz className={`w-4 h-4 ${getQuizStatusColor(unit.quizzesCompleted === unit.totalQuizzes)}`} />
                          <span className={`text-xs ml-1 ${getQuizStatusColor(unit.quizzesCompleted === unit.totalQuizzes)}`}>
                            {unit.quizzesCompleted}/{unit.totalQuizzes}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {unit.totalPages} {unit.totalPages === 1 ? 'page' : 'pages'}
                      {unit.isCompleted && (
                        <span className="ml-2 text-green-600 font-medium">✓ Completed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="ml-3">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        unit.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${unit.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full transform translate-x-6 -translate-y-6" />
      </div>
    </div>
  );
};

export default CourseCard;
