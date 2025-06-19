const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

module.exports = async function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Single-device login enforcement for mentor and student
        if ((user.role === 'mentor' || user.role === 'student')) {
            if (!user.currentToken || user.currentToken !== token) {
                return res.status(401).json({ message: 'You have been logged out because your account was used on another device.' });
            }
        }
        // For admin, allow multiple sessions
        
        // Add user to request
        req.user = user;
        
        // Update lastSeen for the user
        User.findByIdAndUpdate(user._id, { lastSeen: new Date() }, { new: false })
            .catch(() => {});
        
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
