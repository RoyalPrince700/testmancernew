import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getCourseWithProgress, getCourseProgress, completeModule } from '../utils/coursesApi';
import PageViewer from '../components/PageViewer';
import CongratulationModal from '../components/CongratulationModal';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, awardGems } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCongratulationModal, setShowCongratulationModal] = useState(false);
  const [completedModuleTitle, setCompletedModuleTitle] = useState('');
  const [completedModuleIds, setCompletedModuleIds] = useState([]);
  const [isFirstCompletion, setIsFirstCompletion] = useState(true);
  const [completedModuleGems, setCompletedModuleGems] = useState(3);
  const initialModuleId = searchParams.get('moduleId') || location.state?.moduleId || null;

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId, initialModuleId]);

  // Note: Page tracking removed - only module completion is tracked
  // Pages are not tracked individually; module completion happens via "End Module" button

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseData = await getCourseWithProgress(courseId);

      setCourse(courseData);

      // Initialize locally tracked completed modules from detailed progress if available
      const initialCompleted = Array.isArray(courseData.progress?.unitDetails)
        ? courseData.progress.unitDetails
            .filter((ud) => ud.isCompleted)
            .map((ud) => ud.unitId)
        : Array.isArray(courseData.progress?.completedModuleIds)
        ? courseData.progress.completedModuleIds
        : Array.isArray(user?.completedModules)
        ? user.completedModules
        : [];
      setCompletedModuleIds(initialCompleted.map((id) => id.toString()));

      // If course has units with pages, set up the initial unit and page
      if (courseData.modules && courseData.modules.length > 0) {
        let unitToOpen = courseData.modules[0];
        if (initialModuleId) {
          const match = courseData.modules.find((m) => m._id?.toString() === initialModuleId?.toString());
          if (match) {
            unitToOpen = match;
          } else {
            // Selected unit not visible (likely unpublished) – inform user and fallback
            toast.error('The chapter you selected is not available yet. Showing the first available chapter.');
          }
        }
        setCurrentUnit(unitToOpen);

        if (unitToOpen.pages && unitToOpen.pages.length > 0) {
          // Sort pages by order and get the first one
          const sortedPages = unitToOpen.pages.sort((a, b) => a.order - b.order);
          setCurrentPage(sortedPages[0]);
          setPageIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to load course details:', error);

      // Check if it's a 404 error (course not found)
      if (error.response && error.response.status === 404) {
        toast.error('Course not found. It may have been deleted or you may not have access to it.');
      } else {
        toast.error('Failed to load course details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const handlePreviousPage = () => {
    if (!currentUnit || !currentUnit.pages) return;

    const sortedPages = currentUnit.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    if (currentIndex > 0) {
      setCurrentPage(sortedPages[currentIndex - 1]);
      setPageIndex(currentIndex - 1);
    } else {
      // Go to previous unit if available
      const currentUnitIndex = course.modules.findIndex(unit => unit._id === currentUnit._id);
      if (currentUnitIndex > 0) {
        const prevUnit = course.modules[currentUnitIndex - 1];
        setCurrentUnit(prevUnit);

        if (prevUnit.pages && prevUnit.pages.length > 0) {
          const sortedPrevPages = prevUnit.pages.sort((a, b) => a.order - b.order);
          setCurrentPage(sortedPrevPages[sortedPrevPages.length - 1]);
          setPageIndex(sortedPrevPages.length - 1);
        }
      }
    }

    // Scroll to top when navigating to previous page
    window.scrollTo(0, 0);
  };

  const handleNextPage = () => {
    if (!currentUnit || !currentUnit.pages) return;

    const sortedPages = currentUnit.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    if (currentIndex < sortedPages.length - 1) {
      setCurrentPage(sortedPages[currentIndex + 1]);
      setPageIndex(currentIndex + 1);
    } else {
      // We're on the last page already; do nothing here.
      // Completion is handled by the Complete button in PageViewer.

      // Optionally prepare next unit in state so after closing modal user can continue
      const currentUnitIndex = course.modules.findIndex(unit => unit._id === currentUnit._id);
      if (currentUnitIndex < course.modules.length - 1) {
        const nextUnit = course.modules[currentUnitIndex + 1];
        setCurrentUnit(nextUnit);

        if (nextUnit.pages && nextUnit.pages.length > 0) {
          const sortedNextPages = nextUnit.pages.sort((a, b) => a.order - b.order);
          setCurrentPage(sortedNextPages[0]);
          setPageIndex(0);
        }
      }
    }

    // Scroll to top when navigating to next page
    window.scrollTo(0, 0);
  };

  // Check if there are previous/next pages
  const hasPreviousPage = () => {
    if (!currentUnit || !currentUnit.pages || !course) return false;

    const currentUnitIndex = course.modules.findIndex(unit => unit._id === currentUnit._id);
    const sortedPages = currentUnit.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    return currentUnitIndex > 0 || currentIndex > 0;
  };

  const hasNextPage = () => {
    if (!currentUnit || !currentUnit.pages || !course) return false;

    const sortedPages = currentUnit.pages.sort((a, b) => a.order - b.order);
    const currentIndex = sortedPages.findIndex(page => page._id === currentPage._id);

    // Only consider next page within the current unit; do not look across units
    return currentIndex < sortedPages.length - 1;
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

  const isModuleCompleted = (moduleId) => {
    return completedModuleIds.includes(moduleId?.toString());
  };

  const markUnitComplete = async (unitId) => {
    try {
      const response = await completeModule(courseId, unitId);
      if (response.message === 'Module already completed') {
        // This is a repeat completion - show modal with no gems
        const completedUnit = course.modules.find(module => module._id === unitId);
        if (completedUnit) {
          setCompletedModuleTitle(completedUnit.title);
          setIsFirstCompletion(false);
          setCompletedModuleGems(0);
          setShowCongratulationModal(true);
        }
        // Ensure local state reflects completion even if backend says already completed
        setCompletedModuleIds((prev) => (prev.includes(unitId) ? prev : [...prev, unitId]));
        return;
      }

      // Find the completed unit title
      const completedUnit = course.modules.find(module => module._id === unitId);
      if (completedUnit) {
        setCompletedModuleTitle(completedUnit.title);
        setIsFirstCompletion(true); // This is a first completion
        setShowCongratulationModal(true);
      }

      // Optimistically update local completion state
      setCompletedModuleIds((prev) => (prev.includes(unitId) ? prev : [...prev, unitId]));

      // Award gems locally if backend awarded them (default 3)
      const gems = Number(response?.gemsAwarded || 0);
      setCompletedModuleGems(gems);
      if (gems > 0) {
        awardGems(gems, 'Module completed');
      }

      // Optionally refresh progress from server to keep parity
      try {
        const latest = await getCourseProgress(courseId);
        if (Array.isArray(latest?.unitDetails)) {
          const refreshedCompleted = latest.unitDetails.filter((u) => u.isCompleted).map((u) => u.unitId.toString());
          setCompletedModuleIds(refreshedCompleted);
        }
      } catch {}
    } catch (error) {
      console.error('Failed to mark unit complete:', error);
      // Don't show error toast as this might be called multiple times
    }
  };

  const handleEndUnit = async () => {
    if (!currentUnit) return;
    await markUnitComplete(currentUnit._id);

    // After completion, if there is a next unit, pre-load its first page
    const currentUnitIndex = course.modules.findIndex(unit => unit._id === currentUnit._id);
    if (currentUnitIndex < course.modules.length - 1) {
      const nextUnit = course.modules[currentUnitIndex + 1];
      setCurrentUnit(nextUnit);
      if (nextUnit.pages && nextUnit.pages.length > 0) {
        const sortedNextPages = nextUnit.pages.sort((a, b) => a.order - b.order);
        setCurrentPage(sortedNextPages[0]);
        setPageIndex(0);
      }
    }
  };

  const handleCongratulationModalClose = () => {
    setShowCongratulationModal(false);
    // Redirect to dashboard courses tab to let user choose any course they want
    navigate('/dashboard?tab=courses');
  };

  const handleTakeQuiz = async () => {
    setShowCongratulationModal(false);

    try {
      // Try to find a unit quiz for the completed module
      const response = await axios.get(`/api/quizzes/unit/${currentUnit._id}`);
      if (response.data.quizzes && response.data.quizzes.length > 0) {
        // Navigate to the first available unit quiz
        navigate(`/quiz/${response.data.quizzes[0]._id}`);
        return;
      }
    } catch (error) {
      console.error('Error checking for unit quiz:', error);
    }

    // If no unit quiz found, navigate back to courses
    navigate('/dashboard?tab=courses');
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
  if (currentPage && currentUnit) {
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
            unitTitle={currentUnit.title}
            courseStructure={course.structure}
            courseId={courseId}
            moduleId={currentUnit._id}
            onComplete={handleEndUnit}
            isCompleted={isModuleCompleted(currentUnit._id)}
          />

          {/* Congratulation Modal */}
          <CongratulationModal
            isOpen={showCongratulationModal}
            onClose={handleCongratulationModalClose}
            onTakeQuiz={handleTakeQuiz}
            gemsEarned={completedModuleGems}
            moduleTitle={completedModuleTitle}
            username={user?.name}
            isFirstCompletion={isFirstCompletion}
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
              <span>📚 {course.modules?.length || 0} {course.structure?.unitLabel?.toLowerCase() || 'units'}</span>
              <span>👥 {course.enrollmentCount?.toLocaleString() || 0} enrolled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Units */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course {course.structure?.unitLabel || 'Units'}</h2>
            <div className="space-y-4">
              {course.modules?.map((unit, index) => (
                <div key={unit._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                          {course.structure?.unitLabel || 'Unit'} {index + 1}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">{unit.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{unit.description}</p>

                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">📄 {unit.pages?.length || 0} pages</span>
                        <span>⏱️ {unit.estimatedTime} mins</span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => {
                          setCurrentUnit(unit);
                          if (unit.pages && unit.pages.length > 0) {
                            const sortedPages = unit.pages.sort((a, b) => a.order - b.order);
                            setCurrentPage(sortedPages[0]);
                            setPageIndex(0);
                          }
                          // Update URL to reflect the current unit for proper navigation
                          navigate(`/courses/${courseId}?moduleId=${unit._id}`, { replace: true });
                          // Scroll to top when starting a unit
                          window.scrollTo(0, 0);
                        }}
                          className="btn-primary"
                        disabled={!unit.pages || unit.pages.length === 0}
                        >
                        {unit.pages && unit.pages.length > 0 ? `Start ${course.structure?.unitLabel || 'Unit'}` : 'No Pages Yet'}
                      </button>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">No {course.structure?.unitLabel?.toLowerCase() || 'units'} available for this course.</p>
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

      {/* Congratulation Modal */}
      <CongratulationModal
        isOpen={showCongratulationModal}
        onClose={handleCongratulationModalClose}
        onTakeQuiz={handleTakeQuiz}
        gemsEarned={completedModuleGems}
        moduleTitle={completedModuleTitle}
        username={user?.name}
        isFirstCompletion={isFirstCompletion}
      />
    </div>
  );
};

export default CourseDetail;
