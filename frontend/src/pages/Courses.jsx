import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCategory } from '../contexts/CategoryContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Courses = () => {
  const { selectedCategory: globalSelectedCategory } = useCategory();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLearningGoal, setSelectedLearningGoal] = useState('all');

  const categories = ['all', 'secondary', 'tertiary', 'language', 'professional'];
  const learningGoals = ['all', 'waec', 'postutme', 'jamb', 'toefl', 'ielts', 'undergraduate'];

  // Initialize filters from URL params and global category
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    const learningGoalParam = searchParams.get('learningGoal') || globalSelectedCategory || 'all';

    setSelectedCategory(categoryParam);
    setSelectedLearningGoal(learningGoalParam);
  }, [searchParams, globalSelectedCategory]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLearningGoal]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses');

      if (response.data.courses) {
        // Transform backend data to match frontend expectations
        const transformedCourses = response.data.courses.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          learningGoals: course.learningGoals,
          modulesCount: course.modules?.length || 0,
          enrolled: course.enrollmentCount || 0,
          thumbnail: course.thumbnail || '📚',
          totalEstimatedTime: course.modules?.reduce((total, module) => total + (module.estimatedTime || 0), 0) || 0,
          tags: course.tags || [],
          isActive: course.isActive
        }));

        setCourses(transformedCourses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedLearningGoal !== 'all') {
      filtered = filtered.filter(course =>
        course.learningGoals?.includes(selectedLearningGoal)
      );
    }

    setFilteredCourses(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-gray-600">Choose from our collection of interactive courses and start learning today.</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {category.replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:w-48">
          <select
            value={selectedLearningGoal}
            onChange={(e) => setSelectedLearningGoal(e.target.value)}
            className="input-field"
          >
            <option value="all">All Learning Goals</option>
            {learningGoals.slice(1).map(goal => (
              <option key={goal} value={goal}>
                {goal.replace('-', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{course.thumbnail}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{Math.ceil(course.totalEstimatedTime / 60)} hours</span>
                <span>{course.modulesCount} modules</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.enrolled.toLocaleString()} enrolled</span>
                <span className="capitalize">{course.category}</span>
              </div>

              {course.tags && course.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {course.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{course.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Link
                to={`/courses/${course.id}`}
                className="btn-primary w-full text-center"
              >
                View Course
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
