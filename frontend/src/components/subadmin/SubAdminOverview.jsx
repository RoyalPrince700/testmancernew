import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { MdSchool, MdAccountBalance, MdGrade, MdMenuBook, MdPeople, MdQuiz } from 'react-icons/md';

const SubAdminOverview = () => {
  const { user, assignedUniversities, assignedFaculties, assignedLevels } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    quizzes: 0,
    students: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        setStats({
          courses: response.data.courses || 0,
          quizzes: response.data.quizzes || 0,
          students: response.data.students || 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch subadmin stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'subadmin':
        return 'Faculty Admin';
      case 'waec_admin':
        return 'WAEC Admin';
      case 'jamb_admin':
        return 'JAMB Admin';
      default:
        return 'Sub Admin';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'subadmin':
        return 'You can manage courses and content for your assigned universities, faculties, and levels.';
      case 'waec_admin':
        return 'You can manage all WAEC-related courses and content.';
      case 'jamb_admin':
        return 'You can manage all JAMB-related courses and content.';
      default:
        return 'You have restricted admin privileges for content management.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sub Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name}! Manage content within your assigned scope.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Role</div>
            <div className="font-semibold text-gray-900">{getRoleDisplayName(user?.role)}</div>
          </div>
        </div>
      </div>

      {/* Role Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Your Permissions</h3>
            <p className="mt-1 text-sm text-blue-700">
              {getRoleDescription(user?.role)}
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Scope */}
      {(assignedUniversities.length > 0 || assignedFaculties.length > 0 || assignedLevels.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Assigned Scope</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assignedUniversities.length > 0 && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <MdSchool className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{assignedUniversities.length} Universities</div>
                  <div className="text-sm text-gray-500">Assigned institutions</div>
                </div>
              </div>
            )}
            {assignedFaculties.length > 0 && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <MdAccountBalance className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{assignedFaculties.length} Faculties</div>
                  <div className="text-sm text-gray-500">Assigned departments</div>
                </div>
              </div>
            )}
            {assignedLevels.length > 0 && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <MdGrade className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{assignedLevels.length} Levels</div>
                  <div className="text-sm text-gray-500">Academic levels</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdMenuBook className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Courses Managed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.courses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdQuiz className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quizzes Created</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.quizzes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdPeople className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students Served</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.students}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MdMenuBook className="w-5 h-5 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Manage Courses</div>
              <div className="text-sm text-gray-500">Create, edit, or delete courses in your scope</div>
            </div>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MdQuiz className="w-5 h-5 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Create Quizzes</div>
              <div className="text-sm text-gray-500">Add assessments to your courses</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubAdminOverview;
