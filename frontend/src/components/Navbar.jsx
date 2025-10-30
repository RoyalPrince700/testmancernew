import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaGem, FaChartLine } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [isOpen, mounted]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  // No top-level nav links; all navigation handled via sidebar
  const navItems = [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white drop-shadow-sm fixed top-0 left-0 right-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== DESKTOP NAVIGATION ===== */}
        <div className="hidden md:flex justify-between h-16">
          {/* TestMancer Logo */}
          <div className="flex items-center ">
            <Link to="/" className="text-xl font-bold text-gray-900">TestMancer</Link>
          </div>

          {/* Desktop Navigation Links removed intentionally */}
          <div className="flex items-center space-x-8" />

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
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary-400 rounded-md" aria-label="Open profile menu">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                        width="32"
                        height="32"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
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
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
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
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-400"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mounted && createPortal(
          (
            <div className={`fixed inset-0 z-[120] md:hidden ${isOpen ? 'block' : 'hidden'}`}>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                onClick={() => setIsOpen(false)}
              />

              {/* Sidebar */}
              <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[130] ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`}>
                <div className="flex flex-col h-full">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-end p-4 border-b border-gray-200">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-400"
                      aria-label="Close menu"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 space-y-2">
                      {isAuthenticated ? (
                        <>
                          <div className="flex items-center space-x-3 px-4 py-3 bg-yellow-50 rounded-lg">
                            <FaGem className="w-5 h-5 text-yellow-600" />
                            <span className="text-base font-medium text-yellow-800">
                              {user?.gems || 0} Gems
                            </span>
                          </div>

                          <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            <FaUser className="w-5 h-5" />
                            <span>Profile</span>
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            <FaSignOutAlt className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/auth"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          <span>Sign In</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          document.body
        )}
      </div>
    </nav>
  );
};

export default Navbar;
