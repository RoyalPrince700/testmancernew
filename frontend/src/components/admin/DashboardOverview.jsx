import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-hot-toast';
import { MdMenuBook, MdPeople, MdCloudUpload, MdBarChart } from 'react-icons/md';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0 },
    courses: { total: 0 },
    media: { total: 0 },
    gems: { total: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const result = await adminApi.users.getStats();
    if (result.success) {
      setStats(result.data);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-1 text-sm">Here's an overview of your admin dashboard.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MdMenuBook className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Courses</p>
              <p className="text-xl font-bold text-gray-900">
                {loading ? '...' : stats.courses.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <MdPeople className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Users</p>
              <p className="text-xl font-bold text-gray-900">
                {loading ? '...' : stats.users.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <MdCloudUpload className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Media Files</p>
              <p className="text-xl font-bold text-gray-900">
                {loading ? '...' : stats.media.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <MdBarChart className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Gems</p>
              <p className="text-xl font-bold text-gray-900">
                {loading ? '...' : stats.gems.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown */}
      {!loading && stats.users.total > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">User Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center bg-blue-50 rounded-lg p-3">
              <p className="text-xl font-bold text-blue-600">{stats.users.admin || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Admins</p>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-3">
              <p className="text-xl font-bold text-green-600">{stats.users.subadmin || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Sub-Admins</p>
            </div>
            <div className="text-center bg-purple-50 rounded-lg p-3">
              <p className="text-xl font-bold text-purple-600">{stats.users.categoryAdmins || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Category Admins</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-gray-600">{(stats.users.total || 0) - (stats.users.admin || 0) - (stats.users.subadmin || 0) - (stats.users.categoryAdmins || 0)}</p>
              <p className="text-xs text-gray-600 font-medium">Regular Users</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-sm">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
