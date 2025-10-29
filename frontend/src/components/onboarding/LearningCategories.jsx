import React from 'react';

const LearningCategories = ({ learningCategories, formData, handleCategoryToggle }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Learning Path</h2>
        <p className="text-gray-600 mb-2">Select the exams or courses you're preparing for</p>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
          <span className="mr-1">✓</span>
          Select multiple options
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryToggle(category.id)}
            className={`p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
              formData.learningCategories.includes(category.id)
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              <div className="text-3xl mr-4 text-gray-600">
                <category.icon />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{category.label}</div>
                <div className="text-sm text-gray-600">{category.description}</div>
                <div className="text-xs text-blue-600 mt-1">{category.courseCount} courses available</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {formData.learningCategories.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          Please select at least one learning path to continue
        </p>
      )}

      {formData.learningCategories.length > 0 && (
        <p className="text-sm text-blue-600 text-center font-medium">
          {formData.learningCategories.length} selected • Tap to add or remove options
        </p>
      )}
    </div>
  );
};

export default LearningCategories;
