import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-hot-toast';
import { MdMenuBook, MdWarning } from 'react-icons/md';

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    tags: [],
    category: '',
    audience: { universities: [], faculties: [], levels: [] },
    structure: {
      unitType: 'module',
      unitLabel: 'Module',
      unitCount: 1
    }
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const result = await adminApi.courses.getCourses();
    if (result.success) {
      setCourses(result.data.courses);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    const result = await adminApi.courses.createCourse(courseForm);
    if (result.success) {
      toast.success('Course created successfully!');
      setCourses([...courses, result.data.course]);
      setShowCourseForm(false);
      setCourseForm({
        title: '',
        description: '',
        tags: [],
        category: '',
        audience: { universities: [], faculties: [], levels: [] },
        structure: {
          unitType: 'module',
          unitLabel: 'Module',
          unitCount: 1
        }
      });
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const result = await adminApi.courses.deleteCourse(courseId);
    if (result.success) {
      toast.success('Course deleted successfully!');
      setCourses(courses.filter(c => c._id !== courseId));
    } else {
      toast.error(result.error);
    }
  };

  const handleTagToggle = (tag) => {
    setCourseForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 text-sm">Create and manage courses, modules, and pages</p>
        </div>
        <button
          onClick={() => setShowCourseForm(!showCourseForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <MdMenuBook className="w-5 h-5 mr-2" />
          {showCourseForm ? 'Cancel' : 'Create Course'}
        </button>
      </div>

      {showCourseForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <h2 className="text-base font-semibold mb-3">Create New Course</h2>
          <form onSubmit={handleCourseSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Category</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="secondary">Secondary</option>
                  <option value="tertiary">Tertiary</option>
                  <option value="language">Language</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Tags/Categories</label>
              <div className="flex flex-wrap gap-2">
                {['waec', 'jamb', 'postutme', 'toefl', 'ielts', 'undergraduate'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      courseForm.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Universities</label>
                <input
                  type="text"
                  value={courseForm.audience.universities.join(', ')}
                  onChange={(e) => setCourseForm({
                    ...courseForm,
                    audience: {
                      ...courseForm.audience,
                      universities: e.target.value.split(',').map(u => u.trim()).filter(u => u)
                    }
                  })}
                  placeholder="e.g., University of Lagos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Faculties</label>
                <input
                  type="text"
                  value={courseForm.audience.faculties.join(', ')}
                  onChange={(e) => setCourseForm({
                    ...courseForm,
                    audience: {
                      ...courseForm.audience,
                      faculties: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                    }
                  })}
                  placeholder="e.g., Engineering"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Levels</label>
                <input
                  type="text"
                  value={courseForm.audience.levels.join(', ')}
                  onChange={(e) => setCourseForm({
                    ...courseForm,
                    audience: {
                      ...courseForm.audience,
                      levels: e.target.value.split(',').map(l => l.trim()).filter(l => l)
                    }
                  })}
                  placeholder="e.g., 100, 200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Course Structure Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Unit Type</label>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="chapter">Chapter</option>
                    <option value="module">Module</option>
                    <option value="section">Section</option>
                    <option value="topic">Topic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Unit Label</label>
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
                    placeholder="e.g., Chapter, Module, Section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Unit Count</label>
                  <input
                    type="number"
                    value={courseForm.structure.unitCount}
                    onChange={(e) => setCourseForm({
                      ...courseForm,
                      structure: {
                        ...courseForm.structure,
                        unitCount: parseInt(e.target.value) || 1
                      }
                    })}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Choose how your course content will be organized. Units can be Chapters, Modules, Sections, or Topics.
              </p>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
                Create Course
              </button>
              <button type="button" onClick={() => setShowCourseForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold">Courses ({courses.length})</h2>
        </div>

        {courses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No courses found. Create your first course above.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {courses.map(course => (
              <div key={course._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                    <p className="text-gray-600 mt-1">{course.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(course.tags || []).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Category: {course.category} | {course.structure?.unitLabel || 'Modules'}: {course.modules?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created by: {course.createdBy?.name || course.createdBy?.username || 'Unknown'} ({course.createdBy?.role || 'admin'})
                    </p>
                    {course.audience && (
                      <div className="text-sm text-gray-500 mt-1">
                        {course.audience.universities?.length > 0 && (
                          <span>Universities: {course.audience.universities.join(', ')}</span>
                        )}
                        {course.audience.faculties?.length > 0 && (
                          <span> | Faculties: {course.audience.faculties.join(', ')}</span>
                        )}
                        {course.audience.levels?.length > 0 && (
                          <span> | Levels: {course.audience.levels.join(', ')}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedCourse(selectedCourse === course._id ? null : course._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      {selectedCourse === course._id ? 'Hide' : 'Manage'}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {selectedCourse === course._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <CourseManager course={course} onUpdate={loadCourses} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Component for managing modules and pages within a course
const CourseManager = ({ course, onUpdate }) => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showPageForm, setShowPageForm] = useState(false);
  const [moduleForm, setModuleForm] = useState({
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

  useEffect(() => {
    loadModules();
  }, [course._id]);

  const loadModules = async () => {
    const result = await adminApi.units.getUnits(course._id);
    if (result.success) {
      setModules(result.data.units);
    } else {
      toast.error(result.error);
    }
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    const result = await adminApi.units.createUnit(course._id, moduleForm);
    if (result.success) {
      toast.success(`${course.structure?.unitLabel || 'Module'} created successfully!`);
      setModules([...modules, result.data.unit]);
      setShowModuleForm(false);
      setModuleForm({ title: '', description: '', order: modules.length + 1, estimatedTime: 30 });
    } else {
      toast.error(result.error);
    }
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    const result = await adminApi.pages.createPage(course._id, selectedModule, pageForm);
    if (result.success) {
      toast.success('Page created successfully!');
      // Reload modules to get updated data
      await loadModules();
      setShowPageForm(false);
      setPageForm({ title: '', order: 1, html: '', audioUrl: '', videoUrl: '', attachments: [] });
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm(`Are you sure you want to delete this ${course.structure?.unitLabel?.toLowerCase() || 'module'}?`)) return;

    const result = await adminApi.units.deleteUnit(course._id, moduleId);
    if (result.success) {
      toast.success(`${course.structure?.unitLabel || 'Module'} deleted successfully!`);
      setModules(modules.filter(m => m._id !== moduleId));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Course Structure Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <div className="flex items-start">
          <MdMenuBook className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">Structured Course System</p>
            <p className="text-blue-700 mt-1">
              This course uses <strong>{course.structure?.unitLabel || 'Module'}</strong> organization ({course.structure?.unitType || 'module'} type).
              You can create units and pages with rich content, media, and context-aware quizzes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowModuleForm(!showModuleForm)}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
        >
          {showModuleForm ? 'Cancel' : `Add ${course.structure?.unitLabel || 'Module'}`}
        </button>
      </div>

      {/* Module Form */}
      {showModuleForm && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Create {course.structure?.unitLabel || 'Module'}</h4>
          <form onSubmit={handleModuleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder={`${course.structure?.unitLabel || 'Module'} Title`}
              value={moduleForm.title}
              onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              required
            />
            <textarea
              placeholder={`${course.structure?.unitLabel || 'Module'} Description`}
              value={moduleForm.description}
              onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Order"
                value={moduleForm.order}
                onChange={(e) => setModuleForm({...moduleForm, order: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded text-sm w-20"
                min="1"
                required
              />
              <input
                type="number"
                placeholder="Estimated Time (min)"
                value={moduleForm.estimatedTime}
                onChange={(e) => setModuleForm({...moduleForm, estimatedTime: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                min="1"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Create {course.structure?.unitLabel || 'Module'}</button>
              <button type="button" onClick={() => setShowModuleForm(false)} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-2">
        {modules.map(module => (
          <div key={module._id} className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">{module.title}</h5>
                <p className="text-sm text-gray-600">{module.description}</p>
                <p className="text-xs text-gray-500">Order: {module.order} | Time: {module.estimatedTime}min | Pages: {module.pages?.length || 0}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedModule(selectedModule === module._id ? null : module._id);
                    setShowPageForm(false);
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                >
                  {selectedModule === module._id ? 'Hide' : `${course.structure?.unitLabel || 'Module'} Pages`}
                </button>
                <button
                  onClick={() => handleDeleteModule(module._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Pages Management */}
            {selectedModule === module._id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setShowPageForm(!showPageForm)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  >
                    {showPageForm ? 'Cancel' : `Add ${course.structure?.unitLabel || 'Module'} Page`}
                  </button>
                </div>

                {/* Page Form */}
                {showPageForm && (
                  <div className="bg-white p-3 rounded border mb-3">
                    <h6 className="font-medium mb-2 text-sm">Create {course.structure?.unitLabel || 'Module'} Page</h6>
                    <form onSubmit={handlePageSubmit} className="space-y-2">
                      <input
                        type="text"
                        placeholder="Page Title"
                        value={pageForm.title}
                        onChange={(e) => setPageForm({...pageForm, title: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                      <textarea
                        placeholder="Page HTML Content"
                        value={pageForm.html}
                        onChange={(e) => setPageForm({...pageForm, html: e.target.value})}
                        rows={3}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Order"
                          value={pageForm.order}
                          onChange={(e) => setPageForm({...pageForm, order: parseInt(e.target.value)})}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-20"
                          min="1"
                          required
                        />
                        <input
                          type="url"
                          placeholder="Audio URL (optional)"
                          value={pageForm.audioUrl}
                          onChange={(e) => setPageForm({...pageForm, audioUrl: e.target.value})}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <input
                        type="url"
                        placeholder="Video URL (optional)"
                        value={pageForm.videoUrl}
                        onChange={(e) => setPageForm({...pageForm, videoUrl: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Create {course.structure?.unitLabel || 'Module'} Page</button>
                        <button type="button" onClick={() => setShowPageForm(false)} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Pages List */}
                <div className="space-y-1">
                  {module.pages?.map(page => (
                    <div key={page._id} className="bg-white p-2 rounded border text-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{page.title}</span>
                          <span className="text-gray-500 ml-2">(Order: {page.order})</span>
                        </div>
                        <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                      </div>
                    </div>
                  )) || <p className="text-gray-500 text-sm">No {course.structure?.unitLabel?.toLowerCase() || 'module'} pages yet</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesManagement;
