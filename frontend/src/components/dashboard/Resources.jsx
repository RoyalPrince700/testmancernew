import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  MdFolder,
  MdFolderOpen,
  MdInsertDriveFile,
  MdLink,
  MdPictureAsPdf,
  MdAudiotrack,
  MdVideocam,
  MdDescription,
  MdSearch,
  MdOpenInNew,
  MdDownload
} from 'react-icons/md';

const Resources = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/resources/folders');
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
      const response = await axios.get(`/api/resources/folders/${folderId}/resources`);
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoadingResources(false);
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

  const handleDownload = async (resource) => {
    console.log('[User] Download resource clicked:', {
      id: resource._id,
      title: resource.title,
      type: resource.type,
      format: resource.format,
      originalUrl: resource.url
    });
    
    try {
      // For external links, just open them
      if (resource.type === 'link') {
        console.log('[User] Opening external link for download');
        window.open(resource.url, '_blank', 'noopener,noreferrer');
        return;
      }

      // Get signed URL first
      console.log('[User] Requesting signed URL for download...');
      const proxyResponse = await axios.get(`/api/resources/proxy/${resource._id}`);
      const signedUrl = proxyResponse.data.url;
      console.log('[User] Received signed URL for download:', signedUrl);

      // For other resources, trigger download
      console.log('[User] Fetching resource blob...');
      const response = await fetch(signedUrl);
      console.log('[User] Fetch response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('[User] Blob created:', { size: blob.size, type: blob.type });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from URL or use title with format
      const urlParts = signedUrl.split('/');
      let filename = urlParts[urlParts.length - 1].split('?')[0];
      
      // If filename doesn't have extension, add it from resource format
      if (!filename.includes('.') && resource.format) {
        filename = `${resource.title}.${resource.format}`;
      } else if (!filename.includes('.')) {
        // Fallback: determine extension from type
        const extensions = {
          pdf: 'pdf',
          document: 'docx',
          video: 'mp4',
          audio: 'mp3'
        };
        filename = `${resource.title}.${extensions[resource.type] || 'file'}`;
      }
      
      console.log('[User] Download filename:', filename);
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('[User] Download triggered successfully');
      toast.success('Download started!');
    } catch (error) {
      console.error('[User] Download error:', error);
      console.error('[User] Error response:', error.response?.data);
      console.error('[User] Error status:', error.response?.status);
      toast.error('Failed to download resource');
    }
  };

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         folder.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">Learning Resources</h1>
            <p className="text-gray-600 mt-1 text-xs md:text-sm">
              Access study materials, documents, and multimedia resources shared by your instructors
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-3 md:p-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Folders List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-soft border border-gray-100">
            <div className="p-3 md:p-4 border-b border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Resource Folders</h3>
            </div>

            {loading ? (
              <div className="p-6 md:p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading folders...</p>
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="p-6 md:p-8 text-center">
                <MdFolder className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">No folders available</h3>
                <p className="text-gray-500 text-xs md:text-sm">
                  {searchTerm ? 'Try adjusting your search' : 'Resource folders will appear here when shared by your instructors'}
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] md:max-h-96 overflow-y-auto">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder._id}
                    className={`p-3 md:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                      selectedFolder?._id === folder._id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                    }`}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          {selectedFolder?._id === folder._id ? (
                            <MdFolderOpen className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0" />
                          ) : (
                            <MdFolder className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                          )}
                          <h4 className="text-sm font-medium text-gray-900 truncate">{folder.title}</h4>
                        </div>
                        {folder.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{folder.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">{folder.resourceCount} resource{folder.resourceCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resources List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-soft border border-gray-100">
            <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {selectedFolder ? `"${selectedFolder.title}"` : 'Select a folder'}
                </h3>
                {selectedFolder && (
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{resources.length} resource{resources.length !== 1 ? 's' : ''} available</p>
                )}
              </div>
            </div>

            {!selectedFolder ? (
              <div className="p-6 md:p-8 text-center">
                <MdFolder className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">No folder selected</h3>
                <p className="text-gray-500 text-xs md:text-sm">Select a folder above to view its resources</p>
              </div>
            ) : loadingResources ? (
              <div className="p-6 md:p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="p-6 md:p-8 text-center">
                <MdInsertDriveFile className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">No resources yet</h3>
                <p className="text-gray-500 text-xs md:text-sm">This folder doesn't have any resources yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[400px] md:max-h-96 overflow-y-auto">
                {resources.map((resource) => (
                  <div key={resource._id} className="p-3 md:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs text-gray-400">
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
                      <div className="flex items-center sm:ml-4">
                        <button
                          onClick={() => handleDownload(resource)}
                          className="w-full sm:w-auto flex items-center justify-center space-x-1 text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                          title={resource.type === 'link' ? 'Open link' : 'Download resource'}
                        >
                          {resource.type === 'link' ? (
                            <>
                              <MdOpenInNew className="w-4 h-4" />
                              <span>Open</span>
                            </>
                          ) : (
                            <>
                              <MdDownload className="w-4 h-4" />
                              <span>Download</span>
                            </>
                          )}
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
    </div>
  );
};

export default Resources;
