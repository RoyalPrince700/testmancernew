import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdHome,
  MdMenuBook,
  MdLeaderboard,
  MdPerson,
  MdSettings,
  MdHelp,
  MdMenu,
  MdClose
} from 'react-icons/md';

// Import dashboard components
import {
  DashboardOverview,
  RecentQuizzes,
  PersonalizedCourses,
  QuickActions
} from './dashboard';

const DashboardWithSidebar = ({ stats, recentQuizzes, personalizedCourses }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-hide sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const navItems = [
    { name: 'Overview', href: 'overview', icon: MdHome },
    { name: 'My Courses', href: 'courses', icon: MdMenuBook },
    { name: 'Recent Activity', href: 'activity', icon: MdLeaderboard },
    { name: 'Quick Actions', href: 'actions', icon: MdPerson },
    { name: 'Settings', href: 'settings', icon: MdSettings },
    { name: 'Help', href: 'help', icon: MdHelp },
  ];

  // Sync active tab with URL query param (?tab=...)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = new Set(navItems.map((n) => n.href));
    const nextTab = tabParam && validTabs.has(tabParam) ? tabParam : 'overview';
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [searchParams]);

  const selectTab = (tabKey) => {
    setActiveTab(tabKey);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabKey);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-[13px] text-gray-800">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-20 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <MdClose className="w-6 h-6" /> : <MdMenu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] ${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-sm transition-all duration-300 ease-in-out border-r border-gray-200 z-40 group
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}>
        {/* Collapsible Arrow - positioned at middle edge */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-50 p-1.5 rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {/* Arrow left when expanded */}
            {sidebarOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              /* Arrow right when collapsed */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        )}

        <div className="flex flex-col h-full">

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
            {sidebarOpen ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Student'}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-2 py-3 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    selectTab(item.href);
                    if (isMobile) setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`w-full flex items-center px-3 py-2.5 text-[13px] font-medium transition-colors relative ${
                    activeTab === item.href
                      ? 'text-gray-900 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${sidebarOpen ? 'mr-3' : ''}`} />
                  {sidebarOpen && <span>{item.name}</span>}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${!isMobile && (sidebarOpen ? 'ml-64' : 'ml-16')} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
        <main className="flex-1 overflow-y-auto">
          <div className={`p-5 ${isMobile ? 'pt-20' : ''}`}>
            {activeTab === 'overview' && <DashboardOverview stats={stats} />}
            {activeTab === 'courses' && <PersonalizedCourses personalizedCourses={personalizedCourses} />}
            {activeTab === 'activity' && <RecentQuizzes recentQuizzes={recentQuizzes} />}
            {activeTab === 'actions' && <QuickActions />}
            {activeTab === 'settings' && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600">Settings component coming soon...</p>
              </div>
            )}
            {activeTab === 'help' && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Help & Support</h2>
                <p className="text-gray-600">Help component coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardWithSidebar;
