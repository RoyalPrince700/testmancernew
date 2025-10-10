import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const UsernameStep = ({
  formData,
  handleInputChange,
  usernameChecking,
  usernameAvailable,
  generateUsername
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Username</h2>
        <p className="text-gray-600">Create a unique username to get started</p>
      </div>

      {/* Username Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a unique username
          <span className="text-xs text-gray-500 ml-2">(3-20 characters)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`input-field pr-12 ${
              usernameAvailable === false ? 'border-red-300' :
              usernameAvailable === true ? 'border-green-300' : ''
            }`}
            placeholder="Enter your username"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {usernameChecking ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            ) : usernameAvailable === true ? (
              <FaCheck className="text-green-500 text-sm" />
            ) : usernameAvailable === false ? (
              <FaTimes className="text-red-500 text-sm" />
            ) : null}
          </div>
        </div>
        {usernameAvailable === false && (
          <p className="text-red-500 text-sm mt-1">Username is already taken</p>
        )}
        {usernameAvailable === true && (
          <p className="text-green-500 text-sm mt-1">Username is available!</p>
        )}
        <button
          type="button"
          onClick={generateUsername}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Generate a username for me
        </button>
      </div>
    </div>
  );
};

export default UsernameStep;
