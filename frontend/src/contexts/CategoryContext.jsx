import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CategoryContext = createContext();

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Initialize category on user login or when user data is available
  useEffect(() => {
    if (user && user.learningCategories && user.learningCategories.length > 0) {
      // Set the first available category as default, preferring postutme if available
      const defaultCategory = user.learningCategories.includes('postutme')
        ? 'postutme'
        : user.learningCategories[0];
      setSelectedCategory(defaultCategory);
    }
  }, [user]);

  // Update category and persist to localStorage
  const updateSelectedCategory = (category) => {
    if (user && user.learningCategories && user.learningCategories.includes(category)) {
      setSelectedCategory(category);
      localStorage.setItem(`selectedCategory_${user.googleId}`, category);
    }
  };

  // Load category from localStorage on mount
  useEffect(() => {
    if (user && user.googleId) {
      const savedCategory = localStorage.getItem(`selectedCategory_${user.googleId}`);
      if (savedCategory && user.learningCategories && user.learningCategories.includes(savedCategory)) {
        setSelectedCategory(savedCategory);
      }
    }
  }, [user]);

  const value = {
    selectedCategory,
    updateSelectedCategory,
    availableCategories: user?.learningCategories || [],
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;
