import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdMenuBook, MdClose, MdSettings, MdQuiz } from 'react-icons/md';
import MediaUpload from '../MediaUpload';
import QuizBuilder from './QuizBuilder';

const SubAdminCoursesManagement = () => {
  const { user, assignedUniversities, assignedFaculties, assignedLevels } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    courseCode: '',
    description: '',
    units: 1, // Keep for backward compatibility
    structure: {
      unitType: 'module',
      unitLabel: 'Module',
      unitCount: 1
    }
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses/admin/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      // Auto-populate audience based on subadmin's assigned scope
      const courseData = {
        ...courseForm,
        audience: {
          universities: assignedUniversities || [],
          faculties: assignedFaculties || [],
          levels: assignedLevels || []
        },
        // Map unitCount to units for backward compatibility (cap at 5 for old field)
        units: Math.min(courseForm.structure.unitCount, 5),
        structure: courseForm.structure
      };
      // Remove structure from the spread to avoid duplication
      delete courseData.structure;

      const response = await axios.post('/api/courses/admin/courses', courseData);
      toast.success('Course created successfully!');

      // TODO: Phase 6 - Navigate to Manage Units view
      toast('Next: Manage Units for this course (Phase 6)', { duration: 3000 });

      setCourses([...courses, response.data.course]);
      setShowCreateForm(false);
      setCourseForm({
        title: '',
        courseCode: '',
        description: '',
        units: 1,
        structure: {
          unitType: 'module',
          unitLabel: 'Module',
          unitCount: 1
        }
      });
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    }
  };


  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/courses/admin/courses/${courseId}`);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const getScopedCoursesCount = () => {
    return courses.filter(course => {
      // For subadmins, check if course is in their scope
      if (user?.role === 'subadmin') {
        const courseUniversities = course.audience?.universities || [];
        const courseFaculties = course.audience?.faculties || [];
        const courseLevels = course.audience?.levels || [];

        // If course has audience restrictions, check assignments
        if (courseUniversities.length > 0 || courseFaculties.length > 0 || courseLevels.length > 0) {
          const hasUniversityMatch = courseUniversities.length === 0 ||
            courseUniversities.some(u => assignedUniversities.includes(u));
          const hasFacultyMatch = courseFaculties.length === 0 ||
            courseFaculties.some(f => assignedFaculties.includes(f));
          const hasLevelMatch = courseLevels.length === 0 ||
            courseLevels.some(l => assignedLevels.includes(l));

          return hasUniversityMatch && hasFacultyMatch && hasLevelMatch;
        }
        return true; // No audience restrictions
      }

      // For category admins
      if (user?.role === 'waec_admin') {
        return (course.tags || []).includes('waec');
      }
      if (user?.role === 'jamb_admin') {
        return (course.tags || []).includes('jamb');
      }

      return true;
    }).length;
  };

  // Show course manager if a course is selected
  if (selectedCourse) {
    return (
      <CourseManager
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onUpdate={() => {
          fetchCourses(); // Refresh courses list
          setSelectedCourse(null); // Close manager
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage courses within your assigned scope ({getScopedCoursesCount()} of {courses.length} total courses)
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            Create Course
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
        <div className="flex-1">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Create New Course</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCourseSubmit} className="space-y-4">
            {/* Show subadmin's assigned scope */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Your Assigned Scope</h4>
              <div className="text-xs text-blue-700 space-y-1">
                {assignedUniversities?.length > 0 && (
                  <div><strong>Universities:</strong> {assignedUniversities.join(', ')}</div>
                )}
                {assignedFaculties?.length > 0 && (
                  <div><strong>Faculties:</strong> {assignedFaculties.join(', ')}</div>
                )}
                {assignedLevels?.length > 0 && (
                  <div><strong>Levels:</strong> {assignedLevels.join(', ')}</div>
                )}
                {(!assignedUniversities?.length && !assignedFaculties?.length && !assignedLevels?.length) && (
                  <div><em>No specific assignments - courses will be available to all students</em></div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Courses you create will automatically be assigned to this audience scope.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                <input
                  type="text"
                  value={courseForm.courseCode}
                  onChange={(e) => setCourseForm({...courseForm, courseCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="e.g., CSC 101"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Enter course description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Structure Type</label>
                <select
                  value={courseForm.structure.unitType}
                  onChange={(e) => {
                    const unitType = e.target.value;
                    const unitLabel = unitType.charAt(0).toUpperCase() + unitType.slice(1);
                    setCourseForm({
                      ...courseForm,
                      structure: {
                        ...courseForm.structure,
                        unitType,
                        unitLabel
                      }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="chapter">Chapter</option>
                  <option value="module">Module</option>
                  <option value="section">Section</option>
                  <option value="topic">Topic</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Label</label>
                <input
                  type="text"
                  value={courseForm.structure.unitLabel}
                  onChange={(e) => setCourseForm({
                    ...courseForm,
                    structure: {
                      ...courseForm.structure,
                      unitLabel: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="e.g., Chapter, Module, Section"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Count</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={courseForm.structure.unitCount}
                  onChange={(e) => setCourseForm({
                    ...courseForm,
                    structure: {
                      ...courseForm.structure,
                      unitCount: parseInt(e.target.value) || 1
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="1-100"
                  required
                />
              </div>
            </div>


            {/* Course audience will be auto-populated based on subadmin's assigned scope */}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Create Course
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center">
            <MdMenuBook className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No courses found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search' : 'Create your first course to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{course.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs">
                        {course.audience?.universities?.length > 0 && (
                          <div>{course.audience.universities.length} universities</div>
                        )}
                        {course.audience?.faculties?.length > 0 && (
                          <div>{course.audience.faculties.length} faculties</div>
                        )}
                        {course.audience?.levels?.length > 0 && (
                          <div>{course.audience.levels.length} levels</div>
                        )}
                        {!course.audience?.universities?.length &&
                         !course.audience?.faculties?.length &&
                         !course.audience?.levels?.length && (
                          <div>All students</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Manage Units & Pages"
                      >
                        <MdMenuBook className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Course Manager Component for managing units and pages
const CourseManager = ({ course, onBack, onUpdate }) => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showPageForm, setShowPageForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [quizBuilderConfig, setQuizBuilderConfig] = useState(null);
  const [unitQuizzes, setUnitQuizzes] = useState({});
  const [pageQuizzes, setPageQuizzes] = useState({});
  const [unitForm, setUnitForm] = useState({
    title: '',
    description: '',
    order: 1,
    estimatedTime: 30
  });
  const [pageForm, setPageForm] = useState({
    title: '',
    order: 1,
    html: '',
    audioUrl: '',
    videoUrl: '',
    attachments: []
  });

  const handleAudioUpload = (url) => {
    setPageForm(prev => ({ ...prev, audioUrl: url }));
  };

  const handleVideoUpload = (url) => {
    setPageForm(prev => ({ ...prev, videoUrl: url }));
  };

  useEffect(() => {
    loadUnits();
    loadQuizzes();
  }, [course._id]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/admin/courses/${course._id}/units`);
      setUnits(response.data.units || []);
    } catch (error) {
      console.error('Failed to load units:', error);
      toast.error('Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/courses/admin/courses/${course._id}/units`, unitForm);
      toast.success('Unit created successfully!');
      setUnits([...units, response.data.unit]);
      setShowUnitForm(false);
      setUnitForm({
        title: '',
        description: '',
        order: units.length + 1,
        estimatedTime: 30
      });
    } catch (error) {
      console.error('Failed to create unit:', error);
      toast.error(error.response?.data?.message || 'Failed to create unit');
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/courses/admin/courses/${course._id}/units/${unitId}`);
      toast.success('Unit deleted successfully');
      setUnits(units.filter(u => u._id !== unitId));
    } catch (error) {
      console.error('Failed to delete unit:', error);
      toast.error(error.response?.data?.message || 'Failed to delete unit');
    }
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/courses/admin/courses/${course._id}/modules/${selectedUnit}/pages`,
        pageForm
      );
      toast.success('Page created successfully!');
      // Reload units to get updated data
      await loadUnits();
      setShowPageForm(false);
      setPageForm({
        title: '',
        order: 1,
        html: '',
        audioUrl: '',
        videoUrl: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to create page:', error);
      toast.error(error.response?.data?.message || 'Failed to create page');
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `/api/courses/admin/courses/${course._id}/modules/${selectedUnit}/pages/${pageId}`
      );
      toast.success('Page deleted successfully');
      await loadUnits(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast.error(error.response?.data?.message || 'Failed to delete page');
    }
  };

  const loadQuizzes = async () => {
    try {
      const response = await axios.get(`/api/quizzes/course/${course._id}/detailed`);
      const { unitQuizzes: uQuizzes, pageQuizzes: pQuizzes } = response.data;

      // Organize quizzes by unitId and page key
      const unitQuizMap = {};
      const pageQuizMap = {};

      uQuizzes.forEach(quiz => {
        if (quiz.moduleId) {
          unitQuizMap[quiz.moduleId] = quiz;
        }
      });

      pQuizzes.forEach(quiz => {
        const key = `${quiz.moduleId}-${quiz.pageOrder}`;
        pageQuizMap[key] = quiz;
      });

      setUnitQuizzes(unitQuizMap);
      setPageQuizzes(pageQuizMap);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      // Don't show error toast as this might fail on courses without quizzes
    }
  };

  const openQuizBuilder = (trigger, moduleId, pageOrder, existingQuiz = null) => {
    setQuizBuilderConfig({
      trigger,
      moduleId,
      pageOrder,
      existingQuiz
    });
    setShowQuizBuilder(true);
  };

  const handleQuizSave = (savedQuiz) => {
    loadQuizzes(); // Reload quizzes to reflect changes
    toast.success(`Quiz ${savedQuiz._id ? 'updated' : 'created'} successfully!`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/quizzes/admin/quizzes/${quizId}`);
      toast.success('Quiz deleted successfully');
      loadQuizzes(); // Reload to remove the deleted quiz
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const unitLabel = course.structure?.unitLabel || 'Unit';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Managing: {course.title}</h1>
              <p className="text-gray-600 mt-1">Loading units...</p>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Managing: {course.title}</h1>
            <p className="text-gray-600 mt-1">
              {unitLabel}s: {units.length} | Structure: {course.structure?.unitType || 'module'} ({course.structure?.unitCount || 1} total)
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>

      {/* Add Unit Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{unitLabel}s</h2>
            <p className="text-gray-600 text-sm">Create and manage {unitLabel.toLowerCase()}s for this course</p>
          </div>
          <button
            onClick={() => setShowUnitForm(!showUnitForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            {showUnitForm ? 'Cancel' : `Add ${unitLabel}`}
          </button>
        </div>
      </div>

      {/* Unit Form */}
      {showUnitForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New {unitLabel}</h3>
            <button
              onClick={() => setShowUnitForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUnitSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{unitLabel} Title</label>
                <input
                  type="text"
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({...unitForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={`Enter ${unitLabel.toLowerCase()} title`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  min="1"
                  value={unitForm.order}
                  onChange={(e) => setUnitForm({...unitForm, order: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={unitForm.description}
                onChange={(e) => setUnitForm({...unitForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`Enter ${unitLabel.toLowerCase()} description`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time (minutes)</label>
              <input
                type="number"
                min="1"
                value={unitForm.estimatedTime}
                onChange={(e) => setUnitForm({...unitForm, estimatedTime: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Create {unitLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowUnitForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Units List */}
      <div className="space-y-4">
        {units.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MdMenuBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {unitLabel.toLowerCase()}s yet</h3>
            <p className="text-gray-500">Create your first {unitLabel.toLowerCase()} to get started</p>
          </div>
        ) : (
          units.map(unit => (
            <div key={unit._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                    <p className="text-gray-600 mt-1">{unit.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Order: {unit.order}</span>
                      <span>Time: {unit.estimatedTime}min</span>
                      <span>Pages: {unit.pages?.length || 0}</span>
                    </div>
                    {unitQuizzes[unit._id] && (
                      <div className="mt-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded inline-flex items-center">
                        <MdQuiz className="w-4 h-4 mr-1" />
                        {unitLabel} Quiz: {unitQuizzes[unit._id].title} ({unitQuizzes[unit._id].questions?.length || 0} questions)
                        <div className="ml-2 flex gap-1">
                          <button
                            onClick={() => openQuizBuilder('unit', unit._id, null, unitQuizzes[unit._id])}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Quiz"
                          >
                            <MdEdit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(unitQuizzes[unit._id]._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Quiz"
                          >
                            <MdDelete className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUnit(selectedUnit === unit._id ? null : unit._id);
                        setShowPageForm(false);
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {selectedUnit === unit._id ? 'Hide Pages' : 'Manage Pages'}
                    </button>
                    <button
                      onClick={() => openQuizBuilder('unit', unit._id)}
                      className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
                      title={`Add Quiz for this ${unitLabel}`}
                    >
                      <MdQuiz className="w-4 h-4 mr-1" />
                      Add Quiz
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Pages Section */}
                {selectedUnit === unit._id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Pages</h4>
                      <button
                        onClick={() => setShowPageForm(!showPageForm)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                      >
                        <MdAdd className="w-4 h-4 mr-1" />
                        {showPageForm ? 'Cancel' : 'Add Page'}
                      </button>
                    </div>

                    {/* Page Form */}
                    {showPageForm && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h5 className="font-medium mb-3">Create New Page</h5>
                        <form onSubmit={handlePageSubmit} className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Page Title"
                              value={pageForm.title}
                              onChange={(e) => setPageForm({...pageForm, title: e.target.value})}
                              className="px-3 py-2 border border-gray-300 rounded text-sm"
                              required
                            />
                            <input
                              type="number"
                              placeholder="Order"
                              min="1"
                              value={pageForm.order}
                              onChange={(e) => setPageForm({...pageForm, order: parseInt(e.target.value)})}
                              className="px-3 py-2 border border-gray-300 rounded text-sm"
                              required
                            />
                          </div>
                          <textarea
                            placeholder="Page Content (HTML)"
                            value={pageForm.html}
                            onChange={(e) => setPageForm({...pageForm, html: e.target.value})}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            required
                          />
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Audio Upload (optional)</label>
                              <MediaUpload
                                type="audio"
                                onUploadComplete={handleAudioUpload}
                                className="text-sm"
                              />
                              {pageForm.audioUrl && (
                                <p className="text-xs text-green-600 mt-1">Audio uploaded successfully</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Video Upload (optional)</label>
                              <MediaUpload
                                type="video"
                                onUploadComplete={handleVideoUpload}
                                className="text-sm"
                              />
                              {pageForm.videoUrl && (
                                <p className="text-xs text-blue-600 mt-1">Video uploaded successfully</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                            >
                              Create Page
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPageForm(false)}
                              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Pages List */}
                    <div className="space-y-2">
                      {unit.pages?.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No pages yet</p>
                      ) : (
                        unit.pages?.map(page => {
                          const pageKey = `${unit._id}-${page.order}`;
                          const pageQuiz = pageQuizzes[pageKey];

                          return (
                            <div key={page._id} className="bg-gray-50 p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{page.title}</span>
                                    <span className="text-gray-500 text-xs">(Order: {page.order})</span>
                                    {page.audioUrl && <span className="text-green-600 text-xs">🎵 Audio</span>}
                                    {page.videoUrl && <span className="text-blue-600 text-xs">🎬 Video</span>}
                                  </div>
                                  {pageQuiz && (
                                    <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1 inline-flex items-center">
                                      <MdQuiz className="w-3 h-3 mr-1" />
                                      Quiz: {pageQuiz.title} ({pageQuiz.questions?.length || 0} questions)
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {!pageQuiz ? (
                                    <button
                                      onClick={() => openQuizBuilder('page', unit._id, page.order)}
                                      className="text-purple-600 hover:text-purple-800 text-sm px-2 py-1 border border-purple-200 rounded hover:bg-purple-50"
                                      title="Add Quiz for this Page"
                                    >
                                      <MdQuiz className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => openQuizBuilder('page', unit._id, page.order, pageQuiz)}
                                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
                                        title="Edit Quiz"
                                      >
                                        <MdEdit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuiz(pageQuiz._id)}
                                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                                        title="Delete Quiz"
                                      >
                                        <MdDelete className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => handleDeletePage(page._id)}
                                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                                    title="Delete Page"
                                  >
                                    <MdDelete className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quiz Builder Modal */}
      {showQuizBuilder && quizBuilderConfig && (
        <QuizBuilder
          course={course}
          trigger={quizBuilderConfig.trigger}
          moduleId={quizBuilderConfig.moduleId}
          pageOrder={quizBuilderConfig.pageOrder}
          existingQuiz={quizBuilderConfig.existingQuiz}
          onClose={() => {
            setShowQuizBuilder(false);
            setQuizBuilderConfig(null);
          }}
          onSave={handleQuizSave}
        />
      )}
    </div>
  );
};

export default SubAdminCoursesManagement;
