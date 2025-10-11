import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaEdit, FaUser, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const pathname = location.pathname;
  const params = new URLSearchParams(location.search);
  const currentTab = params.get('tab');

  const homeActive = pathname === '/dashboard' && (!currentTab || currentTab === 'overview');
  const coursesActive = pathname === '/dashboard' && currentTab === 'courses';
  const leaderboardActive = pathname.startsWith('/leaderboard');
  const profileActive = pathname.startsWith('/profile');

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t md:hidden pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around py-2 px-1">
        <li>
          <NavLink
            to="/dashboard?tab=overview"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 ${
              homeActive ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <FaHome className="w-5 h-5" />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard?tab=courses"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 ${
              coursesActive ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <FaBook className="w-5 h-5" />
            <span>Courses</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/leaderboard"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 ${
              leaderboardActive ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <FaTrophy className="w-5 h-5" />
            <span>Ranks</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile"
            className={`flex flex-col items-center gap-0.5 text-[11px] px-2 ${
              profileActive ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <FaUser className="w-5 h-5" />
            <span>Profile</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;


