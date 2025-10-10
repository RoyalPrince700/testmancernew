import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBook, FaTrophy, FaUsers, FaRocket, FaCheckCircle, FaStar } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: FaBook,
      title: 'Interactive Courses',
      description: 'Comprehensive courses for WAEC, JAMB, TOEFL, IELTS, and undergraduate studies'
    },
    {
      icon: FaTrophy,
      title: 'Gamified Learning',
      description: 'Earn gems for correct answers and completed modules. Climb the leaderboard!'
    },
    {
      icon: FaUsers,
      title: 'Personalized Experience',
      description: 'Choose your learning goals and get content tailored to your needs'
    },
    {
      icon: FaRocket,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed progress tracking'
    }
  ];

  const learningPaths = [
    { name: 'WAEC', color: 'bg-blue-500', description: 'Nigerian secondary school certificate' },
    { name: 'JAMB', color: 'bg-green-500', description: 'University entrance examination' },
    { name: 'Post-UTME', color: 'bg-purple-500', description: 'University admission screening' },
    { name: 'TOEFL', color: 'bg-orange-500', description: 'Test of English as a Foreign Language' },
    { name: 'IELTS', color: 'bg-red-500', description: 'International English Language Testing' },
    { name: 'Undergraduate', color: 'bg-indigo-500', description: 'Degree program support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master Your Exams with
              <span className="block text-yellow-300">Gamified Learning</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              TestMancer transforms education into an engaging adventure. Earn gems, climb leaderboards,
              and excel in WAEC, JAMB, TOEFL, IELTS, and undergraduate studies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Start Learning
                </Link>
              )}
              <Link
                to="/courses"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TestMancer?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our gamified approach makes learning fun and effective, helping you achieve your academic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Learning Paths for Every Goal
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're preparing for exams or advancing your undergraduate studies,
              we have the perfect learning path for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className={`w-12 h-12 ${path.color} rounded-lg flex items-center justify-center mb-4`}>
                  <FaBook className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {path.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {path.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <FaCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Interactive quizzes & courses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-xl text-blue-100">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-xl text-blue-100">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-xl text-blue-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  );
};

export default Home;
