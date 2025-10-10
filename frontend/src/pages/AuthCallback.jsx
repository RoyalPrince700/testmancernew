import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(getErrorMessage(error));
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('No authentication token received');
          return;
        }

        // Handle the auth callback - this will set the token and fetch user data
        const success = handleAuthCallback(token);

        if (success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard...');

          // Redirect immediately since handleAuthCallback already navigates to dashboard
          // But we'll add a small delay for better UX
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, handleAuthCallback, navigate]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'oauth_config':
        return 'Google OAuth is not properly configured. Please contact support.';
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success':
        return <FaCheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="w-8 h-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">TestMancer</span>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>

            {/* Status Title */}
            <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>

            {/* Status Message */}
            <p className="text-gray-600 mb-8">
              {message}
            </p>

            {/* Action Button */}
            {status === 'error' && (
              <button
                onClick={() => navigate('/auth')}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <span>Try Again</span>
              </button>
            )}

            {/* Loading Animation */}
            {status === 'loading' && (
              <div className="flex justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-blue-200 h-3 w-3"></div>
                  <div className="rounded-full bg-blue-200 h-3 w-3"></div>
                  <div className="rounded-full bg-blue-200 h-3 w-3"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
