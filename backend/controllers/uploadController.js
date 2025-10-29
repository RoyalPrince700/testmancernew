import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Configure multer for memory storage (required for Cloudinary)
const storage = multer.memoryStorage();

// File filter for audio files
const audioFilter = (req, file, cb) => {
  const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/x-wav'];
  const allowedExtensions = ['.mp3', '.m4a', '.wav'];

  if (allowedMimes.includes(file.mimetype) ||
      allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid audio file type. Only MP3, M4A, and WAV files are allowed.'), false);
  }
};

// File filter for video files
const videoFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/x-msvideo', 'video/avi'];
  const allowedExtensions = ['.mp4', '.avi'];

  if (allowedMimes.includes(file.mimetype) ||
      allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video file type. Only MP4 and AVI files are allowed.'), false);
  }
};

// File filter for PDF files
const pdfFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];

  if (allowedMimes.includes(file.mimetype) ||
      allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// File filter for document files
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

  if (allowedMimes.includes(file.mimetype) ||
      allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document type. Only Word, Excel, PowerPoint, and text files are allowed.'), false);
  }
};

// Multer upload configurations
const uploadAudio = multer({
  storage: storage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio
  }
}).single('audio');

const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video
  }
}).single('video');

const uploadPdf = multer({
  storage: storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for PDF
  }
}).single('pdf');

const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for documents
  }
}).single('document');

// Upload audio file to Cloudinary
export const uploadAudioFile = async (req, res) => {
  try {
    // Handle multer upload
    uploadAudio(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'Audio file too large. Maximum size is 50MB.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file provided'
        });
      }

      try {
        console.log('[Backend] Starting audio upload to Cloudinary...');
        console.log('[Backend] File info:', {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'video', // Cloudinary treats audio as video
              folder: 'testmancer/audio',
              format: 'mp3', // Force MP3 format for consistency
              type: 'upload',
              access_mode: 'public',
              public_id: `audio_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        console.log('[Backend] Audio upload successful:', {
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type
        });

        res.status(200).json({
          success: true,
          message: 'Audio uploaded successfully',
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            duration: result.duration || null,
            format: result.format
          }
        });
      } catch (uploadError) {
        console.error('[Backend] Cloudinary upload error:', uploadError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload audio file to cloud storage'
        });
      }
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during audio upload'
    });
  }
};

// Upload video file to Cloudinary
export const uploadVideoFile = async (req, res) => {
  try {
    // Handle multer upload
    uploadVideo(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'Video file too large. Maximum size is 100MB.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No video file provided'
        });
      }

      try {
        console.log('[Backend] Starting video upload to Cloudinary...');
        console.log('[Backend] File info:', {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'video',
              folder: 'testmancer/video',
              format: 'mp4', // Force MP4 format for consistency
              type: 'upload',
              access_mode: 'public',
              public_id: `video_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        console.log('[Backend] Video upload successful:', {
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type
        });

        res.status(200).json({
          success: true,
          message: 'Video uploaded successfully',
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            duration: result.duration || null,
            format: result.format
          }
        });
      } catch (uploadError) {
        console.error('[Backend] Cloudinary upload error:', uploadError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload video file to cloud storage'
        });
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during video upload'
    });
  }
};

// Upload PDF file to Cloudinary
export const uploadPdfFile = async (req, res) => {
  try {
    // Handle multer upload
    uploadPdf(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'PDF file too large. Maximum size is 25MB.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No PDF file provided'
        });
      }

      try {
        console.log('[Backend] Starting PDF upload to Cloudinary...');
        console.log('[Backend] File info:', {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw', // PDFs are raw files
              folder: 'testmancer/resources/pdf',
              type: 'authenticated', // Use authenticated type for better control
              access_control: [{ access_type: 'anonymous' }], // Allow anonymous access
              public_id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        console.log('[Backend] PDF upload successful:', {
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type,
          accessMode: result.access_mode
        });

        res.status(200).json({
          success: true,
          message: 'PDF uploaded successfully',
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format
          }
        });
      } catch (uploadError) {
        console.error('[Backend] Cloudinary upload error:', uploadError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload PDF file to cloud storage'
        });
      }
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during PDF upload'
    });
  }
};

// Upload document file to Cloudinary
export const uploadDocumentFile = async (req, res) => {
  try {
    // Handle multer upload
    uploadDocument(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'Document file too large. Maximum size is 25MB.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document file provided'
        });
      }

      try {
        console.log('[Backend] Starting document upload to Cloudinary...');
        console.log('[Backend] File info:', {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw', // Documents are raw files
              folder: 'testmancer/resources/documents',
              type: 'authenticated', // Use authenticated type for better control
              access_control: [{ access_type: 'anonymous' }], // Allow anonymous access
              public_id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        console.log('[Backend] Document upload successful:', {
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type,
          accessMode: result.access_mode
        });

        res.status(200).json({
          success: true,
          message: 'Document uploaded successfully',
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format
          }
        });
      } catch (uploadError) {
        console.error('[Backend] Cloudinary upload error:', uploadError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload document file to cloud storage'
        });
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during document upload'
    });
  }
};
