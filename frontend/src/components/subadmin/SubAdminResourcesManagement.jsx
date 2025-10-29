import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MediaUpload from '../MediaUpload';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFolder,
  MdFolderOpen,
  MdInsertDriveFile,
  MdLink,
  MdAudiotrack,
  MdVideocam,
  MdPictureAsPdf,
  MdDescription,
  MdClose,
  MdUpload,
  MdVisibility
} from 'react-icons/md';

const SubAdminResourcesManagement = () => {
  const { user, assignedUniversities, assignedFaculties, assignedDepartments, assignedLevels } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateFolderForm, setShowCreateFolderForm] = useState(false);
  const [showCreateResourceForm, setShowCreateResourceForm] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const [folderForm, setFolderForm] = useState({
    title: '',
    description: ''
  });

const [resourceForm, setResourceForm] = useState({
  title: '',
  description: '',
  type: 'link',
  url: '',
  folderId: ''
});
const [uploadData, setUploadData] = useState(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/resources/admin/folders');
      setFolders(response.data.folders || []);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      toast.error('Failed to load resource folders');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (folderId) => {
    try {
      setLoadingResources(true);
      const response = await axios.get(`/api/resources/admin/folders/${folderId}/resources`);
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoadingResources(false);
    }
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/resources/admin/folders', folderForm);
      toast.success('Resource folder created successfully!');
      setFolders([...folders, response.data.folder]);
      setShowCreateFolderForm(false);
      setFolderForm({ title: '', description: '' });
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error(error.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleFileUpload = (data) => {
    console.log('[SubAdmin] File upload completed:', {
      url: data.url,
      bytes: data.bytes,
      format: data.format,
      duration: data.duration
    });
    setUploadData(data);
    setResourceForm(prev => ({
      ...prev,
      url: data.url,
      fileSize: data.bytes,
      duration: data.duration,
      format: data.format
    }));
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    console.log('[SubAdmin] Starting resource submission...');
    console.log('[SubAdmin] Resource form:', resourceForm);
    console.log('[SubAdmin] Upload data:', uploadData);
    console.log('[SubAdmin] Selected folder:', selectedFolder._id);
    
    try {
      let resourceData = {
        ...resourceForm,
        folderId: selectedFolder._id
      };

      // For file uploads, use the uploaded data
      if (uploadData && resourceForm.type !== 'link') {
        resourceData = {
          ...resourceData,
          url: uploadData.url,
          fileSize: uploadData.bytes,
          duration: uploadData.duration,
          format: uploadData.format
        };
        console.log('[SubAdmin] Using upload data for resource');
      }

      console.log('[SubAdmin] Final resource data to submit:', resourceData);
      
      const response = await axios.post('/api/resources/admin/resources', resourceData);
      console.log('[SubAdmin] Resource created successfully:', response.data);
      
      toast.success('Resource added successfully!');
      setResources([...resources, response.data.resource]);
      setShowCreateResourceForm(false);
      setResourceForm({
        title: '',
        description: '',
        type: 'link',
        url: '',
        folderId: ''
      });
      setUploadData(null);
    } catch (error) {
      console.error('[SubAdmin] Failed to create resource:', error);
      console.error('[SubAdmin] Error response:', error.response?.data);
      console.error('[SubAdmin] Error status:', error.response?.status);
      toast.error(error.response?.data?.message || 'Failed to add resource');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder? All resources in it will also be deleted.')) {
      return;
    }

    try {
      await axios.delete(`/api/resources/admin/folders/${folderId}`);
      toast.success('Folder deleted successfully');
      setFolders(folders.filter(f => f._id !== folderId));
      if (selectedFolder && selectedFolder._id === folderId) {
        setSelectedFolder(null);
        setResources([]);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error(error.response?.data?.message || 'Failed to delete folder');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await axios.delete(`/api/resources/admin/resources/${resourceId}`);
      toast.success('Resource deleted successfully');
      setResources(resources.filter(r => r._id !== resourceId));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    fetchResources(folder._id);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <MdPictureAsPdf className="w-5 h-5 text-red-500" />;
      case 'document':
        return <MdDescription className="w-5 h-5 text-blue-500" />;
      case 'audio':
        return <MdAudiotrack className="w-5 h-5 text-green-500" />;
      case 'video':
        return <MdVideocam className="w-5 h-5 text-purple-500" />;
      case 'link':
      default:
        return <MdLink className="w-5 h-5 text-blue-500" />;
    }
  };

  const getResourceTypeLabel = (type) => {
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'document':
        return 'Document';
      case 'audio':
        return 'Audio File';
      case 'video':
        return 'Video File';
      case 'link':
      default:
        return 'Web Link';
    }
  };

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         folder.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Resource Management</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Create folders and manage resources for your students
            </p>
          </div>
          <button
            onClick={() => setShowCreateFolderForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm w-full sm:w-auto"
          >
            <MdAdd className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Create Folder</span>
            <span className="xs:hidden">New Folder</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Create Folder Form */}
      {showCreateFolderForm && (
        <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Create New Resource Folder</h2>
            <button
              onClick={() => setShowCreateFolderForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFolderSubmit} className="space-y-4">
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
                  <div><em>No specific assignments - folder will be available to all students</em></div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                The folder will automatically be assigned to this audience scope.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Folder Title</label>
              <input
                type="text"
                value={folderForm.title}
                onChange={(e) => setFolderForm({...folderForm, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Enter folder title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={folderForm.description}
                onChange={(e) => setFolderForm({...folderForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Enter folder description"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Create Folder
              </button>
              <button
                type="button"
                onClick={() => setShowCreateFolderForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Folders List */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-soft border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resource Folders</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading folders...</p>
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="p-8 text-center">
                <MdFolder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No folders found</h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'Try adjusting your search' : 'Create your first folder to get started'}
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder._id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedFolder?._id === folder._id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                    }`}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          {selectedFolder?._id === folder._id ? (
                            <MdFolderOpen className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                          ) : (
                            <MdFolder className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                          )}
                          <h4 className="text-sm font-medium text-gray-900 truncate">{folder.title}</h4>
                        </div>
                        {folder.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{folder.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{folder.resourceCount} resources</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder._id);
                        }}
                        className="text-red-600 hover:text-red-900 ml-2 flex-shrink-0"
                        title="Delete folder"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resources List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-soft border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedFolder ? `Resources in "${selectedFolder.title}"` : 'Select a folder'}
                  </h3>
                  {selectedFolder && (
                    <p className="text-sm text-gray-600 mt-1">{resources.length} resources</p>
                  )}
                </div>
                {selectedFolder && (
                  <button
                    onClick={() => setShowCreateResourceForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm w-full sm:w-auto"
                  >
                    <MdAdd className="w-4 h-4 mr-2" />
                    <span className="hidden xs:inline">Add Resource</span>
                    <span className="xs:hidden">Add</span>
                  </button>
                )}
              </div>
            </div>

            {!selectedFolder ? (
              <div className="p-8 text-center">
                <MdFolder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No folder selected</h3>
                <p className="text-gray-500 text-sm">Select a folder to view and manage its resources</p>
              </div>
            ) : loadingResources ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="p-8 text-center">
                <MdInsertDriveFile className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No resources yet</h3>
                <p className="text-gray-500 text-sm">Add your first resource to this folder</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {resources.map((resource) => (
                  <div key={resource._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center">
                              <MdInsertDriveFile className="w-3 h-3 mr-1" />
                              {getResourceTypeLabel(resource.type)}
                            </span>
                            {resource.createdAt && (
                              <span>
                                {new Date(resource.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="Open resource"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteResource(resource._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete resource"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Resource Form Modal */}
      {showCreateResourceForm && selectedFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Add Resource to "{selectedFolder.title}"</h2>
              <button
                onClick={() => setShowCreateResourceForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleResourceSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Title</label>
                <input
                  type="text"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Enter resource title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({...resourceForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="link">Web Link</option>
                  <option value="pdf">PDF Document</option>
                  <option value="document">Document</option>
                  <option value="audio">Audio File</option>
                  <option value="video">Video File</option>
                </select>
              </div>

              {resourceForm.type === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="url"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                  <MediaUpload
                    type={resourceForm.type === 'pdf' ? 'pdf' : resourceForm.type === 'document' ? 'document' : resourceForm.type}
                    onUploadComplete={handleFileUpload}
                    className="text-sm"
                  />
                  {uploadData && (
                    <p className="text-xs text-green-600 mt-2">
                      File uploaded successfully: {uploadData.format?.toUpperCase()} ({(uploadData.bytes / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="Enter resource description"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  Add Resource
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateResourceForm(false);
                    setResourceForm({
                      title: '',
                      description: '',
                      type: 'link',
                      url: '',
                      folderId: ''
                    });
                    setUploadData(null);
                  }}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminResourcesManagement;
