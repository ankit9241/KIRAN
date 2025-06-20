const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const AdminNotificationService = require('../services/adminNotificationService');
const nodemailer = require('nodemailer');

// Contact form endpoint (no auth required)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Configure transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'adityasinghofficial296@gmail.com',
        pass: process.env.EMAIL_PASS || 'YOUR_APP_PASSWORD_HERE'
      }
    });

    const mailOptions = {
      from: email,
      to: 'adityasinghofficial296@gmail.com',
      subject: `[Contact Form] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending contact form email:', error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

// Middleware to protect routes
router.use(auth);

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user's profile
router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all students (for mentor dashboard) - MUST come before /:id route
router.get('/students', async (req, res) => {
    try {
        console.log('Request user:', req.user); // Log the user making the request
        // Check if user is a mentor or admin
        if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Mentor or Admin role required.' });
        }

        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all mentors (for admin dashboard and student dashboard) - MUST come before /:id route
router.get('/mentors', async (req, res) => {
    try {
        // Check if user is an admin or student
        if (req.user.role !== 'admin' && req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Admin or Student role required.' });
        }

        const mentors = await User.find({ role: 'mentor' }).select('-password');
        res.json(mentors);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending mentor requests (admin only)
router.get('/mentors/pending', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const pendingMentors = await User.find({ 
            role: 'mentor', 
            mentorApprovalStatus: 'pending' 
        }).select('-password');

        res.json(pendingMentors);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all mentors with approval status (admin only)
router.get('/mentors/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const mentors = await User.find({ role: 'mentor' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(mentors);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve mentor request (admin only)
router.patch('/mentors/:mentorId/approve', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const mentor = await User.findById(req.params.mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        if (mentor.role !== 'mentor') {
            return res.status(400).json({ message: 'User is not a mentor' });
        }

        if (mentor.mentorApprovalStatus !== 'pending') {
            return res.status(400).json({ message: 'Mentor is not pending approval' });
        }

        // Update mentor approval status
        mentor.mentorApprovalStatus = 'approved';
        mentor.mentorApprovalDate = new Date();
        mentor.mentorApprovedBy = req.user.id;
        mentor.mentorRejectionReason = undefined; // Clear any previous rejection reason

        await mentor.save();

        // Notify admins about the approval
        await AdminNotificationService.notifyMentorApproval(mentor, req.user, 'approved');

        res.json({ 
            message: 'Mentor approved successfully',
            mentor: {
                id: mentor._id,
                name: mentor.name,
                email: mentor.email,
                mentorApprovalStatus: mentor.mentorApprovalStatus,
                mentorApprovalDate: mentor.mentorApprovalDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject mentor request (admin only)
router.patch('/mentors/:mentorId/reject', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { rejectionReason } = req.body;
        if (!rejectionReason || rejectionReason.trim() === '') {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const mentor = await User.findById(req.params.mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        if (mentor.role !== 'mentor') {
            return res.status(400).json({ message: 'User is not a mentor' });
        }

        if (mentor.mentorApprovalStatus !== 'pending') {
            return res.status(400).json({ message: 'Mentor is not pending approval' });
        }

        // Update mentor approval status
        mentor.mentorApprovalStatus = 'rejected';
        mentor.mentorApprovalDate = new Date();
        mentor.mentorApprovedBy = req.user.id;
        mentor.mentorRejectionReason = rejectionReason.trim();

        await mentor.save();

        // Notify admins about the rejection
        await AdminNotificationService.notifyMentorApproval(mentor, req.user, 'rejected');

        res.json({ 
            message: 'Mentor rejected successfully',
            mentor: {
                id: mentor._id,
                name: mentor.name,
                email: mentor.email,
                mentorApprovalStatus: mentor.mentorApprovalStatus,
                mentorApprovalDate: mentor.mentorApprovalDate,
                mentorRejectionReason: mentor.mentorRejectionReason
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get mentor approval status (for mentor to check their status)
router.get('/mentor/approval-status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ message: 'Mentor access required' });
        }

        const mentor = await User.findById(req.user.id).select('-password');
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.json({
            mentorApprovalStatus: mentor.mentorApprovalStatus,
            mentorApprovalDate: mentor.mentorApprovalDate,
            mentorRejectionReason: mentor.mentorRejectionReason,
            mentorApprovedBy: mentor.mentorApprovedBy
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.patch('/me', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'address', 'bio', 'achievements',
        'class', 'stream', 'targetExam', 'preferredSubjects', 'learningGoals',
        'specialization', 'experience', 'subjectsTaught', 'telegramId', 'whatsapp', 'linkedin', 'website',
        'teachingStyle', 'qualifications', 'profilePicture'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user by ID (for mentors to view student profiles) - MUST come after specific routes
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new user
router.post('/', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
