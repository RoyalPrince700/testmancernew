import React from 'react';
import { FaBook, FaTrophy, FaUsers, FaRocket } from 'react-icons/fa';

const FeaturesSection = () => {
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

  return (
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
  );
};

export default FeaturesSection;
