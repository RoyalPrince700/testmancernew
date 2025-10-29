import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdAssessment, MdSchool, MdClose, MdVisibility, MdQuiz } from 'react-icons/md';
import AssessmentBuilder from './AssessmentBuilder';

const SubAdminAssessmentManagement = () => {
  const { user, assignedUniversities, assignedFaculties, assignedDepartments, assignedLevels } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showAssessmentBuilder, setShowAssessmentBuilder] = useState(false);
  const [assessmentBuilderConfig, setAssessmentBuilderConfig] = useState(null);

  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    type: 'ca', // 'ca' or 'exam'
    courseId: '',
    moduleId: '',
    pageOrder: null,
    trigger: 'unit' // 'unit' or 'page'
  });

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/assessments/admin/assessments');
      setAssessments(response.data.assessments || []);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses/admin/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchCourses();
  }, []);

  const filteredAssessments = assessments.filter(assessment => {
    const courseTitle = (assessment.courseId?.title || assessment.course?.title || '').toLowerCase();
    const courseCode = (assessment.courseId?.courseCode || assessment.course?.courseCode || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = assessment.title.toLowerCase().includes(query) ||
                         assessment.description.toLowerCase().includes(query) ||
                         courseTitle.includes(query) ||
                         courseCode.includes(query);
    return matchesSearch;
  });

  const handleCreateAssessment = () => {
    setAssessmentForm({
      title: '',
      description: '',
      type: 'ca',
      courseId: '',
      moduleId: '',
      pageOrder: null,
      trigger: 'unit'
    });
    setShowCreateForm(true);
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();

    if (!assessmentForm.courseId) {
      toast.error('Please select a course');
      return;
    }

    // Find the selected course object
    const selectedCourse = courses.find(course => course._id === assessmentForm.courseId);
    if (!selectedCourse) {
      toast.error('Selected course not found');
      return;
    }

    // Open the assessment builder with the selected configuration
    setAssessmentBuilderConfig({
      type: assessmentForm.type,
      course: selectedCourse,
      courseId: assessmentForm.courseId,
      moduleId: assessmentForm.moduleId || null,
      pageOrder: assessmentForm.trigger === 'page' ? assessmentForm.pageOrder : null,
      trigger: assessmentForm.trigger
    });
    setShowAssessmentBuilder(true);
    setShowCreateForm(false);
  };

  const handleAssessmentSave = (savedAssessment) => {
    fetchAssessments(); // Refresh the list
    toast.success(`${savedAssessment.type.toUpperCase()} created successfully!`);
  };

  const handleEditAssessment = (assessment) => {
    // Find the course object
    const courseObj = courses.find(course => course._id === assessment.courseId._id) || assessment.courseId;

    setAssessmentBuilderConfig({
      type: assessment.type,
      course: courseObj,
      courseId: assessment.courseId._id || assessment.courseId,
      moduleId: assessment.moduleId,
      pageOrder: assessment.pageOrder,
      trigger: assessment.trigger,
      existingAssessment: assessment
    });
    setShowAssessmentBuilder(true);
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/assessments/admin/assessments/${assessmentId}`);
      toast.success('Assessment deleted successfully');
      fetchAssessments();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete assessment');
    }
  };

  const handleTogglePublish = async (assessment) => {
    try {
      const next = !assessment.isActive;
      await axios.put(`/api/assessments/admin/assessments/${assessment._id}`, { isActive: next });
      toast.success(next ? 'Assessment published' : 'Assessment unpublished');
      fetchAssessments();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error(error.response?.data?.message || 'Failed to update publish status');
    }
  };

  const handleViewAssessment = (assessment) => {
    setSelectedAssessment(assessment);
  };

  const getAssessmentTypeIcon = (type) => {
    return type === 'exam' ? <MdSchool className="w-5 h-5 text-red-500" /> : <MdAssessment className="w-5 h-5 text-blue-500" />;
  };

  const getAssessmentTypeLabel = (type) => {
    return type === 'exam' ? 'Exam' : 'CA';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Assessment Management</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Create and manage CA and Exam assessments for your courses
            </p>
          </div>
          <button
            onClick={handleCreateAssessment}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm w-fit"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            Create Assessment
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Create Assessment Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Create New Assessment</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAssessmentSubmit} className="space-y-4">
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
                  <div><em>No specific assignments - you can create assessments for all courses</em></div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
              <select
                value={assessmentForm.courseId}
                onChange={(e) => setAssessmentForm({...assessmentForm, courseId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Title</label>
                <input
                  type="text"
                  value={assessmentForm.title}
                  onChange={(e) => setAssessmentForm({...assessmentForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Enter assessment title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                <select
                  value={assessmentForm.type}
                  onChange={(e) => setAssessmentForm({...assessmentForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="ca">Continuous Assessment (CA)</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={assessmentForm.description}
                onChange={(e) => setAssessmentForm({...assessmentForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Enter assessment description"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Configure Assessment
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

      {/* Assessments List */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="p-8 text-center">
            <MdAssessment className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No assessments found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search' : 'Create your first assessment to get started'}
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
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Questions
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
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getAssessmentTypeIcon(assessment.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-2">{assessment.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(assessment.courseId?.courseCode || assessment.course?.courseCode
                          ? (assessment.courseId?.courseCode || assessment.course?.courseCode).toUpperCase()
                          : 'UNKNOWN COURSE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assessment.type === 'exam'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {assessment.type === 'exam' ? <MdSchool className="w-3 h-3 mr-1" /> : <MdAssessment className="w-3 h-3 mr-1" />}
                          {getAssessmentTypeLabel(assessment.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assessment.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleTogglePublish(assessment)}
                          className={`mr-3 ${assessment.isActive ? 'text-yellow-700 hover:text-yellow-900' : 'text-indigo-600 hover:text-indigo-900'}`}
                          title={assessment.isActive ? 'Unpublish' : 'Publish'}
                        >
                          {assessment.isActive ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleViewAssessment(assessment)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Assessment"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAssessment(assessment)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Edit Assessment"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(assessment._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Assessment"
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
              {filteredAssessments.map((assessment) => (
                <div key={assessment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getAssessmentTypeIcon(assessment.type, 'w-4 h-4')}
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{assessment.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{assessment.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        assessment.type === 'exam'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getAssessmentTypeLabel(assessment.type)}
                      </span>
                      {assessment.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>Course: {(assessment.courseId?.courseCode || assessment.course?.courseCode
                      ? (assessment.courseId?.courseCode || assessment.course?.courseCode).toUpperCase()
                      : 'UNKNOWN COURSE')}</div>
                    <div>Questions: {assessment.questions?.length || 0}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTogglePublish(assessment)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center transition-colors ${
                        assessment.isActive
                          ? 'bg-green-600 text-white hover:bg-green-700' // Unpublish button (green)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // Publish button (neutral)
                      }`}
                    >
                      {assessment.isActive ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleViewAssessment(assessment)}
                      className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium flex items-center"
                    >
                      <MdVisibility className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditAssessment(assessment)}
                      className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium flex items-center"
                    >
                      <MdEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssessment(assessment._id)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Assessment Builder Modal */}
      {showAssessmentBuilder && assessmentBuilderConfig && (
        <AssessmentBuilder
          course={assessmentBuilderConfig.course}
          trigger={assessmentBuilderConfig.trigger}
          moduleId={assessmentBuilderConfig.moduleId}
          pageOrder={assessmentBuilderConfig.pageOrder}
          existingAssessment={assessmentBuilderConfig.existingAssessment}
          type={assessmentBuilderConfig.type}
          onClose={() => {
            setShowAssessmentBuilder(false);
            setAssessmentBuilderConfig(null);
          }}
          onSave={handleAssessmentSave}
        />
      )}

      {/* Assessment View Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedAssessment.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getAssessmentTypeLabel(selectedAssessment.type)} • {selectedAssessment.questions?.length || 0} questions
                </p>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Course</h3>
                    <p className="text-sm text-gray-900">{(selectedAssessment.courseId?.courseCode || selectedAssessment.course?.courseCode
                      ? (selectedAssessment.courseId?.courseCode || selectedAssessment.course?.courseCode).toUpperCase()
                      : 'UNKNOWN COURSE')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Time Limit</h3>
                    <p className="text-sm text-gray-900">{selectedAssessment.timeLimit} minutes</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Passing Score</h3>
                    <p className="text-sm text-gray-900">{selectedAssessment.passingScore}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Total Marks</h3>
                    <p className="text-sm text-gray-900">{selectedAssessment.totalMarks}</p>
                  </div>
                </div>

                {selectedAssessment.instructions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Instructions</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedAssessment.instructions}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
                  <div className="space-y-4">
                    {selectedAssessment.questions?.map((question, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <span className="font-medium text-gray-900 mr-2">{index + 1}.</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-2">{question.question}</p>
                            {question.questionType === 'multiple_choice' && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className={`text-xs p-2 rounded ${
                                    optIndex === question.correctAnswer
                                      ? 'bg-green-100 text-green-800 font-medium'
                                      : 'bg-white text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                    {optIndex === question.correctAnswer && ' ✓'}
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.questionType === 'true_false' && (
                              <p className="text-xs text-gray-600">
                                Correct Answer: {question.correctAnswer === 0 ? 'True' : 'False'}
                              </p>
                            )}
                            {question.questionType === 'short_answer' && (
                              <p className="text-xs text-gray-500 italic">Short answer question</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">Marks: {question.marks}</p>
                            {question.explanation && (
                              <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-2 rounded">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminAssessmentManagement;
