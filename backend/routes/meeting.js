const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const mentorAuth = require('../middleware/mentorAuth');
const { allowMentorOrAdmin } = require('../middleware/mentorAuth');
const auth = require('../middleware/auth');
const AdminNotificationService = require('../services/adminNotificationService');
const Announcement = require('../models/Announcement');

// Create a new meeting (Mentor or Admin)
router.post('/', allowMentorOrAdmin, async (req, res) => {
    try {
        const { title, description, studentId, date, duration, meetingLink, meetingType } = req.body;

        // Validate required fields
        if (!title || !description || !date || !duration) {
            return res.status(400).json({ message: 'Title, description, date, and duration are required' });
        }

        let meetingData = {
            title,
            description,
            mentor: req.user.id,
            date: new Date(date),
            duration,
            meetingLink: meetingLink || '',
            status: 'scheduled',
            meetingType: meetingType || 'individual'
        };

        // Handle different meeting types
        if (meetingType === 'individual') {
            if (!studentId) {
                return res.status(400).json({ message: 'Student ID is required for individual meetings' });
            }
            
            // Check if student exists and is a student
            const student = await User.findById(studentId);
            if (!student || student.role !== 'student') {
                return res.status(400).json({ message: 'Invalid student ID' });
            }
            
            meetingData.student = studentId;
            meetingData.participants = [req.user.id, studentId];
            
        } else if (meetingType === 'all_students') {
            // Get all students
            const students = await User.find({ role: 'student' }).select('_id');
            meetingData.participants = [req.user.id, ...students.map(s => s._id)];
            
        } else if (meetingType === 'all_mentors') {
            // Get all mentors
            const mentors = await User.find({ role: 'mentor' }).select('_id');
            meetingData.participants = [req.user.id, ...mentors.map(m => m._id)];
            
        } else if (meetingType === 'all_users') {
            // Get all users (students and mentors)
            const allUsers = await User.find({ role: { $in: ['student', 'mentor'] } }).select('_id');
            meetingData.participants = [req.user.id, ...allUsers.map(u => u._id)];
        }

        // Create meeting
        const meeting = new Meeting(meetingData);
        const savedMeeting = await meeting.save();
        
        const populatedMeeting = await Meeting.findById(savedMeeting._id)
            .populate('student', 'name email')
            .populate('mentor', 'name email')
            .populate('participants', 'name email role');

        // Notify admins about new meeting request
        await AdminNotificationService.notifyMeetingRequest(populatedMeeting);

        // Ensure mentor is in participants
        if (meeting.mentor && !meeting.participants.map(id => id.toString()).includes(meeting.mentor.toString())) {
            meeting.participants.push(meeting.mentor);
            await meeting.save();
        }

        // Create announcements for all participants except the creator
        const creatorId = req.user.id;
        const meetingMsg = `You have a new meeting: ${meeting.title} on ${new Date(meeting.date).toLocaleString()}`;
        for (const participantId of meeting.participants) {
            if (participantId.toString() !== creatorId) {
                await Announcement.create({
                    message: meetingMsg,
                    type: 'meeting',
                    userId: participantId,
                    meetingId: meeting._id,
                    isActive: true
                });
                // Meeting scheduled notification
                const Notification = require('../models/Notification');
                await Notification.create({
                    userId: participantId,
                    type: 'meeting_scheduled',
                    title: 'Meeting Scheduled',
                    message: meetingMsg,
                    senderId: creatorId,
                    senderName: req.user.name,
                    relatedId: meeting._id,
                    relatedModel: 'Meeting',
                    category: 'activity',
                    priority: 'medium',
                });
            }
        }

        res.status(201).json(populatedMeeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all meetings for a mentor or admin
router.get('/mentor', allowMentorOrAdmin, async (req, res) => {
    try {
        const meetings = await Meeting.find({ 
            $or: [
                { mentor: req.user.id },
                { participants: req.user.id }
            ]
        })
            .populate('student', 'name email phone')
            .populate('mentor', 'name email')
            .populate('participants', 'name email role')
            .sort({ date: 1 });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all meetings for a student
router.get('/student', auth, async (req, res) => {
    try {
        const meetings = await Meeting.find({ 
            $or: [
                { student: req.user.id },
                { participants: req.user.id }
            ]
        })
            .populate('mentor', 'name email phone')
            .populate('student', 'name email')
            .populate('participants', 'name email role')
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
            meetings = await Meeting.find({ 
                $or: [
                    { mentor: req.user.id },
                    { participants: req.user.id }
                ]
            })
                .populate('student', 'name email phone')
                .populate('mentor', 'name email')
                .populate('participants', 'name email role')
                .sort({ date: 1 });
        } else if (req.user.role === 'student') {
            meetings = await Meeting.find({ 
                $or: [
                    { student: req.user.id },
                    { participants: req.user.id }
                ]
            })
                .populate('mentor', 'name email phone')
                .populate('student', 'name email')
                .populate('participants', 'name email role')
                .sort({ date: 1 });
        } else if (req.user.role === 'admin') {
            meetings = await Meeting.find()
                .populate('student', 'name email')
                .populate('mentor', 'name email')
                .populate('participants', 'name email role')
                .sort({ date: 1 });
        }
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update meeting (Mentor or Admin)
router.put('/:id', allowMentorOrAdmin, async (req, res) => {
    try {
        const { title, description, date, duration, meetingLink, status, meetingType, studentId } = req.body;
        const meetingId = req.params.id;

        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Allow only the mentor who created the meeting or an admin
        if (req.user.role !== 'admin' && meeting.mentor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update meeting
        meeting.title = title || meeting.title;
        meeting.description = description || meeting.description;
        meeting.date = date ? new Date(date) : meeting.date;
        meeting.duration = duration || meeting.duration;
        meeting.meetingLink = meetingLink !== undefined ? meetingLink : meeting.meetingLink;
        meeting.status = status || meeting.status;
        meeting.meetingType = meetingType || meeting.meetingType;

        // Handle participants update for group meetings
        if (meetingType && meetingType !== 'individual') {
            if (meetingType === 'all_students') {
                const students = await User.find({ role: 'student' }).select('_id');
                meeting.participants = [req.user.id, ...students.map(s => s._id)];
                meeting.student = undefined;
            } else if (meetingType === 'all_mentors') {
                const mentors = await User.find({ role: 'mentor' }).select('_id');
                meeting.participants = [req.user.id, ...mentors.map(m => m._id)];
                meeting.student = undefined;
            } else if (meetingType === 'all_users') {
                const allUsers = await User.find({ role: { $in: ['student', 'mentor'] } }).select('_id');
                meeting.participants = [req.user.id, ...allUsers.map(u => u._id)];
                meeting.student = undefined;
            }
        } else if (meetingType === 'individual' && studentId) {
            meeting.student = studentId;
            meeting.participants = [req.user.id, studentId];
        }

        await meeting.save();

        // Populate details
        await meeting.populate('student', 'name email phone');
        await meeting.populate('mentor', 'name email');
        await meeting.populate('participants', 'name email role');

        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete meeting (Mentor or Admin)
router.delete('/:id', allowMentorOrAdmin, async (req, res) => {
    try {
        const meetingId = req.params.id;

        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Allow only the mentor who created the meeting or an admin
        if (req.user.role !== 'admin' && meeting.mentor.toString() !== req.user.id) {
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