import React from 'react';
import { MdCelebration, MdDiamond } from 'react-icons/md';

const CongratulationModal = ({
  isOpen,
  onClose,
  onTakeQuiz,
  gemsEarned = 3,
  moduleTitle = 'Module',
  username = '',
  isFirstCompletion = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="px-6 py-8 text-center">
          {/* Celebration Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <MdCelebration className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Congratulations{username ? `, ${username}` : ''}!
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-4">
            You've successfully completed <strong>{moduleTitle}</strong>
          </p>

          {/* Additional Encouragement */}
          <p className="text-sm text-gray-500 mb-6">
            {isFirstCompletion ? (
              <>Great job! Keep up the momentum! Complete more courses to earn even more gems and advance your learning journey.</>
            ) : (
              <>You've previously completed this module. No gems awarded this time, but great job completing it again!</>
            )}
          </p>

          {/* Gems Earned - only show if gems were earned */}
          {gemsEarned > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <MdDiamond className="w-5 h-5 text-pink-600" />
                <span className="text-lg font-semibold text-pink-600">
                  +{gemsEarned} Gems Earned!
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onTakeQuiz}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Take Quiz
            </button>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationModal;
