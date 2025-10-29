import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { MdSchool, MdAccountBalance, MdGrade, MdMenuBook, MdPeople, MdQuiz } from 'react-icons/md';

const SubAdminOverview = () => {
  const { user, assignedUniversities, assignedFaculties, assignedLevels, assignedDepartments } = useAuth();
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
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Sub Admin Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Welcome back, {user?.name}! Manage content within your assigned scope.
            </p>
          </div>
          <div className="mt-3 md:mt-0 md:text-right">
            <div className="text-xs text-gray-500">Role</div>
            <div className="font-semibold text-gray-900 text-sm">{getRoleDisplayName(user?.role)}</div>
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
            <p className="mt-1 text-xs text-blue-700">
              {getRoleDescription(user?.role)}
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Scope */}
      {(assignedUniversities.length > 0 || assignedFaculties.length > 0 || assignedDepartments.length > 0 || assignedLevels.length > 0) && (
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Your Assigned Scope</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assignedUniversities.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MdSchool className="w-5 h-5 text-blue-600 mr-2" />
                  <div className="font-medium text-gray-900 text-sm">Universities</div>
                </div>
                <div className="text-xs text-blue-700 font-medium mb-1">({assignedUniversities.length} assigned)</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {assignedUniversities.join(', ')}
                </div>
              </div>
            )}
            {assignedFaculties.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MdAccountBalance className="w-5 h-5 text-green-600 mr-2" />
                  <div className="font-medium text-gray-900 text-sm">Faculties</div>
                </div>
                <div className="text-xs text-green-700 font-medium mb-1">({assignedFaculties.length} assigned)</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {assignedFaculties.join(', ')}
                </div>
              </div>
            )}
            {assignedDepartments.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MdSchool className="w-5 h-5 text-orange-600 mr-2" />
                  <div className="font-medium text-gray-900 text-sm">Departments</div>
                </div>
                <div className="text-xs text-orange-700 font-medium mb-1">({assignedDepartments.length} assigned)</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {assignedDepartments.join(', ')}
                </div>
              </div>
            )}
            {assignedLevels.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MdGrade className="w-5 h-5 text-purple-600 mr-2" />
                  <div className="font-medium text-gray-900 text-sm">Levels</div>
                </div>
                <div className="text-xs text-purple-700 font-medium mb-1">({assignedLevels.length} assigned)</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {assignedLevels.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <MdMenuBook className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Courses Managed</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.loading ? '...' : stats.courses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
              <MdQuiz className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Quizzes Created</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.loading ? '...' : stats.quizzes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
              <MdPeople className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Students Served</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.loading ? '...' : stats.students}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Content Overview</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart
              data={[
                { name: 'Courses', value: stats.courses || 0 },
                { name: 'Quizzes', value: stats.quizzes || 0 },
                { name: 'Students', value: stats.students || 0 }
              ]}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
    </div>
  );
};

export default SubAdminOverview;
