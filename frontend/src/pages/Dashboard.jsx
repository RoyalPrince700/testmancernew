import React, { useState, useEffect, useMemo } from 'react';
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
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [personalizedCourses, setPersonalizedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize filtered courses based on role permissions
  const filteredCourses = useMemo(() => {
    return isSubAdmin
      ? personalizedCourses.filter(canAccessCourse)
      : personalizedCourses;
  }, [personalizedCourses, isSubAdmin, canAccessCourse]);

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
        setRecentAssessments(statsResponse.data.stats.recentAssessments || []);
      }

      // Fetch personalized courses
      const coursesResponse = await axios.get(`/api/courses/personalized?category=${selectedCategory}`);
      if (coursesResponse.data.courses) {
        setPersonalizedCourses(coursesResponse.data.courses);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardWithSidebar
      stats={stats}
      recentAssessments={recentAssessments}
      personalizedCourses={filteredCourses}
      loading={loading}
    />
  );
};

export default Dashboard;
