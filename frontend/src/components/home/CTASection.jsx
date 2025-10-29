import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = ({ isAuthenticated }) => {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of students who are already excelling with TestMancer's gamified learning approach.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Continue Learning
            </Link>
          ) : (
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Get Started Free
            </Link>
          )}
          <Link
            to="/leaderboard"
            className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
