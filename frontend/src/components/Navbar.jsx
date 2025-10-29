import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaTrophy, FaBook, FaHome, FaSignOutAlt, FaGem, FaChartLine, FaFolder } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isSubAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  // Dynamic nav items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Home', icon: FaHome },
      { path: '/dashboard', label: 'Dashboard', icon: FaChartLine, protected: true },
      { path: '/courses', label: 'Courses', icon: FaBook, protected: true },
      { path: '/resources', label: 'Resources', icon: FaFolder, protected: true },
      { path: '/leaderboard', label: 'Leaderboard', icon: FaTrophy, protected: true },
    ];

    // Add admin/subadmin items based on role
    if (isAdmin || isSubAdmin) {
      if (isAdmin && !isSubAdmin) {
        // Full admin only
        baseItems.push({ path: '/admin', label: 'Admin', icon: FaUser, adminOnly: true });
      } else if (isSubAdmin && !isAdmin) {
        // Subadmin only
        baseItems.push({ path: '/subadmin', label: 'Sub Admin', icon: FaUser, adminOnly: true });
      } else if (isAdmin && isSubAdmin) {
        // Both roles (shouldn't happen, but handle gracefully)
        baseItems.push({ path: '/admin', label: 'Admin', icon: FaUser, adminOnly: true });
      }
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== DESKTOP NAVIGATION ===== */}
        <div className="hidden md:flex justify-between h-16">
          {/* Desktop Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">TestMancer</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.protected && !isAuthenticated) return null;
              if (item.adminOnly && !isAdmin && !isSubAdmin) return null;

              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Desktop Gems Display */}
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <FaGem className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">{user?.gems || 0}</span>
                </div>

                {/* Desktop Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <FaUser className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>

                  {/* Desktop Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaUser className="inline w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="inline w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* ===== MOBILE NAVIGATION ===== */}
        <div className="md:hidden">
          <div className="flex justify-between h-16">
            {/* Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">TestMancer</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? 'block' : 'hidden'}`}>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">TestMancer</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-2">
                  {navItems.filter(item => item.label !== 'Dashboard').map((item) => {
                    if (item.protected && !isAuthenticated) return null;
                    if (item.adminOnly && !isAdmin && !isSubAdmin) return null;

                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                          isActive(item.path)
                            ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  {isAuthenticated ? (
                    <>
                      {/* Mobile Gems Display */}
                      <div className="flex items-center space-x-3 px-4 py-3 bg-yellow-50 rounded-lg">
                        <FaGem className="w-5 h-5 text-yellow-600" />
                        <span className="text-base font-medium text-yellow-800">
                          {user?.gems || 0} Gems
                        </span>
                      </div>

                      {/* Mobile Profile Links */}
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <FaUser className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <FaSignOutAlt className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
