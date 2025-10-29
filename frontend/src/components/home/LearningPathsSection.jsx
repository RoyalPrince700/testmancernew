import React from 'react';
import { FaBook, FaCheckCircle } from 'react-icons/fa';

const LearningPathsSection = () => {
  const learningPaths = [
    { name: 'WAEC', color: 'bg-blue-500', description: 'Nigerian secondary school certificate' },
    { name: 'JAMB', color: 'bg-green-500', description: 'University entrance examination' },
    { name: 'Post-UTME', color: 'bg-purple-500', description: 'University admission screening' },
    { name: 'TOEFL', color: 'bg-orange-500', description: 'Test of English as a Foreign Language' },
    { name: 'IELTS', color: 'bg-red-500', description: 'International English Language Testing' },
    { name: 'Undergraduate', color: 'bg-indigo-500', description: 'Degree program support' }
  ];

  return (
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
  );
};

export default LearningPathsSection;
