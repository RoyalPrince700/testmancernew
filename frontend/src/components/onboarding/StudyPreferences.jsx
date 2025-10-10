import React from 'react';

const StudyPreferences = ({ studyFrequencies, studyTimes, formData, handlePreferenceChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Study Preferences</h2>
        <p className="text-gray-600">Help us personalize your learning experience</p>
      </div>

      {/* Study Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">How often do you want to study?</label>
        <div className="space-y-3">
          {studyFrequencies.map((frequency) => (
            <label
              key={frequency.value}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.studyPreferences.frequency === frequency.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={frequency.value}
                checked={formData.studyPreferences.frequency === frequency.value}
                onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{frequency.label}</div>
                <div className="text-sm text-gray-600">{frequency.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Study Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">When do you prefer to study?</label>
        <div className="space-y-3">
          {studyTimes.map((time) => (
            <label
              key={time.value}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.studyPreferences.timeOfDay === time.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="timeOfDay"
                value={time.value}
                checked={formData.studyPreferences.timeOfDay === time.value}
                onChange={(e) => handlePreferenceChange('timeOfDay', e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="flex items-center">
                  <time.icon className="mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{time.label}</div>
                    <div className="text-sm text-gray-600">{time.description}</div>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="notifications"
          checked={formData.studyPreferences.notifications}
          onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
          className="mr-3"
        />
        <label htmlFor="notifications" className="text-sm text-gray-700">
          Send me reminders and study notifications
        </label>
      </div>

      {formData.studyPreferences.frequency === '' && (
        <p className="text-sm text-gray-500 text-center">
          Please select your study frequency to continue
        </p>
      )}
    </div>
  );
};

export default StudyPreferences;
