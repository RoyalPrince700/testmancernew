// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock axios for API calls
import axios from 'axios';
jest.mock('axios');

// Mock react-router-dom
import { BrowserRouter } from 'react-router-dom';
const MockRouter = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

export { MockRouter };

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    h1: 'h1',
    p: 'p'
  },
  AnimatePresence: ({ children }) => children
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn()
  }
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => jest.fn(() => ({ userId: 'test-user-id' })));

// Mock AuthContext
export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    role: 'subadmin',
    gems: 0
  },
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true,
  isLoading: false
};

jest.mock('./contexts/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children(mockAuthContext)
  },
  useAuth: () => mockAuthContext
}));

// Global test utilities
global.testUtils = {
  // Helper to render components with router
  renderWithRouter: (component) => {
    const { render } = require('@testing-library/react');
    return render(<MockRouter>{component}</MockRouter>);
  },

  // Helper to mock API responses
  mockApiResponse: (method, url, response) => {
    axios[method].mockResolvedValueOnce(response);
  },

  // Helper to mock API error
  mockApiError: (method, url, error) => {
    axios[method].mockRejectedValueOnce(error);
  }
};
