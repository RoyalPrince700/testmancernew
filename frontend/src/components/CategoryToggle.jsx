import React from 'react';
import { useCategory } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';

const CategoryToggle = () => {
  const { selectedCategory, updateSelectedCategory, availableCategories } = useCategory();
  const { role } = useAuth();

  // Category configuration with display names and colors
  const categoryConfig = {
    'waec': {
      label: 'WAEC',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      activeColor: 'bg-blue-600'
    },
    'jamb': {
      label: 'JAMB',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      activeColor: 'bg-green-600'
    },
    'toefl': {
      label: 'TOEFL',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      activeColor: 'bg-orange-600'
    },
    'ielts': {
      label: 'IELTS',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      activeColor: 'bg-red-600'
    },
    'postutme': {
      label: 'Post-UTME',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      activeColor: 'bg-purple-600'
    },
    'undergraduate': {
      label: 'Undergraduate',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      activeColor: 'bg-indigo-600'
    }
  };

  // Filter categories based on role
  let filteredCategories = availableCategories;

  if (role === 'waec_admin') {
    filteredCategories = availableCategories.filter(cat => cat === 'waec');
  } else if (role === 'jamb_admin') {
    filteredCategories = availableCategories.filter(cat => cat === 'jamb');
  }

  // Don't render if only one category is available or no categories after filtering
  if (filteredCategories.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm font-medium text-gray-600 mr-2">Study Mode:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {filteredCategories.map((category) => {
            const config = categoryConfig[category];
            if (!config) return null;

            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => updateSelectedCategory(category)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${isActive
                    ? `${config.activeColor} text-white shadow-sm`
                    : `text-gray-700 ${config.hoverColor} hover:text-white`
                  }
                `}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryToggle;
