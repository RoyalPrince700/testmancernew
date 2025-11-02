import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdMenuBook, MdClose, MdSettings, MdPublish, MdUnpublished, MdVisibility } from 'react-icons/md';
import MediaUpload from '../MediaUpload';
import Card from '../ui/Card';

// Gradient theme options for course covers
const GRADIENT_THEMES = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🌊'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🌅'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '🌲'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    icon: '👑'
  },
  {
    id: 'fire-red',
    name: 'Fire Red',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    icon: '🔥'
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
    icon: '🌌'
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    gradient: 'linear-gradient(135deg, #00F260 0%, #0575E6 100%)',
    icon: '🌿'
  },
  {
    id: 'golden-sunset',
    name: 'Golden Sunset',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    icon: '✨'
  },
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    gradient: 'linear-gradient(135deg, #74c0fc 0%, #339af0 100%)',
    icon: '❄️'
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
    icon: '🌹'
  }
];

const SubAdminCoursesManagement = () => {
  const { user, assignedUniversities, assignedFaculties, assignedDepartments, assignedLevels } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  // Helper function to get unitLabel from unitType
  const getUnitLabel = (unitType) => {
    return unitType.charAt(0).toUpperCase() + unitType.slice(1);
  };

  const [courseForm, setCourseForm] = useState({
    title: '',
    courseCode: '',
    description: '',
    theme: 'ocean-blue', // Default theme
    units: 1, // Keep for backward compatibility
    structure: {
      unitType: 'module',
      unitLabel: getUnitLabel('module'),
      unitCount: 1
    }
  });

  const [editForm, setEditForm] = useState({
    title: '',
    courseCode: '',
    description: '',
    theme: 'ocean-blue', // Default theme
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
        title: courseForm.title,
        courseCode: courseForm.courseCode,
        description: courseForm.description,
        // Map unitCount to units for backward compatibility (cap at 5 for old field)
        units: Math.min(courseForm.structure.unitCount, 5),
        audience: {
          universities: assignedUniversities || [],
          faculties: assignedFaculties || [],
          departments: assignedDepartments || [],
          levels: assignedLevels || []
        },
        structure: courseForm.structure
      };

      const response = await axios.post('/api/courses/admin/courses', courseData);
      toast.success('Course created successfully!');

      setCourses([...courses, response.data.course]);
      setShowCreateForm(false);
      setCourseForm({
        title: '',
        courseCode: '',
        description: '',
        theme: 'ocean-blue',
        units: 1,
        structure: {
          unitType: 'module',
          unitLabel: getUnitLabel('module'),
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

  const handleEditCourse = (course) => {
    setSelectedCourseForEdit(course);
    setEditForm({
      title: course.title,
      courseCode: course.courseCode,
      description: course.description,
      theme: course.theme || 'ocean-blue',
      units: course.units || 1,
      structure: course.structure || {
        unitType: 'module',
        unitLabel: 'Module',
        unitCount: 1
      }
    });
    setShowEditForm(true);
  };

  const handleCourseUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/courses/admin/courses/${selectedCourseForEdit._id}`, editForm);
      toast.success('Course updated successfully!');

      // Update the course in the local state
      setCourses(courses.map(course =>
        course._id === selectedCourseForEdit._id
          ? { ...course, ...editForm }
          : course
      ));

      setShowEditForm(false);
      setSelectedCourseForEdit(null);
      setEditForm({
        title: '',
        courseCode: '',
        description: ''
      });
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error(error.response?.data?.message || 'Failed to update course');
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
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage courses within your assigned scope ({getScopedCoursesCount()} of {courses.length} total courses)
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm w-full md:w-auto"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            Create Course
          </button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-5">
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
      </Card>

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
              <label className="block text-sm font-medium text-gray-700 mb-3">Course Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {GRADIENT_THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => setCourseForm({...courseForm, theme: theme.id})}
                    className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
                      courseForm.theme === theme.id
                        ? 'border-green-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ background: theme.gradient }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{theme.icon}</div>
                      <div className="text-xs font-medium text-white drop-shadow-md">
                        {theme.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Structure Type</label>
                <select
                  value={courseForm.structure.unitType}
                  onChange={(e) => {
                    const unitType = e.target.value;
                    const unitLabel = getUnitLabel(unitType);
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

      {/* Edit Course Form */}
      {showEditForm && selectedCourseForEdit && (
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Edit Course</h2>
            <button
              onClick={() => {
                setShowEditForm(false);
                setSelectedCourseForEdit(null);
                setEditForm({
                  title: '',
                  courseCode: '',
                  description: '',
                  theme: 'ocean-blue',
                  units: 1,
                  structure: {
                    unitType: 'module',
                    unitLabel: 'Module',
                    unitCount: 1
                  }
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCourseUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                <input
                  type="text"
                  value={editForm.courseCode}
                  onChange={(e) => setEditForm({...editForm, courseCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., CSC 101"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter course description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Course Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {GRADIENT_THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => setEditForm({...editForm, theme: theme.id})}
                    className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
                      editForm.theme === theme.id
                        ? 'border-blue-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ background: theme.gradient }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{theme.icon}</div>
                      <div className="text-xs font-medium text-white drop-shadow-md">
                        {theme.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Structure Type</label>
                <select
                  value={editForm.structure.unitType}
                  onChange={(e) => {
                    const unitType = e.target.value;
                    const unitLabel = getUnitLabel(unitType);
                    setEditForm({
                      ...editForm,
                      structure: {
                        ...editForm.structure,
                        unitType,
                        unitLabel
                      }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="chapter">Chapter</option>
                  <option value="module">Module</option>
                  <option value="section">Section</option>
                  <option value="topic">Topic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Count</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.structure.unitCount}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    structure: {
                      ...editForm.structure,
                      unitCount: parseInt(e.target.value) || 1
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="1-100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Label</label>
                <input
                  type="text"
                  value={editForm.structure.unitLabel}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    structure: {
                      ...editForm.structure,
                      unitLabel: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., Chapter, Module, Section"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Units (Legacy)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editForm.units}
                  onChange={(e) => setEditForm({...editForm, units: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="1-5"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Update Course
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedCourseForEdit(null);
                  setEditForm({
                    title: '',
                    courseCode: '',
                    description: '',
                    theme: 'ocean-blue',
                    units: 1,
                    structure: {
                      unitType: 'module',
                      unitLabel: 'Module',
                      unitCount: 1
                    }
                  });
                }}
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900">{course.courseCode}</div>
                          <div className="text-xs text-gray-500 line-clamp-2 break-words">{course.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="text-xs max-w-xs">
                          {course.audience?.universities?.length > 0 && (
                            <div className="truncate">{course.audience.universities.length} universities</div>
                          )}
                          {course.audience?.faculties?.length > 0 && (
                            <div className="truncate">{course.audience.faculties.length} faculties</div>
                          )}
                          {course.audience?.levels?.length > 0 && (
                            <div className="truncate">{course.audience.levels.length} levels</div>
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
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit Course Details"
                        >
                          <MdEdit className="w-4 h-4" />
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredCourses.map((course) => (
                <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{course.courseCode}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">{course.description}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2 flex-shrink-0">
                      Active
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center justify-center"
                    >
                      <MdMenuBook className="w-3 h-3 mr-1" />
                      Manage
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center justify-center"
                    >
                      <MdEdit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center justify-center"
                    >
                      <MdDelete className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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
  const [showPagePreview, setShowPagePreview] = useState(false);
  const [previewPage, setPreviewPage] = useState(null);
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
  const [editingPage, setEditingPage] = useState(null);

  const handleAudioUpload = (uploadData) => {
    // uploadData is an object with {url, publicId, bytes, duration, format}
    // We need just the url string for the form
    setPageForm(prev => ({ ...prev, audioUrl: uploadData.url }));
  };

  const handleVideoUpload = (uploadData) => {
    // uploadData is an object with {url, publicId, bytes, duration, format}
    // We need just the url string for the form
    setPageForm(prev => ({ ...prev, videoUrl: uploadData.url }));
  };

  useEffect(() => {
    loadUnits();
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
      let response;
      if (editingPage) {
        // Update existing page
        response = await axios.put(
          `/api/courses/admin/courses/${course._id}/modules/${selectedUnit}/pages/${editingPage._id}`,
          pageForm
        );
        toast.success('Page updated successfully!');
      } else {
        // Create new page
        response = await axios.post(
          `/api/courses/admin/courses/${course._id}/modules/${selectedUnit}/pages`,
          pageForm
        );
        toast.success('Page created successfully!');
      }

      // Reload units to get updated data
      await loadUnits();
      setShowPageForm(false);
      setEditingPage(null);
      setPageForm({
        title: '',
        order: 1,
        html: '',
        audioUrl: '',
        videoUrl: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to save page:', error);
      toast.error(error.response?.data?.message || `Failed to ${editingPage ? 'update' : 'create'} page`);
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


  const handlePreviewPage = (page, unit) => {
    setPreviewPage({ ...page, unitTitle: unit.title });
    setShowPagePreview(true);
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
    setPageForm({
      title: page.title,
      order: page.order,
      html: page.html || '',
      audioUrl: page.audioUrl || '',
      videoUrl: page.videoUrl || '',
      attachments: page.attachments || []
    });
    setShowPageForm(true);
  };

  const handlePublishUnit = async (unitId) => {
    try {
      const response = await axios.post(`/api/courses/admin/courses/${course._id}/units/${unitId}/publish`);
      toast.success('Unit published successfully!');

      // Update the unit in the local state
      setUnits(units.map(unit =>
        unit._id === unitId
          ? { ...unit, isPublished: true }
          : unit
      ));
    } catch (error) {
      console.error('Failed to publish unit:', error);
      toast.error(error.response?.data?.message || 'Failed to publish unit');
    }
  };

  const handleUnpublishUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to unpublish this unit? Users will no longer see it.')) {
      return;
    }

    try {
      const response = await axios.post(`/api/courses/admin/courses/${course._id}/units/${unitId}/unpublish`);
      toast.success('Unit unpublished successfully!');

      // Update the unit in the local state
      setUnits(units.map(unit =>
        unit._id === unitId
          ? { ...unit, isPublished: false }
          : unit
      ));
    } catch (error) {
      console.error('Failed to unpublish unit:', error);
      toast.error(error.response?.data?.message || 'Failed to unpublish unit');
    }
  };

  const unitLabel = course.structure?.unitLabel || course.structure?.unitType ?
    course.structure.unitType.charAt(0).toUpperCase() + course.structure.unitType.slice(1) : 'Module';

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Managing: {course.title}</h1>
            <p className="text-gray-600 mt-1">
              {unitLabel}s: {units.length} | Structure: {course.structure?.unitType || 'module'} ({course.structure?.unitCount || 1} total)
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full md:w-auto"
          >
            Back to Courses
          </button>
        </div>
      </div>

      {/* Add Unit Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{unitLabel}s</h2>
            <p className="text-gray-600 text-sm">Create and manage {unitLabel.toLowerCase()}s for this course</p>
          </div>
          <button
            onClick={() => setShowUnitForm(!showUnitForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center w-full md:w-auto"
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
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                    <p className="text-gray-600 mt-1">{unit.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Order: {unit.order}</span>
                      <span>Time: {unit.estimatedTime}min</span>
                      <span>Pages: {unit.pages?.length || 0}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        unit.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {unit.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUnit(selectedUnit === unit._id ? null : unit._id);
                        setShowPageForm(false);
                      }}
                      className="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center flex-shrink-0"
                    >
                      <MdSettings className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">{selectedUnit === unit._id ? 'Hide Pages' : 'Manage Pages'}</span>
                      <span className="md:hidden">Pages</span>
                    </button>
                    {unit.isPublished ? (
                      <button
                        onClick={() => handleUnpublishUnit(unit._id)}
                        className="bg-orange-600 text-white px-2 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center justify-center flex-shrink-0"
                        title="Unpublish this unit"
                      >
                        <MdUnpublished className="w-4 h-4" />
                        <span className="hidden md:inline ml-1">Unpublish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublishUnit(unit._id)}
                        className="bg-green-600 text-white px-2 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center flex-shrink-0"
                        title="Publish this unit to make it visible to users"
                        disabled={!unit.pages || unit.pages.length === 0}
                      >
                        <MdPublish className="w-4 h-4" />
                        <span className="hidden md:inline ml-1">Publish</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUnit(unit._id)}
                      className="bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center flex-shrink-0"
                    >
                      <MdDelete className="w-4 h-4" />
                      <span className="hidden md:inline ml-1">Delete</span>
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
                        <h5 className="font-medium mb-3">{editingPage ? 'Edit Page' : 'Create New Page'}</h5>
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
                              {editingPage ? 'Update Page' : 'Create Page'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPageForm(false);
                                setEditingPage(null);
                                setPageForm({
                                  title: '',
                                  order: 1,
                                  html: '',
                                  audioUrl: '',
                                  videoUrl: '',
                                  attachments: []
                                });
                              }}
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
                        unit.pages?.map(page => (
                          <div key={page._id} className="bg-gray-50 p-3 rounded border">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{page.title}</span>
                                <span className="text-gray-500 text-xs">(Order: {page.order})</span>
                                {page.audioUrl && <span className="text-green-600 text-xs">🎵 Audio</span>}
                                {page.videoUrl && <span className="text-blue-600 text-xs">🎬 Video</span>}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePreviewPage(page, unit)}
                                  className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                                  title="Preview Page"
                                >
                                  <MdVisibility className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditPage(page)}
                                  className="text-green-600 hover:text-green-800 text-sm px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                                  title="Edit Page"
                                >
                                  <MdEdit className="w-4 h-4" />
                                </button>
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
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>


      {/* Page Preview Modal */}
      {showPagePreview && previewPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Page Preview</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {previewPage.unitTitle} → {previewPage.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPagePreview(false);
                  setPreviewPage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Page Header */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
                  <h1 className="text-2xl font-bold">{previewPage.title}</h1>
                  <p className="text-blue-100 mt-1">Course: {course.title}</p>
                </div>
              </div>

              {/* Page Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                {previewPage.html ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewPage.html }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MdMenuBook className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No content added to this page yet.</p>
                  </div>
                )}
              </div>

              {/* Media Section */}
              {(previewPage.audioUrl || previewPage.videoUrl) && (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Content</h3>
                  <div className="space-y-4">
                    {previewPage.audioUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Audio:</h4>
                        <audio controls className="w-full">
                          <source src={previewPage.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    {previewPage.videoUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Video:</h4>
                        <video controls className="w-full max-w-2xl rounded-lg">
                          <source src={previewPage.videoUrl} type="video/mp4" />
                          Your browser does not support the video element.
                        </video>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Notice */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <MdVisibility className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Preview Mode</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This is how the page will appear to students once published. Make sure all content is ready before publishing the unit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowPagePreview(false);
                  setPreviewPage(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminCoursesManagement;
