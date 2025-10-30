import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaGem, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [isOpen]);

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
          <div className="flex justify-between items-center h-16">
            {/* TestMancer Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">TestMancer</Link>
            </div>

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

        {createPortal(
          (
            <AnimatePresence>
              {isOpen && (
                <>
                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-[1000] md:hidden"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* Sidebar */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{
                      type: "spring",
                      damping: 30,
                      stiffness: 300,
                      mass: 0.8
                    }}
                    className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-[1010] md:hidden"
                  >
                    <div className="flex flex-col h-full">
                      {/* Sidebar Header */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="flex items-center justify-end p-4 border-b border-gray-200"
                      >
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-400"
                          aria-label="Close menu"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </motion.div>

                      {/* Sidebar Content */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex-1 overflow-y-auto py-4"
                      >
                        <div className="px-4 space-y-2">
                          {isAuthenticated ? (
                            <>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="flex items-center space-x-3 px-4 py-3 bg-yellow-50 rounded-lg"
                              >
                                <FaGem className="w-5 h-5 text-yellow-600" />
                                <span className="text-base font-medium text-yellow-800">
                                  {user?.gems || 0} Gems
                                </span>
                              </motion.div>

                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                              >
                                <Link
                                  to="/profile"
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                >
                                  <FaUser className="w-5 h-5" />
                                  <span>Profile</span>
                                </Link>
                              </motion.div>

                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                              >
                                <button
                                  onClick={handleLogout}
                                  className="flex items-center space-x-3 w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                >
                                  <FaSignOutAlt className="w-5 h-5" />
                                  <span>Logout</span>
                                </button>
                              </motion.div>
                            </>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4, duration: 0.4 }}
                            >
                              <Link
                                to="/auth"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                              >
                                <span>Sign In</span>
                              </Link>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          ),
          document.body
        )}
      </div>
    </nav>
  );
};

export default Navbar;
