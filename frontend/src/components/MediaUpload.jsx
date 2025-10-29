import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaFileAudio, FaFileVideo, FaTimes, FaCheck } from 'react-icons/fa';

const MediaUpload = ({ onUploadComplete, type = 'both', className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Determine accepted file types based on type prop
  const getAcceptedTypes = () => {
    switch (type) {
      case 'audio':
        return 'audio/*,.mp3,.m4a,.wav';
      case 'video':
        return 'video/*,.mp4,.avi';
      case 'pdf':
        return '.pdf,application/pdf';
      case 'document':
        return '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain';
      default:
        return 'audio/*,video/*,.mp3,.m4a,.wav,.mp4,.avi';
    }
  };

  // Get file size limits
  const getMaxSize = (fileType) => {
    if (fileType.startsWith('audio/') || fileType.includes('audio')) return 50;
    if (fileType.startsWith('video/') || fileType.includes('video')) return 100;
    if (fileType === 'pdf' || fileType.includes('pdf')) return 25;
    if (fileType === 'document' || fileType.includes('document')) return 25;
    return 25; // Default for documents
  };

  // Validate file before upload
  const validateFile = (file) => {
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/x-wav'];
    const allowedVideoTypes = ['video/mp4', 'video/x-msvideo', 'video/avi'];
    const allowedPdfTypes = ['application/pdf'];
    const allowedDocumentTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    const allowedAudioExtensions = ['.mp3', '.m4a', '.wav'];
    const allowedVideoExtensions = ['.mp4', '.avi'];
    const allowedPdfExtensions = ['.pdf'];
    const allowedDocumentExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

    const isAudio = type === 'audio' || type === 'both';
    const isVideo = type === 'video' || type === 'both';
    const isPdf = type === 'pdf';
    const isDocument = type === 'document';

    let isValidType = false;

    if (isAudio && (allowedAudioTypes.includes(file.type) ||
        allowedAudioExtensions.some(ext => file.name.toLowerCase().endsWith(ext)))) {
      isValidType = true;
    }

    if (isVideo && (allowedVideoTypes.includes(file.type) ||
        allowedVideoExtensions.some(ext => file.name.toLowerCase().endsWith(ext)))) {
      isValidType = true;
    }

    if (isPdf && (allowedPdfTypes.includes(file.type) ||
        allowedPdfExtensions.some(ext => file.name.toLowerCase().endsWith(ext)))) {
      isValidType = true;
    }

    if (isDocument && (allowedDocumentTypes.includes(file.type) ||
        allowedDocumentExtensions.some(ext => file.name.toLowerCase().endsWith(ext)))) {
      isValidType = true;
    }

    if (!isValidType) {
      const allowedTypes = [];
      if (isAudio) allowedTypes.push('MP3, M4A, WAV');
      if (isVideo) allowedTypes.push('MP4, AVI');
      if (isPdf) allowedTypes.push('PDF');
      if (isDocument) allowedTypes.push('DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT');
      toast.error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      return false;
    }

    const maxSize = getMaxSize(file.type) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${getMaxSize(file.type)}MB.`);
      return false;
    }

    return true;
  };

  // Handle file upload
  const uploadFile = useCallback(async (file) => {
    if (!validateFile(file)) return;

    const formData = new FormData();

    // Determine upload type and endpoint
    let uploadType = 'video'; // Default
    let endpoint = 'video';

    const isAudio = file.type.startsWith('audio/') || ['.mp3', '.m4a', '.wav'].some(ext => file.name.toLowerCase().endsWith(ext));
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocument = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'].some(ext => file.name.toLowerCase().endsWith(ext)) ||
                      ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                       'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                       'text/plain'].includes(file.type);

    if (isAudio) {
      uploadType = 'audio';
      endpoint = 'audio';
      formData.append('audio', file);
    } else if (isPdf) {
      endpoint = 'pdf';
      formData.append('pdf', file);
    } else if (isDocument) {
      endpoint = 'document';
      formData.append('document', file);
    } else {
      // Video
      formData.append('video', file);
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('[MediaUpload] Starting file upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        endpoint: endpoint
      });
      
      const response = await axios.post(
        `/api/admin/uploads/${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        }
      );

      console.log('[MediaUpload] Upload response:', response.data);

      if (response.data.success) {
        const fileTypeLabel = isAudio ? 'Audio' : isPdf ? 'PDF' : isDocument ? 'Document' : 'Video';

        console.log('[MediaUpload] Upload successful:', {
          url: response.data.data.url,
          bytes: response.data.data.bytes,
          format: response.data.data.format,
          publicId: response.data.data.publicId
        });

        setUploadedFile({
          url: response.data.data.url,
          type: isAudio ? 'audio' : isPdf ? 'pdf' : isDocument ? 'document' : 'video',
          name: file.name,
          size: file.size,
          duration: response.data.data.duration,
        });

        toast.success(`${fileTypeLabel} uploaded successfully!`);

        // Call the callback if provided
        if (onUploadComplete) {
          console.log('[MediaUpload] Calling onUploadComplete callback');
          onUploadComplete(response.data.data);
        }
      } else {
        console.error('[MediaUpload] Upload failed:', response.data.message);
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('[MediaUpload] Upload error:', error);
      console.error('[MediaUpload] Error response:', error.response?.data);
      console.error('[MediaUpload] Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  // Handle file input change
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  // Clear uploaded file
  const clearUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    return fileType === 'audio' ? <FaFileAudio className="text-2xl" /> : <FaFileVideo className="text-2xl" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <FaCloudUploadAlt className="text-4xl text-blue-500 animate-bounce" />
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <FaCloudUploadAlt className="text-4xl text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop {type === 'both' ? 'audio or video' : type} files here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {type === 'audio' && 'Supported: MP3, M4A, WAV (max 50MB)'}
                {type === 'video' && 'Supported: MP4, AVI (max 100MB)'}
                {type === 'both' && 'Audio: MP3, M4A, WAV (max 50MB) • Video: MP4, AVI (max 100MB)'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile.type)}
              <div>
                <p className="font-medium text-green-800">{uploadedFile.name}</p>
                <p className="text-sm text-green-600">
                  {formatFileSize(uploadedFile.size)}
                  {uploadedFile.duration && ` • ${Math.round(uploadedFile.duration)}s`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheck className="text-green-500" />
              <button
                onClick={clearUploadedFile}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear uploaded file"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL Display (if uploaded) */}
      {uploadedFile && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Media URL:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={uploadedFile.url}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(uploadedFile.url);
                toast.success('URL copied to clipboard!');
              }}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
