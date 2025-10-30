import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

// Import subadmin components
import {
  SubAdminOverview,
  SubAdminCoursesManagement,
  SubAdminAssessmentManagement,
  SubAdminResourcesManagement,
  SubAdminMediaManagement,
  SubAdminAnalytics
} from './subadmin';

// Import bottom navigation
import SubAdminBottomNav from './SubAdminBottomNav';
// DashboardLayout removed - now using global AppLayout
// menus removed - now handled by global layout

const SubAdminDashboard = () => {
  const { user, canManageCourses, assignedUniversities, assignedFaculties, assignedLevels, assignedDepartments } = useAuth();
  const { activeTab } = useNavigation();
  // We rely on shared desktop sidebar; mobile handled by SubAdminBottomNav

  if (!canManageCourses) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the subadmin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-container py-5">
        {activeTab === 'dashboard' && <SubAdminOverview />}
        {activeTab === 'courses' && <SubAdminCoursesManagement />}
        {activeTab === 'assessments' && <SubAdminAssessmentManagement />}
        {activeTab === 'resources' && <SubAdminResourcesManagement />}
        {activeTab === 'media' && <SubAdminMediaManagement />}
        {activeTab === 'analytics' && <SubAdminAnalytics />}
      </div>

      {/* Bottom Navigation for Mobile */}
      <SubAdminBottomNav />
    </>
  );
};

export default SubAdminDashboard;
