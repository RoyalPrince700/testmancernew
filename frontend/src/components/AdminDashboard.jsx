import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

// Import admin components
import {
  DashboardOverview,
  CoursesManagement,
  UsersManagement,
  MediaManagement,
  Analytics,
  Settings
} from './admin';
// DashboardLayout removed - now using global AppLayout
// menus removed - now handled by global layout

const AdminDashboard = () => {
  const { user, canManageCourses, canManageUsers } = useAuth();
  const { activeTab } = useNavigation();

  if (!canManageCourses) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-5">
      {activeTab === 'dashboard' && <DashboardOverview />}
      {activeTab === 'courses' && <CoursesManagement />}
      {activeTab === 'users' && canManageUsers && <UsersManagement />}
      {activeTab === 'media' && <MediaManagement />}
      {activeTab === 'analytics' && <Analytics />}
      {activeTab === 'settings' && <Settings />}
    </div>
  );
};

export default AdminDashboard;
