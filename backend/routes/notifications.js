const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user's notifications
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user.id);
        console.log('User role:', req.user.role);
        
        const notifications = await Notification.find({ 
            userId: req.user.id,
            isActive: true 
        })
        .sort({ createdAt: -1 })
        .limit(20);
        
        console.log('Found notifications:', notifications.length);
        
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        console.log('Fetching unread count for user:', req.user.id);
        
        const count = await Notification.countDocuments({ 
            userId: req.user.id,
            isRead: false,
            isActive: true 
        });
        
        console.log('Unread count:', count);
        
        res.json({ count });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { 
                _id: req.params.id,
                userId: req.user.id 
            },
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                userId: req.user.id,
                isRead: false 
            },
            { isRead: true }
        );
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create notification for all users (admin only)
router.post('/broadcast', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { title, message, type = 'announcement', targetRoles = ['student', 'mentor'] } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        // Get all users with target roles
        const users = await User.find({ role: { $in: targetRoles } });
        
        // Create notifications for each user
        const notifications = users.map(user => ({
            userId: user._id,
            type,
            title,
            message,
            senderId: req.user.id,
            senderName: req.user.name
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({ 
            message: `Notification sent to ${users.length} users`,
            count: users.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create notification for specific user
router.post('/user/:userId', auth, async (req, res) => {
    try {
        const { title, message, type = 'message' } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        const notification = new Notification({
            userId: req.params.userId,
            type,
            title,
            message,
            senderId: req.user.id,
            senderName: req.user.name
        });

        await notification.save();

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Test endpoint to create a sample notification
router.post('/test/create-sample', auth, async (req, res) => {
    try {
        const sampleNotification = new Notification({
            userId: req.user.id,
            type: 'announcement',
            title: 'Test Notification',
            message: 'This is a test notification to verify the system is working.',
            senderName: 'System',
            priority: 'medium',
            category: 'general'
        });

        await sampleNotification.save();
        
        res.status(201).json({ 
            message: 'Sample notification created successfully',
            notification: sampleNotification
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

module.exports = router; 