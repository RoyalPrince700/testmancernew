import React from 'react';

const StatsSection = () => {
  return (
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
  );
};

export default StatsSection;
