import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 text-sm">Here's an overview of your admin dashboard.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 hover:shadow-medium transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <MdMenuBook className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Courses</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? '...' : stats.courses.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 hover:shadow-medium transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <MdPeople className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? '...' : stats.users.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 hover:shadow-medium transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <MdCloudUpload className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Media Files</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? '...' : stats.media.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 hover:shadow-medium transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <MdBarChart className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Gems</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? '...' : stats.gems.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown */}
      {!loading && stats.users.total > 0 && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">User Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center bg-blue-50 rounded-lg p-3">
              <p className="text-lg font-semibold text-blue-600">{stats.users.admin || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Admins</p>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-3">
              <p className="text-lg font-semibold text-green-600">{stats.users.subadmin || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Sub-Admins</p>
            </div>
            <div className="text-center bg-purple-50 rounded-lg p-3">
              <p className="text-lg font-semibold text-purple-600">{stats.users.categoryAdmins || 0}</p>
              <p className="text-xs text-gray-600 font-medium">Category Admins</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <p className="text-lg font-semibold text-gray-600">{(stats.users.total || 0) - (stats.users.admin || 0) - (stats.users.subadmin || 0) - (stats.users.categoryAdmins || 0)}</p>
              <p className="text-xs text-gray-600 font-medium">Regular Users</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Chart */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Overview</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart
              data={[
                { name: 'Courses', value: stats.courses.total || 0 },
                { name: 'Users', value: stats.users.total || 0 },
                { name: 'Media', value: stats.media.total || 0 },
                { name: 'Gems', value: stats.gems.total || 0 }
              ]}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-xs">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
