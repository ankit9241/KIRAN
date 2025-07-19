const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const AdminNotificationService = require('../services/adminNotificationService');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/doubts/');
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
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image, PDF, DOC, DOCX, and TXT files are allowed!'));
        }
    }
});

// Create a new doubt (student creates doubt without selecting mentor)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const { title, description, subject } = req.body;

        if (!title || !description || !subject) {
            return res.status(400).json({ message: 'Title, description, and subject are required' });
        }

        console.log('Creating doubt:', { title, description, subject, student: req.user.id });

        const doubt = new Doubt({
            title,
            description,
            subject,
            student: req.user.id,
            status: 'pending' // No mentor assigned initially
        });

        const savedDoubt = await doubt.save();
        console.log('Doubt created successfully:', savedDoubt._id);
        
        const populatedDoubt = await Doubt.findById(savedDoubt._id).populate('student', 'name email');

        // Notify admins about new doubt submission
        await AdminNotificationService.notifyNewDoubtSubmission(populatedDoubt);

        res.status(201).json(populatedDoubt);
    } catch (error) {
        console.error('Error creating doubt:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all pending doubts (for mentors to see available doubts)
router.get('/pending', auth, async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ message: 'Mentor access required' });
        }
        
        console.log('Fetching pending doubts for mentor:', req.user.id);
        
        // Find all pending doubts (not assigned to any mentor)
        const doubts = await Doubt.find({ 
            status: 'pending',
            mentor: { $exists: false }
        }).populate('student', 'name email');
        
        console.log('Found pending doubts:', doubts.length);
        console.log('Pending doubts:', doubts);
        
        res.json(doubts);
    } catch (error) {
        console.error('Error fetching pending doubts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all doubts assigned to the logged-in mentor
router.get('/mentor', auth, async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ message: 'Mentor access required' });
        }
        // Find doubts where mentor matches the logged-in user's id
        const doubts = await Doubt.find({ mentor: req.user.id }).populate('student', 'name email');
        res.json(doubts);
    } catch (error) {
        console.error('Error fetching mentor doubts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all doubts for the logged-in student
router.get('/student', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Student access required' });
        }
        
        // Find all doubts created by this student
        const doubts = await Doubt.find({ student: req.user.id })
            .populate('mentor', 'name email')
            .sort({ createdAt: -1 }); // Most recent first
        
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all doubts for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Mentor or admin access required' });
        }
        const { studentId } = req.params;
        let query = { student: studentId };
        // If not admin, restrict to doubts assigned to this mentor
        if (req.user.role === 'mentor') {
            query.mentor = req.user.id;
        }
        const doubts = await Doubt.find(query)
            .populate('student', 'name email')
            .populate('mentor', 'name email');
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign a doubt to a mentor (mentor picks up a doubt)
router.patch('/:doubtId/assign', auth, async (req, res) => {
    try {
        console.log('Assign doubt request received');
        console.log('Doubt ID:', req.params.doubtId);
        console.log('Mentor ID:', req.user.id);
        console.log('Mentor role:', req.user.role);
        
        if (req.user.role !== 'mentor') {
            console.log('Access denied: User is not a mentor');
            return res.status(403).json({ message: 'Mentor access required' });
        }

        const doubt = await Doubt.findById(req.params.doubtId);
        console.log('Found doubt:', doubt);
        
        if (!doubt) {
            console.log('Doubt not found');
            return res.status(404).json({ message: 'Doubt not found' });
        }

        if (doubt.status !== 'pending') {
            console.log('Doubt is not pending, status:', doubt.status);
            return res.status(400).json({ message: 'Doubt is not available for assignment' });
        }

        doubt.mentor = req.user.id;
        doubt.status = 'assigned';
        await doubt.save();
        console.log('Doubt assigned successfully');

        const populatedDoubt = await Doubt.findById(doubt._id).populate('student', 'name email');
        console.log('Populated doubt:', populatedDoubt);

        // Notify mentor about new doubt assignment
        const Notification = require('../models/Notification');
        await Notification.create({
            userId: req.user.id,
            type: 'doubt_assigned',
            title: 'New Doubt Assigned',
            message: `You have been assigned a new doubt: "${doubt.title}"`,
            senderId: populatedDoubt.student._id,
            senderName: populatedDoubt.student.name,
            relatedId: doubt._id,
            relatedModel: 'Doubt',
            category: 'activity',
            priority: 'medium',
        });
        
        res.json(populatedDoubt);
    } catch (error) {
        console.error('Error assigning doubt:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Respond to a doubt (mentor provides answer and optional documents)
router.patch('/:doubtId/respond', auth, upload.array('documents', 5), async (req, res) => {
    try {
        console.log('Respond to doubt request received');
        console.log('Doubt ID:', req.params.doubtId);
        console.log('Mentor ID:', req.user.id);
        
        if (req.user.role !== 'mentor') {
            console.log('Access denied: User is not a mentor');
            return res.status(403).json({ message: 'Mentor access required' });
        }

        const { response } = req.body;

        if (!response || response.trim() === '') {
            return res.status(400).json({ message: 'Response is required' });
        }

        const doubt = await Doubt.findById(req.params.doubtId);
        console.log('Found doubt:', doubt);
        
        if (!doubt) {
            console.log('Doubt not found');
            return res.status(404).json({ message: 'Doubt not found' });
        }

        if (doubt.mentor.toString() !== req.user.id) {
            console.log('Doubt not assigned to this mentor');
            return res.status(403).json({ message: 'You can only respond to doubts assigned to you' });
        }

        if (doubt.status !== 'assigned') {
            console.log('Doubt is not in assigned status, current status:', doubt.status);
            return res.status(400).json({ message: 'Doubt must be assigned to respond' });
        }

        // Update doubt with response
        doubt.mentorResponse = response;
        doubt.responseDate = new Date();
        doubt.status = 'responded';
        
        // Add uploaded documents if any
        if (req.files && req.files.length > 0) {
            doubt.uploadedDocuments = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                filePath: `/uploads/doubts/${file.filename}`,
                uploadDate: new Date()
            }));
        }

        await doubt.save();
        console.log('Doubt responded to successfully');

        const populatedDoubt = await Doubt.findById(doubt._id)
            .populate('student', 'name email')
            .populate('mentor', 'name email');
        
        console.log('Populated doubt:', populatedDoubt);

        // Notify student about doubt response
        const Notification = require('../models/Notification');
        await Notification.create({
            userId: populatedDoubt.student._id,
            type: 'doubt_response',
            title: 'Doubt Response',
            message: `Your doubt "${doubt.title}" has been answered by ${populatedDoubt.mentor.name}.`,
            senderId: populatedDoubt.mentor._id,
            senderName: populatedDoubt.mentor.name,
            relatedId: doubt._id,
            relatedModel: 'Doubt',
            category: 'activity',
            priority: 'medium',
        });
        
        res.json(populatedDoubt);
    } catch (error) {
        console.error('Error responding to doubt:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Resolve a doubt
router.patch('/:doubtId/resolve', auth, async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ message: 'Mentor access required' });
        }

        const doubt = await Doubt.findById(req.params.doubtId);
        
        if (!doubt) {
            return res.status(404).json({ message: 'Doubt not found' });
        }

        if (doubt.mentor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only resolve doubts assigned to you' });
        }

        if (doubt.status !== 'responded') {
            return res.status(400).json({ message: 'Doubt must be responded to before it can be resolved' });
        }

        doubt.status = 'resolved';
        await doubt.save();

        const populatedDoubt = await Doubt.findById(doubt._id).populate('student', 'name email');
        res.json(populatedDoubt);
    } catch (error) {
        console.error('Error resolving doubt:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a doubt (student can edit their own pending doubts)
router.patch('/:doubtId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const { title, description, subject } = req.body;

        if (!title || !description || !subject) {
            return res.status(400).json({ message: 'Title, description, and subject are required' });
        }

        const doubt = await Doubt.findById(req.params.doubtId);
        
        if (!doubt) {
            return res.status(404).json({ message: 'Doubt not found' });
        }

        if (doubt.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own doubts' });
        }

        if (doubt.status !== 'pending') {
            return res.status(400).json({ message: 'You can only edit pending doubts' });
        }

        doubt.title = title;
        doubt.description = description;
        doubt.subject = subject;
        await doubt.save();

        const populatedDoubt = await Doubt.findById(doubt._id).populate('student', 'name email');
        res.json(populatedDoubt);
    } catch (error) {
        console.error('Error updating doubt:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a doubt (student can delete their own pending doubts)
router.delete('/:doubtId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Student access required' });
        }

        const doubt = await Doubt.findById(req.params.doubtId);
        
        if (!doubt) {
            return res.status(404).json({ message: 'Doubt not found' });
        }

        if (doubt.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own doubts' });
        }

        if (doubt.status !== 'pending') {
            return res.status(400).json({ message: 'You can only delete pending doubts' });
        }

        await Doubt.findByIdAndDelete(req.params.doubtId);
        res.json({ message: 'Doubt deleted successfully' });
    } catch (error) {
        console.error('Error deleting doubt:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all doubts for admin
router.get('/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const doubts = await Doubt.find({})
            .populate('student', 'name email')
            .populate('mentor', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(doubts);
    } catch (error) {
        console.error('Error fetching all doubts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all doubts for admin (alternative route)
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const doubts = await Doubt.find({})
            .populate('student', 'name email')
            .populate('mentor', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(doubts);
    } catch (error) {
        console.error('Error fetching all doubts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update doubt status (admin only)
router.put('/:doubtId/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        const doubt = await Doubt.findById(req.params.doubtId);
        if (!doubt) {
            return res.status(404).json({ message: 'Doubt not found' });
        }
        
        doubt.status = status.toLowerCase();
        await doubt.save();
        
        const populatedDoubt = await Doubt.findById(doubt._id)
            .populate('student', 'name email')
            .populate('mentor', 'name email');
        
        res.json(populatedDoubt);
    } catch (error) {
        console.error('Error updating doubt status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 