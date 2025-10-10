import React from 'react';

const LevelSelection = ({ levels, formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Level</h2>
        <p className="text-gray-600">What level are you currently in your studies?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select your level</label>
        <select
          name="level"
          value={formData.level}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Select your level</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {formData.level === '' && (
        <p className="text-sm text-gray-500 text-center">
          Please select your level to continue
        </p>
      )}
    </div>
  );
};

export default LevelSelection;
