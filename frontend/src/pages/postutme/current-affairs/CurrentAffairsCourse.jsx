import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiGlobe,
  FiCheckCircle,
  FiPlay,
  FiStar,
  FiArrowLeft,
  FiBarChart2,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from '../../../contexts/AuthContext';
import TestMancerLoader from "../../../components/TestMancer";

const CurrentAffairsCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [completedTopics, setCompletedTopics] = useState([]);

  // Current Affairs course topics
  const currentAffairsTopics = [
    { id: 1, title: "Nigerian Government", description: "Structure, functions, and current administration", difficulty: "Beginner" },
    { id: 2, title: "International Organizations", description: "UN, AU, ECOWAS, and their roles", difficulty: "Beginner" },
    { id: 3, title: "Economic Policies", description: "Nigerian economy and global economics", difficulty: "Intermediate" },
    { id: 4, title: "Science & Technology", description: "Recent developments and innovations", difficulty: "Intermediate" },
    { id: 5, title: "Environmental Issues", description: "Climate change and sustainability", difficulty: "Intermediate" },
    { id: 6, title: "Sports & Entertainment", description: "Major events and personalities", difficulty: "Beginner" },
    { id: 7, title: "Health & Medicine", description: "Global health issues and pandemics", difficulty: "Intermediate" },
    { id: 8, title: "Education System", description: "Nigerian education and reforms", difficulty: "Beginner" },
    { id: 9, title: "Political Developments", description: "Elections and political changes", difficulty: "Advanced" },
    { id: 10, title: "Security & Defense", description: "National security and peacekeeping", difficulty: "Advanced" },
    { id: 11, title: "Final Assessment", description: "Comprehensive current affairs test", difficulty: "Advanced" },
  ];

  // Fetch user data and progress
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch progress for Current-Affairs from API
      const response = await fetch('/api/post-utme/progress/current-affairs', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Current-Affairs progress');
      }

      const result = await response.json();

      if (result.success) {
        const { progress, completedCount } = result.data;

        // Process completed topics
        const completed = progress
          .filter(item => item.completed)
          .map(item => item.subtopic);

        setCompletedTopics(completed);

        // Calculate overall progress
        const overallProgress = Math.round((completedCount / currentAffairsTopics.length) * 100);
        setProgress({ overall: overallProgress });
      }

      // Set user data
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600 bg-green-100";
      case "Intermediate": return "text-yellow-600 bg-yellow-100";
      case "Advanced": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const isTopicCompleted = (topicId) => {
    return completedTopics.includes(topicId.toString());
  };

  if (loading) {
    return <TestMancerLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/post-utme')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft />
              <span>Back to Subjects</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-2xl font-bold text-purple-500">{progress.overall}%</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <FiGlobe className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Current Affairs</h1>
            <p className="text-gray-600 text-lg">Stay informed about world events and developments</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Overall Progress</h2>
              <span className="text-sm text-gray-500">{completedTopics.length} of {currentAffairsTopics.length} topics completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.overall}%` }}
              />
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {currentAffairsTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-white rounded-xl p-6 shadow-md border-2 transition-all hover:shadow-lg ${
                isTopicCompleted(topic.id)
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                </div>

                {isTopicCompleted(topic.id) && (
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <FiCheckCircle className="text-white text-sm" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isTopicCompleted(topic.id) ? (
                    <FiStar className="text-yellow-500" />
                  ) : (
                    <FiPlay className="text-purple-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {isTopicCompleted(topic.id) ? 'Completed' : 'Start Practice'}
                  </span>
                </div>

                <Link
                  to={`/post-utme/current-affairs/topic/${topic.id}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isTopicCompleted(topic.id)
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  {isTopicCompleted(topic.id) ? 'Review' : 'Start'}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievement Section */}
        {completedTopics.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiStar className="text-yellow-500" />
              Your Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{completedTopics.length}</div>
                <div className="text-sm text-gray-600">Topics Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{progress.overall}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {currentAffairsTopics.filter(t => t.difficulty === 'Advanced' && isTopicCompleted(t.id)).length}
                </div>
                <div className="text-sm text-gray-600">Advanced Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {Math.floor(completedTopics.length / 3)}
                </div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentAffairsCourse;
