const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');
const auth = require('../middleware/auth');
const mentorAuth = require('../middleware/mentorAuth');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resources/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, document, and media files are allowed!'));
    }
  }
});

// Get all subjects with study materials (for students)
router.get('/subjects', auth, async (req, res) => {
  try {
    const subjects = await StudyMaterial.distinct('subject', { isPublic: true });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all study materials for admin
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const materials = await StudyMaterial.find({})
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching all study materials:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all folders for a subject (for students)
router.get('/subjects/:subject/folders', auth, async (req, res) => {
  try {
    const folders = await StudyMaterial.find({
      subject: req.params.subject,
      type: 'folder',
      isPublic: true
    }).populate('uploadedBy', 'name email');
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all materials in a folder (for students)
router.get('/folders/:folderId/materials', auth, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({
      folder: req.params.folderId,
      isPublic: true
    }).populate('uploadedBy', 'name email');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all materials for a subject (for students)
router.get('/subjects/:subject/materials', auth, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({
      subject: req.params.subject,
      isPublic: true,
      type: { $ne: 'folder' }
    }).populate('uploadedBy', 'name email');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new folder (admin/mentor only)
router.post('/folders', [auth, mentorAuth], async (req, res) => {
  try {
    const folder = new StudyMaterial({
      title: req.body.title,
      description: req.body.description,
      type: 'folder',
      subject: req.body.subject,
      uploadedBy: req.user.id,
      isPublic: true
    });

    const newFolder = await folder.save();
    res.status(201).json(newFolder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create new subject (admin/mentor only)
router.post('/subjects', [auth, mentorAuth], async (req, res) => {
  try {
    console.log('Creating subject with data:', req.body);
    
    // Validate that the folder exists
    if (req.body.folderId) {
      const folder = await StudyMaterial.findById(req.body.folderId);
      if (!folder || folder.type !== 'folder') {
        return res.status(400).json({ message: 'Invalid folder ID' });
      }
    }
    
    const subject = new StudyMaterial({
      title: req.body.name,
      description: req.body.description,
      type: 'subject',
      subject: req.body.name,
      folder: req.body.folderId,
      uploadedBy: req.user.id,
      isPublic: true
    });

    console.log('Subject object to save:', subject);

    const newSubject = await subject.save();
    console.log('Subject created successfully:', newSubject);
    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(400).json({ message: error.message });
  }
});

// Upload study material to folder (admin/mentor only)
router.post('/upload', [auth, mentorAuth, upload.single('file')], async (req, res) => {
  try {
    console.log('=== UPLOAD MATERIAL REQUEST ===');
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const material = new StudyMaterial({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type || 'document',
      subject: req.body.subject,
      folder: req.body.folderId || null,
      filePath: req.file.path,
      originalName: req.file.originalname,
      uploadedBy: req.user.id,
      isPublic: true
    });

    console.log('Material object to save:', material);

    const newMaterial = await material.save();
    console.log('Material saved successfully:', newMaterial);
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(400).json({ message: error.message });
  }
});

// Download study material (students only)
router.get('/download/:id', auth, async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    if (!material.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!material.filePath || !fs.existsSync(material.filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(material.filePath, material.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get materials for a specific subject in a specific folder
router.get('/folder/:folderId/subject/:subject/materials', auth, async (req, res) => {
  try {
    console.log('Fetching materials for folder:', req.params.folderId, 'subject:', req.params.subject);
    
    const materials = await StudyMaterial.find({
      folder: req.params.folderId,
      subject: req.params.subject,
      type: { $nin: ['folder', 'subject'] }, // Exclude folders and subjects
      isPublic: true
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found materials:', materials.length);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all study materials for admin/mentor management
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin or mentor
    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ message: 'Admin or Mentor access required' });
    }

    const materials = await StudyMaterial.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update study material (admin/mentor only)
router.put('/:id', [auth, mentorAuth], async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    material.title = req.body.title || material.title;
    material.description = req.body.description || material.description;
    material.subject = req.body.subject || material.subject;
    material.folder = req.body.folderId || material.folder;

    const updatedMaterial = await material.save();
    res.json(updatedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete study material (admin/mentor only)
router.delete('/:id', [auth, mentorAuth], async (req, res) => {
  try {
    console.log('=== DELETE MATERIAL REQUEST ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.originalUrl);
    console.log('Request params:', req.params);
    console.log('Request headers:', req.headers);
    console.log('Delete request for material ID:', req.params.id);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);
    
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      console.log('Material not found');
      return res.status(404).json({ message: 'Study material not found' });
    }

    console.log('Found material:', material);

    // Delete file if it exists
    if (material.filePath && fs.existsSync(material.filePath)) {
      console.log('Deleting file:', material.filePath);
      fs.unlinkSync(material.filePath);
    }

    await material.deleteOne();
    console.log('Material deleted successfully');
    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ message: error.message });
  }
});

// Legacy routes for backward compatibility
// Upload resource for specific student (mentor only)
router.post('/upload-student', [auth, mentorAuth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const material = new StudyMaterial({
      title: req.body.title,
      description: req.body.description,
      type: 'resource',
      filePath: req.file.path,
      originalName: req.file.originalname,
      student: req.body.studentId,
      subject: req.body.subject || 'General',
      uploadedBy: req.user.id,
      isPublic: false
    });

    const newMaterial = await material.save();
    res.status(201).json(newMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get study materials for a specific student (personal resources)
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ 
      student: req.params.studentId,
      isPublic: false
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all public study materials for students (organized by folders and subjects)
router.get('/public/all', auth, async (req, res) => {
  try {
    console.log('Fetching public materials for student');
    
    // Get all folders
    const folders = await StudyMaterial.find({ type: 'folder', isPublic: true })
      .sort({ createdAt: -1 });
    
    console.log('Found folders:', folders.length);
    
    // Get all subjects (don't populate folder to keep it as ObjectId)
    const subjects = await StudyMaterial.find({ type: 'subject', isPublic: true })
      .sort({ createdAt: -1 });
    
    console.log('Found subjects:', subjects.length);
    
    // Get all materials (excluding folders and subjects)
    const materials = await StudyMaterial.find({
      type: { $nin: ['folder', 'subject'] },
      isPublic: true
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found materials:', materials.length);
    
    res.json({
      folders,
      subjects,
      materials
    });
  } catch (error) {
    console.error('Error fetching public materials:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get materials for a specific subject in a specific folder (for students)
router.get('/public/folder/:folderId/subject/:subject/materials', auth, async (req, res) => {
  try {
    console.log('Student fetching materials for folder:', req.params.folderId, 'subject:', req.params.subject);
    
    const materials = await StudyMaterial.find({
      folder: req.params.folderId,
      subject: req.params.subject,
      type: { $nin: ['folder', 'subject'] },
      isPublic: true
    })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found materials for student:', materials.length);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials for student:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
