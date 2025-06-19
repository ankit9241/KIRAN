const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create announcement (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Announcement message is required' });
        }

        const announcement = new Announcement({
            message: message.trim(),
            adminId: req.user.id,
            adminName: req.user.name
        });

        await announcement.save();

        // Create notifications for all students and mentors
        const users = await User.find({ role: { $in: ['student', 'mentor'] } });
        
        const notifications = users.map(user => ({
            userId: user._id,
            type: 'announcement',
            title: 'New Announcement',
            message: message.trim(),
            senderId: req.user.id,
            senderName: req.user.name,
            relatedId: announcement._id,
            relatedModel: 'Announcement'
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({ 
            message: 'Announcement sent successfully',
            announcement,
            notificationsSent: notifications.length
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all active announcements (for students and mentors)
router.get('/', auth, async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(10); // Get latest 10 announcements
        
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all announcements (admin only)
router.get('/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });
        
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching all announcements:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle announcement status (admin only)
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        announcement.isActive = !announcement.isActive;
        await announcement.save();

        res.json({ 
            message: 'Announcement status updated successfully',
            announcement
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete announcement (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 