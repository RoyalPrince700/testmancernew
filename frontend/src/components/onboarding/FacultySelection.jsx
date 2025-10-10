import React from 'react';

const FacultySelection = ({ faculties, formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Faculty</h2>
        <p className="text-gray-600">Which faculty are you studying in at {formData.university}?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select your faculty</label>
        <select
          name="faculty"
          value={formData.faculty}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Select your faculty</option>
          {faculties.map((faculty) => (
            <option key={faculty} value={faculty}>
              {faculty}
            </option>
          ))}
        </select>
      </div>

      {formData.faculty === '' && (
        <p className="text-sm text-gray-500 text-center">
          Please select your faculty to continue
        </p>
      )}
    </div>
  );
};

export default FacultySelection;
