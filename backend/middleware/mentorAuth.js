const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

const mentorAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

        // Check if no token
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if user is a mentor
        if (user.role !== 'mentor') {
            return res.status(403).json({ message: 'Mentor access required' });
        }

        // Add user to request
        req.user = user;
        
        // Update lastSeen for the user
        User.findByIdAndUpdate(user._id, { lastSeen: new Date() }, { new: false })
            .catch(err => console.error('Error updating lastSeen:', err));
        
        next();
    } catch (err) {
        console.error('Mentor auth error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// New middleware to allow both mentors and admins
const allowMentorOrAdmin = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.role !== 'mentor' && user.role !== 'admin') {
            return res.status(403).json({ message: 'Mentor or admin access required' });
        }
        req.user = user;
        User.findByIdAndUpdate(user._id, { lastSeen: new Date() }, { new: false })
            .catch(err => console.error('Error updating lastSeen:', err));
        next();
    } catch (err) {
        console.error('Mentor or admin auth error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = mentorAuth;
module.exports.allowMentorOrAdmin = allowMentorOrAdmin;
