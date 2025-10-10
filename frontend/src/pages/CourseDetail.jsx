import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import PageViewer from '../components/PageViewer';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseResponse = await axios.get(`/api/courses/${courseId}`);
      const courseData = courseResponse.data.course || courseResponse.data;

      setCourse(courseData);

      // If course has modules with pages, set up the first module and page
      if (courseData.modules && courseData.modules.length > 0) {
        const firstModule = courseData.modules[0];
        setCurrentModule(firstModule);

        if (firstModule.pages && firstModule.pages.length > 0) {
          // Sort pages by order and get the first one
          const sortedPages = firstModule.pages.sort((a, b) => a.order - b.order);
          setCurrentPage(sortedPages[0]);
          setPageIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to load course details:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const handlePreviousPage = () => {
    if (!currentModule || !currentModule.pages) return;

    const sortedPages = currentModule.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    if (currentIndex > 0) {
      setCurrentPage(sortedPages[currentIndex - 1]);
      setPageIndex(currentIndex - 1);
    } else {
      // Go to previous module if available
      const currentModuleIndex = course.modules.findIndex(module => module._id === currentModule._id);
      if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        setCurrentModule(prevModule);

        if (prevModule.pages && prevModule.pages.length > 0) {
          const sortedPrevPages = prevModule.pages.sort((a, b) => a.order - b.order);
          setCurrentPage(sortedPrevPages[sortedPrevPages.length - 1]);
          setPageIndex(sortedPrevPages.length - 1);
        }
      }
    }
  };

  const handleNextPage = () => {
    if (!currentModule || !currentModule.pages) return;

    const sortedPages = currentModule.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    if (currentIndex < sortedPages.length - 1) {
      setCurrentPage(sortedPages[currentIndex + 1]);
      setPageIndex(currentIndex + 1);
    } else {
      // Go to next module if available
      const currentModuleIndex = course.modules.findIndex(module => module._id === currentModule._id);
      if (currentModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentModuleIndex + 1];
        setCurrentModule(nextModule);

        if (nextModule.pages && nextModule.pages.length > 0) {
          const sortedNextPages = nextModule.pages.sort((a, b) => a.order - b.order);
          setCurrentPage(sortedNextPages[0]);
          setPageIndex(0);
        }
      }
    }
  };

  // Check if there are previous/next pages
  const hasPreviousPage = () => {
    if (!currentModule || !currentModule.pages || !course) return false;

    const currentModuleIndex = course.modules.findIndex(module => module._id === currentModule._id);
    const sortedPages = currentModule.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    return currentModuleIndex > 0 || currentIndex > 0;
  };

  const hasNextPage = () => {
    if (!currentModule || !currentModule.pages || !course) return false;

    const currentModuleIndex = course.modules.findIndex(module => module._id === currentModule._id);
    const sortedPages = currentModule.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    return currentModuleIndex < course.modules.length - 1 || currentIndex < sortedPages.length - 1;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuizStatusColor = (completed) => {
    return completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Course not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The course you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link to="/courses" className="btn-primary">
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If we have pages, show the PageViewer
  if (currentPage && currentModule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to="/courses"
                  className="text-blue-600 hover:text-blue-800 flex items-center mb-2"
                >
                  ← Back to Courses
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">Learning Path</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Page Viewer */}
          <PageViewer
            page={currentPage}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            hasPrevious={hasPreviousPage()}
            hasNext={hasNextPage()}
            moduleTitle={currentModule.title}
          />
        </div>
      </div>
    );
  }

  // Fallback: Show module-based view if no pages are available
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <span className="text-5xl mr-4">📚</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 mt-1">Course Overview</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span className={`px-2 py-1 rounded-full ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </span>
              <span>📚 {course.modules?.length || 0} modules</span>
              <span>👥 {course.enrollmentCount?.toLocaleString() || 0} enrolled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Modules */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Modules</h2>
            <div className="space-y-4">
              {course.modules?.map((module, index) => (
                <div key={module._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                          Module {index + 1}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{module.description}</p>

                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">📄 {module.pages?.length || 0} pages</span>
                        <span>⏱️ {module.estimatedTime} mins</span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => {
                          setCurrentModule(module);
                          if (module.pages && module.pages.length > 0) {
                            const sortedPages = module.pages.sort((a, b) => a.order - b.order);
                            setCurrentPage(sortedPages[0]);
                            setPageIndex(0);
                          }
                        }}
                          className="btn-primary"
                        disabled={!module.pages || module.pages.length === 0}
                        >
                        {module.pages && module.pages.length > 0 ? 'Start Module' : 'No Pages Yet'}
                      </button>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">No modules available for this course.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/courses" className="btn-secondary w-full text-center">
                ← Back to Courses
              </Link>
              <Link to="/leaderboard" className="btn-secondary w-full text-center">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
