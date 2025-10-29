import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaChartBar, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const pathname = location.pathname;
  const params = new URLSearchParams(location.search);
  const currentTab = params.get('tab');

  const overviewActive = pathname === '/dashboard' && currentTab === 'overview';
  const coursesActive = pathname === '/dashboard' && currentTab === 'courses';
  const resultsActive = pathname === '/dashboard' && currentTab === 'results';
  const rankActive = pathname.startsWith('/leaderboard');

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t md:hidden pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around py-2 px-1">
        <li>
          <NavLink
            to="/dashboard?tab=overview"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 text-gray-600 pb-1 ${
              pathname === '/dashboard' && currentTab === 'overview' ? 'border-b-2 border-blue-600' : ''
            }`}
          >
            <FaHome className="w-5 h-5" />
            <span>Overview</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard?tab=courses"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 text-gray-600 pb-1 ${
              pathname === '/dashboard' && currentTab === 'courses' ? 'border-b-2 border-blue-600' : ''
            }`}
          >
            <FaBook className="w-5 h-5" />
            <span>Courses</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard?tab=results"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 text-gray-600 pb-1 ${
              pathname === '/dashboard' && currentTab === 'results' ? 'border-b-2 border-blue-600' : ''
            }`}
          >
            <FaChartBar className="w-5 h-5" />
            <span>Results</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/leaderboard"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 text-gray-600 pb-1 ${
              pathname.startsWith('/leaderboard') ? 'border-b-2 border-blue-600' : ''
            }`}
          >
            <FaTrophy className="w-5 h-5" />
            <span>Rank</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;


