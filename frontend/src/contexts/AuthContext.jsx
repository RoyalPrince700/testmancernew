import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configure axios defaults
  useEffect(() => {
    // Use relative paths to leverage Vite proxy
    // Don't set baseURL when using Vite proxy - let it handle the routing
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Fetch user when token changes
  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      if (!token || cancelled) return;

      setLoading(true);
      try {
        const response = await axios.get('/api/auth/me');
        if (cancelled) return;

        if (response.data.user) {
          setUser(response.data.user);
        } else {
          console.error('No user data in response');
          setToken('');
          localStorage.removeItem('token');
          navigate('/auth');
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch user data:', error.response?.status, error.response?.data);
        
        // Only logout if it's a 401 (unauthorized) or 403 (forbidden) error
        if (error.response?.status === 401 || error.response?.status === 403) {
          setToken('');
          localStorage.removeItem('token');
          navigate('/auth');
        } else {
          // For other errors, just log them but don't logout
          console.error('Non-auth error, keeping user logged in');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  // Enhanced login: accept token only, let useEffect handle user fetching
  const login = async (newToken) => {
    try {
      // Set token first - this will trigger the useEffect to fetch user data
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      // Navigate to dashboard - the useEffect will handle user data fetching
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      logout();
    }
  };

  // Logout
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  // Handle OAuth callback
  const handleAuthCallback = (urlToken) => {
    try {
      login(urlToken);
      return true;
    } catch (error) {
      console.error('Auth callback failed:', error);
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Update learning goals
  const updateLearningGoals = async (goals) => {
    try {
      const response = await axios.put('/api/users/learning-goals', { learningGoals: goals });
      setUser(response.data.user);
      toast.success('Learning goals updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Learning goals update failed:', error);
      toast.error(error.response?.data?.message || 'Learning goals update failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Award gems (for quiz completions, etc.)
  const awardGems = (amount, reason = '') => {
    if (user) {
      const newGems = user.gems + amount;
      setUser({ ...user, gems: newGems });

      if (reason) {
        toast.success(`${reason} +${amount} gems! 💎`, {
          icon: '🎉',
          duration: 3000,
        });
      }
    }
  };

  // Permission checking methods
  const isAdmin = user?.role === 'admin';
  const isSubAdmin = user?.role === 'subadmin' || user?.role === 'waec_admin' || user?.role === 'jamb_admin';

  const canManageCourses = () => {
    return isAdmin || isSubAdmin;
  };

  const canAccessCourse = (course) => {
    if (!isSubAdmin) return true; // Full admin can access all

    const userRole = user?.role;

    // Category admins can only access courses in their category
    if (userRole === 'waec_admin' && !course.learningGoals?.includes('waec')) return false;
    if (userRole === 'jamb_admin' && !course.learningGoals?.includes('jamb')) return false;

    // Subadmins can only access courses for their assigned scope
    if (userRole === 'subadmin') {
      const assignedUniversities = user?.assignedUniversities || [];
      const assignedFaculties = user?.assignedFaculties || [];
      const assignedDepartments = user?.assignedDepartments || [];
      const assignedLevels = user?.assignedLevels || [];

      // Check if course has audience restrictions
      if (course.audience) {
        const courseUniversities = course.audience.universities || [];
        const courseFaculties = course.audience.faculties || [];
        const courseDepartments = course.audience.departments || [];
        const courseLevels = course.audience.levels || [];

        // STRICT VALIDATION: If course has audience restrictions, ALL must match
        if (courseUniversities.length > 0 && !courseUniversities.some(u => assignedUniversities.includes(u))) return false;
        if (courseFaculties.length > 0 && !courseFaculties.some(f => assignedFaculties.includes(f))) return false;
        if (courseDepartments.length > 0 && !courseDepartments.some(d => assignedDepartments.includes(d))) return false;
        if (courseLevels.length > 0 && !courseLevels.some(l => assignedLevels.includes(l))) return false;
      }
    }

    return true;
  };

  const canManageUsers = () => {
    return user?.role === 'admin'; // Only full admins can manage users
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    updateProfile,
    updateLearningGoals,
    handleAuthCallback,
    awardGems,
    isAuthenticated: !!user,
    isOnboarded: user?.onboardingCompleted || false,
    isAdmin,
    isSubAdmin,
    role: user?.role || 'user',
    assignedUniversities: user?.assignedUniversities || [],
    assignedFaculties: user?.assignedFaculties || [],
    assignedDepartments: user?.assignedDepartments || [],
    assignedLevels: user?.assignedLevels || [],
    canManageCourses: canManageCourses(),
    canAccessCourse,
    canManageUsers: canManageUsers(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
