import React from 'react';
import { MdLibraryBooks, MdViewModule, MdDiamond } from 'react-icons/md';

const CourseOverviewCard = ({ totalCourses, totalUnits, userGems }) => {
  const stats = [
    {
      icon: MdLibraryBooks,
      label: 'Total Courses',
      value: totalCourses,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: MdViewModule,
      label: 'Total Units',
      value: totalUnits,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: MdDiamond,
      label: 'My Gems',
      value: userGems,
      color: 'pink',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    }
  ];

  return (
    <div className="card shadow-soft mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            <div className={`p-2 sm:p-2.5 rounded-full ${stat.bgColor} flex-shrink-0`}>
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 whitespace-normal">{stat.label}</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseOverviewCard;
