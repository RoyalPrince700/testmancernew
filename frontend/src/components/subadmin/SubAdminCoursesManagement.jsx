import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdMenuBook, MdClose } from 'react-icons/md';

const SubAdminCoursesManagement = () => {
  const { user, assignedUniversities, assignedFaculties, assignedLevels } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    courseCode: '',
    description: '',
    units: 1
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
        }
      };

      const response = await axios.post('/api/courses/admin/courses', courseData);
      toast.success('Course created successfully!');
      setCourses([...courses, response.data.course]);
      setShowCreateForm(false);
      setCourseForm({
        title: '',
        courseCode: '',
        description: '',
        units: 1
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1">
              Manage courses within your assigned scope ({getScopedCoursesCount()} of {courses.length} total courses)
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            Create Course
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex-1">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Course</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter course description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
                <select
                  value={courseForm.units}
                  onChange={(e) => setCourseForm({...courseForm, units: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value={1}>1 Unit</option>
                  <option value={2}>2 Units</option>
                  <option value={3}>3 Units</option>
                  <option value={4}>4 Units</option>
                  <option value={5}>5 Units</option>
                </select>
              </div>
            </div>


            {/* Course audience will be auto-populated based on subadmin's assigned scope */}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Create Course
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center">
            <MdMenuBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Create your first course to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="text-sm text-gray-500 line-clamp-2">{course.description}</div>
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
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
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
        )}
      </div>
    </div>
  );
};

export default SubAdminCoursesManagement;
