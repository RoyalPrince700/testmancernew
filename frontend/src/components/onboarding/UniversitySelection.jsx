import React from 'react';

const UniversitySelection = ({ nigerianUniversities, formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your University</h2>
        <p className="text-gray-600">This helps us provide university-specific content and resources</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Choose your university</label>
        <select
          name="university"
          value={formData.university}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Select your university</option>
          {nigerianUniversities.map((university) => (
            <option key={university} value={university}>
              {university}
            </option>
          ))}
        </select>
      </div>

      {formData.university === '' && (
        <p className="text-sm text-gray-500 text-center">
          Please select your university to continue
        </p>
      )}
    </div>
  );
};

export default UniversitySelection;
