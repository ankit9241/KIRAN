const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const mentorAuth = require('../middleware/mentorAuth');
const { allowMentorOrAdmin } = require('../middleware/mentorAuth');
const auth = require('../middleware/auth');
const AdminNotificationService = require('../services/adminNotificationService');

// Create a new meeting (Mentor only)
router.post('/', mentorAuth, async (req, res) => {
    try {
        const { title, description, studentId, date, duration, meetingLink } = req.body;

        // Validate required fields
        if (!title || !description || !studentId || !date || !duration) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if student exists and is a student
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        // Create meeting
        const meeting = new Meeting({
            title,
            description,
            mentor: req.user.id,
            student: studentId,
            date: new Date(date),
            duration,
            meetingLink: meetingLink || '',
            status: 'pending'
        });

        const savedMeeting = await meeting.save();
        const populatedMeeting = await Meeting.findById(savedMeeting._id)
            .populate('student', 'name email')
            .populate('mentor', 'name email');

        // Notify admins about new meeting request
        await AdminNotificationService.notifyMeetingRequest(populatedMeeting);

        res.status(201).json(populatedMeeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all meetings for a mentor or admin
router.get('/mentor', allowMentorOrAdmin, async (req, res) => {
    try {
        const meetings = await Meeting.find({ mentor: req.user.id })
            .populate('student', 'name email phone')
            .populate('mentor', 'name email')
            .sort({ date: 1 });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all meetings for a student
router.get('/student', auth, async (req, res) => {
    try {
        const meetings = await Meeting.find({ student: req.user.id })
            .populate('mentor', 'name email phone')
            .populate('student', 'name email')
            .sort({ date: 1 });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all students for mentor or admin to select from
router.get('/students', allowMentorOrAdmin, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name email phone')
            .sort({ name: 1 });

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all meetings for admin
router.get('/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const meetings = await Meeting.find()
            .populate('student', 'name email')
            .populate('mentor', 'name email')
            .sort({ date: 1 });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get meetings for the current user (student, mentor, or admin)
router.get('/', auth, async (req, res) => {
    try {
        let meetings = [];
        if (req.user.role === 'mentor') {
            meetings = await Meeting.find({ mentor: req.user.id })
                .populate('student', 'name email phone')
                .populate('mentor', 'name email')
                .sort({ date: 1 });
        } else if (req.user.role === 'student') {
            meetings = await Meeting.find({ student: req.user.id })
                .populate('mentor', 'name email phone')
                .populate('student', 'name email')
                .sort({ date: 1 });
        } else if (req.user.role === 'admin') {
            meetings = await Meeting.find()
                .populate('student', 'name email')
                .populate('mentor', 'name email')
                .sort({ date: 1 });
        }
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update meeting (Mentor only)
router.put('/:id', mentorAuth, async (req, res) => {
    try {
        const { title, description, date, duration, meetingLink, status } = req.body;
        const meetingId = req.params.id;

        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Check if mentor owns this meeting
        if (meeting.mentor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update meeting
        meeting.title = title || meeting.title;
        meeting.description = description || meeting.description;
        meeting.date = date ? new Date(date) : meeting.date;
        meeting.duration = duration || meeting.duration;
        meeting.meetingLink = meetingLink !== undefined ? meetingLink : meeting.meetingLink;
        meeting.status = status || meeting.status;

        await meeting.save();

        // Populate details
        await meeting.populate('student', 'name email phone');
        await meeting.populate('mentor', 'name email');

        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete meeting (Mentor only)
router.delete('/:id', mentorAuth, async (req, res) => {
    try {
        const meetingId = req.params.id;

        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Check if mentor owns this meeting
        if (meeting.mentor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Meeting.findByIdAndDelete(meetingId);
        res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single meeting details
router.get('/:id', auth, async (req, res) => {
    try {
        const meetingId = req.params.id;

        const meeting = await Meeting.findById(meetingId)
            .populate('student', 'name email phone')
            .populate('mentor', 'name email phone');

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Check if user is authorized to view this meeting
        if (meeting.mentor._id.toString() !== req.user.id && 
            meeting.student._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin routes for meeting management
// Get all meetings (admin only)
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const meetings = await Meeting.find()
            .populate('student', 'name email')
            .populate('mentor', 'name email')
            .sort({ date: 1 });

        // Transform data for admin dashboard
        const transformedMeetings = meetings.map(meeting => ({
            _id: meeting._id,
            title: meeting.title,
            studentName: meeting.student ? meeting.student.name : 'Unknown',
            mentorName: meeting.mentor ? meeting.mentor.name : 'Unknown',
            date: meeting.date,
            time: meeting.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: meeting.status || 'scheduled'
        }));

        res.json(transformedMeetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 