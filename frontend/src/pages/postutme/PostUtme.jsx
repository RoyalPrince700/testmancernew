import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBook,
  FiDivide,
  FiGlobe,
  FiBarChart2,
  FiStar,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from '../../contexts/AuthContext';
import TestMancerLoader from "../../components/TestMancer";

const PostUtme = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Subject configuration with total subtopics
  const subjectConfig = [
    {
      title: "English",
      icon: FiBook,
      description: "Master grammar! 📚",
      path: "/post-utme/english",
      totalSubtopics: 21,
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Mathematics",
      icon: FiDivide,
      description: "Crack numbers! 📚",
      path: "/post-utme/mathematics",
      totalSubtopics: 10,
      color: "from-teal-400 to-teal-600",
    },
    {
      title: "Current-Affairs",
      icon: FiGlobe,
      description: "Stay updated! 🌍",
      path: "/post-utme/current-affairs",
      totalSubtopics: 11,
      color: "from-purple-400 to-purple-600",
    },
  ];

  // Fetch user profile and progress data
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user progress from API
      const response = await fetch('/api/post-utme/progress', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const result = await response.json();

      if (result.success) {
        const { subjects, achievements } = result.data;

        // Update subjects with dynamic data
        const updatedSubjects = subjectConfig.map(subject => {
          const subjectKey = subject.title.toLowerCase();
          const subjectData = subjects[subjectKey];

          return {
            ...subject,
            badgeCount: subjectData?.badges || 0,
            progress: subjectData?.progress || 0,
          };
        });

        setSubjects(updatedSubjects);

        // Update achievements
        setAchievements([
          { icon: FiStar, title: "Daily Streak", value: `${achievements.currentStreak} days`, color: "text-yellow-500" },
          { icon: FiStar, title: "Badges Earned", value: achievements.totalBadges.toString(), color: "text-green-500" },
          { icon: FiBarChart2, title: "Leaderboard Rank", value: "#24", color: "text-pink-500" },
          { icon: FiCheckCircle, title: "Topics Mastered", value: `${achievements.totalTopicsCompleted}/${achievements.totalTopics}`, color: "text-teal-500" },
        ]);
      }

      // Set user data (you may want to fetch this from a separate endpoint)
      setUserData({
        full_name: user.name,
        avatar_url: user.avatar
      });

    } catch (err) {
      console.error("Unexpected error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return <TestMancerLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4 max-w-6xl">

        {/* Personalized Callout */}
        {userData?.full_name && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-r from-green-400 to-green-600 rounded-3xl p-4 sm:p-6 text-white text-center mb-12 max-w-2xl mx-auto overflow-hidden"
            aria-label="Study Hub welcome message"
          >
            {/* Study Hub Label (Mobile Only) */}
            <div className="absolute top-1 left-2 sm:hidden bg-green-700 bg-opacity-50 text-white text-xs font-medium rounded-full px-2 py-1">
              Study Hub
            </div>
            {/* Background Icon */}
            <FiBook className="absolute top-2 right-2 text-green-200 opacity-30 text-4xl" />
            <h2 className="text-xl sm:text-2xl font-bold py-2 mb-2 sm:mb-3">
              Welcome to the Study Hub, {userData.full_name.split(' ')[0]}! 📚
            </h2>
            <p className="text-green-100 text-sm sm:text-base">
              Dive into your lessons and master every topic to excel!
            </p>
          </motion.div>
        )}

        {/* Main Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Post-UTME Preparation</h1>
          <p className="text-gray-600">Master the essentials for university admission</p>
        </motion.div>

        {/* Subject Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, scale: 1.02 }}
              onHoverStart={() => setHoveredCard(i)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative"
            >
              <Link to={s.path} className="group" aria-label={`Start ${s.title} practice`}>
                <div className="h-full bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:border-gray-300 transition-all relative overflow-hidden">
                  {/* PROGRESS */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-pink-500">{s.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${s.color} h-2 rounded-full`}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* ICON */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <div className="absolute -inset-3 bg-teal-100 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`relative bg-gradient-to-br ${s.color} rounded-xl p-4 flex items-center justify-center w-16 h-16`}>
                        <s.icon className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>

                  {/* TEXTS */}
                  <h3 className="text-lg font-bold text-center text-gray-800 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-center text-sm mb-4">{s.description}</p>

                  {/* FOOTER ACTIONS */}
                  <div className="flex justify-center gap-3 text-xs text-teal-500 font-medium mb-4">
                    <button
                              className="flex items-center gap-1 hover:text-teal-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/post-utme/leaderboard");
                              }}
                            >
                      <FiBarChart2 />
                      <span>Leaderboard</span>
                     </button>
                  </div>

                  <div className="flex justify-center">
                    <button className={`w-full bg-gradient-to-r ${s.color} text-white font-semibold rounded-full px-4 py-2 text-sm hover:scale-105 hover:shadow-lg transition-all`}>
                      {userData?.full_name ? "Resume" : "Start Practice"} 🚀
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Personalized Encouragement */}
        {userData?.full_name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Keep Going, {userData.full_name.split(' ')[0]}! ✨
            </h3>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Every topic you master brings you closer to your dream university.
              Champions aren't born—they're made one practice session at a time!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PostUtme;
