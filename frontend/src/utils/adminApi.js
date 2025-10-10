import axios from 'axios';

// Base API functions for admin operations

// Course CRUD operations
export const courseApi = {
  // Get all courses for admin (scoped by role)
  getCourses: async () => {
    try {
      const response = await axios.get('/api/courses/admin/courses');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch courses'
      };
    }
  },

  // Create course
  createCourse: async (courseData) => {
    try {
      const response = await axios.post('/api/courses/admin/courses', courseData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create course'
      };
    }
  },

  // Update course
  updateCourse: async (courseId, updates) => {
    try {
      const response = await axios.put(`/api/courses/admin/courses/${courseId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update course'
      };
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      await axios.delete(`/api/courses/admin/courses/${courseId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete course'
      };
    }
  }
};

// Module CRUD operations
export const moduleApi = {
  // Get all modules for a course
  getModules: async (courseId) => {
    try {
      const response = await axios.get(`/api/courses/admin/courses/${courseId}/modules`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch modules'
      };
    }
  },

  // Create module
  createModule: async (courseId, moduleData) => {
    try {
      const response = await axios.post(`/api/courses/admin/courses/${courseId}/modules`, moduleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create module'
      };
    }
  },

  // Update module
  updateModule: async (courseId, moduleId, updates) => {
    try {
      const response = await axios.put(`/api/courses/admin/courses/${courseId}/modules/${moduleId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update module'
      };
    }
  },

  // Delete module
  deleteModule: async (courseId, moduleId) => {
    try {
      await axios.delete(`/api/courses/admin/courses/${courseId}/modules/${moduleId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete module'
      };
    }
  }
};

// Page CRUD operations
export const pageApi = {
  // Get all pages for a module
  getPages: async (courseId, moduleId) => {
    try {
      const response = await axios.get(`/api/courses/admin/courses/${courseId}/modules/${moduleId}/pages`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch pages'
      };
    }
  },

  // Create page
  createPage: async (courseId, moduleId, pageData) => {
    try {
      const response = await axios.post(`/api/courses/admin/courses/${courseId}/modules/${moduleId}/pages`, pageData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create page'
      };
    }
  },

  // Update page
  updatePage: async (courseId, moduleId, pageId, updates) => {
    try {
      const response = await axios.put(`/api/courses/admin/courses/${courseId}/modules/${moduleId}/pages/${pageId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update page'
      };
    }
  },

  // Delete page
  deletePage: async (courseId, moduleId, pageId) => {
    try {
      await axios.delete(`/api/courses/admin/courses/${courseId}/modules/${moduleId}/pages/${pageId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete page'
      };
    }
  }
};

// Quiz CRUD operations
export const quizApi = {
  // Get all quizzes for admin (scoped by role)
  getQuizzes: async () => {
    try {
      const response = await axios.get('/api/quizzes/admin/quizzes');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch quizzes'
      };
    }
  },

  // Create quiz
  createQuiz: async (quizData) => {
    try {
      const response = await axios.post('/api/quizzes/admin/quizzes', quizData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create quiz'
      };
    }
  },

  // Update quiz
  updateQuiz: async (quizId, updates) => {
    try {
      const response = await axios.put(`/api/quizzes/admin/quizzes/${quizId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update quiz'
      };
    }
  },

  // Delete quiz
  deleteQuiz: async (quizId) => {
    try {
      await axios.delete(`/api/quizzes/admin/quizzes/${quizId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete quiz'
      };
    }
  }
};

// User management operations
export const userApi = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await axios.get('/api/users/admin/all');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users'
      };
    }
  },

  // Get user details
  getUser: async (userId) => {
    try {
      const response = await axios.get(`/api/users/admin/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user'
      };
    }
  },

  // Update user role
  updateUserRole: async (userId, roleData) => {
    try {
      const response = await axios.put(`/api/users/admin/${userId}/role`, roleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user role'
      };
    }
  },

  // Delete user (if needed)
  deleteUser: async (userId) => {
    try {
      await axios.delete(`/api/users/admin/${userId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  },

  // Get admin dashboard statistics
  getStats: async () => {
    try {
      const response = await axios.get('/api/users/admin/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stats'
      };
    }
  }
};

// Combined admin API object
export const adminApi = {
  courses: courseApi,
  modules: moduleApi,
  pages: pageApi,
  quizzes: quizApi,
  users: userApi
};
