import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaTrophy, FaUsers } from 'react-icons/fa';

const HeroSection = ({ isAuthenticated }) => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
              <FaBook className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your Exams with
              <span className="block text-blue-600">TestMancer</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your learning journey into an engaging adventure. Earn gems, climb leaderboards,
            and excel in WAEC, JAMB, TOEFL, IELTS, and undergraduate studies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Continue Learning
              </Link>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Start Your Journey
              </Link>
            )}
            <Link
              to="/courses"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-200"
            >
              Explore Courses
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <FaTrophy className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gamified Learning</h3>
              <p className="text-gray-600 text-sm">Earn rewards as you progress</p>
            </div>
            <div className="flex flex-col items-center">
              <FaBook className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Courses</h3>
              <p className="text-gray-600 text-sm">WAEC, JAMB, TOEFL, IELTS & more</p>
            </div>
            <div className="flex flex-col items-center">
              <FaUsers className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Experience</h3>
              <p className="text-gray-600 text-sm">Tailored to your learning goals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
