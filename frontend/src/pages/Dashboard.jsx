import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategory } from '../contexts/CategoryContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardWithSidebar from '../components/DashboardWithSidebar';

const Dashboard = () => {
  const { user, canAccessCourse, isSubAdmin } = useAuth();
  const { selectedCategory } = useCategory();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    totalScore: 0,
    averageScore: 0,
    rank: 0,
    totalGems: 0,
    completedModules: 0,
    learningCategories: []
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [personalizedCourses, setPersonalizedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, selectedCategory]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user stats
      const statsResponse = await axios.get('/api/users/stats');
      if (statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
        setRecentQuizzes(statsResponse.data.stats.recentQuizzes || []);
      }

      // Fetch personalized courses
      const coursesResponse = await axios.get(`/api/courses/personalized?category=${selectedCategory}`);
      if (coursesResponse.data.courses) {
        // Filter courses based on role permissions
        const filteredCourses = isSubAdmin
          ? coursesResponse.data.courses.filter(canAccessCourse)
          : coursesResponse.data.courses;
        setPersonalizedCourses(filteredCourses);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <DashboardWithSidebar
      stats={stats}
      recentQuizzes={recentQuizzes}
      personalizedCourses={personalizedCourses}
    />
  );
};

export default Dashboard;
