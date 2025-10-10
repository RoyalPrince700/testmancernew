import React from 'react';

const DepartmentSelection = ({ departmentsByFaculty, formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Department</h2>
        <p className="text-gray-600">Which department are you studying in the {formData.faculty}?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select your department</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Select your department</option>
          {departmentsByFaculty[formData.faculty]?.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      {formData.department === '' && (
        <p className="text-sm text-gray-500 text-center">
          Please select your department to continue
        </p>
      )}
    </div>
  );
};

export default DepartmentSelection;
