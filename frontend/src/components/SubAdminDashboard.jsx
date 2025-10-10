import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  MdHome,
  MdMenuBook,
  MdCloudUpload,
  MdBarChart,
  MdSchool,
  MdAccountBalance,
  MdGrade
} from 'react-icons/md';

// Import subadmin components
import {
  SubAdminOverview,
  SubAdminCoursesManagement,
  SubAdminMediaManagement,
  SubAdminAnalytics
} from './subadmin';

const SubAdminDashboard = () => {
  const { user, canManageCourses, assignedUniversities, assignedFaculties, assignedLevels } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navManagement = [
    { name: 'Dashboard', href: 'dashboard', icon: MdHome },
    { name: 'Courses', href: 'courses', icon: MdMenuBook },
    { name: 'Media', href: 'media', icon: MdCloudUpload },
  ];

  const navInsights = [
    { name: 'Analytics', href: 'analytics', icon: MdBarChart },
  ];

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
    <div className="min-h-screen bg-gray-50 text-[13px] text-gray-800 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-sm transition-all duration-300 ease-in-out border-r border-gray-200`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header (collapse control only) */}
          <div className="flex items-center justify-end px-3 py-4 border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700"
              aria-label="Toggle sidebar"
            >
              <svg className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            {sidebarOpen ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Assignment Scope */}
          {sidebarOpen && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-[11px] font-semibold text-gray-500 uppercase mb-2">Your Scope</p>
              <div className="space-y-1 text-xs">
                {assignedUniversities.length > 0 && (
                  <div className="flex items-center">
                    <MdSchool className="w-3 h-3 mr-2 text-gray-400" />
                    <span className="text-gray-600">{assignedUniversities.length} University(ies)</span>
                  </div>
                )}
                {assignedFaculties.length > 0 && (
                  <div className="flex items-center">
                    <MdAccountBalance className="w-3 h-3 mr-2 text-gray-400" />
                    <span className="text-gray-600">{assignedFaculties.length} Faculty(ies)</span>
                  </div>
                )}
                {assignedLevels.length > 0 && (
                  <div className="flex items-center">
                    <MdGrade className="w-3 h-3 mr-2 text-gray-400" />
                    <span className="text-gray-600">{assignedLevels.length} Level(s)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-6">
            <div>
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Content Management</p>
              )}
              <div className="space-y-1">
                {navManagement.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.href)}
                    className={`w-full flex items-center px-3 py-2.5 text-[13px] font-medium transition-colors relative ${
                      activeTab === item.href
                        ? 'text-gray-900 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${sidebarOpen ? 'mr-3' : ''}`} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Insights</p>
              )}
              <div className="space-y-1">
                {navInsights.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.href)}
                    className={`w-full flex items-center px-3 py-2.5 text-[13px] font-medium transition-colors relative ${
                      activeTab === item.href
                        ? 'text-gray-900 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${sidebarOpen ? 'mr-3' : ''}`} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-5">
            {activeTab === 'dashboard' && <SubAdminOverview />}
            {activeTab === 'courses' && <SubAdminCoursesManagement />}
            {activeTab === 'media' && <SubAdminMediaManagement />}
            {activeTab === 'analytics' && <SubAdminAnalytics />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubAdminDashboard;
