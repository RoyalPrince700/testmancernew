import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    university: '',
    faculty: '',
    department: '',
    level: ''
  });
  const [stats, setStats] = useState({});
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper function to get user's initial
  const getUserInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Helper function to generate consistent color based on name
  const getAvatarColor = (name) => {
    if (!name) return '#6B7280'; // gray-500

    const colors = [
      '#EF4444', // red-500
      '#F97316', // orange-500
      '#EAB308', // yellow-500
      '#22C55E', // green-500
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F59E0B', // amber-500
    ];

    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '🎯',
        university: user.university || '',
        faculty: user.faculty || '',
        department: user.department || '',
        level: user.level || ''
      });
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data for now
      setStats({
        totalQuizzes: 28,
        completedQuizzes: 25,
        totalScore: 8750,
        averageScore: 82.3,
        rank: 15,
        streak: 7,
        bestScore: 98,
        timeSpent: '24h 32m'
      });

      setRecentAssessments([
        { id: 1, title: 'JavaScript Fundamentals CA', score: 95, completedAt: '2024-01-15', timeSpent: '18m' },
        { id: 2, title: 'React Basics Exam', score: 88, completedAt: '2024-01-12', timeSpent: '22m' },
        { id: 3, title: 'CSS Grid Layout CA', score: 92, completedAt: '2024-01-10', timeSpent: '15m' },
        { id: 4, title: 'Python Data Science Exam', score: 78, completedAt: '2024-01-08', timeSpent: '35m' },
        { id: 5, title: 'UI/UX Design CA', score: 85, completedAt: '2024-01-05', timeSpent: '28m' }
      ]);

      setAchievements([
        { id: 1, title: 'First Quiz', description: 'Completed your first quiz', icon: '🎯', unlockedAt: '2024-01-01' },
        { id: 2, title: 'Perfect Score', description: 'Achieved 100% on a quiz', icon: '💯', unlockedAt: '2024-01-03' },
        { id: 3, title: 'Speed Demon', description: 'Completed a quiz in under 10 minutes', icon: '⚡', unlockedAt: '2024-01-05' },
        { id: 4, title: 'Streak Master', description: 'Completed quizzes for 7 days straight', icon: '🔥', unlockedAt: '2024-01-10' },
        { id: 5, title: 'Knowledge Seeker', description: 'Completed 25 quizzes', icon: '📚', unlockedAt: '2024-01-12' }
      ]);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '🎯',
      university: user?.university || '',
      faculty: user?.faculty || '',
      department: user?.department || '',
      level: user?.level || ''
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'quizzes', label: 'Quiz History', icon: '📝' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 mr-4 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xl"
                 style={{ backgroundColor: getAvatarColor(formData.name) }}>
              {formData.avatar && formData.avatar.startsWith('http') ? (
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="flex items-center justify-center w-full h-full"
                style={{ display: formData.avatar && formData.avatar.startsWith('http') ? 'none' : 'flex' }}
              >
                {getUserInitial(formData.name)}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{formData.name || 'TestMancer User'}</h1>
              <p className="text-gray-600">{formData.email}</p>
              {formData.bio && <p className="text-gray-500 mt-1">{formData.bio}</p>}

              {/* Academic Information */}
              <div className="mt-3 space-y-1">
                {(formData.university || formData.faculty || formData.department || formData.level) && (
                  <>
                    {formData.university && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">University:</span> {formData.university}
                      </p>
                    )}
                    {formData.faculty && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Faculty:</span> {formData.faculty}
                      </p>
                    )}
                    {formData.department && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Department:</span> {formData.department}
                      </p>
                    )}
                    {formData.level && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Level:</span> {formData.level}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-success"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</div>
                  <div className="text-sm text-gray-600">Total Quizzes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.completedQuizzes}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.averageScore}%</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">#{stats.rank}</div>
                  <div className="text-sm text-gray-600">Rank</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Score:</span>
                  <span className="font-medium">{stats.bestScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-medium">{stats.streak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Spent:</span>
                  <span className="font-medium">{stats.timeSpent}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Assessments</h3>
              {recentAssessments.length > 0 ? (
                <div className="space-y-3">
                  {recentAssessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                        <p className="text-sm text-gray-500">{assessment.completedAt} • {assessment.timeSpent}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{assessment.score}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent assessments found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Assessment</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Score</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Time</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{assessment.title}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold ${
                          assessment.score >= 90 ? 'text-green-600' :
                          assessment.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {assessment.score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{assessment.timeSpent}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{assessment.completedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">{achievement.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.unlockedAt}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h3>

            {isEditing ? (
              <div className="space-y-6">
                {/* Avatar Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Avatar</label>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-base mr-3"
                         style={{ backgroundColor: getAvatarColor(formData.name) }}>
                      {getUserInitial(formData.name)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Your avatar is automatically generated from your name</p>
                      <p className="text-xs text-gray-500">Upload a profile picture in the future to replace it</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Academic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your university"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your faculty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your department"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <input
                      type="text"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your level"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Avatar</div>
                    <div className="text-sm text-gray-500">Choose your profile picture</div>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-base"
                       style={{ backgroundColor: getAvatarColor(formData.name) }}>
                    {formData.avatar && formData.avatar.startsWith('http') ? (
                      <img
                        src={formData.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="flex items-center justify-center w-full h-full"
                      style={{ display: formData.avatar && formData.avatar.startsWith('http') ? 'none' : 'flex' }}
                    >
                      {getUserInitial(formData.name)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Name</div>
                    <div className="text-sm text-gray-500">{formData.name || 'Not set'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-500">{formData.email || 'Not set'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-gray-900">Bio</div>
                    <div className="text-sm text-gray-500">{formData.bio || 'Not set'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">University</div>
                    <div className="text-sm text-gray-500">{formData.university || 'Not set'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Faculty</div>
                    <div className="text-sm text-gray-500">{formData.faculty || 'Not set'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Department</div>
                    <div className="text-sm text-gray-500">{formData.department || 'Not set'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-gray-900">Level</div>
                    <div className="text-sm text-gray-500">{formData.level || 'Not set'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
