import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaChartBar, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SubAdminBottomNav = () => {
  const { isAuthenticated, canManageCourses } = useAuth();
  const location = useLocation();

  const pathname = location.pathname;
  const params = new URLSearchParams(location.search);
  const currentTab = params.get('tab');

  const dashboardActive = pathname === '/subadmin' && (!currentTab || currentTab === 'dashboard');
  const coursesActive = pathname === '/subadmin' && currentTab === 'courses';
  const assessmentsActive = pathname === '/subadmin' && currentTab === 'assessments';
  const resourcesActive = pathname === '/subadmin' && currentTab === 'resources';

  // Only show on subadmin routes
  if (!pathname.startsWith('/subadmin')) return null;

  if (!isAuthenticated || !canManageCourses) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t md:hidden pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around py-2 px-1">
        <li>
          <NavLink
            to="/subadmin?tab=dashboard"
            className={`flex flex-col items-center gap-0.5 text-[10px] px-1 text-gray-600 pb-1 ${
              dashboardActive ? 'border-b-2 border-green-600' : ''
            }`}
          >
            <FaHome className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/subadmin?tab=courses"
            className={`flex flex-col items-center gap-0.5 text-[10px] px-1 text-gray-600 pb-1 ${
              coursesActive ? 'border-b-2 border-green-600' : ''
            }`}
          >
            <FaBook className="w-4 h-4" />
            <span>Courses</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/subadmin?tab=assessments"
            className={`flex flex-col items-center gap-0.5 text-[10px] px-1 text-gray-600 pb-1 ${
              assessmentsActive ? 'border-b-2 border-green-600' : ''
            }`}
          >
            <FaFileAlt className="w-4 h-4" />
            <span>Assessments</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/subadmin?tab=resources"
            className={`flex flex-col items-center gap-0.5 text-[10px] px-1 text-gray-600 pb-1 ${
              resourcesActive ? 'border-b-2 border-green-600' : ''
            }`}
          >
            <FaChartBar className="w-4 h-4" />
            <span>Resources</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default SubAdminBottomNav;
