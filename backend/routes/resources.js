import express from 'express';
import Resource from '../models/Resource.js';
import ResourceFolder from '../models/ResourceFolder.js';
import User from '../models/User.js';
import { authenticateToken, requirePermission, authorize } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const folderSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(100),
  description: Joi.string().trim().max(500).allow(''),
  audience: Joi.object({
    universities: Joi.array().items(Joi.string().trim()).default([]),
    faculties: Joi.array().items(Joi.string().trim()).default([]),
    departments: Joi.array().items(Joi.string().trim()).default([]),
    levels: Joi.array().items(Joi.string().trim()).default([])
  }).default({})
});

const resourceSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().trim().max(500).allow(''),
  type: Joi.string().valid('pdf', 'document', 'link', 'audio', 'video').required(),
  url: Joi.string().required().trim().uri(),
  fileSize: Joi.number().min(0).optional(),
  duration: Joi.number().min(0).optional(),
  format: Joi.string().trim().optional(),
  folderId: Joi.string().required()
});

// Helper function to build audience filter for subadmin
const buildAudienceFilter = (user) => {
  if (!user || user.role !== 'subadmin') return {};

  const { assignedUniversities, assignedFaculties, assignedDepartments, assignedLevels } = user;
  const filter = {};

  if (assignedUniversities?.length > 0) {
    filter['audience.universities'] = { $in: assignedUniversities };
  }
  if (assignedFaculties?.length > 0) {
    filter['audience.faculties'] = { $in: assignedFaculties };
  }
  if (assignedDepartments?.length > 0) {
    filter['audience.departments'] = { $in: assignedDepartments };
  }
  if (assignedLevels?.length > 0) {
    filter['audience.levels'] = { $in: assignedLevels };
  }

  return filter;
};

// Get all resource folders (subadmin view)
router.get('/admin/folders', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let folders;
    if (user.role === 'admin') {
      // Admins see all folders
      folders = await ResourceFolder.find({ isActive: true })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    } else {
      // Subadmins see folders within their scope or global folders
      folders = await ResourceFolder.getScopedFolders(user)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    }

    // Get resource count for each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const resourceCount = await Resource.countDocuments({
          folderId: folder._id,
          isActive: true
        });
        return {
          ...folder.toObject(),
          resourceCount
        };
      })
    );

    res.json({ folders: foldersWithCount });
  } catch (error) {
    console.error('Error fetching resource folders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create resource folder
router.post('/admin/folders', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    const { error, value } = folderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto-populate audience based on subadmin's assigned scope
    const folderData = {
      ...value,
      createdBy: req.user.userId
    };

    if (user.role === 'subadmin') {
      folderData.audience = {
        universities: user.assignedUniversities || [],
        faculties: user.assignedFaculties || [],
        departments: user.assignedDepartments || [],
        levels: user.assignedLevels || []
      };
    }

    const folder = new ResourceFolder(folderData);
    await folder.save();

    const populatedFolder = await ResourceFolder.findById(folder._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      message: 'Resource folder created successfully',
      folder: populatedFolder
    });
  } catch (error) {
    console.error('Error creating resource folder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update resource folder
router.put('/admin/folders/:folderId', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    const { error, value } = folderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const folder = await ResourceFolder.findById(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Resource folder not found' });
    }

    // Check ownership/scope for subadmins
    if (req.user.role === 'subadmin' && folder.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(folder, value);
    await folder.save();

    const updatedFolder = await ResourceFolder.findById(folder._id)
      .populate('createdBy', 'name');

    res.json({
      message: 'Resource folder updated successfully',
      folder: updatedFolder
    });
  } catch (error) {
    console.error('Error updating resource folder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete resource folder
router.delete('/admin/folders/:folderId', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    const folder = await ResourceFolder.findById(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Resource folder not found' });
    }

    // Check ownership/scope for subadmins
    if (req.user.role === 'subadmin' && folder.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if folder has active resources
    const resourceCount = await Resource.countDocuments({ 
      folderId: req.params.folderId,
      isActive: true 
    });
    if (resourceCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete folder with existing resources. Please delete all resources first.'
      });
    }

    await ResourceFolder.findByIdAndDelete(req.params.folderId);

    res.json({ message: 'Resource folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource folder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get resources in a folder (admin view)
router.get('/admin/folders/:folderId/resources', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    const folder = await ResourceFolder.findById(req.params.folderId);
    if (!folder) {
      return res.status(404).json({ message: 'Resource folder not found' });
    }

    // Check access for subadmins
    if (req.user.role === 'subadmin') {
      const user = await User.findById(req.user.userId);
      if (!folder.isAccessibleBy(user)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const resources = await Resource.find({
      folderId: req.params.folderId,
      isActive: true
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create resource
router.post('/admin/resources', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    console.log('[Backend] Received resource creation request');
    console.log('[Backend] Request body:', req.body);
    console.log('[Backend] User:', { userId: req.user.userId, role: req.user.role });
    
    const { error, value } = resourceSchema.validate(req.body);
    if (error) {
      console.error('[Backend] Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    console.log('[Backend] Validation passed, validated data:', value);

    // Verify folder exists and user has access
    const folder = await ResourceFolder.findById(value.folderId);
    if (!folder) {
      console.error('[Backend] Folder not found:', value.folderId);
      return res.status(404).json({ message: 'Resource folder not found' });
    }

    console.log('[Backend] Folder found:', { folderId: folder._id, title: folder.title });

    if (req.user.role === 'subadmin') {
      const user = await User.findById(req.user.userId);
      if (!folder.isAccessibleBy(user)) {
        console.error('[Backend] Subadmin access denied to folder');
        return res.status(403).json({ message: 'Access denied' });
      }
      console.log('[Backend] Subadmin access verified');
    }

    const resourceData = {
      ...value,
      createdBy: req.user.userId,
      audience: folder.audience // Inherit audience from folder
    };

    console.log('[Backend] Creating resource with data:', resourceData);

    const resource = new Resource(resourceData);
    await resource.save();

    console.log('[Backend] Resource saved to database:', { id: resource._id });

    const populatedResource = await Resource.findById(resource._id)
      .populate('createdBy', 'name')
      .populate('folderId', 'title');

    console.log('[Backend] Resource created successfully:', {
      id: populatedResource._id,
      title: populatedResource.title,
      type: populatedResource.type,
      url: populatedResource.url
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource: populatedResource
    });
  } catch (error) {
    console.error('[Backend] Error creating resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update resource
router.put('/admin/resources/:resourceId', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    const { error, value } = resourceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership for subadmins
    if (req.user.role === 'subadmin' && resource.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(resource, value);
    await resource.save();

    const updatedResource = await Resource.findById(resource._id)
      .populate('createdBy', 'name')
      .populate('folderId', 'title');

    res.json({
      message: 'Resource updated successfully',
      resource: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete resource
router.delete('/admin/resources/:resourceId', authenticateToken, authorize('admin', 'subadmin', 'waec_admin', 'jamb_admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership for subadmins
    if (req.user.role === 'subadmin' && resource.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Resource.findByIdAndDelete(req.params.resourceId);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get accessible resource folders for users
router.get('/folders', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const folders = await ResourceFolder.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Filter folders based on user's accessibility
    const accessibleFolders = folders.filter(folder => folder.isAccessibleBy(user));

    // Get resource count for each accessible folder
    const foldersWithCount = await Promise.all(
      accessibleFolders.map(async (folder) => {
        const resourceCount = await Resource.countDocuments({
          folderId: folder._id,
          isActive: true
        });
        return {
          ...folder.toObject(),
          resourceCount
        };
      })
    );

    res.json({ folders: foldersWithCount });
  } catch (error) {
    console.error('Error fetching accessible folders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get resources in a folder for users
router.get('/folders/:folderId/resources', authenticateToken, async (req, res) => {
  try {
    const folder = await ResourceFolder.findById(req.params.folderId);
    if (!folder || !folder.isActive) {
      return res.status(404).json({ message: 'Resource folder not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can access this folder
    if (!folder.isAccessibleBy(user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resources = await Resource.find({
      folderId: req.params.folderId,
      isActive: true
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ resources, folder });
  } catch (error) {
    console.error('Error fetching folder resources:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Proxy route to serve resources with authentication
router.get('/proxy/:resourceId', authenticateToken, async (req, res) => {
  try {
    console.log('[Backend] Proxy request for resource:', req.params.resourceId);
    console.log('[Backend] User:', { userId: req.user.userId, role: req.user.role });
    
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource || !resource.isActive) {
      console.error('[Backend] Resource not found or inactive');
      return res.status(404).json({ message: 'Resource not found' });
    }

    console.log('[Backend] Resource found:', {
      id: resource._id,
      title: resource.title,
      type: resource.type,
      url: resource.url
    });

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.error('[Backend] User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can access this resource
    if (!resource.isAccessibleBy(user)) {
      console.error('[Backend] User does not have access to resource');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('[Backend] Access verified');

    // For all resources, return the secure URL directly
    // Authentication is handled at the API level, not Cloudinary level
    console.log('[Backend] Returning resource URL:', resource.url);
    res.json({ url: resource.url });
  } catch (error) {
    console.error('[Backend] Error proxying resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
